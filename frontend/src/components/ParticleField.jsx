import { useEffect, useRef } from 'react';

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
  };
}

export default function ParticleField() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = window.innerWidth < 768 ? 50 : 120;
      particlesRef.current = Array.from({ length: count }, () =>
        createParticle(window.innerWidth, window.innerHeight),
      );
    }

    function render() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      context.clearRect(0, 0, w, h);
      context.globalCompositeOperation = 'screen';
      context.shadowBlur = 4;

      for (const p of particlesRef.current) {
        context.fillStyle = p.color;
        context.shadowColor = p.color;
        context.beginPath();
        context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        context.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > w) p.speedX *= -1;
        if (p.y < 0 || p.y > h) p.speedY *= -1;
      }
      rafRef.current = requestAnimationFrame(render);
    }

    resize();
    render();

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-canvas" aria-hidden="true" />;
}
