import requests
from datetime import date

url = "http://127.0.0.1:8000/api/attendance/exports/daily/"
params = {
    'date': date.today().strftime('%Y-%m-%d'),
    'format': 'pdf'
}

print(f"Testing: {url}")
print(f"Params: {params}")
print()

response = requests.get(url, params=params)
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.headers.get('Content-Type')}")
print(f"Content-Length: {len(response.content)} bytes")

if response.status_code == 200:
    print("✓ SUCCESS - Export generated!")
    with open('test_export.pdf', 'wb') as f:
        f.write(response.content)
    print("  Saved to test_export.pdf")
elif response.status_code == 401:
    print("⚠ Unauthorized (expected without auth)")
elif response.status_code == 404:
    print("✗ Not Found")
    print(f"Response: {response.text[:500]}")
else:
    print(f"? Unexpected status")
    print(f"Response: {response.text[:500]}")
