import requests
import sys

def test_url(url, name):
    print(f"\nTesting {name}: {url}")
    try:
        response = requests.get(url, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {response.headers}")
        if response.status_code == 200:
            print("SUCCESS!")
        elif response.status_code == 404:
            print("NOT FOUND (404)")
            # Print first 500 chars of content to see if it's Django or Vite 404
            print(f"Content preview: {response.text[:500]}")
        else:
            print(f"FAILED with {response.status_code}")
    except Exception as e:
        print(f"EXCEPTION: {e}")

if __name__ == "__main__":
    # Test Backend Direct
    test_url("http://127.0.0.1:8000/api/attendance/export/daily-advanced/?date=2025-11-30&format=pdf", "BACKEND DIRECT")
    
    # Test Frontend Proxy
    test_url("http://localhost:3000/api/attendance/export/daily-advanced/?date=2025-11-30&format=pdf", "FRONTEND PROXY")
