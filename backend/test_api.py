#!/usr/bin/env python3
"""
Simple API testing script for TexPro AI Backend
Tests the authentication and user management endpoints
"""

import requests
import json
import sys

# API base URL
BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_response(response, title):
    """Print formatted response"""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    try:
        response_data = response.json()
        print(f"Response: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")

def test_login():
    """Test login endpoint"""
    login_data = {
        "username": "Bah",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    print_response(response, "LOGIN TEST")
    
    if response.status_code == 200:
        data = response.json().get('data', {})
        return data.get('access')
    return None

def test_me_endpoint(access_token):
    """Test the /me endpoint"""
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(f"{BASE_URL}/auth/me/", headers=headers)
    print_response(response, "ME ENDPOINT TEST")

def test_user_list(access_token):
    """Test user list endpoint (admin only)"""
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(f"{BASE_URL}/users/", headers=headers)
    print_response(response, "USER LIST TEST")

def test_user_stats(access_token):
    """Test user stats endpoint"""
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    response = requests.get(f"{BASE_URL}/users/stats/", headers=headers)
    print_response(response, "USER STATS TEST")

def main():
    print("🚀 Starting TexPro AI Backend API Tests")
    print(f"Testing against: {BASE_URL}")
    
    # Test 1: Login
    print("\n📝 Testing Authentication...")
    access_token = test_login()
    
    if not access_token:
        print("❌ Login failed! Cannot proceed with authenticated tests.")
        return
    
    print("✅ Login successful!")
    
    # Test 2: Me endpoint
    print("\n👤 Testing user profile endpoint...")
    test_me_endpoint(access_token)
    
    # Test 3: User list (admin only)
    print("\n📋 Testing user list endpoint...")
    test_user_list(access_token)
    
    # Test 4: User stats
    print("\n📊 Testing user stats endpoint...")
    test_user_stats(access_token)
    
    print(f"\n{'='*50}")
    print("🎉 API Tests Completed!")
    print(f"{'='*50}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during testing: {e}")
