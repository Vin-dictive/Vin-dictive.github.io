#!/usr/bin/env bash
# Setup / redeploy the development portfolio on Amazon Linux with nginx (no Docker).
# Uses Yarn for install + build. Enables the "Development site" banner.
#
# Config via environment or .env files in the repo root (loaded in order):
#   .env
#   .env.local          # overrides .env (gitignored)
#
# Supported keys:
#   SERVER_NAME=development-website.tailXXXX.ts.net
#   LISTEN_IP=          # empty = all interfaces; Tailscale IP to bind only there
#   SITE_ROOT=/home/ec2-user/app
#   SKIP_INSTALL=1
#
# Usage:
#   cp .env.example .env   # edit SERVER_NAME
#   ./scripts/setup-dev-nginx.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  log "Loading env from ${file}"
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

# Load .env before applying defaults (.env.local overrides .env)
load_env_file "${REPO_ROOT}/.env"
load_env_file "${REPO_ROOT}/.env.local"

SITE_ROOT="${SITE_ROOT:-$REPO_ROOT}"
OUT_DIR="${SITE_ROOT}/out"
NGINX_CONF="/etc/nginx/conf.d/portfolio-dev.conf"
SERVER_NAME="${SERVER_NAME:-development-website.tailc52fb7.ts.net}"
LISTEN_IP="${LISTEN_IP:-}"
SKIP_INSTALL="${SKIP_INSTALL:-0}"

[[ -f "${SITE_ROOT}/package.json" ]] || die "package.json not found in ${SITE_ROOT}"
[[ "$(id -u)" -eq 0 ]] && die "Do not run as root. Run as ec2-user (script uses sudo when needed)."

if [[ -z "${SERVER_NAME}" ]]; then
  die "SERVER_NAME is empty. Set it in .env or the environment."
fi

log "Using SERVER_NAME=${SERVER_NAME}"
if [[ -n "$LISTEN_IP" ]]; then
  log "Using LISTEN_IP=${LISTEN_IP}"
fi

if [[ "$SKIP_INSTALL" != "1" ]]; then
  log "Installing system packages (nodejs, nginx, git)"
  if command -v dnf >/dev/null 2>&1; then
    if ! command -v node >/dev/null 2>&1; then
      curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
      sudo dnf install -y nodejs
    fi
    sudo dnf install -y nginx git
  elif command -v apt-get >/dev/null 2>&1; then
    if ! command -v node >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
      sudo apt-get install -y nodejs
    fi
    sudo apt-get install -y nginx git
  else
    die "Unsupported OS (need dnf or apt)"
  fi

  if ! command -v yarn >/dev/null 2>&1; then
    log "Installing Yarn"
    sudo npm install -g yarn
  fi
fi

command -v node >/dev/null 2>&1 || die "node not found"
command -v yarn >/dev/null 2>&1 || die "yarn not found"
command -v nginx >/dev/null 2>&1 || die "nginx not found"

log "Installing JS dependencies with Yarn"
cd "$SITE_ROOT"
yarn install --frozen-lockfile

log "Building static site with Yarn (development banner ON)"
export NEXT_PUBLIC_SITE_ENV=development
yarn build

[[ -f "${OUT_DIR}/index.html" ]] || die "Build failed: ${OUT_DIR}/index.html missing"
ls -la "$OUT_DIR" | head

log "Writing nginx config → ${NGINX_CONF}"
LISTEN_LINES="    listen 80;"
if [[ -n "$LISTEN_IP" ]]; then
  LISTEN_LINES="    listen ${LISTEN_IP}:80;"
fi

sudo tee "$NGINX_CONF" >/dev/null <<EOF
server {
${LISTEN_LINES}
    listen [::]:80;
    server_name ${SERVER_NAME};

    root ${OUT_DIR};
    index index.html;

    location /_next/ {
        try_files \$uri =404;
        expires 7d;
        add_header Cache-Control "public";
    }

    location / {
        try_files \$uri \$uri/ \$uri/index.html =404;
    }

    error_page 404 /404.html;
}
EOF

log "Fixing permissions so nginx can read ${OUT_DIR}"
HOME_DIR="$(dirname "$SITE_ROOT")"
if [[ "$HOME_DIR" == /home/* ]]; then
  chmod 755 "$HOME_DIR" || true
fi
chmod -R a+rX "$OUT_DIR"

log "Enabling and restarting nginx"
sudo systemctl enable nginx
sudo nginx -t
sudo systemctl restart nginx

log "Done"
echo
echo "  Site root : ${OUT_DIR}"
echo "  Config    : ${NGINX_CONF}"
echo "  Open (Tailscale connected):"
echo "    http://${SERVER_NAME}/"
echo
echo "  Redeploy:"
echo "    cd ${SITE_ROOT} && git pull && ./scripts/setup-dev-nginx.sh"
echo
