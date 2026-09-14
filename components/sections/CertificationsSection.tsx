import { ArrowUpRight } from 'lucide-react'
import ParallaxBackground from '@/components/ParallaxBackground'
import { sectionGlassCard, sectionGlassShell } from '@/components/sections/sectionGlass'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'
import { cn } from '@/lib/utils'

interface Certification {
  name: string
  organization: string
  year: string
  details?: string
  logo: string
  link: string
}

export default function CertificationsSection({
  certifications,
}: {
  certifications: Certification[]
}) {
  return (
    <section
      id="certifications"
      className={`folio-slide relative isolate bg-transparent pb-8 pt-24 sm:pt-28 ${folioSectionXPad}`}
    >
      <ParallaxBackground src="/parallax/certifications.jpg" />
      <div className={`flex min-h-0 w-full flex-col ${folioContainerClass}`}>
        <div className="mb-5 text-center md:mb-6">
          <h2 className="kinetic-monolith text-3xl font-black uppercase text-folio-on-surface sm:text-4xl">
            Certifications
          </h2>
          <p className="technical-label mt-1 text-sm tracking-widest text-folio-on-surface-variant">
            Credentials &amp; continuous learning · scroll →
          </p>
        </div>

        <div className={cn(sectionGlassShell, 'min-h-0 !p-4 sm:!p-5 md:!p-6')}>
          <ul className="hscroll grid max-h-full snap-x auto-cols-[minmax(17rem,20rem)] grid-flow-col grid-rows-2 gap-4 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
            {certifications.map((cert) => {
              const hasLink = Boolean(cert.link?.trim())
              const inner = (
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-folio-outline-variant/25 bg-folio-surface-high/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
                    <img
                      src={cert.logo}
                      alt={cert.organization}
                      className="logo-icon h-6 w-6 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-folio-on-surface">
                      {cert.name}
                    </p>
                    <p className="technical-label mt-2 text-[11px] uppercase tracking-wider text-folio-on-surface-variant">
                      {cert.organization} · {cert.year}
                    </p>
                    {cert.details ? (
                      <p className="mt-2 line-clamp-2 text-xs text-folio-on-surface-variant/90">
                        {cert.details}
                      </p>
                    ) : null}
                  </div>
                  {hasLink ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-folio-on-surface-variant transition-colors group-hover:text-folio-primary" />
                  ) : null}
                </div>
              )

              return (
                <li key={`${cert.name}-${cert.year}`} className="flex min-h-0 snap-start">
                  {hasLink ? (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group block h-full w-full ${sectionGlassCard}`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={`h-full w-full ${sectionGlassCard}`}>{inner}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
