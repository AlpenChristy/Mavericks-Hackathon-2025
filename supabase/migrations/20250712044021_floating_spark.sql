/*
  # ReWear Platform Database Schema

  1. New Tables
    - `profiles` - User profile information extending Supabase auth
    - `items` - Clothing items listed on the platform
    - `swap_requests` - Direct swap requests between users
    - `point_transactions` - Point earning and spending history
    - `favorites` - User's saved/favorited items
    - `categories` - Item categories for organization
    - `reports` - User reports for moderation

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Admin-only policies for moderation features

  3. Functions
    - Handle user registration
    - Point calculation and management
    - Automatic point awards for listings
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  avatar_url text,
  points integer DEFAULT 100,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  bio text,
  location text,
  joined_date timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES categories(id),
  category_name text NOT NULL,
  type text NOT NULL,
  size text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')),
  tags text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  uploader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_value integer NOT NULL DEFAULT 0,
  status text DEFAULT 'available' CHECK (status IN ('available', 'pending', 'swapped', 'redeemed')),
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Swap requests table
CREATE TABLE IF NOT EXISTS swap_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  offered_item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Point transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'spent', 'bonus')),
  description text NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Outerwear', 'Jackets, coats, blazers, and outer garments'),
  ('Tops', 'Shirts, blouses, t-shirts, and upper body clothing'),
  ('Bottoms', 'Pants, jeans, skirts, and lower body clothing'),
  ('Dresses', 'Dresses, jumpsuits, and one-piece garments'),
  ('Footwear', 'Shoes, boots, sneakers, and foot accessories'),
  ('Accessories', 'Bags, jewelry, scarves, and fashion accessories'),
  ('Activewear', 'Sports and fitness clothing'),
  ('Formal', 'Business and formal occasion wear')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Items policies
CREATE POLICY "Anyone can view approved items"
  ON items FOR SELECT
  TO authenticated
  USING (approval_status = 'approved');

CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins can view all items"
  ON items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can update own items"
  ON items FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid());

CREATE POLICY "Admins can update any item"
  ON items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Swap requests policies
CREATE POLICY "Users can view swap requests for their items"
  ON swap_requests FOR SELECT
  TO authenticated
  USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items 
      WHERE id = swap_requests.item_id AND uploader_id = auth.uid()
    )
  );

CREATE POLICY "Users can create swap requests"
  ON swap_requests FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update swap requests for their items"
  ON swap_requests FOR UPDATE
  TO authenticated
  USING (
    requester_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM items 
      WHERE id = swap_requests.item_id AND uploader_id = auth.uid()
    )
  );

-- Point transactions policies
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions"
  ON point_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  
  -- Award welcome bonus
  INSERT INTO point_transactions (user_id, amount, type, description)
  VALUES (new.id, 100, 'bonus', 'Welcome bonus for joining ReWear');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to award points for listing items
CREATE OR REPLACE FUNCTION award_listing_points()
RETURNS trigger AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
    -- Award points for approved listing
    INSERT INTO point_transactions (user_id, amount, type, description, item_id)
    VALUES (NEW.uploader_id, 25, 'earned', 'Points earned for approved item listing', NEW.id);
    
    -- Update user's points balance
    UPDATE profiles 
    SET points = points + 25 
    WHERE id = NEW.uploader_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for item approval
DROP TRIGGER IF EXISTS on_item_approved ON items;
CREATE TRIGGER on_item_approved
  AFTER UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION award_listing_points();

-- Function to handle point redemption
CREATE OR REPLACE FUNCTION redeem_item_with_points(item_uuid uuid, user_uuid uuid)
RETURNS json AS $$
DECLARE
  item_points integer;
  user_points integer;
  result json;
BEGIN
  -- Get item points value
  SELECT points_value INTO item_points FROM items WHERE id = item_uuid AND status = 'available';
  
  IF item_points IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Item not found or not available');
  END IF;
  
  -- Get user's current points
  SELECT points INTO user_points FROM profiles WHERE id = user_uuid;
  
  IF user_points < item_points THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient points');
  END IF;
  
  -- Deduct points and mark item as redeemed
  UPDATE profiles SET points = points - item_points WHERE id = user_uuid;
  UPDATE items SET status = 'redeemed' WHERE id = item_uuid;
  
  -- Record transaction
  INSERT INTO point_transactions (user_id, amount, type, description, item_id)
  VALUES (user_uuid, -item_points, 'spent', 'Points spent on item redemption', item_uuid);
  
  RETURN json_build_object('success', true, 'points_spent', item_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;