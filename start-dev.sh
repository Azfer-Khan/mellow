#!/bin/bash

echo "🚀 Starting Mellow Development Environment"
echo "========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "🐳 Starting Docker services..."
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker-compose exec -T postgres pg_isready -U mellow_user -d mellow_db > /dev/null 2>&1; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

# Check Node Backend
echo -n "Node Backend: "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

# Check Python AI
echo -n "Python AI: "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

# Check Frontend
echo -n "Frontend: "
if curl -s http://localhost:80 > /dev/null 2>&1; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

echo ""
echo "🌐 Services are starting up..."
echo "Frontend: http://localhost"
echo "Node Backend: http://localhost:3000"
echo "Python AI: http://localhost:8000"
echo "CORS Test: http://localhost/test-cors.html"
echo ""
echo "📋 To view logs:"
echo "docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "docker-compose down" 