from app import app, db, User, Expense, Category
from datetime import datetime, timedelta
import random

def create_sample_data():
    with app.app_context():
        # Create a test user if not exists
        test_user = User.query.filter_by(email='test@example.com').first()
        if not test_user:
            test_user = User(
                email='test@example.com',
                name='Test User',
                password_hash='hashed_password'  # This is just for testing
            )
            db.session.add(test_user)
            db.session.commit()

        # Create sample categories
        categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare']
        category_objects = {}
        for category_name in categories:
            category = Category.query.filter_by(name=category_name, user_id=test_user.id).first()
            if not category:
                category = Category(name=category_name, user_id=test_user.id)
                db.session.add(category)
            category_objects[category_name] = category
        db.session.commit()

        # Create sample expenses for the last 3 months
        expense_descriptions = {
            'Food': ['Groceries', 'Restaurant', 'Coffee', 'Lunch', 'Dinner', 'Snacks'],
            'Transportation': ['Gas', 'Bus fare', 'Train ticket', 'Taxi', 'Parking'],
            'Entertainment': ['Movie', 'Concert', 'Netflix', 'Spotify', 'Game'],
            'Utilities': ['Electricity', 'Water', 'Internet', 'Phone bill'],
            'Shopping': ['Clothes', 'Electronics', 'Books', 'Gifts'],
            'Healthcare': ['Medicine', 'Doctor visit', 'Gym membership']
        }

        # Clear existing expenses for the test user
        Expense.query.filter_by(user_id=test_user.id).delete()
        db.session.commit()

        # Add sample expenses
        for _ in range(50):  # Create 50 sample expenses
            category_name = random.choice(categories)
            description = random.choice(expense_descriptions[category_name])
            amount = round(random.uniform(5, 200), 2)
            date = datetime.now() - timedelta(days=random.randint(0, 90))
            
            expense = Expense(
                amount=amount,
                description=description,
                date=date,
                category_id=category_objects[category_name].id,
                user_id=test_user.id
            )
            db.session.add(expense)

        db.session.commit()
        print("Sample data created successfully!")

if __name__ == '__main__':
    create_sample_data() 