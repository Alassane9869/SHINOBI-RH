import requests
from datetime import date

# Test avec authentification
url = "http://127.0.0.1:8000/api/attendance/exports/daily/"
params = {
    'date': date.today().strftime('%Y-%m-%d'),
    'format': 'pdf'
}

print("Testing export endpoint...")
print(f"URL: {url}")
print(f"Params: {params}")
print()

# Test sans auth (devrait retourner 401)
response = requests.get(url, params=params)
print(f"Status without auth: {response.status_code}")
print(f"Response headers: {dict(response.headers)}")
print()

if response.status_code == 401:
    print("✓ Endpoint is accessible (returns 401 as expected without auth)")
elif response.status_code == 404:
    print("✗ Endpoint not found (404)")
    print(f"Response text: {response.text[:500]}")
else:
    print(f"? Unexpected status: {response.status_code}")
    print(f"Response text: {response.text[:500]}")
