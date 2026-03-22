import { ArrowUpRight, Github } from 'lucide-react'
import { sectionGlassCardStatic, sectionGlassShell } from '@/components/sections/sectionGlass'

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

const VISIBLE_COUNT = 10


/** Compact preview so cards stay text-forward */
const previewFrameClass =
  'relative mx-auto aspect-video w-full max-w-[200px] shrink-0 overflow-hidden rounded-lg border border-folio-outline-variant/20 bg-folio-surface-low sm:max-w-[240px] dark:bg-zinc-950'

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
      className="bg-transparent px-4 py-28 sm:px-6 md:px-10 md:py-32 lg:px-14 lg:py-36"
      aria-labelledby="projects-heading"
    >
      <div className="mx-auto max-w-screen-xl">
        <h2
          id="projects-heading"
          className="kinetic-monolith mb-4 text-center text-4xl font-black uppercase text-folio-on-surface sm:text-5xl md:mb-6"
        >
          Projects
        </h2>
        <p className="technical-label mb-12 text-center text-sm tracking-widest text-folio-on-surface-variant md:mb-16">
          Four builds I&apos;m especially proud of
        </p>

        <div className={sectionGlassShell}>
          <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 md:gap-8 lg:gap-10">
            {shown.map((project, index) => {
              const n = String(index + 1).padStart(2, '0')
              const borderHover =
                index % 3 === 1
                  ? 'hover:border-folio-tertiary hover:shadow-lg hover:shadow-folio-tertiary/25 dark:hover:border-folio-tertiary dark:hover:shadow-folio-tertiary/30'
                  : 'hover:border-folio-primary hover:shadow-lg hover:shadow-folio-primary/25 dark:hover:border-folio-primary dark:hover:shadow-folio-primary/30'

              return (
                <li key={project.link} className="flex min-h-0 md:h-full">
                  <div
                    className={`flex min-h-0 w-full flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 ${sectionGlassCardStatic} ${borderHover}`}
                  >
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <span className="technical-label text-[10px] font-bold uppercase tracking-[0.35em] text-folio-secondary">
                          {n}
                        </span>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-folio-outline-variant/25 bg-folio-surface-high/80 dark:border-white/10 dark:bg-zinc-900/60">
                          <Github
                            className="h-5 w-5 text-folio-on-surface-variant"
                            aria-hidden
                          />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold leading-snug text-folio-on-surface sm:text-xl">
                        {project.name}
                      </h3>
                      <p className="technical-label mt-2 text-[11px] uppercase tracking-wider text-folio-on-surface-variant">
                        GitHub · Repository
                      </p>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-folio-on-surface-variant">
                        {project.description}
                      </p>
                      <span className="technical-label mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-folio-on-surface">
                        Open project
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>

          <p className="technical-label mt-10 border-t border-folio-outline-variant/15 pt-8 text-center text-xs uppercase tracking-widest text-folio-on-surface-variant dark:border-white/10">
            To explore all projects,{' '}
            <a
              href={githubProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-folio-primary underline-offset-4 transition-colors hover:text-folio-primary-fixed hover:underline"
            >
              <Github className="h-3.5 w-3.5 shrink-0" aria-hidden />
              check out my GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
