# User Management API Guide

This guide explains how to use the user management API endpoints in the Mellow backend.

## Prerequisites

1. Make sure the database is initialized with the user tables (run `docker-compose up --build`)
2. Install the required dependencies: `npm install` in the `backend/node` directory
3. The backend server should be running on `http://localhost:3000`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Available Endpoints

### 1. Register a New User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### 2. User Login

**POST** `/auth/login`

Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mellow.local",
    "first_name": "System",
    "last_name": "Administrator",
    "role": "admin",
    "last_login": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example using curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 3. Get Current User Info

**GET** `/auth/me`

Get information about the currently authenticated user.

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@mellow.local",
    "first_name": "System",
    "last_name": "Administrator",
    "role": "admin",
    "is_active": true,
    "is_verified": true,
    "last_login": "2024-01-15T10:30:00.000Z",
    "created_at": "2024-01-15T09:00:00.000Z"
  },
  "permissions": [
    {
      "permission_name": "chat.create",
      "permission_description": "Can create new chat conversations"
    },
    {
      "permission_name": "users.create",
      "permission_description": "Can create new users"
    }
  ]
}
```

### 4. Get All Users (Admin Only)

**GET** `/users`

Get a list of all users. Requires `users.read` permission (admin/moderator).

**Query Parameters:**
- `limit` (optional): Maximum number of users to return (default: 50)
- `offset` (optional): Number of users to skip (default: 0)

**Example:**
```bash
curl -X GET "http://localhost:3000/users?limit=10&offset=0" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 5. Create User (Admin Only)

**POST** `/users`

Create a new user. Requires `users.create` permission (admin only).

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

### 6. Get User by ID

**GET** `/users/:id`

Get information about a specific user. Requires `users.read` permission.

**Example:**
```bash
curl -X GET http://localhost:3000/users/1 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 7. Update User

**PUT** `/users/:id`

Update user information. Requires `users.update` permission.

**Request Body:** (all fields are optional)
```json
{
  "username": "updateduser",
  "email": "updated@example.com",
  "first_name": "Updated",
  "last_name": "Name",
  "role": "moderator"
}
```

### 8. Deactivate User

**DELETE** `/users/:id`

Deactivate (soft delete) a user. Requires `users.delete` permission.

**Example:**
```bash
curl -X DELETE http://localhost:3000/users/2 \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Default Users

The system comes with these default users:

| Username | Email | Password | Role | Description |
|----------|--------|----------|------|-------------|
| admin | admin@mellow.local | admin123 | admin | System administrator |
| admin2 | admin2@mellow.local | admin123 | admin | Second admin user |
| testuser | test@mellow.local | admin123 | user | Test user account |

**⚠️ Important:** Change these default passwords in production!

## Role-Based Permissions

### Admin Role
- Full access to all endpoints
- Can create, read, update, and delete users
- Can manage system settings and view analytics
- Can access all chat conversations

### Moderator Role
- Can manage conversations
- Can read user information
- Can view analytics
- Cannot delete users or modify system settings

### User Role
- Can create and read their own conversations
- Can update their own conversations
- Limited access to user management

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

**400 Bad Request:**
```json
{
  "error": "Username, email, and password are required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Access token required"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "error": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error"
}
```

## Example Workflow

Here's a complete example of registering a user, logging in, and creating a chat:

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User2"
  }'
```

### 2. Login with the new user
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "password": "password123"
  }'
```

### 3. Use the token to send a chat message
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-from-login>" \
  -d '{
    "message": "Hello, this is my first message!"
  }'
```

### 4. Get your user info
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token-from-login>"
```

## Testing with Admin Account

To test admin functionality, login with the default admin account:

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Get all users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer <admin-token>"

# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "username": "newadmin",
    "email": "newadmin@example.com",
    "password": "password123",
    "role": "admin"
  }'
```

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` environment variable in production
2. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
3. **Token Expiration**: JWT tokens expire after 24 hours by default
4. **Input Validation**: All endpoints validate input data
5. **SQL Injection Protection**: All database queries use parameterized statements
6. **CORS**: CORS is configured for development; adjust for production

## Environment Variables

Set these environment variables for production:

```bash
JWT_SECRET=your-super-secret-production-key
JWT_EXPIRES_IN=24h
DB_HOST=your-postgres-host
DB_PORT=5432
DB_NAME=mellow_db
DB_USER=mellow_user
DB_PASSWORD=your-secure-password
``` 