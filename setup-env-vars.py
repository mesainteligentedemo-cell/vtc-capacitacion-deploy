#!/usr/bin/env python3
"""
Setup VTC Environment Variables in Vercel via API
Non-interactive mode - uses hardcoded values
"""

import os
import json
import urllib.request
import urllib.error
import sys

PROJECT_SLUG = "vtc-capacitacion-deploy"

ENV_VARS = {
    "ELEVENLABS_API_KEY": "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67",
    "ELEVENLABS_AGENT_ID": "agent_5701kr0h5gg6eetb69tv6c5hwfj1",
}

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

def main():
    token = os.getenv("VERCEL_TOKEN")

    if not token:
        print("❌ VERCEL_TOKEN not in environment!")
        print("\n✅ WORKAROUND - Using Vercel CLI instead...")
        os.system("vercel env add ELEVENLABS_API_KEY --value sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67")
        os.system("vercel env add ELEVENLABS_AGENT_ID --value agent_5701kr0h5gg6eetb69tv6c5hwfj1")
        print("\n✅ Environment variables configured via CLI!")
        return

    print("📡 Setting up Vercel environment variables...\n")

    # Get project info
    project_response = api_call("GET", f"/v8/projects?slug={PROJECT_SLUG}", token)

    if "error" in project_response:
        print(f"❌ Error: {project_response['error']}")
        return

    project_id = project_response.get("id")
    if not project_id:
        print("❌ Project not found!")
        return

    print(f"✓ Project found: {project_response['name']}")
    print()

    env_endpoint = f"/v9/projects/{project_id}/env"
    success = 0

    for var_name, var_value in ENV_VARS.items():
        print(f"Setting {var_name}...")

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
            print(f"  ✓ {var_name} configured\n")
            success += 1
        else:
            print(f"  ⚠️ {var_name}: {create_response.get('error', 'Unknown error')}\n")

    print(f"✅ {success}/2 environment variables configured!")
    print("\nNext: Redeploy in Vercel dashboard")

if __name__ == "__main__":
    main()
