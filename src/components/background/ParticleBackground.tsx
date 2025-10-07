// @ts-ignore
import { Effects } from "@react-three/drei";
// @ts-ignore
import { Canvas } from "@react-three/fiber";
import { Particles } from "./particles";
import { VignetteShader } from "./shaders/vignetteShader";

export const ParticleBackground = () => {
  // Optimized preset values for production
  const config = {
    speed: 1.0,
    focus: 3.8,
    aperture: 1.79,
    size: 512,
    noiseScale: 0.6,
    noiseIntensity: 0.52,
    timeScale: 1,
    pointSize: 10.0,
    opacity: 0.8,
    planeScale: 10.0,
    vignetteDarkness: 1.8,
    vignetteOffset: 0.3,
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{
          position: [1.2629783123314589, 2.664606471394044, -1.8178993743288914],
          fov: 50,
          near: 0.01,
          far: 300,
        }}
      >
        <color attach="background" args={["#000000"]} />
        <Particles
          speed={config.speed}
          aperture={config.aperture}
          focus={config.focus}
          size={config.size}
          noiseScale={config.noiseScale}
          noiseIntensity={config.noiseIntensity}
          timeScale={config.timeScale}
          pointSize={config.pointSize}
          opacity={config.opacity}
          planeScale={config.planeScale}
          useManualTime={false}
          manualTime={0}
          introspect={false}
        />
        <Effects multisamping={0} disableGamma>
          {/* @ts-ignore */}
          <shaderPass
            args={[VignetteShader]}
            uniforms-darkness-value={config.vignetteDarkness}
            uniforms-offset-value={config.vignetteOffset}
          />
        </Effects>
      </Canvas>
    </div>
  );
};
