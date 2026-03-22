import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import HomeSection from '@/components/sections/HomeSection'
import AboutSection from '@/components/sections/AboutSection'
import ProjectsSection from '@/components/sections/ProjectsSection'
import ExperienceEducationSection from '@/components/sections/ExperienceEducationSection'
import CertificationsSection from '@/components/sections/CertificationsSection'
import ContactSection from '@/components/sections/ContactSection'
import profileData from '@/data/profile.json'

export default function Home() {
  const { personal, skills, experience, projects, education, certifications } = profileData

  return (
    <div className="min-h-screen">
      <Navigation resumeUrl={personal.resumeUrl} />
      <main>
        <HomeSection personal={personal} skills={skills} />
        <AboutSection personal={personal} education={education} />
        <ExperienceEducationSection experience={experience} />
        <ProjectsSection projects={projects} githubUsername={personal.github} />
        <CertificationsSection certifications={certifications} />
        <ContactSection personal={personal} />
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
