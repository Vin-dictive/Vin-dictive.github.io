# Speaker notes / talking points

Companion to `index.html`. Slides stay short; this file holds the wordy narrative you can say out loud.

Suggested timing: ~45 min present + ~15 min Q&A.

---

## 1. Title

**Slide cue:** Brand + “Private development preview over a Tailnet”


- HI Good morning My name is Vinay and I am here to present my Demo. 

---

## 2. Agenda


- We will Walk thru the arc of developer pain → personal story → Why Tailscale? → use case → architecture → live demos → access controls → proofs of it working → VPN contrast → My reflection, things that I faced → value for newcomers → Q&A.

---

## 3. Story (You're a software developer)


- Imagine you are a software developer still having unfinished features, debug banners, or known security holes.
- You do not want crawlers, strangers, or competitors finding that URL.
- You also do not want to expose essential services to the public internet, like a database. 
- Maybe you want to show a Private preview of what you are making.
- Second scenario: you prototyped something on your laptop. You want a friend or teammate to click through it. You do not want to publish to the public web or open ports on your machine.
- Your Traditional solutions like (public staging URL, IP allowlists, corporate VPN tickets) are slow, brittle, or sometimes overkill for “just showing this to the right people.”
- Analogy if it helps: backstage pass for a show still in rehearsal. Cast and crew get in; the public stays out.

---

## 4. Story time (What I tried before Tailscale)

**Slide cue:** Bullets + `monkey-developer.gif` on the right


- I have tried looking for various solutions to solve the previous problems 
- I set up Google OAuth so serverless pieces could authenticate. It meant bouncing across consoles, OAuth clients, redirect URIs, scopes, and secrets. It eventually worked, but it was complicated and easy to get wrong, especially when the “app” was not a single long-lived server.
- That experience stuck with me: identity management in the cloud can become a maze before you can even solve private networking.
- I have used private VPN / virtual LAN tools to play with friends as if we were on the same network. The idea is great. In practice it felt slow, fiddly to set up, and annoying to keep working with.
- When it came to Corporate VPN's - oh boi! Ticket after ticket just to get onto the network. These small workings creates friction which makes it hard to work when your a developer. 
- You want instance working results. You dont want a maze of configuration settings, with labels that only techincal people can understand. I have used them so trust me I know, what it feels like to browse to what is a DNS, and IP in the middle of the night. 

---

## 5. Cosco VPN vs Tailscale


- “I don’t want to name real competitors, so for example’s sake let’s call our traditional solutions, Cosco VPN”
- Cosco VPN requires IT specialist for onboarding, is expensive, and may require hardware installation. 
- It is Gateway-centered, huge settings surface, often “you’re on the whole network,” too slow for a simple private preview. Developers don’t have time for all this.
- Whereas the Tailscale path is like you install client, sign in with identity, join the Tailnet. Peer-to-peer mesh; you don’t need a Cosco-style VPN appliance for this use case.
- Access is identity + tags + ACLs, not “whitelist this laptop’s IP and hope it doesn’t change.”
- Humans can memorize MagicDNS and not a bunch of numbers for a development site.
- Easy integration with existing CI/CD.
- Bottom line is Cosco is built for classic corporate remote access. 
- Tailscale is built for connecting people and services by identity, which matches private staging, contractor preview, and CI-to-private-host patterns.
- It works across laptops, phones, cloud VMs, and CI without redesigning hub-and-spoke.
- Fewer moving parts for the developer to deal with: no PAC files, split-tunnel checklists, or cert stores just to open a preview URL.

---

## 6. Use case


- This walkthrough solves those exact pains.
- I run a **development / staging** build of my developer website on AWS EC2 and share it over a Tailnet.
- Teammates (or me on another device) open a MagicDNS URL with identity-based access.
- No public ports 80/443 required for the preview.
- Same pattern as an internal staging site, or showing a friend a prototype, without putting the draft on the open web.
- Features stay private until they are ready for production.

---

## 7. Assumptions / prerequisites

For this demo I have made a few assumptions, we can dive deeper into it in the Q and A session
- AWS account, small Amazon Linux EC2, SSH key.
- You know what SSH is.
- Tailscale account / Tailnet; client on laptop.
- Use understand what CICD is. 
If not I can explain it at the end with the help of analogies.

---

## 8. Architecture (Three paths, one Tailnet)

So there are 3 things, my demo is trying to solve 
**Say while tabbing:**
- Number 1 **Browse:** Laptop or phone with Tailscale hits MagicDNS. 
- Number 2 **Team SSH:** Same MagicDNS hostname over Tailscale allows for SSH. SSH means secure shell host.
- Number 3 **CI deploy:** GitHub Actions runners are tagged with `ci`. They temporarily join the our mesh, perform the SSH deployments on our tagged dev-server` tag:dev-server`.
- One Tailnet connects people, CI, and EC2. Identity and tags decide who can reach what.

---

## 9. Demo browse (1 of 3)

**Claim:** Tailscale on → site loads. Tailscale off → fails. Same result with commercial VPN on or off.

This proves the preview website of my developer website. You can see the clear bar on the top which says for my eye's only.

---

## 10. Demo SSH (2 of 3)

Same laptop can reach the host over Tailscale without widening HTTP to the world. 

Now if you look at this Screen shot of AWS EC2, under firewall, I setup the security group such that only I can access it using my IP. Not public IP from anywhere. This way I can reduce the attack vectors to my VM. Consumer VPN egress is not a substitute for Tailnet membership but it demonstrate that the above setting works and u cannot ssh from anywhere. So now imagine, u have another team member who needs access to this container, you can share your ssh key with him to access this container, but how can you be sure, they are not sharing it with someone else....?
So its important from a security point of view that we separate these things out, unique identity for traceability. Well as you can see Tailscale solves that problem as well. I will show you that.
---

## 11. Access control (Tags)

- Tags are machine identity, not people.
- `tag:dev-server`: is the server identity for the EC2 machine
- `tag:ci`: ephemeral Actions nodes with least privilege for deploy only. It has permission to access only dev-server.
- How can I do this kind of setup? Using ACL's (show ACL)
- Humans use normal member access for browse/SSH.
- OAuth is scoped so CI can only create keys for `tag:ci`.
- One way to explain tags is like, job roles on a badge. “CI” tag may open access to only one floors area, not every office on the floor.

---

## 12. OAuth vs auth key

**Slide cue:** Tabs like the VPN slide — `1` EC2 auth key · `2` CI OAuth

**Say while tabbing:**
- **1 · EC2 auth key:** Bootstrap SSH from your allowlisted IP → `tailscale up --auth-key` → stable MagicDNS hostname. Long-lived server stays on the Tailnet.
- **2 · CI OAuth:** GitHub runners show up from **any IP**. You still want them to reach EC2, but the security group is tight (SSH demo: public SSH only from your IP). Don’t open AWS for every Actions IP.
- Instead the runner joins the Tailnet automatically via OAuth, mints ephemeral `tag:ci`, SSHs over the mesh, deploys, then leaves — “hello, do the job, goodbye.”
- OAuth is scoped to mint `tag:ci` only; ACL only lets `tag:ci` talk to `tag:dev-server` on SSH. Secrets live in GitHub Secrets.

---

## 13. Demo CI (3 of 3)

**Claim:** Push `development` → Actions joins Tailnet → EC2 preview updates.

**Do:**
1. Small edit, commit, `git push origin development`.
2. Open GitHub Actions → wait for “Deploy development (Tailscale → EC2)” to go green.
3. Refresh MagicDNS site; optional SSH `git log -1` on the VM.

---

## 14. Validation

- Positive: Tailscale on → MagicDNS → site loads.
- Negative: Tailscale off → can’t be reached.
- Commercial VPN: public SSH fails → VM isn’t open to shifted egress IPs.
- Tailnet SSH works without opening 80/443.
- CI path works end to end.

---

## 15. VPN vs Tailscale (Cosco / commercial VPN / mesh)

**Keys:** `1` Cosco hub · `2` Commercial egress · `3` Tailscale mesh


- Same word “VPN,” three different jobs. 
- **Cosco hub:** Laptop tunnels to a Cosco appliance (hardware or VM). Everything goes through that hub into the corp LAN. IT tickets to get on; more tickets for special access like a private preview. Expensive and gateway-centered.
- **Commercial egress:** A commercial VPN changes your public IP. Great for “look like I’m elsewhere.” Your EC2 / private preview is not on that path.
- **Tailscale mesh:** Devices join by identity. Laptop, phone, teammate, CI, MagicDNS, and EC2 share one Tailnet. Peer links, not a Cosco appliance. Tags and ACLs decide who reaches what and where.

---

## 16. What worked well


so what worked well for me was
- since my scope was small, I could still demonstrated MagicDNS, SSH, tags, and CI.
- Auth key for EC2 + OAuth for Actions matched what the docs intend.
- Negative tests using the Commercial VPN + Tailscale off - made my story obvious where and how tailscale can be applied.
- I really appreciate the clean UI — features and settings are explained in a minimal way that still conveyed what each setting does very easily.
- Inviting another user for team preview was trivial.
- Excellent documentation made setup and the right patterns easy to follow.

---

## 17. Difficult or surprising

**Say (credibility; don’t linger):**
- Bootstrap still needs a narrow public SSH path (or SSM) before Tailscale is up.
- nginx on Amazon Linux couldn’t read `~/app/out` until home-dir permissions were fixed.
- Trying **Caddy with Tailscale’s server setup** kept breaking; landed on nginx for the preview instead.
- After **revoking auth keys or machines** and bringing nodes back up, they sometimes appeared online on the Tailnet but **SSH still failed** (stale identity / host key / Tailscale SSH policy leftovers).

---

## 18. What I'd improve

- With more time I’d stand up **another demo** aimed at different Tailscale features (not just private static preview).
- I’d dig into a **Docker** packaging of this pattern and how it would run inside a **Kubernetes** cluster (sidecar / operator / subnet router patterns worth exploring).
- Real next step: the **Cow lameness** project with the **AWP UBC lab** ([HerdWell](http://134.87.8.85/), [architecture image](https://github.com/Vin-dictive/deploy-docs-cow-lameness/blob/main/image.png)). That needs an education account, and user management / access control is more complex than this personal Tailnet preview. I’d want to implement a **full-scale** Tailscale solution there (roles, invites, ACLs/grants, maybe shared lab devices).
- Tighten ops with **auto-approval** for devices, and move CI/CD deploy fully onto **Tailscale SSH** — today SSH ports are still open for bootstrap / deploy paths.
- Still want deeper ACL / grants demos for multi-team least privilege.
- Explore **Tailscale API** features to automatically **add or remove users** from the mesh based on API calls

---

## 19. Value

- Point around the ring of tiles:
  - **Local projects:** MagicDNS URL to a WIP site, no public deploy.
  - **Environments:** custom MagicDNS names for dev / staging / prod.
  - **Local games:** private LAN with friends.
  - **Home LLM:** Open WebUI to a model you run yourself.
  - **NAS / home cloud:** your storage from anywhere on the Tailnet.
  - **This walkthrough:** same pattern as the EC2 staging preview.
  - **Invite teammates:** share by identity, not IP allowlists or Cosco tickets.
  - **Home lab SSH:** workstation or Pi from your phone, privately.
- The possibilities are endless. But there is one solution and it is right in front of your eyes

---

## 20. Questions? (empty slide)


---

