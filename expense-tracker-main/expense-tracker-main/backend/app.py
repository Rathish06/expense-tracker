from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
import requests
import traceback
from ai_module import expense_ai

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Configure CORS to allow requests from frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Firebase Admin
try:
    cred = credentials.Certificate('firebase-credentials.json.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    
    # Test Firestore connection
    test_ref = db.collection('_test').document('_test')
    test_ref.set({'test': True})
    test_ref.delete()
    print("Firebase and Firestore initialized successfully!")
except Exception as e:
    print(f"Firebase/Firestore initialization error: {str(e)}")
    print(traceback.format_exc())
    raise e

def create_sample_expenses(user_id):
    """Create sample expenses for a user"""
    sample_expenses = [
        # Regular monthly bills
        {
            'amount': 39.99,
            'description': 'Grocery shopping at Carrefour',
            'category': 'Food',
            'date': datetime.now().strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 22.50,
            'description': 'Gas station fill-up',
            'category': 'Transportation',
            'date': (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 79.99,
            'description': 'Monthly internet bill',
            'category': 'Utilities',
            'date': (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Subscriptions
        {
            'amount': 11.99,
            'description': 'Netflix subscription',
            'category': 'Entertainment',
            'date': (datetime.now() - timedelta(days=4)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 9.99,
            'description': 'Spotify Premium',
            'category': 'Entertainment',
            'date': (datetime.now() - timedelta(days=4)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Shopping
        {
            'amount': 129.00,
            'description': 'New winter jacket',
            'category': 'Shopping',
            'date': (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 59.99,
            'description': 'Nike running shoes',
            'category': 'Shopping',
            'date': (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Food and Dining
        {
            'amount': 15.50,
            'description': 'Lunch at work',
            'category': 'Food',
            'date': (datetime.now() - timedelta(days=6)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 35.80,
            'description': 'Dinner with friends',
            'category': 'Food',
            'date': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Transportation
        {
            'amount': 45.00,
            'description': 'Monthly bus pass',
            'category': 'Transportation',
            'date': (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Utilities
        {
            'amount': 65.00,
            'description': 'Electricity bill',
            'category': 'Utilities',
            'date': (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 35.00,
            'description': 'Water bill',
            'category': 'Utilities',
            'date': (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Entertainment
        {
            'amount': 25.00,
            'description': 'Cinema tickets',
            'category': 'Entertainment',
            'date': (datetime.now() - timedelta(days=9)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 32.50,
            'description': 'Books from Amazon',
            'category': 'Shopping',
            'date': (datetime.now() - timedelta(days=9)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # More Food
        {
            'amount': 27.80,
            'description': 'Pizza delivery',
            'category': 'Food',
            'date': (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 42.30,
            'description': 'Grocery shopping at Lidl',
            'category': 'Food',
            'date': (datetime.now() - timedelta(days=11)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        # Health
        {
            'amount': 25.00,
            'description': 'Pharmacy',
            'category': 'Health',
            'date': (datetime.now() - timedelta(days=12)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'amount': 40.00,
            'description': 'Gym membership',
            'category': 'Health',
            'date': (datetime.now() - timedelta(days=13)).strftime('%Y-%m-%d'),
            'user_id': user_id,
            'currency': 'EUR'
        }
    ]

    # Add sample expenses to Firestore
    for expense in sample_expenses:
        db.collection('expenses').add(expense)
    return len(sample_expenses)

def create_sample_budgets(user_id):
    """Create sample budgets for a user"""
    sample_budgets = [
        {
            'category': 'Food',
            'amount_limit': 450.00,
            'current_amount': 39.99,
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'category': 'Transportation',
            'amount_limit': 180.00,
            'current_amount': 22.50,
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'category': 'Utilities',
            'amount_limit': 250.00,
            'current_amount': 79.99,
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'category': 'Entertainment',
            'amount_limit': 100.00,
            'current_amount': 11.99,
            'user_id': user_id,
            'currency': 'EUR'
        },
        {
            'category': 'Shopping',
            'amount_limit': 200.00,
            'current_amount': 129.00,
            'user_id': user_id,
            'currency': 'EUR'
        }
    ]

    # Add sample budgets to Firestore
    for budget in sample_budgets:
        db.collection('budgets').add(budget)
    return len(sample_budgets)

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        print("Starting registration process...")
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        print(f"Received registration data: {data}")
        
        email = data.get('email', '').strip()
        password = data.get('password', '')
        name = data.get('name', '').strip()

        # Validate required fields
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400

        # Validate password length
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400

        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            print(f"Created user in Firebase Auth with ID: {user.uid}")

            # Store user data in Firestore
            user_data = {
                'email': email,
                'name': name,
                'created_at': datetime.utcnow()
            }
            
            db.collection('users').document(user.uid).set(user_data)
            print(f"Stored user data in Firestore for ID: {user.uid}")

            return jsonify({
                'message': 'Registration successful',
                'user': {
                    'id': user.uid,
                    'email': email,
                    'name': name
                }
            }), 201

        except auth.EmailAlreadyExistsError:
            return jsonify({'error': 'Email already in use'}), 400
        except Exception as e:
            print(f"Registration error: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': 'Registration failed. Please try again.'}), 500

    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'An unexpected error occurred'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        print("Starting login process...")
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        print(f"Received login data: {data}")
        
        # Check if required fields exist in data
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
            
        email = str(data['email']).strip()
        password = str(data['password'])

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        print(f"Attempting login for email: {email}")

        try:
            # First verify the user exists
            user = auth.get_user_by_email(email)
            print(f"Found user with ID: {user.uid}")

            # Get user data from Firestore
            user_doc = db.collection('users').document(user.uid).get()
            if not user_doc.exists:
                print(f"User document not found for ID: {user.uid}")
                return jsonify({'error': 'User profile not found'}), 404
            
            user_data = user_doc.to_dict()
            if user_data is None:
                return jsonify({'error': 'User data is corrupted'}), 500

            print(f"Retrieved user data: {user_data}")

            response_data = {
                'user': {
                    'id': user.uid,
                    'email': user_data.get('email', email),
                    'name': user_data.get('name', '')
                }
            }
            print("Login successful!")
            return jsonify(response_data), 200

        except auth.UserNotFoundError:
            print(f"No user found with email: {email}")
            return jsonify({'error': 'Invalid email or password'}), 401
        except Exception as e:
            print(f"Error during user lookup: {str(e)}")
            print(traceback.format_exc())
            return jsonify({'error': 'Login failed'}), 500

    except Exception as e:
        print(f"Login error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Login failed'}), 500

# Expense routes
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        print("Fetching expenses...")
        user_id = request.args.get('user_id')
        if not user_id:
            print("Error: user_id is required")
            return jsonify({'error': 'user_id is required'}), 400
            
        print(f"Fetching expenses for user: {user_id}")
        # Query expenses for the user
        expenses_ref = db.collection('expenses')
        query = expenses_ref.where('user_id', '==', user_id)
        
        # Get all expenses
        expenses = []
        print("Starting to stream expenses...")
        for doc in query.stream():
            expense = doc.to_dict()
            expense['id'] = doc.id
            print(f"Found expense: {expense}")
            expenses.append(expense)
            
        print(f"Found {len(expenses)} expenses")
        return jsonify(expenses), 200
        
    except Exception as e:
        print(f"Error fetching expenses: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        print("Adding new expense...")
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400

        required_fields = ['user_id', 'amount', 'description', 'category', 'date']
        
        # Validate required fields are present in data
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            error_msg = f"Missing required fields: {', '.join(missing)}"
            print(f"Error: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        print(f"Creating expense for user: {data['user_id']}")
        
        # Validate amount is a valid number
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'error': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid amount value'}), 400
        
        # Create expense document
        expense_ref = db.collection('expenses').document()
        expense_data = {
            'user_id': data['user_id'],
            'amount': amount,
            'description': data['description'],
            'category': data['category'],
            'date': data['date'],
            'currency': data.get('currency', 'EUR'),  # Default to EUR if not specified
            'created_at': datetime.utcnow()
        }
        
        # Save to Firestore
        expense_ref.set(expense_data)
        print(f"Expense created with ID: {expense_ref.id}")
        
        # Return the created expense with its ID
        response_data = expense_data.copy()
        response_data['id'] = expense_ref.id
        return jsonify(response_data), 201
        
    except Exception as e:
        print(f"Error adding expense: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to add expense'}), 500

# Category routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        user_id = request.args.get('user_id')  # Get user_id from query params
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
            
        categories_ref = db.collection('categories').where('user_id', '==', user_id).stream()
        
        categories = []
        for cat in categories_ref:
            cat_data = cat.to_dict()
            cat_data['id'] = cat.id
            categories.append(cat_data)
            
        return jsonify(categories)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['POST'])
def add_category():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        # Check required fields
        if 'user_id' not in data or 'name' not in data:
            return jsonify({'error': 'User ID and category name are required'}), 400
            
        user_id = str(data['user_id'])
        name = str(data['name']).strip()
        
        if not user_id or not name:
            return jsonify({'error': 'User ID and category name are required'}), 400
            
        # Create category in Firestore
        category_ref = db.collection('categories').document()
        category_data = {
            'name': name,
            'user_id': user_id,
            'created_at': datetime.utcnow()
        }
        
        category_ref.set(category_data)
        
        # Return the created category
        response_data = {
            'id': category_ref.id,
            'name': category_data['name']
        }
        
        return jsonify(response_data), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['GET'])
def get_budgets():
    try:
        print("Fetching budgets...")
        user_id = request.args.get('user_id')
        if not user_id:
            print("Error: user_id is required")
            return jsonify({'error': 'user_id is required'}), 400
            
        print(f"Fetching budgets for user: {user_id}")
        # Query budgets for the user
        budgets_ref = db.collection('budgets')
        query = budgets_ref.where('user_id', '==', user_id)
        
        # Get all budgets
        budgets = []
        print("Starting to stream budgets...")
        for doc in query.stream():
            budget = doc.to_dict()
            budget['id'] = doc.id
            print(f"Found budget: {budget}")
            budgets.append(budget)
            
        print(f"Found {len(budgets)} budgets")
        return jsonify(budgets), 200
        
    except Exception as e:
        print(f"Error fetching budgets: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to fetch budgets'}), 500

@app.route('/api/test/add-sample-data', methods=['POST'])
def add_sample_data():
    try:
        print("Starting add sample data process...")
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        if 'user_id' not in data:
            print("Error: user_id is required")
            return jsonify({'error': 'user_id is required'}), 400
            
        user_id = str(data['user_id'])
        if not user_id:
            print("Error: user_id cannot be empty")
            return jsonify({'error': 'user_id cannot be empty'}), 400

        print(f"Adding sample data for user: {user_id}")

        # Create sample data
        num_expenses = create_sample_expenses(user_id)
        num_budgets = create_sample_budgets(user_id)

        print("Sample data added successfully!")
        return jsonify({
            'message': 'Sample data added successfully',
            'expenses_created': num_expenses,
            'budgets_created': num_budgets
        }), 201

    except Exception as e:
        print(f"Error creating sample data: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to create sample data'}), 500

# AI routes
@app.route('/api/ai/categorize', methods=['POST'])
def categorize_expense():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        if 'description' not in data:
            return jsonify({'error': 'Description is required'}), 400
            
        description = str(data['description']).strip()
        if not description:
            return jsonify({'error': 'Description cannot be empty'}), 400
            
        # Get AI prediction
        prediction = expense_ai.predict_category(description)
        if prediction is None:
            return jsonify({'error': 'Could not predict category'}), 404
            
        return jsonify(prediction), 200
        
    except Exception as e:
        print(f"Error categorizing expense: {str(e)}")
        return jsonify({'error': 'Failed to categorize expense'}), 500

@app.route('/api/ai/predict', methods=['POST'])
def predict_expenses():
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'No data provided'}), 400
            
        if 'user_id' not in data:
            return jsonify({'error': 'User ID is required'}), 400
            
        user_id = str(data['user_id'])
        if not user_id:
            return jsonify({'error': 'User ID cannot be empty'}), 400
            
        # Get user's past expenses
        expenses_ref = db.collection('expenses').where('user_id', '==', user_id)
        expenses = []
        for doc in expenses_ref.stream():
            expense = doc.to_dict()
            expenses.append(expense)
            
        # Convert expenses to list of dictionaries, ensuring no None values
        expenses_list = [expense.to_dict() for expense in expenses if expense and isinstance(expense.to_dict(), dict)]
        
        # Get predictions
        predictions = expense_ai.predict_future_expenses(expenses_list)
        if predictions is None:
            return jsonify({'error': 'Could not predict future expenses'}), 404
            
        return jsonify(predictions), 200
        
    except Exception as e:
        print(f"Error predicting expenses: {str(e)}")
        return jsonify({'error': 'Failed to predict expenses'}), 500

@app.route('/api/ai/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        query = data.get('query')
        user_id = data.get('user_id')
        
        if not query or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400
            
        # Get user's expenses from Firestore
        expenses_ref = db.collection('expenses')
        expenses = expenses_ref.where('user_id', '==', user_id).get()
        
        if not expenses:
            return jsonify({'error': 'No expenses found'}), 404
            
        # Convert expenses to list of dictionaries, ensuring no None values
        expenses_list = [expense.to_dict() for expense in expenses if expense and isinstance(expense.to_dict(), dict)]
        
        # Process query with AI
        response = expense_ai.process_chat_query(query, expenses_list)
        
        # Get AI insights
        anomalies = expense_ai.detect_anomalies(expenses_list)
        patterns = expense_ai.identify_patterns(expenses_list)
        
        # Add insights to response
        response['insights'] = {
            'anomalies': anomalies,
            'patterns': patterns
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400

        # Get user's expenses
        expenses_ref = db.collection('expenses')
        expenses = expenses_ref.where('user_id', '==', user_id).stream()
        
        expenses_list = []
        for expense in expenses:
            expense_data = expense.to_dict()
            expenses_list.append(expense_data)

        if not expenses_list:
            return jsonify({'error': 'No expenses found'}), 404

        # Calculate insights
        # Group expenses by category
        category_totals = {}
        for expense in expenses_list:
            category = expense.get('category', 'Uncategorized')
            amount = float(expense.get('amount', 0))
            category_totals[category] = category_totals.get(category, 0) + amount

        # Find top category
        top_category = max(category_totals.items(), key=lambda x: x[1])

        # Calculate average daily spend
        total_amount = sum(float(exp.get('amount', 0)) for exp in expenses_list)
        dates = [datetime.fromisoformat(exp.get('date', '')) for exp in expenses_list]
        if dates:
            date_range = (max(dates) - min(dates)).days or 1
            average_daily = total_amount / date_range
        else:
            average_daily = 0

        return jsonify({
            'topCategory': top_category[0],
            'topCategoryAmount': top_category[1],
            'averageDailySpend': average_daily
        })

    except Exception as e:
        print(f"Error in get_ai_insights: {str(e)}")
        return jsonify({'error': 'Failed to get AI insights'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 