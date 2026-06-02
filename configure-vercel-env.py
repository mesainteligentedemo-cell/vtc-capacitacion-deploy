#!/usr/bin/env python3
"""
Configure VTC Vercel Environment Variables via API
Script to set up ElevenLabs and OpenRouter credentials

Usage:
    python3 configure-vercel-env.py --token <VERCEL_TOKEN>
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

# Configuration
PROJECT_SLUG = "vtc-capacitacion-deploy"
TEAM_ID = None  # Leave empty if using personal account

ENV_VARS = {
    "ELEVENLABS_API_KEY": "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67",
    "ELEVENLABS_AGENT_ID": "agent_5701kr0h5gg6eetb69tv6c5hwfj1",
}

def get_vercel_token():
    """Get Vercel token from environment or args"""
    parser = argparse.ArgumentParser(description="Configure VTC Vercel Environment")
    parser.add_argument("--token", help="Vercel API Token")
    args = parser.parse_args()

    if args.token:
        return args.token

    token = os.getenv("VERCEL_TOKEN")
    if token:
        return token

    print("❌ VERCEL_TOKEN not found!")
    print("\nTo get your token:")
    print("1. Go to: https://vercel.com/account/tokens")
    print("2. Click: Create New Token")
    print("3. Name: VTC Auto-Configure")
    print("4. Copy the token")
    print("\nThen run:")
    print(f"  python3 {sys.argv[0]} --token <YOUR_TOKEN>")
    print("\nOr set environment variable:")
    print("  export VERCEL_TOKEN=<YOUR_TOKEN>")
    sys.exit(1)

def api_call(method, endpoint, token, data=None):
    """Make API call to Vercel"""
    url = f"https://api.vercel.com{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        error = json.loads(e.read().decode('utf-8'))
        return {"error": error.get("message", str(e))}

def configure_env_vars(token):
    """Configure environment variables in Vercel"""

    print("═" * 65)
    print("VTC VERCEL ENVIRONMENT CONFIGURATION")
    print("═" * 65)
    print()

    # Get project info
    print("🔍 Fetching project information...")
    query = f"?slug={PROJECT_SLUG}"
    if TEAM_ID:
        query += f"&teamId={TEAM_ID}"

    project_response = api_call("GET", f"/v8/projects{query}", token)

    if "error" in project_response:
        print(f"❌ Error: {project_response['error']}")
        return False

    project_id = project_response.get("id")
    if not project_id:
        print("❌ Project not found!")
        return False

    print(f"✓ Project: {project_response['name']} (ID: {project_id})")
    print()

    # Configure each environment variable
    success_count = 0

    for var_name, var_value in ENV_VARS.items():
        print(f"Setting {var_name}...")

        env_endpoint = f"/v9/projects/{project_id}/env"

        # List existing env vars to check if it exists
        existing = api_call("GET", env_endpoint, token)

        if "error" not in existing:
            for env in existing.get("envs", []):
                if env.get("key") == var_name:
                    # Update existing
                    env_id = env.get("id")
                    update_response = api_call(
                        "PATCH",
                        f"{env_endpoint}/{env_id}",
                        token,
                        {
                            "value": var_value,
                            "target": ["production", "preview", "development"]
                        }
                    )
                    if "error" not in update_response:
                        print(f"  ✓ Updated {var_name}")
                        success_count += 1
                    else:
                        print(f"  ❌ Error: {update_response['error']}")
                    break
            else:
                # Create new
                create_response = api_call(
                    "POST",
                    env_endpoint,
                    token,
                    {
                        "key": var_name,
                        "value": var_value,
                        "target": ["production", "preview", "development"],
                        "type": "encrypted"
                    }
                )
                if "error" not in create_response:
                    print(f"  ✓ Created {var_name}")
                    success_count += 1
                else:
                    print(f"  ❌ Error: {create_response['error']}")
        else:
            print(f"  ❌ Error: {existing['error']}")

    print()

    # Ask for OpenRouter API Key
    print("OpenRouter API Key:")
    print("  (Optional, required for report generation)")
    openrouter_key = input("  Enter your OpenRouter API Key (or press Enter to skip): ").strip()

    if openrouter_key:
        print(f"Setting OPENROUTER_API_KEY...")
        env_endpoint = f"/v9/projects/{project_id}/env"

        create_response = api_call(
            "POST",
            env_endpoint,
            token,
            {
                "key": "OPENROUTER_API_KEY",
                "value": openrouter_key,
                "target": ["production", "preview", "development"],
                "type": "encrypted"
            }
        )
        if "error" not in create_response:
            print(f"  ✓ Created OPENROUTER_API_KEY")
            success_count += 1
        else:
            print(f"  ❌ Error: {create_response['error']}")

    print()
    print("─" * 65)
    print(f"✅ Successfully configured {success_count} environment variables!")
    print()
    print("Next steps:")
    print("1. Go to: https://vercel.com/dashboard/vtc-capacitacion-deploy")
    print("2. Click: Deployments")
    print("3. Click: Redeploy latest commit")
    print()
    return True

if __name__ == "__main__":
    token = get_vercel_token()
    configure_env_vars(token)
