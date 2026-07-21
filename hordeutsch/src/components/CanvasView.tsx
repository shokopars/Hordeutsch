import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";

function SceneContent() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.5;
      meshRef.current.rotation.y = time * 0.1;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = -time * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.2} />
      {/* نور اصلی به رنگ طلایی تغییر کرد */}
      <directionalLight position={[5, 5, 5]} intensity={1.8} color="#FFCC00" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#DD0000" />

      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={meshRef} position={[0, 0, 0]}>
          <icosahedronGeometry args={[1.8, 1]} />
          <meshPhysicalMaterial
            color="#1a1a1a"
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
            wireframe={true}
          />
        </mesh>
      </Float>

      {/* ذرات معلق حالا با تم زرد طلایی می‌درخشند */}
      <Sparkles
        count={220}
        scale={10}
        size={3}
        speed={0.4}
        color="#FFCC00"
        opacity={0.7}
      />
    </group>
  );
}

export default function CanvasView() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#050505"); // کمی تیره تر برای ایجاد کنتراست بیشتر با زرد
          scene.fog = new THREE.FogExp2("#050505", 0.08);
        }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}