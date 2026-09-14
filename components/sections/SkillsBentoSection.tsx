import type { ReactNode } from 'react'
import { Terminal, Layers, Brain, Cloud } from 'lucide-react'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'

interface Skills {
  programmingLanguages: string[]
  frameworks: string[]
  dataScience: string[]
  cloudDevOps: string[]
}

const stacks: {
  key: keyof Skills
  title: string
  borderClass: string
  iconClass: string
  Icon: typeof Terminal
}[] = [
  {
    key: 'programmingLanguages',
    title: 'Programming Languages',
    borderClass: 'border-l-folio-primary',
    iconClass: 'text-folio-primary',
    Icon: Terminal,
  },
  {
    key: 'frameworks',
    title: 'Frameworks',
    borderClass: 'border-l-folio-tertiary',
    iconClass: 'text-folio-tertiary',
    Icon: Layers,
  },
  {
    key: 'dataScience',
    title: 'Data Science & ML',
    borderClass: 'border-l-folio-secondary',
    iconClass: 'text-folio-secondary',
    Icon: Brain,
  },
  {
    key: 'cloudDevOps',
    title: 'Cloud & DevOps',
    borderClass: 'border-l-folio-on-surface',
    iconClass: 'text-folio-on-surface',
    Icon: Cloud,
  },
]

function CoreStackInner({
  skills,
  compact = false,
}: {
  skills: Skills
  compact?: boolean
}) {
  if (compact) {
    return (
      <>
        <div className="relative mb-5 flex flex-col items-stretch gap-3 md:flex-row md:items-end">
          <div className="min-w-0">
            <h2 className="kinetic-monolith mb-1.5 text-2xl font-black uppercase text-folio-on-surface sm:text-3xl">
              Core Stack
            </h2>
            <p className="technical-label text-xs tracking-widest text-folio-on-surface-variant">
              Multi-disciplinary engineering expertise
            </p>
          </div>
          <div className="mb-2 hidden h-px flex-grow bg-folio-outline-variant/25 md:mx-8 md:block dark:bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {stacks.map(({ key, title, borderClass, iconClass, Icon }) => (
            <div
              key={key}
              className={`rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/40 p-4 shadow-inner backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-folio-primary/50 hover:shadow-md hover:shadow-folio-primary/10 dark:border-white/10 dark:bg-zinc-950/30 dark:hover:border-folio-primary/50 dark:hover:shadow-folio-primary/20 border-l-4 ${borderClass}`}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <Icon className={`h-5 w-5 shrink-0 ${iconClass}`} strokeWidth={1.5} />
                <h3 className="technical-label text-sm font-bold text-folio-on-surface">
                  {title}
                </h3>
              </div>
              <ul className="flex flex-wrap gap-1.5">
                {skills[key].map((item, index) => (
                  <li
                    key={`${key}-${index}`}
                    className="technical-label rounded-full border border-folio-outline-variant/30 bg-folio-surface-high/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-folio-on-surface-variant dark:border-white/10 dark:bg-zinc-900/50"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <>
      <div className="relative mb-10 flex flex-col items-stretch gap-6 md:mb-12 md:flex-row md:items-end">
        <div className="min-w-0">
          <h2 className="kinetic-monolith mb-4 text-4xl font-black uppercase text-folio-on-surface sm:text-5xl">
            Core Stack
          </h2>
          <p className="technical-label text-sm tracking-widest text-folio-on-surface-variant">
            Multi-disciplinary engineering expertise
          </p>
        </div>
        <div className="mb-2 hidden h-px flex-grow bg-folio-outline-variant/25 md:mx-8 md:block dark:bg-white/10" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:gap-6 2xl:gap-8">
        {stacks.map(({ key, title, borderClass, iconClass, Icon }) => (
          <div
            key={key}
            className={`rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/40 p-6 shadow-inner backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-folio-primary/50 hover:shadow-md hover:shadow-folio-primary/10 dark:border-white/10 dark:bg-zinc-950/30 dark:hover:border-folio-primary/50 dark:hover:shadow-folio-primary/20 sm:p-8 border-l-4 ${borderClass}`}
          >
            <Icon className={`mb-5 w-9 h-9 sm:mb-6 sm:w-10 sm:h-10 ${iconClass}`} strokeWidth={1.25} />
            <h3 className="technical-label mb-5 text-base font-bold text-folio-on-surface sm:mb-6 sm:text-lg">
              {title}
            </h3>
            <ul className="technical-label space-y-2.5 text-[11px] uppercase tracking-widest text-folio-on-surface-variant sm:space-y-3 sm:text-xs">
              {skills[key].map((item, index) => (
                <li key={`${key}-${index}`} className="flex items-center gap-2">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-folio-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}

function GlassShell({
  children,
  id,
  className = '',
}: {
  children: ReactNode
  id?: string
  className?: string
}) {
  return (
    <div
      {...(id ? { id } : {})}
      className={`relative overflow-hidden rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/25 shadow-xl shadow-folio-surface/10 backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 dark:border-white/10 dark:bg-zinc-950/35 dark:shadow-black/25 md:backdrop-blur-3xl hover:border-folio-primary hover:shadow-xl hover:shadow-folio-primary/25 dark:hover:border-folio-primary dark:hover:shadow-folio-primary/30 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-folio-primary/[0.08] via-transparent to-folio-tertiary/[0.06]" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-folio-tertiary/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  )
}

export default function SkillsBentoSection({
  skills,
  variant = 'page',
}: {
  skills: Skills
  variant?: 'page' | 'embedded'
}) {
  if (variant === 'embedded') {
    return (
      <GlassShell className="p-4 sm:p-5 md:p-6">
        <CoreStackInner skills={skills} compact />
      </GlassShell>
    )
  }

  return (
    <section
      className={`border-y border-folio-outline-variant/10 bg-folio-surface-low/50 py-20 backdrop-blur-md md:py-24 ${folioSectionXPad}`}
      id="skills"
    >
      <div className={folioContainerClass}>
        <CoreStackInner skills={skills} />
      </div>
    </section>
  )
}
