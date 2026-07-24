# Speaker notes / talking points

Companion to `index.html`. Slides stay short; this file holds the wordy narrative you can say out loud.

Suggested timing: ~45 min present + ~15 min Q&A.

---

## 1. Title

**Slide cue:** Brand + “Private development preview over a Tailnet”

**Say:**
- Introduce yourself and the repo briefly.
- Frame this as a technical walkthrough of a real private preview pattern, not a product pitch deck.
- Goal for the room: leave able to explain (and demo) why Tailscale beats open ports, IP allowlists, and heavyweight corp VPN for private staging.

---

## 2. Agenda

**Say:**
- Walk the arc: developer pain → personal story → Cosco vs Tailscale → use case → architecture → live demos → tags/creds → proof → VPN contrast → reflection → value for newcomers → Q&A.
- Call out that demos are the heart of the session; conceptual slides are short on purpose.

---

## 3. Story (You're a software developer)

**Slide cue:** Bullets + `dev.gif` typing meme on the right

**Say:**
- Paint the picture: you are shipping a website. The development build still has unfinished features, debug banners, or known security holes.
- You do not want crawlers, strangers, or competitors finding that URL.
- You also do not want to expose essential services to the public internet, like a database. Private preview should not mean “open the DB (or admin tools) to the world.”
- Second scenario: you prototyped something on your laptop. You want a friend or teammate to click through it. You do not want to publish to the public web or open ports on your machine.
- Traditional answers (public staging URL, IP allowlists, corporate VPN tickets) are slow, brittle, or overkill for “just show this to the right people.”
- Let the image land the joke: this is the “deep in the terminal” developer energy before we talk about simpler private access.
- Analogy if it helps: backstage pass for a show still in rehearsal. Cast and crew get in; the public stays out.

---

## 4. Story time (What I tried before Tailscale)

**Slide cue:** Bullets + `monkey-developer.gif` on the right

**Say:**
- Short personal bridge before Cosco: these pains are not theoretical for me.
- **GCP OAuth for serverless:** I set up Google OAuth so serverless pieces could authenticate. It meant bouncing across consoles, OAuth clients, redirect URIs, scopes, and secrets. It eventually worked, but it was complicated and easy to get wrong, especially when the “app” was not a single long-lived server.
- That experience stuck with me: identity plumbing in the cloud can become a maze before you even solve private networking.
- **Private VPNs for gaming:** I have used private VPN / virtual LAN tools to play with friends as if we were on the same network. The idea is great. In practice it felt slow, fiddly to set up, and annoying to keep working.
- **Corporate Cosco VPN:** Same pain in enterprise form. Ticket after ticket just to get onto the network: profiles, certs, MFA, group membership, then another ticket when something breaks.
- Let the GIF land the joke: lots of effort, not a lot of elegance.
- Punchline into Cosco / Tailscale: I already knew “private network” solutions can be painful. For essential services (preview sites, DBs, CI), I wanted something that stays simple: identity, mesh, no appliance theater.

---

## 5. Cosco VPN vs Tailscale

**Slide cue:** Cosco brand + two-column comparison

**Say:**
- “I don’t want to name real competitors, so for example’s sake let’s call it Cosco VPN, tennis-ball logo and all.”
- (Aside for you only: Cosco stands in for Cisco-style enterprise VPN stacks.)
- Cosco path: IT ticket, specialist onboarding, expensive, and may require hardware installation (VPN headend appliance) or a licensed appliance VM. Gateway-centered, huge settings surface, often “you’re on the whole network,” too slow for a simple private preview. Developers don’t have time for all this.
- Tailscale path: install client, sign in with identity, join the Tailnet. Peer-to-peer mesh; you don’t need a Cosco-style VPN appliance for this use case.
- Access is identity + tags + ACLs, not “whitelist this laptop’s IP and hope it doesn’t change.”
- Least privilege is natural: CI can reach the server on port 22 only; humans browse MagicDNS; no public 80/443.
- Machines get stable names (MagicDNS). Easy integration with existing CI/CD (OAuth-joined ephemeral nodes instead of a forever shared join key).
- Bottom line for Sales/SE: Cosco is built for classic corporate remote access. Tailscale is built for connecting people and services by identity, which matches private staging, contractor preview, and CI-to-private-host patterns.
- Tie back to story time: Cosco is the enterprise version of “complicated private network.” Gaming VPNs were the hobby version. Tailscale is what I wanted instead.

**Optional deeper points if asked:**
- Faster time-to-value for a POC (minutes vs ticket cycles).
- Works across laptops, phones, cloud VMs, and ephemeral CI without redesigning hub-and-spoke.
- Fewer moving parts for the developer: no PAC files, split-tunnel checklists, or cert stores just to open a preview URL.
- Still compatible with enterprise needs: SSO, ACLs/grants, device posture (as relevant to the customer’s plan).

---

## 6. Use case

**Slide cue:** Bullets + `privacy.webp` on the right

**Say:**
- This walkthrough solves those exact pains.
- I run a **development / staging** build of my website on AWS EC2 and share it over a Tailnet.
- Teammates (or me on another device) open a MagicDNS URL with identity-based access.
- No public ports 80/443 required for the preview.
- Same pattern as an internal staging site, or showing a friend a prototype, without putting the draft on the open web.
- Features stay private until they are ready for production.

---

## 7. Assumptions / prerequisites

**Say (lightly; this is mostly for you):**
- AWS account, small Amazon Linux EC2, SSH key.
- Tailscale account / Tailnet; client on laptop (phone optional).
- Auth key for the server; OAuth client with `auth_keys` for CI.
- GitHub secrets for Actions: `TS_OAUTH_CLIENT_ID`, `TS_OAUTH_SECRET`, `EC2_SSH_KEY`, `EC2_HOST`.
- First bootstrap may briefly allow SSH from your public IP until Tailscale is up; day-to-day access uses the Tailnet.
- Demo host: `development-website.tailc52fb7.ts.net`.

Skip deep detail for Sales; SEs may ask about OAuth scope or bootstrap.

---

## 7b. Join EC2 to the Tailnet

**Say:**
- After bootstrap SSH from your allowlisted IP, install Tailscale and join with an **auth key**.
- `--hostname=development-website` gives the stable MagicDNS name; `--accept-routes` if you use subnet routes.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up \
  --auth-key="tskey-auth-XXXXXXXX" \
  --hostname=development-website \
  --accept-routes
```

Do not paste a live auth key into the public deck — use a placeholder or rotate after demos.

---

## 8. Architecture (Three paths, one Tailnet)

**Keys:** `1` Browse · `2` SSH · `3` CI · `0` All

**Say while tabbing:**
- **Browse:** Laptop or phone with Tailscale hits MagicDNS; nginx serves the static export. No public 80/443.
- **Team SSH:** Same MagicDNS hostname over Tailscale on port 22 for ops. Not the public EC2 DNS name.
- **CI deploy:** Ephemeral GitHub Actions node with `tag:ci` joins the Tailnet and SSH-deploys to `tag:dev-server` on port 22 only.
- **All paths:** One Tailnet connects people, CI, and EC2. Identity and tags decide who can reach what.

---

## 9. Demo browse (1 of 3)

**Claim:** Tailscale on → site loads. Tailscale off → fails. Same result with commercial VPN on or off.

**Do:**
1. Tailscale ON → open MagicDNS URL / curl headers → expect Dev banner + HTTP 200 (try with commercial VPN on, then off).
2. Tailscale OFF → curl with short timeout → expect timeout / can’t connect (again with commercial VPN on or off).
3. Reconnect Tailscale before the next demo.

**Say:** This proves the preview is private to the Tailnet. A commercial VPN changing your egress IP does not get you in, and turning it off does not change the Tailscale-on success path.
---

## 10. Demo SSH (2 of 3)

**Claim:** MagicDNS SSH lands on the real AWS EC2. Public SSH fails when your IP is not allowlisted (commercial VPN egress demo).

**Do:**
1. SSH via MagicDNS with the pem key → shell on Amazon Linux.
2. On the box: `tailscale status` (and hostname) → node online with MagicDNS name.
3. Show AWS EC2 Security Group settings (`AWS-console.png`): SSH from My IP for bootstrap; no public 80/443 for the preview.
4. Optional negative: Commercial VPN ON → SSH to public EC2 DNS → timeout / denied because SG blocks that egress IP.

**Say:** Same laptop can reach the host over Tailscale without widening HTTP to the world. Consumer VPN egress is not a substitute for Tailnet membership.

---

## 11. Access control (Tags)

**Say:**
- Tags are machine identity, not people.
- `tag:dev-server`: shared server identity for the EC2 portfolio host, not “my user account.”
- `tag:ci`: ephemeral Actions nodes with least privilege for deploy only.
- ACL: `tag:ci` may reach `tag:dev-server` on port 22 only.
- Humans use normal member access for browse/SSH.
- OAuth is scoped so CI can only create keys for `tag:ci`.
- Analogy: tags are job roles on a badge. “CI runner” may open the server’s SSH closet, not every office on the floor.

---

## 12. OAuth vs auth key

**Say:**
- EC2 gets an auth key: one long-lived server, `tailscale up --auth-key`, stable MagicDNS hostname.
- CI gets an OAuth client: each GitHub Actions run creates an **ephemeral** `tag:ci` node on demand when the runner starts.
- When the job ends, that node is revoked / disappears. Nothing durable left on the Tailnet from CI.
- Granular control: the OAuth client is scoped so it can only mint keys for `tag:ci`, and ACL only allows `tag:ci` → `tag:dev-server:22`.
- No forever reusable join key sitting in GitHub secrets. Smaller blast radius if secrets leak.
- This is the credential pattern to recommend when customers ask “how should CI join the Tailnet?”

---

## 13. Demo CI (3 of 3)

**Claim:** Push `development` → Actions joins Tailnet → EC2 preview updates.

**Do:**
1. Small edit, commit, `git push origin development`.
2. Open GitHub Actions → wait for “Deploy development (Tailscale → EC2)” to go green.
3. Refresh MagicDNS site; optional SSH `git log -1` on the VM.

**Say / timing tip:** Narrate OAuth + tags while the workflow runs so you don’t dead-air wait. If CI is slow, have a recent green run ready as backup.

---

## 14. Validation

**Say (recap, don’t re-demo unless asked):**
- Positive: Tailscale on → MagicDNS → site loads.
- Negative: Tailscale off → can’t be reached.
- Commercial VPN: public SSH fails → VM isn’t open to shifted egress IPs.
- Tailnet SSH works without opening 80/443.
- CI path works end to end.

---

## 15. VPN vs Tailscale (Cosco / commercial VPN / mesh)

**Keys:** `1` Cosco hub · `2` Commercial egress · `3` Tailscale mesh

**Say:**
- Same word “VPN,” three different jobs. Tab through the diagrams.
- **Cosco hub:** Laptop tunnels to a Cosco appliance (hardware or VM). Everything goes through that hub into the corp LAN. IT tickets to get on; more tickets for special access like a private preview. Expensive and gateway-centered.
- **Commercial egress:** A commercial VPN changes your public IP. Great for “look like I’m elsewhere.” Your EC2 / private preview is not on that path. Phone and CI are not linked as peers.
- **Tailscale mesh (how it works):** Devices join by identity. Laptop, phone, teammate, CI, MagicDNS, and EC2 share one Tailnet. Peer links, not a Cosco appliance. Tags and ACLs decide who reaches what (e.g. CI → :22 only).
- Analogy: A commercial VPN is a disguise on the public street. Cosco is a locked office building with a security desk and a ticket queue. Tailscale is a membership card for a private club: the bouncer checks who you are.

---

## 16. What worked well

**Say:**
- Small scope still demonstrated MagicDNS, SSH, tags, and CI.
- Auth key for EC2 + OAuth for Actions matched what the docs intend.
- Negative tests (Commercial VPN + Tailscale off) made the story obvious to a mixed audience.
- One setup script for humans and CI kept ops simple.
- Inviting another user for team preview was trivial.
- Excellent documentation made setup and the right patterns easy to follow.

---

## 17. Difficult or surprising

**Say (credibility; don’t linger):**
- Bootstrap still needs a narrow public SSH path (or SSM) before Tailscale is up.
- nginx on Amazon Linux couldn’t read `~/app/out` until home-dir permissions were fixed.
- First Actions failure was stale remote vs local script fixes: coordination issue, not Tailscale itself.
- Lesson for customers: plan bootstrap separately from day-two Tailnet access.

---

## 18. What I'd improve

**Say:**
- With more time I’d stand up **another demo** aimed at different Tailscale features (not just private static preview).
- I’d dig into a **Docker** packaging of this pattern and how it would run inside a **Kubernetes** cluster (sidecar / operator / subnet router patterns worth exploring).
- Real next step: the **Cow lameness** project with the **AWP UBC lab** ([HerdWell](http://134.87.8.85/), [architecture image](https://github.com/Vin-dictive/deploy-docs-cow-lameness/blob/main/image.png)). That needs an education account, and user management / access control is more complex than this personal Tailnet preview. I’d want to implement a **full-scale** Tailscale solution there (roles, invites, ACLs/grants, maybe shared lab devices).
- Tighten ops with **auto-approval** for devices, and move CI/CD deploy fully onto **Tailscale SSH** — today SSH ports are still open for bootstrap / deploy paths.
- Still want deeper ACL / grants demos for multi-team least privilege.
- Richer Action logs walkthrough: what the ephemeral CI node sees on the Tailnet.

---

## 19. Value (for someone new to Tailscale)

**Slide cue:** 3×3 hover tiles; blue center = “possibilities are endless”

**Say:**
- Pretend the listener has never used Tailscale: install, sign in, devices join one private Tailnet.
- Point around the ring of tiles:
  - **Local projects:** MagicDNS URL to a WIP site, no public deploy.
  - **Environments:** custom MagicDNS names for dev / staging / prod.
  - **Local games:** private LAN with friends.
  - **Home LLM:** Open WebUI to a model you run yourself.
  - **NAS / home cloud:** your storage from anywhere on the Tailnet.
  - **This walkthrough:** same pattern as the EC2 staging preview.
  - **Invite teammates:** share by identity, not IP allowlists or Cosco tickets.
  - **Home lab SSH:** workstation or Pi from your phone, privately.
- Land on the center tile (different color): the possibilities are endless. One pattern: identity on a Tailnet, private access without the public internet.

---

## 20. Questions? (empty slide)

**Say:**
- Leave the slide blank so the room focuses on discussion.
- Invite Sales questions on positioning / objections, SE questions on ACLs, OAuth, bootstrap, and CI patterns.
- Offer to re-run any demo path if useful.
