# Backend Structure

This is the cleaned up backend structure. Keep only these essential files and directories:

```
backend/
├── routers/           # API route handlers
│   ├── auth.py       # Authentication routes
│   ├── expenses.py   # Expense management routes
│   └── categories.py # Category management routes
├── main.py           # Main FastAPI application
├── models.py         # SQLAlchemy models
├── database.py       # Database connection setup
├── config.py         # Configuration settings
├── crud.py           # Database CRUD operations
├── requirements.txt  # Python dependencies
└── .env             # Environment variables
```

## Setup Instructions

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
```bash
# On Windows
.\venv\Scripts\activate

# On Unix or MacOS
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up your environment variables in `.env`

5. Run the server:
```bash
uvicorn main:app --reload
```

## API Documentation

Once the server is running, you can access:
- API documentation: http://localhost:8000/docs
- Alternative documentation: http://localhost:8000/redoc

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/token` - Login and get access token

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create a new category
- GET `/api/categories/{category_id}` - Get a specific category
- PUT `/api/categories/{category_id}` - Update a category
- DELETE `/api/categories/{category_id}` - Delete a category

### Expenses
- GET `/api/expenses` - Get all expenses
- POST `/api/expenses` - Create a new expense
- GET `/api/expenses/{expense_id}` - Get a specific expense
- PUT `/api/expenses/{expense_id}` - Update an expense
- DELETE `/api/expenses/{expense_id}` - Delete an expense

## Security

- All endpoints except registration and login require authentication
- JWT tokens are used for authentication
- Passwords are hashed using bcrypt
- CORS is configured to allow requests from the frontend (http://localhost:3000) 