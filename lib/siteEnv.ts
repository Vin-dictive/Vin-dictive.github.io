/** Build-time flag: set NEXT_PUBLIC_SITE_ENV=development when building the Tailscale/dev VM. */
export const isDevSite =
  process.env.NEXT_PUBLIC_SITE_ENV === "development"
