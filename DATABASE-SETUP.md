# PostgreSQL Database Setup Guide

This guide explains how to set up and use PostgreSQL with the Mellow application using Docker.

## Overview

The Mellow application now uses PostgreSQL as its primary database instead of SQLite. This provides:
- Better performance for concurrent users
- ACID compliance and data integrity
- Advanced querying capabilities
- Better scalability for production deployments

## Quick Start

1. **Start the services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **The PostgreSQL database will be automatically:**
   - Created with the name `mellow_db`
   - Initialized with the conversations table
   - Populated with sample data
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

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
4. Run the initialization script from `database/init/01-init.sql`
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
- Change default passwords in production
- Use environment variables or secrets management
- Enable SSL/TLS for database connections
- Restrict database access to application services only

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

-- Get recent conversations
SELECT * FROM conversations ORDER BY timestamp DESC LIMIT 10;

-- Get conversation statistics
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as conversation_count
FROM conversations 
GROUP BY DATE(timestamp) 
ORDER BY date DESC;
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