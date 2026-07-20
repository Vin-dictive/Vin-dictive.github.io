# Developer Profile

A modern developer portfolio built with Next.js — interactive cursor background, section navigation, gallery, and JSON-driven content. Styled with Tailwind CSS.

## Features

- Interactive cursor / fluid-style background
- Smooth section navigation and responsive layout
- JSON-driven profile content (`data/profile.json`)
- Photography gallery with lazy-loaded images
- Static export for GitHub Pages
- Optional **Development site** banner for private Tailscale / EC2 previews

## Tech Stack

- **Framework**: Next.js 15 (App Router, static `output: 'export'`)
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui patterns + Lucide icons
- **Language**: TypeScript
- **Production deploy**: GitHub Pages
- **Dev preview**: AWS EC2 + Tailscale + nginx

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn (recommended; `yarn.lock` is the source of truth)

### Installation

```bash
git clone https://github.com/Vin-dictive/Vin-dictive.github.io
cd Vin-dictive.github.io
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Local `yarn dev` shows the **Development site** banner.

### Updating profile content

Edit `data/profile.json` for personal info, skills, experience, projects, education, certifications, and gallery pictures.

Gallery sync (macOS, from geotags when available):

```bash
yarn sync-gallery
```

### Production build

```bash
yarn build
```

Static files are written to `out/`.

Development build (banner enabled):

```bash
yarn build:dev
```

## Deployment to GitHub Pages

Pushing to `main` runs `.github/workflows/nextjs.yml`, which builds and deploys the `out/` folder to GitHub Pages.

Production builds do **not** set `NEXT_PUBLIC_SITE_ENV=development`, so the development banner is hidden.

---

## Development deploy on AWS EC2 (Tailscale + nginx)

Use this for a private preview of the `development` branch. The site is reachable only on your Tailnet (not the public internet), assuming the security group is locked down.

### Architecture

```text
Laptop (Tailscale) → Tailnet → EC2 (Tailscale + nginx) → out/
```

- **Production**: GitHub Pages (`main`)
- **Development**: EC2 + Tailscale (`development` branch), with **Development site** banner

### 1. AWS EC2

1. Launch a small **Amazon Linux** instance.
2. Prefer **no public inbound** on 80/443 (optional: allow SSH from your IP only for first bootstrap).
3. Attach (or create) an SSH key pair and download the `.pem`.
4. Note the public DNS for first SSH (or use Session Manager).

### 2. Tailscale on the VM

SSH in (example — use the AMI user; Amazon Linux is `ec2-user`):

```bash
chmod 400 ~/Downloads/developer.pem
ssh -i ~/Downloads/developer.pem ec2-user@ec2-XX-XX-XX-XX.region.compute.amazonaws.com
```

Install and join your Tailnet:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Approve the machine in the Tailscale admin console. Prefer MagicDNS, e.g.:

```text
development-website.tailXXXX.ts.net
```

Later SSH via Tailscale (still need username + key):

```bash
ssh -i ~/Downloads/developer.pem ec2-user@development-website.tailXXXX.ts.net
```

### 3. One-time install + deploy (Amazon Linux)

Your AMI uses **`dnf`**, not `apt`.

```bash
# Node 20 + nginx + git
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs nginx git
sudo npm install -g yarn

# Clone and checkout development
git clone https://github.com/Vin-dictive/Vin-dictive.github.io.git app
cd app
git checkout development
chmod +x scripts/setup-dev-nginx.sh

# Install deps, yarn build (dev banner), configure nginx, restart
./scripts/setup-dev-nginx.sh
```

The script:

1. Ensures Node / Yarn / nginx (skippable later with `SKIP_INSTALL=1`)
2. Runs `yarn install` and `yarn build` with `NEXT_PUBLIC_SITE_ENV=development`
3. Writes `/etc/nginx/conf.d/portfolio-dev.conf` pointing at `~/app/out`
4. Fixes home-dir permissions so nginx can read the export
5. Enables and restarts nginx

Open (laptop on Tailscale):

```text
http://development-website.tailXXXX.ts.net/
```

Optional: bind nginx only to the Tailscale IP:

```bash
LISTEN_IP="$(tailscale ip -4)" ./scripts/setup-dev-nginx.sh
```

### 4. Redeploy after changes

```bash
cd ~/app
git pull
./scripts/setup-dev-nginx.sh
```

Rebuild only (packages already installed):

```bash
SKIP_INSTALL=1 ./scripts/setup-dev-nginx.sh
```

Or via Yarn:

```bash
yarn setup:dev-nginx
```

### 5. Checklist / troubleshooting

| Issue | Fix |
|--------|-----|
| `Permission denied (publickey)` | Use `ec2-user@` (or `ubuntu@`) **and** `-i your.pem` |
| `apt: command not found` | You are on Amazon Linux — use `dnf` / the script above |
| nginx 403 | Re-run script (it sets `chmod` on home + `out/`) |
| Port 80 conflict | `sudo systemctl status nginx` / stop anything else on 80 |
| No banner | Build with `yarn build:dev` or `./scripts/setup-dev-nginx.sh` |
| Can’t reach site | Confirm Tailscale is connected on laptop + VM |

### Scripts reference

| Script / command | Purpose |
|------------------|---------|
| `yarn build` | Production static export (no banner) |
| `yarn build:dev` | Dev static export (banner on) |
| `./scripts/setup-dev-nginx.sh` | Full EC2 nginx setup + rebuild |
| `yarn sync-gallery` | Sync `public/pictures` → `data/profile.json` |

---

## Support

If you encounter issues, open a GitHub issue.

---

Built with Next.js · Production on GitHub Pages · Dev preview via Tailscale + EC2
