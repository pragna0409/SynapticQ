import os
import requests
import json
import time
from typing import Dict, Any, Optional

class AIClient:
    """
    Multi-provider AI client with automatic fallback.
    Tries Gemini first, then Claude, then OpenAI if rate limits are hit.
    """
    
    def __init__(self):
        # API Keys
        self.gemini_key = os.getenv('GOOGLE_API_KEY', '').strip()
        self.claude_key = os.getenv('ANTHROPIC_API_KEY', '').strip()
        self.openai_key = os.getenv('OPENAI_API_KEY', '').strip()
        
        # API URLs
        self.gemini_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent"
        self.claude_url = "https://api.anthropic.com/v1/messages"
        self.openai_url = "https://api.openai.com/v1/chat/completions"
        
        # Provider order for fallback
        self.providers = []
        if self.gemini_key:
            self.providers.append('gemini')
        if self.claude_key:
            self.providers.append('claude')
        if self.openai_key:
            self.providers.append('openai')
        
        if not self.providers:
            raise ValueError("No AI provider API keys configured. Please set at least one of: GOOGLE_API_KEY, ANTHROPIC_API_KEY, or OPENAI_API_KEY")
    
    def generate_content(self, prompt: str, max_retries: int = 1) -> str:
        """
        Generate content using available AI providers with automatic fallback.
        
        Args:
            prompt: The prompt to send to the AI
            max_retries: Number of retries per provider before falling back
            
        Returns:
            The generated text response
            
        Raises:
            Exception: If all providers fail
        """
        last_error = None
        
        for provider in self.providers:
            try:
                print(f"Attempting to use {provider.upper()} API...")
                
                if provider == 'gemini':
                    return self._call_gemini(prompt, max_retries)
                elif provider == 'claude':
                    return self._call_claude(prompt, max_retries)
                elif provider == 'openai':
                    return self._call_openai(prompt, max_retries)
                    
            except Exception as e:
                error_msg = str(e)
                print(f"{provider.upper()} failed: {error_msg}")
                last_error = error_msg
                
                # If it's a rate limit error, try next provider
                if "rate limit" in error_msg.lower() or "429" in error_msg:
                    print(f"Rate limit hit on {provider.upper()}, falling back to next provider...")
                    continue
                # If it's an auth error, skip to next provider
                elif "401" in error_msg or "403" in error_msg or "invalid" in error_msg.lower():
                    print(f"Authentication failed for {provider.upper()}, trying next provider...")
                    continue
                # For other errors, also try next provider
                else:
                    print(f"Error with {provider.upper()}, trying next provider...")
                    continue
        
        # All providers failed
        raise Exception(f"All AI providers failed. Last error: {last_error}")
    
    def _call_gemini(self, prompt: str, max_retries: int) -> str:
        """Call Google Gemini API"""
        for attempt in range(max_retries):
            try:
                payload = {
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }]
                }
                
                headers = {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': self.gemini_key
                }
                
                response = requests.post(self.gemini_url, json=payload, headers=headers, timeout=120)
                
                # Handle rate limit with retry
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = 2 * (2 ** attempt)  # Exponential backoff
                        print(f"Gemini rate limit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("Gemini API rate limit exceeded")
                
                response.raise_for_status()
                result = response.json()
                return result['candidates'][0]['content']['parts'][0]['text'].strip()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:
                    raise Exception("Gemini API rate limit exceeded")
                elif response.status_code == 401:
                    raise Exception("Invalid Gemini API key")
                elif response.status_code == 403:
                    raise Exception("Gemini API access forbidden")
                else:
                    raise Exception(f"Gemini API error (Status {response.status_code}): {response.text[:200]}")
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 * (2 ** attempt)
                    print(f"Gemini error. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                raise Exception(f"Gemini API failed: {str(e)}")
        
        raise Exception("Gemini API failed after all retries")
    
    def _call_claude(self, prompt: str, max_retries: int) -> str:
        """Call Anthropic Claude API"""
        for attempt in range(max_retries):
            try:
                payload = {
                    "model": "claude-3-5-sonnet-20241022",
                    "max_tokens": 4096,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                }
                
                headers = {
                    'Content-Type': 'application/json',
                    'x-api-key': self.claude_key,
                    'anthropic-version': '2023-06-01'
                }
                
                response = requests.post(self.claude_url, json=payload, headers=headers, timeout=120)
                
                # Handle rate limit with retry
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = 2 * (2 ** attempt)
                        print(f"Claude rate limit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("Claude API rate limit exceeded")
                
                response.raise_for_status()
                result = response.json()
                return result['content'][0]['text'].strip()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:
                    raise Exception("Claude API rate limit exceeded")
                elif response.status_code == 401:
                    raise Exception("Invalid Claude API key")
                elif response.status_code == 403:
                    raise Exception("Claude API access forbidden")
                else:
                    raise Exception(f"Claude API error (Status {response.status_code}): {response.text[:200]}")
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 * (2 ** attempt)
                    print(f"Claude error. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                raise Exception(f"Claude API failed: {str(e)}")
        
        raise Exception("Claude API failed after all retries")
    
    def _call_openai(self, prompt: str, max_retries: int) -> str:
        """Call OpenAI API"""
        for attempt in range(max_retries):
            try:
                payload = {
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7
                }
                
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.openai_key}'
                }
                
                response = requests.post(self.openai_url, json=payload, headers=headers, timeout=120)
                
                # Handle rate limit with retry
                if response.status_code == 429:
                    if attempt < max_retries - 1:
                        wait_time = 2 * (2 ** attempt)
                        print(f"OpenAI rate limit. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise Exception("OpenAI API rate limit exceeded")
                
                response.raise_for_status()
                result = response.json()
                return result['choices'][0]['message']['content'].strip()
                
            except requests.exceptions.HTTPError as e:
                if response.status_code == 429:
                    raise Exception("OpenAI API rate limit exceeded")
                elif response.status_code == 401:
                    raise Exception("Invalid OpenAI API key")
                elif response.status_code == 403:
                    raise Exception("OpenAI API access forbidden")
                else:
                    raise Exception(f"OpenAI API error (Status {response.status_code}): {response.text[:200]}")
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 * (2 ** attempt)
                    print(f"OpenAI error. Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                raise Exception(f"OpenAI API failed: {str(e)}")
        
        raise Exception("OpenAI API failed after all retries")
