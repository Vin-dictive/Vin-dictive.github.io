import { ArrowUpRight } from 'lucide-react'

interface ExperienceItem {
  title: string
  company: string
  duration: string
  location: string
  description: string
  techStack: string
  logo: string
  link: string
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

export default function ExperienceEducationSection({
  experience,
  education,
}: {
  experience: ExperienceItem[]
  education: EducationItem[]
}) {
  return (
    <section className="py-24 px-8 bg-folio-surface-low/50 backdrop-blur-md border-y border-folio-outline-variant/10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-2 gap-24">
          <div id="experience">
            <h2 className="text-4xl font-black kinetic-monolith text-folio-on-surface uppercase mb-12">
              Professional Timeline
            </h2>
            <div className="space-y-12">
              {experience.map((exp, index) => (
                <div
                  key={`${exp.company}-${exp.duration}`}
                  className={`relative pl-8 border-l ${
                    index === 0 ? 'border-folio-primary/30' : 'border-folio-outline-variant/30'
                  }`}
                >
                  <div
                    className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-folio-primary' : 'bg-folio-outline-variant'
                    }`}
                  />
                  <div
                    className={`technical-label text-[10px] font-bold mb-2 uppercase ${
                      index === 0 ? 'text-folio-primary' : 'text-folio-on-surface-variant'
                    }`}
                  >
                    {exp.duration}
                  </div>
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-sm outline-offset-2"
                  >
                    <h4 className="mb-1 flex items-center gap-2 text-xl font-bold text-folio-on-surface transition-colors group-hover:text-folio-primary">
                      {exp.title}
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-folio-primary" />
                    </h4>
                  </a>
                  <p className="technical-label text-sm text-folio-on-surface-variant mb-4 uppercase">
                    {exp.company} · {exp.location}
                  </p>
                  <p className="text-folio-on-surface-variant text-sm leading-relaxed">
                    {exp.description}
                  </p>
                  <p className="technical-label text-[10px] text-folio-on-surface-variant/80 mt-3 uppercase tracking-wider">
                    {exp.techStack}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div id="education">
            <h2 className="text-4xl font-black kinetic-monolith text-folio-on-surface uppercase mb-12">
              Academic Credentials
            </h2>
            <div className="space-y-12">
              {education.map((edu, index) => (
                <a
                  key={`${edu.institution}-${edu.degree}`}
                  href={edu.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block overflow-hidden rounded-sm border border-folio-outline-variant/20 bg-folio-surface-highest p-8 transition-[border-color,box-shadow] hover:border-folio-primary hover:shadow-md hover:shadow-folio-primary/20 dark:hover:border-folio-primary dark:hover:shadow-folio-primary/25"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 blur-2xl transition-all ${
                      index % 2 === 0
                        ? 'bg-folio-secondary/5 group-hover:bg-folio-secondary/20'
                        : 'bg-folio-primary/5 group-hover:bg-folio-primary/20'
                    }`}
                  />
                  <div
                    className={`technical-label text-[10px] font-bold mb-2 uppercase ${
                      index % 2 === 0 ? 'text-folio-secondary' : 'text-folio-primary'
                    }`}
                  >
                    {edu.duration}
                  </div>
                  <h4 className="text-xl font-bold text-folio-on-surface mb-1 pr-8">
                    {edu.degree}
                  </h4>
                  <p className="technical-label text-sm text-folio-on-surface-variant uppercase">
                    {edu.institution}
                  </p>
                  <p className="text-folio-on-surface-variant text-sm mt-3">{edu.details}</p>
                  {edu.grade ? (
                    <p className="text-sm font-medium text-folio-primary mt-2">{edu.grade}</p>
                  ) : null}
                  <ArrowUpRight className="absolute top-6 right-6 w-4 h-4 text-folio-on-surface-variant group-hover:text-folio-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
