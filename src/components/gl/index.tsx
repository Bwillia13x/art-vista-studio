import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"

import { Particles } from "./particles"

const CAMERA_POSITION: [number, number, number] = [
  1.2629783123314589,
  2.664606471394044,
  -1.8178993743288914,
]

export const GL = ({ hovering }: { hovering: boolean }) => {
  const camera = useMemo(
    () => ({
      position: CAMERA_POSITION,
      fov: 50,
      near: 0.01,
      far: 300,
    }),
    [],
  )

  const particleSettings = useMemo(
    () => ({
      speed: 1.0,
      noiseScale: 0.6,
      noiseIntensity: 0.52,
      timeScale: 1,
      focus: 3.8,
      aperture: 1.79,
      pointSize: 10.0,
      opacity: 0.8,
      planeScale: 10.0,
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
