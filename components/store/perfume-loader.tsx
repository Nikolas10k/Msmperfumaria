"use client";

import { useEffect, useRef } from "react";

interface Particle {
  angle: number;
  speed: number;
  radius: number;
  wobbleSpeed: number;
  wobblePhase: number;
  size: number;
  opacity: number;
}

/**
 * Splash/loading em loop contínuo (não é um vídeo de N segundos que reinicia —
 * é uma simulação viva, então nunca há um corte perceptível de "fim pro
 * começo"). Partículas em canvas + frasco em CSS/SVG com giro e brilho
 * pulsante, na paleta da marca (preto + rosa/magenta da logo).
 */
export function PerfumeLoader({ label = "Carregando" }: { label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: (0.06 + Math.random() * 0.12) * (Math.random() < 0.5 ? 1 : -1),
      radius: 30 + Math.random() * 90,
      wobbleSpeed: 0.5 + Math.random() * 1.5,
      wobblePhase: Math.random() * Math.PI * 2,
      size: 0.6 + Math.random() * 1.6,
      opacity: 0.12 + Math.random() * 0.45,
    }));

    let frame = 0;
    let raf: number;

    function draw() {
      frame += 1;
      ctx!.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2 + Math.min(width, height) * 0.02;

      for (const p of particles) {
        p.angle += p.speed * 0.012;
        const wobble = Math.sin(frame * 0.01 * p.wobbleSpeed + p.wobblePhase) * 8;
        const x = cx + Math.cos(p.angle) * (p.radius + wobble);
        const y = cy + Math.sin(p.angle) * (p.radius + wobble) * 0.6;

        const glow = ctx!.createRadialGradient(x, y, 0, x, y, p.size * 5);
        glow.addColorStop(0, `rgba(255, 200, 220, ${p.opacity})`);
        glow.addColorStop(0.4, `rgba(214, 51, 108, ${p.opacity * 0.6})`);
        glow.addColorStop(1, "rgba(214, 51, 108, 0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(x, y, p.size * 5, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-bg">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

      <div className="perfume-loader-glow pointer-events-none absolute h-56 w-56 rounded-full bg-rose/25 blur-3xl" />

      <div className="perfume-loader-bottle relative z-10">
        <svg width="72" height="132" viewBox="0 0 72 132" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bottleGlass" x1="0" y1="0" x2="72" y2="132" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="var(--color-rose-light)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="var(--color-rose)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--color-rose-dark)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="bottleCap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f5f3ee" />
              <stop offset="100%" stopColor="#c9c5ba" />
            </linearGradient>
          </defs>

          <rect x="24" y="2" width="24" height="16" rx="4" fill="url(#bottleCap)" />
          <rect x="29" y="16" width="14" height="16" fill="url(#bottleGlass)" />
          <path d="M20 32 H52 L58 48 H14 Z" fill="url(#bottleGlass)" />
          <rect x="10" y="48" width="52" height="80" rx="10" fill="url(#bottleGlass)" stroke="#f5f3ee" strokeOpacity="0.25" strokeWidth="1" />
          <rect x="18" y="56" width="6" height="60" rx="3" fill="#ffffff" opacity="0.25" />
        </svg>
      </div>

      <p className="perfume-loader-label mt-6 text-xs uppercase tracking-[0.3em] text-rose-light">
        {label}
      </p>
    </div>
  );
}
