import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join('icu_ai', '.env')
load_dotenv(dotenv_path=env_path)

GEMINI_KEY = os.getenv('GOOGLE_API_KEY', '').strip()
CLAUDE_KEY = os.getenv('ANTHROPIC_API_KEY', '').strip()
OPENAI_KEY = os.getenv('OPENAI_API_KEY', '').strip()

print("=" * 60)
print("TESTING API KEYS")
print("=" * 60)

# Test Gemini
print("\n1. Testing GEMINI API...")
print(f"   Key: {GEMINI_KEY[:20]}...")
try:
    gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    payload = {
        "contents": [{
            "parts": [{"text": "Say hello"}]
        }]
    }
    headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_KEY
    }
    response = requests.post(gemini_url, json=payload, headers=headers, timeout=10)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print("   [OK] GEMINI: WORKING")
        result = response.json()
        print(f"   Response: {result['candidates'][0]['content']['parts'][0]['text'][:50]}...")
    else:
        print(f"   [FAIL] GEMINI: FAILED")
        print(f"   Error: {response.text[:200]}")
except Exception as e:
    print(f"   [ERROR] GEMINI: ERROR - {str(e)}")

# Test Claude
print("\n2. Testing CLAUDE API...")
print(f"   Key: {CLAUDE_KEY[:20]}...")
try:
    claude_url = "https://api.anthropic.com/v1/messages"
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 100,
        "messages": [{"role": "user", "content": "Say hello"}]
    }
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01'
    }
    response = requests.post(claude_url, json=payload, headers=headers, timeout=10)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print("   [OK] CLAUDE: WORKING")
        result = response.json()
        print(f"   Response: {result['content'][0]['text'][:50]}...")
    else:
        print("   [FAIL] CLAUDE: FAILED")
        print(f"   Error: {response.text[:200]}")
except Exception as e:
    print(f"   [ERROR] CLAUDE: ERROR - {str(e)}")

# Test OpenAI
print("\n3. Testing OPENAI API...")
print(f"   Key: {OPENAI_KEY[:20]}...")
try:
    openai_url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Say hello"}],
        "max_tokens": 50
    }
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {OPENAI_KEY}'
    }
    response = requests.post(openai_url, json=payload, headers=headers, timeout=10)
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print("   [OK] OPENAI: WORKING")
        result = response.json()
        print(f"   Response: {result['choices'][0]['message']['content'][:50]}...")
    else:
        print("   [FAIL] OPENAI: FAILED")
        print(f"   Error: {response.text[:200]}")
except Exception as e:
    print(f"   [ERROR] OPENAI: ERROR - {str(e)}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
