"""
Test routing by checking unauthenticated response code
"""
import requests

base_url = "http://localhost:8000/api/attendance"
endpoints = [
    "/exports/daily/",
    "/test-simple/", # This one doesn't exist anymore, I removed it
    "/monthly-advanced/"
]

print("Testing endpoints without auth...")
for ep in endpoints:
    url = f"{base_url}{ep}"
    print(f"\nTesting: {url}")
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        if response.status_code == 404:
            print("Response: 404 Not Found (Likely routing issue or object not found)")
        elif response.status_code == 401:
            print("Response: 401 Unauthorized (Routing OK, Auth required)")
        else:
            print(f"Response: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")
