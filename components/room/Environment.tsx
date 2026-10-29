"use client"

import { useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { Skin } from "./useRoomSkin"
import type { YawController } from "./useYaw"

const SHELL_RADIUS = 15

/** CursorDotBackground's tuning, in CSS px; converted to angles on the wall. */
const GRID_PX = 34
const INFLUENCE_PX = 240
const MAX_SHIFT_PX = 20
const DOT_PX = 1.45

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`

/**
 * CursorDotBackground, painted on the inside of the room. Wall coordinates are
 * (azimuth, elevation) in radians, so the grid is evenly spaced on screen and
 * turns with the room. Blending happens in sRGB to match the Canvas2D original.
 */
const fragmentShader = /* glsl */ `
  uniform vec3 uGround;
  uniform vec3 uAccent;
  uniform vec3 uDot;
  uniform float uDotAlpha;
  uniform float uGlowNear;
  uniform float uGlowFar;
  uniform float uGlowR;
  uniform vec2 uGlowAt;
  uniform vec2 uPointer;
  uniform float uPointerOn;
  uniform float uCell;
  uniform float uInfluence;
  uniform float uMaxShift;
  uniform float uDotR;
  varying vec3 vWorld;

  float wrapPi(float x) {
    return x - 6.28318530718 * floor((x + 3.14159265359) / 6.28318530718);
  }
  vec2 delta(vec2 a, vec2 b) {
    return vec2(wrapPi(a.x - b.x), a.y - b.y);
  }

  void main() {
    vec2 wall = vec2(atan(vWorld.x, -vWorld.z), atan(vWorld.y, length(vWorld.xz)));

    float t = length(delta(wall, uGlowAt)) / uGlowR;
    float glow = t < 0.38 ? mix(uGlowNear, uGlowFar, t / 0.38) : mix(uGlowFar, 0.0, clamp((t - 0.38) / 0.62, 0.0, 1.0));
    vec3 col = mix(uGround, uAccent, glow * uPointerOn);

    vec2 g = wall / uCell;
    vec2 base = floor(g);
    float px = length(fwidth(wall)) * 0.5;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 c = (base + vec2(float(i), float(j)) + 0.5) * uCell;
        vec2 d = delta(c, uPointer);
        float dist = max(length(d), 1e-5);
        float f = uInfluence > 0.0 ? max(0.0, 1.0 - dist / uInfluence) * uPointerOn : 0.0;
        vec2 centre = c + d / dist * f * uMaxShift;
        float r = uDotR * (1.0 + f);
        float cover = 1.0 - smoothstep(r - px, r + px, length(delta(wall, centre)));
        float a = min(1.0, uDotAlpha * (0.62 + f * 0.85)) * cover;
        col = mix(col, mix(uDot, uAccent, f * 0.48), a);
      }
    }

    gl_FragColor = sRGBTransferEOTF(vec4(col, 1.0));
    #include <colorspace_fragment>
  }
`

export default function Environment({ skin, yaw, reducedMotion }: { skin: Skin; yaw: YawController; reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const smooth = useRef({ x: -9999, y: -9999, on: 0 })
  const uniforms = useMemo(
    () => ({
      uGround: { value: new THREE.Vector3() },
      uAccent: { value: new THREE.Vector3() },
      uDot: { value: new THREE.Vector3() },
      uDotAlpha: { value: 0 },
      uGlowNear: { value: 0 },
      uGlowFar: { value: 0 },
      uGlowR: { value: 1 },
      uGlowAt: { value: new THREE.Vector2() },
      uPointer: { value: new THREE.Vector2() },
      uPointerOn: { value: 0 },
      uCell: { value: 0.03 },
      uInfluence: { value: 0 },
      uMaxShift: { value: 0 },
      uDotR: { value: 0.001 },
    }),
    [],
  )
  const tmp = useMemo(() => ({ color: new THREE.Color(), dir: new THREE.Vector3() }), [])

  useFrame((_, dt) => {
    const u = uniforms
    const srgb = (c: THREE.Color, out: THREE.Vector3) => {
      tmp.color.copy(c).getRGB(tmp.color, THREE.SRGBColorSpace)
      out.set(tmp.color.r, tmp.color.g, tmp.color.b)
    }
    srgb(skin.ground, u.uGround.value)
    srgb(skin.accent, u.uAccent.value)
    srgb(skin.dot, u.uDot.value)
    u.uDotAlpha.value = skin.dotAlpha
    u.uGlowNear.value = skin.glowNear
    u.uGlowFar.value = skin.glowFar

    const rect = gl.domElement.getBoundingClientRect()
    const rad = yaw.radPerPx
    const cols = Math.max(8, Math.round((Math.PI * 2) / (GRID_PX * rad)))
    u.uCell.value = (Math.PI * 2) / cols
    u.uDotR.value = DOT_PX * rad
    u.uGlowR.value = Math.min(rect.width, rect.height) * 0.46 * rad

    const toWall = (x: number, y: number, out: THREE.Vector2) => {
      const ndcX = ((x - rect.left) / rect.width) * 2 - 1
      const ndcY = -((y - rect.top) / rect.height) * 2 + 1
      const d = tmp.dir.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize()
      out.set(Math.atan2(d.x, -d.z), Math.atan2(d.y, Math.hypot(d.x, d.z)))
    }

    const s = smooth.current
    if (reducedMotion) {
      // Matches the page: glow pinned, dots still.
      toWall(rect.left + rect.width * 0.5, rect.top + rect.height * 0.38, u.uGlowAt.value)
      u.uPointerOn.value = 1
      u.uInfluence.value = 0
      u.uMaxShift.value = 0
      return
    }
    const p = yaw.pointer
    const k = 1 - Math.exp(-dt * 9)
    if (s.x < -9000) {
      s.x = p.x
      s.y = p.y
    } else {
      s.x += (p.x - s.x) * k
      s.y += (p.y - s.y) * k
    }
    s.on += ((p.inside ? 1 : 0) - s.on) * k
    toWall(s.x, s.y, u.uGlowAt.value)
    toWall(p.x, p.y, u.uPointer.value)
    u.uPointerOn.value = s.on
    u.uInfluence.value = INFLUENCE_PX * rad
    u.uMaxShift.value = MAX_SHIFT_PX * rad
  })

  return (
    <mesh renderOrder={-1}>
      <cylinderGeometry args={[SHELL_RADIUS, SHELL_RADIUS, 30, 128, 1, true]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
