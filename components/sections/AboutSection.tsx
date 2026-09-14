"use client"

import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import ParallaxBackground from '@/components/ParallaxBackground'
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
      className={`folio-slide relative isolate bg-transparent pb-8 pt-24 sm:pt-28 ${folioSectionXPad}`}
    >
      <ParallaxBackground src="/parallax/about.jpg" />
      <div className={`flex min-h-0 w-full flex-col gap-5 ${folioContainerClass}`}>
        <div
          className="group/about relative min-h-0 flex-1 overflow-hidden rounded-xl border border-folio-on-surface/10 bg-folio-surface-highest/25 p-6 shadow-xl shadow-folio-surface/10 backdrop-blur-2xl transition-[border-color,box-shadow] duration-500 dark:border-white/10 dark:bg-zinc-950/35 dark:shadow-black/20 md:p-8 md:backdrop-blur-3xl hover:border-folio-primary hover:shadow-xl hover:shadow-folio-primary/25 dark:hover:border-folio-primary dark:hover:shadow-folio-primary/30"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-folio-primary/[0.07] via-transparent to-folio-tertiary/[0.06] opacity-80" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-folio-primary/10 blur-3xl" />

          <div className="relative flex h-full min-h-0 flex-col">
            <h2 className="kinetic-monolith mb-4 text-2xl font-black uppercase text-folio-on-surface md:mb-5 md:text-3xl">
              About
            </h2>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:divide-x lg:divide-folio-outline-variant/20 dark:lg:divide-white/10">
              <div className="hscroll min-h-0 min-w-0 space-y-4 overflow-y-auto pr-0 text-sm leading-relaxed text-folio-on-surface-variant lg:pr-8 md:text-base xl:text-lg">
                {paragraphs.map((text, i) => (
                  <p key={i} className="text-pretty">
                    {text}
                  </p>
                ))}
              </div>

              <div className="flex min-h-0 min-w-0 items-center justify-center pl-0 lg:pl-8">
                <div className="relative mx-auto aspect-square w-full max-w-sm lg:h-full lg:w-auto lg:max-w-none">
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
                      <p className="pointer-events-none absolute bottom-4 left-4 right-4 max-w-[90%] text-pretty text-xs font-medium italic leading-snug text-folio-on-surface-variant transition-colors duration-500 group-hover/about:text-folio-on-surface sm:text-sm">
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
          <div className="shrink-0">
            <div className="mb-3 flex items-baseline gap-4">
              <h2 className="kinetic-monolith text-xl font-black uppercase text-folio-on-surface md:text-2xl">
                Academic Credentials
              </h2>
              <p className="technical-label hidden text-xs tracking-widest text-folio-on-surface-variant sm:block">
                Degrees &amp; formal training
              </p>
            </div>

            <ul
              role="list"
              className="hscroll flex snap-x snap-mandatory flex-row gap-4 overflow-x-auto [-webkit-overflow-scrolling:touch]"
            >
              {education.map((edu, index) => (
                <li
                  key={`${edu.institution}-${edu.degree}`}
                  className="min-w-[min(100%,18rem)] shrink-0 snap-start sm:min-w-[22rem] lg:flex-1"
                >
                  <a
                    href={edu.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'group flex h-full min-h-0 flex-col overflow-hidden !p-4',
                      sectionGlassCard,
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-folio-outline-variant/25 bg-folio-surface-high/80 backdrop-blur-sm dark:border-white/10 dark:bg-zinc-900/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={edu.logo}
                          alt={edu.institution}
                          className="logo-icon h-6 w-6 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold leading-snug text-folio-on-surface">
                          {edu.degree}
                        </h3>
                        <p className="technical-label mt-1 text-[10px] uppercase tracking-wider text-folio-on-surface-variant">
                          {edu.institution}
                          <span
                            className={cn(
                              'ml-2',
                              index % 2 === 0 ? 'text-folio-secondary' : 'text-folio-primary',
                            )}
                          >
                            {edu.duration}
                          </span>
                          {edu.grade ? (
                            <span className="ml-2 text-folio-primary">{edu.grade}</span>
                          ) : null}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-folio-on-surface-variant">
                          {edu.details}
                        </p>
                      </div>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 text-folio-on-surface-variant transition-colors group-hover:text-folio-primary"
                        aria-hidden
                      />
                    </div>
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
