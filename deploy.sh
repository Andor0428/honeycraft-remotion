#!/bin/bash
# HoneyCraft Remotion Render Server — VPS Deploy Script
# Run once on your Hetzner VPS: bash deploy.sh

set -e
echo "==> HoneyCraft Render Server Setup"

# Install dependencies
apt-get update -qq
apt-get install -y curl git chromium-browser fonts-liberation fonts-noto

# Install Node.js 20 if not present
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# Install PM2 globally
npm install -g pm2

# Clone / pull project
DEPLOY_DIR="/opt/honeycraft-remotion"
if [ -d "$DEPLOY_DIR" ]; then
  echo "==> Updating existing install"
  cd "$DEPLOY_DIR" && git pull
else
  echo "==> Fresh install"
  git clone https://github.com/YOUR_REPO/honeycraft-remotion.git "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

# Install npm dependencies
npm install --production

# Set Chromium path for Remotion
export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser || which chromium)
echo "export PUPPETEER_EXECUTABLE_PATH=$PUPPETEER_EXECUTABLE_PATH" >> /etc/environment

# Start with PM2
pm2 delete honeycraft-render 2>/dev/null || true
pm2 start src/server.js \
  --name honeycraft-render \
  --max-memory-restart 2G \
  --env production \
  -- --port 3001

pm2 save
pm2 startup

echo ""
echo "==> Render server running at http://localhost:3001"
echo "==> Health check: curl http://localhost:3001/health"
echo ""
echo "==> Add to nginx (add inside your server {} block):"
echo "    location /render-api/ {"
echo "        proxy_pass http://127.0.0.1:3001/;"
echo "        proxy_read_timeout 180s;"
echo "        client_max_body_size 50M;"
echo "    }"
