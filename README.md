# Developer Profile

A modern, animated developer portfolio built with Next.js, featuring fluid dynamics background that follows mouse movement, smooth animations, and a clean design using Tailwind CSS and shadcn UI components.

## Features

- 🎨 **Fluid Dynamics Background** - Interactive background that follows mouse movement
- ⚡ **Smooth Animations** - Framer Motion powered animations
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎯 **Tab-based Navigation** - Clean organization of content sections
- 📊 **JSON-driven Content** - Easy to update profile information
- 🚀 **Static Export** - Optimized for GitHub Pages deployment
- 🎭 **Dark Theme** - Modern dark UI with gradient accents

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: GitHub Pages
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vin-dictive/Vin-dictive.github.io
cd Vin-dictive.github.io
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Updating Profile Information

Edit the `data/profile.json` file to update your personal information, skills, experience, projects, education, and certifications. The website will automatically reflect these changes.

### Building for Production

```bash
npm run build
```

This creates an optimized static export in the `out` directory.

## Running with Docker

No local Node.js install needed — only [Docker Desktop](https://docs.docker.com/get-started/get-docker/) (or Docker Engine with the Compose plugin).

### Production (static export served by nginx)

```bash
docker compose up --build -d site
```

Open [http://localhost:8080](http://localhost:8080). Then:

```bash
docker compose logs -f site   # follow logs
docker compose down           # stop and remove the container
```

Because `next.config.js` uses `output: 'export'`, the site is fully static — the runtime image is just nginx serving `out/`, with no Node server. Content changes (e.g. `data/profile.json`) require a rebuild: rerun `docker compose up --build -d site`.

### Development (hot reload)

```bash
docker compose --profile dev up --build dev
```

Open [http://localhost:3000](http://localhost:3000). Your working tree is bind-mounted into the container, so edits reload live. After changing `package.json`, reset the dependency volume as well:

```bash
docker compose --profile dev up --build -V dev
```

### Without Compose

```bash
docker build -f docker/Dockerfile -t vinay-portfolio .
docker run --rm -p 8080:80 --name portfolio vinay-portfolio
```

### Docker files

| File | Purpose |
| --- | --- |
| `docker/Dockerfile` | Multi-stage production build: install deps → `yarn build` → nginx serving `out/` |
| `docker/Dockerfile.dev` | Development image running `next dev` on port 3000 |
| `docker/nginx.conf` | Static-export routing (`trailingSlash: true`), `404.html`, long-lived caching for `/_next/static` |
| `docker-compose.yml` | `site` (production, port 8080) and `dev` (hot reload, port 3000, `dev` profile) |
| `.dockerignore` | Keeps `node_modules`, `.next`, `out`, and `.git` out of the build context |

## Deployment to GitHub Pages

### Automatic Deployment

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and deployed on GitHub Pages