import { ArrowUpRight } from 'lucide-react'
import { sectionGlassCard, sectionGlassShell } from '@/components/sections/sectionGlass'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'

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
      className={`folio-section bg-transparent py-28 md:py-32 lg:py-36 ${folioSectionXPad}`}
    >
      <div className={folioContainerClass}>
        <h2 className="kinetic-monolith mb-4 text-center text-4xl font-black uppercase text-folio-on-surface sm:text-5xl md:mb-6">
          Certifications
        </h2>
        <p className="technical-label mb-12 text-center text-sm tracking-widest text-folio-on-surface-variant md:mb-16">
          Credentials &amp; continuous learning
        </p>

        <div className={sectionGlassShell}>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:gap-6 xl:grid-cols-3 2xl:gap-8">
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
                      <p className="mt-2 text-xs text-folio-on-surface-variant/90">
                        {cert.details}
                      </p>
                    ) : null}
                  </div>
                  {hasLink ? (
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-folio-on-surface-variant transition-colors group-hover:text-folio-primary" />
                  ) : null}
                </div>
              )

              return hasLink ? (
                <a
                  key={`${cert.name}-${cert.year}`}
                  href={cert.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block ${sectionGlassCard}`}
                >
                  {inner}
                </a>
              ) : (
                <div key={`${cert.name}-${cert.year}`} className={sectionGlassCard}>
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
