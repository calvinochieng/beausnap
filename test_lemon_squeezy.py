#!/usr/bin/env python
"""
Lemon Squeezy API Test Script
Run this to debug your Lemon Squeezy integration.
Usage: python test_lemon_squeezy.py
"""

import os
import sys
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'beausnap.settings')
django.setup()

from django.conf import settings

def test_api_connectivity():
    """Test basic API connectivity and permissions"""
    print("🔍 Testing Lemon Squeezy API Integration")
    print("=" * 50)

    if not settings.LEMONSQUEEZY_API_KEY:
        print("❌ LEMONSQUEEZY_API_KEY not found in settings")
        return False

    headers = {
        'Authorization': f'Bearer {settings.LEMONSQUEEZY_API_KEY}',
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
    }

    print(f"API Key configured: {'✅' if settings.LEMONSQUEEZY_API_KEY else '❌'}")
    print(f"Store ID: {settings.LEMONSQUEEZY_STORE_ID}")
    print(f"Lifetime Product ID: {settings.LEMONSQUEEZY_PRODUCTS.get('one_time')}")
    print(f"Yearly Product ID: {settings.LEMONSQUEEZY_PRODUCTS.get('yearly')}")
    print()

    # Test 1: User API (checks basic auth)
    print("1. Testing User API (authentication)...")
    try:
        response = requests.get('https://api.lemonsqueezy.com/v1/user', headers=headers, timeout=10)
        if response.status_code == 200:
            print("   ✅ User API accessible")
        else:
            print(f"   ❌ User API failed: {response.status_code}")
            if 'text/html' in response.headers.get('content-type', ''):
                print("   🔍 HTML response suggests authentication issue")
    except Exception as e:
        print(f"   ❌ User API error: {e}")

    # Test 2: Variants API (checks read permissions)
    print("\n2. Testing Variants API (read permissions)...")
    try:
        response = requests.get('https://api.lemonsqueezy.com/v1/variants', headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            variants = data.get('data', [])
            print(f"   ✅ Variants API accessible - Found {len(variants)} variants")
            if variants:
                print("   📋 Your variant IDs:")
                for v in variants[:5]:  # Show first 5
                    attrs = v.get('attributes', {})
                    print(f"      ID: {v['id']} - Name: {attrs.get('name', 'Unknown')}")
        else:
            print(f"   ❌ Variants API failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Variants API error: {e}")

    # Test 3: Checkout creation (checks write permissions)
    print("\n3. Testing Checkout Creation (write permissions)...")

    # First update the .env with correct variant IDs
    print("   📝 Updating .env with correct variant IDs...")
    print("   💡 Your correct variant IDs are: 1000866, 1000877")
    print("   🔧 Update your .env file:")
    print("      LEMONSQUEEZY_LIFETIME_PRODUCT_ID=1000866")
    print("      LEMONSQUEEZY_YEARLY_PRODUCT_ID=1000877")

    # Test with product_id instead of variant_id
    print("\n   🔄 Trying with product_id instead of variant_id...")

    # First get product ID from variant
    try:
        variant_response = requests.get(f'https://api.lemonsqueezy.com/v1/variants/1000866', headers=headers, timeout=10)
        if variant_response.status_code == 200:
            variant_data = variant_response.json()
            product_id = variant_data.get('data', {}).get('relationships', {}).get('product', {}).get('data', {}).get('id')
            print(f"   📦 Found product ID: {product_id} for variant 1000866")

            if product_id:
                payload = {
                    "data": {
                        "type": "checkouts",
                        "attributes": {
                            "custom": {"user_id": 1},
                            "product_id": int(product_id),
                            "redirect_url": "https://example.com/success"
                        }
                    }
                }
                print(f"   📤 Using payload: {payload}")
            else:
                print("   ❌ Could not find product ID for variant")
                return
        else:
            print(f"   ❌ Could not get variant details: {variant_response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Error getting variant details: {e}")
        return

    try:
        response = requests.post('https://api.lemonsqueezy.com/v1/checkouts',
                               json=payload, headers=headers, timeout=10)

        if response.status_code == 201:
            print("   ✅ Checkout creation successful!")
            data = response.json()
            checkout_url = data['data']['attributes']['url']
            print(f"   🔗 Checkout URL: {checkout_url}")
        elif response.status_code == 404:
            print("   ❌ Variant/Product not found")
            print("   💡 Double-check the variant ID in your Lemon Squeezy dashboard")
        elif response.status_code == 403:
            print("   ❌ Insufficient permissions - API key lacks checkout creation rights")
            print("   🔑 Go to Lemon Squeezy → Settings → API → Enable 'Create checkouts'")
        elif response.status_code == 400:
            print("   ❌ Bad request - payload structure issue")
            if 'application/vnd.api+json' in response.headers.get('content-type', ''):
                data = response.json()
                for error in data.get('errors', []):
                    print(f"      {error.get('detail', 'Unknown error')}")
        else:
            print(f"   ❌ Checkout creation failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}...")

    except Exception as e:
        print(f"   ❌ Checkout creation error: {e}")

    print("\n" + "=" * 50)
    print("🎯 Next Steps:")
    print("1. If variants API works but checkout fails: Check API key permissions")
    print("2. If variants API fails: Check API key validity")
    print("3. If variant IDs are wrong: Update .env with correct IDs from above")
    print("4. Test checkout buttons in your app after fixing issues")

if __name__ == '__main__':
    test_api_connectivity()