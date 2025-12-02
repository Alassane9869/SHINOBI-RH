"""
Test the simple view
"""
import requests

url = "http://localhost:8000/api/attendance/test-simple/"
print(f"Testing: {url}")

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(f"Content: {response.text}")
except Exception as e:
    print(f"Error: {e}")
