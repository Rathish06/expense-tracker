from typing import Dict, Any, Sequence, List, Tuple, NamedTuple, Union
import numpy as np
from numpy.typing import NDArray
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from statsmodels.tsa.arima.model import ARIMA
from datetime import datetime, timedelta
import pandas as pd
from scipy import stats
from statsmodels.tsa.seasonal import seasonal_decompose

class LinregressResult(NamedTuple):
    slope: float
    intercept: float
    rvalue: float
    pvalue: float
    stderr: float

# Enhanced training data with more examples
TRAINING_DATA = [
    # Food
    ("Domino's Pizza", "Food"),
    ("KFC", "Food"),
    ("Grocery shopping at Carrefour", "Food"),
    ("McDonald's", "Food"),
    ("Subway", "Food"),
    ("Lidl", "Food"),
    ("Restaurant", "Food"),
    ("Cafe", "Food"),
    ("Sushi", "Food"),
    ("Burger King", "Food"),
    ("Pizza Hut", "Food"),
    ("Local market", "Food"),
    ("Bakery", "Food"),
    ("Coffee shop", "Food"),
    
    # Transportation
    ("Uber ride", "Transport"),
    ("Bus ticket", "Transport"),
    ("Train pass", "Transport"),
    ("Gas station", "Transport"),
    ("Taxi", "Transport"),
    ("Monthly bus pass", "Transport"),
    ("Fuel", "Transport"),
    ("Airport transfer", "Transport"),
    ("Car rental", "Transport"),
    ("Bike rental", "Transport"),
    ("Parking fee", "Transport"),
    ("Public transport", "Transport"),
    
    # Shopping
    ("H&M", "Shopping"),
    ("Zara", "Shopping"),
    ("Amazon", "Shopping"),
    ("Nike", "Shopping"),
    ("Adidas", "Shopping"),
    ("IKEA", "Shopping"),
    ("Clothing", "Shopping"),
    ("Electronics", "Shopping"),
    ("Furniture", "Shopping"),
    ("Department store", "Shopping"),
    ("Online shopping", "Shopping"),
    ("Gift shop", "Shopping"),
    
    # Entertainment
    ("Netflix", "Entertainment"),
    ("Spotify", "Entertainment"),
    ("Cinema", "Entertainment"),
    ("Theater", "Entertainment"),
    ("Concert", "Entertainment"),
    ("Disney+", "Entertainment"),
    ("Video games", "Entertainment"),
    ("Books", "Entertainment"),
    ("Museum", "Entertainment"),
    ("Sports event", "Entertainment"),
    ("Theme park", "Entertainment"),
    
    # Utilities
    ("Electricity bill", "Utilities"),
    ("Water bill", "Utilities"),
    ("Internet bill", "Utilities"),
    ("Phone bill", "Utilities"),
    ("Gas bill", "Utilities"),
    ("Rent", "Utilities"),
    ("Home insurance", "Utilities"),
    ("Property tax", "Utilities"),
    ("Maintenance", "Utilities"),
    ("Cleaning service", "Utilities"),
    
    # Health
    ("Pharmacy", "Health"),
    ("Doctor", "Health"),
    ("Medicine", "Health"),
    ("Gym membership", "Health"),
    ("Dental", "Health"),
    ("Health insurance", "Health"),
    ("Medical supplies", "Health"),
    ("Fitness class", "Health"),
    ("Yoga", "Health"),
    ("Massage", "Health")
]

CATEGORIES = [category for _, category in set(TRAINING_DATA)]

class ExpenseAI:
    def __init__(self):
        # Initialize ML model for category prediction
        self.category_model = self._train_category_model()
        
    def _train_category_model(self) -> Pipeline:
        """Train a machine learning model for category prediction"""
        descriptions = [desc for desc, _ in TRAINING_DATA]
        categories = [cat for _, cat in TRAINING_DATA]
        
        model = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=1000)),
            ('clf', MultinomialNB(alpha=0.1))
        ])
        
        model.fit(descriptions, categories)
        return model

    def predict_category(self, description: str) -> Dict[str, Any]:
        """Predict expense category using ML model with enhanced confidence scoring"""
        try:
            predicted_category = self.category_model.predict([description])[0]
            probabilities = self.category_model.predict_proba([description])[0]
            confidence = max(probabilities)
            
            # Enhance confidence based on description length and keywords
            description_length = len(description.split())
            length_factor = min(description_length / 5, 1.0)
            confidence = confidence * (0.7 + 0.3 * length_factor)
            
            return {
                'category': predicted_category,
                'confidence': float(confidence),
                'ai_tagged': True,
                'suggested_categories': [
                    {'category': cat, 'confidence': float(prob)}
                    for cat, prob in zip(self.category_model.classes_, probabilities)
                    if prob > 0.1
                ]
            }
        except Exception as e:
            # Fallback to keyword-based approach
            return self._keyword_based_prediction(description)

    def _keyword_based_prediction(self, description: str) -> Dict[str, Any]:
        """Fallback keyword-based prediction"""
        description = description.lower()
        category_keywords = {
            'Food': ["food", "restaurant", "pizza", "kfc", "mcdonalds", "grocery", "cafe", "subway", "lidl", "carrefour"],
            'Transport': ["uber", "taxi", "bus", "train", "transport", "fuel", "gas station"],
            'Shopping': ["shopping", "store", "mall", "h&m", "zara", "amazon", "nike", "adidas", "ikea", "clothing"],
            'Entertainment': ["netflix", "spotify", "movie", "cinema", "theater", "concert", "disney+"],
            'Utilities': ["bill", "utility", "electricity", "water", "gas", "internet", "phone"],
            'Health': ["pharmacy", "doctor", "health", "medical", "medicine", "gym", "dental"]
        }
        
        for category, keywords in category_keywords.items():
            if any(keyword in description for keyword in keywords):
                return {
                    'category': category,
                    'confidence': 0.8,
                    'ai_tagged': True
                }
        
        return {
            'category': "Other",
            'confidence': 0.5,
            'ai_tagged': True
        }

    def predict_future_expenses(self, expenses: Sequence[Dict[str, Any]], days: int = 30) -> Dict[str, Any]:
        """Predict future expenses using advanced time series analysis"""
        if not expenses:
            return {'error': 'No expenses data available'}

        try:
            df = pd.DataFrame(expenses)
            df['date'] = pd.to_datetime(df['date'])
            df = df.set_index('date')
            
            # Create multiple time series for different categories
            category_series = {}
            for category in df['category'].unique():
                category_df = df[df['category'] == category]
                daily_amounts = category_df['amount'].resample('D').sum().fillna(0)
                category_series[category] = daily_amounts

            # Generate predictions for each category
            predictions = {}
            for category, series in category_series.items():
                if len(series) > 2:
                    model = ARIMA(series, order=(2,1,2))
                    model_fit = model.fit()
                    forecast = model_fit.forecast(steps=days)
                    conf_int = model_fit.get_forecast(steps=days).conf_int()
                    
                    predictions[category] = {
                        'predictions': forecast.values.tolist(),
                        'confidence_intervals': list(zip(
                            conf_int.iloc[:, 0].values.tolist(),
                            conf_int.iloc[:, 1].values.tolist()
                        ))
                    }

            # Combine category predictions
            total_predictions = []
            for i in range(days):
                day_total = sum(pred['predictions'][i] for pred in predictions.values())
                total_predictions.append(day_total)

            return {
                'predictions': total_predictions,
                'category_predictions': predictions,
                'model_metrics': {
                    'aic': {cat: float(model_fit.aic) for cat, model_fit in predictions.items()},
                    'bic': {cat: float(model_fit.bic) for cat, model_fit in predictions.items()}
                }
            }
        except Exception as e:
            # Fallback to simple average prediction
            return self._simple_average_prediction(expenses, days)

    def _simple_average_prediction(self, expenses: Sequence[Dict[str, Any]], days: int) -> Dict[str, Any]:
        """Fallback to simple average prediction"""
        amounts = [exp['amount'] for exp in expenses]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        predictions = [avg_amount] * days

        return {
            'predictions': predictions,
            'confidence_intervals': [(p * 0.9, p * 1.1) for p in predictions],
            'model_metrics': {'method': 'simple_average'}
        }

    def _calculate_trend(self, values: Union[pd.Series, np.ndarray]) -> Dict[str, float]:
        """Calculate trend using simple linear regression"""
        if len(values) < 2:
            return {'slope': 0.0, 'r_squared': 0.0}
            
        x = np.arange(len(values))
        y = np.array(values, dtype=float)  # Convert to numpy array explicitly
        
        # Calculate means
        x_mean = x.mean()
        y_mean = y.mean()
        
        # Calculate slope
        numerator = np.sum((x - x_mean) * (y - y_mean))
        denominator = np.sum((x - x_mean) ** 2)
        
        if denominator == 0:
            return {'slope': 0.0, 'r_squared': 0.0}
            
        slope = numerator / denominator
        
        # Calculate R-squared
        y_pred = slope * x + (y_mean - slope * x_mean)
        ss_tot = np.sum((y - y_mean) ** 2)
        ss_res = np.sum((y - y_pred) ** 2)
        
        r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0.0
        
        return {
            'slope': float(slope),
            'r_squared': float(r_squared)
        }

    def analyze_spending_patterns(self, expenses: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze spending patterns with advanced statistical analysis"""
        if not expenses:
            return {'error': 'No expenses data available'}

        df = pd.DataFrame(expenses)
        df['date'] = pd.to_datetime(df['date'])
        
        # Enhanced daily spending analysis
        daily_spending = df.groupby('date')['amount'].sum()
        weekly_spending = daily_spending.resample('W').sum()
        monthly_spending = daily_spending.resample('M').sum()
        
        # Calculate spending trends with our custom method
        daily_trend = self._calculate_trend(np.array(daily_spending.values))
        weekly_trend = self._calculate_trend(np.array(weekly_spending.values))
        monthly_trend = self._calculate_trend(np.array(monthly_spending.values))
        
        # Enhanced category analysis
        category_dist = df.groupby('category')['amount'].sum()
        total_spent = category_dist.sum()
        category_percentages = (category_dist / total_spent * 100).round(2)
        
        # Detect unusual spending with statistical methods
        unusual_spending = []
        for category in df['category'].unique():
            category_expenses = df[df['category'] == category]['amount']
            if len(category_expenses) > 1:
                z_scores = stats.zscore(category_expenses)
                unusual_indices = np.where(np.abs(z_scores) > 2)[0]
                for idx in unusual_indices:
                    expense = df[df['category'] == category].iloc[idx]
                    unusual_spending.append({
                        'amount': float(expense['amount']),
                        'description': expense['description'],
                        'category': category,
                        'date': expense['date'].strftime('%Y-%m-%d'),
                        'z_score': float(z_scores[idx])
                    })
        
        # Calculate spending volatility
        daily_volatility = daily_spending.std()
        weekly_volatility = weekly_spending.std()
        monthly_volatility = monthly_spending.std()
        
        # Identify spending patterns
        patterns = {
            'daily_pattern': self._identify_daily_pattern(daily_spending),
            'weekly_pattern': self._identify_weekly_pattern(weekly_spending),
            'monthly_pattern': self._identify_monthly_pattern(monthly_spending)
        }
        
        return {
            'total_spent': float(total_spent),
            'category_distribution': category_percentages.to_dict(),
            'unusual_spending': unusual_spending,
            'spending_trends': {
                'daily': {'slope': daily_trend['slope'], 'confidence': daily_trend['r_squared']},
                'weekly': {'slope': weekly_trend['slope'], 'confidence': weekly_trend['r_squared']},
                'monthly': {'slope': monthly_trend['slope'], 'confidence': monthly_trend['r_squared']}
            },
            'spending_volatility': {
                'daily': float(daily_volatility),
                'weekly': float(weekly_volatility),
                'monthly': float(monthly_volatility)
            },
            'patterns': patterns,
            'average_daily_spending': float(daily_spending.mean()),
            'average_weekly_spending': float(weekly_spending.mean()),
            'average_monthly_spending': float(monthly_spending.mean())
        }

    def _identify_daily_pattern(self, daily_spending: pd.Series) -> Dict[str, Any]:
        """Identify daily spending patterns"""
        if isinstance(daily_spending.index, pd.DatetimeIndex):
            weekday_spending = daily_spending.groupby(daily_spending.index.dayofweek).mean()
        else:
            weekday_spending = daily_spending.groupby(daily_spending.index).mean()
            
        return {
            'highest_spending_day': int(weekday_spending.idxmax()),
            'lowest_spending_day': int(weekday_spending.idxmin()),
            'daily_averages': weekday_spending.to_dict()
        }

    def _identify_weekly_pattern(self, weekly_spending: pd.Series) -> Dict[str, Any]:
        """Identify weekly spending patterns"""
        trend_result: Tuple[float, float, float, float, float] = stats.linregress(range(len(weekly_spending)), weekly_spending.values)
        return {
            'trend': trend_result[0],  # slope
            'volatility': float(weekly_spending.std()),
            'average': float(weekly_spending.mean())
        }

    def _identify_monthly_pattern(self, monthly_spending: pd.Series) -> Dict[str, Any]:
        """Identify monthly spending patterns"""
        trend_result: Tuple[float, float, float, float, float] = stats.linregress(range(len(monthly_spending)), monthly_spending.values)
        return {
            'trend': trend_result[0],  # slope
            'volatility': float(monthly_spending.std()),
            'average': float(monthly_spending.mean()),
            'seasonality': self._detect_seasonality(monthly_spending)
        }

    def _detect_seasonality(self, series: pd.Series) -> Dict[str, Any]:
        """Detect seasonal patterns in spending"""
        try:
            decomposition = seasonal_decompose(series, model='additive', period=12)
            return {
                'seasonal_strength': float(np.abs(decomposition.seasonal).mean()),
                'trend_strength': float(np.abs(decomposition.trend).mean()),
                'residual_strength': float(np.abs(decomposition.resid).mean())
            }
        except:
            return {'error': 'Insufficient data for seasonality analysis'}

    def process_chat_query(self, query: str, expenses: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
        """Process natural language queries with enhanced understanding"""
        if not expenses:
            return {'message': 'No expenses found in your history.'}

        df = pd.DataFrame(expenses)
        df['date'] = pd.to_datetime(df['date'])
        
        # Enhanced query understanding
        query = query.lower()
        
        if 'total' in query:
            total = df['amount'].sum()
            return {
                'amount': float(total),
                'message': f"Your total spending is €{total:.2f}.",
                'breakdown': {
                    'by_category': df.groupby('category')['amount'].sum().to_dict(),
                    'by_month': df.groupby(df['date'].dt.to_period('M'))['amount'].sum().to_dict()
                }
            }
        elif 'category' in query:
            category_totals = df.groupby('category')['amount'].sum()
            return {
                'amount': float(category_totals.sum()),
                'message': f"Category-wise spending: {category_totals.to_dict()}",
                'recommendations': self._generate_category_recommendations(category_totals)
            }
        elif 'trend' in query:
            daily_spending = df.groupby('date')['amount'].sum()
            trend = self._calculate_trend(np.array(daily_spending.values))
            return {
                'amount': trend['slope'],
                'message': f"Your spending is {'increasing' if trend['slope'] > 0 else 'decreasing'} by €{abs(trend['slope']):.2f} per day on average.",
                'confidence': trend['r_squared']
            }
        else:
            # Try to understand the query using keywords
            analysis = self.analyze_spending_patterns(expenses)
            return {
                'message': self._generate_insightful_response(query, analysis),
                'analysis': analysis
            }

    def _generate_category_recommendations(self, category_totals: pd.Series) -> List[Dict[str, Any]]:
        """Generate recommendations based on category spending"""
        total = category_totals.sum()
        recommendations = []
        
        for category, amount in category_totals.items():
            percentage = (amount / total) * 100
            if percentage > 30:
                recommendations.append({
                    'category': category,
                    'current_percentage': float(percentage),
                    'recommendation': f"Consider reducing spending in {category} as it accounts for {percentage:.1f}% of your total expenses.",
                    'suggested_percentage': 25.0
                })
        
        return recommendations

    def _generate_insightful_response(self, query: str, analysis: Dict[str, Any]) -> str:
        """Generate an insightful response based on the analysis"""
        response = []
        
        # Add overall spending summary
        response.append(f"Your total spending is €{analysis['total_spent']:.2f}.")
        
        # Add trend information
        if analysis['spending_trends']['monthly']['slope'] > 0:
            response.append(f"Your spending is increasing by €{analysis['spending_trends']['monthly']['slope']:.2f} per month.")
        else:
            response.append(f"Your spending is decreasing by €{abs(analysis['spending_trends']['monthly']['slope']):.2f} per month.")
        
        # Add category insights
        top_category = max(analysis['category_distribution'].items(), key=lambda x: x[1])
        response.append(f"Your highest spending category is {top_category[0]} at {top_category[1]:.1f}% of total expenses.")
        
        # Add unusual spending alerts
        if analysis['unusual_spending']:
            response.append("You have some unusual spending patterns that might need attention.")
        
        return " ".join(response)

# Initialize the AI module
expense_ai = ExpenseAI() 