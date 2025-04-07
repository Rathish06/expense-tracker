import requests
import json

def test_registration():
    url = 'http://localhost:5000/api/auth/register'
    data = {
        'email': 'test@example.com',
        'password': 'test123456',
        'name': 'Test User'
    }
    
    try:
        print("Sending registration request...")
        print(f"Request data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        try:
            print(f"Response Body: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Raw Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the Flask server is running on port 5000.")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_registration() 