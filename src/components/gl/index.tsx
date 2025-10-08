import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"

import { Particles } from "./particles"

const CAMERA_POSITION: [number, number, number] = [
  0,
  0,
  5,
]

export const GL = ({ hovering }: { hovering: boolean }) => {
  const camera = useMemo(
    () => ({
      position: CAMERA_POSITION,
      fov: 75,
      near: 0.1,
      far: 1000,
    }),
    [],
  )

  const particleSettings = useMemo(
    () => ({
      speed: 1.0,
      noiseScale: 0.6,
      noiseIntensity: 0.52,
      timeScale: 1,
      focus: 5.0,
      aperture: 2.5,
      pointSize: 8.0,
      opacity: 0.9,
      planeScale: 20.0,
      size: 512,
      useManualTime: false,
      manualTime: 0,
    }),
    [],
  )

  return (
    <div id="webgl">
      <Canvas
        camera={camera}
        dpr={[1, 1.75]}
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
    </div>
  )
}
