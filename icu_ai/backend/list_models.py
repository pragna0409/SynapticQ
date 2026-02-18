import requests
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('GOOGLE_API_KEY')
print(f"API Key: {api_key[:25]}...")

# List available models
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

print("\nListing available models...")
response = requests.get(url)
print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    result = response.json()
    models = result.get('models', [])
    print(f"Found {len(models)} models:\n")
    for model in models:
        name = model.get('name', '')
        methods = model.get('supportedGenerationMethods', [])
        if 'generateContent' in methods:
            print(f"  OK {name}")
else:
    print(f"Error: {response.text[:500]}")
