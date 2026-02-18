import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"API Key loaded: {api_key[:20]}..." if api_key else "No API key found!")

# Test with gemini-2.0-flash (correct model)
url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

payload = {
    "contents": [{
        "parts": [{"text": "Say hello in one sentence"}]
    }]
}

headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': api_key
}

print(f"\nTesting API with URL: {url}")
print(f"Sending request...")

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ SUCCESS! API is working!")
        print(f"Response: {result['candidates'][0]['content']['parts'][0]['text']}")
    else:
        print(f"\n❌ ERROR!")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"\n❌ EXCEPTION: {str(e)}")
