/// <reference types="@react-three/fiber" />
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Line } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// ============================================================================
// ۰. ثابت‌ها و انواع Quality (با افزودن پارامترهای FPS و حداکثر رزولوشن)
// ============================================================================
type QualityLevel = "low" | "medium" | "high" | "ultra";

interface QualityConfig {
  starCount: number;
  sparkleCount: number;
  meteorCount: number;
  bloomIntensity: number;
  bloomLuminanceThreshold: number;
  bloomLuminanceSmoothing: number;
  vignetteDarkness: number;
  dpr: [number, number];           // حداقل و حداکثر DPR
  maxCanvasWidth: number;          // حداکثر عرض منطقی canvas (پیکسل)
  starSize: number;
  ambientLight: number;
  fpsThreshold: number;            // آستانه افت فریم برای کاهش کیفیت
  qualityDropCooldown: number;     // فاصله امن بین دو کاهش (ms)
}

// پیکربندی‌های از پیش تنظیم‌شده
const QUALITY_CONFIG: Record<QualityLevel, QualityConfig> = {
  low: {
    starCount: 800,
    sparkleCount: 30,
    meteorCount: 1,
    bloomIntensity: 0,
    bloomLuminanceThreshold: 1.0,
    bloomLuminanceSmoothing: 0.0,
    vignetteDarkness: 0.1,
    dpr: [0.75, 1],
    maxCanvasWidth: 1024,
    starSize: 0.28,
    ambientLight: 0.5,
    fpsThreshold: 30,
    qualityDropCooldown: 3000,
  },
  medium: {
    starCount: 1500,
    sparkleCount: 80,
    meteorCount: 2,
    bloomIntensity: 0.4,
    bloomLuminanceThreshold: 0.5,
    bloomLuminanceSmoothing: 0.7,
    vignetteDarkness: 0.4,
    dpr: [1, 1.25],
    maxCanvasWidth: 1440,
    starSize: 0.32,
    ambientLight: 0.6,
    fpsThreshold: 35,
    qualityDropCooldown: 3000,
  },
  high: {
    starCount: 2500,
    sparkleCount: 120,
    meteorCount: 2,
    bloomIntensity: 1.0,
    bloomLuminanceThreshold: 0.3,
    bloomLuminanceSmoothing: 0.85,
    vignetteDarkness: 0.7,
    dpr: [1, 1.5],
    maxCanvasWidth: 1920,
    starSize: 0.34,
    ambientLight: 0.4,
    fpsThreshold: 40,
    qualityDropCooldown: 3000,
  },
  ultra: {
    starCount: 4000,
    sparkleCount: 180,
    meteorCount: 3,
    bloomIntensity: 1.4,
    bloomLuminanceThreshold: 0.2,
    bloomLuminanceSmoothing: 0.9,
    vignetteDarkness: 0.85,
    dpr: [1, 1.5],
    maxCanvasWidth: 2560,
    starSize: 0.36,
    ambientLight: 0.3,
    fpsThreshold: 45,
    qualityDropCooldown: 3000,
  },
};

// ============================================================================
// ۱. تشخیص سخت‌افزار (بدون اینترفیس مغایر)
// ============================================================================
function useDeviceQuality(): [QualityLevel, React.Dispatch<React.SetStateAction<QualityLevel>>] {
  const [quality, setQuality] = useState<QualityLevel>("medium");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cores = (navigator as { hardwareConcurrency?: number }).hardwareConcurrency ?? 1;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 2;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    let detected: QualityLevel = "medium";
    if (isMobile && (cores < 4 || memory < 4)) {
      detected = "low";
    } else if (cores >= 16 && memory >= 8) {
      detected = "ultra";
    } else if (cores >= 8 && memory >= 6) {
      detected = "high";
    }

    setQuality(detected);
  }, []);

  return [quality, setQuality];
}

// ============================================================================
// ۲. ساختار و استخر شهاب‌ها
// ============================================================================
type MeteorState = {
  active: boolean;
  timer: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
};

function createMeteorState(initialDelay = Math.random() * 3): MeteorState {
  return {
    active: false,
    timer: initialDelay,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    life: 0,
    maxLife: 1.0,
  };
}

// ============================================================================
// ۳. شهاب منفرد (رفع کامل تخصیص زباله و نوع Ref دقیق)
// ============================================================================
function SingleShootingStar({ initialDelay }: { initialDelay: number }) {
  // استفاده از نوع React.ComponentRef برای استخراج دقیق نوع ref از کامپوننت Line
  const lineRef = useRef<React.ComponentRef<typeof Line>>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const meteorState = useRef<MeteorState>(createMeteorState(initialDelay));

  const tailPosRef = useRef(new THREE.Vector3());
  const tempVelRef = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const s = meteorState.current;
    const tailPos = tailPosRef.current;
    const tempVel = tempVelRef.current;

    if (!s.active) {
      s.timer -= delta;
      if (s.timer <= 0) {
        s.active = true;
        s.life = 0;
        s.maxLife = 0.7 + Math.random() * 0.7;

        const side = Math.random() > 0.5 ? 1 : -1;
        s.pos.set(
          (Math.random() * 25 + 10) * side,
          Math.random() * 12 + 10,
          (Math.random() - 0.5) * 10,
        );

        const angle = Math.PI * (0.65 + Math.random() * 0.15);
        const speed = 35 + Math.random() * 20;
        s.vel.set(
          Math.cos(angle) * speed * side,
          -Math.abs(Math.sin(angle)) * speed,
          (Math.random() - 0.5) * 5,
        );

        s.timer = Math.random() * 6 + 4;
      }

      if (lineRef.current) lineRef.current.visible = false;
      if (headRef.current) headRef.current.visible = false;
      return;
    }

    s.life += delta;
    const progress = s.life / s.maxLife;

    if (progress >= 1) {
      s.active = false;
      if (lineRef.current) lineRef.current.visible = false;
      if (headRef.current) headRef.current.visible = false;
      return;
    }

    s.pos.x += s.vel.x * delta;
    s.pos.y += s.vel.y * delta;
    s.pos.z += s.vel.z * delta;

    const speedMag = s.vel.length();
    const tailLength = THREE.MathUtils.clamp(speedMag * 0.02, 0.3, 1.4);

    tempVel.copy(s.vel).normalize().multiplyScalar(tailLength);
    tailPos.copy(s.pos).sub(tempVel);

    const fadeOpacity = Math.sin(progress * Math.PI);

    if (lineRef.current) {
      lineRef.current.visible = true;
      const geo = lineRef.current.geometry;
      geo.setPositions([
        s.pos.x, s.pos.y, s.pos.z,
        tailPos.x, tailPos.y, tailPos.z,
      ]);
      geo.attributes.position.needsUpdate = true;
      lineRef.current.material.opacity = fadeOpacity * 0.9;
    }

    if (headRef.current) {
      headRef.current.visible = true;
      headRef.current.position.copy(s.pos);
      (headRef.current.material as THREE.MeshBasicMaterial).opacity = fadeOpacity;
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={[new THREE.Vector3(), new THREE.Vector3()]}
        color="white"
        lineWidth={3}
        transparent
        opacity={0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        frustumCulled={false}
      />
      <mesh ref={headRef} frustumCulled={false}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// ۴. استخر شهاب‌ها
// ============================================================================
function ShootingStars({ count }: { count: number }) {
  const delays = useMemo(
    () => Array.from({ length: count }, (_, i) => i * 1.5 + Math.random() * 2),
    [count],
  );

  return (
    <>
      {delays.map((d, i) => (
        <SingleShootingStar key={i} initialDelay={d} />
      ))}
    </>
  );
}

// ============================================================================
// ۵. هوک تم
// ============================================================================
function useThemeMode() {
  const [isLight, setIsLight] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("light-theme"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains("light-theme"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

// پالت‌های رنگی ثابت
const DARK_PALETTE = ["#a855f7", "#6366f1", "#ec4899", "#06b6d4", "#FFD700"];
const LIGHT_PALETTE = ["#7c3aed", "#db2777", "#0891b2", "#d97706", "#4f46e5"];
const DARK_COLORS = DARK_PALETTE.map((c) => new THREE.Color(c));
const LIGHT_COLORS = LIGHT_PALETTE.map((c) => new THREE.Color(c));

// ============================================================================
// ۶. میدان ستاره‌ها (همراه پایش FPS با آستانه قابل تنظیم)
// ============================================================================
interface StarFieldProps {
  isLight: boolean;
  count: number;
  starSize: number;
  fpsThreshold: number;
  qualityDropCooldown: number;
  onFpsDrop: () => void;
}

function ExactFivePointStarField({
  isLight,
  count,
  starSize,
  fpsThreshold,
  qualityDropCooldown,
  onFpsDrop,
}: StarFieldProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);

  const fpsTracker = useRef({
    frames: 0,
    lastTime: performance.now(),
    lastDropTime: 0,
  });

  const starTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 64, 64);

    const cx = 32, cy = 32, outerRadius = 16, innerRadius = 6;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const outerAngle = ((i * 72 - 90) * Math.PI) / 180;
      const innerAngle = ((i * 72 + 36 - 90) * Math.PI) / 180;
      const x1 = cx + outerRadius * Math.cos(outerAngle);
      const y1 = cy + outerRadius * Math.sin(outerAngle);
      const x2 = cx + innerRadius * Math.cos(innerAngle);
      const y2 = cy + innerRadius * Math.sin(innerAngle);
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(32, 32, 2, 32, 32, 18);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.5, "rgba(255,220,255,0.9)");
    gradient.addColorStop(0.8, "rgba(180,140,255,0.4)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      starTexture.dispose();
    };
  }, [starTexture]);

  const [positions, darkColors, lightColors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const dCols = new Float32Array(count * 3);
    const lCols = new Float32Array(count * 3);

    const width = 60, height = 40, depth = 35;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * width;
      pos[i3 + 1] = (Math.random() - 0.5) * height;
      pos[i3 + 2] = (Math.random() - 0.5) * depth;

      const dColor = DARK_COLORS[Math.floor(Math.random() * DARK_COLORS.length)];
      dCols[i3] = dColor.r;
      dCols[i3 + 1] = dColor.g;
      dCols[i3 + 2] = dColor.b;

      const lColor = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
      lCols[i3] = lColor.r;
      lCols[i3 + 1] = lColor.g;
      lCols[i3 + 2] = lColor.b;
    }

    return [pos, dCols, lCols];
  }, [count]);

  const currentColorBuffer = useRef<Float32Array>(
    new Float32Array(isLight ? lightColors : darkColors)
  );

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    const tracker = fpsTracker.current;
    tracker.frames++;
    const now = performance.now();
    if (now - tracker.lastTime >= 2000) {
      const elapsed = now - tracker.lastTime;
      const currentFps = (tracker.frames * 1000) / elapsed;
      if (currentFps < fpsThreshold && (now - tracker.lastDropTime) > qualityDropCooldown) {
        onFpsDrop();
        tracker.lastDropTime = now;
      }
      tracker.frames = 0;
      tracker.lastTime = now;
    }

    if (pointsRef.current) {
      const geo = pointsRef.current.geometry;
      const colorAttr = geo.attributes.color as THREE.BufferAttribute;
      if (colorAttr) {
        const targetColors = isLight ? lightColors : darkColors;
        const current = colorAttr.array as Float32Array;
        let needsUpdate = false;

        for (let i = 0; i < current.length; i++) {
          const diff = targetColors[i] - current[i];
          if (Math.abs(diff) > 0.001) {
            current[i] += diff * delta * 4.0;
            needsUpdate = true;
          }
        }
        if (needsUpdate) colorAttr.needsUpdate = true;
      }
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.025;
      groupRef.current.rotation.x = Math.sin(time * 0.08) * 0.04;

      const targetMouseX = state.pointer.x * Math.PI * 0.04;
      const targetMouseY = state.pointer.y * Math.PI * 0.04;

      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetMouseX,
        0.03,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        -targetMouseY,
        0.03,
      );
    }
  });

  const materialProps = useMemo(() => {
    const base: THREE.PointsMaterialParameters = {
      map: starTexture,
      depthWrite: false,
      transparent: true,
      vertexColors: true,
    };

    if (isLight) {
      return {
        ...base,
        size: starSize * 1.2,
        blending: THREE.NormalBlending,
        opacity: 0.95,
      };
    }
    return {
      ...base,
      size: starSize,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    };
  }, [isLight, starTexture, starSize]);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[currentColorBuffer.current, 3]}
          />
        </bufferGeometry>
        <pointsMaterial {...materialProps} />
      </points>
    </group>
  );
}

// ============================================================================
// ۷. محاسبه DPR هوشمند
// ============================================================================
function useOptimalDpr(qualityConfig: QualityConfig): number {
  if (typeof window === "undefined") return qualityConfig.dpr[0];

  const devicePixelRatio = window.devicePixelRatio || 1;
  const screenWidth = window.screen.width * devicePixelRatio;
  const targetWidth = Math.min(screenWidth, qualityConfig.maxCanvasWidth);
  const canvasLogicalWidth = screenWidth / devicePixelRatio;
  if (canvasLogicalWidth === 0) return qualityConfig.dpr[1];
  const idealDpr = targetWidth / canvasLogicalWidth;
  return Math.max(qualityConfig.dpr[0], Math.min(qualityConfig.dpr[1], idealDpr));
}

// ============================================================================
// ۸. کامپوننت اصلی Canvas – اوج مهندسی
// ============================================================================
export default function CanvasView() {
  const isLight = useThemeMode();
  const [quality, setQuality] = useDeviceQuality();
  const config = QUALITY_CONFIG[quality];

  const [isTabActive, setIsTabActive] = useState(true);
  useEffect(() => {
    const onVisibilityChange = () => setIsTabActive(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const handleFpsDrop = useCallback(() => {
    setQuality((prev) => {
      if (prev === "ultra") return "high";
      if (prev === "high") return "medium";
      if (prev === "medium") return "low";
      return prev;
    });
  }, []);

  const enablePostProcessing = config.bloomIntensity > 0;
  const optimalDpr = useOptimalDpr(config);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 55 }}
        gl={{
          antialias: quality !== "low",
          powerPreference: "high-performance",
        }}
        dpr={optimalDpr}
        frameloop={isTabActive ? "always" : "never"}
      >
        <color attach="background" args={[isLight ? "#FAF9F5" : "#020204"]} />
        <ambientLight intensity={config.ambientLight} />

        <Sparkles
          count={config.sparkleCount}
          scale={[30, 20, 30]}
          size={2.5}
          speed={0.4}
          opacity={isLight ? 0.3 : 0.6}
          color={isLight ? "#D97706" : "#FFD700"}
        />

        <ExactFivePointStarField
          isLight={isLight}
          count={config.starCount}
          starSize={config.starSize}
          fpsThreshold={config.fpsThreshold}
          qualityDropCooldown={config.qualityDropCooldown}
          onFpsDrop={handleFpsDrop}
        />

        <ShootingStars count={config.meteorCount} />

        {enablePostProcessing && (
          <EffectComposer>
            <Bloom
              luminanceThreshold={config.bloomLuminanceThreshold}
              luminanceSmoothing={config.bloomLuminanceSmoothing}
              intensity={config.bloomIntensity}
              mipmapBlur
            />
            <Vignette
              eskil={false}
              offset={0.15}
              darkness={config.vignetteDarkness}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}