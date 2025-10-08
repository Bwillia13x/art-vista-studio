import * as THREE from "three"
import { periodicNoiseGLSL } from "./utils"

const LOOP_PERIOD_DEFAULT = 24.0
const MIN_RESOLUTION = 2

interface PlaneConfig {
  resolution: number
  scale: number
}

function createPlaneTexture({ resolution, scale }: PlaneConfig) {
  const size = Math.max(MIN_RESOLUTION, Math.floor(resolution))
  const count = size * size
  const components = 4
  const length = count * components
  const data = new Float32Array(length)

  for (let i = 0; i < count; i++) {
    const i4 = i * components

    const x = (i % size) / (size - 1)
    const z = Math.floor(i / size) / (size - 1)

    data[i4 + 0] = (x - 0.5) * 2 * scale
    data[i4 + 1] = 0
    data[i4 + 2] = (z - 0.5) * 2 * scale
    data[i4 + 3] = 1.0
  }

  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType)
  texture.needsUpdate = true
  texture.generateMipmaps = false
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  return { texture, resolution: size }
}

export interface SimulationMaterialOptions {
  resolution?: number
  scale?: number
  loopPeriod?: number
}

export class SimulationMaterial extends THREE.ShaderMaterial {
  readonly resolution: number

  constructor({
    resolution = 512,
    scale = 10.0,
    loopPeriod = LOOP_PERIOD_DEFAULT,
  }: SimulationMaterialOptions = {}) {
    const sanitizedResolution = THREE.MathUtils.clamp(
      THREE.MathUtils.ceilPowerOfTwo(Math.max(MIN_RESOLUTION, Math.floor(resolution))),
      MIN_RESOLUTION,
      4096,
    )

    const { texture, resolution: textureResolution } = createPlaneTexture({
      resolution: sanitizedResolution,
      scale,
    })

    super({
      vertexShader: /* glsl */ `varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      fragmentShader: /* glsl */ `uniform sampler2D positions;
      uniform float uTime;
      uniform float uNoiseScale;
      uniform float uNoiseIntensity;
      uniform float uTimeScale;
      uniform float uLoopPeriod;
      varying vec2 vUv;

      ${periodicNoiseGLSL}

      void main() {
        vec3 originalPos = texture2D(positions, vUv).rgb;

        float continuousTime = uTime * uTimeScale * (6.28318530718 / uLoopPeriod);

        vec3 noiseInput = originalPos * uNoiseScale;

        float displacementX = periodicNoise(noiseInput + vec3(0.0, 0.0, 0.0), continuousTime);
        float displacementY = periodicNoise(noiseInput + vec3(50.0, 0.0, 0.0), continuousTime + 2.094);
        float displacementZ = periodicNoise(noiseInput + vec3(0.0, 50.0, 0.0), continuousTime + 4.188);

        vec3 distortion = vec3(displacementX, displacementY, displacementZ) * uNoiseIntensity;
        vec3 finalPos = originalPos + distortion;

        gl_FragColor = vec4(finalPos, 1.0);
      }`,
      uniforms: {
        positions: { value: texture },
        uTime: { value: 0 },
        uNoiseScale: { value: 1.0 },
        uNoiseIntensity: { value: 0.5 },
        uTimeScale: { value: 1 },
        uLoopPeriod: { value: loopPeriod },
      },
    })

    this.resolution = textureResolution
  }
}
