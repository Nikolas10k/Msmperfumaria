"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Environment, useGLTF, Center } from "@react-three/drei";
import type { Group } from "three";

const BOTTLE_MODEL_URL = "/models/bottle.glb";

function Bottle() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(BOTTLE_MODEL_URL);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
      <group ref={groupRef}>
        <Center>
          <primitive object={scene} scale={2.4} />
        </Center>
      </group>
    </Float>
  );
}

useGLTF.preload(BOTTLE_MODEL_URL);

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={90} color="#ff6b93" />
      <pointLight position={[-4, -3, -3]} intensity={45} color="#8c1c4d" />
      <pointLight position={[0, 3, -4]} intensity={30} color="#ffffff" />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Bottle />
        <Sparkles count={90} scale={7} size={2.2} speed={0.25} color="#ff9ec1" opacity={0.55} />
      </Suspense>
    </Canvas>
  );
}
