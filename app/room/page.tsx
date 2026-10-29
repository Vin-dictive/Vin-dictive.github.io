import type { Metadata } from 'next'
import Link from 'next/link'
import RoomShell from '@/components/room/RoomShell'
import { toRoomData } from '@/components/room/layout'
import profileData from '@/data/profile.json'

const data = toRoomData(profileData)
const { personal } = data

export const metadata: Metadata = {
  title: `Room | ${personal.name}`,
  description: personal.about.split('\n')[0],
}

const revealOnFocus =
  'focus:not-sr-only focus:fixed focus:bottom-24 focus:left-1/2 focus:z-50 focus:-translate-x-1/2 focus:rounded-lg focus:bg-folio-surface-highest focus:px-3 focus:py-2 focus:text-xs focus:text-folio-on-surface focus:outline-2 focus:outline-folio-primary'

/** Screen-reader and crawler mirror of everything painted on the room's walls. */
function RoomMirror() {
  return (
    <div className="sr-only">
      <h1>{personal.name}</h1>
      <p>{personal.quote}</p>
      <p>
        This is the room view.{' '}
        <Link href="/" className={revealOnFocus}>
          Switch to the page view
        </Link>
      </p>

      <section aria-labelledby="room-work">
        <h2 id="room-work">Work</h2>
        <ol>
          {data.projects.map((p) => (
            <li key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <a href={p.link} target="_blank" rel="noopener noreferrer" className={revealOnFocus}>
                Open {p.name}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="room-journey">
        <h2 id="room-journey">Journey</h2>
        <ol>
          {data.journey.map((e) => (
            <li key={`${e.org}-${e.duration}`}>
              <h3>
                {e.title}, {e.org}
              </h3>
              <p>
                {e.kind === 'experience' ? 'Experience' : 'Education'} · {e.duration}
                {e.location ? ` · ${e.location}` : ''}
              </p>
              <p>{e.description}</p>
              {e.grade ? <p>{e.grade}</p> : null}
              {e.kind === 'experience' && e.chips.length > 0 ? (
                <p>Stack: {e.chips.join(', ')}</p>
              ) : null}
              <a href={e.link} target="_blank" rel="noopener noreferrer" className={revealOnFocus}>
                {e.org}
              </a>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="room-info">
        <h2 id="room-info">Info</h2>
        {personal.about.split(/\n\s*\n/).map((para) => (
          <p key={para.slice(0, 24)}>{para}</p>
        ))}
        <p>Based in {personal.location}.</p>
        <ul>
          {data.contacts.map((c) => (
            <li key={c.label}>
              <a href={c.href} className={revealOnFocus}>
                {c.label}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default function RoomPage() {
  return (
    <>
      <RoomShell data={data} />
      <RoomMirror />
    </>
  )
}
