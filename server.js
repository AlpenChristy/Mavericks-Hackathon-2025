import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database configuration
const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'rewear_app',
});

// JWT secret
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1MjA4NDg4OH0.hhp8H4HrW13Nknh0l88XR-zTfnTc79GumxRlR3ojoLE';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Check if user is admin
  pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId])
    .then(result => {
      if (result.rows.length === 0 || result.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    })
    .catch(err => {
      console.error('Admin check error:', err);
      res.status(500).json({ error: 'Server error' });
    });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Sign up
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, points, role, joined_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, email, name, avatar_url, points, role, bio, location, joined_date, updated_at`,
      [email, hashedPassword, name, 100, 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Sign in
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, points, role, bio, location, joined_date, updated_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, location, avatar_url } = req.body;
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCount}`);
      values.push(bio);
      paramCount++;
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }
    if (avatar_url !== undefined) {
      updateFields.push(`avatar_url = $${paramCount}`);
      values.push(avatar_url);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);
    values.push(req.user.userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, name, avatar_url, points, role, bio, location, joined_date, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get items with filters
app.get('/api/items', async (req, res) => {
  try {
    const { category, search, status, userId, approvalStatus } = req.query;
    
    let query = `
      SELECT i.*, u.name as uploader_name, u.avatar_url as uploader_avatar
      FROM items i
      LEFT JOIN users u ON i.uploader_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (category && category !== 'All') {
      query += ` AND i.category_name = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    if (search) {
      query += ` AND (i.title ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (userId) {
      query += ` AND i.uploader_id = $${paramCount}`;
      values.push(userId);
      paramCount++;
    }

    if (approvalStatus !== undefined && approvalStatus !== '') {
      query += ` AND i.approval_status = $${paramCount}`;
      values.push(approvalStatus);
      paramCount++;
    } else if (!userId) {
      // Only default to approved items for public viewing (not for user's own items)
      query += ` AND i.approval_status = 'approved'`;
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await pool.query(query, values);
    res.json({ items: result.rows });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT i.*, u.name as uploader_name, u.avatar_url as uploader_avatar
      FROM items i
      LEFT JOIN users u ON i.uploader_id = u.id
      WHERE i.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

// Create item
app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      category_name,
      type,
      size,
      condition,
      tags,
      images,
      points_value
    } = req.body;

    const result = await pool.query(
      `INSERT INTO items (title, description, category_name, type, size, condition, tags, images, uploader_id, points_value, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
       RETURNING *`,
      [title, description, category_name, type, size, condition, tags || [], images || [], req.user.userId, points_value || 0]
    );

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Approve item (admin only)
app.put('/api/items/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE items SET approval_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['approved', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Approve item error:', error);
    res.status(500).json({ error: 'Failed to approve item' });
  }
});

// Reject item (admin only)
app.put('/api/items/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE items SET approval_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['rejected', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Reject item error:', error);
    res.status(500).json({ error: 'Failed to reject item' });
  }
});

// Delete item (admin only)
app.delete('/api/items/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Redeem item
app.post('/api/items/:id/redeem', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get item and user info
      const itemResult = await client.query('SELECT * FROM items WHERE id = $1 AND status = $2', [id, 'available']);
      const userResult = await client.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);

      if (itemResult.rows.length === 0) {
        throw new Error('Item not available');
      }

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const item = itemResult.rows[0];
      const user = userResult.rows[0];

      // Prevent users from buying their own items
      if (item.uploader_id === req.user.userId) {
        throw new Error('You cannot buy your own item');
      }

      if (user.points < item.points_value) {
        throw new Error('Insufficient points');
      }

      // Update item status
      await client.query('UPDATE items SET status = $1, updated_at = NOW() WHERE id = $2', ['redeemed', id]);

      // Deduct points from buyer
      await client.query('UPDATE users SET points = points - $1, updated_at = NOW() WHERE id = $2', [item.points_value, req.user.userId]);

      // Add points to seller
      await client.query('UPDATE users SET points = points + $1, updated_at = NOW() WHERE id = $2', [item.points_value, item.uploader_id]);

      // Record transaction for buyer (spent)
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id) VALUES ($1, $2, $3, $4, $5)',
        [req.user.userId, -item.points_value, 'spent', `Redeemed item: ${item.title}`, id]
      );

      // Record transaction for seller (earned)
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id) VALUES ($1, $2, $3, $4, $5)',
        [item.uploader_id, item.points_value, 'earned', `Sold item: ${item.title}`, id]
      );

      await client.query('COMMIT');
      res.json({ message: 'Item redeemed successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Redeem item error:', error);
    res.status(400).json({ error: error.message || 'Failed to redeem item' });
  }
});

// Get swap requests
app.get('/api/swap-requests', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, 
             u.name as requester_name, 
             u.avatar_url as requester_avatar,
             i.title as item_title,
             i.images as item_images,
             i.uploader_id as item_uploader_id
      FROM swap_requests sr
      LEFT JOIN users u ON sr.requester_id = u.id
      LEFT JOIN items i ON sr.item_id = i.id
      WHERE sr.requester_id = $1 OR i.uploader_id = $1
      ORDER BY sr.created_at DESC
    `, [req.user.userId]);

    res.json({ swapRequests: result.rows });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to get swap requests' });
  }
});

// Create swap request
app.post('/api/swap-requests', authenticateToken, async (req, res) => {
  try {
    const { item_id, message } = req.body;

    const result = await pool.query(
      `INSERT INTO swap_requests (requester_id, item_id, message, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [req.user.userId, item_id, message || null]
    );

    res.json({ swapRequest: result.rows[0] });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
});

// Get favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1',
      [req.user.userId]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to get favorites' });
  }
});

// Toggle favorite
app.post('/api/favorites/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Check if already favorited
    const existing = await pool.query(
      'SELECT * FROM favorites WHERE user_id = $1 AND item_id = $2',
      [req.user.userId, itemId]
    );

    if (existing.rows.length > 0) {
      // Remove from favorites
      await pool.query(
        'DELETE FROM favorites WHERE user_id = $1 AND item_id = $2',
        [req.user.userId, itemId]
      );
      res.json({ message: 'Removed from favorites' });
    } else {
      // Add to favorites
      await pool.query(
        'INSERT INTO favorites (user_id, item_id, created_at) VALUES ($1, $2, NOW())',
        [req.user.userId, itemId]
      );
      res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Delete favorite
app.delete('/api/favorites/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND item_id = $2',
      [req.user.userId, itemId]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Delete favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 