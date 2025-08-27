#!/usr/bin/env python3
"""
Workflow API testing script for TexPro AI Backend
Tests the batch workflow management endpoints
"""

import requests
import json
import sys
from datetime import date, timedelta

# API base URL
BASE_URL = "http://127.0.0.1:8000/api/v1"

def print_response(response, title):
    """Print formatted response"""
    print(f"\n{'='*50}")
    print(f"{title}")
    print(f"{'='*50}")
    print(f"Status Code: {response.status_code}")
    try:
        response_data = response.json()
        print(f"Response: {json.dumps(response_data, indent=2)}")
    except:
        print(f"Response Text: {response.text}")

def get_auth_token():
    """Get authentication token and user ID"""
    login_data = {
        "username": "Bah",
        "password": "admin123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    if response.status_code == 200:
        data = response.json().get('data', {})
        return data.get('access'), data.get('user', {}).get('id')
    return None, None

def test_create_batch(access_token):
    """Test creating a new batch workflow"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    batch_data = {
        "batch_code": "BATCH-001",
        "description": "Cotton textile batch for export",
        "start_date": str(date.today()),
        "end_date": str(date.today() + timedelta(days=30))
    }
    
    response = requests.post(f"{BASE_URL}/workflow/batches/", json=batch_data, headers=headers)
    print_response(response, "CREATE BATCH TEST")
    
    if response.status_code == 201:
        return response.json().get('data', {}).get('id')
    return None

def test_list_batches(access_token):
    """Test listing batch workflows"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/workflow/batches/", headers=headers)
    print_response(response, "LIST BATCHES TEST")

def test_get_batch_detail(access_token, batch_id):
    """Test getting batch workflow details"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/workflow/batches/{batch_id}/", headers=headers)
    print_response(response, "BATCH DETAIL TEST")

def test_update_batch(access_token, batch_id):
    """Test updating batch workflow"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    update_data = {
        "description": "Updated: Premium cotton textile batch for European market",
        "status": "in_progress"
    }
    
    response = requests.patch(f"{BASE_URL}/workflow/batches/{batch_id}/", json=update_data, headers=headers)
    print_response(response, "UPDATE BATCH TEST")

def test_start_batch(access_token, batch_id):
    """Test starting a batch workflow"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    start_data = {
        "start_date": str(date.today())
    }
    
    response = requests.post(f"{BASE_URL}/workflow/batches/{batch_id}/start/", json=start_data, headers=headers)
    print_response(response, "START BATCH TEST")

def test_batch_stats(access_token):
    """Test batch workflow statistics"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/workflow/stats/overview/", headers=headers)
    print_response(response, "BATCH STATS TEST")

def test_my_batches(access_token):
    """Test getting user's assigned batches"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/workflow/batches/my_batches/", headers=headers)
    print_response(response, "MY BATCHES TEST")

def test_dashboard(access_token):
    """Test getting dashboard data"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    response = requests.get(f"{BASE_URL}/workflow/stats/dashboard/", headers=headers)
    print_response(response, "DASHBOARD TEST")

def test_create_multiple_batches(access_token):
    """Test creating multiple batches with different statuses"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    batches = [
        {
            "batch_code": "BATCH-002",
            "description": "Silk textile batch",
            "start_date": str(date.today() - timedelta(days=5)),
            "end_date": str(date.today() + timedelta(days=25))
        },
        {
            "batch_code": "BATCH-003", 
            "description": "Wool textile batch",
            "start_date": str(date.today() - timedelta(days=10)),
            "end_date": str(date.today() - timedelta(days=1))  # Overdue batch
        },
        {
            "batch_code": "BATCH-004",
            "description": "Synthetic textile batch",
            "end_date": str(date.today() + timedelta(days=45))
        }
    ]
    
    created_batches = []
    for i, batch_data in enumerate(batches):
        response = requests.post(f"{BASE_URL}/workflow/batches/", json=batch_data, headers=headers)
        print_response(response, f"CREATE BATCH {i+2} TEST")
        
        if response.status_code == 201:
            batch_id = response.json().get('data', {}).get('id')
            created_batches.append(batch_id)
    
    return created_batches

def test_bulk_status_update(access_token, batch_ids):
    """Test bulk status update"""
    headers = {"Authorization": f"Bearer {access_token}"}
    
    bulk_data = {
        "batch_ids": batch_ids,
        "status": "in_progress"
    }
    
    response = requests.post(f"{BASE_URL}/workflow/batches/bulk_update_status/", json=bulk_data, headers=headers)
    print_response(response, "BULK STATUS UPDATE TEST")

def main():
    print("🚀 Starting TexPro AI Workflow API Tests")
    print(f"Testing against: {BASE_URL}")
    
    # Test 1: Get authentication token
    print("\n🔐 Getting authentication token...")
    access_token, user_id = get_auth_token()
    
    if not access_token:
        print("❌ Authentication failed! Cannot proceed with tests.")
        return
    
    print(f"✅ Authentication successful! User ID: {user_id}")
    
    # Test 2: Create a batch workflow
    print("\n📦 Testing batch creation...")
    batch_id = test_create_batch(access_token)
    
    if not batch_id:
        print("❌ Batch creation failed!")
        return
    
    print(f"✅ Batch created successfully with ID: {batch_id}")
    
    # Test 3: List batches
    print("\n📋 Testing batch listing...")
    test_list_batches(access_token)
    
    # Test 4: Get batch details
    print("\n🔍 Testing batch details...")
    test_get_batch_detail(access_token, batch_id)
    
    # Test 5: Update batch
    print("\n✏️ Testing batch update...")
    test_update_batch(access_token, batch_id)
    
    # Test 6: Start batch workflow
    print("\n▶️ Testing batch start...")
    test_start_batch(access_token, batch_id)
    
    # Test 7: Create multiple batches
    print("\n📦 Creating multiple test batches...")
    additional_batch_ids = test_create_multiple_batches(access_token)
    
    # Test 8: Batch statistics
    print("\n📊 Testing batch statistics...")
    test_batch_stats(access_token)
    
    # Test 9: My batches
    print("\n👤 Testing user's assigned batches...")
    test_my_batches(access_token)
    
    # Test 10: Dashboard
    print("\n🎛️ Testing dashboard data...")
    test_dashboard(access_token)
    
    # Test 11: Bulk status update
    if additional_batch_ids:
        print("\n🔄 Testing bulk status update...")
        test_bulk_status_update(access_token, additional_batch_ids[:2])
    
    print(f"\n{'='*50}")
    print("🎉 Workflow API Tests Completed!")
    print(f"{'='*50}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n\n❌ Error during testing: {e}")
