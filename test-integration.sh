#!/bin/bash
echo "🧪 Integration Test Suite"
echo "========================"

# 1. Start server in background
echo "1. Starting server..."
npm start &
SERVER_PID=$!
sleep 5

# 2. Test basic endpoint
echo -e "\n2. Testing API base endpoint..."
curl -s http://localhost:3000/api/v1 | grep -q "Garde API Endpoint"
if [ $? -eq 0 ]; then
    echo "   ✅ API is running"
else
    echo "   ❌ API not responding"
    kill $SERVER_PID
    exit 1
fi

# 3. Generate token for User ID 3 (Estate Admin)
echo -e "\n3. Generating test token..."
TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
const config = require('./config/auth.config');
const token = jwt.sign({ id: 3 }, config.secret, { expiresIn: '1h' });
console.log(token);
")

echo "   Token generated: ${TOKEN:0:30}..."

# 4. Test protected endpoint
echo -e "\n4. Testing protected route..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/test-protected)

if [ "$RESPONSE" = "200" ]; then
    echo "   ✅ Protected route accessible"
else
    echo "   ❌ Protected route failed: HTTP $RESPONSE"
fi

# 5. Test without token
echo -e "\n5. Testing without token (should fail)..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:3000/api/v1/test-protected)

if [ "$RESPONSE" = "401" ]; then
    echo "   ✅ Correctly rejected unauthorized access"
else
    echo "   ❌ Should have returned 401, got: $RESPONSE"
fi

# 6. Stop server
echo -e "\n6. Cleaning up..."
kill $SERVER_PID
echo "   ✅ Test completed"

echo -e "\n📋 Next steps:"
echo "   - Test actual login with User ID 3 credentials"
echo "   - Test refresh token endpoint"
echo "   - Test different user types"