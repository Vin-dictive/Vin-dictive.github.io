import { isDevSite } from "@/lib/siteEnv"

/** Full-width strip above the nav on the development deployment only. */
export default function DevSiteBanner() {
  if (!isDevSite) return null

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex h-8 items-center justify-center bg-folio-primary px-3 text-center dark:bg-folio-primary"
    >
      <p className="technical-label text-[10px] font-bold uppercase tracking-[0.28em] text-folio-on-primary sm:text-[11px]">
        Development site For Tailscale's 👀 only
      </p>
    </div>
  )
}
