import { ArrowUpRight } from 'lucide-react'
import ParallaxBackground from '@/components/ParallaxBackground'
import { sectionGlassCard } from '@/components/sections/sectionGlass'
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

function techChips(techStack: string | null) {
  if (!techStack) return []
  return techStack
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export default function ExperienceEducationSection({
  experience,
}: {
  experience: ExperienceItem[]
}) {
  return (
    <section
      id="experience"
      className={`folio-slide relative isolate bg-transparent pb-8 pt-24 sm:pt-28 ${folioSectionXPad}`}
    >
      <ParallaxBackground src="/parallax/experience.jpg" />
      <div className={`flex min-h-0 w-full flex-col ${folioContainerClass}`}>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 md:mb-6">
          <div>
            <h2 className="kinetic-monolith text-3xl font-black uppercase text-folio-on-surface md:text-4xl">
              Professional Timeline
            </h2>
            <p className="technical-label mt-1 text-sm tracking-widest text-folio-on-surface-variant">
              Roles, impact, and stack
            </p>
          </div>
          <p className="technical-label hidden text-[10px] uppercase tracking-[0.3em] text-folio-on-surface-variant/70 md:block">
            Scroll →
          </p>
        </div>

        <ul
          role="list"
          className="hscroll flex min-h-0 flex-1 snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:gap-6"
        >
          {experience.map((exp, index) => (
            <li
              key={`${exp.company}-${exp.duration}`}
              className="flex w-[min(100%,24rem)] shrink-0 snap-start md:w-[28rem] xl:w-[30rem]"
            >
              <article
                className={cn(
                  'relative flex h-full min-h-0 w-full flex-col overflow-hidden !p-6',
                  sectionGlassCard,
                )}
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-folio-primary/10 blur-3xl" />

                <div className="relative mb-4 flex items-center justify-between gap-4">
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/logo flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-folio-outline-variant/25 bg-folio-surface-high/80 transition-[border-color,box-shadow] hover:border-folio-primary/40 hover:shadow-md hover:shadow-folio-primary/15 dark:border-white/10 dark:bg-zinc-900/60"
                    aria-label={`${exp.company} (opens in new tab)`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={exp.logo}
                      alt={exp.company}
                      className="logo-icon h-7 w-7 object-contain"
                    />
                  </a>
                  <span
                    className={cn(
                      'technical-label text-right text-[10px] font-bold uppercase leading-snug',
                      index === 0 ? 'text-folio-primary' : 'text-folio-on-surface-variant',
                    )}
                  >
                    {exp.duration}
                  </span>
                </div>

                <a
                  href={exp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/title relative inline-flex flex-wrap items-center gap-2 outline-offset-2"
                >
                  <h3 className="text-lg font-bold leading-snug text-folio-on-surface transition-colors group-hover/title:text-folio-primary md:text-xl">
                    {exp.title}
                  </h3>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-folio-primary opacity-0 transition-opacity group-hover/title:opacity-100" />
                </a>
                <p className="technical-label relative mt-1.5 text-xs uppercase text-folio-on-surface-variant">
                  {exp.company} · {exp.location}
                </p>

                <p className="hscroll relative mt-4 min-h-0 flex-1 overflow-y-auto text-sm leading-relaxed text-folio-on-surface-variant">
                  {exp.description}
                </p>

                {exp.techStack ? (
                  <ul className="relative mt-4 flex shrink-0 flex-wrap gap-1.5 border-t border-folio-outline-variant/15 pt-4 dark:border-white/10">
                    {techChips(exp.techStack).map((tech) => (
                      <li
                        key={tech}
                        className="technical-label rounded-full border border-folio-outline-variant/30 bg-folio-surface-high/50 px-2 py-0.5 text-[9px] uppercase tracking-wider text-folio-on-surface-variant dark:border-white/10 dark:bg-zinc-900/50"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
