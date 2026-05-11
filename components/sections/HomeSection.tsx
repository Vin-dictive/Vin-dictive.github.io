import Link from 'next/link'
import SkillsBentoSection from '@/components/sections/SkillsBentoSection'

interface Personal {
  name: string
  title: string
}

interface Skills {
  programmingLanguages: string[]
  frameworks: string[]
  dataScience: string[]
  cloudDevOps: string[]
}

export default function HomeSection({
  personal,
  skills,
}: {
  personal: Personal
  skills: Skills
}) {
  return (
    <section
      id="home"
      aria-label="Home"
      className="folio-section relative flex flex-col items-center overflow-x-hidden bg-transparent px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 md:px-8 md:pt-36"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-8 sm:gap-10 md:gap-12">
        <h1 className="kinetic-monolith max-w-full whitespace-nowrap px-2 pt-4 text-center text-[clamp(1.25rem,calc(0.5rem+4.8vw),7.5rem)] font-black uppercase leading-[0.92] text-folio-on-surface sm:px-4 sm:pt-6 sm:leading-[0.9] md:pt-8">
          {personal.name.trim()}
        </h1>

        <p className="mx-auto max-w-2xl px-1 text-center text-pretty text-base font-light sm:text-xl sm:leading-snug lg:text-2xl xl:text-3xl">
          <span className="block text-folio-on-surface-variant">{personal.title}.</span>
        </p>

        <div className="flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4">
          <Link
            href="#experience"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-folio-on-primary pulse-gradient shadow-md shadow-folio-primary/25 transition-[opacity,box-shadow] hover:opacity-100 hover:shadow-lg hover:shadow-folio-primary/40 sm:min-h-0 sm:w-auto sm:px-8 sm:py-4"
          >
            Explore Work
          </Link>
          <Link
            href="#contact"
            className="inline-flex min-h-12 w-full items-center justify-center rounded-sm border border-folio-outline-variant px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-folio-on-surface transition-colors hover:border-folio-primary hover:bg-folio-primary/10 dark:hover:bg-folio-primary/20 sm:min-h-0 sm:w-auto sm:px-8 sm:py-4"
          >
            Get In Touch
          </Link>
        </div>

        <div className="mt-2 w-full max-w-5xl sm:mt-4">
          <SkillsBentoSection skills={skills} variant="embedded" />
        </div>
      </div>
    </section>
  )
}
