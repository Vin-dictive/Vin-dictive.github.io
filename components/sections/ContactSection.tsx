import { folioContainerClass, folioSectionXPad } from '@/components/sections/folioLayout'

interface Personal {
  email: string
  linkedin: string
}

export default function ContactSection({ personal }: { personal: Personal }) {
  const linkedinUrl = `https://www.linkedin.com/in/${personal.linkedin}`

  return (
    <section
      id="contact"
      className={`folio-section bg-transparent py-32 ${folioSectionXPad}`}
    >
      <div className={`${folioContainerClass} text-center`}>
        <div className="inline-block p-4 border border-folio-primary/20 bg-folio-primary/5 technical-label text-xs uppercase tracking-[0.5em] text-folio-primary mb-12">
          Initiate Connection
        </div>
        <h2 className="kinetic-monolith mb-8 text-5xl font-black uppercase text-folio-on-surface sm:text-6xl md:text-7xl xl:text-8xl 2xl:text-9xl">
          Let&apos;s talk about <br /> what you&apos;re building
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-lg text-folio-on-surface-variant sm:text-xl xl:max-w-3xl 2xl:max-w-4xl 2xl:text-2xl">
          Open to impactful engineering roles and collaborative projects where craft and clarity
          matter. If that sounds like your team, I&apos;d like to hear from you.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-xl border border-folio-outline-variant px-12 py-5 text-sm font-bold uppercase tracking-widest text-folio-on-surface transition-colors hover:border-folio-primary hover:bg-folio-primary/10 dark:hover:bg-folio-primary/20 md:w-auto"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
