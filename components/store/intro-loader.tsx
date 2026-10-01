"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";

const SESSION_KEY = "msm-intro-seen";
const COUNT_MS = 1700;
const HOLD_MS = 280;
const EXIT_MS = 650;

function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

type Phase = "counting" | "holding" | "exiting" | "done";

/**
 * Splash de entrada do site: conta 0→100 em tela cheia e depois "sobe"
 * revelando a loja por baixo (clip-path, ver .intro-loader no globals.css).
 * Mostra só uma vez por sessão do navegador (sessionStorage) e nunca se
 * prefers-reduced-motion — nesses casos o próprio useEffect pula direto
 * pra "done" sem desenhar nada extra, sem travar o conteúdo real que já
 * está renderizado por trás.
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
          className={`intro-loader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg ${
            phase === "exiting" ? "intro-loader--exit" : ""
          }`}
        >
          <div className="intro-loader__brand flex items-center gap-3">
            <Image src="/logo.jpg" alt="" width={40} height={40} className="rounded-full" />
            <span className="font-serif-display text-lg uppercase tracking-[0.35em] text-text-secondary">
              MSM Perfumaria
            </span>
          </div>

          <div
            className="intro-loader__count mt-8 text-center font-serif-display text-[20vw] leading-none tabular-nums text-text-primary sm:text-[13vw]"
            style={{ minWidth: "3ch" }}
          >
            {count}
            <span className="ml-2 align-top text-[0.28em] text-rose-light">%</span>
          </div>

          <div className="intro-loader__bar mt-8 h-px w-40 overflow-hidden bg-border">
            <div className="h-full bg-rose" style={{ width: `${count}%` }} />
          </div>
        </div>
      )}
      {children}
    </>
  );
}
