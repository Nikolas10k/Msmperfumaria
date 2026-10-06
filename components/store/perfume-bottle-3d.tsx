"use client";

import { useEffect, useRef } from "react";

/**
 * Frasco 3D no centro do hero (three.js), no estilo do Sauvage: vidro azul-escuro,
 * tampa preta com ranhuras e o rótulo da frente recortado da própria foto do
 * produto (public/images/sauvage.png). Segue o ponteiro, gira devagar e flutua.
 * Fica atrás do texto e não captura cliques. Se o WebGL ou a imagem falharem,
 * o canvas some e a página segue normal.
 */
const LABEL_SRC = "/images/sauvage.png";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function PerfumeBottle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let raf = 0;
    let dispose: (() => void) | undefined;

    Promise.all([
      import("three"),
      import("three/examples/jsm/environments/RoomEnvironment.js"),
      loadImage(LABEL_SRC),
    ])
      .then(([THREE, { RoomEnvironment }, label]) => {
        // StrictMode monta/desmonta o efeito duas vezes em dev; se já desmontou, não cria nada.
        if (disposed) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        const scene = new THREE.Scene();
        // ambiente de estúdio: dá os reflexos nítidos do vidro e da tampa
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        const key = new THREE.DirectionalLight(0xdfe9ff, 1.9);
        key.position.set(3, 4, 5);
        const rim = new THREE.DirectionalLight(0x6f8fd6, 2.2);
        rim.position.set(-4, 2, -3);
        scene.add(key, rim);

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.z = 10;

        const bottle = new THREE.Group();
        scene.add(bottle);

        // corpo de vidro azul-escuro: perfil (raio, altura) girado em torno do eixo
        const bodyProfile = [
          [0, -1.1], [0.5, -1.1], [0.55, -1.05], [0.56, -0.95], [0.56, 0.95],
          [0.52, 1.0], [0.46, 1.02], [0, 1.02],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const bodyGeo = new THREE.LatheGeometry(new THREE.SplineCurve(bodyProfile).getPoints(64), 96);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x0c1a33,
          metalness: 0.1,
          roughness: 0.12,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          transmission: 0.15,
          thickness: 0.8,
          side: THREE.DoubleSide,
        });
        bottle.add(new THREE.Mesh(bodyGeo, glassMat));

        // frente: faixa com o recorte da foto do produto (rótulo prateado "SAUVAGE PARFUM")
        const crop = document.createElement("canvas");
        // recorte interno do vidro: tira as bordas claras do fundo da foto e a
        // marca da base (logo do fabricante), que fica abaixo de 74% da altura
        const sw = label.naturalWidth * 0.5;
        const sh = label.naturalHeight * 0.47;
        crop.width = 512;
        crop.height = Math.round((512 * sh) / sw);
        crop.getContext("2d")?.drawImage(
          label,
          label.naturalWidth * 0.25,
          label.naturalHeight * 0.27,
          sw,
          sh,
          0,
          0,
          crop.width,
          crop.height,
        );
        const labelTex = new THREE.CanvasTexture(crop);
        labelTex.colorSpace = THREE.SRGBColorSpace;
        const labelMat = new THREE.MeshPhysicalMaterial({
          map: labelTex,
          roughness: 0.18,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          transparent: true,
          side: THREE.DoubleSide,
        });
        // arco da frente (-0.95 a 0.95 rad): a textura vai da esquerda para a direita
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(0.566, 0.566, 2.04, 96, 1, true, -0.95, 1.9),
          labelMat,
        );
        bottle.add(band);

        // tampa preta com ranhuras horizontais
        const capMat = new THREE.MeshPhysicalMaterial({ color: 0x08080a, metalness: 0.7, roughness: 0.3, clearcoat: 1 });
        const ribMat = new THREE.MeshStandardMaterial({ color: 0x1d2128, metalness: 0.8, roughness: 0.35 });
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.48, 0.9, 96), capMat);
        cap.position.y = 1.47;
        bottle.add(cap);
        for (let i = 0; i < 7; i++) {
          const rib = new THREE.Mesh(new THREE.TorusGeometry(0.472, 0.012, 12, 96), ribMat);
          rib.rotation.x = Math.PI / 2;
          rib.position.y = 1.12 + i * 0.11;
          bottle.add(rib);
        }

        const size = () => {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          // em tela estreita o frasco diminui para caber na largura
          bottle.scale.setScalar(Math.min(1, camera.aspect * 1.6));
        };
        size();
        window.addEventListener("resize", size);

        let mx = 0;
        let my = 0;
        let sx = 0;
        let sy = 0;
        const onPointer = (e: PointerEvent) => {
          mx = e.clientX / window.innerWidth - 0.5;
          my = e.clientY / window.innerHeight - 0.5;
        };
        window.addEventListener("pointermove", onPointer, { passive: true });

        const loop = (t: number) => {
          raf = requestAnimationFrame(loop);
          // fora da tela não gasta GPU
          const rect = canvas.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;

          sx += (mx - sx) * 0.05;
          sy += (my - sy) * 0.05;
          const k = reduceMotion ? 0 : 1;
          bottle.rotation.y = k * t * 0.00018 + sx * 0.9;
          bottle.rotation.x = 0.08 + sy * 0.5;
          // -0.41 centraliza o frasco (base em -1.1, topo da tampa em 1.92)
          bottle.position.y = -0.41 + k * Math.sin(t * 0.0011) * 0.08;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);

        dispose = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", size);
          window.removeEventListener("pointermove", onPointer);
          bottle.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              obj.geometry.dispose();
              (obj.material as { dispose: () => void }).dispose();
            }
          });
          labelTex.dispose();
          pmrem.dispose();
          renderer.dispose();
        };
      })
      .catch(() => {
        // sem WebGL ou sem a imagem do rótulo: o hero continua sem o frasco
        canvas.style.display = "none";
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      dispose?.();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
