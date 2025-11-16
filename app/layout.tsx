import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import FluidBackground from '@/components/FluidBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vinay Valson - Developer Profile',
  description: 'Software Engineer & Data Scientist Portfolio',
  icons: {
    icon: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FluidBackground />
        {children}
      </body>
    </html>
  )
}