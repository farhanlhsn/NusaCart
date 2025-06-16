# 🐳 NusaCart Docker + Local Caddy

Deploy NusaCart menggunakan Docker yang **terintegrasi dengan Caddy lokal** Anda.

## 🚀 Quick Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Yang Termasuk

- ✅ **Backend Spring Boot** (localhost:6060)
- ✅ **Frontend React** (localhost:3000) 
- ✅ **Database MySQL** (localhost:3306)
- ✅ **Auto-generated Caddy config**

## 🔧 Arsitektur

```
Internet → Caddy Sistem → Docker Containers
                       ├── Frontend (localhost:3000)
                       ├── Backend (localhost:6060)
                       └── Database (localhost:3306)
```

**Keuntungan:**
- ✅ Tidak ada konflik port dengan Caddy sistem
- ✅ Auto HTTPS dari Caddy sistem 
- ✅ Containers hanya expose ke localhost
- ✅ Easy maintenance dan monitoring

## 📁 File Structure

```
NusaCart/
├── deploy.sh                    # Main deployment script
├── docker-compose.yml           # Docker services config
├── caddy-config.conf           # Template Caddy config
├── backend/
│   └── Dockerfile              # Backend container
└── Frontend/NusaCart/
    └── Dockerfile              # Frontend container (simple HTTP server)
```

## 🔧 Setelah Deploy

Script akan generate file `caddy-nusacart.conf`. Tambahkan ke Caddyfile sistem:

```bash
# Edit Caddyfile sistem
sudo nano /etc/caddy/Caddyfile

# Copy content dari caddy-nusacart.conf
# Atau include file:
import caddy-nusacart.conf

# Reload Caddy
sudo systemctl reload caddy
```

## 📊 Management

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update dan rebuild
git pull
docker-compose up --build -d
```

## 🔍 Troubleshooting

```bash
# Check containers
docker-compose ps

# Test backend
curl http://localhost:6060/api/products

# Test frontend  
curl http://localhost:3000

# Check Caddy config
sudo caddy validate --config /etc/caddy/Caddyfile

# View Caddy logs
sudo journalctl -u caddy -f
```

## 💡 Tips

- Containers hanya accessible dari localhost (secure)
- Caddy sistem handle SSL/HTTPS otomatis
- Untuk domain: ganti IP dengan domain di Caddyfile
- Monitoring: `docker-compose logs -f [service]` 