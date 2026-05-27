#!/bin/bash
# Run this ONCE on your Hostinger VPS to set up the deployment target.
# Usage: bash vps-setup.sh

set -e

echo "=== Content Agent — VPS Setup ==="

# 1. Install Docker
if ! command -v docker &>/dev/null; then
  echo "[1/5] Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
else
  echo "[1/5] Docker already installed."
fi

# 2. Install Docker Compose plugin
if ! docker compose version &>/dev/null; then
  echo "[2/5] Installing Docker Compose plugin..."
  apt-get install -y docker-compose-plugin
else
  echo "[2/5] Docker Compose already installed."
fi

# 3. Create app directory
echo "[3/5] Creating /opt/content-agent..."
mkdir -p /opt/content-agent
cd /opt/content-agent

# 4. Copy docker-compose.yml
#    (GitHub Actions will deploy images; this file orchestrates them)
cat > docker-compose.yml << 'COMPOSE'
version: "3.9"

services:
  backend:
    image: ghcr.io/GITHUB_REPO/backend:latest
    container_name: content_backend
    restart: unless-stopped
    ports:
      - "4001:4001"
    env_file:
      - .env
    volumes:
      - db_data:/app/data
    environment:
      - DATABASE_URL=sqlite:////app/data/content_agent.db

  frontend:
    image: ghcr.io/GITHUB_REPO/frontend:latest
    container_name: content_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  db_data:
COMPOSE

echo ""
echo "[4/5] IMPORTANT — Create your .env file now:"
echo "  cp .env.example .env   (then fill in your real API keys)"
echo ""
echo "  Or run:  nano /opt/content-agent/.env"
echo ""
echo "[5/5] Replace GITHUB_REPO in docker-compose.yml with your GitHub username/repo"
echo "  e.g. sed -i 's|GITHUB_REPO|yourusername/content|g' docker-compose.yml"
echo ""
echo "=== Setup complete. ==="
echo "Once .env is configured and GitHub Actions runs, containers will start automatically."
echo "Verify with: docker ps"
