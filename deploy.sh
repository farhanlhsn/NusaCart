#!/bin/bash

# Docker Deployment Script untuk integrasi dengan Caddy lokal
# Script ini tidak akan konflik dengan Caddy yang sudah ada di sistem

set -e

echo "🐳⚡ NusaCart Docker + Local Caddy Integration"
echo "=============================================="

# Get VPS IP
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
echo "📍 VPS IP: $VPS_IP"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Caddy is already running
if pgrep -x "caddy" > /dev/null; then
    echo "✅ Caddy sudah running di sistem"
    CADDY_RUNNING=true
else
    echo "⚠️ Caddy tidak terdeteksi running di sistem"
    CADDY_RUNNING=false
fi

# Install Docker dan Docker Compose jika belum ada
if ! command_exists docker; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "✅ Docker installed"
else
    echo "✅ Docker already installed"
fi

if ! command_exists docker-compose; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed"
else
    echo "✅ Docker Compose already installed"
fi

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads

# Update configuration for VPS
echo "🔧 Updating configuration for VPS..."

# Create production docker-compose override
cat > docker-compose.local-caddy.override.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      args:
        - VITE_API_URL=http://$VPS_IP:6060
    environment:
      - VITE_API_URL=http://$VPS_IP:6060

  backend:
    environment:
      - SPRING_PROFILES_ACTIVE=docker
EOF

# Update backend CORS untuk include VPS IP
echo "🔧 Updating CORS configuration..."
if [ -f "backend/src/main/java/com/TryCatch/NusaCart/config/SecurityConfig.java" ]; then
    cp backend/src/main/java/com/TryCatch/NusaCart/config/SecurityConfig.java backend/src/main/java/com/TryCatch/NusaCart/config/SecurityConfig.java.backup
    sed -i "s/YOUR_VPS_IP/$VPS_IP/g" backend/src/main/java/com/TryCatch/NusaCart/config/SecurityConfig.java
    sed -i "s/YOUR_DOMAIN\.com/$VPS_IP/g" backend/src/main/java/com/TryCatch/NusaCart/config/SecurityConfig.java
    echo "✅ CORS configuration updated"
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start services
echo "🚀 Starting services (tanpa konflik dengan Caddy lokal)..."
docker-compose -f docker-compose.yml -f docker-compose.local-caddy.override.yml up --build -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
services=("nusacart-db" "nusacart-backend" "nusacart-frontend")
for service in "${services[@]}"; do
    if docker ps | grep -q $service; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Not running"
    fi
done

# Test internal endpoints
echo "🧪 Testing internal endpoints (localhost only)..."

# Test backend
echo -n "Backend (localhost:6060): "
sleep 10
if curl -s -f http://localhost:6060/api/products >/dev/null; then
    echo "✅ Responding"
else
    echo "❌ Not responding"
fi

# Test frontend
echo -n "Frontend (localhost:3000): "
if curl -s -f http://localhost:3000 >/dev/null; then
    echo "✅ Serving"
else
    echo "❌ Not serving"
fi

# Generate Caddyfile configuration
echo ""
echo "📝 Generating Caddyfile configuration..."

# Replace placeholder with actual IP
sed "s/your-vps-ip/$VPS_IP/g" caddy-config.conf > caddy-nusacart.conf

echo "✅ Konfigurasi Caddy dibuat: caddy-nusacart.conf"

echo ""
echo "🎉 Docker Services Ready!"
echo "========================="
echo "📍 Backend: http://localhost:6060 (internal)"
echo "📍 Frontend: http://localhost:3000 (internal)"
echo "📍 Database: localhost:3306 (internal)"
echo ""

if [ "$CADDY_RUNNING" = true ]; then
    echo "🔧 Langkah selanjutnya untuk Caddy:"
    echo "1. Edit Caddyfile sistem Anda (biasanya di /etc/caddy/Caddyfile)"
    echo "2. Tambahkan konfigurasi dari file: caddy-nusacart.conf"
    echo "3. Reload Caddy: sudo systemctl reload caddy"
    echo ""
    echo "📋 Atau copy-paste konfigurasi ini ke Caddyfile Anda:"
    echo "----------------------------------------"
    cat caddy-nusacart.conf
    echo "----------------------------------------"
else
    echo "⚠️ Caddy belum running. Install dan start Caddy terlebih dahulu:"
    echo "1. Install: sudo apt install caddy"
    echo "2. Edit: sudo nano /etc/caddy/Caddyfile"
    echo "3. Tambahkan konfigurasi dari: caddy-nusacart.conf"
    echo "4. Start: sudo systemctl enable --now caddy"
fi

echo ""
echo "🔧 Useful Commands:"
echo "- View logs: docker-compose logs"
echo "- Restart: docker-compose restart"
echo "- Stop: docker-compose down"
echo "- Reload Caddy: sudo systemctl reload caddy"
echo "- Test Caddy config: sudo caddy validate --config /etc/caddy/Caddyfile"

echo ""
echo "📊 Current Docker Status:"
docker-compose ps

echo ""
echo "💡 Tips:"
echo "- Services hanya expose ke localhost (tidak konflik)"
echo "- Caddy sistem Anda yang handle public access"
echo "- Untuk HTTPS: ganti IP dengan domain di Caddyfile"
echo "- Monitoring: docker-compose logs -f" 