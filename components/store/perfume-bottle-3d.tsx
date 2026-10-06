"use client";

import { useEffect, useRef } from "react";

/**
 * Frasco de perfume 3D no centro do hero (three.js). Mesma mecânica da pedra
 * de obsidiana do site do condomínio: segue o ponteiro, gira devagar e flutua.
 * Fica atrás do texto e não captura cliques. Se o WebGL falhar, o canvas some
 * e a página segue normal.
 */
export function PerfumeBottle3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let raf = 0;
    let dispose: (() => void) | undefined;

    Promise.all([import("three"), import("three/examples/jsm/environments/RoomEnvironment.js")])
      .then(([THREE, { RoomEnvironment }]) => {
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

        const key = new THREE.DirectionalLight(0xffe6ef, 1.8);
        key.position.set(3, 4, 5);
        const rim = new THREE.DirectionalLight(0xff4d8d, 2.2);
        rim.position.set(-4, 2, -3);
        scene.add(key, rim);

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.z = 9;

        const bottle = new THREE.Group();
        scene.add(bottle);

        // perfil do vidro (raio, altura), suavizado com spline e girado em torno do eixo
        // flacon alto e estreito, com ombro arredondado e gargalo curto
        const glassProfile = [
          [0, -1.2], [0.5, -1.2], [0.58, -1.14], [0.6, -1.02], [0.6, 0.1],
          [0.58, 0.28], [0.46, 0.38], [0.2, 0.44], [0.14, 0.5], [0.14, 0.56],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const glassGeo = new THREE.LatheGeometry(new THREE.SplineCurve(glassProfile).getPoints(64), 96);

        const liquidProfile = [
          [0, -1.1], [0.46, -1.1], [0.52, -1.05], [0.54, -0.95], [0.54, 0.08],
          [0.52, 0.2], [0.4, 0.3], [0, 0.33],
        ].map(([x, y]) => new THREE.Vector2(x, y));
        const liquidGeo = new THREE.LatheGeometry(new THREE.SplineCurve(liquidProfile).getPoints(64), 96);

        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0xffeef4,
          transmission: 0.95,
          thickness: 1.2,
          roughness: 0.03,
          ior: 1.5,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          attenuationColor: new THREE.Color(0xc2185b),
          attenuationDistance: 2.5,
          side: THREE.DoubleSide,
        });
        const liquidMat = new THREE.MeshPhysicalMaterial({
          color: 0xb0245c,
          roughness: 0.1,
          transmission: 0.25,
          thickness: 0.8,
          emissive: 0x3a0616,
          emissiveIntensity: 0.35,
        });
        bottle.add(new THREE.Mesh(glassGeo, glassMat), new THREE.Mesh(liquidGeo, liquidMat));

        // tampa preta metálica com anel dourado no pescoço
        const capMat = new THREE.MeshPhysicalMaterial({ color: 0x111010, metalness: 0.9, roughness: 0.2, clearcoat: 1 });
        // tampa em bloco quadrado, como nos frascos de perfume de luxo
        // a base da tampa encosta no ombro do vidro (y ≈ 0.44)
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.9, 0.82), capMat);
        cap.position.y = 0.9;
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd9b77a, metalness: 1, roughness: 0.25 });
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 16, 64), goldMat);
        collar.rotation.x = Math.PI / 2;
        collar.position.y = 0.46;
        bottle.add(cap, collar);

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
          bottle.rotation.x = 0.1 + sy * 0.5;
          // -0.075 centraliza o frasco (base em -1.2, topo da tampa em 1.35)
          bottle.position.y = -0.075 + k * Math.sin(t * 0.0011) * 0.08;
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
          pmrem.dispose();
          renderer.dispose();
        };
      })
      .catch(() => {
        // sem WebGL (ou three não carregou): o hero continua sem o frasco
        canvas.style.display = "none";
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
