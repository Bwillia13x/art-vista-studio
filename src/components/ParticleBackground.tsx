import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  amplitude: number;
  frequency: number;
  size: number;
  offset: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = [];
      const cols = Math.floor(canvas.width / 15);
      const rows = Math.floor(canvas.height / 15);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          particlesRef.current.push({
            x: i * 15,
            y: j * 15,
            baseY: j * 15,
            speed: 0.0005 + Math.random() * 0.001,
            amplitude: 20 + Math.random() * 40,
            frequency: 0.001 + Math.random() * 0.002,
            size: 1 + Math.random() * 1.5,
            offset: Math.random() * Math.PI * 2
          });
        }
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      timeRef.current += 1;

      particlesRef.current.forEach((particle) => {
        // Create wave effect
        const wave = Math.sin(
          particle.x * particle.frequency + 
          timeRef.current * particle.speed + 
          particle.offset
        ) * particle.amplitude;

        const currentY = particle.baseY + wave;

        // Distance from center for opacity
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distanceFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + 
          Math.pow(currentY - centerY, 2)
        );
        const maxDistance = Math.sqrt(
          Math.pow(canvas.width / 2, 2) + 
          Math.pow(canvas.height / 2, 2)
        );
        const opacity = 1 - (distanceFromCenter / maxDistance) * 0.7;

        // Draw particle
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(particle.x, currentY, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#000000' }}
    />
  );
}
