# Mellow AI Service - Python Backend

A FastAPI-based AI service for generating contextual responses and providing conversation analytics.

## Project Structure

```
backend/python-ai/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── health.py       # Health check endpoints
│   │   │   ├── chat.py         # Chat-related endpoints
│   │   │   └── analytics.py    # Analytics endpoints
│   │   └── dependencies.py     # FastAPI dependencies
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuration settings
│   │   └── database.py         # Database connection & session
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py         # SQLAlchemy models
│   │   └── schemas.py          # Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ai_service.py       # AI response generation logic
│   │   ├── analytics_service.py # Analytics processing
│   │   └── conversation_service.py # Conversation management
│   └── utils/
│       ├── __init__.py
│       └── text_processing.py  # Text analysis utilities
├── requirements.txt
├── Dockerfile
├── README.md
└── Plan.md
```

## Features

- **Contextual AI Responses**: Generates intelligent responses based on user input and conversation history
- **Conversation Management**: Stores and retrieves conversation data
- **Analytics**: Provides insights on conversation patterns, topics, and trends
- **Health Monitoring**: Health check endpoints for service monitoring
- **Modular Architecture**: Clean separation of concerns for maintainability

## API Endpoints

### Health
- `GET /health` - Service health check

### Chat
- `POST /generate-response` - Generate AI response to user message
- `GET /conversations` - Get recent conversations
- `GET /conversations/{id}` - Get specific conversation
- `DELETE /conversations/{id}` - Delete conversation

### Analytics
- `GET /analytics` - Get conversation analytics
- `GET /analytics/trends` - Get conversation trends
- `GET /analytics/insights` - Get message insights

## Configuration

The service uses environment variables for configuration:

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: mellow_db)
- `DB_USER` - Database user (default: mellow_user)
- `DB_PASSWORD` - Database password (default: mellow_password)
- `DEBUG` - Enable debug mode (default: False)
- `HOST` - Service host (default: 0.0.0.0)
- `PORT` - Service port (default: 8000)

## Running the Service

### Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python -m app.main
```

### Docker
```bash
# Build the image
docker build -t mellow-ai .

# Run the container
docker run -p 8000:8000 mellow-ai
```

## Development

### Architecture Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Maintainability**: Easy to find and modify specific functionality
3. **Testability**: Each service can be tested independently
4. **Scalability**: Easy to add new features without cluttering main files
5. **Code Reusability**: Services can be imported and used elsewhere

### Adding New Features

1. **New API Endpoint**: Add to appropriate route file in `api/routes/`
2. **New Business Logic**: Create or extend services in `services/`
3. **New Data Model**: Add to `models/database.py` (SQLAlchemy) or `models/schemas.py` (Pydantic)
4. **New Utility Function**: Add to appropriate file in `utils/`

## Dependencies

- FastAPI - Web framework
- SQLAlchemy - Database ORM
- Pydantic - Data validation
- Uvicorn - ASGI server
- psycopg2-binary - PostgreSQL adapter 