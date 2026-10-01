"use client";

import { useEffect, useRef } from "react";

/**
 * Hero com revelação líquida no cursor: a mesma foto é desenhada duas vezes
 * em canvases off-screen (uma versão escura/dessaturada "base" e uma vívida
 * "reveal"), e uma máscara acompanha o mouse pintando um rastro que se
 * desfaz devagar — onde a máscara tem opacidade, a versão vívida aparece
 * por cima da base. Tudo em Canvas 2D (sem WebGL), então não tem o risco de
 * travamento que a cena 3D anterior tinha. Sem mouse (touch/mobile), um
 * ponto autônomo desenha um rastro lento sozinho; com prefers-reduced-motion
 * a máscara fica parada (sem autoplay nem brush), só a leitura inicial.
 */
export function LiquidRevealHero({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let baseCanvas: HTMLCanvasElement | null = null;
    let vividCanvas: HTMLCanvasElement | null = null;
    let maskCanvas: HTMLCanvasElement | null = null;
    let maskCtx: CanvasRenderingContext2D | null = null;
    let tempCanvas: HTMLCanvasElement | null = null;
    let tempCtx: CanvasRenderingContext2D | null = null;
    let ready = false;
    let raf = 0;
    let resizeTimeout = 0;
    let autoAngle = 0;

    const pointer = { x: 0, y: 0, active: false };

    const img = new window.Image();
    img.decoding = "async";

    function buildLayers() {
      if (!img.naturalWidth) return;
      width = wrap!.clientWidth;
      height = wrap!.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const offsetX = (width - drawW) / 2;
      const offsetY = (height - drawH) / 2;

      baseCanvas = document.createElement("canvas");
      baseCanvas.width = width;
      baseCanvas.height = height;
      const baseCtx = baseCanvas.getContext("2d")!;
      baseCtx.filter = "grayscale(55%) brightness(0.5) contrast(1.08) saturate(0.9)";
      baseCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

      vividCanvas = document.createElement("canvas");
      vividCanvas.width = width;
      vividCanvas.height = height;
      const vividCtx = vividCanvas.getContext("2d")!;
      vividCtx.filter = "saturate(1.4) brightness(1.05) contrast(1.1)";
      vividCtx.drawImage(img, offsetX, offsetY, drawW, drawH);

      maskCanvas = document.createElement("canvas");
      maskCanvas.width = width;
      maskCanvas.height = height;
      maskCtx = maskCanvas.getContext("2d");

      tempCanvas = document.createElement("canvas");
      tempCanvas.width = width;
      tempCanvas.height = height;
      tempCtx = tempCanvas.getContext("2d");

      if (reduceMotion && maskCtx) {
        // leitura estática: revela um pouco do centro, sem depender de animação
        const gradient = maskCtx.createRadialGradient(
          width / 2,
          height / 2,
          0,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.6,
        );
        gradient.addColorStop(0, "rgba(255,255,255,0.8)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        maskCtx.fillStyle = gradient;
        maskCtx.fillRect(0, 0, width, height);
      }

      ready = true;
    }

    function paintBrush(x: number, y: number, radius: number) {
      if (!maskCtx) return;
      const gradient = maskCtx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, "rgba(255,255,255,0.9)");
      gradient.addColorStop(0.7, "rgba(255,255,255,0.35)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      maskCtx.globalCompositeOperation = "source-over";
      maskCtx.fillStyle = gradient;
      maskCtx.beginPath();
      maskCtx.arc(x, y, radius, 0, Math.PI * 2);
      maskCtx.fill();
    }

    function draw() {
      raf = requestAnimationFrame(draw);
      if (!ready || !baseCanvas || !vividCanvas || !maskCanvas || !maskCtx || !tempCanvas || !tempCtx) {
        return;
      }

      if (!reduceMotion) {
        maskCtx.globalCompositeOperation = "destination-out";
        maskCtx.fillStyle = "rgba(0,0,0,0.045)";
        maskCtx.fillRect(0, 0, width, height);

        if (pointer.active) {
          paintBrush(pointer.x, pointer.y, Math.min(width, height) * 0.22);
        } else {
          autoAngle += 0.012;
          const cx = width / 2 + Math.cos(autoAngle) * width * 0.28;
          const cy = height / 2 + Math.sin(autoAngle * 1.3) * height * 0.22;
          paintBrush(cx, cy, Math.min(width, height) * 0.16);
        }
      }

      tempCtx.clearRect(0, 0, width, height);
      tempCtx.globalCompositeOperation = "source-over";
      tempCtx.drawImage(vividCanvas, 0, 0);
      tempCtx.globalCompositeOperation = "destination-in";
      tempCtx.drawImage(maskCanvas, 0, 0);

      ctx!.clearRect(0, 0, width, height);
      ctx!.drawImage(baseCanvas, 0, 0, width, height);
      ctx!.drawImage(tempCanvas, 0, 0, width, height);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = wrap!.getBoundingClientRect();
      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      pointer.active = inside;
      if (inside) {
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
      }
    }

    function handlePointerLeaveWindow() {
      pointer.active = false;
    }

    function handleResize() {
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(buildLayers, 150);
    }

    img.onload = buildLayers;
    img.src = src;

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeaveWindow, { passive: true });
    window.addEventListener("resize", handleResize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimeout);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeaveWindow);
      window.removeEventListener("resize", handleResize);
    };
  }, [src]);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 bg-bg bg-cover bg-center"
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
