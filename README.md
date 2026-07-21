# Developer Profile

A modern developer portfolio built with Next.js. Contains interactive cursor background, section navigation, gallery, and JSON-driven content. Styled with Tailwind CSS.

To see the difference between what was there before and what was additionally added to this branch check out [this PR](https://github.com/Vin-dictive/Vin-dictive.github.io/pull/3)

## Development deploy on AWS EC2 (Tailscale + nginx)

Use this for a private preview of the `development` branch. The site is reachable only on Tailscale network (not the public internet), assuming the security group is locked down. When deploying on AWS EC2, spin up a container and then create key pair called `developer.pem` and select only your IP for accepting SSH connections to the VM.

This setup follows Tailscale’s guidance for [setting up a server on your Tailscale network](https://tailscale.com/docs/how-to/set-up-servers): install the client, authenticate with an [auth key](https://tailscale.com/docs/features/access-control/auth-keys), optionally apply [tags](https://tailscale.com/docs/features/tags), and reach the host via [MagicDNS](https://tailscale.com/docs/features/magicdns).

## AI Disclosures

- For base website development of personal developer profile, AI was used for modules and updating content as per CV. 
- All the steps was taken from Tailscales documentation (links collected in [Tailscale docs referenced](#tailscale-docs-referenced) below).
- The Mermaid architecture diagram below was drafted with AI assistance; I reviewed the node/edge labels against this repo’s actual flow (laptop browse, MagicDNS, nginx -> `out/`, GitHub Actions + `tag:ci` -> `tag:dev-server:22`) and adjusted wording to match.

### Architecture

```text
Laptop (Tailscale) or Mobile Phone (Tailscale) -> EC2 (Tailscale + nginx) ->out/
```

```mermaid
flowchart LR
  subgraph clients [Clients]
    Laptop["Laptop - Tailscale client"]
  end

  subgraph cicd [CI CD]
    GHA["GitHub Actions runner - tag ci"]
  end

  subgraph tailnet [Tailnet private mesh]
    DNS["MagicDNS FQDN"]
  end

  subgraph ec2 [AWS EC2 tag dev-server]
    TS["Tailscale node"]
    Nginx["nginx"]
    Out["static export out/"]
    TS --> Nginx
    Nginx --> Out
  end

  Laptop -->|"HTTP browse"| DNS
  DNS --> TS
  Laptop -->|"SSH ops"| TS
  GHA -->|"SSH deploy ACL"| TS
```



**Paths**


| Path        | Who            | How                                              | ACL / identity                  |
| ----------- | -------------- | ------------------------------------------------ | ------------------------------- |
| Browse      | Laptop         | HTTP to MagicDNS -> nginx -> `out/`              | Tailnet member                  |
| Ops SSH     | Laptop         | SSH to MagicDNS hostname                         | Tailnet member                  |
| Auto-deploy | GitHub Actions | Runner joins Tailnet, SSH + `setup-dev-nginx.sh` | `tag:ci` -> `tag:dev-server:22` |


- **Production**: GitHub Pages (`main`) : public, no Tailscale
- **Development**: EC2 + Tailscale (`development` branch), with **Development site** banner.

Traffic stays on the Tailnet: your laptop and the EC2 node are peers. The portfolio is served by nginx on the VM and addressed by MagicDNS (`development-website.<tailnet>.ts.net`), so nothing on ports 80/443 needs to be public. 

**What NordVPN was used for here:**  
EC2 security groups allow SSH only from a known public IP which was set during key pair addition. With NordVPN connected, the laptop’s egress IP changes, so:

```bash
ssh -i ~/Downloads/developer.pem ec2-user@ec2-XX-XX-XX-XX.region.compute.amazonaws.com
```

should **fail** (source IP no longer matches the allow list). That proves the VM is not “open to the world” : a random or VPN-shifted IP cannot SSH in. After Tailscale is up, the same laptop reaches the host over the Tailnet (`development-website.tailXXXX.ts.net`) without widening the public security group. Turning Tailscale **off** again drops MagicDNS / Tailnet SSH, which is the positive and negative proof pair for this demo.

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

Install and join your Tailnet ([Install Tailscale on Linux](https://tailscale.com/docs/install/linux)):

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

You need Tailscale [auth keys](https://tailscale.com/docs/features/access-control/auth-keys) for connecting your AWS VM to your Mesh Network without interactive browser login.  
For that go to Tailscale dashboard -> Settings -> Keys -> `Generate auth Key..` ([Keys page](https://login.tailscale.com/admin/settings/keys)).  
Give it a Description `aws-tailscale-demo`, then run on VM [tailscale up](https://tailscale.com/docs/reference/tailscale-cli/up)

```bash
sudo tailscale up --auth-key="tskey-auth-xxxxx-xxxxx"  --hostname=development-website  --accept-routes
```

`--hostname` sets the machine name used in MagicDNS. See also [key and secret management](https://tailscale.com/docs/reference/key-secret-management) for storing auth keys safely (do not commit them).

This will add Tailscale to your mesh network. It should be visible to you on [https://console.tailscale.com/admin/machines](https://console.tailscale.com/admin/machines) ([Machines](https://login.tailscale.com/admin/machines)).

**Negative test with NordVPN (different public IP):**  
With the EC2 security group allowing SSH only from your usual public IP, connect NordVPN on the laptop so egress uses another IP, then retry public SSH:

```bash
ssh -i ~/Downloads/developer.pem ec2-user@ec2-XX-XX-XX-XX.region.compute.amazonaws.com
```

That attempt should **fail** : the VM intentionally blocks the VPN’s exit IP. This is not “Tailscale vs NordVPN as products”, it just shows that locking SSH to a known IP works, and that a consumer VPN does not magically grant private access. Full framing: [Traditional approach vs Tailscale](#traditional-approach-vs-tailscale).

Once the node is on the Tailnet, SSH via the [MagicDNS](https://tailscale.com/docs/features/magicdns) name instead of the public DNS:

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
# Use the MagicDNS FQDN from the Machines page (see https://tailscale.com/docs/features/magicdns)
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

Open the [MagicDNS](https://tailscale.com/docs/features/magicdns) name on your Laptop with Tailscale connected (your tailnet DNS name is on the [DNS page](https://login.tailscale.com/admin/dns) of the admin console):

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

GH runners never needs a public SSH ingress. The runner authenticates into the Tailnet with an [OAuth client](https://tailscale.com/docs/features/oauth-clients) and is limited by [tags](https://tailscale.com/docs/features/tags) / ACLs. **Why?** Because we do not want our auth keys to expire in 90 days. Nodes are typically **ephemeral** and tagged (`tag:ci`): they join for the job, then disappear, no permanent “CI runner” left on the Tailnet. 

Pushing to `development` can redeploy the VM automatically. The runner joins the Tailnet, then SSHs to the EC2 and runs `setup-dev-nginx.sh`.

This uses the official [Tailscale GitHub Action](https://tailscale.com/docs/integrations/github/github-action) so the workflow gets an ephemeral Tailnet node for the duration of the job.

Workflow file: `.github/workflows/deploy-dev-tailscale.yml`

#### A. Tailscale ACL tags

In the Tailscale admin console -> **Access controls** ([tailnet policy file](https://tailscale.com/docs/features/tailnet-policy-file)), define a CI tag and allow it to reach the VM (SSH / port 22). Tags group non-human devices by purpose ([Group devices with tags](https://tailscale.com/docs/features/tags)); see also [ACL policy examples](https://tailscale.com/docs/reference/examples/acls) and the [policy file syntax reference](https://tailscale.com/docs/reference/syntax/policy-file).

Example ACL fragment:

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

On the EC2, tag the machine as `tag:dev-server` (Tailscale admin -> machine -> Edit ACL tags), or re-auth with `[--advertise-tags](https://tailscale.com/docs/reference/tailscale-cli/up)`:

```bash
sudo tailscale up --auth-key="tskey-auth-..." --hostname=development-website --advertise-tags=tag:dev-server
```

#### B. Tailscale OAuth client (for GitHub Actions)

The Action creates short-lived nodes via an [OAuth client](https://tailscale.com/docs/features/oauth-clients) with the `auth_keys` scope. Create it under [Trust credentials](https://login.tailscale.com/admin/settings/trust-credentials):

1. Tailscale admin ->**Settings** ->**Tailnet Settings** ->**Trust Credentials**
2. Description in step 1: `github-actions`
3. Scopes: enable devices / auth-key creation
4. Set **Tags**: `tag:ci`
5. Copy **Client ID** and **Client secret**

#### C. GitHub repository secrets

Repo ->**Settings** ->**Secrets and variables** ->**Actions**:


| Secret               | Value                                                         |
| -------------------- | ------------------------------------------------------------- |
| `TS_OAUTH_CLIENT_ID` | Tailscale OAuth client ID                                     |
| `TS_OAUTH_SECRET`    | Tailscale OAuth client secret                                 |
| `EC2_SSH_KEY`        | Full contents of `developer.pem` (private key)                |
| `EC2_HOST`           | `development-website.tailXXXX.ts.net`                         |
| `EC2_USER`           | `ec2-user` (optional; defaults to `ec2-user` in the workflow) |


Keep `.env` with `SERVER_NAME=...` on the VM only (gitignored). The Action does not upload it. Store OAuth secrets only in GitHub encrypted secrets ([key and secret management](https://tailscale.com/docs/reference/key-secret-management)).

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

## What worked well

- Keeping the use case small: one private static site on EC2, reached only over the Tailnet, was enough to show MagicDNS, SSH, ACLs/tags, and CI without overbuilding.
- Auth key for the long-lived EC2 node + OAuth for ephemeral GitHub Actions runners was a clean solution which I saw in the documentation.
- Negative tests with NordVPN by shifting the public IP was blocked by the security-group SSH. Turning Tailscale off made Tailnet access fail on same laptop, was very clear before/after.
- A single `setup-dev-nginx.sh` script made redeploys repeatable for manual pull and Github Actions with `SERVER_NAME` kept on the VM in `.env` so secrets and hostnames never landed in git.
- Tagging (`tag:ci` → `tag:dev-server:22`) made the least-privilege story easy to explain and enforce.
- Adding another user to the tailnet was super easy using the tailnet dashboard. Best way to manage a team of developers and onboarding them to a private project.

## What was difficult or surprising

- First-time bootstrap still needs a narrow public SSH allowlist (or Session Manager) before Tailscale is up. After that, the aim is to stop relying on public SSH for day-to-day access.
- nginx on Amazon Linux needed home-directory permissions fixed so the service account could read `~/app/out`.
- First GitHub Actions failed because my github branch was outdated and I have updated it locally for making minor adjustments in the nginx deployment scripts

## What I would do differently with more time

- There are a lot of access control settings, I would deep dive into each part and seek out examples for using them in complex scenarios as demos.
- Though I have not shown to many logs in the video demo, It showed clearly what runner was connected. It gives a lot of information which I would like to deep dive into seeing what each action generates.
- DNS configuration as well would be nice to play around with. But did not get time to look into and see how to play around with that.
- If I had more time, I would setup an AI chat agent on my Gaming laptop with a private site on which I can chat with my locally running Chat bot. Lets call it my second brain, always active and accessible from anywhere via my Tailscale mesh network. It would store and keep all of my stories, journals etc. So I just need to chat with it. Even my calender if I added it as a tool.

## Support

If you encounter issues, open a GitHub issue.

---

Built with Next.js · Production on GitHub Pages · Dev preview via Tailscale + EC2