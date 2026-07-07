import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import GallerySection from '@/components/sections/GallerySection'
import profileData from '@/data/profile.json'

const { personal, pictures } = profileData

export const metadata: Metadata = {
  title: `Gallery | ${personal.name}`,
  description: 'Photography gallery',
}

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation resumeUrl={personal.resumeUrl} />
      <main className="flex-1">
        <GallerySection pictures={pictures ?? []} />
      </main>
      <Footer
        brand={personal.name}
        github={personal.github}
        linkedin={personal.linkedin}
        email={personal.email}
      />
    </div>
  )
}
