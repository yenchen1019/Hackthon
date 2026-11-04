import React, { useState, useRef, useEffect } from 'react';

// ==========================================
// 1. INLINE SVG ICONS
// ==========================================
const Icons = {
  Shield: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Sparkles: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-6.857L5 12l5.714-2.286L13 3z" />
    </svg>
  ),
  Coins: ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="9" r="7" strokeWidth="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9a7 7 0 11-7 7" strokeWidth="2" />
    </svg>
  ),
  Check: ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  RotateCcw: ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

// ==========================================
// 2. TRUE 6-SIDED 3D VOLUMETRIC BOX PRIMITIVE
// ==========================================
interface VoxelBox3DProps {
  w: number;
  h: number;
  d: number;
  colors: {
    front: string;
    back?: string;
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
  };
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  topContent?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  rounded?: string;
  border?: string;
}

function VoxelBox3D({
  w,
  h,
  d,
  colors,
  frontContent,
  backContent,
  topContent,
  leftContent,
  rightContent,
  rounded = "rounded-[2px]",
  border = "border border-black/15",
}: VoxelBox3DProps) {
  const cFront = colors.front;
  const cBack = colors.back || colors.front;
  const cLeft = colors.left || colors.front;
  const cRight = colors.right || colors.front;
  const cTop = colors.top || colors.front;
  const cBottom = colors.bottom || colors.front;

  return (
    <div style={{ width: w, height: h }} className="relative preserve-3d">
      <div
        style={{ width: w, height: h, background: cFront, transform: `translateZ(${d / 2}px)` }}
        className={`absolute left-0 top-0 ${rounded} ${border} overflow-hidden flex items-center justify-center`}
      >
        {frontContent}
      </div>
      <div
        style={{ width: w, height: h, background: cBack, transform: `rotateY(180deg) translateZ(${d / 2}px)` }}
        className={`absolute left-0 top-0 ${rounded} ${border} overflow-hidden flex items-center justify-center`}
      >
        {backContent}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
      <div
        style={{ width: d, height: h, left: (w - d) / 2, top: 0, background: cRight, transform: `rotateY(90deg) translateZ(${w / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center`}
      >
        {rightContent}
        <div className="absolute inset-0 bg-black/5 pointer-events-none" />
      </div>
      <div
        style={{ width: d, height: h, left: (w - d) / 2, top: 0, background: cLeft, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center`}
      >
        {leftContent}
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      </div>
      <div
        style={{ width: w, height: d, left: 0, top: (h - d) / 2, background: cTop, transform: `rotateX(90deg) translateZ(${h / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center`}
      >
        {topContent}
        <div className="absolute inset-0 bg-white/10 pointer-events-none" />
      </div>
      <div
        style={{ width: w, height: d, left: 0, top: (h - d) / 2, background: cBottom, transform: `rotateX(-90deg) translateZ(${h / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
  );
}

// ==========================================
// 3. TRUE 6-SIDED 3D VOLUMETRIC DICE MODEL
// Elevated high in Z-space (Z=48 idle, Z=96 rolling) so it NEVER sinks into ground!
// ==========================================
function True3DDice({
  value,
  isRolling,
  spinCount,
  onClick,
}: {
  value: number;
  isRolling: boolean;
  spinCount: number;
  onClick: () => void;
}) {
  const size = 40;
  const half = size / 2;

  const faceRotations: Record<number, [number, number, number]> = {
    1: [0, 0, 0],
    6: [180, 0, 0],
    2: [-90, 0, 0],
    5: [90, 0, 0],
    3: [0, -90, 0],
    4: [0, 90, 0],
  };

  const [baseX, baseY, baseZ] = faceRotations[value] || [0, 0, 0];
  const rotX = baseX + spinCount * 720 + (isRolling ? 540 : -16);
  const rotY = baseY + spinCount * 1080 + (isRolling ? 720 : 20);
  const rotZ = baseZ + spinCount * 360 + (isRolling ? 360 : -8);

  const pipBase = "rounded-full shadow-[inset_0_2px_3px_rgba(0,0,0,0.75)]";
  const darkPip = `w-2 h-2 bg-slate-900 ${pipBase}`;
  const redPip = `w-2.5 h-2.5 bg-red-600 ${pipBase}`;

  const faceStyle =
    "absolute inset-0 rounded-[8px] bg-gradient-to-br from-white via-sky-50 to-sky-100 border-2 border-white shadow-[inset_0_0_8px_rgba(2,132,199,0.22)] p-1.5";

  // Keep Z well above the maximum diagonal radius (40 * 0.866 = 34.6px)
  const elevationZ = isRolling ? 96 : 48;

  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        transform: `translateZ(${elevationZ}px)`,
      }}
      className="relative preserve-3d cursor-pointer transition-transform duration-500 ease-out"
    >
      {/* Ground Shadow projected strictly onto the fountain plaza floor */}
      <div
        style={{
          transform: `translateZ(${-elevationZ + 4}px) scale(${isRolling ? 0.5 : 0.95})`,
        }}
        className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(8,47,73,0.45),transparent)] transition-transform duration-500 pointer-events-none"
      />

      {/* 6-Sided 3D Rotating Cube */}
      <div
        style={{
          width: size,
          height: size,
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
          transition: isRolling
            ? "transform 0.75s cubic-bezier(0.18, 0.89, 0.32, 1.28)"
            : "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
        className="relative preserve-3d"
      >
        <div className="absolute inset-0.5 bg-white rounded-[6px]" />
        <div style={{ transform: "rotateY(90deg)" }} className="absolute inset-0.5 bg-white rounded-[6px]" />
        <div style={{ transform: "rotateX(90deg)" }} className="absolute inset-0.5 bg-white rounded-[6px]" />

        {/* FACE 1 */}
        <div style={{ transform: `translateZ(${half}px)` }} className={`${faceStyle} flex items-center justify-center`}>
          <div className="w-4 h-4 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]" />
        </div>
        {/* FACE 6 */}
        <div style={{ transform: `rotateY(180deg) translateZ(${half}px)` }} className={`${faceStyle} grid grid-cols-2 grid-rows-3 place-items-center`}>
          <div className={darkPip} /><div className={darkPip} />
          <div className={darkPip} /><div className={darkPip} />
          <div className={darkPip} /><div className={darkPip} />
        </div>
        {/* FACE 3 */}
        <div style={{ transform: `rotateY(90deg) translateZ(${half}px)` }} className={`${faceStyle} flex flex-col justify-between`}>
          <div className="flex justify-start"><div className={darkPip} /></div>
          <div className="flex justify-center"><div className={darkPip} /></div>
          <div className="flex justify-end"><div className={darkPip} /></div>
        </div>
        {/* FACE 4 */}
        <div style={{ transform: `rotateY(-90deg) translateZ(${half}px)` }} className={`${faceStyle} grid grid-cols-2 grid-rows-2 place-items-center`}>
          <div className={redPip} /><div className={redPip} />
          <div className={redPip} /><div className={redPip} />
        </div>
        {/* FACE 2 */}
        <div style={{ transform: `rotateX(90deg) translateZ(${half}px)` }} className={`${faceStyle} flex flex-col justify-between p-2`}>
          <div className="flex justify-start"><div className={darkPip} /></div>
          <div className="flex justify-end"><div className={darkPip} /></div>
        </div>
        {/* FACE 5 */}
        <div style={{ transform: `rotateX(-90deg) translateZ(${half}px)` }} className={`${faceStyle} flex flex-col justify-between`}>
          <div className="flex justify-between"><div className={darkPip} /><div className={darkPip} /></div>
          <div className="flex justify-center"><div className={darkPip} /></div>
          <div className="flex justify-between"><div className={darkPip} /><div className={darkPip} /></div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. TRUE 3D VOLUMETRIC HUMANOID CHARACTER MODEL
// ==========================================
export interface CharacterPreset {
  id: string;
  name: string;
  suitColor: string;
  suitDark: string;
  hairColor: string;
  skinColor: string;
  tieColor: string;
  visorColor?: string;
  defaultInsured: boolean;
}

const CHARACTER_MODELS: CharacterPreset[] = [
  {
    id: 'advisor',
    name: '阿哲',
    suitColor: '#059669',
    suitDark: '#065f46',
    hairColor: '#1e293b',
    skinColor: '#fed7aa',
    tieColor: '#fbbf24',
    defaultInsured: true,
  },
  {
    id: 'guardian',
    name: '小雅',
    suitColor: '#0284c7',
    suitDark: '#0369a1',
    hairColor: '#f59e0b',
    skinColor: '#ffedd5',
    tieColor: '#10b981',
    visorColor: '#38bdf8',
    defaultInsured: true,
  },
  {
    id: 'tycoon',
    name: '凱文',
    suitColor: '#7c3aed',
    suitDark: '#5b21b6',
    hairColor: '#f8fafc',
    skinColor: '#fde68a',
    tieColor: '#f43f5e',
    defaultInsured: false,
  },
  {
    id: 'mogul',
    name: '豪哥',
    suitColor: '#e11d48',
    suitDark: '#9f1239',
    hairColor: '#334155',
    skinColor: '#fed7aa',
    tieColor: '#fde047',
    defaultInsured: false,
  },
];

function True3DCharacter({
  preset,
  isWalking,
  facingAngleZ,
  isShocked,
  scale = 1,
}: {
  preset: CharacterPreset;
  isWalking: boolean;
  facingAngleZ: number;
  isShocked: boolean;
  scale?: number;
}) {
  return (
    <div
      style={{
        transform: `rotateZ(${facingAngleZ}deg) rotateX(-90deg) scale(${scale})`,
      }}
      className="relative preserve-3d transition-transform duration-300"
    >
      <div className={`relative preserve-3d flex flex-col items-center`}>
        {/* 1. 3D HAIR TOP */}
        <div style={{ transform: "translateY(-44px)" }} className="absolute preserve-3d">
          <VoxelBox3D
            w={18}
            h={5}
            d={16}
            colors={{
              front: preset.hairColor,
              top: preset.hairColor,
              left: preset.hairColor,
              right: preset.hairColor,
              back: preset.hairColor,
            }}
          />
        </div>

        {/* 2. 3D HEAD */}
        <div style={{ transform: "translateY(-39px)" }} className="absolute preserve-3d">
          <VoxelBox3D
            w={16}
            h={14}
            d={14}
            rounded="rounded-[5px]"
            border="border border-white/60"
            colors={{
              front: preset.skinColor,
              left: preset.skinColor,
              right: preset.skinColor,
              back: preset.hairColor,
              top: preset.hairColor,
              bottom: preset.skinColor,
            }}
            frontContent={
              <div className="w-full h-full flex flex-col items-center justify-between py-1 px-1.5 relative">
                <div style={{ backgroundColor: preset.hairColor }} className="absolute top-0 inset-x-0 h-2" />
                {preset.visorColor ? (
                  <div
                    style={{ backgroundColor: preset.visorColor }}
                    className="w-11 h-2.5 mt-2 rounded-sm border border-white/80 shadow-[0_0_6px_#38bdf8]"
                  />
                ) : (
                  <div className="w-full flex justify-between px-1 mt-2">
                    <div className="w-2 h-2.5 rounded-full bg-slate-900 flex items-start justify-end p-0.5">
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                    <div className="w-2 h-2.5 rounded-full bg-slate-900 flex items-start justify-end p-0.5">
                      <div className="w-0.5 h-0.5 rounded-full bg-white" />
                    </div>
                  </div>
                )}
                <span className="absolute left-0.5 top-[8.5px] w-1.5 h-1 rounded-full bg-pink-400/70" />
                <span className="absolute right-0.5 top-[8.5px] w-1.5 h-1 rounded-full bg-pink-400/70" />
                {isShocked ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-slate-900 mb-0.5" />
                ) : (
                  <div className="w-4 h-1.5 rounded-b-full bg-rose-500 border-b border-slate-900 mb-0.5" />
                )}
              </div>
            }
            leftContent={<div style={{ backgroundColor: preset.hairColor }} className="w-full h-4 self-start" />}
            rightContent={<div style={{ backgroundColor: preset.hairColor }} className="w-full h-4 self-start" />}
          />
        </div>

        {/* 3. 3D TORSO */}
        <div style={{ transform: "translateY(-25px)" }} className="absolute preserve-3d">
          <VoxelBox3D
            w={16}
            h={15}
            d={10}
            colors={{
              front: preset.suitColor,
              back: preset.suitDark,
              left: preset.suitDark,
              right: preset.suitDark,
              top: preset.suitColor,
              bottom: preset.suitDark,
            }}
            frontContent={
              <div className="w-full h-full flex flex-col items-center relative">
                <div className="w-5 h-6 bg-white rounded-b-sm flex justify-center">
                  <div style={{ backgroundColor: preset.tieColor }} className="w-1.5 h-5 rounded-b-sm" />
                </div>
                <div className="absolute bottom-1 inset-x-0 h-1.5 bg-slate-900 flex justify-center">
                  <div className="w-2.5 h-1.5 bg-amber-400" />
                </div>
              </div>
            }
            backContent={<div className="w-3.5 h-3.5 rounded-full bg-emerald-400/40 border border-emerald-300" />}
          />

          {/* 4. LEFT 3D ARM */}
          <div
            style={{ left: -5, top: 1 }}
            className={`absolute preserve-3d origin-top ${isWalking ? 'animate-3d-limb-r' : ''}`}
          >
            <VoxelBox3D
              w={5}
              h={13}
              d={6}
              colors={{
                front: preset.suitColor,
                back: preset.suitDark,
                left: preset.suitDark,
                right: preset.suitColor,
                top: preset.suitColor,
                bottom: preset.skinColor,
              }}
              frontContent={<div style={{ backgroundColor: preset.skinColor }} className="w-full h-3 mt-auto" />}
            />
          </div>

          {/* 5. RIGHT 3D ARM */}
          <div
            style={{ right: -5, top: 1 }}
            className={`absolute preserve-3d origin-top ${isWalking ? 'animate-3d-limb-l' : ''}`}
          >
            <VoxelBox3D
              w={5}
              h={13}
              d={6}
              colors={{
                front: preset.suitColor,
                back: preset.suitDark,
                left: preset.suitColor,
                right: preset.suitDark,
                top: preset.suitColor,
                bottom: preset.skinColor,
              }}
              frontContent={<div style={{ backgroundColor: preset.skinColor }} className="w-full h-3 mt-auto" />}
            />
          </div>
        </div>

        {/* 6. LEFT & RIGHT 3D LEGS */}
        <div style={{ transform: "translateY(-10px)" }} className="absolute preserve-3d flex gap-1">
          <div
            style={{ left: -7.5, top: 0 }}
            className={`absolute preserve-3d origin-top ${isWalking ? 'animate-3d-limb-l' : ''}`}
          >
            <VoxelBox3D
              w={6.5}
              h={11}
              d={7}
              colors={{
                front: "#1e293b",
                back: "#0f172a",
                left: "#0f172a",
                right: "#1e293b",
                top: "#1e293b",
                bottom: "#020617",
              }}
              frontContent={<div className="w-full h-2.5 bg-amber-950 mt-auto border-t border-slate-600" />}
            />
          </div>

          <div
            style={{ left: 1, top: 0 }}
            className={`absolute preserve-3d origin-top ${isWalking ? 'animate-3d-limb-r' : ''}`}
          >
            <VoxelBox3D
              w={6.5}
              h={11}
              d={7}
              colors={{
                front: "#1e293b",
                back: "#0f172a",
                left: "#1e293b",
                right: "#0f172a",
                top: "#1e293b",
                bottom: "#020617",
              }}
              frontContent={<div className="w-full h-2.5 bg-amber-950 mt-auto border-t border-slate-600" />}
            />
          </div>
        </div>

        {/* 7. 3D GOLDEN PEDESTAL */}
        <div style={{ transform: "translateY(-1px)" }} className="absolute preserve-3d">
          <VoxelBox3D
            w={22}
            h={3}
            d={22}
            colors={{
              front: "#f59e0b",
              back: "#b45309",
              left: "#d97706",
              right: "#d97706",
              top: "#fde68a",
              bottom: "#78350f",
            }}
          />
        </div>
      </div>
    </div>
  );
}
// ==========================================
// 5b. CUTE 2D CHIBI AVATAR (used in setup screen, scoreboard & event scenes)
// ==========================================
type AvatarMood = 'happy' | 'dizzy' | 'sick' | 'shock' | 'sad';

function ChibiAvatar({
  preset,
  size = 48,
  mood = 'happy',
}: {
  preset: CharacterPreset;
  size?: number;
  mood?: AvatarMood;
}) {
  const s = size;
  const eyeSize = Math.max(3, s * 0.11);
  const eye = (key: string) => {
    if (mood === 'dizzy')
      return (
        <span key={key} style={{ fontSize: s * 0.17, lineHeight: 1 }} className="font-black text-[#5b3a29]">×</span>
      );
    if (mood === 'sick' || mood === 'sad')
      return <span key={key} style={{ width: eyeSize * 1.4, height: Math.max(1.5, s * 0.035) }} className="rounded-full bg-[#5b3a29]" />;
    const big = mood === 'shock' ? 1.35 : 1;
    return (
      <span
        key={key}
        style={{ width: eyeSize * big, height: eyeSize * big * 1.15 }}
        className="rounded-full bg-[#4a2e20] relative"
      >
        <span style={{ width: eyeSize * 0.38, height: eyeSize * 0.38, top: '14%', right: '14%' }} className="absolute rounded-full bg-white" />
      </span>
    );
  };

  const mouth =
    mood === 'shock' || mood === 'dizzy' ? (
      <span style={{ width: s * 0.1, height: s * 0.12 }} className="rounded-full bg-[#c2410c] border border-[#5b3a29]" />
    ) : mood === 'sick' || mood === 'sad' ? (
      <span style={{ width: s * 0.16, height: s * 0.07 }} className="rounded-t-full border-t-2 border-[#5b3a29]" />
    ) : (
      <span style={{ width: s * 0.16, height: s * 0.08 }} className="rounded-b-full bg-[#f87171] border border-[#5b3a29]" />
    );

  return (
    <div style={{ width: s, height: s * 1.12 }} className="relative shrink-0">
      {/* Body */}
      <div
        style={{
          width: s * 0.6,
          height: s * 0.4,
          left: s * 0.2,
          bottom: 0,
          background: preset.suitColor,
          borderRadius: `${s * 0.3}px ${s * 0.3}px ${s * 0.12}px ${s * 0.12}px`,
        }}
        className="absolute border-2 border-white flex justify-center"
      >
        <span style={{ width: s * 0.14, height: s * 0.14, background: preset.tieColor }} className="mt-0.5 rounded-full border border-white/80" />
      </div>
      {/* Head */}
      <div
        style={{ width: s * 0.84, height: s * 0.76, left: s * 0.08, top: 0, background: preset.skinColor }}
        className="absolute rounded-[50%] overflow-hidden border-2 border-white shadow-[0_2px_0_rgba(120,72,40,0.15)]"
      >
        {/* Bangs */}
        <div
          style={{ background: preset.hairColor, height: '40%', borderRadius: '0 0 45% 45% / 0 0 60% 60%' }}
          className="absolute inset-x-0 top-0"
        />
        {/* Eyes */}
        <div style={{ top: '48%', gap: s * 0.2 }} className="absolute inset-x-0 flex justify-center items-center">
          {eye('l')}
          {eye('r')}
        </div>
        {/* Blush */}
        <span style={{ width: s * 0.14, height: s * 0.07, left: '10%', top: '66%' }} className="absolute rounded-full bg-pink-400/55" />
        <span style={{ width: s * 0.14, height: s * 0.07, right: '10%', top: '66%' }} className="absolute rounded-full bg-pink-400/55" />
        {/* Mouth */}
        <div style={{ top: '70%' }} className="absolute inset-x-0 flex justify-center">{mouth}</div>
        {/* Sick green tint */}
        {mood === 'sick' && <div className="absolute inset-0 bg-lime-400" style={{ animation: 'evTint 0.8s ease-out 0.4s both' }} />}
      </div>
    </div>
  );
}

// ==========================================
// 5c. INSURANCE EVENT SCENES (cute CSS cartoon animations)
// ==========================================
type EventSceneKind = 'car' | 'hospital' | 'typhoon' | 'fall' | 'fire' | 'food' | 'theft' | 'pot' | 'appliance' | 'health';

const EVENT_SCENE_MS = 2800;

// Shorthand for inline animation styles
const anim = (name: string, dur: number, delay = 0, extra: React.CSSProperties = {}, timing = 'ease-out', iter: string | number = 1) =>
  ({ animation: `${name} ${dur}s ${timing} ${delay}s ${iter} both`, ...extra }) as React.CSSProperties;

// Absolute anchor centered on (x%, bottom%)
function At({ x, b, children, z = 10 }: { x: string; b: string; children: React.ReactNode; z?: number }) {
  return (
    <div style={{ left: x, bottom: b, zIndex: z }} className="absolute -translate-x-1/2 flex items-end justify-center">
      {children}
    </div>
  );
}

function EventScene({ kind, preset }: { kind: EventSceneKind; preset: CharacterPreset }) {
  const frame = "relative w-full h-48 rounded-3xl overflow-hidden border-4 border-white shadow-[inset_0_-6px_0_rgba(0,0,0,0.06)]";
  const emoji = (size: string) => `${size} leading-none select-none`;

  switch (kind) {
    case 'car':
      return (
        <div className={`${frame} bg-gradient-to-b from-sky-200 to-sky-50`}>
          <span className="absolute top-3 left-5 text-3xl">☁️</span>
          <span className="absolute top-6 right-8 text-2xl">☁️</span>
          <span className="absolute top-3 right-3 text-3xl">🚦</span>
          {/* Road */}
          <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#9aa0a6]">
            <div className="absolute top-1/2 inset-x-0 border-t-4 border-dashed border-white/80" />
          </div>
          <div className="absolute bottom-[34%] inset-x-0 h-2 bg-[#e7d3b5]" />
          <At x="50%" b="16%">
            <div style={anim('evKnock', 0.9, 0.75)}>
              <ChibiAvatar preset={preset} size={50} mood="shock" />
            </div>
          </At>
          {/* Car zooms in from right */}
          <At x="50%" b="8%" z={20}>
            <span style={anim('evDriveAcross', 1.2, 0.2, { '--from': '320px', '--to': '-340px' } as React.CSSProperties, 'cubic-bezier(.5,0,.6,1)')} className={emoji('text-6xl')}>🚗</span>
          </At>
          <At x="45%" b="44%" z={30}>
            <span style={anim('evPopOut', 0.8, 0.72)} className={emoji('text-5xl')}>💥</span>
          </At>
          <At x="30%" b="40%" z={30}>
            <span style={anim('evPop', 0.4, 1.6)} className={emoji('text-2xl')}>
              <span className="inline-block" style={anim('evSpin', 1, 1.6, {}, 'linear', 'infinite')}>💫</span>
            </span>
          </At>
          <At x="80%" b="8%" z={25}>
            <span style={anim('evDriveAcross', 0.8, 1.9, { '--from': '260px', '--to': '0px' } as React.CSSProperties)} className={emoji('text-5xl')}>🚑</span>
          </At>
        </div>
      );

    case 'hospital':
      return (
        <div className={`${frame} bg-gradient-to-b from-emerald-100 to-teal-50`}>
          <span className="absolute top-3 right-4 text-6xl">🏥</span>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[#d9efe6]" />
          <At x="30%" b="18%">
            <div style={anim('evWobble', 0.5, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="sick" />
            </div>
          </At>
          <At x="38%" b="62%" z={30}>
            <span style={anim('evPop', 0.4, 0.4)} className={emoji('text-3xl')}>🌡️</span>
          </At>
          <At x="22%" b="60%" z={30}>
            <span style={anim('evPop', 0.4, 0.7)} className={emoji('text-2xl')}>💦</span>
          </At>
          <At x="70%" b="10%" z={20}>
            <span style={anim('evDriveAcross', 1, 1.0, { '--from': '-300px', '--to': '0px' } as React.CSSProperties)} className={emoji('text-6xl')}>
              <span className="inline-block -scale-x-100">🚑</span>
            </span>
          </At>
          <At x="70%" b="48%" z={30}>
            <span style={anim('evFlash', 0.6, 1.9, {}, 'linear', 'infinite')} className={emoji('text-2xl')}>🚨</span>
          </At>
        </div>
      );

    case 'typhoon':
      return (
        <div className={`${frame} bg-gradient-to-b from-slate-500 to-slate-300`}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{ left: `${(i * 7.3) % 100}%`, top: 0, ...anim('evRain', 0.6, (i % 5) * 0.12, {}, 'linear', 'infinite') }}
              className="absolute w-0.5 h-5 bg-sky-100/80 rounded-full"
            />
          ))}
          <span style={anim('evDriveAcross', 2.4, 0, { '--from': '-60px', '--to': '260px', top: 10, left: 0 } as React.CSSProperties, 'linear')} className="absolute">
            <span className="inline-block text-5xl" style={anim('evSpin', 0.7, 0, {}, 'linear', 'infinite')}>🌀</span>
          </span>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#7c9a6b]" />
          <At x="58%" b="18%">
            <span style={anim('evShake', 0.18, 0.3, {}, 'linear', 'infinite')} className={emoji('text-7xl')}>🏠</span>
          </At>
          <At x="66%" b="48%" z={30}>
            <span style={anim('evFlyAway', 1, 1.2, { '--tx': '-160px', '--ty': '-70px' } as React.CSSProperties)} className={emoji('text-3xl')}>🪟</span>
          </At>
          <At x="24%" b="18%">
            <div style={anim('evShake', 0.3, 0, {}, 'linear', 'infinite')}>
              <ChibiAvatar preset={preset} size={46} mood="shock" />
            </div>
          </At>
          <div style={anim('evWaterRise', 1.6, 1.0)} className="absolute inset-x-0 bottom-0 bg-sky-400/60 border-t-4 border-sky-200/80 z-20" />
          <At x="40%" b="10%" z={25}>
            <span style={anim('evBob', 0.8, 1.6, {}, 'ease-in-out', 'infinite')} className={emoji('text-2xl')}>🪑</span>
          </At>
          <div style={anim('evFlash', 1.2, 0.8)} className="absolute inset-0 bg-yellow-50 pointer-events-none z-40" />
          <span style={anim('evPopOut', 0.9, 0.8)} className="absolute top-2 left-1/3 text-5xl z-40">⚡</span>
        </div>
      );

    case 'fall':
      return (
        <div className={`${frame} bg-gradient-to-b from-indigo-200 to-sky-100`}>
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              style={{ left: `${(i * 10.7) % 100}%`, top: 0, ...anim('evRain', 0.7, (i % 4) * 0.15, {}, 'linear', 'infinite') }}
              className="absolute w-0.5 h-4 bg-white/80 rounded-full"
            />
          ))}
          <span className="absolute top-3 right-4 text-3xl">🚇</span>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[repeating-linear-gradient(90deg,#e5e7eb_0_22px,#d1d5db_22px_44px)]" />
          <div className="absolute bottom-[14%] left-[46%] w-24 h-4 rounded-full bg-sky-300/70" />
          <At x="55%" b="18%" z={15}>
            <span className={emoji('text-3xl')}>🍌</span>
          </At>
          <At x="52%" b="20%">
            <div style={anim('evDriveAcross', 1, 0, { '--from': '-150px', '--to': '0px' } as React.CSSProperties, 'linear')}>
              <div style={anim('evSlip', 0.6, 1.0)}>
                <ChibiAvatar preset={preset} size={50} mood="shock" />
              </div>
            </div>
          </At>
          <At x="58%" b="56%" z={30}>
            <span style={anim('evPop', 0.4, 1.5)} className={emoji('text-2xl')}>
              <span className="inline-block" style={anim('evSpin', 1, 1.5, {}, 'linear', 'infinite')}>💫</span>
            </span>
          </At>
          <At x="75%" b="40%" z={30}>
            <span style={anim('evPop', 0.4, 1.8)} className={emoji('text-3xl')}>🦴</span>
          </At>
        </div>
      );

    case 'fire':
      return (
        <div className={`${frame} bg-gradient-to-b from-orange-100 to-amber-50`}>
          <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[#e7c9a4]" />
          <div className="absolute bottom-[30%] left-[20%] w-[42%] h-3 bg-[#b07a4f] rounded-t" />
          <At x="41%" b="32%">
            <span className={emoji('text-5xl')}>🍳</span>
          </At>
          <At x="41%" b="52%" z={20}>
            <span style={anim('evGrow', 1.2, 0.3)} className="inline-block origin-bottom">
              <span className="inline-block text-5xl" style={anim('evFlicker', 0.25, 0.3, {}, 'ease-in-out', 'infinite')}>🔥</span>
            </span>
          </At>
          {[0, 1, 2].map((i) => (
            <At key={i} x={`${34 + i * 8}%`} b="70%" z={25}>
              <span style={anim('evRise', 1.2, 0.8 + i * 0.35, {}, 'ease-out', 'infinite')} className={emoji('text-3xl')}>💨</span>
            </At>
          ))}
          <At x="80%" b="18%">
            <div style={anim('evShake', 0.2, 0.9, {}, 'linear', 'infinite')}>
              <ChibiAvatar preset={preset} size={50} mood="shock" />
            </div>
          </At>
          <At x="80%" b="64%" z={30}>
            <span style={anim('evPop', 0.4, 1.0)} className={emoji('text-2xl')}>❗❗</span>
          </At>
        </div>
      );

    case 'food':
      return (
        <div className={`${frame} bg-gradient-to-b from-indigo-900 to-purple-700`}>
          {[12, 32, 52, 72, 90].map((x, i) => (
            <span key={x} style={{ left: `${x}%`, ...anim('evBob', 1.2, i * 0.2, {}, 'ease-in-out', 'infinite') }} className="absolute top-1 text-2xl">🏮</span>
          ))}
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[#4c3a6b]" />
          <At x="25%" b="20%">
            <span className={emoji('text-4xl')}>🍢</span>
          </At>
          <At x="25%" b="44%">
            <span className={emoji('text-3xl')}>🧋</span>
          </At>
          <At x="60%" b="18%">
            <div style={anim('evShake', 0.25, 0.8, {}, 'linear', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="sick" />
            </div>
          </At>
          <At x="72%" b="62%" z={30}>
            <span style={anim('evPop', 0.4, 0.9)} className={emoji('text-3xl')}>🤢</span>
          </At>
          <At x="50%" b="42%" z={30}>
            <span style={anim('evPop', 0.4, 1.3)} className={emoji('text-2xl')}>
              <span className="inline-block" style={anim('evSpin', 0.8, 1.3, {}, 'linear', 'infinite')}>🌀</span>
            </span>
          </At>
        </div>
      );

    case 'theft':
      return (
        <div className={`${frame} bg-gradient-to-b from-amber-100 to-orange-50`}>
          <span className="absolute top-3 left-4 text-4xl">🏬</span>
          <span className="absolute top-4 right-5 text-3xl">🛍️</span>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[repeating-linear-gradient(90deg,#f5e1c8_0_26px,#ecd2b2_26px_52px)]" />
          <At x="40%" b="18%">
            <div style={anim('evBob', 0.5, 0, {}, 'ease-in-out', 2)}>
              <div style={anim('evShake', 0.25, 1.3, {}, 'linear', 'infinite')}>
                <ChibiAvatar preset={preset} size={52} mood="shock" />
              </div>
            </div>
          </At>
          {/* Thief dashes past and grabs wallet + phone */}
          <At x="50%" b="16%" z={20}>
            <span style={anim('evDriveAcross', 1.3, 0.5, { '--from': '-260px', '--to': '280px' } as React.CSSProperties, 'cubic-bezier(.4,0,.6,1)')} className={emoji('text-5xl')}>
              <span className="inline-block -scale-x-100">🏃</span>
            </span>
          </At>
          <At x="48%" b="44%" z={25}>
            <span style={anim('evDriveAcross', 0.9, 0.95, { '--from': '0px', '--to': '240px' } as React.CSSProperties, 'ease-in')} className={emoji('text-2xl')}>👛</span>
          </At>
          <At x="44%" b="36%" z={25}>
            <span style={anim('evDriveAcross', 0.9, 1.0, { '--from': '0px', '--to': '260px' } as React.CSSProperties, 'ease-in')} className={emoji('text-2xl')}>📱</span>
          </At>
          <At x="52%" b="64%" z={30}>
            <span style={anim('evPop', 0.4, 1.4)} className={emoji('text-3xl')}>❓</span>
          </At>
          <At x="78%" b="58%" z={30}>
            <span style={anim('evPop', 0.4, 1.9)} className={emoji('text-2xl')}>💳</span>
          </At>
        </div>
      );

    case 'pot':
      return (
        <div className={`${frame} bg-gradient-to-b from-sky-200 to-sky-50`}>
          {/* Apartment with balcony */}
          <div className="absolute left-4 top-0 bottom-[22%] w-[38%] bg-[#fde2c8] border-r-4 border-[#f3c9a5]">
            <div className="grid grid-cols-2 gap-2 p-2">
              <span className="h-6 rounded bg-sky-200" /><span className="h-6 rounded bg-sky-200" />
              <span className="h-6 rounded bg-sky-200" /><span className="h-6 rounded bg-sky-200" />
            </div>
          </div>
          <div className="absolute left-[38%] top-10 w-10 h-1.5 bg-[#b07a4f] rounded" />
          <At x="22%" b="50%">
            <ChibiAvatar preset={preset} size={40} mood="shock" />
          </At>
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} style={{ top: `${15 + i * 12}%`, ...anim('evDriveAcross', 0.9, i * 0.15, { '--from': '-40px', '--to': '360px' } as React.CSSProperties, 'linear', 'infinite') }} className="absolute left-0 w-8 h-0.5 bg-white/80 rounded-full" />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#9aa0a6]" />
          <At x="64%" b="12%">
            <span className={emoji('text-5xl')}>🛵</span>
          </At>
          {/* Pot slides off the balcony and falls */}
          <div style={{ left: '42%', top: 18 }} className="absolute z-20">
            <span style={anim('evPotFall', 1.1, 0.4, {}, 'ease-in')} className={emoji('inline-block text-3xl')}>🪴</span>
          </div>
          <At x="64%" b="40%" z={30}>
            <span style={anim('evPopOut', 0.8, 1.45)} className={emoji('text-5xl')}>💥</span>
          </At>
          <At x="30%" b="76%" z={30}>
            <span style={anim('evPop', 0.4, 1.6)} className={emoji('text-2xl')}>😱</span>
          </At>
        </div>
      );

    case 'appliance':
      return (
        <div className={`${frame} bg-gradient-to-b from-cyan-100 to-sky-50`}>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[repeating-linear-gradient(90deg,#e0f2fe_0_24px,#cfe9f7_24px_48px)]" />
          {/* Cute fridge */}
          <div style={anim('evShake', 0.15, 0.5, {}, 'linear', 6)} className="absolute left-[18%] bottom-[18%] w-20 h-32 rounded-2xl bg-white border-4 border-sky-200 flex flex-col overflow-hidden">
            <div className="h-1/3 border-b-4 border-sky-200 relative"><span className="absolute right-2 top-2 w-1.5 h-5 rounded bg-sky-300" /></div>
            <div className="flex-1 relative flex items-center justify-center">
              <span className="absolute right-2 top-2 w-1.5 h-8 rounded bg-sky-300" />
              <span style={anim('evPop', 0.4, 1.2)} className="text-3xl">😵</span>
            </div>
          </div>
          {[0, 1].map((i) => (
            <At key={i} x={`${28 + i * 8}%`} b="78%" z={25}>
              <span style={anim('evRise', 1.2, 1.0 + i * 0.4, {}, 'ease-out', 'infinite')} className={emoji('text-2xl')}>💨</span>
            </At>
          ))}
          <At x="22%" b="72%" z={30}>
            <span style={anim('evPopOut', 0.7, 0.9)} className={emoji('text-3xl')}>⚡</span>
          </At>
          <At x="62%" b="18%">
            <span style={anim('evPop', 0.4, 1.4)} className={emoji('text-3xl')}>🧀</span>
          </At>
          <At x="76%" b="16%">
            <div style={anim('evShake', 0.3, 1.2, {}, 'linear', 'infinite')}>
              <ChibiAvatar preset={preset} size={50} mood="sad" />
            </div>
          </At>
          <At x="62%" b="40%" z={30}>
            <span style={anim('evPop', 0.4, 1.8)} className={emoji('text-2xl')}>🔧</span>
          </At>
        </div>
      );

    case 'health':
    default:
      return (
        <div className={`${frame} bg-gradient-to-b from-pink-100 to-rose-50`}>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#fbd5dc]" />
          <At x="35%" b="16%">
            <div style={anim('evBob', 0.6, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={56} mood="happy" />
            </div>
          </At>
          <At x="68%" b="24%">
            <span style={anim('evWobble', 0.8, 0, {}, 'ease-in-out', 'infinite')} className={emoji('text-6xl')}>📋</span>
          </At>
          <At x="72%" b="50%" z={30}>
            <span style={anim('evPop', 0.5, 1.0)} className={emoji('text-4xl')}>💯</span>
          </At>
          {[20, 40, 55, 85].map((x, i) => (
            <At key={x} x={`${x}%`} b="30%" z={25}>
              <span style={anim('evRise', 1.6, 0.4 + i * 0.3, {}, 'ease-out', 'infinite')} className={emoji('text-2xl')}>💖</span>
            </At>
          ))}
        </div>
      );
  }
}

// Shield drop / money fly-away shown on the result card
function InsuranceOutcomeFx({ protectedByInsurance }: { protectedByInsurance: boolean }) {
  if (protectedByInsurance) {
    return (
      <div className="relative h-20 flex items-center justify-center overflow-hidden">
        {[15, 32, 68, 85].map((x, i) => (
          <span key={x} style={{ left: `${x}%`, top: 0, ...anim('evCoinRain', 1.1, 0.4 + i * 0.18, {}, 'ease-in', 2) }} className="absolute text-xl">🪙</span>
        ))}
        <span style={anim('evShieldDrop', 0.7, 0)} className="text-5xl drop-shadow-[0_4px_0_rgba(16,185,129,0.35)]">🛡️</span>
      </div>
    );
  }
  return (
    <div className="relative h-20 flex items-center justify-center overflow-hidden">
      {[
        ['-70px', '-40deg', 0.1],
        ['50px', '35deg', 0.3],
        ['-20px', '-15deg', 0.5],
        ['80px', '50deg', 0.7],
      ].map(([tx, r, d], i) => (
        <span
          key={i}
          style={{ left: '46%', top: '45%', ...anim('evMoneyFly', 1.2, d as number, { '--tx': tx, '--r': r } as React.CSSProperties, 'ease-out', 2) }}
          className="absolute text-2xl"
        >
          💸
        </span>
      ))}
      <span style={anim('evPop', 0.5, 0)} className="text-4xl">😭</span>
    </div>
  );
}

// ==========================================
// 6. LIFE JOURNEY BOARD DATA (24 life-stage tiles, 4 dedicated chance tiles)
// ==========================================
// What happens to a player's assets when they land on a life-stage tile
interface TileEffect {
  cash?: number;
  shares?: number;
  property?: number;
}

interface BoardTile {
  id: number;
  name: string;
  type: 'START' | 'LIFE' | 'CHANCE' | 'CORNER' | 'RISK' | 'INSURANCE';
  price?: number; // insurance premium (INSURANCE tile only)
  color: string;
  icon: string;
  gridArea: string;
  row: number;
  col: number;
  model: number; // legacy model id (3D tile blocks were removed)
  baseBuilding?: number;
  hasTree?: boolean;
  effect?: TileEffect; // asset change applied when a player lands here
  landMsg?: string;
}

// 7x7 ring board: 24 tiles. Corners are 0, 6, 12, 18.
const BOARD_SIZE = 7;
const ringPos = (i: number): [number, number] => {
  const n = BOARD_SIZE - 1;
  if (i <= n) return [0, i]; // top row, left -> right
  if (i <= 2 * n) return [i - n, n]; // right column, top -> bottom
  if (i <= 3 * n) return [n, 3 * n - i]; // bottom row, right -> left
  return [4 * n - i, 0]; // left column, bottom -> top
};

const CHANCE_MODEL = 99;
const LIFE_MODEL = 98; // generic life-event milestone block (shows the tile emoji)

const BOARD_TILE_DEFS: Omit<BoardTile, 'id' | 'row' | 'col' | 'gridArea'>[] = [
  // Childhood & School (Top Row)
  { name: "呱呱落地", type: "START", color: "#f472b6", icon: "👶", model: LIFE_MODEL, baseBuilding: 1, hasTree: true },
  { name: "上小學", type: "LIFE", color: "#fb923c", icon: "🎒", model: LIFE_MODEL, effect: { cash: -30000 }, landMsg: "繳學費、買書包文具" },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "考上大學", type: "LIFE", color: "#8b5cf6", icon: "🎓", model: LIFE_MODEL, effect: { cash: -60000 }, landMsg: "繳大學學費與住宿費" },
  { name: "出國留學", type: "LIFE", color: "#0ea5e9", icon: "✈️", model: LIFE_MODEL, effect: { cash: -80000 }, landMsg: "出國留學，機票和生活費花不少" },
  { name: "實習打工", type: "LIFE", color: "#14b8a6", icon: "🧑‍💻", model: LIFE_MODEL, effect: { cash: 25000 }, landMsg: "實習薪水入帳" },
  { name: "第一份工作", type: "CORNER", color: "#0284c7", icon: "💼", model: LIFE_MODEL, effect: { cash: 30000 }, landMsg: "領到人生第一份薪水" },
  // Family & Career (Right Column)
  { name: "考駕照開車", type: "RISK", color: "#ef4444", icon: "🚗", model: LIFE_MODEL },
  { name: "步入禮堂", type: "LIFE", color: "#ec4899", icon: "💍", model: LIFE_MODEL, effect: { cash: -50000 }, landMsg: "辦婚禮，扣掉禮金還是花了一筆", hasTree: true },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "買第一間房", type: "LIFE", color: "#b45309", icon: "🏠", model: LIFE_MODEL, effect: { cash: -150000, property: 180000 }, landMsg: "付頭期款買房，現金變成房產" },
  { name: "斜槓副業", type: "LIFE", color: "#a855f7", icon: "💡", model: LIFE_MODEL, effect: { cash: 40000 }, landMsg: "下班經營副業，多一份收入" },
  { name: "寶寶誕生", type: "CORNER", color: "#f472b6", icon: "🍼", model: LIFE_MODEL, effect: { cash: 20000 }, landMsg: "迎接新生命，領取育兒津貼", hasTree: true },
  // Midlife & Family (Bottom Row)
  { name: "孩子上學", type: "LIFE", color: "#6366f1", icon: "📚", model: LIFE_MODEL, effect: { cash: -50000 }, landMsg: "繳孩子的學費和補習費" },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "升遷加薪", type: "LIFE", color: "#0284c7", icon: "📈", model: LIFE_MODEL, effect: { cash: 60000, shares: 40000 }, landMsg: "升職加薪，還拿到員工認股" },
  { name: "自行創業", type: "LIFE", color: "#10b981", icon: "🏪", model: LIFE_MODEL, effect: { cash: -100000, shares: 140000 }, landMsg: "拿出資金創業，換得公司股份" },
  { name: "健康檢查", type: "LIFE", color: "#22c55e", icon: "🩺", model: LIFE_MODEL, effect: { cash: -8000 }, landMsg: "做全身健康檢查，預防勝於治療" },
  { name: "光榮退休", type: "CORNER", color: "#059669", icon: "🏖️", model: LIFE_MODEL, effect: { cash: 50000 }, landMsg: "光榮退休，領取退休金", hasTree: true },
  // Golden Years & Legacy (Left Column)
  { name: "保障規劃", type: "INSURANCE", price: 60000, color: "#10b981", icon: "🛡️", model: 14 },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "含飴弄孫", type: "LIFE", color: "#e11d48", icon: "👴", model: LIFE_MODEL, effect: { cash: -20000 }, landMsg: "包紅包給孫子，開心最重要", hasTree: true },
  { name: "環遊世界", type: "LIFE", color: "#0891b2", icon: "🌍", model: LIFE_MODEL, effect: { cash: -70000 }, landMsg: "環遊世界，圓一個夢想" },
  { name: "財富傳承", type: "LIFE", color: "#f97316", icon: "📜", model: LIFE_MODEL, effect: { cash: 30000, shares: 20000 }, landMsg: "做好資產規劃，股息與股份都增加" },
];


const BOARD_TILES: BoardTile[] = BOARD_TILE_DEFS.map((t, id) => {
  const [row, col] = ringPos(id);
  return { ...t, id, row, col, gridArea: `${row + 1} / ${col + 1}` };
});

const CAR_CRASH_TILE = BOARD_TILES.findIndex((t) => t.type === 'RISK');
const FIRST_CHANCE_TILE = BOARD_TILES.findIndex((t) => t.type === 'CHANCE');

// ==========================================
// 7. CHANCE CARDS DATA & MULTIPLAYER TYPES
// ==========================================
type Insurer = '法國巴黎人壽' | '法國巴黎產險';

interface ChanceCard {
  id: number;
  title: string;
  desc: string;
  deltaMoney: number; // event loss (negative) or gain — game money, for illustration only
  insuredBonus?: number; // insurance payout — game money, for illustration only
  icon: string;
  tag: string;
  scene: EventSceneKind;
  insurer?: Insurer; // company that sells the matching product
  claimName: string; // real product name, as listed on the official website
  coverage?: string; // coverage item, as listed on the official website
  tip: string; // verified fact from the official website
}

// Official sources:
//  法國巴黎人壽 https://life.cardif.com.tw  (傷害保險 a232、健康保險 a233、理賠程序 a314、關於我們 a1)
//  法國巴黎產險 https://nonlife.cardif.com.tw (居家保險 a21、人身保險 a22、財產保險 a23)
const TIP_15_DAYS = '法國巴黎人壽理賠程序：文件齊備後，保險人應於 15 天內給付理賠金。';
const TIP_DIAGNOSIS = '申請理賠的「診斷證明書」須為正本，或加蓋醫院紅色印章的副本，不接受影印本。';
const TIP_LIFE_HOTLINE = '法國巴黎人壽服務／申訴專線：0800-012-899。';
const TIP_NONLIFE_HOTLINE = '法國巴黎產險服務／申訴專線：0800-266-288。';

const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 1,
    title: "過馬路被車撞了！",
    desc: "綠燈過馬路，還是被闖紅燈的車子撞倒，受傷住院…",
    deltaMoney: -120000,
    insuredBonus: 120000,
    icon: "🚗",
    tag: "意外風險",
    scene: "car",
    insurer: "法國巴黎產險",
    claimName: "永保平安傷害保險",
    coverage: "傷害住院保險金（日額型、實支實付型、意外門診手術）",
    tip: TIP_DIAGNOSIS,
  },
  {
    id: 2,
    title: "半夜急性盲腸炎",
    desc: "肚子痛到冒冷汗，救護車緊急送醫，開刀住院 5 天。",
    deltaMoney: -80000,
    insuredBonus: 80000,
    icon: "🏥",
    tag: "醫療風險",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "住院醫療保險",
    coverage: "住院日額、手術、出院療養、門診醫療給付",
    tip: TIP_15_DAYS,
  },
  {
    id: 3,
    title: "颱風豪雨淹進家裡",
    desc: "強颱過境，一樓淹水，家具和電器都泡水了。",
    deltaMoney: -60000,
    insuredBonus: 50000,
    icon: "🌀",
    tag: "天災風險",
    scene: "typhoon",
    insurer: "法國巴黎產險",
    claimName: "住宅颱風及洪水災害補償保險",
    coverage: "颱風、洪水災害補償",
    tip: TIP_NONLIFE_HOTLINE,
  },
  {
    id: 4,
    title: "雨天踩到香蕉皮滑倒",
    desc: "捷運站外地板濕滑，一屁股坐下去，手腕骨折打石膏。",
    deltaMoney: -50000,
    insuredBonus: 50000,
    icon: "🍌",
    tag: "意外風險",
    scene: "fall",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險 傷害醫療保險給付附加條款（日額型）",
    coverage: "傷害醫療住院給付（含骨折未住院）",
    tip: '骨折申請理賠時，依案件可能需要附上 X 光片。',
  },
  {
    id: 5,
    title: "煮泡麵忘記關火",
    desc: "鍋子燒乾起火，廚房被燒得黑漆漆，要重新整修。",
    deltaMoney: -90000,
    insuredBonus: 80000,
    icon: "🔥",
    tag: "居家風險",
    scene: "fire",
    insurer: "法國巴黎產險",
    claimName: "住宅火災保險",
    coverage: "火災",
    tip: TIP_NONLIFE_HOTLINE,
  },
  {
    id: 6,
    title: "夜市吃到食物中毒",
    desc: "路邊攤吃完上吐下瀉，送急診住院觀察。",
    deltaMoney: -30000,
    insuredBonus: 30000,
    icon: "🍢",
    tag: "意外風險",
    scene: "food",
    insurer: "法國巴黎產險",
    claimName: "永保平安傷害保險",
    coverage: "食物中毒、住院慰問",
    tip: TIP_DIAGNOSIS,
  },
  {
    id: 7,
    title: "錢包和手機被偷了！",
    desc: "逛街時被扒手摸走皮夾和手機，證件要補辦、信用卡還被盜刷。",
    deltaMoney: -40000,
    insuredBonus: 35000,
    icon: "👛",
    tag: "財物風險",
    scene: "theft",
    insurer: "法國巴黎產險",
    claimName: "個人皮件、證件及行動電話盜打賠償保險",
    coverage: "皮件賠償、卡片或證件重置費用、卡片盜用或行動電話盜打費用",
    tip: TIP_NONLIFE_HOTLINE,
  },
  {
    id: 8,
    title: "陽台盆栽被風吹落",
    desc: "盆栽掉下樓，砸壞樓下鄰居的機車，要負責賠償。",
    deltaMoney: -50000,
    insuredBonus: 50000,
    icon: "🪴",
    tag: "責任風險",
    scene: "pot",
    insurer: "法國巴黎產險",
    claimName: "住宅第三人責任基本保險",
    coverage: "住宅第三人責任",
    tip: TIP_NONLIFE_HOTLINE,
  },
  {
    id: 9,
    title: "冰箱突然壞掉了",
    desc: "冰箱過了原廠保固就罷工！幸好買的時候有加購延長保固。",
    deltaMoney: -25000,
    insuredBonus: 25000,
    icon: "🧊",
    tag: "財物風險",
    scene: "appliance",
    insurer: "法國巴黎產險",
    claimName: "產品延長保固費用保險",
    coverage: "費用賠償保險金",
    tip: TIP_NONLIFE_HOTLINE,
  },
  {
    id: 10,
    title: "健康檢查全部滿分！",
    desc: "年度健檢報告全綠燈，公司發健康獎金！保持健康也是最好的保障。",
    deltaMoney: 20000,
    icon: "💯",
    tag: "健康獎勵",
    scene: "health",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
];

const INSURANCE_PREMIUM = 30000;
const STARTING_MONEY = 500000;
const MAX_NAME_LENGTH = 12;
const PASS_START_BONUS = 50000;

interface PlayerState {
  id: number;
  preset: CharacterPreset;
  position: number;
  money: number; // cash
  shares: number; // stock / company shares value
  property: number; // home value
  hasInsurance: boolean;
  isHuman: boolean;
}

// The human always plays seat 0 (with the chosen look + name); the other three looks become CPU players.
const buildPlayers = (avatarIdx: number, name: string, insured: boolean[] = [false, false, false, false]): PlayerState[] => {
  const human = { ...CHARACTER_MODELS[avatarIdx], name: name.trim() || '你' };
  const cpus = CHARACTER_MODELS.filter((_, i) => i !== avatarIdx);
  return [human, ...cpus].map((preset, idx) => ({
    id: idx,
    preset,
    position: 0,
    money: insured[idx] ? STARTING_MONEY - INSURANCE_PREMIUM : STARTING_MONEY,
    shares: 0,
    property: 0,
    hasInsurance: insured[idx],
    isHuman: idx === 0,
  }));
};

const INITIAL_PLAYERS: PlayerState[] = buildPlayers(0, CHARACTER_MODELS[0].name);

// Slight 2x2 offset (%) on a tile so 4 characters standing on the same tile never overlap
const PLAYER_TILE_OFFSETS: [number, number][] = [
  [-2.9, -2.7],
  [2.9, -2.7],
  [-2.9, 2.7],
  [2.9, 2.7],
];

// CPU decision helpers
const CPU_THINK_MS = 1200;
const CPU_READ_RESULT_MS = 3800;
const NOTICE_MS_CPU = 1900;
const NOTICE_MS_HUMAN = 3000;
const MONEY_FLOAT_MS = 1700;

// ==========================================
// 8. ASSET STATS, FLOATING +/- NUMBERS & CENTER NOTICES
// ==========================================
type StatKey = 'cash' | 'shares' | 'total';
interface PlayerStats {
  cash: number;
  property: number;
  shares: number;
  total: number;
}
interface MoneyFloat {
  id: number;
  playerIdx: number;
  stat: StatKey;
  delta: number;
}
interface TileNotice {
  icon: string;
  color: string;
  kicker: string;
  title: string;
  desc: string;
  effect?: TileEffect;
}

const HUD_STATS: { key: StatKey; icon: string; label: string }[] = [
  { key: 'cash', icon: '💰', label: '現金' },
  { key: 'shares', icon: '📈', label: '股份' },
  { key: 'total', icon: '🏦', label: '總資產' },
];

const fmtDelta = (n: number) => `${n >= 0 ? '+' : '-'}${Math.abs(n).toLocaleString()}`;
const fmtWan = (n: number) => {
  const w = n / 10000;
  return `${Number.isInteger(w) ? w : w.toFixed(1)}萬`;
};

// 大富翁-style pop-up window: blue frame, orange title tab, picture area on top
function GameDialog({
  title,
  color,
  scene,
  children,
}: {
  title: string;
  color: string;
  scene: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[300px] my-auto pt-5 animate-card-in" onClick={(e) => e.stopPropagation()}>
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 max-w-[90%] truncate px-5 py-1 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-[3px] border-white text-white font-black text-[15px] shadow-[0_3px_0_rgba(154,52,18,0.35)] whitespace-nowrap drop-shadow-[0_1px_0_rgba(154,52,18,0.5)]">
        {title}
      </div>
      <div className="rounded-[28px] bg-gradient-to-b from-sky-300 to-sky-500 p-1.5 border-[3px] border-white shadow-[0_10px_24px_rgba(14,116,180,0.45)]">
        <div className="rounded-[22px] bg-[#f7fcff] overflow-hidden">
          <div
            style={{ background: `linear-gradient(180deg, ${color}26 0%, ${color}59 100%)` }}
            className="relative h-36 flex items-end justify-center gap-4 pb-4 pt-7 overflow-hidden"
          >
            <div className="absolute inset-x-0 bottom-0 h-10 bg-white/55 rounded-t-[50%]" />
            {scene}
          </div>
          <div className="px-4 pt-3 pb-4 text-center space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [players, setPlayers] = useState<PlayerState[]>(INITIAL_PLAYERS);
  const [activeTurnIdx, setActiveTurnIdx] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const maxTurns = 12; // 3 full rounds for 4 players
  const [hasRolled, setHasRolled] = useState(false);

  const [diceRoll, setDiceRoll] = useState(3);
  const [spinCount, setSpinCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [hopProgress, setHopProgress] = useState(0);
  const [logMessage, setLogMessage] = useState('建立你的角色，準備出發！');

  // Opening setup: choose a look + name, then decide on insurance
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [setupStep, setSetupStep] = useState<'profile' | 'summary'>('profile');
  const [playerName, setPlayerName] = useState('');
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [insuranceChoices, setInsuranceChoices] = useState<boolean[]>([false, false, false, false]);

  const [cameraMode, setCameraMode] = useState<'iso' | 'closeup' | 'top'>('iso');
  const [isDragging, setIsDragging] = useState(false);
  const [customRotZ, setCustomRotZ] = useState(-8);
  const [customRotX, setCustomRotX] = useState(32);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const [isHighlightCar, setIsHighlightCar] = useState(false);
  const [pendingBuyTile, setPendingBuyTile] = useState<BoardTile | null>(null);
  const [tileNotice, setTileNotice] = useState<TileNotice | null>(null);

  // Chance Card Modal States
  const [chanceModalStep, setChanceModalStep] = useState<'closed' | 'pick' | 'animating' | 'revealed'>('closed');
  const [drawnChanceCard, setDrawnChanceCard] = useState<ChanceCard | null>(null);

  // Final Winner Settlement Modal State
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Floating "+12,000 / -25,000" numbers shown above the asset stats
  const [moneyFloats, setMoneyFloats] = useState<MoneyFloat[]>([]);
  const prevStatsRef = useRef<PlayerStats[] | null>(null);
  const prevPhaseRef = useRef(gamePhase);
  const floatIdRef = useRef(0);

  const currentPlayer = players[activeTurnIdx];
  const currentTile = BOARD_TILES[currentPlayer.position];
  const isHumanTurn = currentPlayer.isHuman;
  const gameOver = turnCount >= maxTurns;

  // Cash + shares + home value for any player
  const getPlayerStats = (playerIdx: number, playerList = players): PlayerStats => {
    const p = playerList[playerIdx];
    return { cash: p.money, property: p.property, shares: p.shares, total: p.money + p.property + p.shares };
  };

  const allStats = players.map((_, i) => getPlayerStats(i));
  const currentStats = allStats[activeTurnIdx];

  // Spawn a floating +/- number whenever a player's cash / shares / total change
  useEffect(() => {
    const prev = prevStatsRef.current;
    const wasPlaying = prevPhaseRef.current === 'playing';
    prevStatsRef.current = allStats;
    prevPhaseRef.current = gamePhase;
    if (!prev || !wasPlaying || gamePhase !== 'playing') return;

    const added: MoneyFloat[] = [];
    allStats.forEach((s, i) => {
      HUD_STATS.forEach(({ key }) => {
        const delta = s[key] - (prev[i]?.[key] ?? s[key]);
        if (delta !== 0) added.push({ id: ++floatIdRef.current, playerIdx: i, stat: key, delta });
      });
    });
    if (!added.length) return;
    setMoneyFloats((f) => [...f, ...added]);
    const ids = new Set(added.map((a) => a.id));
    setTimeout(() => setMoneyFloats((f) => f.filter((x) => !ids.has(x.id))), MONEY_FLOAT_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, gamePhase]);

  const getCharacterFacingAngleZ = (pos: number) => {
    const side = BOARD_SIZE - 1;
    if (pos < side) return 90;
    if (pos < side * 2) return 0;
    if (pos < side * 3) return -90;
    return 180;
  };

  const turnPrompt = (p: PlayerState) => (p.isHuman ? `輪到你了，${p.preset.name}！按 GO 擲骰子` : `🤖 輪到 ${p.preset.name}…`);

  // Advance to the next player's turn (or trigger final settlement if maxTurns reached)
  const advanceTurn = (nextTurnCount = turnCount + 1) => {
    setPendingBuyTile(null);
    setTileNotice(null);
    setHasRolled(false);
    setTurnCount(nextTurnCount);
    if (nextTurnCount >= maxTurns) {
      setShowSettlementModal(true);
      setLogMessage('🏆 遊戲結束！來看看誰最有錢！');
      return;
    }
    const nextIdx = (activeTurnIdx + 1) % players.length;
    setActiveTurnIdx(nextIdx);
    setLogMessage(turnPrompt(players[nextIdx]));
  };

  const showNotice = (n: TileNotice) => {
    setTileNotice(n);
    setLogMessage(`${n.icon} ${n.title}`);
  };

  const handleCloseNotice = () => {
    if (!tileNotice) return;
    setTileNotice(null);
    advanceTurn();
  };

  const rollDiceAndMove = (byCpu = false) => {
    if (gamePhase !== 'playing' || gameOver || hasRolled || isRolling || isWalking || chanceModalStep !== 'closed' || showSettlementModal) return;
    if (pendingBuyTile || tileNotice) return;
    if (!byCpu && !currentPlayer.isHuman) return;
    setHasRolled(true);
    setPendingBuyTile(null);
    setIsRolling(true);
    setSpinCount((prev) => prev + 1);
    setLogMessage(`🎲 ${currentPlayer.preset.name} 擲骰子中…`);

    // Make it easy for the human to hit a Chance tile, then the Car Crash tile, on early rolls
    let targetSteps = Math.floor(Math.random() * 6) + 1;
    if (currentPlayer.position === 0 && activeTurnIdx === 0) targetSteps = FIRST_CHANCE_TILE;
    else if (currentPlayer.position === FIRST_CHANCE_TILE && activeTurnIdx === 0) targetSteps = CAR_CRASH_TILE - FIRST_CHANCE_TILE;

    setDiceRoll(targetSteps);

    setTimeout(() => {
      setIsRolling(false);
      setLogMessage(`🎲 ${currentPlayer.preset.name} 擲出 ${targetSteps} 點！`);
      startStepByStepHopping(targetSteps);
    }, 750);
  };

  const startStepByStepHopping = (steps: number) => {
    setIsWalking(true);
    let currentStepCount = 0;
    let curr = currentPlayer.position;

    const performSingleHop = () => {
      setHopProgress(1);
      setTimeout(() => {
        curr = (curr + 1) % BOARD_TILES.length;
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === activeTurnIdx
              ? { ...p, position: curr, money: curr === 0 ? p.money + PASS_START_BONUS : p.money }
              : p
          )
        );
        currentStepCount++;

        if (curr === 0) {
          setLogMessage(`🎂 ${currentPlayer.preset.name} 經過起點過生日！紅包 +$${PASS_START_BONUS.toLocaleString()}`);
        }

        setTimeout(() => {
          setHopProgress(0);
          if (currentStepCount < steps) {
            setTimeout(performSingleHop, 85);
          } else {
            setIsWalking(false);
            handleTileLanded(curr);
          }
        }, 130);
      }, 130);
    };

    performSingleHop();
  };

  const handleTileLanded = (tileIndex: number) => {
    const tile = BOARD_TILES[tileIndex];
    const pName = currentPlayer.preset.name;

    if (tile.type === 'CHANCE') {
      setLogMessage(`🃏 ${pName} 踩到機會卡！抽一張吧`);
      setChanceModalStep('pick');
      return;
    }

    if (tile.type === 'RISK') {
      setIsHighlightCar(true);
      runEvent(CHANCE_CARDS.find((c) => c.scene === 'car')!);
      return;
    }

    if (tile.type === 'INSURANCE') {
      if (!currentPlayer.hasInsurance && tile.price && currentPlayer.money >= tile.price) {
        setPendingBuyTile(tile);
        setLogMessage(`🛡️ ${pName} 來到保障規劃站，要投保法巴保險嗎？`);
      } else {
        showNotice({
          icon: '🛡️',
          color: tile.color,
          kicker: tile.name,
          title: currentPlayer.hasInsurance ? '保障持續有效！' : '現金不足，無法投保',
          desc: currentPlayer.hasInsurance
            ? `${pName} 檢視了保單，法巴保障一切正常。`
            : `${pName} 的現金不夠支付保費，下次再來吧…`,
        });
      }
      return;
    }

    if (tile.effect) {
      const { cash = 0, shares = 0, property = 0 } = tile.effect;
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activeTurnIdx
            ? { ...p, money: p.money + cash, shares: p.shares + shares, property: p.property + property }
            : p
        )
      );
      const net = cash + shares + property;
      showNotice({
        icon: tile.icon,
        color: tile.color,
        kicker: tile.type === 'CORNER' ? '人生里程碑' : '人生階段',
        title: tile.name,
        desc: `${pName} ${tile.landMsg ?? `來到${tile.name}`}！`,
        effect: tile.effect,
      });
      setLogMessage(`${tile.icon} ${pName}：${tile.name}（總資產 ${fmtDelta(net)}）`);
      return;
    }

    showNotice({
      icon: tile.icon,
      color: tile.color,
      kicker: '起點',
      title: '生日快樂！',
      desc: `${pName} 剛好停在起點，又長大一歲了 🎂`,
    });
  };

  // Pick a Chance Card -> play the event animation -> reveal result
  const handlePickChanceCard = () => {
    runEvent(CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)]);
  };

  const runEvent = (randomCard: ChanceCard) => {
    setDrawnChanceCard(randomCard);
    setChanceModalStep('animating');
    setLogMessage(`${randomCard.icon} ${currentPlayer.preset.name}：${randomCard.title}`);

    const bonus = currentPlayer.hasInsurance && randomCard.insuredBonus ? randomCard.insuredBonus : 0;
    const netDelta = randomCard.deltaMoney + bonus;

    setTimeout(() => {
      setChanceModalStep('revealed');
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money + netDelta } : p))
      );
      setLogMessage(`${randomCard.icon} ${currentPlayer.preset.name}：${randomCard.title}（${fmtDelta(netDelta)}）`);
    }, EVENT_SCENE_MS);
  };

  const handleCloseChanceModal = () => {
    setChanceModalStep('closed');
    setDrawnChanceCard(null);
    setIsHighlightCar(false);
    advanceTurn();
  };

  const handleBuyInsurance = () => {
    if (!pendingBuyTile || !pendingBuyTile.price) return;
    const tile = pendingBuyTile;
    const price = tile.price!;
    setPendingBuyTile(null);
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money - price, hasInsurance: true } : p))
    );
    showNotice({
      icon: '🛡️',
      color: tile.color,
      kicker: tile.name,
      title: '投保成功！',
      desc: `${currentPlayer.preset.name} 加入法巴保障，之後遇到意外都有理賠！`,
      effect: { cash: -price },
    });
  };

  const handleSkipBuy = () => {
    if (!pendingBuyTile) return;
    setLogMessage(`⏭️ ${currentPlayer.preset.name} 暫時不投保`);
    setPendingBuyTile(null);
    setTimeout(() => advanceTurn(), 500);
  };

  // Center notice auto-closes (the human can also tap to continue)
  useEffect(() => {
    if (!tileNotice) return;
    const timer = setTimeout(handleCloseNotice, isHumanTurn ? NOTICE_MS_HUMAN : NOTICE_MS_CPU);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileNotice]);

  // ==========================================
  // CPU PLAYERS: act automatically on their turn
  // ==========================================
  useEffect(() => {
    if (gamePhase !== 'playing' || isHumanTurn || gameOver || showSettlementModal) return;
    if (isRolling || isWalking || chanceModalStep === 'animating' || tileNotice) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (chanceModalStep === 'pick') {
      timer = setTimeout(handlePickChanceCard, CPU_THINK_MS);
    } else if (chanceModalStep === 'revealed') {
      timer = setTimeout(handleCloseChanceModal, CPU_READ_RESULT_MS);
    } else if (pendingBuyTile) {
      timer = setTimeout(() => {
        if (Math.random() < 0.5) handleBuyInsurance();
        else handleSkipBuy();
      }, CPU_THINK_MS + 400);
    } else if (!hasRolled) {
      timer = setTimeout(() => rollDiceAndMove(true), CPU_THINK_MS);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, activeTurnIdx, isHumanTurn, gameOver, showSettlementModal, isRolling, isWalking, chanceModalStep, pendingBuyTile, tileNotice, hasRolled]);

  // Setup: confirm profile + insurance; CPU players decide on insurance at random
  const handleSetupChoice = (buy: boolean) => {
    setInsuranceChoices([buy, Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5]);
    setSetupStep('summary');
  };

  const setupPlayers = buildPlayers(avatarIdx, playerName, insuranceChoices);

  const handleStartGame = () => {
    setPlayers(setupPlayers);
    setGamePhase('playing');
    setLogMessage(`輪到你了，${setupPlayers[0].preset.name}！按 GO 開始人生旅程`);
  };

  const handleReset = () => {
    setGamePhase('setup');
    setSetupStep('profile');
    setInsuranceChoices([false, false, false, false]);
    setPlayers(INITIAL_PLAYERS);
    setActiveTurnIdx(0);
    setTurnCount(0);
    setHasRolled(false);
    setDiceRoll(3);
    setIsRolling(false);
    setIsWalking(false);
    setHopProgress(0);
    setPendingBuyTile(null);
    setTileNotice(null);
    setChanceModalStep('closed');
    setDrawnChanceCard(null);
    setShowSettlementModal(false);
    setIsHighlightCar(false);
    setMoneyFloats([]);
    setLogMessage('建立你的角色，準備出發！');
  };

  const getBoard3DTransform = () => {
    if (cameraMode === 'top') {
      return `rotateX(16deg) rotateZ(0deg) scale(0.98)`;
    }
    if (cameraMode === 'closeup') {
      const mid = (BOARD_SIZE - 1) / 2;
      const offsetX = (mid - currentTile.col) * 20;
      const offsetY = (mid - currentTile.row) * 20;
      return `rotateX(58deg) rotateZ(${customRotZ}deg) scale(1.3) translate3d(${offsetX}px, ${offsetY}px, 0px)`;
    }
    return `rotateX(${customRotX}deg) rotateZ(${customRotZ}deg) scale(0.9)`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (cameraMode === 'top') return;
    isDraggingRef.current = true;
    setIsDragging(true);
    lastMouseXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    setCustomRotZ((prev) => Math.max(-65, Math.min(35, prev + deltaX * 0.4)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // Ranked players for Final Winner Settlement
  const rankedPlayers = [...players]
    .map((p, idx) => ({
      ...p,
      stats: allStats[idx],
      totalAssets: allStats[idx].total,
    }))
    .sort((a, b) => b.totalAssets - a.totalAssets);

  const canDrawDemoCard =
    gamePhase === 'playing' && isHumanTurn && !gameOver && !hasRolled && !isWalking && !isRolling && chanceModalStep === 'closed' && !tileNotice && !pendingBuyTile;

  const canRoll =
    gamePhase === 'playing' && isHumanTurn && !gameOver && !hasRolled && !isRolling && !isWalking && chanceModalStep === 'closed' && !pendingBuyTile && !tileNotice && !showSettlementModal;

  const floatsFor = (playerIdx: number, stat: StatKey) =>
    moneyFloats.filter((f) => f.playerIdx === playerIdx && f.stat === stat);

  // Shared overlay: dims the board but leaves the bottom asset bar visible
  const overlayClass = 'absolute inset-0 bg-sky-950/50 z-50 flex items-start justify-center px-4 pt-4 pb-[118px] overflow-y-auto';

  return (
    <div
      className="min-h-[100dvh] text-[#0c4a6e] flex items-center justify-center p-2 max-sm:p-0 font-sans select-none overflow-hidden"
      onPointerUp={handlePointerUp}
    >
      {/* ======================================================== */}
      {/* SMARTPHONE FRAME CONTAINER (Light Blue Sky Theme)         */}
      {/* ======================================================== */}
      <div className="relative w-[393px] h-[852px] max-sm:w-full max-sm:h-[100dvh] max-sm:rounded-none max-sm:border-0 max-sm:shadow-none bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#dbeefe] rounded-[52px] border-[7px] border-white shadow-[0_0_0_3px_#bfe3f7,0_25px_60px_-15px_rgba(14,116,180,0.4)] p-3 flex flex-col justify-between overflow-hidden isolate">

        {/* Soft Daylight Sun & Cloud Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.5),transparent)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.4),transparent)] pointer-events-none" />

        {/* ======================================================== */}
        {/* TOP: 4-PLAYER LIVE SCOREBOARD                            */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center z-40">
          <div className="w-full grid grid-cols-4 gap-1 px-0.5 mt-1.5">
            {players.map((p, idx) => {
              const isTurn = activeTurnIdx === idx;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl px-1.5 py-1 border-2 transition flex flex-col justify-between ${
                    isTurn
                      ? 'bg-white border-sky-400 shadow-md scale-[1.04]'
                      : 'bg-white/70 border-white opacity-85'
                  }`}
                >
                  <div className="flex items-center justify-between gap-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <ChibiAvatar preset={p.preset} size={18} />
                      <span className="text-[10px] font-black text-[#0c4a6e] truncate">{p.preset.name}</span>
                    </div>
                    {p.hasInsurance && (
                      <span title="法巴保戶" className="text-[9px]">🛡️</span>
                    )}
                  </div>
                  <div className="text-[10px] font-extrabold text-[#2f6f9a] mt-0.5 flex items-center justify-between">
                    <span>${fmtWan(allStats[idx].total)}</span>
                    <span
                      className={`text-[8px] px-1 rounded-full ${
                        p.isHuman ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'
                      }`}
                    >
                      {p.isHuman ? '你' : '電腦'}
                    </span>
                  </div>
                  {/* Small floating total-asset change on each player chip */}
                  {floatsFor(idx, 'total').map((f, i) => (
                    <span
                      key={f.id}
                      style={{ top: `${-6 - i * 13}px` }}
                      className={`money-float money-float-sm ${f.delta >= 0 ? 'money-up' : 'money-down'}`}
                    >
                      {f.delta >= 0 ? '+' : '-'}{fmtWan(Math.abs(f.delta))}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Camera Mode Pills */}
          <div className="w-full flex items-center justify-between gap-1 px-1 mt-1">
            <div className="flex items-center bg-white/90 p-0.5 rounded-full border-2 border-white shadow-xs text-[9.5px]">
              <button
                onClick={() => { setCameraMode('iso'); setCustomRotX(32); setCustomRotZ(-8); }}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'iso' ? 'bg-sky-400 text-white' : 'text-[#2f6f9a]'
                }`}
              >
                3D 城市
              </button>
              <button
                onClick={() => setCameraMode('closeup')}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'closeup' ? 'bg-sky-400 text-white' : 'text-[#2f6f9a]'
                }`}
              >
                近景
              </button>
              <button
                onClick={() => setCameraMode('top')}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'top' ? 'bg-sky-400 text-white' : 'text-[#2f6f9a]'
                }`}
              >
                俯視
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSettlementModal(true)}
                className="px-2.5 py-1 rounded-full bg-sky-200 hover:bg-sky-100 text-[#0c4a6e] font-black text-[10px] btn-pop flex items-center gap-1 cursor-pointer transition"
              >
                🏆 第 {Math.min(turnCount + 1, maxTurns)}/{maxTurns} 回合
              </button>
              <button
                onClick={handleReset}
                aria-label="重新開始"
                title="重新開始"
                className="w-6 h-6 rounded-full bg-white/90 text-[#2f6f9a] border-2 border-white btn-pop flex items-center justify-center cursor-pointer"
              >
                <Icons.RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER STAGE: 3D LIFE-JOURNEY BOARD                      */}
        {/* ======================================================== */}
        <div
          className="relative my-auto w-full h-[500px] flex items-center justify-center scene-perspective overflow-visible cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerUp}
        >
          {/* Island Base */}
          <div
            style={{ transform: getBoard3DTransform() }}
            className={`w-full aspect-square shrink-0 bg-gradient-to-br from-sky-200 via-sky-100 to-cyan-200 rounded-[32px] p-2.5 border-4 border-white board-slab-3d ${isDragging ? '' : 'transition-transform duration-500 ease-out'} relative`}
          >
            <div style={{ transform: "translateZ(1px)" }} className="grid grid-cols-7 grid-rows-7 gap-1 w-full h-full relative preserve-3d">
              {BOARD_TILES.map((tile) => {
                const isHere = currentPlayer.position === tile.id;
                const isAccident = tile.id === CAR_CRASH_TILE;
                const isChance = tile.type === 'CHANCE';
                // Net change to total assets when landing here (cash + shares + home)
                const tileNet = tile.effect
                  ? (tile.effect.cash ?? 0) + (tile.effect.shares ?? 0) + (tile.effect.property ?? 0)
                  : 0;
                // Names of 4+ characters go on two lines: 4 → 2+2, 5 → 3+2
                const nameChars = [...tile.name];
                const nameLines =
                  nameChars.length >= 4
                    ? [nameChars.slice(0, Math.ceil(nameChars.length / 2)).join(''), nameChars.slice(Math.ceil(nameChars.length / 2)).join('')]
                    : [tile.name];
                const compact = tileNet !== 0 || nameLines.length > 1;

                return (
                  <div
                    key={tile.id}
                    style={{ gridArea: tile.gridArea }}
                    className={`relative rounded-2xl flex flex-col justify-between ${compact ? 'p-0.5' : 'p-1'} transition-all duration-300 border-2 ${
                      isHere
                        ? 'bg-gradient-to-b from-sky-100 to-white border-sky-400 tile-3d-active z-20'
                        : isAccident && isHighlightCar
                        ? 'bg-gradient-to-b from-red-100 to-red-50 border-red-500 tile-3d-danger animate-danger-pulse'
                        : isChance
                        ? 'bg-gradient-to-b from-amber-200 to-yellow-100 border-amber-400 tile-3d'
                        : 'bg-white border-white tile-3d'
                    }`}
                  >
                    {/* Color Header */}
                    <div className={`w-full ${compact ? 'h-1.5' : 'h-2'} rounded-full shadow-xs shrink-0`} style={{ backgroundColor: tile.color }} />

                    {/* Icon + Name + asset change badge */}
                    <div className="flex flex-col items-center justify-center flex-1 min-h-0 text-center">
                      <span className={`${compact ? 'text-[11px]' : 'text-sm mb-0.5'} leading-none`}>{tile.icon}</span>
                      <span
                        className={`font-extrabold leading-[1.05] tracking-tight ${
                          isChance ? 'text-[10px] text-amber-700' : 'text-[9px] text-[#0c4a6e]'
                        }`}
                      >
                        {nameLines.map((line, i) => (
                          <span key={i} className="block whitespace-nowrap">{line}</span>
                        ))}
                      </span>
                      {tileNet !== 0 && (
                        <span
                          className={`mt-px px-1 rounded-full text-[7.5px] font-black leading-[1.3] tracking-tighter whitespace-nowrap text-white ${
                            tileNet > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        >
                          {tileNet > 0 ? '+' : '-'}{fmtWan(Math.abs(tileNet))}
                        </span>
                      )}
                    </div>

                    {/* Crosswalk Detail (roomy tiles only) */}
                    {!compact && <div className="w-full h-1 bg-[#bfe3f7] rounded-full flex justify-around items-center px-1">
                      <span className="w-1 h-0.5 bg-white" />
                      <span className="w-1 h-0.5 bg-white" />
                      <span className="w-1 h-0.5 bg-white" />
                    </div>}
                  </div>
                );
              })}

              {/* ======================================================== */}
              {/* CENTRAL PLAZA                                            */}
              {/* ======================================================== */}
              <div
                style={{ gridArea: `2 / 2 / ${BOARD_SIZE} / ${BOARD_SIZE}` }}
                className="bg-gradient-to-br from-[#e0f2fe] via-white to-[#dff1fb] rounded-3xl p-2.5 border-4 border-white flex flex-col justify-between items-center text-center shadow-[inset_0_4px_15px_rgba(14,165,233,0.25)] relative preserve-3d"
              >
                <div style={{ transform: "translateZ(6px)" }} className="text-[13px] font-black text-[#0c4a6e] tracking-wide">
                  🏝️ CARDIF ISLAND
                </div>
                <div
                  style={{ transform: "translateZ(6px)" }}
                  className="bg-white rounded-full py-1 px-3 border-2 border-[#bfe3f7] shadow-sm flex items-center gap-1.5 text-[10px] font-extrabold text-[#2f6f9a]"
                >
                  <ChibiAvatar preset={currentPlayer.preset} size={16} />
                  輪到 {currentPlayer.preset.name}
                  {!isHumanTurn && <span>🤖</span>}
                </div>
              </div>

              {/* ======================================================== */}
              {/* TOP-LEVEL 3D DICE                                        */}
              {/* ======================================================== */}
              <div
                style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
                className="absolute preserve-3d z-50"
              >
                <True3DDice
                  value={diceRoll}
                  isRolling={isRolling}
                  spinCount={spinCount}
                  onClick={() => rollDiceAndMove()}
                />
              </div>

              {/* ======================================================== */}
              {/* ALL 4 3D CHARACTERS ON THE BOARD                         */}
              {/* ======================================================== */}
              {players.map((p, idx) => {
                const tile = BOARD_TILES[p.position];
                const isTurn = activeTurnIdx === idx;
                const [offX, offY] = PLAYER_TILE_OFFSETS[idx];
                const cell = 100 / BOARD_SIZE;
                const leftPct = (tile.col + 0.5) * cell + (isTurn ? 0 : offX);
                const topPct = (tile.row + 0.5) * cell + (isTurn ? 0 : offY);
                const charJumpZ = isTurn && hopProgress ? 36 : 12;

                return (
                  <div
                    key={p.id}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      transform: `translate(-50%, -50%) translateZ(${charJumpZ}px)`,
                    }}
                    className={`absolute w-12 h-12 pointer-events-none transition-all duration-250 ease-out preserve-3d flex items-center justify-center ${
                      isTurn ? 'z-45' : 'z-35'
                    }`}
                  >
                    <div
                      style={{
                        transform: `translateZ(${-charJumpZ + 2}px) scale(${isTurn && hopProgress ? 0.55 : 0.85})`,
                      }}
                      className="absolute w-7 h-4 rounded-full bg-[radial-gradient(closest-side,rgba(15,23,42,0.45),transparent)] transition-transform duration-150"
                    />
                    {isTurn && (
                      <div className="absolute w-10 h-10 rounded-full border-2 border-sky-400 bg-sky-300/30" />
                    )}

                    <True3DCharacter
                      preset={p.preset}
                      isWalking={isTurn && isWalking}
                      facingAngleZ={getCharacterFacingAngleZ(p.position)}
                      isShocked={p.position === CAR_CRASH_TILE && isHighlightCar}
                      scale={isTurn ? 1.02 : 0.78}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER POP-UP: INSURANCE DECISION                        */}
        {/* ======================================================== */}
        {pendingBuyTile && (
          <div className={overlayClass}>
            <GameDialog
              title={pendingBuyTile.name}
              color={pendingBuyTile.color}
              scene={
                <>
                  <div className="relative" style={anim('evBob', 1.1, 0, {}, 'ease-in-out', 'infinite')}>
                    <ChibiAvatar preset={currentPlayer.preset} size={58} />
                  </div>
                  <span className="relative text-6xl" style={anim('evShieldDrop', 0.7, 0.1)}>🛡️</span>
                </>
              }
            >
              <p className="text-sm font-bold text-[#0c4a6e] leading-relaxed">
                {isHumanTurn
                  ? <>要花 <b className="text-orange-500">${(pendingBuyTile.price ?? 0).toLocaleString()}</b> 投保法巴保險嗎？<br /><span className="text-[11px] text-[#4a8ab5]">意外・醫療・居家都有理賠</span></>
                  : `🤖 ${currentPlayer.preset.name} 正在考慮要不要投保…`}
              </p>
              {isHumanTurn && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSkipBuy}
                    className="py-2.5 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-sm btn-pop cursor-pointer"
                  >
                    先不要
                  </button>
                  <button
                    onClick={handleBuyInsurance}
                    className="py-2.5 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white text-white font-black text-sm btn-pop cursor-pointer"
                  >
                    投保 🛡️
                  </button>
                </div>
              )}
            </GameDialog>
          </div>
        )}

        {/* ======================================================== */}
        {/* CENTER POP-UP: TILE EVENT NOTICE                         */}
        {/* ======================================================== */}
        {tileNotice && (() => {
          const e = tileNotice.effect;
          const isLoss = !!e && (e.cash ?? 0) + (e.shares ?? 0) + (e.property ?? 0) < 0;
          return (
            <div className={overlayClass} onClick={handleCloseNotice}>
              <GameDialog
                title={tileNotice.title}
                color={tileNotice.color}
                scene={
                  <>
                    <div className="relative" style={anim('evBob', 1.1, 0, {}, 'ease-in-out', 'infinite')}>
                      <ChibiAvatar preset={currentPlayer.preset} size={58} mood={isLoss ? 'sad' : 'happy'} />
                    </div>
                    <span className="relative text-6xl" style={anim('evPop', 0.5, 0.1)}>{tileNotice.icon}</span>
                    {(isLoss ? ['💸', '💸'] : ['✨', '🎉']).map((fx, i) => (
                      <span
                        key={i}
                        style={{ left: i ? '78%' : '14%', top: i ? '18%' : '26%', ...anim('evPop', 0.4, 0.35 + i * 0.2) }}
                        className="absolute text-2xl"
                      >
                        {fx}
                      </span>
                    ))}
                  </>
                }
              >
                <div className="text-[10px] font-black text-sky-500 tracking-wider">{tileNotice.kicker}</div>
                <p className="text-sm font-bold text-[#0c4a6e] leading-relaxed">{tileNotice.desc}</p>
                {/* Big animated asset-change numbers in the middle of the screen */}
                {e && (
                  <div className="flex flex-col items-center gap-1">
                    {([
                      ['cash', '💰 現金'],
                      ['shares', '📈 股份'],
                      ['property', '🏠 房產'],
                    ] as const)
                      .filter(([k]) => e[k])
                      .map(([k, label], i) => {
                        const v = e[k]!;
                        return (
                          <div key={k} className="center-money" style={{ animationDelay: `${0.25 + i * 0.2}s` }}>
                            <span className="text-[11px] font-black text-[#4a8ab5] mr-1.5">{label}</span>
                            <span className={`text-[26px] font-black tabular-nums ${v >= 0 ? 'money-up' : 'money-down'}`}>
                              {fmtDelta(v)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
                {isHumanTurn ? (
                  <button
                    onClick={handleCloseNotice}
                    className="w-full py-2 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white text-white font-black text-sm btn-pop cursor-pointer"
                  >
                    確定
                  </button>
                ) : (
                  <div className="text-[10px] text-[#7fb0cf]">自動繼續…</div>
                )}
              </GameDialog>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* CHANCE CARD DRAW MODAL (3-Card Fan)                      */}
        {/* ======================================================== */}
        {chanceModalStep !== 'closed' && (
          <div className={overlayClass}>
            {chanceModalStep === 'pick' && (
              <div className="w-full max-w-[360px] card-cute rounded-[32px] p-5 text-center space-y-4 animate-card-in my-auto">
                <div className="text-xs font-black text-sky-500 tracking-wider">
                  ✨ 人生機會卡 ✨
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ChibiAvatar preset={currentPlayer.preset} size={38} />
                  <div className="text-base font-black text-[#0c4a6e] text-left">
                    {isHumanTurn ? (
                      <>{currentPlayer.preset.name}，<br />選一張卡看看今天發生什麼事！</>
                    ) : (
                      <>🤖 {currentPlayer.preset.name}<br />正在抽卡…</>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 py-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={handlePickChanceCard}
                      disabled={!isHumanTurn}
                      style={{ animation: `evBob 1.4s ease-in-out ${num * 0.2}s infinite` }}
                      className="h-32 rounded-3xl bg-gradient-to-br from-sky-300 via-sky-400 to-cyan-300 border-4 border-white btn-pop enabled:hover:scale-105 transition-transform flex flex-col items-center justify-center gap-1.5 enabled:cursor-pointer text-white"
                    >
                      <span className="text-3xl">🎁</span>
                      <span className="text-[11px] font-black tracking-wide drop-shadow">第 {num} 張</span>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[#4a8ab5]">
                  {currentPlayer.hasInsurance
                    ? `🛡️ ${isHumanTurn ? '你' : currentPlayer.preset.name}有法巴保險，遇到意外不用怕！`
                    : `⚠️ ${isHumanTurn ? '你' : currentPlayer.preset.name}沒有保險，遇到意外要自己付喔…`}
                </div>
              </div>
            )}

            {chanceModalStep === 'animating' && drawnChanceCard && (
              <div className="w-full max-w-[360px] card-cute rounded-[32px] p-4 text-center space-y-3 animate-card-in my-auto">
                <div className="inline-block px-3 py-0.5 rounded-full bg-sky-100 text-sky-600 text-[10px] font-black">
                  {drawnChanceCard.tag}
                </div>
                <div className="text-lg font-black text-[#0c4a6e]">{drawnChanceCard.title}</div>
                <EventScene kind={drawnChanceCard.scene} preset={currentPlayer.preset} />
                <p className="text-xs text-[#2f6f9a] leading-relaxed">{drawnChanceCard.desc}</p>
              </div>
            )}

            {chanceModalStep === 'revealed' && drawnChanceCard && (() => {
              const insured = currentPlayer.hasInsurance && !!drawnChanceCard.insuredBonus;
              const bonus = insured ? drawnChanceCard.insuredBonus! : 0;
              const total = drawnChanceCard.deltaMoney + bonus;
              const isLoss = drawnChanceCard.deltaMoney < 0;
              return (
                <div className="w-full max-w-[360px] card-cute rounded-[32px] p-4 text-center space-y-2.5 animate-card-in my-auto">
                  <div className="text-base font-black text-[#0c4a6e]">
                    {drawnChanceCard.icon} {drawnChanceCard.title}
                  </div>

                  <InsuranceOutcomeFx protectedByInsurance={insured || !isLoss} />

                  <div className={`text-sm font-black ${insured ? 'text-emerald-600' : isLoss ? 'text-rose-500' : 'text-sky-600'}`}>
                    {insured
                      ? isLoss
                        ? '還好有買保險！法巴幫你理賠 🎉'
                        : '好消息 🎉'
                      : isLoss
                      ? '沒有保險…只能自掏腰包 😢'
                      : '好消息 🎉'}
                  </div>

                  <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-xs space-y-1.5 text-left">
                    <div className="flex justify-between text-[#2f6f9a]">
                      <span>{isLoss ? '事件損失' : '事件獎勵'}</span>
                      <span className={`font-black ${isLoss ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {drawnChanceCard.deltaMoney >= 0 ? '+' : '-'}${Math.abs(drawnChanceCard.deltaMoney).toLocaleString()}
                      </span>
                    </div>
                    {drawnChanceCard.insurer ? (
                      <div className="flex justify-between gap-2 text-[#2f6f9a]">
                        <span className="leading-snug">
                          🛡️ {drawnChanceCard.insurer}
                          <br />
                          <span className="font-bold">「{drawnChanceCard.claimName}」</span>
                        </span>
                        <span className={`font-black shrink-0 ${insured ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {insured ? `+$${bonus.toLocaleString()}` : '未投保 $0'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[#2f6f9a]">
                        <span>🛡️ 保險</span>
                        <span className="font-black text-slate-400">無需理賠</span>
                      </div>
                    )}
                    {drawnChanceCard.coverage && (
                      <div className="text-[10px] text-[#4a8ab5]">保障項目：{drawnChanceCard.coverage}</div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-[#bfe3f7] text-[#0c4a6e] font-black">
                      <span>淨變化</span>
                      <span className={total >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                        {total >= 0 ? '+' : '-'}${Math.abs(total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl px-3 py-2 text-[10.5px] text-[#2f6f9a] text-left leading-snug">
                    💡 <b>理賠小知識：</b>{drawnChanceCard.tip}
                    <div className="text-[9px] text-[#7fb0cf] mt-1">
                      商品資訊參考法國巴黎人壽／產險官網。遊戲金額僅供示意，實際理賠依保單條款為準。
                    </div>
                  </div>

                  <button
                    onClick={handleCloseChanceModal}
                    className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-sm rounded-full btn-pop cursor-pointer"
                  >
                    {isHumanTurn ? '好，換下一位 ➔' : `繼續（${currentPlayer.preset.name} 回合結束）➔`}
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* BOTTOM HUD (大富翁 style): avatar • cash/shares/total • GO */}
        {/* ======================================================== */}
        <div className="relative z-[55] pt-1">
          {/* Status line + demo chance card shortcut */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex-1 min-w-0 bg-white/95 rounded-full py-1 px-3 border-2 border-white shadow-sm text-center text-[11px] font-bold text-[#0c4a6e] truncate">
              {logMessage}
            </div>
            <button
              onClick={() => {
                if (!canDrawDemoCard) return;
                setHasRolled(true);
                setPendingBuyTile(null);
                setPlayers((prev) =>
                  prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, position: FIRST_CHANCE_TILE } : p))
                );
                setChanceModalStep('pick');
              }}
              disabled={!canDrawDemoCard}
              className="shrink-0 py-1 px-2.5 bg-amber-400 enabled:hover:bg-amber-300 disabled:opacity-50 text-white rounded-full text-[10.5px] font-black btn-pop enabled:cursor-pointer"
            >
              🎁 抽機會卡
            </button>
          </div>

          <div className="relative h-[70px]">
            {/* Blue stat strip */}
            <div className="absolute left-[30px] right-[30px] bottom-1.5 h-[50px] rounded-full bg-gradient-to-b from-sky-400 to-sky-600 border-[3px] border-white shadow-[0_4px_10px_rgba(14,116,180,0.35)] flex items-center pl-[46px] pr-[46px]">
              {HUD_STATS.map(({ key, icon, label }, i) => (
                <div
                  key={key}
                  className={`relative flex-1 min-w-0 flex flex-col items-center justify-center leading-none ${
                    i > 0 ? 'border-l border-white/30' : ''
                  }`}
                >
                  <span className="text-[9px] font-bold text-sky-100 whitespace-nowrap">{icon} {label}</span>
                  <span
                    key={currentStats[key]}
                    className="stat-bump text-[12.5px] font-black text-white tabular-nums mt-1 drop-shadow-[0_1px_0_rgba(3,105,161,0.6)]"
                  >
                    {currentStats[key].toLocaleString()}
                  </span>
                  {floatsFor(activeTurnIdx, key).map((f, fi) => (
                    <span
                      key={f.id}
                      style={{ bottom: `calc(100% + ${10 + fi * 18}px)` }}
                      className={`money-float ${f.delta >= 0 ? 'money-up' : 'money-down'}`}
                    >
                      {fmtDelta(f.delta)}
                    </span>
                  ))}
                </div>
              ))}
            </div>

            {/* Current player's avatar badge */}
            <div key={activeTurnIdx} className="absolute left-0 bottom-0 animate-card-in">
              <div
                style={{ background: `radial-gradient(circle at 50% 35%, #fff7d6, ${currentPlayer.preset.suitColor})` }}
                className="w-[70px] h-[70px] rounded-full border-[3px] border-white shadow-[0_4px_10px_rgba(14,116,180,0.35)] flex items-end justify-center overflow-hidden"
              >
                <ChibiAvatar preset={currentPlayer.preset} size={52} />
              </div>
              {currentPlayer.hasInsurance && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[11px]" title="法巴保戶">
                  🛡️
                </span>
              )}
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 max-w-[78px] truncate px-2 rounded-full bg-sky-700 border-2 border-white text-white text-[10px] font-black whitespace-nowrap">
                {currentPlayer.preset.name}
              </span>
            </div>

            {/* GO dice button */}
            <button
              onClick={() => rollDiceAndMove()}
              disabled={!canRoll}
              aria-label="擲骰子"
              className={`absolute right-0 bottom-0 w-[70px] h-[70px] rounded-full border-[3px] border-white shadow-[0_4px_10px_rgba(194,65,12,0.4)] bg-gradient-to-b from-amber-300 via-orange-400 to-orange-500 disabled:from-slate-200 disabled:via-slate-300 disabled:to-slate-400 flex flex-col items-center justify-center text-white btn-pop enabled:cursor-pointer ${canRoll ? 'go-pulse' : ''}`}
            >
              <span className="text-xl leading-none">🎲</span>
              <span className="text-[17px] font-black italic leading-none drop-shadow-[0_2px_0_rgba(154,52,18,0.6)]">
                {isRolling ? '…' : 'GO'}
              </span>
              <span className="text-[8px] font-bold leading-none mt-0.5">
                {gameOver ? '結束' : !isHumanTurn ? '電腦回合' : canRoll ? '擲骰子' : '等待中'}
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* OPENING: CREATE YOUR CHARACTER & CHOOSE INSURANCE        */}
        {/* ======================================================== */}
        {gamePhase === 'setup' && (
          <div className="absolute inset-0 z-[60] bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#e6f6fd] flex flex-col items-center justify-center p-5 rounded-[44px] max-sm:rounded-none overflow-y-auto">
            <div className="text-center mb-4">
              <div className="text-3xl mb-1">🏝️🎲</div>
              <div className="text-xl font-black text-[#0c4a6e]">CARDIF ISLAND</div>
              <div className="text-[11px] text-[#4a8ab5] mt-0.5">人生旅程大富翁，出發前先把保障準備好！</div>
            </div>

            {setupStep === 'profile' ? (
              <div className="w-full max-w-[350px] card-cute rounded-[32px] p-5 text-center space-y-3.5 animate-card-in">
                <div className="flex justify-center" style={{ animation: 'evBob 1.2s ease-in-out infinite' }}>
                  <ChibiAvatar preset={CHARACTER_MODELS[avatarIdx]} size={72} />
                </div>

                {/* Avatar picker */}
                <div className="flex justify-center gap-2">
                  {CHARACTER_MODELS.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setAvatarIdx(i)}
                      aria-label={`選擇造型 ${i + 1}`}
                      className={`p-1 rounded-2xl border-2 transition cursor-pointer ${
                        i === avatarIdx ? 'border-sky-400 bg-sky-50 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ChibiAvatar preset={m} size={34} />
                    </button>
                  ))}
                </div>

                {/* Name input */}
                <label className="block text-left">
                  <span className="text-[11px] font-black text-[#2f6f9a]">你的名字</span>
                  <input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                    placeholder="輸入你的名字"
                    maxLength={MAX_NAME_LENGTH}
                    className="mt-1 w-full rounded-full border-2 border-[#bfe3f7] bg-white px-4 py-2 text-sm font-bold text-[#0c4a6e] placeholder:text-[#9cc7e2] outline-none focus:border-sky-400 select-text"
                  />
                </label>

                <div className="text-sm font-black text-[#0c4a6e]">
                  要幫{playerName.trim() || '自己'}買保險嗎？
                </div>
                <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-left text-[10.5px] text-[#2f6f9a] space-y-1.5">
                  <div className="font-black text-emerald-600">🛡️ 法巴保障組合 • 遊戲保費 ${INSURANCE_PREMIUM.toLocaleString()}</div>
                  <div>
                    <b className="text-[#0c4a6e]">法國巴黎人壽</b>
                    <div>🏥 住院醫療保險：住院日額、手術、門診</div>
                  </div>
                  <div>
                    <b className="text-[#0c4a6e]">法國巴黎產險</b>
                    <div>🚗 永保平安傷害保險：傷害住院、食物中毒</div>
                    <div>🦴 傷害醫療（含骨折未住院）</div>
                    <div>🏠 住宅火災／颱風洪水／第三人責任</div>
                    <div>👛 個人皮件、證件及行動電話盜打</div>
                  </div>
                  <div className="text-[9px] text-[#7fb0cf] pt-1 border-t border-dashed border-[#bfe3f7]">
                    商品名稱參考 life.cardif.com.tw 與 nonlife.cardif.com.tw。遊戲保費與理賠金額僅供示意。
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleSetupChoice(false)}
                    className="py-3 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-sm btn-pop cursor-pointer"
                  >
                    先不要 🙅
                  </button>
                  <button
                    onClick={() => handleSetupChoice(true)}
                    className="py-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-sm btn-pop cursor-pointer"
                  >
                    我要投保 🛡️
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-[350px] card-cute rounded-[32px] p-5 text-center space-y-3 animate-card-in">
                <div className="text-base font-black text-[#0c4a6e]">大家都準備好了！</div>
                <div className="space-y-2">
                  {setupPlayers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-white rounded-2xl px-3 py-1.5 border-2 border-[#bfe3f7]">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChibiAvatar preset={p.preset} size={30} />
                        <span className="text-sm font-black text-[#0c4a6e] truncate">{p.preset.name}</span>
                        <span
                          className={`text-[9px] font-black px-1.5 rounded-full ${
                            p.isHuman ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'
                          }`}
                        >
                          {p.isHuman ? '你' : '電腦'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                          p.hasInsurance ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {p.hasInsurance ? `🛡️ 已投保（-$${fmtWan(INSURANCE_PREMIUM)}）` : '未投保'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-[#4a8ab5]">3 位電腦玩家隨機決定是否投保。</div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => setSetupStep('profile')}
                    className="py-2.5 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-xs btn-pop cursor-pointer"
                  >
                    返回
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="col-span-2 py-2.5 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-sm btn-pop cursor-pointer"
                  >
                    開始遊戲 🎲
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FINAL 4-PLAYER RESULTS MODAL                             */}
        {/* ======================================================== */}
        {showSettlementModal && (
          <div className="absolute inset-0 bg-sky-950/55 z-[58] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-[380px] card-cute rounded-[32px] p-5 space-y-3 animate-card-in my-auto">
              <div className="text-center">
                <div className="text-xs font-black text-sky-600">🏆 人生旅程 • 最終排名</div>
                <div className="text-base font-black text-[#0c4a6e] mt-0.5">
                  🎉 贏家：{rankedPlayers[0].preset.name}（${rankedPlayers[0].totalAssets.toLocaleString()}）
                </div>
              </div>

              <div className="space-y-2">
                {rankedPlayers.map((rp, rankIdx) => {
                  const medals = ['🥇 第一', '🥈 第二', '🥉 第三', '4️⃣ 第四'];
                  return (
                    <div
                      key={rp.id}
                      className={`rounded-2xl p-2.5 border-2 flex items-center justify-between ${
                        rankIdx === 0 ? 'bg-sky-50 border-sky-300 shadow-sm' : 'bg-white border-[#bfe3f7]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-black text-[#0c4a6e] w-12 shrink-0">{medals[rankIdx]}</span>
                        <ChibiAvatar preset={rp.preset} size={28} />
                        <div className="min-w-0">
                          <div className="text-xs font-black text-[#0c4a6e] flex items-center gap-1">
                            <span className="truncate">{rp.preset.name}</span>
                            {rp.isHuman && (
                              <span className="text-[9px] bg-sky-500 text-white px-1.5 rounded-full font-bold">你</span>
                            )}
                            {rp.hasInsurance && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 rounded-full font-bold">🛡️ 法巴保戶</span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#4a8ab5]">
                            現金 {fmtWan(rp.stats.cash)} • 股份 {fmtWan(rp.stats.shares)} • 房產 {fmtWan(rp.stats.property)}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-black text-sky-900 shrink-0">${rp.totalAssets.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 leading-snug">
                💡 <b>勝負關鍵總結：</b>開局就買<b>法巴保險</b>的角色，遇到車禍、住院、颱風、火災、失竊這些生活意外時都有理賠，資產不會一夕歸零！
                <br />
                <span className="text-[9.5px] text-emerald-700/80">法國巴黎保險遍佈全球 30 個地區 • 人壽 0800-012-899 • 產險 0800-266-288</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="py-2 bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-bold text-xs rounded-full btn-pop cursor-pointer"
                >
                  {gameOver ? '查看棋盤' : '繼續遊戲'}
                </button>
                <button
                  onClick={handleReset}
                  className="py-2 bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-xs rounded-full btn-pop cursor-pointer"
                >
                  新遊戲
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
