import * as THREE from "three"
import { PANEL_SIZES, ROOM_RADIUS, type PanelSize } from "./layout"

const cache = new Map<PanelSize, THREE.CylinderGeometry>()

/**
 * A curved panel: an open cylinder sector of the room's radius, centred on the
 * -Z axis (room angle 0). Place it with `mesh.rotation.y = -angle`.
 *
 * CylinderGeometry runs `u` with theta, which reads right-to-left from inside
 * the cylinder, so `u` is flipped here once instead of on every texture. That
 * also makes raycast UVs land directly in texture space.
 */
export function panelGeometry(size: PanelSize) {
  let geo = cache.get(size)
  if (geo) return geo
  const { w, h } = PANEL_SIZES[size]
  const thetaLength = w / ROOM_RADIUS
  const segments = Math.max(16, Math.ceil((thetaLength * 180) / Math.PI))
  geo = new THREE.CylinderGeometry(
    ROOM_RADIUS,
    ROOM_RADIUS,
    h,
    segments,
    1,
    true,
    Math.PI - thetaLength / 2,
    thetaLength,
  )
  const uv = geo.getAttribute("uv") as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i))
  uv.needsUpdate = true
  cache.set(size, geo)
  return geo
}

export function disposePanelGeometries() {
  for (const geo of cache.values()) geo.dispose()
  cache.clear()
}
