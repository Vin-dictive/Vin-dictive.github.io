/**
 * Content → panel mapping and ring angle maths for the room.
 *
 * Imported by the server page and the client shell, so it must stay free of
 * `three` and of browser APIs.
 *
 * Angles: a "room angle" of 0 faces straight ahead (-Z) and grows to the right.
 */

export const ROOM_RADIUS = 6
const DEG = Math.PI / 180

export type SectionId = "work" | "journey" | "info"

export const SECTIONS: readonly { id: SectionId; label: string }[] = [
  { id: "work", label: "Work" },
  { id: "journey", label: "Journey" },
  { id: "info", label: "Info" },
]

export type PanelSize = "work" | "journey" | "facet" | "info"

/**
 * World-space panel size. Every section shares one ring, so the cards are
 * small and share a height; hovering one enlarges it to read.
 */
export const PANEL_SIZES: Record<PanelSize, { w: number; h: number }> = {
  work: { w: 1.44, h: 1.8 },
  journey: { w: 1.53, h: 1.8 },
  info: { w: 4.44, h: 1.8 },
  facet: { w: 2.6, h: 2.925 },
}

/** Gap between neighbouring cards; whatever is left of 360° separates the sections. */
const CARD_GAP = 2.5 * DEG
const FACET_PITCH = 30 * DEG

export interface RoomPersonal {
  name: string
  quote: string
  location: string
  email: string
  github: string
  linkedin: string
  about: string
  resumeUrl: string
}

export interface RoomProject {
  name: string
  description: string
  link: string
}

export interface JourneyEntry {
  kind: "experience" | "education"
  title: string
  org: string
  duration: string
  location: string | null
  description: string
  chips: string[]
  logo: string
  link: string
  grade: string | null
  current: boolean
}

export interface ContactLink {
  label: string
  href: string
}

export interface RoomData {
  personal: RoomPersonal
  projects: RoomProject[]
  journey: JourneyEntry[]
  contacts: ContactLink[]
}

interface ProfileLike {
  personal: RoomPersonal
  projects: RoomProject[]
  experience: {
    title: string
    company: string
    duration: string
    location: string
    description: string
    techStack: string | null
    logo: string
    link: string
  }[]
  education: {
    degree: string
    institution: string
    duration: string
    details: string
    grade: string
    logo: string
    link: string
  }[]
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
]

/** "September 2026 - Present" → 2026*12+8; a bare "2025 - 2026" starts in January. */
function durationStart(duration: string) {
  const start = duration.split(/\s+-\s+/)[0].trim().toLowerCase()
  const year = Number(start.match(/\d{4}/)?.[0] ?? 0)
  const month = MONTHS.findIndex((m) => start.startsWith(m))
  return year * 12 + Math.max(0, month)
}

function splitList(s: string | null, sep: RegExp) {
  if (!s) return []
  return s
    .split(sep)
    .map((t) => t.trim())
    .filter(Boolean)
}

export function toRoomData(profile: ProfileLike): RoomData {
  const { personal } = profile
  const experience: JourneyEntry[] = profile.experience.map((e) => ({
    kind: "experience",
    title: e.title,
    org: e.company,
    duration: e.duration,
    location: e.location,
    description: e.description,
    chips: splitList(e.techStack, /,/),
    logo: e.logo,
    link: e.link,
    grade: null,
    current: /present/i.test(e.duration),
  }))
  const education: JourneyEntry[] = profile.education.map((e) => ({
    kind: "education",
    title: e.degree,
    org: e.institution,
    duration: e.duration,
    location: null,
    description: e.details,
    chips: splitList(e.details, /\|/),
    logo: e.logo,
    link: e.link,
    grade: e.grade,
    current: false,
  }))
  const journey = [...experience, ...education].sort(
    (a, b) => durationStart(b.duration) - durationStart(a.duration),
  )

  return {
    personal: {
      name: personal.name,
      quote: personal.quote,
      location: personal.location,
      email: personal.email,
      github: personal.github,
      linkedin: personal.linkedin,
      about: personal.about,
      resumeUrl: personal.resumeUrl,
    },
    projects: profile.projects.slice(0, 12).map(({ name, description, link }) => ({
      name,
      description,
      link,
    })),
    journey,
    contacts: [
      { label: "Email", href: `mailto:${personal.email}` },
      { label: "LinkedIn", href: `https://www.linkedin.com/in/${personal.linkedin}` },
      { label: "GitHub", href: `https://github.com/${personal.github}` },
      { label: "Resume", href: personal.resumeUrl },
    ],
  }
}

/** Generic drill-down facet; the painter composes whichever fields are present. */
export interface FacetContent {
  type: "facet"
  tag: string
  step: number
  steps: number
  eyebrow: string
  heading: string
  big?: string
  text?: string
  lines?: string[]
  chips?: string[]
  logo?: string
  link?: { href: string; display: string; cta: string }
}

export type PanelContent =
  | { type: "project"; n: number; total: number; project: RoomProject }
  | { type: "journey"; n: number; total: number; entry: JourneyEntry }
  | { type: "info"; personal: RoomPersonal; contacts: ContactLink[] }
  | FacetContent

export interface PanelSpec {
  id: string
  size: PanelSize
  section: SectionId
  /** Position within its section (0-based). */
  local: number
  /** Screen-reader label, also used for the aria-live announcement. */
  label: string
  content: PanelContent
  /** Activating it re-forms the wall as this item's facets. */
  openable: boolean
  /** Activating it follows this link instead. */
  href?: string
}

export interface RingSpec {
  key: string
  panels: PanelSpec[]
  /** Panel centre angles relative to the first panel. */
  offsets: number[]
  /** Whether ← → wrap around from the last panel to the first. */
  wrap: boolean
  /** The panel placed directly in front of the camera when this ring forms. */
  focusIndex: number
  /** Index of the opened item in the room ring, when this is a drill-down. */
  openIndex: number | null
}

export function pad2(n: number) {
  return String(n).padStart(2, "0")
}

export function linkDisplay(href: string) {
  if (href.startsWith("mailto:")) return href.slice(7)
  try {
    const url = new URL(href, "https://vin-dictive.github.io")
    const path = url.pathname.replace(/\/$/, "")
    const full = `${url.host.replace(/^www\./, "")}${path}`
    return full.length > 44 ? `${full.slice(0, 43)}…` : full
  } catch {
    return href
  }
}

function journeyNoun(entry: JourneyEntry) {
  return entry.kind === "experience" ? "Experience" : "Education"
}

function sectionPanels(data: RoomData, section: SectionId): PanelSpec[] {
  if (section === "work") {
    const total = data.projects.length
    return data.projects.map((project, i) => ({
      id: `work-${i}`,
      size: "work",
      section,
      local: i,
      label: `Project ${i + 1} of ${total}, ${project.name}`,
      content: { type: "project", n: i + 1, total, project },
      openable: true,
    }))
  }
  if (section === "journey") {
    const total = data.journey.length
    return data.journey.map((entry, i) => ({
      id: `journey-${i}`,
      size: "journey",
      section,
      local: i,
      label: `${journeyNoun(entry)}, ${i + 1} of ${total}: ${entry.title}, ${entry.org}`,
      content: { type: "journey", n: i + 1, total, entry },
      openable: true,
    }))
  }
  return [
    {
      id: "info",
      size: "info",
      section,
      local: 0,
      label: `Info: ${data.personal.name}, ${data.personal.location}`,
      content: { type: "info", personal: data.personal, contacts: data.contacts },
      openable: false,
    },
  ]
}

/** Every section, in order, on one wall. */
function roomPanels(data: RoomData) {
  return SECTIONS.flatMap((s) => sectionPanels(data, s.id))
}

/** Index of a section's first panel in the room ring. */
export function sectionStart(data: RoomData, section: SectionId) {
  return roomPanels(data).findIndex((p) => p.section === section)
}

/**
 * Centre angles around the full circle: cards sit `CARD_GAP` apart, and the
 * rest of the 360° is split evenly between the section boundaries.
 */
function roomOffsets(panels: PanelSpec[]) {
  const width = (p: PanelSpec) => PANEL_SIZES[p.size].w / ROOM_RADIUS
  const boundaries = panels.filter((p, i) => p.section !== panels[(i + 1) % panels.length].section).length
  const cards = panels.reduce((sum, p) => sum + width(p), 0)
  const inner = (panels.length - boundaries) * CARD_GAP
  const sectionGap = Math.max(CARD_GAP, (Math.PI * 2 - cards - inner) / Math.max(1, boundaries))
  const offsets: number[] = []
  let at = 0
  panels.forEach((p, i) => {
    if (i > 0) {
      const prev = panels[i - 1]
      at += width(prev) / 2 + (prev.section === p.section ? CARD_GAP : sectionGap) + width(p) / 2
    }
    offsets.push(at)
  })
  return offsets
}

type FacetDraft = Omit<FacetContent, "type" | "step" | "steps">

function facetDrafts(data: RoomData, section: SectionId, index: number): FacetDraft[] {
  if (section === "work") {
    const p = data.projects[index]
    const eyebrow = `Project ${pad2(index + 1)} / ${pad2(data.projects.length)}`
    return [
      { tag: "Title", eyebrow, heading: p.name, big: pad2(index + 1) },
      { tag: "Brief", eyebrow, heading: "Brief", text: p.description },
      {
        tag: "Open",
        eyebrow,
        heading: "Open project",
        text: "Opens in a new tab.",
        link: { href: p.link, display: linkDisplay(p.link), cta: "Open project" },
      },
    ]
  }
  const e = data.journey[index]
  const eyebrow = `${journeyNoun(e)} · ${e.duration}`
  const visit = { href: e.link, display: linkDisplay(e.link), cta: `Visit ${e.kind === "experience" ? "company" : "school"}` }
  if (e.kind === "experience") {
    return [
      {
        tag: "Role",
        eyebrow,
        heading: e.title,
        logo: e.logo,
        lines: [e.org, e.duration, e.location ?? ""].filter(Boolean),
        link: visit,
      },
      { tag: "Brief", eyebrow, heading: "Brief", text: e.description },
      { tag: "Stack", eyebrow, heading: "Stack", chips: e.chips },
    ]
  }
  const [gradeLabel, gradeValue] = (e.grade ?? "").split(/:\s*/)
  return [
    {
      tag: "Degree",
      eyebrow,
      heading: e.title,
      logo: e.logo,
      lines: [e.org, e.duration],
      link: visit,
    },
    { tag: "Details", eyebrow, heading: "Details", lines: e.chips },
    {
      tag: "Grade",
      eyebrow,
      heading: gradeValue ? gradeLabel : "Grade",
      big: gradeValue ?? gradeLabel,
    },
  ]
}

/**
 * The room ring (every section on one wall), or — when `openIndex` names an
 * openable panel — the drill-down ring of that item's facets.
 */
export function buildRing(data: RoomData, openIndex: number | null, focusIndex = 0): RingSpec {
  const room = roomPanels(data)
  const parent = openIndex !== null ? room[openIndex] : undefined

  if (openIndex !== null && parent?.openable) {
    const drafts = facetDrafts(data, parent.section, parent.local)
    const panels: PanelSpec[] = drafts.map((d, i) => ({
      id: `${parent.id}-facet-${i}`,
      size: "facet",
      section: parent.section,
      local: i,
      label: `${d.tag}, ${i + 1} of ${drafts.length}. ${parent.label}`,
      content: { type: "facet", step: i + 1, steps: drafts.length, ...d },
      openable: false,
      href: d.link?.href,
    }))
    return {
      key: `room/${openIndex}`,
      panels,
      offsets: panels.map((_, i) => i * FACET_PITCH),
      wrap: false,
      focusIndex: 0,
      openIndex,
    }
  }

  return {
    key: "room",
    panels: room,
    offsets: roomOffsets(room),
    wrap: true,
    focusIndex: Math.min(Math.max(0, focusIndex), room.length - 1),
    openIndex: null,
  }
}

export function sectionCount(data: RoomData, section: SectionId) {
  return section === "work" ? data.projects.length : section === "journey" ? data.journey.length : 1
}

/** Absolute room angles for a ring formed with its focus panel at `anchor`. */
export function ringAngles(ring: RingSpec, anchor: number) {
  const base = anchor - ring.offsets[ring.focusIndex]
  return ring.offsets.map((o) => base + o)
}

/** Shortest signed angular difference, in (-π, π]. */
export function wrapAngle(a: number) {
  const t = Math.PI * 2
  return a - t * Math.floor((a + Math.PI) / t)
}

export function journeyLogos(data: RoomData) {
  return [...new Set(data.journey.map((e) => e.logo))]
}
