#!/usr/bin/env node
/**
 * Sync public/pictures/ → data/profile.json "pictures" array.
 *
 * - Reads GPS from image metadata (macOS mdls) when available
 * - Sets "location" from geotag (Banff, Canmore, Lake Louise, etc.)
 * - Preserves your custom "caption" text (does not overwrite non-empty captions)
 *
 * Usage: node scripts/sync-gallery.mjs
 *
 * Edit captions in data/profile.json, e.g.:
 *   { "src": "/pictures/IMG_0867.JPG", "caption": "Three Sisters at golden hour", "location": "Canmore, Alberta" }
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const profilePath = path.join(root, 'data/profile.json')
const picturesDir = path.join(root, 'public/pictures')

const AUTO_CAPTION = /^IMG \d+$/i

function getGps(filePath) {
  try {
    const lat = execSync(`mdls -raw -name kMDItemLatitude "${filePath}"`, {
      encoding: 'utf8',
    }).trim()
    const lon = execSync(`mdls -raw -name kMDItemLongitude "${filePath}"`, {
      encoding: 'utf8',
    }).trim()
    const la = parseFloat(lat)
    const lo = parseFloat(lon)
    if (!Number.isFinite(la) || !Number.isFinite(lo) || (la === 0 && lo === 0)) {
      return null
    }
    return { lat: la, lon: lo }
  } catch {
    return null
  }
}

function locationFromGPS(lat, lon) {
  if (lat >= 52.0) return 'Icefields Parkway, Alberta'
  if (lat >= 51.38) return 'Lake Louise, Alberta'
  if (lat >= 51.15) return 'Banff, Alberta'
  if (lat >= 50.95) return 'Canmore, Alberta'
  return 'Canadian Rockies, Alberta'
}

function isCustomCaption(caption) {
  return Boolean(caption?.trim()) && !AUTO_CAPTION.test(caption.trim())
}

const profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'))
const existingBySrc = new Map(
  (profile.pictures ?? []).map((p) => [p.src, p]),
)

const files = fs
  .readdirSync(picturesDir)
  .filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

profile.pictures = files.map((file) => {
  const src = `/pictures/${file}`
  const prev = existingBySrc.get(src)
  const gps = getGps(path.join(picturesDir, file))
  const location = gps ? locationFromGPS(gps.lat, gps.lon) : prev?.location ?? ''
  const caption = isCustomCaption(prev?.caption) ? prev.caption.trim() : ''
  const alt =
    caption && location
      ? `${caption}: ${location}`
      : caption
        ? caption
        : location
          ? `Photography: ${location}`
          : 'Photography'

  return { src, alt, caption, location }
})

fs.writeFileSync(profilePath, `${JSON.stringify(profile, null, 2)}\n`)
console.log(`Synced ${profile.pictures.length} pictures to profile.json`)
