"""
Test script to verify AI provider fallback system
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

from services.ai_client import AIClient

def test_ai_client():
    """Test the AI client with a simple prompt"""
    print("=" * 60)
    print("Testing AI Provider Fallback System")
    print("=" * 60)
    
    # Initialize client
    client = AIClient()
    print(f"\n[OK] AI Client initialized successfully")
    print(f"[OK] Available providers: {', '.join(client.providers)}")
    
    # Test with a simple prompt
    test_prompt = "Say 'Hello! I am working correctly.' in exactly those words."
    
    print(f"\n[TEST] Testing with prompt: '{test_prompt}'")
    print("\nAttempting to generate content...")
    
    try:
        response = client.generate_content(test_prompt)
        print(f"\n[SUCCESS]!")
        print(f"Response: {response[:200]}")
        print("\n" + "=" * 60)
        print("AI Provider Fallback System is working correctly!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"\n[FAILED]!")
        print(f"Error: {str(e)}")
        print("\n" + "=" * 60)
        print("AI Provider Fallback System encountered an error")
        print("=" * 60)
        return False

if __name__ == "__main__":
    success = test_ai_client()
    exit(0 if success else 1)
