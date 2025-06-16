#!/bin/bash
set -e

# NusaCart Docker + Local Caddy Deployment Script
# Author: Assistant
# Description: Deploys NusaCart with Docker containers + integrates with local Caddy

echo "🚀 NusaCart Docker + Local Caddy Deployment"
echo "============================================"

# Function to detect VPS IP
detect_ip() {
    local ip=""
    
    # Try multiple methods to get public IP
    if command -v curl >/dev/null 2>&1; then
        ip=$(curl -s --connect-timeout 5 ifconfig.me 2>/dev/null || true)
        if [[ -z "$ip" ]]; then
            ip=$(curl -s --connect-timeout 5 ipinfo.io/ip 2>/dev/null || true)
        fi
        if [[ -z "$ip" ]]; then
            ip=$(curl -s --connect-timeout 5 icanhazip.com 2>/dev/null || true)
        fi
    fi
    
    # Fallback to ip command
    if [[ -z "$ip" ]] && command -v ip >/dev/null 2>&1; then
        ip=$(ip route get 8.8.8.8 | awk '{print $7}' | head -n1 2>/dev/null || true)
    fi
    
    echo "$ip"
}

# Function to validate IP
validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    else
        return 1
    fi
}

# Detect or ask for VPS IP
VPS_IP=$(detect_ip)
if [[ -n "$VPS_IP" ]] && validate_ip "$VPS_IP"; then
    echo "✅ Auto-detected VPS IP: $VPS_IP"
    read -p "Is this correct? (y/n): " confirm
    if [[ $confirm != "y" && $confirm != "Y" ]]; then
        VPS_IP=""
    fi
fi

# Ask for IP if auto-detection failed or user rejected
while [[ -z "$VPS_IP" ]] || ! validate_ip "$VPS_IP"; do
    read -p "Enter your VPS IP address: " VPS_IP
    if ! validate_ip "$VPS_IP"; then
        echo "❌ Invalid IP format. Please try again."
        VPS_IP=""
    fi
done

echo "🔧 Using VPS IP: $VPS_IP"

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Create/update backend application-docker.properties with dynamic IP
echo "📝 Configuring backend for VPS IP: $VPS_IP"
mkdir -p backend/src/main/resources

cat > backend/src/main/resources/application-docker.properties << EOF
# Docker Production Configuration
server.port=6060
spring.profiles.active=docker

# Database Configuration
spring.datasource.url=jdbc:mysql://database:3306/nusacart?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=nusacart
spring.datasource.password=Atmin@NusaCart@2025
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=NusaCartSecretKeyForJWTTokenGeneration2025VeryLongAndSecure
jwt.expiration=86400000

# CORS Configuration (Dynamic based on VPS IP)
cors.allowed-origins=http://localhost:3000,http://$VPS_IP,https://$VPS_IP,http://$VPS_IP:3000

# File Upload Configuration
file.upload-dir=./uploads
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Logging
logging.level.com.TryCatch.NusaCart=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
EOF

# Update frontend environment based on VPS IP
echo "🌐 Configuring frontend for VPS IP: $VPS_IP"
cat > Frontend/NusaCart/.env.production << EOF
VITE_API_URL=http://$VPS_IP:6060
EOF

# Create frontend Dockerfile if it doesn't exist
if [[ ! -f Frontend/NusaCart/Dockerfile ]]; then
    echo "📦 Creating Frontend Dockerfile..."
    cat > Frontend/NusaCart/Dockerfile << 'EOF'
# Multi-stage build for React frontend
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage - simple HTTP server
FROM node:18-alpine

# Install simple HTTP server
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Serve the app
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF
fi

# Build and start containers
echo "🏗️ Building and starting containers..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "🔍 Checking service status..."
for service in database backend frontend; do
    if docker-compose ps $service | grep -q "Up"; then
        echo "✅ $service: Running"
    else
        echo "❌ $service: Failed"
        docker-compose logs $service
    fi
done

# Generate Caddy configuration
echo "📋 Generating Caddy configuration..."
cat > caddy-nusacart.conf << EOF
# NusaCart Caddy Configuration
# Add this to your main Caddyfile or include it

$VPS_IP {
    # Frontend - serve React app
    reverse_proxy localhost:3000
    
    # Backend API routes
    handle /api/* {
        reverse_proxy localhost:6060
    }
    
    # Optional: Backend admin/docs
    handle /swagger-ui/* {
        reverse_proxy localhost:6060
    }
    
    handle /v3/api-docs* {
        reverse_proxy localhost:6060
    }
    
    # Logging
    log {
        output file /var/log/caddy/nusacart.log
    }
}
EOF

# Show final instructions
echo ""
echo "🎉 Deployment completed successfully!"
echo "======================================"
echo ""
echo "📋 Next steps:"
echo "1. Copy the generated Caddy configuration:"
echo "   cp caddy-nusacart.conf /etc/caddy/sites-available/"
echo ""
echo "2. Include it in your main Caddyfile:"
echo "   echo 'import sites-available/*' >> /etc/caddy/Caddyfile"
echo ""
echo "3. Or manually add the configuration from caddy-nusacart.conf to your Caddyfile"
echo ""
echo "4. Reload Caddy:"
echo "   sudo systemctl reload caddy"
echo ""
echo "🌐 Your application will be available at:"
echo "   Frontend: http://$VPS_IP"
echo "   Backend API: http://$VPS_IP/api/"
echo "   API Docs: http://$VPS_IP/swagger-ui/"
echo ""
echo "🐳 Docker containers:"
echo "   Frontend: http://localhost:3000 (internal)"
echo "   Backend: http://localhost:6060 (internal)"
echo "   Database: localhost:3306 (internal)"
echo ""
echo "📁 Generated files:"
echo "   - caddy-nusacart.conf (Caddy configuration)"
echo "   - backend/src/main/resources/application-docker.properties"
echo "   - Frontend/NusaCart/.env.production"
echo ""
echo "🔧 Useful commands:"
echo "   View logs: docker-compose logs -f [service]"
echo "   Restart: docker-compose restart [service]"
echo "   Stop: docker-compose down"
echo "   Rebuild: docker-compose build --no-cache [service]"
echo ""
echo "✅ Deployment ready!" 