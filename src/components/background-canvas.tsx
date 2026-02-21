"use client";

import { useRef, useEffect } from "react";

export default function BackgroundCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 1.4,
      speed: 0.00004 + Math.random() * 0.00008,
      phase: Math.random() * Math.PI * 2,
      opacity: 0.1 + Math.random() * 0.35,
    }));

    function draw() {
      t += 0.003;
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      // Nebula orbs
      const orbs = [
        { x: 0.3, y: 0.15, r: 380, c: "rgba(255,209,102,0.022)" },
        { x: 0.75, y: 0.6, r: 320, c: "rgba(6,214,160,0.015)" },
        { x: 0.5, y: 0.85, r: 280, c: "rgba(239,71,111,0.012)" },
      ];
      orbs.forEach((o) => {
        const grd = ctx.createRadialGradient(
          o.x * canvas!.width, o.y * canvas!.height, 0,
          o.x * canvas!.width, o.y * canvas!.height, o.r + Math.sin(t * 0.7) * 30,
        );
        grd.addColorStop(0, o.c);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(o.x * canvas!.width, o.y * canvas!.height, o.r + Math.sin(t * 0.7) * 30, 0, Math.PI * 2);
        ctx.fill();
      });

      // Particles
      particles.forEach((p) => {
        const px = (p.x + Math.sin(t * p.speed * 100 + p.phase) * 0.04) * canvas!.width;
        const py = (p.y + Math.cos(t * p.speed * 80 + p.phase) * 0.03) * canvas!.height;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2 + p.phase);
        ctx.beginPath();
        ctx.arc(px, py, p.r * (0.8 + 0.4 * pulse), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,209,102,${p.opacity * (0.5 + 0.5 * pulse)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
