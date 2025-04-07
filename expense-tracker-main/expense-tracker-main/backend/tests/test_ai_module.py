import unittest
from ai_module import ExpenseAI, TRAINING_DATA
import pandas as pd
from datetime import datetime, timedelta

class TestExpenseAI(unittest.TestCase):
    def setUp(self):
        self.ai = ExpenseAI()
        self.sample_expenses = [
            {
                'amount': 50.0,
                'description': 'Grocery shopping at Carrefour',
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            } for i in range(30)
        ]

    def test_category_prediction(self):
        # Test known categories
        test_cases = [
            ('Grocery shopping at Carrefour', 'Food'),
            ('Uber ride to airport', 'Transport'),
            ('Netflix subscription', 'Entertainment'),
            ('Electricity bill', 'Utilities'),
            ('Gym membership', 'Health')
        ]

        for description, expected_category in test_cases:
            result = self.ai.predict_category(description)
            self.assertEqual(result['category'], expected_category)
            self.assertGreaterEqual(result['confidence'], 0.5)
            self.assertTrue(result['ai_tagged'])

        # Test unknown category
        result = self.ai.predict_category('Random expense')
        self.assertEqual(result['category'], 'Other')
        self.assertGreaterEqual(result['confidence'], 0.5)

    def test_future_expense_prediction(self):
        # Test with sample data
        result = self.ai.predict_future_expenses(self.sample_expenses, days=7)
        
        self.assertIn('predictions', result)
        self.assertIn('confidence_intervals', result)
        self.assertIn('model_metrics', result)
        
        self.assertEqual(len(result['predictions']), 7)
        self.assertEqual(len(result['confidence_intervals']), 7)
        
        # Test with empty data
        result = self.ai.predict_future_expenses([], days=7)
        self.assertIn('error', result)

    def test_spending_pattern_analysis(self):
        # Test with sample data
        result = self.ai.analyze_spending_patterns(self.sample_expenses)
        
        self.assertIn('total_spent', result)
        self.assertIn('category_distribution', result)
        self.assertIn('unusual_spending', result)
        self.assertIn('spending_trends', result)
        self.assertIn('average_daily_spending', result)
        self.assertIn('spending_volatility', result)
        
        # Test with empty data
        result = self.ai.analyze_spending_patterns([])
        self.assertIn('error', result)

    def test_chat_query_processing(self):
        # Test total spending query
        result = self.ai.process_chat_query('What is my total spending?', self.sample_expenses)
        self.assertIn('amount', result)
        self.assertIn('message', result)
        
        # Test category query
        result = self.ai.process_chat_query('Show me spending by category', self.sample_expenses)
        self.assertIn('amount', result)
        self.assertIn('message', result)
        
        # Test trend query
        result = self.ai.process_chat_query('What is my spending trend?', self.sample_expenses)
        self.assertIn('amount', result)
        self.assertIn('message', result)
        
        # Test with empty data
        result = self.ai.process_chat_query('Any query', [])
        self.assertEqual(result['message'], 'No expenses found in your history.')

    def test_edge_cases(self):
        # Test with very large amounts
        large_expenses = [{'amount': 1000000.0, 'description': 'Large expense', 'category': 'Other', 'date': '2024-03-15'}]
        result = self.ai.predict_future_expenses(large_expenses)
        self.assertIn('predictions', result)
        
        # Test with negative amounts
        negative_expenses = [{'amount': -50.0, 'description': 'Refund', 'category': 'Other', 'date': '2024-03-15'}]
        result = self.ai.analyze_spending_patterns(negative_expenses)
        self.assertIn('total_spent', result)
        
        # Test with invalid dates
        invalid_expenses = [{'amount': 50.0, 'description': 'Test', 'category': 'Other', 'date': 'invalid-date'}]
        result = self.ai.predict_future_expenses(invalid_expenses)
        self.assertIn('error', result)

    def test_performance(self):
        # Test with large dataset
        large_dataset = self.sample_expenses * 100  # 3000 expenses
        start_time = datetime.now()
        result = self.ai.analyze_spending_patterns(large_dataset)
        end_time = datetime.now()
        
        self.assertLess((end_time - start_time).total_seconds(), 5)  # Should complete within 5 seconds
        self.assertIn('total_spent', result)

if __name__ == '__main__':
    unittest.main() 