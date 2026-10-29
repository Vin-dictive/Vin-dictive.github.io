"use client"

import { useEffect, useMemo, useState, type RefObject } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import Effects from "./Effects"
import Environment from "./Environment"
import { disposePanelGeometries } from "./geometry"
import { journeyLogos, type RingSpec, type RoomData } from "./layout"
import { useRoomSkin, type Skin } from "./useRoomSkin"
import { CAMERA_FOV, type YawController } from "./useYaw"
import Wall from "./Wall"

/** Camera at the centre of the room, turned only about Y. */
function Rig({ yaw, skin, advance, reducedMotion }: { yaw: YawController; skin: Skin; advance: (dt: number, instant: boolean) => void; reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    scene.background = skin.ground
    return () => {
      scene.background = null
    }
  }, [scene, skin])
  useFrame((_, dt) => {
    advance(dt, reducedMotion)
    yaw.step(dt)
    camera.rotation.set(0, -yaw.theta, 0)
    camera.updateMatrixWorld()
  })
  return null
}

function readQuality() {
  const mq = (q: string) => window.matchMedia(q).matches
  const mobile = mq("(pointer: coarse)") || Math.min(window.innerWidth, window.innerHeight) < 640
  const reducedMotion = mq("(prefers-reduced-motion: reduce)")
  const plain = new URLSearchParams(window.location.search).has("plain")
  return { mobile, reducedMotion, composer: !(mobile || reducedMotion || plain) }
}

export default function RoomCanvas({
  data,
  ring,
  yaw,
  isDark,
  surfaceRef,
  onActivate,
  onOpenHref,
}: {
  data: RoomData
  ring: RingSpec
  yaw: YawController
  isDark: boolean
  surfaceRef: RefObject<HTMLDivElement | null>
  onActivate: (index: number) => void
  onOpenHref: (href: string) => void
}) {
  // Browser-only by construction: this module is loaded with `ssr: false`.
  const [quality, setQuality] = useState(readQuality)
  const [hidden, setHidden] = useState(() => document.hidden)
  const { current: skin, advance } = useRoomSkin(isDark)
  const logos = useMemo(() => journeyLogos(data), [data])

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onMotion = () => setQuality(readQuality())
    document.addEventListener("visibilitychange", onVisibility)
    mq.addEventListener("change", onMotion)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      mq.removeEventListener("change", onMotion)
      disposePanelGeometries()
    }
  }, [])

  return (
    <Canvas
      frameloop={hidden ? "never" : "always"}
      dpr={[1, 2]}
      flat
      gl={{ antialias: !quality.composer, powerPreference: "high-performance" }}
      camera={{ fov: CAMERA_FOV, near: 0.1, far: 60, position: [0, 0, 0], rotation: [0, 0, 0] }}
    >
      <Rig yaw={yaw} skin={skin} advance={advance} reducedMotion={quality.reducedMotion} />
      <Environment skin={skin} yaw={yaw} reducedMotion={quality.reducedMotion} />
      <Wall
        ring={ring}
        yaw={yaw}
        isDark={isDark}
        mobile={quality.mobile}
        reducedMotion={quality.reducedMotion}
        skin={skin}
        logos={logos}
        surfaceRef={surfaceRef}
        onActivate={onActivate}
        onOpenHref={onOpenHref}
      />
      {quality.composer ? <Effects skin={skin} /> : null}
    </Canvas>
  )
}
