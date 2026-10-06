"use client";

import { useEffect, useState, type ReactNode } from "react";

const SESSION_KEY = "msm-intro-seen";
const COUNT_MS = 1700;
const HOLD_MS = 280;
const EXIT_MS = 1100;

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

type Phase = "counting" | "holding" | "exiting" | "done";

/**
 * Tela de entrada do site, no padrão do loader do condomínio: painel vinho com
 * a marca em serif, contador de 0 a 100 no canto e saída que sobe revelando a
 * loja por baixo (transform, ver .intro-loader no globals.css). Mostra só uma
 * vez por sessão do navegador (sessionStorage) e nunca com prefers-reduced-motion.
 * O conteúdo real já está renderizado por trás, então nada espera o loader.
 */
export function IntroLoader({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("counting");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";

    let raf = 0;

    if (reduceMotion || alreadySeen) {
      raf = requestAnimationFrame(() => setPhase("done"));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();

    function tick(now: number) {
      const t = Math.min((now - start) / COUNT_MS, 1);
      setCount(Math.round(easeOutQuart(t) * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // só grava "visto" quando a contagem realmente termina — se gravasse
        // antes, o duplo mount do Strict Mode (dev) faria a 2ª montagem real
        // já encontrar a sessão marcada e pular a animação sem rodar.
        sessionStorage.setItem(SESSION_KEY, "1");
        setPhase("holding");
      }
    }
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (phase !== "holding") return;
    const timeout = setTimeout(() => setPhase("exiting"), HOLD_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timeout = setTimeout(() => setPhase("done"), EXIT_MS);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    document.body.style.overflow = phase === "done" ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  return (
    <>
      {phase !== "done" && (
        <div
          aria-hidden="true"
          className={`intro-loader fixed inset-0 z-[100] flex items-center justify-center bg-rose-dark ${
            phase === "exiting" ? "intro-loader--exit" : ""
          }`}
        >
          <span className="intro-loader__word font-serif-display text-[clamp(34px,5vw,64px)] text-paper">
            MSM Perfumaria
          </span>
          <span className="intro-loader__count lbl absolute bottom-6 right-7 text-paper/75 tabular-nums">
            {count}
          </span>
        </div>
      )}
      {children}
    </>
  );
}
