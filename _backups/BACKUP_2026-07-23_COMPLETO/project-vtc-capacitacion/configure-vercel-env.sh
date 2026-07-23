#!/bin/bash
# Configure VTC Vercel Environment Variables
# Script to set up ElevenLabs and OpenRouter credentials in Vercel dashboard

set -e

PROJECT_NAME="vtc-capacitacion-deploy"
VERCEL_ORG_ID="${VERCEL_ORG_ID:-}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID:-}"

echo "═══════════════════════════════════════════════════════════════"
echo "VTC VERCEL ENVIRONMENT CONFIGURATION"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ VERCEL_TOKEN not found in environment variables"
    echo ""
    echo "MANUAL SETUP REQUIRED:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Open: https://vercel.com/dashboard"
    echo "2. Click: vtc-capacitacion-deploy project"
    echo "3. Go to: Settings → Environment Variables"
    echo "4. Add these 3 variables:"
    echo ""
    echo "   Name: ELEVENLABS_API_KEY"
    echo "   Value: sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67"
    echo "   Environments: Production, Preview, Development"
    echo ""
    echo "   Name: ELEVENLABS_AGENT_ID"
    echo "   Value: agent_5701kr0h5gg6eetb69tv6c5hwfj1"
    echo "   Environments: Production, Preview, Development"
    echo ""
    echo "   Name: OPENROUTER_API_KEY"
    echo "   Value: [your-openrouter-api-key]"
    echo "   Environments: Production, Preview, Development"
    echo ""
    echo "5. Click: Save"
    echo "6. Go to: Deployments"
    echo "7. Click: Redeploy latest commit"
    echo ""
    exit 1
fi

# Use Vercel CLI if available
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
fi

echo "✓ Using Vercel CLI..."
echo ""

# Set environment variables
echo "Setting ELEVENLABS_API_KEY..."
vercel env add ELEVENLABS_API_KEY \
    --value "sk_87d5a7899d6c489c94232248c4880a0c4fe317adb3701e67" \
    --environment production \
    --environment preview \
    --environment development

echo "✓ ELEVENLABS_API_KEY set"
echo ""

echo "Setting ELEVENLABS_AGENT_ID..."
vercel env add ELEVENLABS_AGENT_ID \
    --value "agent_5701kr0h5gg6eetb69tv6c5hwfj1" \
    --environment production \
    --environment preview \
    --environment development

echo "✓ ELEVENLABS_AGENT_ID set"
echo ""

echo "Setting OPENROUTER_API_KEY..."
read -p "Enter your OpenRouter API Key: " OPENROUTER_KEY

vercel env add OPENROUTER_API_KEY \
    --value "$OPENROUTER_KEY" \
    --environment production \
    --environment preview \
    --environment development

echo "✓ OPENROUTER_API_KEY set"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All environment variables configured!"
echo ""
echo "Next: Redeploy the project on Vercel"
echo "  https://vercel.com/dashboard/vtc-capacitacion-deploy"
echo ""
