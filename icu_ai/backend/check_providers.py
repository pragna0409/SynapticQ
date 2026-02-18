import os
import sys
import requests
from dotenv import load_dotenv

# Force unbuffered output
sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

def test_gemini():
    print("\n--- Testing Gemini ---")
    key = os.getenv('GOOGLE_API_KEY')
    if not key:
        print("No Gemini key found")
        return False
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent"
    headers = {'Content-Type': 'application/json', 'x-goog-api-key': key}
    payload = {"contents": [{"parts": [{"text": "Hello"}]}]}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success")
            return True
        else:
            print(f"Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_claude():
    print("\n--- Testing Claude ---")
    key = os.getenv('ANTHROPIC_API_KEY')
    if not key:
        print("No Claude key found")
        return False
        
    url = "https://api.anthropic.com/v1/messages"
    headers = {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
    }
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 100,
        "messages": [{"role": "user", "content": "Hello"}]
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success")
            return True
        else:
            print(f"Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_openai():
    print("\n--- Testing OpenAI ---")
    key = os.getenv('OPENAI_API_KEY')
    if not key:
        print("No OpenAI key found")
        return False
        
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {key}'
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": "Hello"}],
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Success")
            return True
        else:
            print(f"Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    # Test Gemini with a longer prompt to simulate real usage
    print("\n--- Testing Gemini with Long Prompt ---")
    key = os.getenv('GOOGLE_API_KEY')
    if not key:
        print("No Gemini key found")
    else:
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent"
        headers = {'Content-Type': 'application/json', 'x-goog-api-key': key}
        
        long_prompt = """
        Evaluate this hackathon project:
        PROJECT NAME: HealthC
        DESCRIPTION: HealthC solves this problem by providing a centralized platform...
        (Simulating a long prompt...)
        
        Provide response in JSON format:
        {
            "score": 0,
            "analysis": "string"
        }
        """
        
        payload = {"contents": [{"parts": [{"text": long_prompt}]}]}
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                print("Success")
                print(f"Response: {response.text[:200]}...")
            else:
                print(f"Failed: {response.text[:500]}")
        except Exception as e:
            print(f"Error: {e}")

