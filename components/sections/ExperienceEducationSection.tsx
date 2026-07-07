import { ArrowUpRight } from 'lucide-react'
import { sectionGlassShell } from '@/components/sections/sectionGlass'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'
import { cn } from '@/lib/utils'

interface ExperienceItem {
  title: string
  company: string
  duration: string
  location: string
  description: string
  techStack: string | null
  logo: string
  link: string
}

export default function ExperienceEducationSection({
  experience,
}: {
  experience: ExperienceItem[]
}) {
  return (
    <section
      id="experience"
      className={`folio-section bg-transparent py-24 ${folioSectionXPad}`}
    >
      <div className={folioContainerClass}>
        <h2 className="kinetic-monolith mb-2 text-4xl font-black uppercase text-folio-on-surface">
          Professional Timeline
        </h2>
        <p className="technical-label mb-10 text-sm tracking-widest text-folio-on-surface-variant md:mb-12">
          Roles, impact, and stack
        </p>

        <div className={cn(sectionGlassShell, 'relative overflow-hidden')}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-folio-primary/10 blur-3xl" />
          <div className="relative space-y-0">
            {experience.map((exp, index) => (
              <article
                key={`${exp.company}-${exp.duration}`}
                className={cn(
                  'flex flex-col gap-5 border-t border-folio-outline-variant/15 py-10 first:border-t-0 first:pt-6 last:pb-6 dark:border-white/10 sm:flex-row sm:items-start sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14',
                )}
              >
                <div className="flex shrink-0 flex-row items-center gap-4 sm:w-36 sm:flex-col sm:items-start md:w-44 lg:w-52">
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/logo flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-folio-outline-variant/25 bg-folio-surface-high/80 transition-[border-color,box-shadow] hover:border-folio-primary/40 hover:shadow-md hover:shadow-folio-primary/15 dark:border-white/10 dark:bg-zinc-900/60 md:h-16 md:w-16"
                    aria-label={`${exp.company} (opens in new tab)`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exp.logo}
                      alt={exp.company}
                      className="logo-icon h-8 w-8 object-contain md:h-9 md:w-9"
                    />
                  </a>
                  <div
                    className={cn(
                      'technical-label min-w-0 text-[10px] font-bold uppercase leading-snug sm:max-w-none',
                      index === 0 ? 'text-folio-primary' : 'text-folio-on-surface-variant',
                    )}
                  >
                    {exp.duration}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/title inline-flex flex-wrap items-center gap-2 rounded-xl outline-offset-2"
                  >
                    <h3 className="text-xl font-bold text-folio-on-surface transition-colors group-hover/title:text-folio-primary md:text-2xl">
                      {exp.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-folio-primary opacity-0 transition-opacity group-hover/title:opacity-100" />
                  </a>
                  <p className="technical-label mt-2 text-sm uppercase text-folio-on-surface-variant">
                    {exp.company} · {exp.location}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-folio-on-surface-variant md:text-base">
                    {exp.description}
                  </p>
                  {exp.techStack ? (
                    <p className="technical-label mt-4 text-[10px] uppercase tracking-wider text-folio-on-surface-variant/85">
                      {exp.techStack}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
