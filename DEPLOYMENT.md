# NexaBid — Deployment Guide

## Architecture

```
Internet → Nginx (80/443)
              ├── app.nexabid.com    → /var/www/client    (React SPA)
              ├── mfr.nexabid.com    → /var/www/manufacturer (React SPA)
              ├── admin.nexabid.com  → /var/www/admin     (React SPA)
              └── /api/* + /socket.io/* → backend:3000 (Node.js)

Backend → MongoDB (mongo:27017)
       → Redis (redis:6379)
```

---

## Local Development

```bash
# 1. Install all dependencies from workspace root
cd nexabid-workspace
npm install

# 2. Configure backend environment
cp nexabid-backend/.env.example nexabid-backend/.env
# Edit .env — fill in MongoDB URI, JWT secrets, Razorpay keys, Gmail

# 3. Start services (4 terminals)
cd nexabid-backend && npm run dev          # API on :3000
cd nexabid-workspace && npm run dev:client  # Client on :5173
cd nexabid-workspace && npm run dev:manufacturer  # Mfr on :5174
cd nexabid-workspace && npm run dev:admin   # Admin on :5175

# 4. Seed admin account
# Open http://localhost:5175 → click "Create Admin Account"
# Or: cd nexabid-backend && npm run create-admin
```

---

## Production Deployment (Docker)

### Prerequisites
- Docker + Docker Compose installed on server
- Domain names pointing to your server IP
- SSL certificates (use Let's Encrypt / Certbot)

### Step 1 — Clone and configure

```bash
git clone <your-repo> nexabid-workspace
cd nexabid-workspace

# Configure backend
cp nexabid-backend/.env.example nexabid-backend/.env
nano nexabid-backend/.env   # Fill in ALL values
```

### Step 2 — Build frontend apps

```bash
# Build all 3 frontend apps
cd nexabid-client && npm install && npm run build
cd ../nexabid-manufacturer && npm install && npm run build
cd ../nexabid-admin && npm install && npm run build
cd ..
```

### Step 3 — Configure nginx

```bash
mkdir -p nginx/ssl

# If using Certbot for SSL:
# certbot certonly --standalone -d app.nexabid.com -d mfr.nexabid.com -d admin.nexabid.com
# cp /etc/letsencrypt/live/app.nexabid.com/fullchain.pem nginx/ssl/
# cp /etc/letsencrypt/live/app.nexabid.com/privkey.pem nginx/ssl/

# Update nginx/nginx.conf — change listen 80 to listen 443 ssl and add:
# ssl_certificate /etc/nginx/ssl/fullchain.pem;
# ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

### Step 4 — Start with Docker Compose

```bash
docker-compose up -d

# Check all containers are running
docker-compose ps

# View logs
docker-compose logs -f backend
```

### Step 5 — Seed admin account

```bash
docker-compose exec backend node dist/scripts/createAdmin.js
# Or open https://admin.nexabid.com → "Create Admin Account" button
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | 64+ char random secret |
| `JWT_REFRESH_SECRET` | ✅ | 64+ char random secret (different from above) |
| `GMAIL_USER` | ⚠️ | Gmail address for transactional emails |
| `GMAIL_APP_PASSWORD` | ⚠️ | Gmail App Password (16 chars) |
| `RAZORPAY_KEY_ID` | ✅ | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | ⚠️ | Razorpay webhook verification secret |
| `CLIENT_URL` | ✅ | Full URL of client portal |
| `MANUFACTURER_URL` | ✅ | Full URL of manufacturer portal |
| `ADMIN_URL` | ✅ | Full URL of admin panel |

---

## Razorpay Setup

1. Create account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get API keys from **Settings → API Keys**
3. Set up webhook at **Settings → Webhooks**:
   - URL: `https://app.nexabid.com/api/payments/webhook`
   - Events: `payment.captured`, `payment.failed`
   - Copy the webhook secret to `.env`

---

## Gmail App Password Setup

1. Enable **2-Step Verification** on your Google Account
2. Go to **Google Account → Security → App Passwords**
3. Generate for: App = Mail, Device = Other (type "NexaBid")
4. Copy the 16-character password to `GMAIL_APP_PASSWORD` in `.env`

---

## Health Check

```bash
curl https://app.nexabid.com/api/health
# Expected: {"success":true,"status":"ok","db":"connected",...}
```

---

## Updating Production

```bash
# Pull latest changes
git pull

# Rebuild backend
docker-compose build backend
docker-compose up -d backend

# Rebuild frontend (if changed)
cd nexabid-client && npm run build
cd nexabid-manufacturer && npm run build
cd nexabid-admin && npm run build

# Reload nginx to pick up new static files
docker-compose exec nginx nginx -s reload
```

---

## Default Ports

| Service | Port |
|---|---|
| Backend API | 3000 |
| Client portal (dev) | 5173 |
| Manufacturer portal (dev) | 5174 |
| Admin panel (dev) | 5175 |
| MongoDB | 27017 |
| Redis | 6379 |
| Nginx HTTP | 80 |
| Nginx HTTPS | 443 |

---

## Troubleshooting

**Backend won't start:** Check MongoDB is running — `docker-compose logs mongo`

**Emails not sending:** Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env`. App Password must have no spaces.

**401 errors after deployment:** Check `JWT_SECRET` matches between restarts. Never change it in production.

**Razorpay payment fails:** Ensure you're using live keys (`rzp_live_`) in production, not test keys.

**Redis connection error:** App works without Redis (OTPs stored in memory), but session data won't persist across restarts.
