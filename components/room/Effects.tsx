"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing"
import type { BloomEffect, ChromaticAberrationEffect, NoiseEffect, VignetteEffect } from "postprocessing"
import { Vector2 } from "three"
import type { Skin } from "./useRoomSkin"

/** Post chain. Values are written from the lerped skin every frame, so theme flips ease rather than cut. */
export default function Effects({ skin }: { skin: Skin }) {
  const bloom = useRef<BloomEffect>(null)
  const chroma = useRef<ChromaticAberrationEffect>(null)
  const noise = useRef<NoiseEffect>(null)
  const vignette = useRef<VignetteEffect>(null)
  const [chromaOffset] = useState(() => new Vector2(skin.chroma, skin.chroma))

  useFrame(() => {
    if (bloom.current) {
      bloom.current.intensity = skin.bloomIntensity
      bloom.current.luminanceMaterial.threshold = skin.bloomThreshold
    }
    chroma.current?.offset.set(skin.chroma, skin.chroma)
    if (noise.current) noise.current.blendMode.opacity.value = skin.grain
    if (vignette.current) vignette.current.darkness = skin.vignette
  })

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        ref={bloom}
        mipmapBlur
        intensity={skin.bloomIntensity}
        luminanceThreshold={skin.bloomThreshold}
        luminanceSmoothing={0.2}
        radius={0.6}
      />
      <ChromaticAberration ref={chroma} offset={chromaOffset} radialModulation={false} modulationOffset={0} />
      <Noise ref={noise} premultiply opacity={skin.grain} />
      <Vignette ref={vignette} offset={0.3} darkness={skin.vignette} />
    </EffectComposer>
  )
}
