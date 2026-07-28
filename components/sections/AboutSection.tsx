"use client"

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { sectionGlassCard } from '@/components/sections/sectionGlass'
import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'
import { cn } from '@/lib/utils'

interface Personal {
  name: string
  about: string
  quote?: string
}

interface EducationItem {
  degree: string
  institution: string
  duration: string
  details: string
  grade?: string
  logo: string
  link: string
}

function aboutParagraphs(about: string) {
  return about
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
}

export default function AboutSection({
  personal,
  education,
}: {
  personal: Personal
  education: EducationItem[]
}) {
  const [photoOk, setPhotoOk] = useState(true)
  const paragraphs = aboutParagraphs(personal.about)

  return (
    <section
      id="about"
      className={`folio-section bg-transparent py-20 ${folioSectionXPad}`}
    >
      <div className={folioContainerClass}>
        <div
          className="group/about relative overflow-hidden rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/25 p-8 shadow-xl shadow-folio-surface/10 backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 dark:border-white/10 dark:bg-zinc-950/35 dark:shadow-black/20 md:p-12 lg:p-14 xl:p-16 md:backdrop-blur-3xl hover:border-folio-primary hover:shadow-xl hover:shadow-folio-primary/25 dark:hover:border-folio-primary dark:hover:shadow-folio-primary/30"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-folio-primary/[0.07] via-transparent to-folio-tertiary/[0.06] opacity-80" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-folio-primary/10 blur-3xl" />

          <div className="relative">
            <h2 className="kinetic-monolith mb-8 text-3xl font-black uppercase text-folio-on-surface md:mb-10 md:text-4xl">
              About
            </h2>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:divide-x lg:divide-folio-outline-variant/20 dark:lg:divide-white/10">
              <div className="min-w-0 space-y-5 pr-0 text-base leading-relaxed text-folio-on-surface-variant lg:pr-10 xl:pr-14 md:text-lg xl:text-xl">
                {paragraphs.map((text, i) => (
                  <p key={i} className="text-pretty">
                    {text}
                  </p>
                ))}
              </div>

              <div className="flex min-h-0 min-w-0 items-center justify-center pl-0 lg:pl-10 xl:pl-14">
                <div className="relative mx-auto aspect-square w-full max-w-md lg:mx-0 lg:max-w-none xl:max-w-xl 2xl:max-w-2xl">
                  <div className="relative h-full w-full overflow-hidden rounded-xl border-2 border-folio-primary bg-folio-surface-high/50 shadow-inner transition-[border-color,box-shadow] duration-500 group-hover/about:border-folio-primary group-hover/about:shadow-md group-hover/about:shadow-folio-primary/20">
                    {photoOk ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/headshot.jpeg"
                        alt={personal.name}
                        className="absolute inset-0 h-full w-full object-cover grayscale opacity-55 transition-all duration-700 ease-out group-hover/about:grayscale-0 group-hover/about:opacity-100 group-hover/about:scale-[1.02]"
                        onError={() => setPhotoOk(false)}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-folio-primary/25 via-folio-surface-highest to-folio-tertiary/25 transition-opacity duration-500 group-hover/about:from-folio-primary/40" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-folio-surface-highest/90 via-transparent to-transparent opacity-90 transition-opacity duration-500 group-hover/about:opacity-40" />
                    {personal.quote ? (
                      <p className="pointer-events-none absolute bottom-4 left-4 right-4 max-w-[90%] text-pretty text-xs font-medium italic leading-snug text-folio-on-surface-variant transition-colors duration-500 group-hover/about:text-folio-on-surface sm:text-sm md:bottom-6 md:left-6 md:right-6">
                        &ldquo;{personal.quote}&rdquo;
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {education.length > 0 ? (
          <div className="mt-14 md:mt-20">
            <h2 className="kinetic-monolith mb-2 text-3xl font-black uppercase text-folio-on-surface md:mb-3 md:text-4xl">
              Academic Credentials
            </h2>
            <p className="technical-label mb-8 text-sm tracking-widest text-folio-on-surface-variant md:mb-10">
              Degrees &amp; formal training
            </p>

            <ul
              role="list"
              className="flex snap-x snap-mandatory flex-row gap-4 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] md:grid md:snap-none md:grid-cols-2 md:gap-6 md:overflow-visible md:pb-0 lg:gap-8 xl:grid-cols-2 2xl:gap-10"
            >
              {education.map((edu, index) => (
                <li
                  key={`${edu.institution}-${edu.degree}`}
                  className="min-w-[min(100%,18rem)] shrink-0 snap-start sm:min-w-[20rem] md:min-w-0"
                >
                  <a
                    href={edu.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group flex h-full min-h-0 flex-col overflow-hidden',
                      sectionGlassCard,
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span
                        className={cn(
                          'technical-label text-[10px] font-bold uppercase tracking-[0.2em]',
                          index % 2 === 0
                            ? 'text-folio-secondary'
                            : 'text-folio-primary',
                        )}
                      >
                        {edu.duration}
                      </span>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-folio-outline-variant/25 bg-folio-surface-high/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={edu.logo}
                          alt={edu.institution}
                          className="logo-icon h-6 w-6 object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="pr-6 text-lg font-bold leading-snug text-folio-on-surface sm:text-xl">
                      {edu.degree}
                    </h3>
                    <p className="technical-label mt-2 text-[11px] uppercase tracking-wider text-folio-on-surface-variant">
                      {edu.institution}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-folio-on-surface-variant">
                      {edu.details}
                    </p>
                    {edu.grade ? (
                      <p className="mt-2 text-sm font-medium text-folio-primary">{edu.grade}</p>
                    ) : null}
                    <span className="technical-label mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-folio-on-surface">
                      View credentials
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-folio-on-surface-variant transition-colors group-hover:text-folio-primary"
                        aria-hidden
                      />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
