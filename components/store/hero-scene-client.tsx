"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WebglBoundary } from "./webgl-boundary";

const HeroScene = dynamic(() => import("./hero-scene").then((mod) => mod.HeroScene), {
  ssr: false,
  loading: () => null,
});

const STATIC_FALLBACK = (
  <div className="h-full w-full bg-[radial-gradient(circle_at_top,_var(--color-surface-2),_var(--color-bg))]" />
);

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export function HeroSceneClient() {
  // Só decide depois de montar no client — evita divergência com o SSR e
  // permite checar suporte real do navegador antes de criar o contexto 3D.
  const [ready, setReady] = useState<"checking" | "supported" | "unsupported">("checking");

  useEffect(() => {
    // Checagem de capacidade do navegador (sistema externo) — precisa
    // rodar após montar, não pode ser decidido durante o render/SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(supportsWebGL() ? "supported" : "unsupported");
  }, []);

  if (ready !== "supported") return STATIC_FALLBACK;

  return (
    <WebglBoundary fallback={STATIC_FALLBACK}>
      <HeroScene />
    </WebglBoundary>
  );
}
