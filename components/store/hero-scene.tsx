"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Sparkles, Environment } from "@react-three/drei";
import type { Mesh } from "three";

function GlassOrb() {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
      meshRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.7}>
      <mesh ref={meshRef} scale={1.6}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshTransmissionMaterial
          color="#ff9ec1"
          thickness={1.4}
          roughness={0.06}
          transmission={1}
          ior={1.35}
          chromaticAberration={0.04}
          anisotropy={0.4}
          distortion={0.15}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationColor="#d6336c"
          attenuationDistance={0.6}
        />
      </mesh>
    </Float>
  );
}

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
        <GlassOrb />
        <Sparkles count={90} scale={7} size={2.2} speed={0.25} color="#ff9ec1" opacity={0.55} />
      </Suspense>
    </Canvas>
  );
}
