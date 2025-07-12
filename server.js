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
    console.log('[requireAdmin] No req.user found');
    return res.status(401).json({ error: 'Authentication required' });
  }
  console.log('[requireAdmin] Checking admin for userId:', req.user.userId);
  pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId])
    .then(result => {
      if (result.rows.length === 0) {
        console.log('[requireAdmin] User not found in DB');
        return res.status(403).json({ error: 'Admin access required' });
      }
      console.log('[requireAdmin] User role:', result.rows[0].role);
      if (result.rows[0].role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }
      next();
    })
    .catch(err => {
      console.error('[requireAdmin] Admin check error:', err);
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
             i.points_value as item_points_value,
             i.uploader_id as item_uploader_id
      FROM swap_requests sr
      LEFT JOIN users u ON sr.requester_id = u.id
      LEFT JOIN items i ON sr.item_id = i.id
      WHERE sr.requester_id = $1 OR i.uploader_id = $1
      ORDER BY sr.created_at DESC
    `, [req.user.userId]);

    // Fetch details for all offered items
    const swapRequestsWithDetails = await Promise.all(result.rows.map(async (swap) => {
      let item_points_value = swap.item_points_value;
      let item_images = swap.item_images;
      if (item_points_value == null || item_images == null) {
        // Fallback: fetch item directly
        const itemRes = await pool.query('SELECT points_value, images FROM items WHERE id = $1', [swap.item_id]);
        if (itemRes.rows.length > 0) {
          item_points_value = itemRes.rows[0].points_value;
          item_images = itemRes.rows[0].images;
        }
      }
      const offeredItems = await pool.query(
        `SELECT i.id, i.title, i.images, i.points_value
         FROM items i
         WHERE i.id = ANY($1)`,
        [swap.offered_item_ids]
      );
      return {
        ...swap,
        item_images,
        item_points_value,
        offered_items: offeredItems.rows
      };
    }));

    res.json({ swapRequests: swapRequestsWithDetails });
  } catch (error) {
    console.error('Get swap requests error:', error);
    res.status(500).json({ error: 'Failed to get swap requests' });
  }
});

// Create swap request (multi-item)
app.post('/api/swap-requests', authenticateToken, async (req, res) => {
  try {
    const { item_id, offered_item_ids, message } = req.body;
    if (!item_id || !offered_item_ids || !Array.isArray(offered_item_ids) || offered_item_ids.length === 0) {
      return res.status(400).json({ error: 'item_id and at least one offered_item_id are required' });
    }
    const result = await pool.query(
      `INSERT INTO swap_requests (requester_id, item_id, offered_item_ids, message, status, created_at, updated_at, last_action_by)
       VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW(), $1)
       RETURNING *`,
      [req.user.userId, item_id, offered_item_ids, message || null]
    );
    res.json({ swapRequest: result.rows[0] });
  } catch (error) {
    console.error('Create swap request error:', error);
    res.status(500).json({ error: 'Failed to create swap request' });
  }
});

// Accept swap request
app.put('/api/swap-requests/:id/accept', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    // Get swap request
    const swapRes = await client.query('SELECT * FROM swap_requests WHERE id = $1', [id]);
    if (swapRes.rows.length === 0) return res.status(404).json({ error: 'Swap request not found' });
    const swap = swapRes.rows[0];
    
    // Only item owner can accept
    const itemRes = await client.query('SELECT * FROM items WHERE id = $1', [swap.item_id]);
    if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    const requestedItem = itemRes.rows[0];
    if (requestedItem.uploader_id !== req.user.userId) return res.status(403).json({ error: 'Only the item owner can accept' });
    
    // Get all offered items
    const offeredItemsRes = await client.query(
      'SELECT * FROM items WHERE id = ANY($1)',
      [swap.offered_item_ids]
    );
    const offeredItems = offeredItemsRes.rows;
    
    // Calculate total points for each side
    const requestedItemPoints = requestedItem.points_value;
    const offeredItemsTotalPoints = offeredItems.reduce((sum, item) => sum + item.points_value, 0);
    
    // Calculate points difference
    const pointsDifference = requestedItemPoints - offeredItemsTotalPoints;
    
    // Get user details
    const requesterRes = await client.query('SELECT * FROM users WHERE id = $1', [swap.requester_id]);
    const requester = requesterRes.rows[0];
    const ownerRes = await client.query('SELECT * FROM users WHERE id = $1', [requestedItem.uploader_id]);
    const owner = ownerRes.rows[0];
    
    // Handle points transfer based on difference
    if (pointsDifference > 0) {
      // Requested item is worth more - requester pays the difference
      if (requester.points < pointsDifference) {
        return res.status(400).json({ error: 'Requester does not have enough points to complete the swap' });
      }
      
      // Transfer points from requester to owner
      await client.query(
        'UPDATE users SET points = points - $1 WHERE id = $2',
        [pointsDifference, swap.requester_id]
      );
      await client.query(
        'UPDATE users SET points = points + $1 WHERE id = $2',
        [pointsDifference, requestedItem.uploader_id]
      );
      
      // Record transactions
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [swap.requester_id, -pointsDifference, 'spent', `Points paid for swap difference - ${requestedItem.title}`, requestedItem.id]
      );
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [requestedItem.uploader_id, pointsDifference, 'earned', `Points received for swap difference - ${requestedItem.title}`, requestedItem.id]
      );
    } else if (pointsDifference < 0) {
      // Offered items are worth more - owner pays the difference
      const differenceToPay = Math.abs(pointsDifference);
      if (owner.points < differenceToPay) {
        return res.status(400).json({ error: 'Item owner does not have enough points to complete the swap' });
      }
      
      // Transfer points from owner to requester
      await client.query(
        'UPDATE users SET points = points - $1 WHERE id = $2',
        [differenceToPay, requestedItem.uploader_id]
      );
      await client.query(
        'UPDATE users SET points = points + $1 WHERE id = $2',
        [differenceToPay, swap.requester_id]
      );
      
      // Record transactions
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [requestedItem.uploader_id, -differenceToPay, 'spent', `Points paid for swap difference - ${requestedItem.title}`, requestedItem.id]
      );
      await client.query(
        'INSERT INTO point_transactions (user_id, amount, type, description, item_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [swap.requester_id, differenceToPay, 'earned', `Points received for swap difference - ${requestedItem.title}`, requestedItem.id]
      );
    }
    // If pointsDifference is 0, no points transfer needed
    
    // Mark all involved items as swapped
    const allItemIds = [swap.item_id, ...swap.offered_item_ids];
    await client.query(`UPDATE items SET status = 'swapped', updated_at = NOW() WHERE id = ANY($1)`, [allItemIds]);
    
    // Update swap request status
    await client.query(`UPDATE swap_requests SET status = 'completed', updated_at = NOW(), last_action_by = $1 WHERE id = $2`, [req.user.userId, id]);
    
    await client.query('COMMIT');
    
    const message = pointsDifference === 0 
      ? 'Swap completed and items marked as swapped'
      : pointsDifference > 0
      ? `Swap completed! ${pointsDifference} points transferred from requester to owner.`
      : `Swap completed! ${Math.abs(pointsDifference)} points transferred from owner to requester.`;
    
    res.json({ message });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Accept swap request error:', error);
    res.status(500).json({ error: 'Failed to accept swap request' });
  } finally {
    client.release();
  }
});

// Decline swap request
app.put('/api/swap-requests/:id/decline', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Get swap request
    const swapRes = await pool.query('SELECT * FROM swap_requests WHERE id = $1', [id]);
    if (swapRes.rows.length === 0) return res.status(404).json({ error: 'Swap request not found' });
    const swap = swapRes.rows[0];
    // Only item owner can decline
    const itemRes = await pool.query('SELECT * FROM items WHERE id = $1', [swap.item_id]);
    if (itemRes.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    const item = itemRes.rows[0];
    if (item.uploader_id !== req.user.userId) return res.status(403).json({ error: 'Only the item owner can decline' });
    // Update swap request status
    await pool.query(`UPDATE swap_requests SET status = 'declined', updated_at = NOW(), last_action_by = $1 WHERE id = $2`, [req.user.userId, id]);
    res.json({ message: 'Swap request declined' });
  } catch (error) {
    console.error('Decline swap request error:', error);
    res.status(500).json({ error: 'Failed to decline swap request' });
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

// Admin: Get all users
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('[GET /api/users] req.user:', req.user);
    const result = await pool.query('SELECT id, email, name, avatar_url, points, role, bio, location, joined_date, updated_at FROM users ORDER BY joined_date DESC');
    res.json({ users: result.rows });
  } catch (error) {
    console.error('[GET /api/users] Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get user by ID (public)
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, points, role, bio, location, joined_date, updated_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Admin: Delete user by ID
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'User ID required' });
    if (req.user.userId === id) return res.status(400).json({ error: 'You cannot delete your own account' });
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted', userId: id });
  } catch (error) {
    console.error('[DELETE /api/users/:id] Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin: Get order details with buyer/seller info
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get sold orders (redeemed items) with buyer and seller info
    const soldOrdersResult = await pool.query(`
      SELECT 
        i.id as item_id,
        i.title as item_title,
        i.points_value,
        i.updated_at as sold_date,
        i.images,
        seller.name as seller_name,
        seller.email as seller_email,
        buyer.name as buyer_name,
        buyer.email as buyer_email
      FROM items i
      LEFT JOIN users seller ON i.uploader_id = seller.id
      LEFT JOIN point_transactions pt ON i.id = pt.item_id AND pt.type = 'spent' AND pt.amount < 0
      LEFT JOIN users buyer ON pt.user_id = buyer.id
      WHERE i.status = 'redeemed'
      ORDER BY i.updated_at DESC
    `);

    // Get swapped orders with swap details
    const swappedOrdersResult = await pool.query(`
      SELECT 
        i.id as item_id,
        i.title as item_title,
        i.points_value,
        i.updated_at as swapped_date,
        i.images,
        sr.id as swap_request_id,
        sr.status as swap_status,
        requester.name as requester_name,
        requester.email as requester_email,
        owner.name as owner_name,
        owner.email as owner_email
      FROM items i
      LEFT JOIN swap_requests sr ON i.id = sr.item_id OR i.id = ANY(sr.offered_item_ids)
      LEFT JOIN users requester ON sr.requester_id = requester.id
      LEFT JOIN users owner ON i.uploader_id = owner.id
      WHERE i.status = 'swapped' AND sr.status = 'completed'
      ORDER BY i.updated_at DESC
    `);

    res.json({
      soldOrders: soldOrdersResult.rows,
      swappedOrders: swappedOrdersResult.rows
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to get order details' });
  }
});

// Create a report
app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const { reported_item_id, reported_user_id, reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }
    
    if (!reported_item_id && !reported_user_id) {
      return res.status(400).json({ error: 'Either reported_item_id or reported_user_id is required' });
    }
    
    const result = await pool.query(
      `INSERT INTO reports (reporter_id, reported_item_id, reported_user_id, reason, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
       RETURNING *`,
      [req.user.userId, reported_item_id || null, reported_user_id || null, reason, description || null]
    );
    
    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Admin: Get all reports
app.get('/api/admin/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.*,
        reporter.name as reporter_name,
        reporter.email as reporter_email,
        i.title as item_title,
        i.images as item_images,
        reported_user.name as reported_user_name,
        reported_user.email as reported_user_email
      FROM reports r
      LEFT JOIN users reporter ON r.reporter_id = reporter.id
      LEFT JOIN items i ON r.reported_item_id = i.id
      LEFT JOIN users reported_user ON r.reported_user_id = reported_user.id
      ORDER BY r.created_at DESC
    `);
    
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Admin: Update report status
app.put('/api/admin/reports/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
});

// Admin: Delete report by ID
app.delete('/api/admin/reports/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ message: 'Report deleted', reportId: id });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 