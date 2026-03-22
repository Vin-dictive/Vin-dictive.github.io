interface Personal {
  email: string
  linkedin: string
}

export default function ContactSection({ personal }: { personal: Personal }) {
  const linkedinUrl = `https://www.linkedin.com/in/${personal.linkedin}`

  return (
    <section className="py-32 px-8 bg-transparent" id="contact">
      <div className="max-w-screen-xl mx-auto text-center">
        <div className="inline-block p-4 border border-folio-primary/20 bg-folio-primary/5 technical-label text-xs uppercase tracking-[0.5em] text-folio-primary mb-12">
          Initiate Connection
        </div>
        <h2 className="text-6xl md:text-8xl font-black kinetic-monolith text-folio-on-surface uppercase mb-8">
          Ready for the <br /> next challenge?
        </h2>
        <p className="text-xl text-folio-on-surface-variant max-w-2xl mx-auto mb-16">
          Open to impactful engineering roles and collaborative projects. Let&apos;s build something
          worth shipping.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-6">
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full rounded-sm border border-folio-outline-variant px-12 py-5 text-sm font-bold uppercase tracking-widest text-folio-on-surface transition-colors hover:border-folio-primary hover:bg-folio-primary/10 dark:hover:bg-folio-primary/20 md:w-auto"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  )
}
