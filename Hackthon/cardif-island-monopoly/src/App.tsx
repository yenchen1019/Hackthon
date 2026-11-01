import React, { useState, useRef } from 'react';

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
        className={`absolute left-0 top-0 ${rounded} ${border} overflow-hidden flex items-center justify-center brightness-90`}
      >
        {backContent}
      </div>
      <div
        style={{ width: d, height: h, left: (w - d) / 2, top: 0, background: cRight, transform: `rotateY(90deg) translateZ(${w / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center brightness-95`}
      >
        {rightContent}
      </div>
      <div
        style={{ width: d, height: h, left: (w - d) / 2, top: 0, background: cLeft, transform: `rotateY(-90deg) translateZ(${w / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center brightness-80`}
      >
        {leftContent}
      </div>
      <div
        style={{ width: w, height: d, left: 0, top: (h - d) / 2, background: cTop, transform: `rotateX(90deg) translateZ(${h / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden flex items-center justify-center brightness-110`}
      >
        {topContent}
      </div>
      <div
        style={{ width: w, height: d, left: 0, top: (h - d) / 2, background: cBottom, transform: `rotateX(-90deg) translateZ(${h / 2}px)` }}
        className={`absolute ${rounded} ${border} overflow-hidden brightness-50`}
      />
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
        className="absolute inset-0 bg-sky-950/45 rounded-full blur-[4px] transition-all duration-500 pointer-events-none"
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
      <div className={`relative preserve-3d flex flex-col items-center ${!isWalking ? 'animate-3d-bob' : ''}`}>
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
// 5. DIVERSE 3D TAIPEI LANDMARK ICONS (16 Custom 3D Models!)
// Every tile gets a unique 6-sided volumetric 3D miniature icon
// ==========================================
function True3DTileLandmark({ tileId, level, color, icon = '' }: { tileId: number; level: number; color: string; icon?: string }) {
  const wrap = "preserve-3d pointer-events-none flex flex-col items-center";

  switch (tileId) {
    // 0: 台北車站 (3D High-Speed Rail Train + Station Canopy)
    case 0:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Classic Red/Brown Pitched Station Roof */}
          <div style={{ transform: "translateY(-18px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={18} h={4} d={14} colors={{ front: "#dc2626", top: "#ef4444", left: "#991b1b", right: "#991b1b" }} />
          </div>
          {/* Station Hall */}
          <div style={{ transform: "translateY(-14px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={15}
              h={8}
              d={11}
              colors={{ front: "#f8fafc", left: "#cbd5e1", right: "#cbd5e1", top: "#e2e8f0" }}
              frontContent={<div className="text-[5px] font-black text-sky-700">北車</div>}
            />
          </div>
          {/* 3D THSR Bullet Train in Front */}
          <div style={{ transform: "translateZ(7px) translateY(-6px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={16}
              h={5}
              d={6}
              colors={{ front: "#ffffff", top: "#f97316", left: "#f97316", right: "#ea580c" }}
              frontContent={<div className="w-full h-1.5 bg-orange-500 flex justify-around"><span className="w-2 h-1 bg-sky-900" /><span className="w-2 h-1 bg-sky-900" /></div>}
            />
          </div>
        </div>
      );

    // 1: 西門町 (3D Ximen Red House Octagon + Neon Billboard)
    case 1:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Neon Signboard */}
          <div style={{ transform: "translateY(-24px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={12}
              h={6}
              d={4}
              colors={{ front: "#ec4899", top: "#f472b6", left: "#be185d", right: "#be185d" }}
              frontContent={<span className="text-[5px] font-black text-yellow-200">XIMEN</span>}
            />
          </div>
          {/* Red Brick Historic Building */}
          <div style={{ transform: "translateY(-18px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={15}
              h={12}
              d={13}
              colors={{ front: "#b91c1c", left: "#991b1b", right: "#7f1d1d", top: "#dc2626" }}
              frontContent={
                <div className="flex gap-1">
                  <div className="w-2 h-4 bg-amber-200 rounded-t-full" />
                  <div className="w-2 h-4 bg-amber-200 rounded-t-full" />
                </div>
              }
            />
          </div>
        </div>
      );

    // 2: 中正紀念堂 (3D White Marble Hall + Blue Octagonal Roof)
    case 2:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Gold Finial */}
          <div style={{ transform: "translateY(-25px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={4} h={3} d={4} colors={{ front: "#fbbf24", top: "#fde047" }} />
          </div>
          {/* Iconic Royal Blue Roof */}
          <div style={{ transform: "translateY(-22px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={16} h={6} d={16} colors={{ front: "#1d4ed8", top: "#2563eb", left: "#1e40af", right: "#1e3a8a" }} />
          </div>
          {/* White Marble Hall Body */}
          <div style={{ transform: "translateY(-16px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={10}
              d={14}
              colors={{ front: "#ffffff", left: "#f1f5f9", right: "#e2e8f0", top: "#f8fafc" }}
              frontContent={<div className="w-3 h-5 bg-slate-700 rounded-t-sm mt-auto" />}
            />
          </div>
        </div>
      );

    // 3: 東門永康 (3D Giant Bamboo Steamer Basket Tower & Golden Boba)
    case 3:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Top Lid */}
          <div style={{ transform: "translateY(-20px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={11} h={3} d={11} colors={{ front: "#fcd34d", top: "#fef08a", left: "#f59e0b", right: "#d97706" }} />
          </div>
          {/* Steamer Tier 2 */}
          <div style={{ transform: "translateY(-17px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={5}
              d={14}
              colors={{ front: "#f59e0b", top: "#ffffff", left: "#d97706", right: "#b45309" }}
              frontContent={<div className="w-full h-1 bg-amber-800/40" />}
            />
          </div>
          {/* Steamer Tier 1 */}
          <div style={{ transform: "translateY(-12px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={6}
              d={14}
              colors={{ front: "#d97706", top: "#f59e0b", left: "#b45309", right: "#92400e" }}
              frontContent={<div className="w-full h-1 bg-amber-950/40" />}
            />
          </div>
        </div>
      );

    // 4: 台大醫院 (3D Medical Center + 3D Red Cross Rooftop Sign)
    case 4:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* 3D Red Cross Sign */}
          <div style={{ transform: "translateY(-26px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={8}
              h={7}
              d={4}
              colors={{ front: "#ffffff", top: "#f8fafc", left: "#cbd5e1", right: "#cbd5e1" }}
              frontContent={<span className="text-[8px] font-black text-red-600 leading-none">✚</span>}
            />
          </div>
          {/* Hospital Building */}
          <div style={{ transform: "translateY(-19px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={15}
              h={14}
              d={13}
              colors={{ front: "#f8fafc", left: "#e0f2fe", right: "#bae6fd", top: "#38bdf8" }}
              frontContent={
                <div className="grid grid-cols-2 gap-1 p-1">
                  <div className="w-2 h-2 bg-cyan-400" /><div className="w-2 h-2 bg-cyan-400" />
                  <div className="w-2 h-2 bg-cyan-400" /><div className="w-2 h-2 bg-cyan-400" />
                </div>
              }
            />
          </div>
        </div>
      );

    // 5: 大安森林 (3D Multi-Tree Lush Forest Sanctuary)
    case 5:
      return (
        <div className="preserve-3d pointer-events-none relative">
          <div style={{ transform: "translateX(-5px)" }} className="absolute preserve-3d">
            <True3DTree scale={1.15} />
          </div>
          <div style={{ transform: "translateX(6px) translateZ(4px)" }} className="absolute preserve-3d">
            <True3DTree scale={0.85} />
          </div>
        </div>
      );

    // 6: 忠孝復興 (3D Traffic Signal Gantry + Dual Colliding Sports Cars)
    case 6:
      return (
        <div className="preserve-3d pointer-events-none relative">
          {/* 3D Traffic Light Pole */}
          <div style={{ transform: "rotateX(-90deg) translateX(-7px)" }} className="absolute preserve-3d">
            <div style={{ transform: "translateY(-22px)" }} className="absolute preserve-3d">
              <VoxelBox3D
                w={9}
                h={4}
                d={4}
                colors={{ front: "#1e293b", top: "#334155" }}
                frontContent={
                  <div className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                }
              />
            </div>
            <div style={{ transform: "translateY(-18px)" }} className="absolute preserve-3d">
              <VoxelBox3D w={2.5} h={14} d={2.5} colors={{ front: "#475569" }} />
            </div>
          </div>
          {/* Two 3D Cars in Intersection */}
          <div style={{ transform: "translateX(2px)" }} className="absolute preserve-3d">
            <True3DMiniCar color="#ef4444" rotZ={-30} />
          </div>
          <div style={{ transform: "translateX(-4px) translateY(5px)" }} className="absolute preserve-3d">
            <True3DMiniCar color="#3b82f6" rotZ={45} />
          </div>
        </div>
      );

    // 7: 松山機場 (3D Passenger Jet Airplane + Control Tower)
    case 7:
      return (
        <div style={{ transform: "rotateZ(-25deg) rotateX(-90deg)" }} className={wrap}>
          {/* Tail Fin */}
          <div style={{ transform: "translateY(-17px) translateZ(-5px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={3} h={6} d={5} colors={{ front: "#0284c7", left: "#0ea5e9", right: "#0284c7" }} />
          </div>
          {/* Airplane Wings */}
          <div style={{ transform: "translateY(-11px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={22} h={2} d={6} colors={{ front: "#e2e8f0", top: "#ffffff", left: "#94a3b8", right: "#94a3b8" }} />
          </div>
          {/* Airplane Fuselage */}
          <div style={{ transform: "translateY(-13px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={6}
              h={5}
              d={18}
              colors={{ front: "#ffffff", top: "#f8fafc", left: "#38bdf8", right: "#0284c7" }}
              frontContent={<div className="w-4 h-1.5 bg-sky-900 rounded-t-sm" />}
            />
          </div>
        </div>
      );

    // 8: 大直美麗華 (3D Giant Rotating Ferris Wheel)
    case 8:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Ferris Wheel Rim */}
          <div style={{ transform: "translateY(-28px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={18}
              h={18}
              d={4}
              rounded="rounded-full"
              colors={{ front: "#ec4899", back: "#db2777", left: "#be185d", right: "#be185d", top: "#f472b6" }}
              frontContent={
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-sky-200/40">
                  <div className="w-3 h-3 rounded-full bg-yellow-300 border border-white" />
                </div>
              }
            />
          </div>
          {/* Support Base */}
          <div style={{ transform: "translateY(-11px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={10} h={9} d={8} colors={{ front: "#475569", left: "#334155", right: "#334155" }} />
          </div>
        </div>
      );

    // 9: 內湖科園 (3D Cyber Glass Tech Hub + Satellite Dish)
    case 9:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          <div style={{ transform: "translateY(-29px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={7} h={4} d={7} colors={{ front: "#38bdf8", top: "#bae6fd" }} />
          </div>
          <div style={{ transform: "translateY(-25px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={15}
              h={20}
              d={14}
              colors={{ front: "#4f46e5", left: "#4338ca", right: "#3730a3", top: "#818cf8" }}
              frontContent={
                <div className="w-full h-full p-1 flex flex-col justify-around">
                  <div className="w-full h-1.5 bg-cyan-300 rounded-full" />
                  <div className="w-full h-1.5 bg-cyan-300 rounded-full" />
                  <div className="w-full h-1.5 bg-cyan-300 rounded-full" />
                </div>
              }
            />
          </div>
        </div>
      );

    // 10: 南港展覽館 (3D Elevated MRT Train on Viaduct)
    case 10:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* MRT Train Car */}
          <div style={{ transform: "translateY(-19px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={18}
              h={6}
              d={8}
              colors={{ front: "#0284c7", top: "#f8fafc", left: "#0369a1", right: "#0369a1" }}
              frontContent={
                <div className="flex gap-1 px-1">
                  <div className="w-2.5 h-2.5 bg-sky-100 rounded-[1px]" />
                  <div className="w-2.5 h-2.5 bg-sky-100 rounded-[1px]" />
                  <div className="w-2.5 h-2.5 bg-sky-100 rounded-[1px]" />
                </div>
              }
            />
          </div>
          {/* Viaduct Track Beam */}
          <div style={{ transform: "translateY(-13px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={20} h={3} d={10} colors={{ front: "#94a3b8", top: "#cbd5e1", left: "#64748b", right: "#64748b" }} />
          </div>
          {/* Concrete Pillar */}
          <div style={{ transform: "translateY(-10px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={6} h={8} d={6} colors={{ front: "#64748b", left: "#475569", right: "#475569" }} />
          </div>
        </div>
      );

    // 11: 台北101 (3D Multi-Tiered Bamboo Skyscraper Icon)
    case 11:
      return (
        <div className="preserve-3d pointer-events-none">
          <True3DLandmarkSkyscraper />
        </div>
      );

    // 12: 象山步道 (3D Stepped Emerald Mountain Peaks)
    case 12:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Main Peak */}
          <div style={{ transform: "translateY(-22px) translateX(-2px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={11} h={18} d={11} colors={{ front: "#059669", left: "#047857", right: "#065f46", top: "#6ee7b7" }} />
          </div>
          {/* Secondary Peak */}
          <div style={{ transform: "translateY(-14px) translateX(6px) translateZ(3px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={10} h={11} d={10} colors={{ front: "#10b981", left: "#059669", right: "#047857", top: "#a7f3d0" }} />
          </div>
        </div>
      );

    // 13: 信義計畫區 (3D Twin Golden & Sapphire Financial Towers)
    case 13:
      return (
        <div className="preserve-3d pointer-events-none">
          <True3DCityBuilding level={Math.max(2, level)} color={color} />
        </div>
      );

    // 14: 法巴101總部 (3D Emerald BNP Paribas Cardif Shield HQ Tower)
    case 14:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Glowing 3D Shield Crest on Roof */}
          <div style={{ transform: "translateY(-38px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={11}
              h={9}
              d={5}
              colors={{ front: "#10b981", top: "#6ee7b7", left: "#059669", right: "#059669" }}
              frontContent={<span className="text-[7px] font-black text-white">🛡️</span>}
            />
          </div>
          {/* HQ Emerald Glass Tower */}
          <div style={{ transform: "translateY(-29px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={16}
              h={25}
              d={15}
              colors={{ front: "#059669", left: "#047857", right: "#065f46", top: "#34d399" }}
              frontContent={
                <div className="flex flex-col items-center justify-between py-1 h-full">
                  <span className="text-[5.5px] font-black text-white bg-emerald-900/60 px-1 rounded">CARDIF</span>
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2 h-2 bg-emerald-100" /><div className="w-2 h-2 bg-emerald-100" />
                    <div className="w-2 h-2 bg-emerald-100" /><div className="w-2 h-2 bg-emerald-100" />
                  </div>
                </div>
              }
            />
          </div>
        </div>
      );

    // 15: 士林北投 (3D Wooden Hot Spring Villa + Rising Steam Cube)
    case 15:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          {/* Rising White Steam Cube */}
          <div style={{ transform: "translateY(-23px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={6} h={4} d={6} colors={{ front: "#ffffff", top: "#f8fafc", left: "#e2e8f0", right: "#e2e8f0" }} />
          </div>
          {/* Dark Slate Japanese-style Roof */}
          <div style={{ transform: "translateY(-17px)" }} className="absolute preserve-3d">
            <VoxelBox3D w={17} h={4} d={15} colors={{ front: "#334155", top: "#475569", left: "#1e293b", right: "#1e293b" }} />
          </div>
          {/* Warm Cedar Wood Bathhouse */}
          <div style={{ transform: "translateY(-13px)" }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={9}
              d={12}
              colors={{ front: "#b45309", left: "#92400e", right: "#78350f", top: "#d97706" }}
              frontContent={<div className="w-4 h-4 rounded-full bg-red-600 text-[6px] text-white font-bold flex items-center justify-center">湯</div>}
            />
          </div>
        </div>
      );

    // Life-event milestone: colored pedestal (grows with level) + floating emoji cube
    case LIFE_MODEL: {
      const baseH = 4 + Math.max(1, level) * 3;
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          <div style={{ transform: `translateY(${-baseH}px)` }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={baseH}
              d={14}
              rounded="rounded-[3px]"
              colors={{ front: color, back: color, left: color, right: color, top: "#fff7ed" }}
            />
          </div>
          <div style={{ transform: `translateY(${-baseH - 14}px)`, animation: 'evBob 2s ease-in-out infinite' }} className="absolute preserve-3d">
            <VoxelBox3D
              w={12}
              h={12}
              d={12}
              rounded="rounded-[4px]"
              border="border border-white/90"
              colors={{ front: "#ffffff", back: "#f8fafc", left: "#f1f5f9", right: "#e2e8f0", top: "#ffffff" }}
              frontContent={<span className="text-[8px] leading-none">{icon}</span>}
              rightContent={<span className="text-[8px] leading-none">{icon}</span>}
            />
          </div>
        </div>
      );
    }

    // Dedicated chance tiles: floating golden "?" gift block
    case CHANCE_MODEL:
      return (
        <div style={{ transform: "rotateX(-90deg)" }} className={wrap}>
          <div style={{ transform: "translateY(-24px)", animation: 'evBob 1.6s ease-in-out infinite' }} className="absolute preserve-3d">
            <VoxelBox3D
              w={14}
              h={14}
              d={14}
              rounded="rounded-[4px]"
              border="border-2 border-white/80"
              colors={{ front: "#fbbf24", back: "#f59e0b", left: "#f59e0b", right: "#d97706", top: "#fde68a" }}
              frontContent={<span className="text-[10px] font-black text-white drop-shadow">?</span>}
              rightContent={<span className="text-[10px] font-black text-white">?</span>}
              topContent={<div className="w-full h-1 bg-rose-400" />}
            />
          </div>
        </div>
      );

    default:
      return <True3DCityBuilding level={Math.max(1, level)} color={color} />;
  }
}

// Keep True3DCityBuilding for Central Park & multi-building clusters
function True3DCityBuilding({ level, color }: { level: number; color: string }) {
  const mainH = 12 + level * 8;
  const sideH = 8 + level * 4;
  return (
    <div style={{ transform: "rotateX(-90deg)" }} className="preserve-3d pointer-events-none flex items-end">
      {/* Main High-Rise Tower */}
      <div style={{ transform: `translateY(${-mainH}px)` }} className="preserve-3d">
        <VoxelBox3D
          w={13}
          h={mainH}
          d={13}
          colors={{
            front: color,
            back: color,
            left: color,
            right: color,
            top: "#f8fafc",
          }}
          frontContent={
            <div className="grid grid-cols-2 gap-0.5 p-0.5 w-full h-full place-items-center bg-white/10">
              {Array.from({ length: Math.max(2, level * 2) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-sky-100 rounded-[1px]" />
              ))}
            </div>
          }
          rightContent={
            <div className="grid grid-cols-2 gap-0.5 p-0.5 w-full h-full place-items-center bg-black/10">
              {Array.from({ length: Math.max(2, level * 2) }).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-sky-100 rounded-[1px]" />
              ))}
            </div>
          }
          topContent={
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-white text-[5px] font-bold text-white flex items-center justify-center">
              H
            </div>
          }
        />
      </div>

      {/* Side Annex Building + 3D Street Tree for Rich City Block Look */}
      {level >= 2 && (
        <div style={{ transform: `translateX(9px) translateZ(3px) translateY(${-sideH}px)` }} className="preserve-3d absolute">
          <VoxelBox3D
            w={9}
            h={sideH}
            d={9}
            colors={{
              front: "#e2e8f0",
              back: "#cbd5e1",
              left: "#cbd5e1",
              right: "#94a3b8",
              top: color,
            }}
            frontContent={
              <div className="w-1.5 h-1.5 bg-amber-300 rounded-full" />
            }
          />
        </div>
      )}
    </div>
  );
}

// 3D Volumetric Park Tree (Trunk + 2-tier 3D Foliage Canopy)
function True3DTree({ scale = 1 }: { scale?: number }) {
  return (
    <div
      style={{ transform: `rotateX(-90deg) scale(${scale})` }}
      className="preserve-3d pointer-events-none flex flex-col items-center"
    >
      {/* Top Crown */}
      <div style={{ transform: "translateY(-19px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={8}
          h={5}
          d={8}
          colors={{
            front: "#34d399",
            back: "#10b981",
            left: "#10b981",
            right: "#059669",
            top: "#6ee7b7",
          }}
        />
      </div>
      {/* Lower Canopy */}
      <div style={{ transform: "translateY(-14px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={12}
          h={7}
          d={12}
          colors={{
            front: "#10b981",
            back: "#059669",
            left: "#059669",
            right: "#047857",
            top: "#34d399",
          }}
        />
      </div>
      {/* Tree Trunk */}
      <div style={{ transform: "translateY(-7px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={4}
          h={7}
          d={4}
          colors={{
            front: "#92400e",
            back: "#78350f",
            left: "#78350f",
            right: "#451a03",
            top: "#78350f",
          }}
        />
      </div>
    </div>
  );
}

// 3D Taipei 101 / Cardif Financial Landmark Skyscraper in Central Park
function True3DLandmarkSkyscraper() {
  return (
    <div style={{ transform: "rotateX(-90deg)" }} className="preserve-3d pointer-events-none flex flex-col items-center">
      {/* Spire */}
      <div style={{ transform: "translateY(-44px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={3}
          h={8}
          d={3}
          colors={{ front: "#38bdf8", top: "#fde047" }}
        />
      </div>
      {/* Top Tier */}
      <div style={{ transform: "translateY(-36px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={12}
          h={10}
          d={12}
          colors={{
            front: "#0ea5e9",
            back: "#0284c7",
            left: "#0284c7",
            right: "#0369a1",
            top: "#7dd3fc",
          }}
          frontContent={<div className="w-2 h-2 rounded-full bg-emerald-300" />}
        />
      </div>
      {/* Middle Tier */}
      <div style={{ transform: "translateY(-26px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={15}
          h={12}
          d={15}
          colors={{
            front: "#0284c7",
            back: "#0369a1",
            left: "#0369a1",
            right: "#075985",
            top: "#38bdf8",
          }}
          frontContent={
            <div className="grid grid-cols-2 gap-0.5 p-0.5">
              <div className="w-1.5 h-1.5 bg-sky-100" /><div className="w-1.5 h-1.5 bg-sky-100" />
              <div className="w-1.5 h-1.5 bg-sky-100" /><div className="w-1.5 h-1.5 bg-sky-100" />
            </div>
          }
        />
      </div>
      {/* Base Podium */}
      <div style={{ transform: "translateY(-14px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={18}
          h={14}
          d={18}
          colors={{
            front: "#0369a1",
            back: "#075985",
            left: "#075985",
            right: "#0c4a6e",
            top: "#0ea5e9",
          }}
          frontContent={
            <div className="text-[5px] font-black text-emerald-300 tracking-tighter">BNP</div>
          }
        />
      </div>
    </div>
  );
}

// 3D Miniature Voxel Car on Street / Intersection
function True3DMiniCar({ color = "#ef4444", rotZ = 0 }: { color?: string; rotZ?: number }) {
  return (
    <div style={{ transform: `rotateZ(${rotZ}deg) rotateX(-90deg)` }} className="preserve-3d pointer-events-none flex flex-col items-center">
      {/* Cabin */}
      <div style={{ transform: "translateY(-9px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={8}
          h={4}
          d={8}
          colors={{ front: "#bae6fd", back: "#7dd3fc", left: color, right: color, top: color }}
        />
      </div>
      {/* Car Body */}
      <div style={{ transform: "translateY(-5px)" }} className="absolute preserve-3d">
        <VoxelBox3D
          w={10}
          h={5}
          d={14}
          colors={{ front: color, back: color, left: color, right: color, top: color }}
          frontContent={
            <div className="w-full flex justify-between px-0.5">
              <div className="w-1.5 h-1 bg-yellow-300" />
              <div className="w-1.5 h-1 bg-yellow-300" />
            </div>
          }
        />
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
// 6. LIFE JOURNEY BOARD DATA (20 life-stage tiles, 4 dedicated chance tiles)
// ==========================================
interface BoardTile {
  id: number;
  name: string;
  type: 'START' | 'PROPERTY' | 'INVEST' | 'CHANCE' | 'CORNER' | 'RISK' | 'INSURANCE';
  price?: number;
  color: string;
  icon: string;
  gridArea: string;
  row: number;
  col: number;
  model: number; // which 3D landmark model to show (see True3DTileLandmark)
  baseBuilding?: number;
  hasTree?: boolean;
  bonus?: number; // money gained when landing on a corner life event
  landMsg?: string;
}

// 6x6 ring board: 20 tiles. Corners are 0, 5, 10, 15.
const BOARD_SIZE = 6;
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
  // 童年・求學 (Top Row)
  { name: "呱呱落地", type: "START", color: "#f472b6", icon: "👶", model: LIFE_MODEL, baseBuilding: 1, hasTree: true },
  { name: "上小學", type: "PROPERTY", price: 90000, color: "#fb923c", icon: "🎒", model: LIFE_MODEL, baseBuilding: 1 },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "考上大學", type: "INVEST", price: 110000, color: "#8b5cf6", icon: "🎓", model: LIFE_MODEL, baseBuilding: 1 },
  { name: "出國留學", type: "PROPERTY", price: 130000, color: "#0ea5e9", icon: "✈️", model: LIFE_MODEL, baseBuilding: 1 },
  { name: "第一份工作", type: "CORNER", color: "#0284c7", icon: "💼", model: LIFE_MODEL, baseBuilding: 2, bonus: 30000, landMsg: "領到人生第一份薪水" },
  // 成家・立業 (Right Column)
  { name: "考駕照開車", type: "RISK", color: "#ef4444", icon: "🚗", model: LIFE_MODEL },
  { name: "步入禮堂", type: "PROPERTY", price: 150000, color: "#ec4899", icon: "💍", model: LIFE_MODEL, baseBuilding: 2, hasTree: true },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "買第一間房", type: "INVEST", price: 200000, color: "#b45309", icon: "🏠", model: LIFE_MODEL, baseBuilding: 2 },
  { name: "寶寶誕生", type: "CORNER", color: "#f472b6", icon: "🍼", model: LIFE_MODEL, baseBuilding: 1, bonus: 20000, landMsg: "迎接新生命，領取育兒津貼", hasTree: true },
  // 中年・家庭 (Bottom Row)
  { name: "孩子上學", type: "PROPERTY", price: 120000, color: "#6366f1", icon: "📚", model: LIFE_MODEL, baseBuilding: 1 },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "升遷加薪", type: "INVEST", price: 180000, color: "#0284c7", icon: "📈", model: LIFE_MODEL, baseBuilding: 3 },
  { name: "自行創業", type: "INVEST", price: 160000, color: "#10b981", icon: "🏪", model: LIFE_MODEL, baseBuilding: 2 },
  { name: "光榮退休", type: "CORNER", color: "#059669", icon: "🏖️", model: LIFE_MODEL, baseBuilding: 1, bonus: 50000, landMsg: "光榮退休，領取退休金", hasTree: true },
  // 樂齡・傳承 (Left Column)
  { name: "保障規劃", type: "INSURANCE", price: 60000, color: "#10b981", icon: "🛡️", model: 14, baseBuilding: 3 },
  { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🃏", model: CHANCE_MODEL },
  { name: "含飴弄孫", type: "PROPERTY", price: 105000, color: "#e11d48", icon: "👴", model: LIFE_MODEL, baseBuilding: 1, hasTree: true },
  { name: "財富傳承", type: "PROPERTY", price: 90000, color: "#f97316", icon: "📜", model: LIFE_MODEL, baseBuilding: 1 },
];

const BOARD_TILES: BoardTile[] = BOARD_TILE_DEFS.map((t, id) => {
  const [row, col] = ringPos(id);
  return { ...t, id, row, col, gridArea: `${row + 1} / ${col + 1}` };
});

const CAR_CRASH_TILE = BOARD_TILES.findIndex((t) => t.type === 'RISK');
const FIRST_CHANCE_TILE = BOARD_TILES.findIndex((t) => t.type === 'CHANCE');
const INITIAL_LEVELS: Record<number, number> = { 16: 3, 1: 2, 7: 2, 11: 2, 13: 3, 14: 2 };
const INITIAL_OWNERS: Record<number, number> = { 1: 0, 7: 1, 11: 2, 13: 0, 14: 3 };

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

interface PlayerState {
  id: number;
  preset: CharacterPreset;
  position: number;
  money: number;
  hasInsurance: boolean;
}

const INITIAL_PLAYERS: PlayerState[] = CHARACTER_MODELS.map((preset, idx) => ({
  id: idx,
  preset,
  position: 0,
  money: 500000,
  hasInsurance: false,
}));

// Slight 2x2 offset (%) on a tile so 4 characters standing on the same tile never overlap
const PLAYER_TILE_OFFSETS: [number, number][] = [
  [-3.4, -3.1],
  [3.4, -3.1],
  [-3.4, 3.1],
  [3.4, 3.1],
];

export default function App() {
  const [players, setPlayers] = useState<PlayerState[]>(INITIAL_PLAYERS);
  const [activeTurnIdx, setActiveTurnIdx] = useState(0);
  const [turnCount, setTurnCount] = useState(0);
  const maxTurns = 12; // 3 full rounds for 4 players

  // tileId -> { level, ownerIdx }
  const [ownedTiles, setOwnedTiles] = useState<Record<number, number>>(INITIAL_LEVELS);
  const [tileOwners, setTileOwners] = useState<Record<number, number>>(INITIAL_OWNERS);

  const [diceRoll, setDiceRoll] = useState(3);
  const [spinCount, setSpinCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [hopProgress, setHopProgress] = useState(0);
  const [logMessage, setLogMessage] = useState("先決定每位玩家要不要買保險吧！");

  // Opening insurance-purchase setup screen
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [setupIdx, setSetupIdx] = useState(0);
  const [insuranceChoices, setInsuranceChoices] = useState<(boolean | null)[]>(CHARACTER_MODELS.map(() => null));

  const [cameraMode, setCameraMode] = useState<'iso' | 'closeup' | 'top'>('iso');
  const [customRotZ, setCustomRotZ] = useState(-28);
  const [customRotX, setCustomRotX] = useState(52);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const [isHighlightCar, setIsHighlightCar] = useState(false);
  const [pendingBuyTile, setPendingBuyTile] = useState<BoardTile | null>(null);

  // Chance Card Modal States
  const [chanceModalStep, setChanceModalStep] = useState<'closed' | 'pick' | 'animating' | 'revealed'>('closed');
  const [drawnChanceCard, setDrawnChanceCard] = useState<ChanceCard | null>(null);

  // Final Winner Settlement Modal State
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  const currentPlayer = players[activeTurnIdx];
  const currentTile = BOARD_TILES[currentPlayer.position];

  // Calculate total net worth (Cash + Owned Property Value) for any player
  const getPlayerTotalAssets = (playerIdx: number, playerList = players) => {
    const p = playerList[playerIdx];
    let propVal = 0;
    Object.entries(tileOwners).forEach(([tileIdStr, owner]) => {
      if (owner === playerIdx) {
        const t = BOARD_TILES[Number(tileIdStr)];
        const lv = ownedTiles[Number(tileIdStr)] || 1;
        propVal += (t?.price || 60000) * (0.7 + lv * 0.3);
      }
    });
    return Math.round(p.money + propVal);
  };

  const getCharacterFacingAngleZ = (pos: number) => {
    const side = BOARD_SIZE - 1;
    if (pos < side) return 90;
    if (pos < side * 2) return 0;
    if (pos < side * 3) return -90;
    return 180;
  };

  // Advance to the next player's turn (or trigger final settlement if maxTurns reached)
  const advanceTurn = (nextTurnCount = turnCount + 1) => {
    setPendingBuyTile(null);
    setTurnCount(nextTurnCount);
    if (nextTurnCount >= maxTurns) {
      setShowSettlementModal(true);
      setLogMessage("🏆 回合結束！最終資產勝負揭曉！");
      return;
    }
    const nextIdx = (activeTurnIdx + 1) % players.length;
    setActiveTurnIdx(nextIdx);
    setLogMessage(`輪到【${players[nextIdx].preset.name}】擲骰前進`);
  };

  const rollDiceAndMove = () => {
    if (gamePhase !== 'playing' || isRolling || isWalking || chanceModalStep !== 'closed' || showSettlementModal) return;
    setPendingBuyTile(null);
    setIsRolling(true);
    setSpinCount((prev) => prev + 1);
    setLogMessage(`🎲 【${currentPlayer.preset.name}】擲骰中...`);

    // Make it easy to hit a Chance tile or the Car Crash tile on early rolls
    let targetSteps = Math.floor(Math.random() * 6) + 1;
    if (currentPlayer.position === 0 && activeTurnIdx === 0) targetSteps = FIRST_CHANCE_TILE; // Land on 機會卡
    else if (currentPlayer.position === FIRST_CHANCE_TILE && activeTurnIdx === 0) targetSteps = CAR_CRASH_TILE - FIRST_CHANCE_TILE; // Land on 考駕照開車 (Car Crash!)

    setDiceRoll(targetSteps);

    setTimeout(() => {
      setIsRolling(false);
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
              ? { ...p, position: curr, money: curr === 0 ? p.money + 50000 : p.money }
              : p
          )
        );
        currentStepCount++;

        if (curr === 0) {
          setLogMessage(`🎉 【${currentPlayer.preset.name}】又長大一歲，領生日紅包 +$50,000`);
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

    if (tile.type === "CHANCE") {
      // Open Interactive 3-Card Chance Draw Modal!
      setLogMessage(`🃏 【${pName}】踩到機會卡格子！請抽取一張機會卡`);
      setChanceModalStep('pick');
      return;
    }

    if (tile.type === "RISK") {
      setIsHighlightCar(true);
      runEvent(CHANCE_CARDS.find((c) => c.scene === 'car')!);
      return;
    }

    if (tile.type === "INSURANCE") {
      if (!currentPlayer.hasInsurance && tile.price && currentPlayer.money >= tile.price) {
        setPendingBuyTile(tile);
        setLogMessage(`🛡️ 【${pName}】來到人生保障規劃站，要補買法國巴黎保險嗎？`);
      } else {
        setLogMessage(`🛡️ 【${pName}】檢視人生保障規劃，法國巴黎保險保障持續中！`);
        setTimeout(() => advanceTurn(), 900);
      }
      return;
    }

    if (tile.type === "PROPERTY" || tile.type === "INVEST") {
      const owner = tileOwners[tileIndex];
      if (owner === undefined && tile.price && currentPlayer.money >= tile.price) {
        setPendingBuyTile(tile);
        setLogMessage(`🏙️ 【${pName}】迎來人生大事「${tile.name}」，要投入嗎？`);
      } else if (owner !== undefined && owner !== activeTurnIdx) {
        const rent = 25000;
        const ownerName = players[owner].preset.name;
        setPlayers((prev) =>
          prev.map((p, idx) => {
            if (idx === activeTurnIdx) return { ...p, money: p.money - rent };
            if (idx === owner) return { ...p, money: p.money + rent };
            return p;
          })
        );
        setLogMessage(`💸 【${pName}】參與「${tile.name}」支付費用 $${rent.toLocaleString()} 給【${ownerName}】`);
        setTimeout(() => advanceTurn(), 1000);
      } else {
        setOwnedTiles((prev) => ({ ...prev, [tileIndex]: Math.min((prev[tileIndex] || 1) + 1, 3) }));
        setPlayers((prev) =>
          prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money + 20000 } : p))
        );
        setLogMessage(`📈 【${pName}】經營「${tile.name}」有成，收益 +$20,000`);
        setTimeout(() => advanceTurn(), 900);
      }
      return;
    }

    if (tile.bonus) {
      const bonus = tile.bonus;
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money + bonus } : p))
      );
      setLogMessage(`${tile.icon} 【${pName}】${tile.landMsg ?? tile.name} +$${bonus.toLocaleString()}`);
      setTimeout(() => advanceTurn(), 1000);
      return;
    }

    setLogMessage(`📍 【${pName}】抵達 ${tile.name}`);
    setTimeout(() => advanceTurn(), 900);
  };

  // Pick a Chance Card -> play the event animation -> reveal result
  const handlePickChanceCard = () => {
    runEvent(CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)]);
  };

  const runEvent = (randomCard: ChanceCard) => {
    setDrawnChanceCard(randomCard);
    setChanceModalStep('animating');
    setLogMessage(`${randomCard.icon} 【${currentPlayer.preset.name}】${randomCard.title}`);

    const bonus = currentPlayer.hasInsurance && randomCard.insuredBonus ? randomCard.insuredBonus : 0;
    const netDelta = randomCard.deltaMoney + bonus;

    setTimeout(() => {
      setChanceModalStep('revealed');
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money + netDelta } : p))
      );
      setLogMessage(
        `${randomCard.icon} 【${currentPlayer.preset.name}】${randomCard.title}（${netDelta >= 0 ? '+' : ''}$${netDelta.toLocaleString()}）`
      );
    }, EVENT_SCENE_MS);
  };

  const handleCloseChanceModal = () => {
    setChanceModalStep('closed');
    setDrawnChanceCard(null);
    setIsHighlightCar(false);
    advanceTurn();
  };

  const handleBuyProperty = () => {
    if (!pendingBuyTile || !pendingBuyTile.price) return;
    const price = pendingBuyTile.price;
    if (pendingBuyTile.type === 'INSURANCE') {
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money - price, hasInsurance: true } : p))
      );
      setLogMessage(`🛡️ 【${currentPlayer.preset.name}】成功投保！之後遇到意外都有保障了`);
      setPendingBuyTile(null);
      setTimeout(() => advanceTurn(), 800);
      return;
    }
    setPlayers((prev) =>
      prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, money: p.money - price } : p))
    );
    setOwnedTiles((prev) => ({ ...prev, [pendingBuyTile.id]: 2 }));
    setTileOwners((prev) => ({ ...prev, [pendingBuyTile.id]: activeTurnIdx }));
    setLogMessage(`🏙️ 【${currentPlayer.preset.name}】完成人生大事「${pendingBuyTile.name}」！`);
    setPendingBuyTile(null);
    setTimeout(() => advanceTurn(), 700);
  };

  // Answer the "buy insurance?" question for the current setup player
  const handleSetupChoice = (buy: boolean) => {
    const next = insuranceChoices.map((c, i) => (i === setupIdx ? buy : c));
    setInsuranceChoices(next);
    if (setupIdx < CHARACTER_MODELS.length - 1) setSetupIdx(setupIdx + 1);
    else setSetupIdx(CHARACTER_MODELS.length); // summary page
  };

  const handleStartGame = () => {
    setPlayers(
      INITIAL_PLAYERS.map((p, i) =>
        insuranceChoices[i]
          ? { ...p, hasInsurance: true, money: p.money - INSURANCE_PREMIUM }
          : p
      )
    );
    setGamePhase('playing');
    setLogMessage(`輪到【${INITIAL_PLAYERS[0].preset.name}】擲骰展開人生旅程`);
  };

  const handleReset = () => {
    setGamePhase('setup');
    setSetupIdx(0);
    setInsuranceChoices(CHARACTER_MODELS.map(() => null));
    setPlayers(INITIAL_PLAYERS);
    setActiveTurnIdx(0);
    setTurnCount(0);
    setOwnedTiles(INITIAL_LEVELS);
    setTileOwners(INITIAL_OWNERS);
    setDiceRoll(3);
    setIsRolling(false);
    setIsWalking(false);
    setHopProgress(0);
    setPendingBuyTile(null);
    setChanceModalStep('closed');
    setDrawnChanceCard(null);
    setShowSettlementModal(false);
    setIsHighlightCar(false);
    setLogMessage("先決定每位玩家要不要買保險吧！");
  };

  const getBoard3DTransform = () => {
    if (cameraMode === 'top') {
      return `rotateX(16deg) rotateZ(0deg) scale(0.9)`;
    }
    if (cameraMode === 'closeup') {
      const mid = (BOARD_SIZE - 1) / 2;
      const offsetX = (mid - currentTile.col) * 20;
      const offsetY = (mid - currentTile.row) * 20;
      return `rotateX(58deg) rotateZ(${customRotZ}deg) scale(1.18) translate3d(${offsetX}px, ${offsetY}px, 0px)`;
    }
    return `rotateX(${customRotX}deg) rotateZ(${customRotZ}deg) scale(0.86)`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (cameraMode === 'top') return;
    isDraggingRef.current = true;
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
  };

  // Ranked players for Final Winner Settlement
  const rankedPlayers = [...players]
    .map((p, idx) => ({
      ...p,
      totalAssets: getPlayerTotalAssets(idx),
      propCount: Object.values(tileOwners).filter((o) => o === idx).length,
    }))
    .sort((a, b) => b.totalAssets - a.totalAssets);

  return (
    <div
      className="min-h-screen text-[#5b3a29] flex items-center justify-center p-2 font-sans select-none overflow-hidden"
      onPointerUp={handlePointerUp}
    >
      {/* ======================================================== */}
      {/* SMARTPHONE FRAME CONTAINER (Sky Blue Daylight City Theme)*/}
      {/* ======================================================== */}
      <div className="relative w-full max-w-[500px] h-[880px] bg-gradient-to-b from-[#fff4e6] via-[#fdeef2] to-[#e8f6f0] rounded-[52px] border-[7px] border-white shadow-[0_0_0_3px_#f3d9c6,0_25px_60px_-15px_rgba(180,110,70,0.45)] p-3 flex flex-col justify-between overflow-hidden">
        
        {/* Soft Daylight Sun & Cloud Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 bg-white/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />

        {/* ======================================================== */}
        {/* TOP: DYNAMIC ISLAND & 4-PLAYER LIVE SCOREBOARD           */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center z-50">
          {/* 4-PLAYER LIVE SCOREBOARD & CAMERA BAR */}
          <div className="w-full grid grid-cols-4 gap-1 px-0.5 mt-1.5">
            {players.map((p, idx) => {
              const isTurn = activeTurnIdx === idx;
              return (
                <div
                  key={p.id}
                  onClick={() => !isRolling && !isWalking && setActiveTurnIdx(idx)}
                  className={`rounded-2xl px-1.5 py-1 border-2 transition cursor-pointer flex flex-col justify-between ${
                    isTurn
                      ? 'bg-white border-rose-300 shadow-md scale-[1.04]'
                      : 'bg-white/70 border-white opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <ChibiAvatar preset={p.preset} size={18} />
                      <span className="text-[10px] font-black text-[#5b3a29]">{p.preset.name}</span>
                    </div>
                    {p.hasInsurance && (
                      <span title="法巴保單守護" className="text-[9px]">🛡️</span>
                    )}
                  </div>
                  <div className="text-[10px] font-extrabold text-[#8a5a44] mt-0.5 flex items-center justify-between">
                    <span>${Math.round(p.money / 1000)}K</span>
                    {isTurn && <span className="text-[8px] bg-rose-300 text-white px-1 rounded-full">回合</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Camera Mode Pills */}
          <div className="w-full flex items-center justify-between px-1 mt-1">
            <div className="flex items-center bg-white/80 backdrop-blur-md p-0.5 rounded-full border-2 border-white shadow-xs text-[9.5px]">
              <button
                onClick={() => { setCameraMode('iso'); setCustomRotX(52); setCustomRotZ(-28); }}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'iso' ? 'bg-rose-300 text-white' : 'text-[#8a5a44]'
                }`}
              >
                3D城市
              </button>
              <button
                onClick={() => setCameraMode('closeup')}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'closeup' ? 'bg-rose-300 text-white' : 'text-[#8a5a44]'
                }`}
              >
                特寫
              </button>
              <button
                onClick={() => setCameraMode('top')}
                className={`px-2 py-0.5 rounded-full font-bold transition cursor-pointer ${
                  cameraMode === 'top' ? 'bg-rose-300 text-white' : 'text-[#8a5a44]'
                }`}
              >
                俯視
              </button>
            </div>

            <button
              onClick={() => setShowSettlementModal(true)}
              className="px-2.5 py-1 rounded-full bg-amber-300 hover:bg-amber-200 text-[#5b3a29] font-black text-[10px] btn-pop flex items-center gap-1 cursor-pointer transition"
            >
              <span>🏆 第 {Math.min(turnCount + 1, maxTurns)}/{maxTurns} 回合 • 結算</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER STAGE: RICH 3D METROPOLIS CITY MONOPOLY BOARD     */}
        {/* ======================================================== */}
        <div
          className="relative my-auto w-full h-[520px] flex items-center justify-center scene-perspective overflow-visible cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          {/* City Island Base with Asphalt Highway Ring */}
          <div
            style={{ transform: getBoard3DTransform() }}
            className="w-[440px] h-[440px] bg-gradient-to-br from-lime-200 via-green-200 to-emerald-200 rounded-[32px] p-2.5 border-4 border-white board-slab-3d transition-transform duration-500 ease-out relative"
          >
            {/* 5x5 City Grid + Rich Central Park */}
            <div className="grid grid-cols-6 grid-rows-6 gap-1.5 w-full h-full relative preserve-3d">
              {BOARD_TILES.map((tile) => {
                const isHere = currentPlayer.position === tile.id;
                const isAccident = tile.id === CAR_CRASH_TILE;
                const buildingLevel = ownedTiles[tile.id] || tile.baseBuilding || 0;
                const ownerIdx = tileOwners[tile.id];
                const isChance = tile.type === 'CHANCE';

                return (
                  <div
                    key={tile.id}
                    style={{ gridArea: tile.gridArea }}
                    className={`relative rounded-2xl flex flex-col justify-between p-1 transition-all duration-300 border-2 preserve-3d ${
                      isHere
                        ? 'bg-gradient-to-b from-pink-50 to-white border-pink-300 tile-3d-active z-20'
                        : isAccident && isHighlightCar
                        ? 'bg-gradient-to-b from-red-100 to-red-50 border-red-500 tile-3d-danger animate-pulse'
                        : isChance
                        ? 'bg-gradient-to-b from-amber-200 to-yellow-100 border-amber-400 tile-3d'
                        : 'bg-[#fffaf3] border-white tile-3d'
                    }`}
                  >
                    {/* City District Color Header + Owner Dot */}
                    <div
                      className="w-full h-2 rounded-full shadow-xs flex items-center justify-end px-1"
                      style={{ backgroundColor: tile.color }}
                    >
                      {ownerIdx !== undefined && (
                        <span
                          style={{ backgroundColor: players[ownerIdx].preset.suitColor }}
                          className="w-1.5 h-1.5 rounded-full border border-white"
                        />
                      )}
                    </div>

                    {/* City Sidewalk + Icon + District Name */}
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                      <span className="text-sm leading-none mb-0.5">{tile.icon}</span>
                      <span
                        className={`font-extrabold leading-none tracking-tight ${
                          isChance ? 'text-[10px] text-amber-700' : 'text-[9px] text-[#5b3a29]'
                        }`}
                      >
                        {tile.name}
                      </span>
                    </div>

                    {/* Road Zebra Crosswalk Detail */}
                    <div className="w-full h-1 bg-[#f3d9c6] rounded-full flex justify-around items-center px-1">
                      <span className="w-1 h-0.5 bg-white" />
                      <span className="w-1 h-0.5 bg-white" />
                      <span className="w-1 h-0.5 bg-white" />
                    </div>

                    {/* 3D Life-Event Milestone / Chance Block Rising from Every Tile */}
                    <div
                      style={{ transform: "translateZ(4px)" }}
                      className="absolute top-2.5 right-3 preserve-3d pointer-events-none z-30"
                    >
                      <True3DTileLandmark
                        tileId={tile.model}
                        level={buildingLevel}
                        color={tile.color}
                        icon={tile.icon}
                      />
                    </div>

                    {/* 3D Volumetric Street Tree on Green Blocks */}
                    {tile.hasTree && tile.model !== 5 && (
                      <div
                        style={{ transform: "translateZ(4px)" }}
                        className="absolute bottom-2 left-1.5 preserve-3d pointer-events-none z-30"
                      >
                        <True3DTree scale={0.7} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ======================================================== */}
              {/* CENTRAL CITY PARK, CANAL RIVER & SKYLINE PLAZA           */}
              {/* ======================================================== */}
              <div
                style={{ gridArea: `2 / 2 / ${BOARD_SIZE} / ${BOARD_SIZE}` }}
                className="bg-gradient-to-br from-[#d9f5e5] via-[#fff6e0] to-[#dff1fb] rounded-3xl p-2.5 border-4 border-white flex flex-col justify-between items-center text-center shadow-[inset_0_4px_15px_rgba(14,165,233,0.25)] relative preserve-3d"
              >
                {/* Winding Sky-Blue City River / Canal across Central Park */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 bg-gradient-to-r from-sky-400/70 via-cyan-300/80 to-sky-400/70 border-y border-white/70 -rotate-6 pointer-events-none" />

                {/* Central Marble Fountain Plaza Ring under the 3D Dice */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-white/90 to-sky-100/90 border-4 border-white shadow-md flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 rounded-full bg-sky-300/50 border-2 border-sky-400/40" />
                </div>

                {/* 3D Landmark Skyscraper & 3D Park Trees Standing in Central Park */}
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute top-14 left-5 preserve-3d pointer-events-none z-20"
                >
                  <True3DLandmarkSkyscraper />
                </div>
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute top-14 right-5 preserve-3d pointer-events-none z-20"
                >
                  <True3DCityBuilding level={2} color="#10b981" />
                </div>
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute bottom-14 left-4 preserve-3d pointer-events-none z-20"
                >
                  <True3DTree scale={1.1} />
                </div>
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute bottom-16 left-11 preserve-3d pointer-events-none z-20"
                >
                  <True3DTree scale={0.85} />
                </div>
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute bottom-14 right-4 preserve-3d pointer-events-none z-20"
                >
                  <True3DTree scale={1.05} />
                </div>
                <div
                  style={{ transform: "translateZ(4px)" }}
                  className="absolute top-24 right-10 preserve-3d pointer-events-none z-20"
                >
                  <True3DMiniCar color="#f59e0b" rotZ={75} />
                </div>

                {/* Top Active Player Asset Pill */}
                <div
                  style={{ transform: "translateZ(6px)" }}
                  className="w-full bg-white/95 backdrop-blur-md rounded-full py-1.5 px-3 border-2 border-[#f3d9c6] shadow-sm flex items-center justify-between z-30"
                >
                  <span className="text-[10px] text-[#8a5a44] font-extrabold flex items-center gap-1">
                    <ChibiAvatar preset={currentPlayer.preset} size={16} />
                    {currentPlayer.hasInsurance && <span>🛡️</span>}
                    {currentPlayer.preset.name} 現金
                  </span>
                  <span className="text-sm font-black text-[#5b3a29] flex items-center gap-1">
                    <Icons.Coins className="w-3.5 h-3.5 text-amber-500" />
                    ${currentPlayer.money.toLocaleString()}
                  </span>
                </div>

                {/* Bottom Action Button */}
                <div style={{ transform: "translateZ(8px)" }} className="w-full z-30">
                  {pendingBuyTile ? (
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleBuyProperty}
                        className="flex-1 py-2 bg-amber-300 hover:bg-amber-200 text-[#5b3a29] font-black text-[11px] rounded-full btn-pop cursor-pointer"
                      >
                        {pendingBuyTile.type === 'INSURANCE'
                          ? `🛡️ 補買保險 (-$${pendingBuyTile.price! / 1000}K)`
                          : `投入 ${pendingBuyTile.name} (-$${pendingBuyTile.price! / 1000}K)`}
                      </button>
                      <button
                        onClick={() => advanceTurn()}
                        className="px-3 py-2 bg-white hover:bg-[#fff4e6] text-[#a1745a] font-bold text-[11px] rounded-full border-2 border-[#f3d9c6] btn-pop cursor-pointer"
                      >
                        略過
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={rollDiceAndMove}
                      disabled={isRolling || isWalking || chanceModalStep !== 'closed'}
                      className="w-full py-2 bg-gradient-to-r from-rose-300 to-orange-300 hover:from-rose-200 hover:to-orange-200 disabled:opacity-40 rounded-full font-black text-white text-xs btn-pop cursor-pointer"
                    >
                      {isRolling ? "擲骰中..." : isWalking ? "前進中..." : `輪到【${currentPlayer.preset.name}】擲骰`}
                    </button>
                  )}
                </div>
              </div>

              {/* ======================================================== */}
              {/* TOP-LEVEL 3D DICE (Centered & Elevated so it NEVER sinks)*/}
              {/* ======================================================== */}
              <div
                style={{
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute preserve-3d z-50"
              >
                <True3DDice
                  value={diceRoll}
                  isRolling={isRolling}
                  spinCount={spinCount}
                  onClick={rollDiceAndMove}
                />
              </div>

              {/* ======================================================== */}
              {/* ALL 4 3D ARTICULATED CHARACTERS ON THE BOARD AT ONCE     */}
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
                      className="absolute w-7 h-4 bg-slate-900/45 rounded-full blur-[2px] transition-all duration-150"
                    />
                    {isTurn && (
                      <div className="absolute w-10 h-10 rounded-full border-2 border-pink-400 bg-pink-300/30 animate-shield-pulse" />
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
        {/* INTERACTIVE CHANCE CARD DRAW MODAL (3-Card Fan)          */}
        {/* ======================================================== */}
        {chanceModalStep !== 'closed' && (
          <div className="absolute inset-0 bg-[#5b3a29]/45 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            {chanceModalStep === 'pick' && (
              <div className="w-full max-w-[360px] card-cute rounded-[32px] p-5 text-center space-y-4 animate-card-in">
                <div className="text-xs font-black text-rose-400 tracking-wider">
                  🌸 生活大小事 機會卡 🌸
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ChibiAvatar preset={currentPlayer.preset} size={38} />
                  <div className="text-base font-black text-[#5b3a29] text-left">
                    【{currentPlayer.preset.name}】<br />抽一張看看今天會發生什麼事？
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5 py-2">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      onClick={handlePickChanceCard}
                      style={{ animation: `evBob 1.4s ease-in-out ${num * 0.2}s infinite` }}
                      className="h-32 rounded-3xl bg-gradient-to-br from-pink-300 via-rose-300 to-orange-200 border-4 border-white btn-pop hover:scale-105 transition-transform flex flex-col items-center justify-center gap-1.5 cursor-pointer text-white"
                    >
                      <span className="text-3xl">🎁</span>
                      <span className="text-[11px] font-black tracking-wide drop-shadow">機會卡 {num}</span>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[#a1745a]">
                  {currentPlayer.hasInsurance ? '🛡️ 你有法巴保險，遇到意外不用怕！' : '⚠️ 你沒有保險，遇到意外要自己付喔…'}
                </div>
              </div>
            )}

            {chanceModalStep === 'animating' && drawnChanceCard && (
              <div className="w-full max-w-[360px] card-cute rounded-[32px] p-4 text-center space-y-3 animate-card-in">
                <div className="inline-block px-3 py-0.5 rounded-full bg-rose-100 text-rose-500 text-[10px] font-black">
                  {drawnChanceCard.tag}
                </div>
                <div className="text-lg font-black text-[#5b3a29]">{drawnChanceCard.title}</div>
                <EventScene kind={drawnChanceCard.scene} preset={currentPlayer.preset} />
                <p className="text-xs text-[#8a5a44] leading-relaxed">{drawnChanceCard.desc}</p>
              </div>
            )}

            {chanceModalStep === 'revealed' && drawnChanceCard && (() => {
              const insured = currentPlayer.hasInsurance && !!drawnChanceCard.insuredBonus;
              const bonus = insured ? drawnChanceCard.insuredBonus! : 0;
              const total = drawnChanceCard.deltaMoney + bonus;
              const isLoss = drawnChanceCard.deltaMoney < 0;
              return (
                <div className="w-full max-w-[360px] card-cute rounded-[32px] p-5 text-center space-y-3 animate-card-in">
                  <div className="text-base font-black text-[#5b3a29]">
                    {drawnChanceCard.icon} {drawnChanceCard.title}
                  </div>

                  <InsuranceOutcomeFx protectedByInsurance={insured || !isLoss} />


                  <div className={`text-sm font-black ${insured ? 'text-emerald-600' : isLoss ? 'text-rose-500' : 'text-amber-600'}`}>
                    {insured
                      ? isLoss
                        ? '還好有買保險！法巴幫你理賠 🎉'
                        : '好消息 🎉'
                      : isLoss
                      ? '沒有保險…只能自己掏腰包 😢'
                      : '好消息 🎉'}
                  </div>

                  <div className="bg-white rounded-2xl p-3 border-2 border-[#f3d9c6] text-xs space-y-1.5 text-left">
                    <div className="flex justify-between text-[#8a5a44]">
                      <span>{isLoss ? '事件損失' : '事件獎勵'}</span>
                      <span className={`font-black ${isLoss ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {drawnChanceCard.deltaMoney >= 0 ? '+' : '-'}${Math.abs(drawnChanceCard.deltaMoney).toLocaleString()}
                      </span>
                    </div>
                    {drawnChanceCard.insurer ? (
                      <div className="flex justify-between gap-2 text-[#8a5a44]">
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
                      <div className="flex justify-between text-[#8a5a44]">
                        <span>🛡️ 保險</span>
                        <span className="font-black text-slate-400">無需理賠</span>
                      </div>
                    )}
                    {drawnChanceCard.coverage && (
                      <div className="text-[10px] text-[#a1745a]">保障項目：{drawnChanceCard.coverage}</div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-[#f3d9c6] text-[#5b3a29] font-black">
                      <span>資產變動</span>
                      <span className={total >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                        {total >= 0 ? '+' : '-'}${Math.abs(total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-3 py-2 text-[10.5px] text-[#8a5a44] text-left leading-snug">
                    💡 <b>理賠小知識：</b>{drawnChanceCard.tip}
                    <div className="text-[9px] text-[#c09a80] mt-1">
                      商品資訊來源：法國巴黎人壽／產險官網。遊戲金額為示意，實際理賠依保單條款。
                    </div>
                  </div>

                  <button
                    onClick={handleCloseChanceModal}
                    className="w-full py-2.5 bg-gradient-to-r from-rose-300 to-orange-300 text-white font-black text-sm rounded-full btn-pop cursor-pointer"
                  >
                    好的，換下一位 ➔
                  </button>
                </div>
              );
            })()}
          </div>
        )}

        {/* ======================================================== */}
        {/* OPENING: ASK EACH PLAYER WHETHER TO BUY INSURANCE        */}
        {/* ======================================================== */}
        {gamePhase === 'setup' && (
          <div className="absolute inset-0 z-[60] bg-gradient-to-b from-[#fff4e6] via-[#fde8ef] to-[#e6f6f1] flex flex-col items-center justify-center p-5 rounded-[44px]">
            <div className="text-center mb-4">
              <div className="text-3xl mb-1">🏝️🎲</div>
              <div className="text-xl font-black text-[#5b3a29]">法巴暖心大富翁</div>
              <div className="text-[11px] text-[#a1745a] mt-0.5">出發前，先替自己準備一份保障吧！</div>
            </div>

            {setupIdx < CHARACTER_MODELS.length ? (
              (() => {
                const preset = CHARACTER_MODELS[setupIdx];
                return (
                  <div key={setupIdx} className="w-full max-w-[350px] card-cute rounded-[32px] p-5 text-center space-y-4 animate-card-in">
                    <div className="flex justify-center gap-1.5">
                      {CHARACTER_MODELS.map((m, i) => (
                        <span
                          key={m.id}
                          className={`h-2 rounded-full transition-all ${i === setupIdx ? 'w-6 bg-rose-300' : i < setupIdx ? 'w-2 bg-emerald-300' : 'w-2 bg-[#f3d9c6]'}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-center" style={{ animation: 'evBob 1.2s ease-in-out infinite' }}>
                      <ChibiAvatar preset={preset} size={84} />
                    </div>
                    <div className="text-lg font-black text-[#5b3a29]">
                      【{preset.name}】要購買保險嗎？
                    </div>
                    <div className="bg-white rounded-2xl p-3 border-2 border-[#f3d9c6] text-left text-[10.5px] text-[#8a5a44] space-y-1.5">
                      <div className="font-black text-emerald-600">🛡️ 法巴保障組合 • 遊戲保費 ${INSURANCE_PREMIUM.toLocaleString()}</div>
                      <div>
                        <b className="text-[#5b3a29]">法國巴黎人壽</b>
                        <div>🏥 住院醫療保險：住院日額、手術、門診</div>
                      </div>
                      <div>
                        <b className="text-[#5b3a29]">法國巴黎產險</b>
                        <div>🚗 永保平安傷害保險：傷害住院、食物中毒</div>
                        <div>🦴 個人傷害保險 傷害醫療（含骨折未住院）</div>
                        <div>🏠 住宅火災／颱風洪水／第三人責任保險</div>
                        <div>👛 個人皮件、證件及行動電話盜打賠償保險</div>
                      </div>
                      <div className="text-[9px] text-[#c09a80] pt-1 border-t border-dashed border-[#f3d9c6]">
                        商品名稱取自 life.cardif.com.tw 與 nonlife.cardif.com.tw；遊戲中的保費與理賠金額為示意，實際依保單條款。
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={() => handleSetupChoice(false)}
                        className="py-3 rounded-full bg-white border-2 border-[#f3d9c6] text-[#a1745a] font-black text-sm btn-pop cursor-pointer"
                      >
                        先不用 🙅
                      </button>
                      <button
                        onClick={() => handleSetupChoice(true)}
                        className="py-3 rounded-full bg-gradient-to-r from-emerald-300 to-teal-400 text-white font-black text-sm btn-pop cursor-pointer"
                      >
                        我要投保 🛡️
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="w-full max-w-[350px] card-cute rounded-[32px] p-5 text-center space-y-3 animate-card-in">
                <div className="text-base font-black text-[#5b3a29]">大家都準備好了！</div>
                <div className="space-y-2">
                  {CHARACTER_MODELS.map((m, i) => (
                    <div key={m.id} className="flex items-center justify-between bg-white rounded-2xl px-3 py-1.5 border-2 border-[#f3d9c6]">
                      <div className="flex items-center gap-2">
                        <ChibiAvatar preset={m} size={30} />
                        <span className="text-sm font-black text-[#5b3a29]">{m.name}</span>
                      </div>
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          insuranceChoices[i] ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {insuranceChoices[i] ? `🛡️ 已投保 (-$${INSURANCE_PREMIUM / 1000}K)` : '未投保'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSetupIdx(0);
                      setInsuranceChoices(CHARACTER_MODELS.map(() => null));
                    }}
                    className="py-2.5 rounded-full bg-white border-2 border-[#f3d9c6] text-[#a1745a] font-black text-xs btn-pop cursor-pointer"
                  >
                    重選
                  </button>
                  <button
                    onClick={handleStartGame}
                    className="col-span-2 py-2.5 rounded-full bg-gradient-to-r from-rose-300 to-orange-300 text-white font-black text-sm btn-pop cursor-pointer"
                  >
                    開始遊戲 🎲
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FINAL 4-PLAYER ASSET WINNER SETTLEMENT MODAL             */}
        {/* ======================================================== */}
        {showSettlementModal && (
          <div className="absolute inset-0 bg-[#5b3a29]/45 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[380px] card-cute rounded-[32px] p-5 space-y-3 animate-card-in">
              <div className="text-center">
                <div className="text-xs font-black text-amber-600">🏆 人生大富翁 • 最終資產勝負榜</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  🎉 冠軍：{rankedPlayers[0].preset.name}（總資產 ${rankedPlayers[0].totalAssets.toLocaleString()}）
                </div>
              </div>

              <div className="space-y-2">
                {rankedPlayers.map((rp, rankIdx) => {
                  const medals = ['🥇 冠軍', '🥈 亞軍', '🥉 季軍', '4️⃣ 殿軍'];
                  return (
                    <div
                      key={rp.id}
                      className={`rounded-2xl p-2.5 border-2 flex items-center justify-between ${
                        rankIdx === 0
                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                          : 'bg-white border-[#f3d9c6]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-700 w-12">
                          {medals[rankIdx]}
                        </span>
                        <ChibiAvatar preset={rp.preset} size={28} />
                        <div>
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1">
                            <span>{rp.preset.name}</span>
                            {rp.hasInsurance && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-bold">
                                🛡️ 法巴保戶
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            現金 ${Math.round(rp.money / 1000)}K • 地產 {rp.propCount} 處
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-black text-sky-900">
                        ${rp.totalAssets.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 leading-snug">
                💡 <b>勝負關鍵總結：</b> 開局就買<b>法巴保險</b>的角色，遇到車禍、住院、颱風、火災、失竊這些生活意外時都有理賠，資產不會一夕歸零！<br /><span className="text-[9.5px] text-emerald-700/80">法國巴黎保險遍佈全球 30 個地區 • 人壽 0800-012-899 • 產險 0800-266-288</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="py-2 bg-white border-2 border-[#f3d9c6] text-[#a1745a] font-bold text-xs rounded-full btn-pop cursor-pointer"
                >
                  繼續遊玩
                </button>
                <button
                  onClick={handleReset}
                  className="py-2 bg-gradient-to-r from-rose-300 to-orange-300 text-white font-black text-xs rounded-full btn-pop cursor-pointer"
                >
                  重新開局
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BOTTOM: SKY-BLUE GLASS STATUS & QUICK DEMO ACTIONS       */}
        {/* ======================================================== */}
        <div className="space-y-1.5 z-40">
          <div className="bg-white/90 backdrop-blur-md rounded-full py-1.5 px-3 border-2 border-white shadow-sm text-center text-xs font-bold text-[#5b3a29] truncate">
            {logMessage}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => {
                if (gamePhase !== 'playing' || isWalking || isRolling || chanceModalStep !== 'closed') return;
                setPendingBuyTile(null);
                setPlayers((prev) =>
                  prev.map((p, idx) => (idx === activeTurnIdx ? { ...p, position: FIRST_CHANCE_TILE } : p))
                );
                setChanceModalStep('pick');
              }}
              className="py-2 bg-amber-300 hover:bg-amber-200 text-[#5b3a29] rounded-full text-[11px] font-black btn-pop flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🎁 抽機會卡</span>
            </button>

            <button
              onClick={handleReset}
              className="py-2 bg-white/90 hover:bg-white text-[#8a5a44] border-2 border-white rounded-full text-[11px] font-bold btn-pop flex items-center justify-center gap-1 cursor-pointer"
            >
              <Icons.RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
