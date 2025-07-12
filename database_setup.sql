-- Create the rewear_app database (run this in pgAdmin or psql)
-- CREATE DATABASE rewear_app;

-- Connect to rewear_app and run the following:

-- Create users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    points INTEGER DEFAULT 100,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    bio TEXT,
    location VARCHAR(255),
    joined_date TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID,
    category_name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    condition VARCHAR(20) CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')),
    tags TEXT[],
    images TEXT[],
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points_value INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'pending', 'swapped', 'redeemed')),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create swap_requests table
CREATE TABLE IF NOT EXISTS swap_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    offered_item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create point_transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(20) CHECK (type IN ('earned', 'spent', 'bonus')),
    description TEXT NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert some default categories
INSERT INTO categories (name, description) VALUES
('Clothing', 'Apparel and fashion items'),
('Electronics', 'Electronic devices and accessories'),
('Books', 'Books and reading materials'),
('Home & Garden', 'Home improvement and garden items'),
('Sports & Recreation', 'Sports equipment and recreational items'),
('Toys & Games', 'Toys, games, and entertainment'),
('Beauty & Health', 'Beauty products and health items'),
('Automotive', 'Car parts and automotive accessories')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_items_uploader_id ON items(uploader_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_swap_requests_requester_id ON swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_item_id ON swap_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id); 