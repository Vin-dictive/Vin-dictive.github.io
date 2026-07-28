# Q&A prep — Tailscale walkthrough

Companion to `document.md` and `index.html`. Likely questions from Tailscale sales, other SEs, or interviewers — with answers you can say out loud.

Suggested use: skim the **one-liner** before Q&A; expand only if they dig in.

---

## Positioning & use case

### Who is this for — solo developers, startups, or enterprise IT?

**One-liner:** Same pattern scales; the audience changes who owns identity and policy.

**Say:**

- **Solo / indie:** private preview without public staging, MagicDNS on phone + laptop, invite a friend.
- **Startup:** shared staging, contractors, CI → private host, fewer IT tickets than a classic VPN.
- **Enterprise IT:** same mesh idea, but SSO, tags/ACLs/grants, device approval, and clear ownership of who can reach what. My demo is the thin end of that wedge — identity-based private access, not “open the whole corp LAN.”

---



### How is this different from Cloudflare Access, Google OAuth, or an IP allowlist?

**One-liner:** Those protect a *public* edge or a shifting IP. Tailscale keeps the service off the public internet and ties access to Tailnet identity.

**Say:**

- **OAuth / Access** still often means a public URL (or app gateway) plus identity at the HTTP layer. Great for apps; heavier for “show this draft + SSH + CI deploy.”
- **IP allowlists** break when laptops move, phones change networks, or CI runners come from arbitrary IPs (Actions).
- **Tailscale:** device joins by identity → MagicDNS / mesh reachability. My EC2 preview does not need public 80/443. CI reaches the host over the Tailnet without opening the security group to the world.

I still used OAuth before — for serverless pieces — and it worked, but it was a maze of clients, redirects, and secrets before I even had private networking. Here identity and network join are the same story.

---



### When would you still recommend a traditional “Cosco” VPN?

**One-liner:** When the job is “put me on the whole corporate LAN through a managed hub,” not “connect these people and services by identity.”

**Say:**

- Legacy apps that assume you’re “on the corp network.”
- Central IT already standardized on hub-and-spoke, PAC files, split tunnel, and compliance tooling around that appliance.
- Tailscale (and my use case) shines for private staging, contractor preview, CI-to-private-host, and mesh across laptop / phone / VM / CI — not as a drop-in replacement for every Cosco remote-access mandate overnight.

---

### Is private staging the main customer story, or a wedge?

**One-liner:** Staging is the demo; the story is identity-based connectivity for people and automation.

**Say:**
Private staging is concrete and demable in 45 minutes. The real product story is: one Tailnet for humans, tagged machines, and ephemeral CI — with ACLs deciding reachability. From there you expand to multi-env MagicDNS, lab devices, home/lab SSH, API-driven invites, etc.

---

### Why keep any public SSH at all?

**One-liner:** Bootstrap only — get Tailscale onto the box the first time. Day-two access should be Tailnet-first.

**Say:**
Before the node is on the Tailnet, something has to install and authenticate Tailscale: narrow SG allowlist from my IP, SSM, or an image that already joins. I kept a tight public SSH path for bootstrap and early debugging. Ideal end state: no standing public SSH; deploy and ops over Tailscale SSH (or SSM) only. That’s on my “what I’d improve” list.

---

### Why auth key for EC2 but OAuth for CI?

**One-liner:** Stable server vs ephemeral runners from unknown IPs.

**Say:**

- **EC2 auth key:** long-lived `tag:dev-server`. Bootstrap once from my allowlisted IP → `tailscale up --auth-key` → stable MagicDNS.
- **CI OAuth:** GitHub runners appear from **any** IP. I refuse to open AWS SSH to the Actions IP space. Runner joins via OAuth, mints ephemeral `tag:ci`, SSHs over the mesh, deploys, leaves. OAuth is scoped so CI can only create keys for `tag:ci`.

---

### Walk me through least privilege for `tag:ci`

**One-liner:** CI can talk to the dev server on SSH for deploy — nothing else by policy.

**Say:**

- Tags are **machine** identity, not people.
- `tag:dev-server` = EC2 preview host.
- `tag:ci` = ephemeral Actions nodes.
- ACL: `tag:ci` → `tag:dev-server` (SSH for deploy). Humans use normal member access for browse/SSH.
- OAuth client cannot mint arbitrary tags — only `tag:ci`.
- Analogy: badge role that opens one floor, not the whole building.

---

### If a CI key or OAuth client leaks, what’s the blast radius?

**One-liner:** Scoped to minting/using `tag:ci`, which ACL only allows to reach `tag:dev-server` over the allowed ports.

**Say:**
Revoke the OAuth client / auth material in the admin console, rotate GitHub Secrets, check [admin logs](https://console.tailscale.com/admin/logs) for ephemeral node create/revoke. Attacker does not inherit “whole Tailnet admin” from a correctly scoped CI credential. Still treat secrets as production secrets — rotate on suspicion.

---

### Tailscale SSH vs classic SSH over the Tailnet?

**One-liner:** Today: classic SSH over the mesh; next: Tailscale SSH and drop standing SSH in the SG where possible.

**Say:**
Reachability is already Tailnet-based (MagicDNS hostname, no public 80/443 for the site). Auth for the shell is still key-based SSH in this demo. Moving to Tailscale SSH would align login with Tailscale identity/policy and help close bootstrap SSH further — called out explicitly in improvements.

---

### How do ACLs differ from tags? Who owns ACL changes?

**One-liner:** Tags label *what the machine is*; ACLs decide *who may talk to whom*.

**Say:**
I define tags in policy and assign them at join (auth key / OAuth). ACLs reference those tags (and users/groups). In a real team, platform/security owns the policy file; app teams request tag + grant changes. Solo Tailnet: I own both, which is fine for a preview — not fine for a multi-lab without process.

---

### Commercial VPN failed public SSH — what did that prove?

**One-liner:** Changing your public IP is not Tailnet membership. The SG isn’t “open to the internet.”

**Say:**
Consumer/commercial VPN shifts egress IP. My SG only allows SSH from my real IP. So VPN-on still fails public SSH — good. Tailscale-on reaches the host over the mesh without widening HTTP to the world. Separates “privacy VPN” from “identity mesh to my private host.”

---

### How do you show ephemeral CI nodes were created and revoked?

**One-liner:** Green Actions run + Tailscale admin logs for join/leave of `tag:ci`.

**Say:**

1. Push `development` → workflow green.
2. Open [console.tailscale.com/admin/logs](https://console.tailscale.com/admin/logs).
3. Expect ephemeral node created for the runner, then revoked when the job ends. That’s the “hello, do the job, goodbye” proof.

---

### What fails if MagicDNS / DNS search is wrong?

**One-liner:** Mesh may be up but the friendly name doesn’t resolve — check Tailscale DNS, not only the app.

**Say:**
Symptoms: browser can’t resolve `*.ts.net`, SSH to MagicDNS hostname fails while IP might still work. Fixes: client connected, MagicDNS enabled on the Tailnet, correct DNS settings on the OS, no corporate DNS swallowing the name. Demo validation is Tailscale on → loads; off → can’t be reached.

---

### Could a teammate reach the preview without an invite?

**One-liner:** No — they need Tailnet membership (and ACL permission). Invite was trivial in my test.

**Say:**
Not on the Tailnet ⇒ no MagicDNS path to the private host. Invite adds identity; ACLs still gate SSH vs browse if you tighten further. That’s the contrast to sharing an SSH key and hoping it isn’t forwarded.

---

### Revoke → rejoin left SSH broken — what happened?

**One-liner:** Node looked online, but SSH identity/host key / policy leftovers didn’t match. Treat revoke-and-rejoin as its own test.

**Say:**
After revoking auth keys or machines and bringing nodes back, they sometimes showed online on the Tailnet while SSH still failed — stale host keys, old node identity, or Tailscale SSH / ACL expectations from the previous join. Customer lesson: validate **connectivity and auth** after revoke cycles, not just “green in the admin UI.”

---

### Why did Caddy + Tailscale server setup fail?

**One-liner:** I couldn’t get a stable Caddy + Tailscale server setup for this preview; nginx served the static `out/` reliably.

**Say:**
Be honest: I hit breakage and switched to nginx on Amazon Linux for the static site. Frame it as choosing the boring path for the demo, not a claim that Caddy is unsupported. If asked product-wise: I’d revisit with current Tailscale serve / HTTPS docs once the mesh path was proven.

---

### nginx home-dir permissions — Tailscale or app packaging?

**One-liner:** App packaging. nginx user couldn’t read `~/app/out` until home-dir perms were fixed.

**Say:**
Unrelated to Tailscale networking. Classic “web server user vs files in `/home`.” Message to customers: separate mesh access from OS/user permissions; both must work.

---

### Shortest path you’d give a prospect?

**One-liner:** Client + Tailnet → tagged server auth key → MagicDNS browse proof → optional CI OAuth later.

**Say:**

1. Install client, sign in.
2. Bring up one private host with an auth key and a tag.
3. Turn Tailscale off/on to prove the preview isn’t public.
4. Add a second user invite for team preview.
5. Only then wire CI with scoped OAuth + ephemeral tags.

Don’t lead with ACLs and OAuth on day one unless they’re already sold on the mesh.

---

### Docker / Kubernetes version?

**One-liner:** Package the app normally; put Tailscale beside it — sidecar, operator, or subnet router depending on cluster needs.

**Say:**

- **Docker:** container or sidecar that joins with an auth key / OAuth identity and tags.
- **Kubernetes:** explore operator / sidecar patterns so pods get Tailnet identity, or subnet router for a CIDR. I haven’t built that yet; it’s the natural next architecture demo after EC2 + Actions.

---

### Subnet routers or exit nodes for this pattern?

**One-liner:** Not required for tagged node-to-node staging; use them when you must reach a whole LAN or egress via a specific node.

**Say:**
My demo is peer access to one MagicDNS host. Subnet router: “advertise this VPC/LAN.” Exit node: “egress through that machine.” Don’t upsell them unless the customer’s pain is entire-network reachability or forced egress.

---

### Automate invite/revoke via API?

**One-liner:** Yes — that’s how I’d attach joiner/leaver workflows to the mesh.

**Say:**
Tailscale API to add/remove users or manage keys from another system (HR, class roster, CI). Matches the lab story: students come and go; mesh membership shouldn’t be a manual console chore.

---

### “We already have Zscaler / GlobalProtect / WireGuard.”

**One-liner:** Those often solve corporate remote access or DIY tunnels. This demo is identity mesh for private services and CI without opening the host to the world.

**Say:**

- If Cosco-style VPN already gives every laptop the whole LAN, ask whether staging and CI still need tickets and brittle allowlists.
- WireGuard is great plumbing; Tailscale adds identity, MagicDNS, keys/OAuth, tags, ACLs, and ephemeral CI nodes on top.
- Offer a parallel PoC: one private preview + one Actions deploy — measure ticket count and time-to-share vs the incumbent.

---

### One sentence for an SE to reuse?

**Say:**  
“We put a private staging site and CI deploy on a Tailnet so people and automation reach it by identity — no public web ports, no opening SSH to every runner IP.”

---

### What objection did you almost have, and how did the product answer?

**Say:**
I’d lived through OAuth mazes and fiddly consumer virtual-LAN tools, and corporate VPN ticket friction. Objection: “Another network product to configure.” What flipped it: client + identity join, MagicDNS I can remember, tags/ACLs that match how I already think about roles, and CI that joins ephemerally without punching AWS for Actions IPs. Docs and a minimal admin UI made the settings obvious without a night of DNS archaeology.

---

### What would you demo next in a paid PoC?

**Say:**

1. Auto-approve / tighter device approval flow.
2. Deploy over Tailscale SSH; shrink public SG to bootstrap-only or none.
3. Multi-team ACL/grants (least privilege beyond one `tag:ci`).
4. If relevant: subnet router into a private VPC, or a small k8s/sidecar spike.

---

### What surprised you most?

**Say:**
How far a **small** scope still went — MagicDNS, SSH, tags, and CI on one Tailnet — and how obvious the negative tests were (Tailscale off, commercial VPN ≠ access). Also: revoke/rejoin looking “fine” in the UI while SSH was still wrong — easy to miss without an explicit check.

---

### What should a customer *not* do based on this project?

**Say:**

- Don’t open SSH to `0.0.0.0/0` “so CI works.”
- Don’t reuse a powerful OAuth client for CI; scope to the CI tag only.
- Don’t assume revoke succeeded because the node list looks empty — verify logs and a real SSH/browse attempt.
- Don’t conflate a commercial privacy VPN with Tailnet access in the security story.

---

### If you only had 10 minutes, which demo do you keep?

**One-liner:** Browse on/off (and optional commercial VPN contrast), then one sentence on CI.

**Say:**
Demo 1 sells the product visually: Tailscale on → MagicDNS site + dev banner; off → unreachable. If there’s time, flash Actions green + “ephemeral `tag:ci` in logs.” SSH and ACL deep-dives support the security conversation but aren’t the hook.

---

