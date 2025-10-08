import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"

import { cn } from "@/lib/utils"

import { Particles } from "./particles"

const CAMERA_POSITION: [number, number, number] = [0, 0, 5]

interface GLProps {
  hovering: boolean
  className?: string
}

const resolveParticleResolution = () => {
  if (typeof window === "undefined") {
    return 256
  }

  if (window.innerWidth >= 1920) {
    return 320
  }

  if (window.innerWidth >= 1280) {
    return 288
  }

  return 256
}

export const GL = ({ hovering, className }: GLProps) => {
  const camera = useMemo(
    () => ({
      position: CAMERA_POSITION,
      fov: 75,
      near: 0.1,
      far: 1000,
    }),
    [],
  )

  const particleSettings = useMemo(() => {
    const resolution = resolveParticleResolution()

    return {
      speed: 1.0,
      noiseScale: 0.55,
      noiseIntensity: 0.45,
      timeScale: 1,
      focus: 4.5,
      aperture: 2.2,
      pointSize: 6.5,
      opacity: 0.9,
      planeScale: 18.0,
      size: resolution,
      useManualTime: false,
      manualTime: 0,
    }
  }, [])

  return (
    <Canvas
      className={cn("h-full w-full", className)}
      camera={camera}
      dpr={[1, 1.25]}
      frameloop="always"
      performance={{ min: 0.5 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#000000"]} />
      <Suspense fallback={null}>
        <Particles
          speed={particleSettings.speed}
          aperture={particleSettings.aperture}
          focus={particleSettings.focus}
          size={particleSettings.size}
          noiseScale={particleSettings.noiseScale}
          noiseIntensity={particleSettings.noiseIntensity}
          timeScale={particleSettings.timeScale}
          pointSize={particleSettings.pointSize}
          opacity={particleSettings.opacity}
          planeScale={particleSettings.planeScale}
          useManualTime={particleSettings.useManualTime}
          manualTime={particleSettings.manualTime}
          introspect={hovering}
        />
      </Suspense>
    </Canvas>
  )
}
