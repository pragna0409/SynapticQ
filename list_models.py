import requests

response = requests.get(
    'https://generativelanguage.googleapis.com/v1beta/models',
    headers={'x-goog-api-key': 'AIzaSyBMwMoHCyJ-YmLoEi_4rUp2wAkiVwDPfvk'},
    timeout=10
)

print(f"Status: {response.status_code}\n")

if response.status_code == 200:
    models = response.json()
    print("Available models that support generateContent:\n")
    for model in models.get('models', []):
        if 'generateContent' in model.get('supportedGenerationMethods', []):
            print(f"  - {model['name']}")
else:
    print(f"Error: {response.text}")
