#!/bin/bash

# n8n Connection Check Script

echo "🔍 Checking n8n configuration..."
echo ""

# Check if n8n is running
echo "1. Testing n8n connection..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5678 | grep -q "200\|404"; then
    echo "   ✅ n8n is running on http://localhost:5678"
else
    echo "   ❌ n8n is NOT running"
    echo "   Start n8n with: npx n8n"
    exit 1
fi

echo ""

# Check webhook endpoint
echo "2. Testing webhook endpoint..."
WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:5678/webhook/veo3-video-generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test"}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$WEBHOOK_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Webhook not found (404)"
    echo "   Make sure your n8n workflow is ACTIVATED"
    echo "   Open http://localhost:5678 and activate the workflow"
elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "   ✅ Webhook is working!"
else
    echo "   ⚠️  Webhook returned status: $HTTP_CODE"
    echo "   Response: $(echo "$WEBHOOK_RESPONSE" | head -1)"
fi

echo ""

# Check Next.js proxy
echo "3. Testing Next.js API proxy..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3000/api/health)
    echo "   ✅ Next.js proxy is running"
    echo "   Health check: $HEALTH"
else
    echo "   ❌ Next.js is NOT running"
    echo "   Start Next.js with: npm run dev"
fi

echo ""
echo "✨ Check complete!"
