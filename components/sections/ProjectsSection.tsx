import { ArrowUpRight } from 'lucide-react'
import { GitHubIcon } from '@/components/icons/GitHubIcon'
import ParallaxBackground from '@/components/ParallaxBackground'
import { sectionGlassCard, sectionGlassShell } from '@/components/sections/sectionGlass'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'
import { cn } from '@/lib/utils'

interface Project {
  name: string
  description: string
  link: string
  /**
   * Direct image URL/path (png, jpg, gif, webp, svg, …) renders as `<img>`.
   * Any other non-empty URL (e.g. docs / demo page) renders in an `<iframe>`.
   * Empty = placeholder slot.
   */
  preview?: string
}

const VISIBLE_COUNT = 12

export default function ProjectsSection({
  projects,
  githubUsername,
}: {
  projects: Project[]
  /** GitHub profile slug (e.g. Vin-dictive) for “more projects” link */
  githubUsername: string
}) {
  const shown = projects.slice(0, VISIBLE_COUNT)
  const githubProfileUrl = `https://github.com/${githubUsername.trim()}`

  if (shown.length === 0) {
    return null
  }

  return (
    <section
      id="projects"
      className={`folio-slide relative isolate bg-transparent pb-8 pt-24 sm:pt-28 ${folioSectionXPad}`}
      aria-labelledby="projects-heading"
    >
      <ParallaxBackground src="/parallax/projects.jpg" />
      <div className={`flex min-h-0 w-full flex-col ${folioContainerClass}`}>
        <div className="mb-5 text-center md:mb-6">
          <h2
            id="projects-heading"
            className="kinetic-monolith text-3xl font-black uppercase text-folio-on-surface sm:text-4xl"
          >
            Projects
          </h2>
          <p className="technical-label mt-1 text-sm tracking-widest text-folio-on-surface-variant">
            Builds I&apos;m especially proud of · scroll →
          </p>
        </div>

        <div className={cn(sectionGlassShell, 'flex min-h-0 flex-1 flex-col !p-4 sm:!p-5 md:!p-6')}>
          <ul className="hscroll grid min-h-0 flex-1 snap-x auto-cols-[minmax(16rem,18rem)] grid-flow-col grid-rows-2 gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] md:auto-cols-[minmax(17rem,20rem)]">
            {shown.map((project, index) => {
              const n = String(index + 1).padStart(2, '0')

              return (
                <li key={`${project.name}-${index}`} className="flex min-h-0 snap-start">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group flex h-full min-h-0 w-full flex-col overflow-hidden !p-4',
                      sectionGlassCard,
                    )}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <span className="technical-label text-[10px] font-bold uppercase tracking-[0.35em] text-folio-secondary">
                        {n}
                      </span>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-folio-outline-variant/25 bg-folio-surface-high/80 dark:border-white/10 dark:bg-zinc-900/60">
                        <GitHubIcon className="h-4 w-4 text-folio-on-surface-variant" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold leading-snug text-folio-on-surface">
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-3 min-h-0 flex-1 text-xs leading-relaxed text-folio-on-surface-variant sm:text-sm">
                      {project.description}
                    </p>
                    <span className="technical-label mt-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-folio-on-surface">
                      Open project
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-folio-on-surface-variant transition-colors group-hover:text-folio-primary"
                        aria-hidden
                      />
                    </span>
                  </a>
                </li>
              )
            })}
          </ul>

          <p className="technical-label mt-4 shrink-0 border-t border-folio-outline-variant/15 pt-4 text-center text-xs uppercase tracking-widest text-folio-on-surface-variant dark:border-white/10">
            To explore all projects,{' '}
            <a
              href={githubProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-folio-primary underline-offset-4 transition-colors hover:text-folio-primary-fixed hover:underline"
            >
              <GitHubIcon className="h-3.5 w-3.5 shrink-0" />
              check out my GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
