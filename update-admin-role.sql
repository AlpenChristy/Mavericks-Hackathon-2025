-- SQL script to update a user's role to admin
-- Run this in pgAdmin or your PostgreSQL client

-- First, let's see all existing users
SELECT id, email, name, role FROM users;

-- To update a specific user to admin, replace 'user@example.com' with the actual email
-- UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Example: If you want to update the first user in the database to admin
-- UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM users LIMIT 1);

-- To update a user by their name
-- UPDATE users SET role = 'admin' WHERE name = 'Your User Name';

-- After updating, verify the change
SELECT id, email, name, role FROM users WHERE role = 'admin'; 