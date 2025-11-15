# Developer Profile - Vinay Valson

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
git clone https://github.com/Vin-dictive/Vin-dictive.github.io.git
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

## Deployment to GitHub Pages

### Automatic Deployment

The repository includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the main branch.

### Manual Setup

1. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "GitHub Actions"

2. **Update Repository Settings**:
   - Ensure the repository name matches your GitHub username: `username.github.io`
   - Or update the `basePath` in `next.config.js` to match your repository name

3. **Push to Main Branch**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

4. **Access Your Site**:
   - Your site will be available at: `https://username.github.io`
   - Or `https://username.github.io/repository-name` if using a project repository

### Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain name
2. Configure your domain's DNS settings to point to GitHub Pages
3. Enable "Enforce HTTPS" in repository settings

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles and theme variables
│   ├── layout.tsx           # Root layout with fluid background
│   └── page.tsx             # Main page component
├── components/
│   ├── ui/                  # shadcn UI components
│   │   ├── tabs.tsx
│   │   └── card.tsx
│   └── FluidBackground.tsx  # Mouse-following background
├── data/
│   └── profile.json         # Profile data (edit this!)
├── lib/
│   └── utils.ts             # Utility functions
├── .github/workflows/
│   └── deploy.yml           # GitHub Actions deployment
└── next.config.js           # Next.js configuration
```

## Customization

### Colors and Theme

Edit the CSS variables in `app/globals.css` to customize the color scheme:

```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 210 40% 98%;
  /* ... more variables */
}
```

### Animations

Modify animation settings in the page components using Framer Motion props:

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```

### Fluid Background

Customize the fluid background gradient in `app/globals.css`:

```css
.fluid-bg {
  background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
    rgba(59, 130, 246, 0.15) 0%, 
    rgba(147, 51, 234, 0.1) 25%, 
    rgba(236, 72, 153, 0.05) 50%, 
    transparent 70%);
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and deployed on GitHub Pages