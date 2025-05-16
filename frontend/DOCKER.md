# Docker Setup for MellowMind Frontend

This document explains how to build and run the MellowMind frontend application using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Building and Running with Docker Compose

The easiest way to build and run the application is using Docker Compose:

```bash
# Build and start the container
docker-compose up -d

# To rebuild the container (if you've made changes to the code)
docker-compose up -d --build

# To stop the container
docker-compose down
```

The application will be available at http://localhost:80.

## Building and Running with Docker

If you prefer to use Docker commands directly:

```bash
# Build the Docker image
docker build -t mellowmind-frontend .

# Run the container
docker run -p 80:80 -d --name mellowmind-frontend mellowmind-frontend

# Stop the container
docker stop mellowmind-frontend

# Remove the container
docker rm mellowmind-frontend
```

## Development vs Production

The Docker setup is configured for production use. It builds the React application and serves it using Nginx.

Note that this Docker setup doesn't include Electron, as it's designed to run the web version of the application. Electron is typically used for desktop applications, while Docker is more commonly used for web services. 