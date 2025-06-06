-- Create users table with role-based access control
-- This script runs after 01-init.sql

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'user', 'moderator');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create trigger to update the updated_at column for users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add user_id column to conversations table to associate conversations with users
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Create index on user_id for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Create sessions table for user session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Create user permissions table for granular permissions
CREATE TABLE IF NOT EXISTS user_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- Insert default permissions
INSERT INTO user_permissions (name, description) VALUES 
    ('chat.create', 'Can create new chat conversations'),
    ('chat.read', 'Can read chat conversations'),
    ('chat.update', 'Can update chat conversations'),
    ('chat.delete', 'Can delete chat conversations'),
    ('users.create', 'Can create new users'),
    ('users.read', 'Can read user information'),
    ('users.update', 'Can update user information'),
    ('users.delete', 'Can delete users'),
    ('admin.analytics', 'Can view system analytics'),
    ('admin.settings', 'Can modify system settings')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'admin', id FROM user_permissions
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'moderator', id FROM user_permissions WHERE name IN (
    'chat.create', 'chat.read', 'chat.update', 'chat.delete',
    'users.read', 'admin.analytics'
)
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id) 
SELECT 'user', id FROM user_permissions WHERE name IN (
    'chat.create', 'chat.read', 'chat.update'
)
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create a default admin user (password: admin123 - should be changed in production)
-- Note: In production, you should use proper password hashing (bcrypt, scrypt, etc.)
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, is_verified) VALUES 
    ('admin', 'admin@mellow.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewGtRhEk3wBhLQ/2', 'System', 'Administrator', 'admin', true, true)
ON CONFLICT (username) DO NOTHING;

-- Create a view for user details with role information
CREATE OR REPLACE VIEW user_details AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.role,
    u.is_active,
    u.is_verified,
    u.last_login,
    u.created_at,
    u.updated_at,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'permission', up.name,
                'description', up.description
            )
        ) FILTER (WHERE up.name IS NOT NULL), 
        '[]'::json
    ) as permissions
FROM users u
LEFT JOIN role_permissions rp ON u.role = rp.role
LEFT JOIN user_permissions up ON rp.permission_id = up.id
GROUP BY u.id, u.username, u.email, u.first_name, u.last_name, u.role, u.is_active, u.is_verified, u.last_login, u.created_at, u.updated_at;

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_id_param INTEGER, permission_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_role_val user_role;
    has_permission BOOLEAN DEFAULT FALSE;
BEGIN
    -- Get user role
    SELECT role INTO user_role_val FROM users WHERE id = user_id_param AND is_active = true;
    
    -- Check if user has the permission
    SELECT EXISTS(
        SELECT 1 
        FROM role_permissions rp
        JOIN user_permissions up ON rp.permission_id = up.id
        WHERE rp.role = user_role_val AND up.name = permission_name
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id_param INTEGER)
RETURNS TABLE(permission_name VARCHAR, permission_description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT up.name, up.description
    FROM users u
    JOIN role_permissions rp ON u.role = rp.role
    JOIN user_permissions up ON rp.permission_id = up.id
    WHERE u.id = user_id_param AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Add some sample data for testing (optional)
-- Additional admin users
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, is_verified) VALUES 
    ('admin2', 'admin2@mellow.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewGtRhEk3wBhLQ/2', 'Second', 'Admin', 'admin', true, true),
    ('testuser', 'test@mellow.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewGtRhEk3wBhLQ/2', 'Test', 'User', 'user', true, true)
ON CONFLICT (username) DO NOTHING; 