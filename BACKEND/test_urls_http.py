"""
Quick URL test - check if the export endpoints are accessible
"""
import requests

base_url = "http://localhost:8000"

# Test without auth first to see the error
print("Testing export endpoints...")
print("="*60)

endpoints = [
    "/api/attendance/daily-advanced/?date=2025-11-30&format=pdf",
    "/api/attendance/monthly-advanced/?month=11&year=2025&format=pdf",
]

for endpoint in endpoints:
    url = base_url + endpoint
    print(f"\nTesting: {endpoint}")
    try:
        response = requests.get(url)
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('content-type', 'N/A')}")
        if response.status_code != 200:
            print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"  Error: {e}")
