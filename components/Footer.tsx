interface FooterProps {
  brand: string
  github: string
  linkedin: string
  email: string
}

export default function Footer({ brand, github, linkedin, email }: FooterProps) {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-folio-outline-variant/25 bg-folio-surface-low/60 py-12 backdrop-blur-lg dark:border-zinc-900 dark:bg-zinc-950/75">
      <div className="mx-auto flex w-full max-w-[100rem] flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row md:px-8 lg:px-10 xl:px-12 2xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-left">
          <span className="font-black text-folio-on-surface uppercase tracking-tighter dark:text-white">
            {brand}
          </span>
          <span className="hidden sm:inline text-folio-outline-variant text-lg dark:text-zinc-800">|</span>
          <p className="font-label text-[10px] uppercase tracking-widest text-folio-on-surface-variant dark:text-zinc-500">
            © {year} {brand}. ENGINEERED FOR PERFORMANCE.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <a
            className="font-label text-xs uppercase tracking-widest text-folio-on-surface-variant hover:text-red-600 transition-colors dark:text-zinc-600 dark:hover:text-red-500"
            href={`https://github.com/${github}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            className="font-label text-xs uppercase tracking-widest text-folio-on-surface-variant hover:text-red-600 transition-colors dark:text-zinc-600 dark:hover:text-red-500"
            href={`https://www.linkedin.com/in/${linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="font-label text-xs uppercase tracking-widest text-folio-on-surface-variant hover:text-red-600 transition-colors dark:text-zinc-600 dark:hover:text-red-500"
            href={`mailto:${email}`}
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  )
}
