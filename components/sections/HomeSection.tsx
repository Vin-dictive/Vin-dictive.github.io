import Link from 'next/link'
import SkillsBentoSection from '@/components/sections/SkillsBentoSection'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'

interface Personal {
  name: string
  title?: string
  quote?: string
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
      className={`folio-section relative flex flex-col items-center overflow-x-hidden bg-transparent pb-16 pt-28 sm:pb-20 sm:pt-32 md:pt-36 ${folioSectionXPad}`}
    >
      <div className={`flex w-full flex-col items-center gap-8 sm:gap-10 md:gap-12 ${folioContainerClass}`}>
        <h1 className="kinetic-monolith max-w-full whitespace-nowrap px-2 pt-4 text-center text-[clamp(1.25rem,calc(0.5rem+4.8vw),7.5rem)] font-black uppercase leading-[0.92] text-folio-on-surface sm:px-4 sm:pt-6 sm:leading-[0.9] md:pt-8">
          {personal.name.trim()}
        </h1>

        {personal.quote ? (
          <blockquote className="mx-auto max-w-xl px-2 text-center xl:max-w-3xl 2xl:max-w-4xl">
            <p className="text-pretty text-base font-medium italic leading-relaxed text-folio-on-surface sm:text-lg md:text-xl">
              &ldquo;{personal.quote}&rdquo;
            </p>
          </blockquote>
        ) : null}

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

        <div className="mt-2 w-full sm:mt-4 xl:max-w-6xl 2xl:max-w-7xl">
          <SkillsBentoSection skills={skills} variant="embedded" />
        </div>
      </div>
    </section>
  )
}
