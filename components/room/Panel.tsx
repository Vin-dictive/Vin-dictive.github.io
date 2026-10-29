"use client"

import { useLayoutEffect, useMemo, useRef } from "react"
import * as THREE from "three"
import { panelGeometry } from "./geometry"
import { ROOM_RADIUS, type PanelSpec } from "./layout"
import type { HitRegion, Tier } from "./paint"

export interface PanelTexture {
  texture: THREE.CanvasTexture
  regions: HitRegion[]
  tier: Tier
  dark: boolean
}

/** Mutable per-panel state, driven by the Wall's frame loop rather than React. */
export interface PanelHandle {
  spec: PanelSpec
  index: number
  angle: number
  mesh: THREE.Mesh
  material: THREE.ShaderMaterial
  current: PanelTexture | null
  /** Outgoing texture held during a theme crossfade. */
  outgoing: PanelTexture | null
  /** 0–1 visibility for the dissolve / re-form. */
  vis: number
  visFrom: number
  /** 0–1 hover enlargement. */
  grow: number
}

const vertexShader = /* glsl */ `
  uniform float uShrink;
  uniform float uLift;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // Shrink around the panel's own centre angle, not the room's origin, so the
    // dissolve is visible from the camera at the centre.
    float a = atan(p.x, -p.z) * uShrink;
    float r = ${ROOM_RADIUS.toFixed(1)} + uLift;
    p = vec3(sin(a) * r, p.y * uShrink, -cos(a) * r);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMapA;
  uniform sampler2D uMapB;
  uniform float uMix;
  uniform float uOpacity;
  uniform float uFocus;
  uniform vec3 uGround;
  varying vec2 vUv;
  void main() {
    vec4 c = mix(texture2D(uMapA, vUv), texture2D(uMapB, vUv), uMix);
    // Premultiplied: recede unfocused panels toward the room's ground colour.
    c.rgb = mix(uGround * c.a, c.rgb, mix(0.55, 1.0, uFocus));
    gl_FragColor = c * uOpacity;
    #include <colorspace_fragment>
  }
`

export function createPanelMaterial(ground: { value: THREE.Color }) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uMapA: { value: null },
      uMapB: { value: null },
      uMix: { value: 0 },
      uOpacity: { value: 0 },
      uFocus: { value: 0 },
      uShrink: { value: 1 },
      uLift: { value: 0 },
      uGround: ground,
    },
    side: THREE.BackSide,
    transparent: true,
    premultipliedAlpha: true,
    depthWrite: false,
  })
}

export function Panel({
  spec,
  index,
  angle,
  registry,
  ground,
}: {
  spec: PanelSpec
  index: number
  angle: number
  registry: Map<string, PanelHandle>
  ground: { value: THREE.Color }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => createPanelMaterial(ground), [ground])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const handle: PanelHandle = {
      spec,
      index,
      angle,
      mesh,
      material,
      current: null,
      outgoing: null,
      vis: 0,
      visFrom: 0,
      grow: 0,
    }
    registry.set(spec.id, handle)
    return () => {
      registry.delete(spec.id)
      handle.current?.texture.dispose()
      handle.outgoing?.texture.dispose()
      material.dispose()
    }
  }, [spec, index, angle, registry, material])

  return (
    <mesh
      ref={meshRef}
      geometry={panelGeometry(spec.size)}
      material={material}
      rotation-y={-angle}
      frustumCulled={false}
    />
  )
}
