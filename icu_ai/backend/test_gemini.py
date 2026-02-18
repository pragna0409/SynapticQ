import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"Testing: {api_key[:25]}...")

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

payload = {
    "contents": [{
        "parts": [{"text": "Say hello in one word"}]
    }]
}

headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': api_key
}

print("Testing gemini-2.5-flash...")
response = requests.post(url, json=payload, headers=headers)
print(f"Status: {response.status_code}")
if response.status_code == 200:
    print("SUCCESS! IT WORKS!")
    result = response.json()
    print(f"AI says: {result['candidates'][0]['content']['parts'][0]['text']}")
else:
    print(f"Error: {response.text[:300]}")
