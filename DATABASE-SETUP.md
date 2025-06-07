# PostgreSQL Database Setup Guide

This guide explains how to set up and use PostgreSQL with the Mellow application using Docker.

## Overview

The Mellow application now uses PostgreSQL as its primary database instead of SQLite. This provides:
- Better performance for concurrent users
- ACID compliance and data integrity
- Advanced querying capabilities
- Better scalability for production deployments
- **User authentication and role-based access control**

## Quick Start

1. **Start the services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **The PostgreSQL database will be automatically:**
   - Created with the name `mellow_db`
   - Initialized with the conversations and users tables
   - Populated with sample data including admin users
   - Connected to both Node.js and Python services

## Database Configuration

### Environment Variables

The database connection is configured using these environment variables:

- `DB_HOST`: Database host (default: `postgres` in Docker, `localhost` for local dev)
- `DB_PORT`: Database port (default: `5432`)
- `DB_NAME`: Database name (default: `mellow_db`)
- `DB_USER`: Database username (default: `mellow_user`)
- `DB_PASSWORD`: Database password (default: `mellow_password`)

### Services Using PostgreSQL

1. **Node.js Backend** (`backend/node/`)
   - Uses `pg` library for PostgreSQL connections
   - Handles chat conversations and stores them in the database
   - Provides REST API endpoints for conversation management

2. **Python AI Service** (`backend/python-ai/`)
   - Uses `SQLAlchemy` and `psycopg2-binary` for database operations
   - Provides analytics and conversation history
   - Generates contextual AI responses based on conversation history

## Database Schema

### Conversations Table

```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)  -- Links conversations to users
);
```

### Users Table (Role-Based Access Control)

```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'user', 'moderator');

-- Users table
CREATE TABLE users (
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
```

### User Sessions Table

```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);
```

### Permissions System

```sql
-- Permissions table
CREATE TABLE user_permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role-permission mapping
CREATE TABLE role_permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    permission_id INTEGER NOT NULL REFERENCES user_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);
```

## User Roles and Permissions

### Default Roles

1. **Admin** - Full system access
   - All permissions including user management, system settings, and analytics
   - Can create, read, update, and delete all resources

2. **Moderator** - Limited admin access
   - Can manage conversations and view analytics
   - Can read user information but cannot delete users

3. **User** - Basic access
   - Can create and read conversations
   - Can update their own conversations

### Default Permissions

- `chat.create` - Can create new chat conversations
- `chat.read` - Can read chat conversations
- `chat.update` - Can update chat conversations
- `chat.delete` - Can delete chat conversations
- `users.create` - Can create new users
- `users.read` - Can read user information
- `users.update` - Can update user information
- `users.delete` - Can delete users
- `admin.analytics` - Can view system analytics
- `admin.settings` - Can modify system settings

### Default Admin Users

The system creates default admin users for initial setup:

| Username | Email | Password | Role |
|----------|--------|----------|------|
| admin | admin@mellow.local | admin123 | admin |
| admin2 | admin2@mellow.local | admin123 | admin |
| testuser | test@mellow.local | admin123 | user |

**⚠️ Important:** Change these default passwords in production!

## Available Endpoints

### Node.js Backend (Port 3000)

- `POST /chat` - Send a message and get AI response
- `GET /conversations` - Get recent conversation history
- `GET /health` - Health check with database status

### Python AI Service (Port 8000)

- `POST /generate-response` - Generate AI response (used internally)
- `GET /analytics` - Get conversation analytics
- `GET /conversations` - Get conversation history with analysis
- `GET /health` - Health check with database status

## User Management Functions

### Database Functions

The system includes several PostgreSQL functions for user management:

```sql
-- Check if a user has a specific permission
SELECT user_has_permission(1, 'chat.create');

-- Get all permissions for a user
SELECT * FROM get_user_permissions(1);

-- Get user details with permissions (using view)
SELECT * FROM user_details WHERE username = 'admin';
```

### Useful User Queries

```sql
-- List all users with their roles
SELECT id, username, email, role, is_active, created_at FROM users;

-- Get active admin users
SELECT * FROM users WHERE role = 'admin' AND is_active = true;

-- Count users by role
SELECT role, COUNT(*) as user_count FROM users GROUP BY role;

-- Get user sessions
SELECT u.username, s.session_token, s.expires_at, s.ip_address 
FROM user_sessions s 
JOIN users u ON s.user_id = u.id 
WHERE s.expires_at > NOW();

-- Get user permissions by role
SELECT r.role, up.name, up.description 
FROM role_permissions r 
JOIN user_permissions up ON r.permission_id = up.id 
ORDER BY r.role, up.name;
```

## Local Development

### Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone <your-repo>
cd mellow

# Start all services including PostgreSQL
docker-compose up --build

# Access the application
# Frontend: http://localhost (port 80)
# Node.js API: http://localhost:3000
# Python AI API: http://localhost:8000
# PostgreSQL: localhost:5432
```

### Option 2: Local PostgreSQL Installation

1. Install PostgreSQL locally
2. Create a database named `mellow_db`
3. Create a user `mellow_user` with password `mellow_password`
4. Run the initialization scripts from `database/init/01-init.sql` and `database/init/02-users.sql`
5. Set environment variables:
   ```bash
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=mellow_db
   export DB_USER=mellow_user
   export DB_PASSWORD=mellow_password
   ```

## Production Considerations

### Security
- **Change default passwords immediately in production**
- Use strong password hashing (bcrypt with salt rounds >= 12)
- Use environment variables or secrets management for sensitive data
- Enable SSL/TLS for database connections
- Restrict database access to application services only
- Implement proper session management with secure tokens
- Set up rate limiting for authentication endpoints

### User Management
- Implement password strength requirements
- Add email verification for new users
- Set up password reset functionality
- Monitor failed login attempts
- Implement account lockout policies
- Audit user actions and permissions changes

### Performance
- Monitor connection pool usage
- Consider read replicas for heavy read workloads
- Set up proper indexing for frequent queries
- Monitor query performance

### Backup and Recovery
- Set up automated backups
- Test backup restoration procedures
- Consider point-in-time recovery requirements

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check if PostgreSQL container is running
   docker-compose ps
   
   # Check container logs
   docker-compose logs postgres
   ```

2. **Permission Denied**
   ```bash
   # Reset database volume
   docker-compose down -v
   docker-compose up --build
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using port 5432
   netstat -an | grep 5432
   
   # Stop local PostgreSQL if running
   sudo service postgresql stop  # Linux
   brew services stop postgresql  # macOS
   ```

### Database Access

To connect directly to the PostgreSQL database:

```bash
# Using Docker
docker exec -it mellow-postgres-1 psql -U mellow_user -d mellow_db

# Using local psql client
psql -h localhost -p 5432 -U mellow_user -d mellow_db
```

### Useful SQL Queries

```sql
-- Check conversation count
SELECT COUNT(*) FROM conversations;

-- Get recent conversations with user info
SELECT c.*, u.username 
FROM conversations c 
LEFT JOIN users u ON c.user_id = u.id 
ORDER BY c.timestamp DESC LIMIT 10;

-- Get conversation statistics by user
SELECT 
    u.username,
    COUNT(c.id) as conversation_count,
    MAX(c.timestamp) as last_conversation
FROM users u 
LEFT JOIN conversations c ON u.id = c.user_id 
GROUP BY u.id, u.username 
ORDER BY conversation_count DESC;

-- Get user activity statistics
SELECT 
    DATE(c.timestamp) as date,
    COUNT(DISTINCT c.user_id) as active_users,
    COUNT(c.id) as total_conversations
FROM conversations c 
GROUP BY DATE(c.timestamp) 
ORDER BY date DESC;

-- Check user permissions
SELECT u.username, u.role, up.name as permission 
FROM users u 
JOIN role_permissions rp ON u.role = rp.role 
JOIN user_permissions up ON rp.permission_id = up.id 
WHERE u.username = 'admin';
```

## Migration from SQLite

If you were previously using the SQLite version, your data was stored in `backend/node/chat.db`. To migrate:

1. Export data from SQLite:
   ```bash
   sqlite3 backend/node/chat.db
   .mode csv
   .headers on
   .output conversations_export.csv
   SELECT * FROM conversations;
   .quit
   ```

2. Import to PostgreSQL:
   ```bash
   # Connect to PostgreSQL
   psql -h localhost -p 5432 -U mellow_user -d mellow_db
   
   # Import data
   \copy conversations(user_message,ai_response,timestamp) FROM 'conversations_export.csv' DELIMITER ',' CSV HEADER;
   ```

## Support

For issues related to database setup:
1. Check the Docker logs: `docker-compose logs`
2. Verify environment variables are set correctly
3. Ensure no other services are using the same ports
4. Check the database initialization logs in the PostgreSQL container 