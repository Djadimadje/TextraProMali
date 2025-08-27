"""
Simple test script to verify analytics endpoints
"""

import requests
import json

def test_analytics_endpoints():
    """Test analytics endpoints"""
    base_url = "http://127.0.0.1:8000"
    
    endpoints = [
        "/api/v1/analytics/production/",
        "/api/v1/analytics/machines/", 
        "/api/v1/analytics/maintenance/",
        "/api/v1/analytics/quality/",
        "/api/v1/analytics/allocation/",
        "/api/v1/analytics/dashboard/",
        "/api/v1/analytics/health/"
    ]
    
    print("Testing Analytics Endpoints...")
    print("=" * 50)
    
    for endpoint in endpoints:
        url = base_url + endpoint
        try:
            response = requests.get(url, timeout=5)
            print(f"GET {endpoint}")
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Success: {data.get('message', 'OK')}")
            elif response.status_code == 403:
                print("Authentication required")
            else:
                print(f"Error: {response.text}")
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        
        print("-" * 30)

if __name__ == "__main__":
    test_analytics_endpoints()
