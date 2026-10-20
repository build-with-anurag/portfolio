'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeElements } from '@react-three/fiber';
import { RoundedBox, ContactShadows, Float, useCursor } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================================
// COLOR PALETTE & MATERIALS
// ============================================================================
const PALETTE = {
  deepBlue: '#0f172a',     // Primary hoodie body
  midBlue: '#1e293b',      // Hoodie sleeves & secondary panels
  lightBlue: '#334155',    // Trim & cuffs
  gold: '#f59e0b',         // Primary amber/gold accent
  brightGold: '#fbbf24',   // Glowing/highlight gold
  skin: '#f3c6a5',         // Stylized warm skin
  skinBlush: '#e59872',    // Subtle nose/ear warmth
  hair: '#18181b',         // Dark stylized hair
  eyeDark: '#09090b',      // Pupils & lashes
  white: '#f8fafc',        // Shirt collar & eye sparkle
};

// ============================================================================
// HELPER COMPONENT: Stylized Swept Hair
// ============================================================================
function StylizedHair() {
  return (
    <group position={[0, 0.12, 0]}>
      {/* Main Hair Cap (Back & Top) */}
      <mesh position={[0, 0.14, -0.06]} castShadow>
        <sphereGeometry args={[0.53, 32, 32]} />
        <meshStandardMaterial color={PALETTE.hair} roughness={0.65} />
      </mesh>
      {/* Left & Right Sideburns / Temple Fade */}
      <RoundedBox args={[0.14, 0.36, 0.38]} radius={0.06} smoothness={4} position={[-0.45, 0.02, -0.02]} castShadow>
        <meshStandardMaterial color={PALETTE.hair} roughness={0.65} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.36, 0.38]} radius={0.06} smoothness={4} position={[0.45, 0.02, -0.02]} castShadow>
        <meshStandardMaterial color={PALETTE.hair} roughness={0.65} />
      </RoundedBox>
      {/* Front Swept Bangs (Layered Stylized Swooshes) */}
      <RoundedBox args={[0.48, 0.2, 0.32]} radius={0.09} smoothness={4} position={[-0.12, 0.38, 0.3]} rotation={[0.25, 0.15, -0.22]} castShadow>
        <meshStandardMaterial color={PALETTE.hair} roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.42, 0.18, 0.28]} radius={0.08} smoothness={4} position={[0.18, 0.4, 0.28]} rotation={[0.2, -0.25, 0.18]} castShadow>
        <meshStandardMaterial color={PALETTE.hair} roughness={0.6} />
      </RoundedBox>
      {/* Top Volume Tuft */}
      <RoundedBox args={[0.35, 0.16, 0.35]} radius={0.07} smoothness={4} position={[0.02, 0.5, 0.15]} rotation={[0.35, 0.1, -0.1]} castShadow>
        <meshStandardMaterial color={PALETTE.hair} roughness={0.6} />
      </RoundedBox>
    </group>
  );
}

// ============================================================================
// HELPER COMPONENT: Studio Headphones (Deep Blue & Gold)
// ============================================================================
function Headphones() {
  return (
    <group position={[0, 0.05, -0.02]}>
      {/* Headband Arch */}
      <mesh rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.56, 0.045, 16, 48, Math.PI]} />
        <meshStandardMaterial color={PALETTE.midBlue} roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Gold Inner Headband Trim */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.535, 0.015, 12, 48, Math.PI]} />
        <meshStandardMaterial color={PALETTE.gold} roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Left Earcup */}
      <group position={[-0.55, -0.05, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.12, 24]} />
          <meshStandardMaterial color={PALETTE.deepBlue} roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Gold Accent Ring */}
        <mesh position={[-0.062, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.14, 0.018, 16, 32]} />
          <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
        </mesh>
      </group>
      {/* Right Earcup */}
      <group position={[0.55, -0.05, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.12, 24]} />
          <meshStandardMaterial color={PALETTE.deepBlue} roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Gold Accent Ring */}
        <mesh position={[0.062, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.14, 0.018, 16, 32]} />
          <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// ============================================================================
// HELPER COMPONENT: Gold-Rimmed Developer Glasses
// ============================================================================
function DeveloperGlasses() {
  return (
    <group position={[0, 0.02, 0.48]}>
      {/* Left Frame */}
      <RoundedBox args={[0.3, 0.21, 0.025]} radius={0.04} smoothness={4} position={[-0.19, 0, 0]}>
        <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
      </RoundedBox>
      {/* Left Lens Cutout Illusion (Subtle Tinted Glass) */}
      <RoundedBox args={[0.25, 0.16, 0.028]} radius={0.03} smoothness={4} position={[-0.19, 0, 0]}>
        <meshStandardMaterial color={PALETTE.deepBlue} transparent opacity={0.18} roughness={0.1} metalness={0.9} />
      </RoundedBox>
      {/* Right Frame */}
      <RoundedBox args={[0.3, 0.21, 0.025]} radius={0.04} smoothness={4} position={[0.19, 0, 0]}>
        <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
      </RoundedBox>
      {/* Right Lens Cutout Illusion */}
      <RoundedBox args={[0.25, 0.16, 0.028]} radius={0.03} smoothness={4} position={[0.19, 0, 0]}>
        <meshStandardMaterial color={PALETTE.deepBlue} transparent opacity={0.18} roughness={0.1} metalness={0.9} />
      </RoundedBox>
      {/* Bridge */}
      <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.1, 12]} />
        <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Temple Arms */}
      <mesh position={[-0.35, 0.02, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
      </mesh>
      <mesh position={[0.35, 0.02, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
        <meshStandardMaterial color={PALETTE.gold} roughness={0.2} metalness={0.85} />
      </mesh>
    </group>
  );
}

// ============================================================================
// HELPER COMPONENT: Floating Holographic Mini-Laptop Prop
// ============================================================================
function FloatingTechBadge() {
  return (
    <Float speed={2.5} rotationIntensity={0.35} floatIntensity={0.5} position={[-1.05, 0.15, 0.35]}>
      <group rotation={[0.2, 0.55, -0.1]}>
        {/* Holographic Code Bracket `< />` Badge */}
        <RoundedBox args={[0.48, 0.34, 0.04]} radius={0.06} smoothness={4} castShadow>
          <meshStandardMaterial color={PALETTE.midBlue} roughness={0.3} metalness={0.5} />
        </RoundedBox>
        {/* Gold Border Trim */}
        <RoundedBox args={[0.5, 0.36, 0.03]} radius={0.06} smoothness={4}>
          <meshStandardMaterial color={PALETTE.gold} roughness={0.25} metalness={0.85} />
        </RoundedBox>
        {/* Glowing `<` `/` `>` Symbols */}
        {/* Left chevron */}
        <mesh position={[-0.12, 0.03, 0.025]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.014, 0.07, 8, 8]} />
          <meshStandardMaterial color={PALETTE.brightGold} emissive={PALETTE.gold} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[-0.12, -0.03, 0.025]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.014, 0.07, 8, 8]} />
          <meshStandardMaterial color={PALETTE.brightGold} emissive={PALETTE.gold} emissiveIntensity={0.8} />
        </mesh>
        {/* Center slash */}
        <mesh position={[0, 0, 0.025]} rotation={[0, 0, -0.35]}>
          <capsuleGeometry args={[0.014, 0.13, 8, 8]} />
          <meshStandardMaterial color={PALETTE.white} emissive={PALETTE.white} emissiveIntensity={0.5} />
        </mesh>
        {/* Right chevron */}
        <mesh position={[0.12, 0.03, 0.025]} rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.014, 0.07, 8, 8]} />
          <meshStandardMaterial color={PALETTE.brightGold} emissive={PALETTE.gold} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0.12, -0.03, 0.025]} rotation={[0, 0, -Math.PI / 4]}>
          <capsuleGeometry args={[0.014, 0.07, 8, 8]} />
          <meshStandardMaterial color={PALETTE.brightGold} emissive={PALETTE.gold} emissiveIntensity={0.8} />
        </mesh>
      </group>
    </Float>
  );
}

// ============================================================================
// MAIN COMPONENT: Character3D
// ============================================================================
export type Character3DProps = ThreeElements['group'];

export default function Character3D(props: Character3DProps) {
  // Interactive States
  const [hovered, setHovered] = useState(false);
  const lastClickTime = useRef<number>(-100);
  // Click requests are raised by event handlers and consumed inside useFrame,
  // so the reaction timestamp always comes from the R3F clock (single clock).
  const clickRequested = useRef(false);

  // Change pointer cursor when hovering over the character
  useCursor(hovered);

  // Animation Refs
  const rootGroupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const leftEyeGroupRef = useRef<THREE.Group>(null);
  const rightEyeGroupRef = useRef<THREE.Group>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);
  const smileMeshRef = useRef<THREE.Mesh>(null);

  const rightShoulderRef = useRef<THREE.Group>(null);
  const rightElbowRef = useRef<THREE.Group>(null);
  const leftShoulderRef = useRef<THREE.Group>(null);
  const leftElbowRef = useRef<THREE.Group>(null);
  const chestBadgeMatRef = useRef<THREE.MeshStandardMaterial>(null);

  // Blink State Ref (avoids React re-renders in useFrame)
  const blinkState = useRef({
    nextBlinkTime: 2.5,
    isBlinking: false,
    blinkStart: 0,
  });

  // Precomputed Smile Geometry
  const smileRotation = useMemo(() => new THREE.Euler(0, 0, Math.PI * 1.15), []);

  // ============================================================================
  // ANIMATION LOOP (useFrame)
  // ============================================================================
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    // Consume a pending click raised by an event handler, stamped with the
    // R3F clock so it lines up with the reaction-window maths below.
    if (clickRequested.current) {
      lastClickTime.current = t;
      clickRequested.current = false;
    }

    // Check if the character is currently in its click reaction window (0.95 seconds)
    const timeSinceClick = t - lastClickTime.current;
    const isClickReacting = timeSinceClick >= 0 && timeSinceClick < 0.95;
    const clickProgress = isClickReacting ? timeSinceClick / 0.95 : 0;

    // ------------------------------------------------------------------------
    // 1. ROOT GROUP: Calm Breathing + Click Happy Jump
    // ------------------------------------------------------------------------
    if (rootGroupRef.current) {
      // Calm sinusoidal breathing
      const breathY = Math.sin(t * 2.1) * 0.028;
      // Smooth jump arc on click
      const jumpY = isClickReacting ? Math.sin(clickProgress * Math.PI) * 0.34 : 0;

      // Subtle squash & stretch scale during click jump
      const targetScaleY = isClickReacting
        ? 1 + Math.sin(clickProgress * Math.PI * 2) * 0.06
        : 1;
      const targetScaleXZ = isClickReacting
        ? 1 - Math.sin(clickProgress * Math.PI * 2) * 0.03
        : 1;

      rootGroupRef.current.position.y = THREE.MathUtils.lerp(
        rootGroupRef.current.position.y,
        -0.35 + breathY + jumpY,
        10 * dt
      );

      // Keep fixed three-quarter view facing slightly toward the viewer (-0.32 rad),
      // with a slight celebratory spin wiggle on click
      const baseRotY = -0.32;
      const clickSpin = isClickReacting ? Math.sin(clickProgress * Math.PI * 2) * 0.18 : 0;
      rootGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        rootGroupRef.current.rotation.y,
        baseRotY + clickSpin,
        8 * dt
      );

      rootGroupRef.current.scale.set(
        THREE.MathUtils.lerp(rootGroupRef.current.scale.x, targetScaleXZ, 12 * dt),
        THREE.MathUtils.lerp(rootGroupRef.current.scale.y, targetScaleY, 12 * dt),
        THREE.MathUtils.lerp(rootGroupRef.current.scale.z, targetScaleXZ, 12 * dt)
      );
    }

    // ------------------------------------------------------------------------
    // 2. HEAD GROUP: Strictly Still on Idle (NO Mouse Tracking), tilts on Wave/Click
    // ------------------------------------------------------------------------
    if (headGroupRef.current) {
      let targetHeadX = 0;
      let targetHeadY = 0.12; // Slightly angled toward the camera from the 3/4 body turn
      let targetHeadZ = 0;

      if (isClickReacting) {
        // Enthusiastic happy nod
        targetHeadX = -Math.sin(clickProgress * Math.PI * 2) * 0.16;
        targetHeadZ = Math.sin(clickProgress * Math.PI * 2) * 0.1;
      } else if (hovered) {
        // Friendly slight head tilt while waving
        targetHeadZ = -0.09;
        targetHeadX = -0.04;
      }

      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.x,
        targetHeadX,
        7 * dt
      );
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.y,
        targetHeadY,
        7 * dt
      );
      headGroupRef.current.rotation.z = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.z,
        targetHeadZ,
        7 * dt
      );
    }

    // ------------------------------------------------------------------------
    // 3. EYES & EYEBROWS: Occasional Natural Blinking & Happy Expression
    // ------------------------------------------------------------------------
    if (t > blinkState.current.nextBlinkTime && !blinkState.current.isBlinking) {
      blinkState.current.isBlinking = true;
      blinkState.current.blinkStart = t;
    }

    let eyeScaleY = 1;
    if (blinkState.current.isBlinking) {
      const blinkElapsed = t - blinkState.current.blinkStart;
      const blinkDuration = 0.15;
      if (blinkElapsed < blinkDuration) {
        eyeScaleY = Math.max(0.08, Math.cos((blinkElapsed / blinkDuration) * Math.PI));
      } else {
        blinkState.current.isBlinking = false;
        blinkState.current.nextBlinkTime = t + 2.6 + Math.random() * 3.2;
      }
    }

    if (leftEyeGroupRef.current && rightEyeGroupRef.current) {
      leftEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(
        leftEyeGroupRef.current.scale.y,
        eyeScaleY,
        25 * dt
      );
      rightEyeGroupRef.current.scale.y = THREE.MathUtils.lerp(
        rightEyeGroupRef.current.scale.y,
        eyeScaleY,
        25 * dt
      );
    }

    // Eyebrow perk on hover or click
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      const browLift = isClickReacting ? 0.05 : hovered ? 0.025 : 0;
      leftEyebrowRef.current.position.y = THREE.MathUtils.lerp(
        leftEyebrowRef.current.position.y,
        0.16 + browLift,
        10 * dt
      );
      rightEyebrowRef.current.position.y = THREE.MathUtils.lerp(
        rightEyebrowRef.current.position.y,
        0.16 + browLift,
        10 * dt
      );
    }

    // Bigger smile on click/hover
    if (smileMeshRef.current) {
      const targetSmileScale = isClickReacting ? 1.35 : hovered ? 1.15 : 1.0;
      smileMeshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(smileMeshRef.current.scale.x, targetSmileScale, 10 * dt)
      );
    }

    // ------------------------------------------------------------------------
    // 4. RIGHT ARM (Viewer's Left): Waves on Hover, Celebrates on Click
    // ------------------------------------------------------------------------
    if (rightShoulderRef.current && rightElbowRef.current) {
      // Calm resting pose
      let rShoulderX = 0.06;
      let rShoulderY = 0;
      let rShoulderZ = -0.16 + Math.sin(t * 2.1) * 0.02;
      let rElbowX = -0.22;
      let rElbowZ = 0.08;

      if (isClickReacting) {
        // Happy double-fist pump / celebratory pose
        rShoulderX = -0.65;
        rShoulderZ = -0.95;
        rElbowX = -1.25;
        rElbowZ = -0.2 + Math.sin(clickProgress * Math.PI * 4) * 0.25;
      } else if (hovered) {
        // Friendly hand wave
        rShoulderX = -0.45;
        rShoulderY = -0.2;
        rShoulderZ = -1.15;
        rElbowX = -1.1;
        rElbowZ = Math.sin(t * 11) * 0.32 - 0.15;
      }

      rightShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.x,
        rShoulderX,
        8 * dt
      );
      rightShoulderRef.current.rotation.y = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.y,
        rShoulderY,
        8 * dt
      );
      rightShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        rightShoulderRef.current.rotation.z,
        rShoulderZ,
        8 * dt
      );
      rightElbowRef.current.rotation.x = THREE.MathUtils.lerp(
        rightElbowRef.current.rotation.x,
        rElbowX,
        10 * dt
      );
      rightElbowRef.current.rotation.z = THREE.MathUtils.lerp(
        rightElbowRef.current.rotation.z,
        rElbowZ,
        12 * dt
      );
    }

    // ------------------------------------------------------------------------
    // 5. LEFT ARM (Viewer's Right): Calm Idle + Celebrates on Click
    // ------------------------------------------------------------------------
    if (leftShoulderRef.current && leftElbowRef.current) {
      let lShoulderX = 0.08;
      let lShoulderZ = 0.16 - Math.sin(t * 2.1) * 0.02;
      let lElbowX = -0.28;
      let lElbowZ = -0.1;

      if (isClickReacting) {
        // Symmetrical happy jump arm raise
        lShoulderX = -0.65;
        lShoulderZ = 0.95;
        lElbowX = -1.2;
        lElbowZ = 0.2 - Math.sin(clickProgress * Math.PI * 4) * 0.25;
      }

      leftShoulderRef.current.rotation.x = THREE.MathUtils.lerp(
        leftShoulderRef.current.rotation.x,
        lShoulderX,
        8 * dt
      );
      leftShoulderRef.current.rotation.z = THREE.MathUtils.lerp(
        leftShoulderRef.current.rotation.z,
        lShoulderZ,
        8 * dt
      );
      leftElbowRef.current.rotation.x = THREE.MathUtils.lerp(
        leftElbowRef.current.rotation.x,
        lElbowX,
        10 * dt
      );
      leftElbowRef.current.rotation.z = THREE.MathUtils.lerp(
        leftElbowRef.current.rotation.z,
        lElbowZ,
        10 * dt
      );
    }

    // ------------------------------------------------------------------------
    // 6. CHEST GOLD EMBLEM: Pulses Brightly on Click/Hover
    // ------------------------------------------------------------------------
    if (chestBadgeMatRef.current) {
      const targetEmissive = isClickReacting ? 1.8 : hovered ? 0.65 : 0.25;
      chestBadgeMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        chestBadgeMatRef.current.emissiveIntensity,
        targetEmissive,
        8 * dt
      );
    }
  });

  return (
    <group {...props}>
      {/* ====================================================================
          SELF-CONTAINED STUDIO LIGHTING (Warm Gold Key + Cool Blue Rim)
      ==================================================================== */}
      <ambientLight intensity={0.65} color="#e2e8f0" />
      <directionalLight position={[3.5, 5, 4]} intensity={1.6} color="#fffbeb" castShadow shadow-mapSize={[1024, 1024]} />
      {/* Cool Deep-Blue Fill Light */}
      <directionalLight position={[-4, 2, -2]} intensity={0.9} color="#38bdf8" />
      {/* Warm Gold Rim Light */}
      <pointLight position={[2.2, 1.8, -2.5]} intensity={2.2} color={PALETTE.gold} distance={8} />

      {/* ====================================================================
          INTERACTIVE CHARACTER ROOT (3/4 View Facing Slightly Toward Viewer)
      ==================================================================== */}
      <group
        ref={rootGroupRef}
        position={[0, -0.35, 0]}
        rotation={[0, -0.32, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          clickRequested.current = true;
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          clickRequested.current = true;
        }}
      >
        {/* Invisible Click/Hover Hitbox for effortless interaction */}
        <mesh position={[0, 0.55, 0]} visible={false} onClick={(e) => {
          e.stopPropagation();
          clickRequested.current = true;
        }}>
          <cylinderGeometry args={[0.85, 0.85, 2.3, 12]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>

        {/* ==================================================================
            HEAD & NECK ASSEMBLY
        ================================================================== */}
        {/* Neck */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.28, 24]} />
          <meshStandardMaterial color={PALETTE.skin} roughness={0.55} />
        </mesh>
        {/* Inner White Tee Crew-Neck Collar */}
        <mesh position={[0, 0.52, 0.02]} rotation={[Math.PI / 2 + 0.15, 0, 0]}>
          <torusGeometry args={[0.17, 0.035, 12, 32]} />
          <meshStandardMaterial color={PALETTE.white} roughness={0.6} />
        </mesh>
        {/* Animated Head Group */}
        <group ref={headGroupRef} position={[0, 0.78, 0]} onPointerDown={(e) => {
          e.stopPropagation();
        }}>
          {/* Stylized Rounded Head */}
          <RoundedBox args={[0.92, 0.86, 0.88]} radius={0.36} smoothness={8} position={[0, 0.32, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={PALETTE.skin} roughness={0.5} metalness={0.05} />
          </RoundedBox>
          {/* Ears */}
          <mesh position={[-0.47, 0.3, -0.02]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={PALETTE.skinBlush} roughness={0.55} />
          </mesh>
          <mesh position={[0.47, 0.3, -0.02]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={PALETTE.skinBlush} roughness={0.55} />
          </mesh>
          {/* Facial Features Group */}
          <group position={[0, 0.3, 0]}>
            {/* Left Eye */}
            <group ref={leftEyeGroupRef} position={[-0.19, 0.02, 0.43]}>
              <mesh rotation={[0, 0, 0]}>
                <capsuleGeometry args={[0.042, 0.035, 12, 16]} />
                <meshStandardMaterial color={PALETTE.eyeDark} roughness={0.2} />
              </mesh>
              {/* Eye Catchlight Sparkle */}
              <mesh position={[0.016, 0.022, 0.036]}>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshBasicMaterial color={PALETTE.white} />
              </mesh>
            </group>
            {/* Right Eye */}
            <group ref={rightEyeGroupRef} position={[0.19, 0.02, 0.43]}>
              <mesh rotation={[0, 0, 0]}>
                <capsuleGeometry args={[0.042, 0.035, 12, 16]} />
                <meshStandardMaterial color={PALETTE.eyeDark} roughness={0.2} />
              </mesh>
              {/* Eye Catchlight Sparkle */}
              <mesh position={[0.016, 0.022, 0.036]}>
                <sphereGeometry args={[0.014, 12, 12]} />
                <meshBasicMaterial color={PALETTE.white} />
              </mesh>
            </group>
            {/* Eyebrows */}
            <mesh ref={leftEyebrowRef} position={[-0.19, 0.16, 0.44]} rotation={[0, 0, Math.PI / 2 + 0.08]}>
              <capsuleGeometry args={[0.018, 0.11, 8, 12]} />
              <meshStandardMaterial color={PALETTE.hair} roughness={0.6} />
            </mesh>
            <mesh ref={rightEyebrowRef} position={[0.19, 0.16, 0.44]} rotation={[0, 0, Math.PI / 2 - 0.08]}>
              <capsuleGeometry args={[0.018, 0.11, 8, 12]} />
              <meshStandardMaterial color={PALETTE.hair} roughness={0.6} />
            </mesh>
            {/* Stylized Button Nose */}
            <mesh position={[0, -0.04, 0.46]} rotation={[0.25, 0, 0]} castShadow>
              <capsuleGeometry args={[0.032, 0.03, 12, 16]} />
              <meshStandardMaterial color={PALETTE.skinBlush} roughness={0.5} />
            </mesh>
            {/* Friendly Smile */}
            <mesh ref={smileMeshRef} position={[0, -0.14, 0.435]} rotation={smileRotation}>
              <torusGeometry args={[0.065, 0.014, 12, 24, Math.PI * 0.72]} />
              <meshStandardMaterial color="#8c4a32" roughness={0.5} />
            </mesh>
            {/* Developer Glasses */}
            <DeveloperGlasses />
            {/* Stylized Hair */}
            <StylizedHair />
            {/* Studio Headphones */}
            <Headphones />
          </group>
        </group>

        {/* ==================================================================
            TORSO & HOODIE (Deep Blue with Gold/Amber Accents)
        ================================================================== */}
        <group position={[0, 0, 0]}>
          {/* Main Hoodie Body */}
          <RoundedBox args={[0.96, 1.05, 0.56]} radius={0.22} smoothness={6} position={[0, 0.02, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={PALETTE.deepBlue} roughness={0.65} metalness={0.1} />
          </RoundedBox>
          {/* Ribbed Bottom Waistband Hem */}
          <RoundedBox args={[0.92, 0.14, 0.52]} radius={0.05} smoothness={4} position={[0, -0.48, 0]} castShadow>
            <meshStandardMaterial color={PALETTE.midBlue} roughness={0.7} />
          </RoundedBox>
          {/* Hoodie Kangaroo Front Pocket */}
          <RoundedBox args={[0.62, 0.28, 0.08]} radius={0.04} smoothness={4} position={[0, -0.24, 0.26]} castShadow>
            <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
          </RoundedBox>
          {/* Rolled Hood Around Collar */}
          <mesh position={[0, 0.52, -0.05]} rotation={[Math.PI / 2 + 0.25, 0, 0]} castShadow>
            <torusGeometry args={[0.29, 0.11, 16, 36]} />
            <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
          </mesh>
          {/* Gold Hoodie Drawstrings + Aglets */}
          <group position={[0, 0.42, 0.28]}>
            {/* Left Drawstring */}
            <mesh position={[-0.11, -0.1, 0]} rotation={[0.05, 0, 0.05]} castShadow>
              <capsuleGeometry args={[0.015, 0.24, 8, 12]} />
              <meshStandardMaterial color={PALETTE.gold} roughness={0.35} metalness={0.6} />
            </mesh>
            {/* Left Metallic Gold Aglet Tip */}
            <mesh position={[-0.116, -0.23, 0.006]}>
              <cylinderGeometry args={[0.018, 0.018, 0.05, 12]} />
              <meshStandardMaterial color={PALETTE.brightGold} roughness={0.15} metalness={0.95} />
            </mesh>
            {/* Right Drawstring */}
            <mesh position={[0.11, -0.1, 0]} rotation={[0.05, 0, -0.05]} castShadow>
              <capsuleGeometry args={[0.015, 0.24, 8, 12]} />
              <meshStandardMaterial color={PALETTE.gold} roughness={0.35} metalness={0.6} />
            </mesh>
            {/* Right Metallic Gold Aglet Tip */}
            <mesh position={[0.116, -0.23, 0.006]}>
              <cylinderGeometry args={[0.018, 0.018, 0.05, 12]} />
              <meshStandardMaterial color={PALETTE.brightGold} roughness={0.15} metalness={0.95} />
            </mesh>
          </group>
          {/* Glowing Gold Developer Emblem on Left Chest */}
          <group position={[0.24, 0.22, 0.285]}>
            <RoundedBox args={[0.14, 0.14, 0.02]} radius={0.03} smoothness={4} rotation={[0, 0, Math.PI / 4]}>
              <meshStandardMaterial ref={chestBadgeMatRef} color={PALETTE.gold} emissive={PALETTE.gold} emissiveIntensity={0.25} roughness={0.2} metalness={0.85} />
            </RoundedBox>
          </group>
        </group>

        {/* ==================================================================
            RIGHT ARM (Viewer's Left - Performs Wave on Hover)
        ================================================================== */}
        <group ref={rightShoulderRef} position={[-0.54, 0.36, 0]}>
          {/* Upper Sleeve */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.28, 16, 24]} />
            <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
          </mesh>
          {/* Gold Shoulder Stripe Accent */}
          <mesh position={[-0.02, -0.08, 0]} rotation={[0, 0, 0.1]}>
            <torusGeometry args={[0.125, 0.016, 12, 24]} />
            <meshStandardMaterial color={PALETTE.gold} roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Elbow Joint & Forearm */}
          <group ref={rightElbowRef} position={[0, -0.38, 0]}>
            {/* Forearm Sleeve */}
            <mesh position={[0, -0.17, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.24, 16, 24]} />
              <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
            </mesh>
            {/* Gold Cuff Trim */}
            <mesh position={[0, -0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.105, 0.022, 12, 24]} />
              <meshStandardMaterial color={PALETTE.gold} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Stylized Hand & Thumb (Waving Palm) */}
            <group position={[0, -0.41, 0]}>
              <RoundedBox args={[0.16, 0.18, 0.1]} radius={0.05} smoothness={4} castShadow>
                <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
              </RoundedBox>
              {/* Stylized Thumb */}
              <mesh position={[0.09, 0.02, 0.03]} rotation={[0, 0, -0.5]} castShadow>
                <capsuleGeometry args={[0.028, 0.06, 8, 12]} />
                <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ==================================================================
            LEFT ARM (Viewer's Right)
        ================================================================== */}
        <group ref={leftShoulderRef} position={[0.54, 0.36, 0]}>
          {/* Upper Sleeve */}
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.28, 16, 24]} />
            <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
          </mesh>
          {/* Gold Shoulder Stripe Accent */}
          <mesh position={[0.02, -0.08, 0]} rotation={[0, 0, -0.1]}>
            <torusGeometry args={[0.125, 0.016, 12, 24]} />
            <meshStandardMaterial color={PALETTE.gold} roughness={0.25} metalness={0.85} />
          </mesh>
          {/* Elbow Joint & Forearm */}
          <group ref={leftElbowRef} position={[0, -0.38, 0]}>
            {/* Forearm Sleeve */}
            <mesh position={[0, -0.17, 0]} castShadow>
              <capsuleGeometry args={[0.12, 0.24, 16, 24]} />
              <meshStandardMaterial color={PALETTE.midBlue} roughness={0.65} />
            </mesh>
            {/* Gold Cuff Trim */}
            <mesh position={[0, -0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.105, 0.022, 12, 24]} />
              <meshStandardMaterial color={PALETTE.gold} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Stylized Hand & Thumb */}
            <group position={[0, -0.41, 0]}>
              <RoundedBox args={[0.16, 0.18, 0.1]} radius={0.05} smoothness={4} castShadow>
                <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
              </RoundedBox>
              {/* Stylized Thumb */}
              <mesh position={[-0.09, 0.02, 0.03]} rotation={[0, 0, 0.5]} castShadow>
                <capsuleGeometry args={[0.028, 0.06, 8, 12]} />
                <meshStandardMaterial color={PALETTE.skin} roughness={0.5} />
              </mesh>
            </group>
          </group>
        </group>

        {/* ==================================================================
            STYLIZED PEDESTAL BASE RING (Anchors the Upper-Body Bust)
        ================================================================== */}
        <group position={[0, -0.62, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.018, 16, 64]} />
            <meshStandardMaterial color={PALETTE.gold} emissive={PALETTE.gold} emissiveIntensity={0.35} roughness={0.2} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ====================================================================
          FLOATING `< />` DEVELOPER PROP & GROUND SHADOW
      ==================================================================== */}
      <FloatingTechBadge />
      <ContactShadows position={[0, -1.08, 0]} opacity={0.45} scale={4.5} blur={2.2} far={2.5} color="#020617" />
    </group>
  );
}
