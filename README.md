# Developer Profile

A modern developer portfolio built with Next.js — interactive cursor background, section navigation, gallery, and JSON-driven content. Styled with Tailwind CSS.

## Development deploy on AWS EC2 (Tailscale + nginx)

Use this for a private preview of the `development` branch. The site is reachable only on Tailscale network (not the public internet), assuming the security group is locked down.
When deploying on AWS EC2, spin up a container and then create key pair called developer.pem and select only IP for accepting SSH connections to the VM.

### Architecture

```text
Laptop (Tailscale) ->EC2 (Tailscale + nginx) ->out/
```

- **Production**: GitHub Pages (`main`)
- **Development**: EC2 + Tailscale (`development` branch), with **Development site** banner

### 1. AWS EC2

1. Launch a small **Amazon Linux** instance.
2. Prefer **no public inbound** on 80/443 (Allow SSH from your IP only for first bootstrap).
3. Attach (or create) an SSH key pair and download the `.pem`.
4. Note the public DNS for first SSH (or use Session Manager).

### 2. Tailscale on the VM

SSH in

```bash
chmod 400 ~/Downloads/developer.pem
ssh -i ~/Downloads/developer.pem ec2-user@ec2-XX-XX-XX-XX.region.compute.amazonaws.com
```

Install and join your Tailnet:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

You need Tailscale auth keys for connecting your AWS VM to your Mesh Network. 
For that go to Tailscale dashboard -> Settings -> Keys -> `Generate auth Key..`
Give it a Description `aws-tailscale-demo`, then run on VM

```bash
sudo tailscale up --auth-key="tskey-auth-xxxxx-xxxxx"  --hostname=development-website  --accept-routes
```

This will add Tailscale to your mesh network. It should be visible to you on `https://console.tailscale.com/admin/machines`

Trying with VPN connection (NordVPN), the above ssh using `ec2-user@ec2-XX-XX-XX-XX.region.compute.amazonaws.com` should  not work because it was blocked using rules set during EC2 security rules setup.

```bash
ssh -i ~/Downloads/developer.pem ec2-user@development-website.tailXXXX.ts.net
```

Turning off the Tailscale network connection and trying to ssh should not allow you to connect to the VM. 

### 3. One-time install + deploy (Amazon Linux)

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

# Create .env and set your Tailscale hostname for nginx
cat > .env <<'EOF'
SERVER_NAME=development-website.XXXXX.ts.net
EOF
# Edit SERVER_NAME if your MagicDNS name is different

# Install deps, yarn build (dev banner), configure nginx, restart
./scripts/setup-dev-nginx.sh
```

The script reads `SERVER_NAME` from:

1. `.env`
2. Or shell environment: `SERVER_NAME=... ./scripts/setup-dev-nginx.sh`

Then it:

1. Ensures Node / Yarn / nginx
2. Runs `yarn install` and `yarn build` with `NEXT_PUBLIC_SITE_ENV=development`
3. Writes `/etc/nginx/conf.d/portfolio-dev.conf` pointing at `~/app/out`
4. Fixes home-dir permissions so nginx can read the export
5. Enables and restarts nginx

Open the MagicDNS on your Laptop with Tailscale connected:

```text
http://development-website.tailXXXX.ts.net/
```

Website should open up. Without tailscale connected it should say `This site can’t be reached`

### 4. Redeploy after changes

```bash
cd ~/app
git pull
# keep your local .env (it is gitignored)
./scripts/setup-dev-nginx.sh
```

### 5. GitHub Actions ->Tailscale ->EC2 (auto-deploy)

Pushing to `development` can redeploy the VM automatically. The runner joins the Tailnet, then SSHs to the EC2 and runs `setup-dev-nginx.sh`.

Workflow file: `.github/workflows/deploy-dev-tailscale.yml`

#### A. Tailscale ACL tags

In the Tailscale admin console -> **Access controls**, define a CI tag and allow it to reach the VM (SSH / port 22). Example ACL fragment:

```json
{
  "tagOwners": {
    "tag:ci": ["autogroup:admin"],
    "tag:dev-server": ["autogroup:admin"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["tag:ci"],
      "dst": ["tag:dev-server:22"]
    },
    {
      "action": "accept",
      "src": ["autogroup:member"],
      "dst": ["*:*"]
    }
  ]
}
```

On the EC2, tag the machine as `tag:dev-server` (Tailscale admin -> machine -> Edit ACL tags), or re-auth with:

```bash
sudo tailscale up --auth-key="tskey-auth-..." --hostname=development-website --advertise-tags=tag:dev-server
```

#### B. Tailscale OAuth client (for GitHub Actions)

1. Tailscale admin ->**Settings** ->**Tailnet Settings** ->**Trust Credentials**
2. Description in step 1: `github-actions`
2. Scopes: enable devices / auth-key creation 
3. Set **Tags**: `tag:ci`
4. Copy **Client ID** and **Client secret**

#### C. GitHub repository secrets

Repo ->**Settings** ->**Secrets and variables** ->**Actions**:

| Secret | Value |
|--------|--------|
| `TS_OAUTH_CLIENT_ID` | Tailscale OAuth client ID |
| `TS_OAUTH_SECRET` | Tailscale OAuth client secret |
| `EC2_SSH_KEY` | Full contents of `developer.pem` (private key) |
| `EC2_HOST` | `development-website.tailXXXX.ts.net` |
| `EC2_USER` | `ec2-user` (optional; defaults to `ec2-user` in the workflow) |

Keep `.env` with `SERVER_NAME=...` on the VM only (gitignored). The Action does not upload it.

#### D. Trigger

- Automatic: push to `development`
- Manual: **Actions** ->**Deploy development (Tailscale ->EC2)** ->**Run workflow**

```text
git push origin development
  ->GitHub runner joins Tailscale (tag:ci)
  ->SSH to EC2
  ->git pull + SKIP_INSTALL=1 ./scripts/setup-dev-nginx.sh
```

**Note:** Production (`main` ->GitHub Pages) stays on `.github/workflows/nextjs.yml` and does not use Tailscale.

---

## Support

If you encounter issues, open a GitHub issue.

---

Built with Next.js · Production on GitHub Pages · Dev preview via Tailscale + EC2
