import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import CursorDotBackground from '@/components/CursorDotBackground'
import profileData from '@/data/profile.json'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const { personal } = profileData

export const metadata: Metadata = {
  title: `${personal.name} | ${personal.title}`,
  description: personal.title,
  icons: {
    icon: '/favicon.png',
  },
}

/** Dark is default; only `theme=light` in localStorage opts out. */
const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light') document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark scroll-smooth scroll-pt-28 sm:scroll-pt-32"
    >
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <CursorDotBackground />
        <div className="relative z-[1] min-h-screen">{children}</div>
      </body>
    </html>
  )
}
