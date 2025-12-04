import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 140;
const COLORS = ['#7c4dff', '#5ac8fa', '#ffb86b', '#ff6b9f', '#9ad5ff'];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: randomBetween(1.5, 3.5),
    speedX: randomBetween(-0.15, 0.15),
    speedY: randomBetween(-0.25, 0.25),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    blur: randomBetween(0, 6),
  };
}

export default function ParticleField() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () =>
        createParticle(canvas.width, canvas.height),
      );
    }

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.globalCompositeOperation = 'screen';
      for (const particle of particlesRef.current) {
        context.fillStyle = particle.color;
        context.shadowBlur = particle.blur;
        context.shadowColor = particle.color;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
      }
      requestAnimationFrame(render);
    }

    resize();
    render();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" aria-hidden />;
}
