# Docker Setup for MellowMind Application

This document explains how to build and run the complete MellowMind application (frontend, Node.js backend, and Python AI service) using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Architecture

The application consists of three main components:

1. **Frontend (React)**: The user interface, served by Nginx
2. **Node.js Backend**: Handles API requests and database interactions
3. **Python AI Service**: Provides AI responses via FastAPI

## Building and Running with Docker Compose

The easiest way to build and run the entire application stack is using Docker Compose:

```bash
# Build and start all containers
docker-compose up -d

# To rebuild the containers (if you've made changes to the code)
docker-compose up -d --build

# To stop all containers
docker-compose down
```

## Accessing the Services

Once the containers are running, you can access the services at:

- Frontend: http://localhost:80
- Node.js Backend API: http://localhost:3000
- Python AI Service API: http://localhost:8000 (with documentation at http://localhost:8000/docs)

## Container Dependencies

The containers are set up with the following dependencies:

- Frontend depends on Node.js Backend
- Node.js Backend depends on Python AI Service

This ensures services start in the correct order.

## Data Persistence

The Node.js backend uses a SQLite database to store conversation history. This database is persisted using a Docker volume named `node-db-data`.

## Environment Variables

The following environment variables can be configured:

- `PYTHON_AI_URL`: The URL of the Python AI service (default: http://python-ai:8000)
- `DB_PATH`: The path to the SQLite database (default: ./data/chat.db)

## Individual Service Documentation

For more detailed information about each service's Docker configuration:

- [Frontend Docker Setup](./frontend/DOCKER.md)
- Node.js Backend: See Dockerfile in ./backend/node/
- Python AI Service: See Dockerfile in ./backend/python-ai/ 