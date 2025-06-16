-- Create your admin account specifically
-- Run this if the seed script doesn't work or if you need to update it

-- First, delete any existing account with this email (optional)
-- DELETE FROM users WHERE email = 'zeeshan@huddle01.com';

-- Insert your admin account
INSERT INTO users (email, full_name, is_admin, auth_provider, created_at, updated_at) 
VALUES ('zeeshan@huddle01.com', 'Zeeshan Admin', true, 'email', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  is_admin = true,
  full_name = 'Zeeshan Admin',
  updated_at = NOW();
