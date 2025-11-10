#!/usr/bin/env python3
"""
Quick test script to verify MiniMax API connectivity
Run this before testing Aider to ensure API is working
"""

import os
import sys

try:
    import requests
except ImportError:
    print("ERROR: 'requests' library not found. Installing...")
    os.system(f"{sys.executable} -m pip install requests")
    import requests

def test_minimax_api():
    """Test MiniMax M2 API connection"""

    print("=" * 60)
    print("  MiniMax M2 API Connection Test")
    print("=" * 60)
    print()

    # Get API key from environment or user input
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key or api_key == "YOUR_MINIMAX_API_KEY_HERE":
        print("ERROR: OPENAI_API_KEY not set in environment")
        print()
        api_key = input("Enter your MiniMax API key: ").strip()
        if not api_key:
            print("ERROR: No API key provided")
            return False

    print(f"✓ Using API key: {api_key[:20]}...")
    print()

    # API endpoint
    base_url = "https://api.minimax.io/v1"
    endpoint = f"{base_url}/chat/completions"

    print(f"✓ Testing endpoint: {endpoint}")
    print()

    # Request headers
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Request body
    payload = {
        "model": "MiniMax-M2",
        "messages": [
            {"role": "user", "content": "Hello! Please respond with 'API test successful'"}
        ],
        "max_tokens": 50
    }

    print("Sending test request...")
    print()

    try:
        # Send request
        response = requests.post(
            endpoint,
            headers=headers,
            json=payload,
            timeout=30
        )

        print(f"Response Status Code: {response.status_code}")
        print()

        # Check response
        if response.status_code == 200:
            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                message = data["choices"][0]["message"]["content"]

                print("✅ SUCCESS! API is working!")
                print()
                print("Response from MiniMax M2:")
                print("-" * 60)
                print(message)
                print("-" * 60)
                print()

                # Show usage info
                if "usage" in data:
                    usage = data["usage"]
                    print("Token Usage:")
                    print(f"  Input tokens:  {usage.get('prompt_tokens', 0)}")
                    print(f"  Output tokens: {usage.get('completion_tokens', 0)}")
                    print(f"  Total tokens:  {usage.get('total_tokens', 0)}")

                print()
                print("✅ Your MiniMax API is ready for Aider!")
                return True
            else:
                print("❌ ERROR: Unexpected response format")
                print()
                print("Response body:")
                print(response.text)
                return False

        elif response.status_code == 401:
            print("❌ ERROR: 401 Unauthorized")
            print()
            print("Your API key is invalid or expired.")
            print("Please check your API key at: https://platform.minimax.io")
            return False

        elif response.status_code == 403:
            print("❌ ERROR: 403 Forbidden")
            print()
            print("Possible causes:")
            print("  - Account balance is $0 (please add credits)")
            print("  - API key doesn't have required permissions")
            print("  - Account is suspended")
            return False

        elif response.status_code == 404:
            print("❌ ERROR: 404 Not Found")
            print()
            print("The API endpoint doesn't exist or MiniMax service is down.")
            print("Check MiniMax status at: https://platform.minimax.io")
            return False

        elif response.status_code == 429:
            print("❌ ERROR: 429 Rate Limit Exceeded")
            print()
            print("You've hit the rate limit:")
            print("  - MiniMax-M2: 20 requests/minute")
            print("  - Wait a minute and try again")
            return False

        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print()
            print("Response:")
            print(response.text)
            return False

    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Connection failed")
        print()
        print("Possible causes:")
        print("  - No internet connection")
        print("  - Firewall blocking api.minimax.io")
        print("  - DNS resolution failure")
        print("  - MiniMax servers are down")
        print()
        print("Troubleshooting:")
        print("  1. Check your internet connection")
        print("  2. Try: ping api.minimax.io")
        print("  3. Check firewall settings")
        return False

    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out")
        print()
        print("The API didn't respond within 30 seconds.")
        print("MiniMax servers might be slow or overloaded.")
        return False

    except Exception as e:
        print(f"❌ ERROR: {type(e).__name__}")
        print()
        print(f"Details: {str(e)}")
        return False


if __name__ == "__main__":
    print()
    success = test_minimax_api()
    print()

    if success:
        print("=" * 60)
        print("  Next Step: Run Aider")
        print("=" * 60)
        print()
        print("You can now run Aider with:")
        print("  start-aider.bat")
        print()
        sys.exit(0)
    else:
        print("=" * 60)
        print("  Fix the errors above before running Aider")
        print("=" * 60)
        print()
        sys.exit(1)
