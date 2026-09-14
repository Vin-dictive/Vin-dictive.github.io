#!/usr/bin/env node
/**
 * Generate optimized section-background images for the parallax layers.
 *
 * Source photos in public/pictures/ are 3–9MB straight off the camera —
 * far too heavy to ship six of them as page backgrounds. This resamples
 * each chosen shot to 1920px wide JPEG (~55 quality) in public/parallax/.
 *
 * Uses macOS `sips` (no extra dependencies). Re-run after changing SOURCES.
 *
 * Usage: node scripts/generate-parallax.mjs
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const picturesDir = path.join(root, 'public/pictures')
const outDir = path.join(root, 'public/parallax')

/** Section → source photo (all from the Banff/Jasper gallery set). */
const SOURCES = {
  home: 'IMG_0988.JPG', // Banff valley panorama from Sulphur Mountain
  about: 'IMG_1137.JPG', // Lake Louise
  experience: 'IMG_1160.JPG', // Bow Lake mirror reflection
  projects: 'IMG_1051.JPG', // Mount Rundle over the meadow
  certifications: 'IMG_1228.JPG', // Athabasca Glacier
  contact: 'IMG_0982.JPG', // Canmore main street at dusk
}

const WIDTH = 1920
const QUALITY = 55

fs.mkdirSync(outDir, { recursive: true })

for (const [section, file] of Object.entries(SOURCES)) {
  const src = path.join(picturesDir, file)
  if (!fs.existsSync(src)) {
    console.error(`✗ ${section}: missing source ${file}`)
    process.exitCode = 1
    continue
  }
  const dest = path.join(outDir, `${section}.jpg`)
  execFileSync('sips', [
    '--resampleWidth', String(WIDTH),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(QUALITY),
    src,
    '--out', dest,
  ], { stdio: 'ignore' })
  const kb = Math.round(fs.statSync(dest).size / 1024)
  console.log(`✓ ${section}.jpg ← ${file} (${kb} KB)`)
}
