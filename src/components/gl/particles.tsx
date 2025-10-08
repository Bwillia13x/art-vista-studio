import * as THREE from "three"
import { useMemo, useRef, useEffect } from "react"
import { createPortal, useFrame } from "@react-three/fiber"
import { useFBO } from "@react-three/drei"

import { DofPointsMaterial } from "./shaders/pointMaterial"
import { SimulationMaterial } from "./shaders/simulationMaterial"
import * as easing from "maath/easing"

const REVEAL_DURATION = 3.5
const MIN_POINT_SIZE = 0.1

interface ParticlesProps {
  speed: number
  aperture: number
  focus: number
  size: number
  noiseScale?: number
  noiseIntensity?: number
  timeScale?: number
  pointSize?: number
  opacity?: number
  planeScale?: number
  useManualTime?: boolean
  manualTime?: number
  introspect?: boolean
}

export function Particles({
  speed,
  aperture,
  focus,
  size = 512,
  noiseScale = 1.0,
  noiseIntensity = 0.5,
  timeScale = 0.5,
  pointSize = 2.0,
  opacity = 1.0,
  planeScale = 1.0,
  useManualTime = false,
  manualTime = 0,
  introspect = false,
  ...props
}: ParticlesProps) {
  const revealStateRef = useRef<{ startTime: number | null; completed: boolean }>(
    { startTime: null, completed: false },
  )

  const resolution = useMemo(() => {
    const clamped = Math.max(2, Math.floor(size))
    const normalized = THREE.MathUtils.ceilPowerOfTwo(clamped)
    return THREE.MathUtils.clamp(normalized, 2, 4096)
  }, [size])

  const simulationMaterial = useMemo(
    () => new SimulationMaterial({ resolution, scale: planeScale }),
    [planeScale, resolution],
  )

  const target = useFBO(resolution, resolution, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
    samples: 0,
  })

  const dofPointsMaterial = useMemo(() => new DofPointsMaterial(), [])

  const scene = useMemo(() => new THREE.Scene(), [])
  const camera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1),
    [],
  )

  const positions = useMemo(
    () =>
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
    [],
  )

  const uvs = useMemo(
    () => new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
    [],
  )

  const particles = useMemo(() => {
    const length = resolution * resolution
    const buffer = new Float32Array(length * 3)

    for (let i = 0; i < length; i++) {
      const i3 = i * 3
      const column = i % resolution
      const row = Math.floor(i / resolution)

      buffer[i3 + 0] = column / resolution
      buffer[i3 + 1] = row / resolution
      buffer[i3 + 2] = 0
    }

    return buffer
  }, [resolution])

  useEffect(() => {
    const revealState = revealStateRef.current
    revealState.startTime = null
    revealState.completed = false
  }, [resolution, planeScale])

  useEffect(() => {
    const texture = target.texture
    texture.name = `particles-simulation-${resolution}`
    texture.generateMipmaps = false
    texture.minFilter = THREE.NearestFilter
    texture.magFilter = THREE.NearestFilter
    texture.wrapS = THREE.ClampToEdgeWrapping
    texture.wrapT = THREE.ClampToEdgeWrapping
    dofPointsMaterial.uniforms.positions.value = texture
  }, [dofPointsMaterial, resolution, target])

  useEffect(() => {
    dofPointsMaterial.uniforms.initialPositions.value =
      simulationMaterial.uniforms.positions.value
  }, [dofPointsMaterial, simulationMaterial])

  useEffect(() => () => {
    target.dispose()
  }, [target])

  useEffect(() => {
    const positionsTexture = simulationMaterial.uniforms.positions
      .value as THREE.Texture | undefined

    return () => {
      if (dofPointsMaterial.uniforms.initialPositions.value === positionsTexture) {
        dofPointsMaterial.uniforms.initialPositions.value = null
      }

      positionsTexture?.dispose?.()
      simulationMaterial.dispose()
    }
  }, [dofPointsMaterial, simulationMaterial])

  useEffect(
    () => () => {
      dofPointsMaterial.uniforms.positions.value = null
      dofPointsMaterial.uniforms.initialPositions.value = null
      dofPointsMaterial.dispose()
    },
    [dofPointsMaterial],
  )

  useFrame((state, delta) => {
    state.gl.setRenderTarget(target)
    state.gl.clear()
    state.gl.render(scene, camera)
    state.gl.setRenderTarget(null)

    const currentTime = useManualTime ? manualTime : state.clock.elapsedTime
    const revealState = revealStateRef.current

    if (revealState.startTime === null) {
      revealState.startTime = currentTime
    }

    const revealElapsed = currentTime - (revealState.startTime ?? currentTime)
    const revealProgress = THREE.MathUtils.clamp(
      revealElapsed / REVEAL_DURATION,
      0,
      1,
    )
    const easedProgress = 1 - Math.pow(1 - revealProgress, 3)
    const revealFactor = easedProgress * 4.0

    if (!revealState.completed && revealProgress >= 1.0) {
      revealState.completed = true
    }

    const safeFocus = Math.max(0.001, Number.isFinite(focus) ? focus : 1.0)
    const safeBlur = Math.max(0, Number.isFinite(aperture) ? aperture : 0)
    const safePointSize = Math.max(
      MIN_POINT_SIZE,
      Number.isFinite(pointSize) ? pointSize : MIN_POINT_SIZE,
    )
    const clampedOpacity = THREE.MathUtils.clamp(
      Number.isFinite(opacity) ? opacity : 1,
      0,
      1,
    )
    const safeNoiseScale = Math.max(0, Number.isFinite(noiseScale) ? noiseScale : 0)
    const safeNoiseIntensity = Math.max(
      0,
      Number.isFinite(noiseIntensity) ? noiseIntensity : 0,
    )
    const safeSpeed = Number.isFinite(speed) ? speed : 0
    const safeTimeScale = Number.isFinite(timeScale) ? timeScale : 0
    const timeFactor = Math.max(0, safeTimeScale * safeSpeed)

    dofPointsMaterial.uniforms.uTime.value = currentTime
    dofPointsMaterial.uniforms.uFocus.value = safeFocus
    dofPointsMaterial.uniforms.uBlur.value = safeBlur

    easing.damp(
      dofPointsMaterial.uniforms.uTransition,
      "value",
      introspect ? 1.0 : 0.0,
      introspect ? 0.35 : 0.2,
      delta,
    )

    simulationMaterial.uniforms.uTime.value = currentTime
    simulationMaterial.uniforms.uNoiseScale.value = safeNoiseScale
    simulationMaterial.uniforms.uNoiseIntensity.value = safeNoiseIntensity
    simulationMaterial.uniforms.uTimeScale.value = timeFactor

    dofPointsMaterial.uniforms.uPointSize.value = safePointSize
    dofPointsMaterial.uniforms.uOpacity.value = clampedOpacity
    dofPointsMaterial.uniforms.uRevealFactor.value = revealFactor
    dofPointsMaterial.uniforms.uRevealProgress.value = easedProgress
  })

  return (
    <>
      {createPortal(
        <mesh material={simulationMaterial}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            <bufferAttribute attach="attributes-uv" args={[uvs, 2]} />
          </bufferGeometry>
        </mesh>,
        scene,
      )}
      <points
        material={dofPointsMaterial}
        frustumCulled={false}
        {...props}
      >
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles, 3]} />
        </bufferGeometry>
      </points>
    </>
  )
}
