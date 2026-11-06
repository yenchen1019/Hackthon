import React, { useState, useRef, useEffect, useMemo } from 'react';

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
// 3. 3D VOLUMETRIC 6-SIDED DICE MODEL
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

      {/* 3D Rotating Cube */}
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
// Insurance products a player can hold. `price` is the premium for one life stage (game money):
// it is paid when buying and again at every new life stage (保單續約). Health premiums rise with age.
type InsuranceKey =
  | 'medical'
  | 'accident'
  | 'critical'
  | 'termMedical'
  | 'disability'
  | 'termLife'
  | 'wholeLife'
  | 'micro'
  | 'labor';
const INSURANCE_PRODUCTS: Record<InsuranceKey, { name: string; icon: string; price: number; desc: string }> = {
  medical: { name: '住院醫療險', icon: '🏥', price: 30000, desc: '住院日額、手術、出院療養' },
  accident: { name: '意外傷害險', icon: '🩹', price: 15000, desc: '意外住院、骨折、加護病房' },
  critical: { name: '防癌險', icon: '🎗️', price: 30000, desc: '確診癌症一次給付' },
  termMedical: { name: '一年期醫療實支實付', icon: '🧾', price: 8000, desc: '住院手術、自費項目依收據理賠' },
  disability: { name: '失能險', icon: '🦽', price: 12000, desc: '意外導致失能，依失能等級給付' },
  termLife: { name: '一年期定期壽險', icon: '📃', price: 5000, desc: '身故或完全失能理賠，保費便宜' },
  wholeLife: { name: '終身壽險', icon: '🌳', price: 40000, desc: '保障一輩子，身故或完全失能理賠' },
  micro: { name: '微型個人保險', icon: '🤲', price: 1500, desc: '經濟弱勢專屬：意外失能、傷害醫療' },
  labor: { name: '勞工保險', icon: '👷', price: 3000, desc: '職災傷病、失能、老年給付' },
};
// Plain-language explanation for the side panel
const INSURANCE_DETAIL: Record<InsuranceKey, string> = {
  medical: '生病或受傷住院時，依住院天數給付日額，也賠手術和出院療養。疾病有 30 天等待期。',
  accident: '意外受傷時理賠，例如車禍、跌倒骨折、食物中毒住院；生病不賠。買了立刻生效。',
  critical: '確診癌症時一次給付一筆錢，初期 20%、重度 100%。有 90 天等待期。',
  termMedical: '住院時的手術費、病房差額、自費項目，依收據在限額內實支實付；一年一約，年紀越大保費越高。',
  disability: '意外造成失能時，依失能等級給付（第 1 級 100%），補償以後少賺的收入。',
  termLife: '保障期間內身故或完全失能時理賠，保費便宜；但年紀大了續保費很高，老年就不能再續保。',
  wholeLife: '保障一輩子，身故或完全失能時理賠，保費比較貴但不會隨年紀調漲。',
  micro: '專為經濟弱勢設計的銅板保單：一年期傷害保險加實支實付傷害醫療，保額小、保費低，只有中低收能投保。',
  labor: '上班族由公司投保（自己負擔 2 成保費）：職災傷病給付、失能給付，老了可以領勞保年金。',
};
const INSURANCE_KEYS = Object.keys(INSURANCE_PRODUCTS) as InsuranceKey[];
// Products the player can't drop at renewal (法定強制加保)
const MANDATORY_INSURANCE: InsuranceKey[] = ['labor'];
// 一年期定期壽險: renewal stops at 老年 (game assumption: real renewal ages depend on the policy terms)
const TERM_LIFE_LAST_STAGE = 2;
const canBuy = (p: { preset: { id: string } }, k: InsuranceKey, stage: number) =>
  (k !== 'micro' || p.preset.id === 'poor') && (k !== 'termLife' || stage <= TERM_LIFE_LAST_STAGE);
// Premium this player pays for a new policy (low-income families get a premium subsidy)
const priceFor = (p: { preset: { premiumRate?: number } }, k: InsuranceKey) =>
  Math.round(INSURANCE_PRODUCTS[k].price * (p.preset.premiumRate ?? 1));

// Payouts on the event cards follow the benefit rules published on the official sites.
// The sites do not publish a fixed daily amount, so the game assumes these example amounts.
const MEDICAL_DAILY = 3000; // 住院醫療保險金日額 (game assumption)
const ACCIDENT_DAILY = 2000; // 傷害醫療保險金日額 (game assumption)
const CANCER_SUM = 300000; // 愛有靠3 保險金額: official minimum 30萬
const DISABILITY_SUM = 300000; // 失能險保險金額 (game assumption)
const TERM_LIFE_SUM = 500000; // 一年期定期壽險保險金額 (game assumption)
const WHOLE_LIFE_SUM = 300000; // 小額終身壽險保險金額 (game assumption)
const MICRO_SUM = 300000; // 微型傷害保險保額 (official cap 50萬)
const LABOR_WAGE = 29500; // 勞保月投保薪資 (game assumption: 基本工資)

interface ProductSource {
  key: InsuranceKey;
  insurer: Insurer;
  product: string; // official product name
  url: string; // official category page
  facts: string[]; // figures quoted from the official product sheet / policy terms
  assumption?: string; // what the game assumes on top of the official rules
}

const LIFE_SITE = 'https://life.cardif.com.tw';
const NONLIFE_SITE = 'https://nonlife.cardif.com.tw';

const PRODUCT_SOURCES: ProductSource[] = [
  {
    key: 'termLife',
    insurer: '法國巴黎人壽',
    product: '法商法國巴黎人壽一年定期壽險／網路投保一年定期壽險',
    url: `${LIFE_SITE}/a231`,
    facts: ['保險期間一年，到期續保', '被保險人身故或完全失能時給付保險金'],
    assumption: `遊戲假設保額 $${TERM_LIFE_SUM.toLocaleString()}，老年不能再續保（實際續保年齡依條款）`,
  },
  {
    key: 'wholeLife',
    insurer: '法國巴黎人壽',
    product: '法商法國巴黎人壽享e通小額終身壽險',
    url: `${LIFE_SITE}/a231`,
    facts: ['終身保障：身故或完全失能時給付保險金', '另有祝壽保險金'],
    assumption: `遊戲假設保額 $${WHOLE_LIFE_SUM.toLocaleString()}，保費不隨年齡調漲`,
  },
  {
    key: 'disability',
    insurer: '法國巴黎產險',
    product: '法商法國巴黎產物個人傷害保險（失能保險金）',
    url: `${NONLIFE_SITE}/a22`,
    facts: ['意外傷害造成失能時，依失能程度與保險金給付表的等級比例給付', '法巴沒有單獨的「失能險」，失能保障包含在傷害保險裡'],
    assumption: `遊戲假設失能保險金額 $${DISABILITY_SUM.toLocaleString()}，等級比例：第 1 級 100%、第 9 級 20%`,
  },
  {
    key: 'termMedical',
    insurer: '市售商品（遊戲示意）',
    product: '一年期實支實付醫療保險',
    url: '',
    facts: ['依醫療費用收據，在各項限額內實支實付', '一年一約，續保保費隨年齡增加；續保條件依各公司條款'],
    assumption: '法巴官網沒有這類商品，遊戲依市面常見設計示意，限額為遊戲設定',
  },
  {
    key: 'micro',
    insurer: '金管會保險局',
    product: '微型保險',
    url: 'https://www.ib.gov.tw',
    facts: [
      '為經濟弱勢設計，商品須為一年期，不含生存或滿期給付',
      '種類：定期壽險（累計保額上限 50 萬）、傷害保險（50 萬）、實支實付型傷害醫療（3 萬）',
      '對象包括中低收入戶、身障者、原住民、農漁民等',
    ],
    assumption: `遊戲假設傷害保險保額 $${MICRO_SUM.toLocaleString()}；中低收由政府補助投保`,
  },
  {
    key: 'labor',
    insurer: '勞動部勞工保險局',
    product: '勞工保險／勞工職業災害保險',
    url: 'https://www.bli.gov.tw',
    facts: [
      '受僱勞工由雇主投保；一般受僱者保費由雇主 70%、勞工 20%、政府 10% 分擔',
      '職災傷病給付：不能工作的第 4 天起發給，前 2 個月按平均月投保薪資，之後按 70%，最長 2 年',
      '失能給付依失能等級給付日數；老年可請領老年年金',
    ],
    assumption: `遊戲假設月投保薪資 $${LABOR_WAGE.toLocaleString()}（基本工資）`,
  },
  {
    key: 'medical',
    insurer: '法國巴黎人壽',
    product: '法商法國巴黎人壽住院醫療保險（甲、乙、丙型）',
    url: `${LIFE_SITE}/a233`,
    facts: [
      '一般住院：日額 × 住院日數（同一次住院最多 365 日）',
      '加護病房：另加日額 × 加護病房日數',
      '住院手術、住院治療處置：各為日額 × 3 倍（丙型）',
      '出院療養：日額 × 50% × 住院日數',
      '疾病、癌症等待期 30 日；保險期間一年',
    ],
    assumption: `遊戲假設住院日額 $${MEDICAL_DAILY.toLocaleString()}（官網未列固定日額）`,
  },
  {
    key: 'accident',
    insurer: '法國巴黎產險',
    product: '法商法國巴黎產物永保平安傷害保險／個人傷害保險傷害醫療保險給付附加條款（日額型）',
    url: `${NONLIFE_SITE}/a22`,
    facts: [
      '傷害住院：日額 × 住院日數（每次最多 90 日）',
      '加護病房：另加日額 × 加護病房日數',
      '骨折未住院：日額 × 1/2 × 骨折別日數（不完全骨折再 × 1/2）',
      '骨折別日數：橈骨或尺骨 28 天、腕骨 40 天、大腿骨頸 60 天',
    ],
    assumption: `遊戲假設傷害醫療日額 $${ACCIDENT_DAILY.toLocaleString()}（官網未列固定日額）`,
  },
  {
    key: 'critical',
    insurer: '法國巴黎人壽',
    product: '法商法國巴黎人壽愛有靠３防癌三年定期健康保險',
    url: `${LIFE_SITE}/a233`,
    facts: [
      '保險金額最低 30 萬、最高 100 萬；投保年齡 18～70 歲；保險期間 3 年',
      '癌症（初期／輕度）：保險金額 × 20%',
      '癌症（重度）：保險金額 × 100%；特定癌症（重度）再加 × 50%',
      '官網範例：40 歲男性、保額 100 萬，保費 13,500 元',
      '癌症等待期 90 日',
    ],
    assumption: `遊戲以官網最低保額 $${CANCER_SUM.toLocaleString()} 計算`,
  },
];

interface IncomeItem {
  label: string;
  icon: string;
  amount: number;
  work?: boolean; // earned by working: lost while on sick leave
}

// Small emoji props that make each family background look different
interface Accessory {
  emoji: string;
  spot: 'head' | 'face' | 'hand' | 'body';
}

export interface CharacterPreset {
  id: string;
  name: string;
  archetype: string; // family background
  archetypeIcon: string;
  blurb: string;
  startMoney: number;
  insurance: InsuranceKey[]; // insurance the parents bought at birth
  turnAllowance: Partial<Record<number, IncomeItem[]>>; // by life stage: paid at the start of every turn
  premiumRate?: number; // share of the list premium this family pays (保費補助)
  freeInsurance?: InsuranceKey[]; // policies paid for by the government (premium $0)
  laborAtWork?: boolean; // employer enrolls them in 勞保 when they start working (青年)
  medicalCostRate?: number; // share of medical bills paid (低收入戶免健保部分負擔)
  perks?: string[]; // shown on the character card
  accessories: Accessory[];
  suitColor: string;
  suitDark: string;
  hairColor: string;
  skinColor: string;
  tieColor: string;
  visorColor?: string;
}

// Three family backgrounds (富有／中產／中低收). Children's insurance follows the common Taiwan advice:
// 醫療險 + 意外險 first, then 防癌險 when the budget allows.
const CHARACTER_MODELS: CharacterPreset[] = [
  {
    id: 'rich',
    name: '豪哥',
    archetype: '富有',
    archetypeIcon: '💎',
    blurb: '含著金湯匙出生，父母一出生就把保障買齊。從小零用錢就比別人多，長大後家裡每輪給基本零用錢，老了靠股息生活。',
    startMoney: 800000,
    insurance: ['medical', 'accident', 'critical'],
    turnAllowance: {
      0: [{ label: '零用錢', icon: '👛', amount: 1000 }],
      1: [{ label: '基本零用錢', icon: '👛', amount: 100000 }],
      2: [{ label: '基本零用錢', icon: '👛', amount: 100000 }],
      3: [{ label: '股息', icon: '📈', amount: 50000 }],
    },
    accessories: [{ emoji: '🎩', spot: 'head' }],
    suitColor: '#7c3aed',
    suitDark: '#5b21b6',
    hairColor: '#334155',
    skinColor: '#fed7aa',
    tieColor: '#fbbf24',
  },
  {
    id: 'middle',
    name: '阿真',
    archetype: '中產',
    archetypeIcon: '📘',
    blurb: '父母是高知識分子，出生就配有基本保險。從小有零用錢，長大後收入穩定，老了領勞保退休金。',
    startMoney: 500000,
    insurance: ['medical', 'accident'],
    laborAtWork: true,
    turnAllowance: {
      0: [{ label: '零用錢', icon: '👛', amount: 500 }],
      1: [{ label: '基本零用錢', icon: '👛', amount: 50000 }],
      2: [{ label: '基本零用錢', icon: '👛', amount: 80000 }],
      3: [{ label: '勞保退休金', icon: '👴', amount: 28396 }],
    },
    accessories: [{ emoji: '👓', spot: 'face' }],
    suitColor: '#0284c7',
    suitDark: '#0369a1',
    hairColor: '#f59e0b',
    skinColor: '#ffedd5',
    tieColor: '#10b981',
  },
  {
    id: 'poor',
    name: '小怡',
    archetype: '中低收',
    archetypeIcon: '🏚️',
    blurb: '家徒四壁，父母買不起保險。小時候靠中低收入戶補助，長大後領基本工資，老了領勞保退休金。好在政府有幫弱勢家庭投保，看病也有減免。',
    startMoney: 100000,
    insurance: ['micro'],
    freeInsurance: ['micro'],
    laborAtWork: true,
    premiumRate: 0.5,
    medicalCostRate: 0.6,
    perks: ['政府補助投保微型個人保險（保費 $0）', '其他保險保費 5 折（保費補助）', '看病醫療費少 4 成（免健保部分負擔）'],
    turnAllowance: {
      0: [{ label: '中低收入戶補助', icon: '🏛️', amount: 750 }],
      1: [
        { label: '中低收入戶補助', icon: '🏛️', amount: 750 },
        { label: '基本工資', icon: '🧰', amount: 29500, work: true },
      ],
      2: [
        { label: '中低收入戶補助', icon: '🏛️', amount: 750 },
        { label: '基本工資', icon: '🧰', amount: 35000, work: true },
      ],
      3: [{ label: '勞保退休金', icon: '👴', amount: 22506 }],
    },
    accessories: [
      { emoji: '🩹', spot: 'body' },
      { emoji: '🥛', spot: 'hand' },
    ],
    suitColor: '#a16207',
    suitDark: '#713f12',
    hairColor: '#57534e',
    skinColor: '#fde68a',
    tieColor: '#78716c',
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

        {/* 3D ACCESSORIES (family background) */}
        {preset.accessories
          .filter((a) => a.spot === 'head' || a.spot === 'hand')
          .map((a) => (
            <div
              key={a.emoji}
              style={{ transform: a.spot === 'head' ? 'translateY(-58px)' : 'translate(13px, -24px)' }}
              className="absolute text-[13px] leading-none select-none"
            >
              {a.emoji}
            </div>
          ))}

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
      {/* Accessories (family background) */}
      {preset.accessories.map((a) => (
        <span
          key={a.emoji}
          style={{
            fontSize: s * ({ head: 0.42, face: 0.36, hand: 0.3, body: 0.2 } as const)[a.spot],
            ...({
              head: { left: '50%', top: -s * 0.24, transform: 'translateX(-50%)' },
              face: { left: '50%', top: s * 0.24, transform: 'translateX(-50%)' },
              hand: { right: -s * 0.06, bottom: s * 0.02 },
              body: { left: s * 0.26, bottom: s * 0.06 },
            } as const)[a.spot],
          }}
          className="absolute leading-none select-none pointer-events-none z-10"
        >
          {a.emoji}
        </span>
      ))}
    </div>
  );
}

// ==========================================
// 5c. INSURANCE EVENT SCENES (cute CSS cartoon animations)
// ==========================================
type EventSceneKind = 'car' | 'hospital' | 'typhoon' | 'fall' | 'fire' | 'food' | 'pot' | 'appliance' | 'health' | 'invoice' | 'party' | 'lostfound' | 'scam' | 'layoff' | 'trip' | 'business';

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

    case 'invoice':
      return (
        <div className={`${frame} bg-gradient-to-b from-yellow-100 to-amber-50`}>
          <span className="absolute top-3 left-4 text-3xl">🏪</span>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#f6e3b4]" />
          <At x="32%" b="16%">
            <div style={anim('evBob', 0.5, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="shock" />
            </div>
          </At>
          {/* Receipt flutters, then the winning numbers light up */}
          <At x="64%" b="30%">
            <span style={anim('evWobble', 0.6, 0, {}, 'ease-in-out', 'infinite')} className={emoji('text-6xl')}>🧾</span>
          </At>
          <At x="64%" b="70%" z={30}>
            <span style={anim('evPop', 0.5, 1.0)} className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-sm font-black whitespace-nowrap">中獎！</span>
          </At>
          {[18, 45, 80].map((x, i) => (
            <span key={x} style={{ left: `${x}%`, top: 0, ...anim('evCoinRain', 1.2, 1.2 + i * 0.25, {}, 'ease-in', 'infinite') }} className={`absolute ${emoji('text-2xl')}`}>🪙</span>
          ))}
        </div>
      );

    case 'party':
      return (
        <div className={`${frame} bg-gradient-to-b from-rose-200 to-orange-50`}>
          {/* Year-end party stage */}
          <div className="absolute inset-x-0 top-0 h-6 bg-[repeating-linear-gradient(90deg,#ef4444_0_18px,#facc15_18px_36px)]" />
          <span className="absolute top-8 left-4 text-3xl">🏮</span>
          <span className="absolute top-8 right-4 text-3xl">🏮</span>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[#b91c1c]" />
          <At x="34%" b="20%">
            <div style={anim('evBob', 0.45, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="happy" />
            </div>
          </At>
          <At x="66%" b="22%">
            <span style={anim('evShake', 0.3, 0.2, {}, 'linear', 3)} className={emoji('text-5xl')}>🎁</span>
          </At>
          <At x="66%" b="56%" z={30}>
            <span style={anim('evPop', 0.5, 1.2)} className={emoji('text-4xl')}>🧧</span>
          </At>
          {[12, 30, 52, 74, 90].map((x, i) => (
            <span key={x} style={{ left: `${x}%`, top: 0, ...anim('evCoinRain', 1.3, 1.0 + i * 0.15, {}, 'ease-in', 'infinite') }} className={`absolute ${emoji('text-xl')}`}>🎊</span>
          ))}
        </div>
      );

    case 'lostfound':
      return (
        <div className={`${frame} bg-gradient-to-b from-sky-200 to-sky-50`}>
          <span className="absolute top-3 left-4 text-3xl">🏢</span>
          <span className="absolute top-3 right-4 text-3xl">🚓</span>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[#cbd5e1]" />
          <At x="26%" b="16%">
            <div style={anim('evBob', 0.6, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={50} mood="happy" />
            </div>
          </At>
          {/* Wallet goes from the player to the police officer */}
          <At x="34%" b="30%" z={20}>
            <span style={anim('evDriveAcross', 1.0, 0.4, { '--from': '0px', '--to': '120px' } as React.CSSProperties, 'ease-in-out')} className={emoji('text-2xl')}>👛</span>
          </At>
          <At x="76%" b="16%">
            <span className={emoji('text-5xl')}>👮</span>
          </At>
          <At x="50%" b="62%" z={30}>
            <span style={anim('evPop', 0.5, 1.5)} className={emoji('text-4xl')}>💌</span>
          </At>
          <At x="62%" b="70%" z={30}>
            <span style={anim('evPop', 0.4, 1.9)} className={emoji('text-2xl')}>💖</span>
          </At>
        </div>
      );

    case 'scam':
      return (
        <div className={`${frame} bg-gradient-to-b from-slate-300 to-slate-100`}>
          <span className="absolute top-3 left-4 text-3xl">🏠</span>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#cbd5e1]" />
          <At x="30%" b="16%">
            <div style={anim('evShake', 0.25, 1.2, {}, 'linear', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="shock" />
            </div>
          </At>
          {/* Ringing phone */}
          <At x="48%" b="52%" z={20}>
            <span style={anim('evShake', 0.15, 0, {}, 'linear', 6)} className={emoji('text-4xl')}>📞</span>
          </At>
          <At x="74%" b="18%">
            <span className={emoji('text-6xl')}>🏧</span>
          </At>
          {/* Savings fly away */}
          {[0, 1, 2].map((i) => (
            <At key={i} x="74%" b={`${48 + i * 8}%`} z={25}>
              <span
                style={anim('evDriveAcross', 1.0, 1.0 + i * 0.25, { '--from': '0px', '--to': '160px' } as React.CSSProperties, 'ease-in')}
                className={emoji('text-2xl')}
              >
                💸
              </span>
            </At>
          ))}
          <At x="30%" b="66%" z={30}>
            <span style={anim('evPop', 0.4, 1.6)} className={emoji('text-3xl')}>⚠️</span>
          </At>
        </div>
      );

    case 'layoff':
      return (
        <div className={`${frame} bg-gradient-to-b from-slate-200 to-sky-50`}>
          <span className="absolute top-2 right-4 text-5xl">🏢</span>
          <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#94a3b8]" />
          {/* Walking out with a box of belongings */}
          <At x="36%" b="16%">
            <div style={anim('evDriveAcross', 1.6, 0.8, { '--from': '60px', '--to': '-30px' } as React.CSSProperties, 'ease-out')}>
              <ChibiAvatar preset={preset} size={54} mood="sad" />
            </div>
          </At>
          <At x="44%" b="20%" z={20}>
            <span style={anim('evDriveAcross', 1.6, 0.8, { '--from': '60px', '--to': '-30px' } as React.CSSProperties, 'ease-out')} className={emoji('text-3xl')}>📦</span>
          </At>
          <At x="62%" b="56%" z={30}>
            <span style={anim('evPop', 0.5, 0.2)} className="px-2 py-0.5 rounded-lg bg-white border-2 border-slate-400 text-[11px] font-black text-slate-600 whitespace-nowrap">資遣通知</span>
          </At>
          <At x="24%" b="62%" z={30}>
            <span style={anim('evPop', 0.4, 1.8)} className={emoji('text-2xl')}>💧</span>
          </At>
        </div>
      );

    case 'trip':
      return (
        <div className={`${frame} bg-gradient-to-b from-sky-300 to-amber-50`}>
          <span className="absolute top-3 left-5 text-3xl">☁️</span>
          <span className="absolute top-8 right-10 text-2xl">☁️</span>
          <span className="absolute top-2 right-4 text-4xl">☀️</span>
          {/* Plane flies across the sky */}
          <At x="50%" b="62%" z={20}>
            <span style={anim('evDriveAcross', 2.2, 0.1, { '--from': '-320px', '--to': '320px' } as React.CSSProperties, 'linear')} className={emoji('text-5xl')}>✈️</span>
          </At>
          <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[#fde68a]" />
          <At x="18%" b="18%">
            <span className={emoji('text-5xl')}>🌴</span>
          </At>
          <At x="44%" b="16%">
            <div style={anim('evBob', 0.6, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={54} mood="happy" />
            </div>
          </At>
          <At x="62%" b="16%">
            <span style={anim('evPop', 0.5, 0.6)} className={emoji('text-4xl')}>🧳</span>
          </At>
          <At x="82%" b="18%">
            <span style={anim('evPop', 0.5, 1.0)} className={emoji('text-4xl')}>📸</span>
          </At>
          {[30, 70].map((x, i) => (
            <At key={x} x={`${x}%`} b="40%" z={25}>
              <span style={anim('evRise', 1.6, 0.6 + i * 0.4, {}, 'ease-out', 'infinite')} className={emoji('text-2xl')}>💖</span>
            </At>
          ))}
        </div>
      );

    case 'business':
      return (
        <div className={`${frame} bg-gradient-to-b from-sky-200 to-slate-50`}>
          <span className="absolute top-2 left-4 text-4xl">🏢</span>
          <span className="absolute top-2 right-4 text-4xl">🏙️</span>
          {/* Rail track */}
          <div className="absolute inset-x-0 bottom-0 h-[22%] bg-[#94a3b8]">
            <div className="absolute top-1 inset-x-0 border-t-4 border-[#64748b]" />
          </div>
          {/* High-speed train passes */}
          <At x="50%" b="20%" z={20}>
            <span style={anim('evDriveAcross', 1.6, 1.4, { '--from': '340px', '--to': '-360px' } as React.CSSProperties, 'linear')} className={emoji('text-6xl')}>🚄</span>
          </At>
          <At x="36%" b="24%">
            <div style={anim('evBob', 0.7, 0, {}, 'ease-in-out', 'infinite')}>
              <ChibiAvatar preset={preset} size={52} mood="happy" />
            </div>
          </At>
          <At x="52%" b="24%">
            <span className={emoji('text-4xl')}>💼</span>
          </At>
          <At x="66%" b="58%" z={30}>
            <span style={anim('evPop', 0.5, 0.3)} className="px-2 py-0.5 rounded-lg bg-white border-2 border-sky-400 text-[11px] font-black text-sky-700 whitespace-nowrap">出差通知</span>
          </At>
          <At x="80%" b="30%" z={25}>
            <span style={anim('evPop', 0.5, 0.9)} className={emoji('text-3xl')}>🧾</span>
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
function InsuranceOutcomeFx({ outcome }: { outcome: 'good' | 'insured' | 'uninsured' }) {
  if (outcome === 'good') {
    return (
      <div className="relative h-20 flex items-center justify-center overflow-hidden">
        {[12, 30, 70, 88].map((x, i) => (
          <span key={x} style={{ left: `${x}%`, top: 0, ...anim('evCoinRain', 1.1, 0.2 + i * 0.18, {}, 'ease-in', 2) }} className="absolute text-xl">
            {i % 2 ? '🎊' : '💰'}
          </span>
        ))}
        <span style={anim('evPop', 0.5, 0)} className="text-5xl">🎉</span>
      </div>
    );
  }
  if (outcome === 'insured') {
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
// 6. LIFE JOURNEY BOARD DATA (48 tiles: 4 life stages x 12; card tiles grow with age 2 → 3 → 4 → 5)
// ==========================================
// What happens to a player's assets when they land on a life-stage tile
interface TileEffect {
  cash?: number;
  property?: number;
}

interface BoardTile {
  id: number;
  name: string;
  type: 'START' | 'LIFE' | 'CHANCE' | 'FATE' | 'CORNER' | 'RISK' | 'INSURANCE';
  price?: number; // insurance premium (INSURANCE tile only)
  color: string;
  icon: string;
  gridArea: string;
  row: number;
  col: number;
  model: number; // legacy model id (3D tile blocks were removed)
  baseBuilding?: number;
  hasTree?: boolean;
  effect?: TileEffect; // milestone (corner) asset change; ordinary LIFE tiles pay the player's income instead
  landMsg?: string;
}

// 13x13 ring board: 48 tiles, 12 per side. Corners are 0, 12, 24, 36.
// Each side is one life stage: top 幼年, right 青年, bottom 中年, left 老年.
const BOARD_SIZE = 13;
const SIDE_LEN = BOARD_SIZE - 1;
const ringPos = (i: number): [number, number] => {
  const n = SIDE_LEN;
  if (i <= n) return [0, i]; // top row, left -> right
  if (i <= 2 * n) return [i - n, n]; // right column, top -> bottom
  if (i <= 3 * n) return [n, 3 * n - i]; // bottom row, right -> left
  return [4 * n - i, 0]; // left column, bottom -> top
};

// Life stages, one per board side (in walking order)
const LIFE_STAGES = [
  { name: '幼年', icon: '🧒', color: '#f472b6', tint: '#fdf2f8' },
  { name: '青年', icon: '🧑‍🎓', color: '#0ea5e9', tint: '#f0f9ff' },
  { name: '中年', icon: '👨‍👩‍👧', color: '#f59e0b', tint: '#fffbeb' },
  { name: '老年', icon: '👴', color: '#10b981', tint: '#ecfdf5' },
] as const;
const stageOf = (tileIdx: number) => LIFE_STAGES[Math.floor(tileIdx / SIDE_LEN) % 4];

const CHANCE_MODEL = 99;
const LIFE_MODEL = 98; // generic life-event milestone block (shows the tile emoji)

const CHANCE_DEF = { name: "機會卡", type: "CHANCE", color: "#f59e0b", icon: "🍀", model: CHANCE_MODEL } as const;
const FATE_DEF = { name: "命運卡", type: "FATE", color: "#8b5cf6", icon: "🔮", model: CHANCE_MODEL } as const;
const INSURANCE_DEF = { name: "保障規劃", type: "INSURANCE", color: "#10b981", icon: "🛡️", model: 14 } as const;

const BOARD_TILE_DEFS: Omit<BoardTile, 'id' | 'row' | 'col' | 'gridArea'>[] = [
  // 幼年 Childhood (Top Row, 0-11)
  { name: "呱呱落地", type: "START", color: "#f472b6", icon: "👶", model: LIFE_MODEL, baseBuilding: 1, hasTree: true },
  { name: "打預防針", type: "LIFE", color: "#22c55e", icon: "💉", model: LIFE_MODEL },
  FATE_DEF,
  { name: "上幼兒園", type: "LIFE", color: "#fb7185", icon: "🧸", model: LIFE_MODEL },
  { name: "領壓歲錢", type: "LIFE", color: "#ef4444", icon: "🧧", model: LIFE_MODEL },
  { name: "上小學", type: "LIFE", color: "#fb923c", icon: "🎒", model: LIFE_MODEL },
  { name: "才藝課", type: "LIFE", color: "#a855f7", icon: "🎹", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "比賽得獎", type: "LIFE", color: "#eab308", icon: "🏅", model: LIFE_MODEL },
  { name: "上國中", type: "LIFE", color: "#6366f1", icon: "🏫", model: LIFE_MODEL },
  { name: "畢業旅行", type: "LIFE", color: "#0ea5e9", icon: "🚌", model: LIFE_MODEL },
  { name: "考上高中", type: "LIFE", color: "#14b8a6", icon: "📝", model: LIFE_MODEL },
  // 青年 Youth (Right Column, 12-23) — 3 card tiles
  { name: "考上大學", type: "CORNER", color: "#8b5cf6", icon: "🎓", model: LIFE_MODEL, effect: { cash: -60000 }, landMsg: "繳大學學費與住宿費", hasTree: true },
  { name: "打工存錢", type: "LIFE", color: "#f97316", icon: "🧋", model: LIFE_MODEL },
  FATE_DEF,
  { name: "考駕照開車", type: "RISK", color: "#ef4444", icon: "🚗", model: LIFE_MODEL },
  { name: "出國留學", type: "LIFE", color: "#0ea5e9", icon: "✈️", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "第一份工作", type: "LIFE", color: "#0284c7", icon: "💼", model: LIFE_MODEL },
  INSURANCE_DEF,
  FATE_DEF,
  { name: "考取證照", type: "LIFE", color: "#16a34a", icon: "📜", model: LIFE_MODEL },
  { name: "步入禮堂", type: "LIFE", color: "#ec4899", icon: "💍", model: LIFE_MODEL },
  { name: "斜槓副業", type: "LIFE", color: "#a855f7", icon: "💡", model: LIFE_MODEL },
  // 中年 Midlife (Bottom Row, 24-35) — 4 card tiles
  { name: "買第一間房", type: "CORNER", color: "#b45309", icon: "🏠", model: LIFE_MODEL, effect: { cash: -150000, property: 180000 }, landMsg: "付頭期款買房，現金變成房產", hasTree: true },
  { name: "寶寶誕生", type: "LIFE", color: "#f472b6", icon: "🍼", model: LIFE_MODEL },
  FATE_DEF,
  { name: "孩子上學", type: "LIFE", color: "#6366f1", icon: "📚", model: LIFE_MODEL },
  { name: "升遷加薪", type: "LIFE", color: "#0284c7", icon: "👔", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "自行創業", type: "LIFE", color: "#10b981", icon: "🏪", model: LIFE_MODEL },
  FATE_DEF,
  { name: "房屋裝修", type: "LIFE", color: "#c2410c", icon: "🛠️", model: LIFE_MODEL },
  { name: "健康檢查", type: "LIFE", color: "#22c55e", icon: "🩺", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "年終分紅", type: "LIFE", color: "#eab308", icon: "💰", model: LIFE_MODEL },
  // 老年 Golden years (Left Column, 36-47) — 5 card tiles
  { name: "光榮退休", type: "CORNER", color: "#059669", icon: "🏖️", model: LIFE_MODEL, effect: { cash: 50000 }, landMsg: "光榮退休，領取退休金", hasTree: true },
  INSURANCE_DEF,
  FATE_DEF,
  { name: "含飴弄孫", type: "LIFE", color: "#e11d48", icon: "👴", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "環遊世界", type: "LIFE", color: "#0891b2", icon: "🌍", model: LIFE_MODEL },
  FATE_DEF,
  { name: "志工服務", type: "LIFE", color: "#84cc16", icon: "🤝", model: LIFE_MODEL },
  CHANCE_DEF,
  { name: "長照規劃", type: "LIFE", color: "#64748b", icon: "🏡", model: LIFE_MODEL },
  FATE_DEF,
  { name: "金婚紀念", type: "LIFE", color: "#d97706", icon: "💛", model: LIFE_MODEL },
];

const BOARD_TILES: BoardTile[] = BOARD_TILE_DEFS.map((t, id) => {
  const [row, col] = ringPos(id);
  return { ...t, id, row, col, gridArea: `${row + 1} / ${col + 1}` };
});

const CAR_CRASH_TILE = BOARD_TILES.findIndex((t) => t.type === 'RISK');
const FIRST_CHANCE_TILE = BOARD_TILES.findIndex((t) => t.type === 'CHANCE' || t.type === 'FATE');

// ==========================================
// 7. 機會卡 / 命運卡 DATA & MULTIPLAYER TYPES
// 命運卡: life risks (insurance decides deduct vs. claim). 機會卡: mostly good news, sometimes a small mishap.
// ==========================================
type Insurer = '法國巴黎人壽' | '法國巴黎產險' | '勞動部勞工保險局' | '金管會保險局' | '市售商品（遊戲示意）';

type CardDeck = 'chance' | 'fate';

interface ChanceCard {
  id: number;
  decks: CardDeck[]; // which pile(s) the card is shuffled into
  stages: number[]; // life stages where it can happen: 0 幼年, 1 青年, 2 中年, 3 老年
  insurance?: InsuranceKey; // product that pays out for this event
  health?: boolean; // health crisis: much more likely in 老年
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
  calc?: string; // how insuredBonus follows from the official benefit rules
  alsoCovers?: { key: InsuranceKey; bonus: number; note: string }[]; // other policies that also pay
  spend?: boolean; // planned life spending (e.g. a holiday): a cost, but not a mishap
  presetIds?: string[]; // only these family backgrounds can draw it (e.g. 上班族 business trips)
  tip: string; // verified fact (insurer website or government service)
}

// Official sources:
//  法國巴黎人壽 https://life.cardif.com.tw  (傷害保險 a232、健康保險 a233、理賠程序 a314、關於我們 a1)
//  法國巴黎產險 https://nonlife.cardif.com.tw (居家保險 a21、人身保險 a22、財產保險 a23)
const TIP_15_DAYS = '法國巴黎人壽理賠程序：文件齊備後，保險人應於 15 天內給付理賠金。';
const TIP_DIAGNOSIS = '申請理賠的「診斷證明書」須為正本，或加蓋醫院紅色印章的副本，不接受影印本。';
const TIP_LIFE_HOTLINE = '法國巴黎人壽服務／申訴專線：0800-012-899。';
const TIP_165 = '詐騙損失保險不會理賠。接到可疑電話先掛斷，撥打 165 反詐騙諮詢專線查證。';
const TIP_DISABILITY = '失能等級依「失能程度與保險金給付表」判定，等級越高給付越多；申請時要附醫師開立的失能診斷書。';
const TIP_RECEIPT = '實支實付型保險依醫療費用收據理賠，看病記得保留收據。';
const TIP_LABOR = '職災傷病給付：不能工作的第 4 天起發給，前 2 個月按平均月投保薪資，之後按 70%，最長 2 年（勞動部勞工保險局）。';
const TIP_LIFE_INSURANCE = '一年期定期壽險保費便宜，但年紀越大續保越貴，也有續保年齡上限；終身壽險保費較高，但保障到老。';
const TIP_PUBLIC_TRANSPORT = '法國巴黎產險「永保平安傷害保險」對搭乘大眾運輸工具的乘客，另有「大眾交通意外身故保險金」保障。';
const TIP_UNEMPLOYMENT = '非自願離職的勞工，可以到就業服務站申請就業保險的「失業給付」。';

const CHANCE_CARDS: ChanceCard[] = [
  {
    id: 1,
    decks: ['fate'],
    stages: [0, 1, 2, 3],
    insurance: 'accident',
    title: "過馬路被車撞了！",
    desc: "綠燈過馬路，還是被闖紅燈的車子撞倒，住院 10 天，其中 2 天在加護病房…",
    deltaMoney: -40000,
    insuredBonus: (10 + 2) * ACCIDENT_DAILY,
    alsoCovers: [{ key: 'termMedical', bonus: 20000, note: '住院醫療雜費實支實付' }, { key: 'micro', bonus: 15000, note: '實支實付型傷害醫療' }],
    icon: "🚗",
    tag: "意外風險",
    scene: "car",
    insurer: "法國巴黎產險",
    claimName: "永保平安傷害保險",
    coverage: "傷害醫療保險金（日額型）：住院保險金、加護病房保險金",
    calc: `住院 10 天 × $${ACCIDENT_DAILY.toLocaleString()} ＋ 加護病房 2 天 × $${ACCIDENT_DAILY.toLocaleString()}`,
    tip: TIP_DIAGNOSIS,
  },
  {
    id: 2,
    decks: ['fate'],
    stages: [0, 1, 2],
    insurance: 'medical',
    health: true,
    title: "半夜急性盲腸炎",
    desc: "肚子痛到冒冷汗，救護車緊急送醫，開刀住院 5 天。",
    deltaMoney: -35000,
    insuredBonus: 5 * MEDICAL_DAILY + 3 * MEDICAL_DAILY + 0.5 * 5 * MEDICAL_DAILY,
    alsoCovers: [{ key: 'termMedical', bonus: 15000, note: '手術費實支實付' }],
    icon: "🏥",
    tag: "醫療風險",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "住院醫療保險（丙型）",
    coverage: "一般住院醫療日額、住院手術醫療、出院療養保險金",
    calc: `住院 5 天 × $${MEDICAL_DAILY.toLocaleString()} ＋ 手術（日額 × 3）＋ 出院療養（日額 × 50% × 5 天）`,
    tip: TIP_15_DAYS,
  },
  {
    id: 4,
    decks: ['fate', 'chance'],
    stages: [0, 1, 2],
    insurance: 'accident',
    health: true,
    title: "雨天踩到香蕉皮滑倒",
    desc: "捷運站外地板濕滑，伸手一撐，手腕的橈骨骨折，打石膏回家休養。",
    deltaMoney: -30000,
    insuredBonus: 28 * ACCIDENT_DAILY * 0.5,
    alsoCovers: [{ key: 'micro', bonus: 5000, note: '實支實付型傷害醫療' }],
    icon: "🍌",
    tag: "意外風險",
    scene: "fall",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險 傷害醫療保險給付附加條款（日額型）",
    coverage: "傷害醫療保險金（骨折未住院給付）",
    calc: `橈骨骨折 28 天 × 日額 $${ACCIDENT_DAILY.toLocaleString()} × 1/2（骨折未住院）`,
    tip: '骨折申請理賠時，依案件可能需要附上 X 光片。',
  },
  {
    id: 6,
    decks: ['fate', 'chance'],
    stages: [0, 1, 2, 3],
    insurance: 'accident',
    title: "夜市吃到食物中毒",
    desc: "路邊攤吃完上吐下瀉，送急診後住院觀察 3 天。",
    deltaMoney: -15000,
    insuredBonus: 3 * ACCIDENT_DAILY,
    alsoCovers: [{ key: 'termMedical', bonus: 5000, note: '住院雜費實支實付' }, { key: 'micro', bonus: 5000, note: '實支實付型傷害醫療' }],
    icon: "🍢",
    tag: "意外風險",
    scene: "food",
    insurer: "法國巴黎產險",
    claimName: "永保平安傷害保險",
    coverage: "傷害醫療保險金（日額型）住院保險金；另有食物中毒慰問保險金",
    calc: `住院 3 天 × $${ACCIDENT_DAILY.toLocaleString()}（慰問金依投保金額另計）`,
    tip: TIP_DIAGNOSIS,
  },
  {
    id: 11,
    decks: ['fate'],
    stages: [2, 3],
    insurance: 'critical',
    health: true,
    title: "健檢發現早期癌症",
    desc: "健康檢查發現第一期大腸直腸癌，要開刀和定期追蹤，好一段時間不能工作。",
    deltaMoney: -70000,
    insuredBonus: CANCER_SUM * 0.2,
    alsoCovers: [{ key: 'termMedical', bonus: 20000, note: '手術費實支實付' }],
    icon: "🎗️",
    tag: "疾病風險",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "愛有靠３防癌三年定期健康保險",
    coverage: "初次罹患癌症（初期）或癌症（輕度）保險金",
    calc: `保險金額 $${CANCER_SUM.toLocaleString()} × 20%（第一期大腸直腸癌屬「輕度」）`,
    tip: '定期健檢能及早發現癌症。愛有靠3 若確診「重度」癌症，可領保險金額 100%。',
  },
  {
    id: 15,
    decks: ['fate'],
    stages: [2, 3],
    insurance: 'medical',
    health: true,
    title: "突發中風住院",
    desc: "早上起床半邊手腳無力，緊急送醫，住院 10 天（含加護病房 2 天），出院後還要復健。",
    deltaMoney: -70000,
    insuredBonus: 10 * MEDICAL_DAILY + 2 * MEDICAL_DAILY + 3 * MEDICAL_DAILY + 0.5 * 10 * MEDICAL_DAILY,
    alsoCovers: [{ key: 'termMedical', bonus: 30000, note: '住院雜費實支實付' }],
    icon: "🧠",
    tag: "健康危機",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "住院醫療保險（丙型）",
    coverage: "一般住院、加護病房、住院治療處置、出院療養保險金",
    calc: `住院 10 天 ＋ 加護病房 2 天 ＋ 治療處置（日額 × 3）＋ 出院療養（日額 × 50% × 10 天），日額 $${MEDICAL_DAILY.toLocaleString()}`,
    tip: TIP_15_DAYS,
  },
  {
    id: 12,
    decks: ['chance'],
    stages: [1, 2, 3],
    title: "統一發票中獎了！",
    desc: "對發票發現末五碼跟頭獎號碼一樣，中了四獎，趕快去超商兌獎！",
    deltaMoney: 4000,
    icon: "🧾",
    tag: "好運降臨",
    scene: "invoice",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  {
    id: 13,
    decks: ['chance'],
    stages: [1, 2],
    title: "尾牙抽中大獎！",
    desc: "年底尾牙抽獎，竟然抽中現金大紅包！",
    deltaMoney: 30000,
    icon: "🧧",
    tag: "好運降臨",
    scene: "party",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  {
    id: 14,
    decks: ['chance'],
    stages: [0, 1, 2, 3],
    title: "撿到錢包交給警察",
    desc: "把撿到的錢包送到派出所，失主特地送上謝禮。",
    deltaMoney: 10000,
    icon: "👮",
    tag: "好人好事",
    scene: "lostfound",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  {
    id: 10,
    decks: ['chance'],
    stages: [1, 2],
    title: "健康檢查全部滿分！",
    desc: "年度健檢報告全綠燈，公司發健康獎金！保持健康也是最好的保障。",
    deltaMoney: 20000,
    icon: "💯",
    tag: "健康獎勵",
    scene: "health",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  // ---- 旅行・出差 (planned life events, not mishaps) ----
  {
    id: 25,
    decks: ['fate'],
    stages: [0],
    spend: true,
    title: "全家去墾丁玩",
    desc: "放暑假了！爸媽帶你去墾丁看海、玩沙、吃烤小卷。",
    deltaMoney: -10000,
    icon: "🏖️",
    tag: "家庭旅行",
    scene: "trip",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  {
    id: 26,
    decks: ['fate'],
    stages: [1, 2],
    spend: true,
    title: "出國去日本玩",
    desc: "存了一年的旅費，終於排到假，去日本吃拉麵、泡溫泉！",
    deltaMoney: -35000,
    icon: "🗾",
    tag: "出國旅行",
    scene: "trip",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  {
    id: 27,
    decks: ['fate'],
    stages: [1, 2],
    spend: true,
    title: "連假環島小旅行",
    desc: "趁連假搭火車環島，一路吃吃喝喝，看遍台灣的山和海。",
    deltaMoney: -12000,
    icon: "🚞",
    tag: "國內旅行",
    scene: "trip",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  {
    id: 28,
    decks: ['fate'],
    stages: [3],
    spend: true,
    title: "跟老朋友去旅行",
    desc: "退休後終於有空，跟老同學一起參加旅行團去花東看山看海。",
    deltaMoney: -15000,
    icon: "🧓",
    tag: "樂齡旅行",
    scene: "trip",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  {
    id: 29,
    decks: ['fate'],
    stages: [1, 2],
    presetIds: ['middle'],
    title: "被派去出公差",
    desc: "主管派你搭高鐵去台中出差三天，交通住宿公司全額報支，還有出差津貼。",
    deltaMoney: 6000,
    icon: "💼",
    tag: "上班族日常",
    scene: "business",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  {
    id: 30,
    decks: ['fate'],
    stages: [2],
    presetIds: ['middle'],
    title: "派駐海外出差",
    desc: "公司派你去新加坡出差兩週談合作，順利完成任務，領到海外出差津貼。",
    deltaMoney: 20000,
    icon: "🌏",
    tag: "上班族日常",
    scene: "business",
    claimName: "無需理賠",
    tip: TIP_PUBLIC_TRANSPORT,
  },
  // ---- 幼年 ----
  {
    id: 16,
    decks: ['fate'],
    stages: [0],
    insurance: 'medical',
    health: true,
    title: "感染腸病毒住院",
    desc: "幼兒園爆發腸病毒，發高燒、手腳長水泡，住院觀察 4 天。",
    deltaMoney: -25000,
    insuredBonus: 4 * MEDICAL_DAILY + 0.5 * 4 * MEDICAL_DAILY,
    alsoCovers: [{ key: 'termMedical', bonus: 8000, note: '住院雜費實支實付' }],
    icon: "🦠",
    tag: "兒童醫療",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "住院醫療保險（丙型）",
    coverage: "一般住院醫療日額、出院療養保險金",
    calc: `住院 4 天 × $${MEDICAL_DAILY.toLocaleString()} ＋ 出院療養（日額 × 50% × 4 天）`,
    tip: TIP_15_DAYS,
  },
  {
    id: 17,
    decks: ['fate', 'chance'],
    stages: [0],
    insurance: 'accident',
    health: true,
    title: "下課玩溜滑梯摔斷手",
    desc: "下課搶著玩溜滑梯，一個沒抓穩摔下來，手臂的尺骨不完全骨折，打石膏回家。",
    deltaMoney: -20000,
    insuredBonus: 28 * 0.5 * ACCIDENT_DAILY * 0.5,
    alsoCovers: [{ key: 'micro', bonus: 5000, note: '實支實付型傷害醫療' }],
    icon: "🛝",
    tag: "兒童意外",
    scene: "fall",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險 傷害醫療保險給付附加條款（日額型）",
    coverage: "傷害醫療保險金（骨折未住院給付）",
    calc: `尺骨 28 天 × 1/2（不完全骨折）× 日額 $${ACCIDENT_DAILY.toLocaleString()} × 1/2（未住院）`,
    tip: '骨折申請理賠時，依案件可能需要附上 X 光片。',
  },
  {
    id: 18,
    decks: ['chance'],
    stages: [0],
    title: "段考考全班第一！",
    desc: "努力讀書有回報，學校頒發獎學金，爸媽也加碼獎勵。",
    deltaMoney: 5000,
    icon: "💯",
    tag: "學業獎勵",
    scene: "health",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  {
    id: 19,
    decks: ['chance'],
    stages: [0],
    title: "過年領到大紅包",
    desc: "回爺爺奶奶家過年，親戚們都包了壓歲錢給你！",
    deltaMoney: 10000,
    icon: "🧧",
    tag: "過年好運",
    scene: "party",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  // ---- 青年・中年 ----
  {
    id: 20,
    decks: ['fate'],
    stages: [1, 2],
    title: "網購遇到假客服詐騙",
    desc: "接到「客服」電話說訂單設定錯誤，照指示操作網銀，存款就被轉走了。",
    deltaMoney: -30000,
    icon: "📞",
    tag: "詐騙風險",
    scene: "scam",
    claimName: "不在保障範圍",
    tip: TIP_165,
  },
  {
    id: 21,
    decks: ['fate'],
    stages: [2],
    title: "公司裁員被資遣",
    desc: "公司營運不佳大裁員，中年失業，好幾個月找不到新工作。",
    deltaMoney: -50000,
    icon: "📦",
    tag: "失業風險",
    scene: "layoff",
    claimName: "不在保障範圍",
    tip: TIP_UNEMPLOYMENT,
  },
  // ---- 老年 ----
  {
    id: 22,
    decks: ['fate'],
    stages: [3],
    insurance: 'accident',
    health: true,
    title: "浴室跌倒髖骨骨折",
    desc: "洗澡時浴室地板太滑，一跤跌倒摔斷大腿骨頸，開刀住院 7 天，出院後要坐輪椅復健。",
    deltaMoney: -70000,
    insuredBonus: 7 * ACCIDENT_DAILY + (60 - 7) * ACCIDENT_DAILY * 0.5,
    alsoCovers: [{ key: 'termMedical', bonus: 25000, note: '手術、人工關節自費特材' }, { key: 'micro', bonus: 15000, note: '實支實付型傷害醫療' }],
    icon: "🛁",
    tag: "高齡意外",
    scene: "fall",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險 傷害醫療保險給付附加條款（日額型）",
    coverage: "傷害醫療住院給付（含骨折未住院）",
    calc: `住院 7 天 × $${ACCIDENT_DAILY.toLocaleString()} ＋ 大腿骨頸 60 天扣掉已住院 7 天 = 53 天 × 日額 × 1/2`,
    tip: '骨折申請理賠時，依案件可能需要附上 X 光片。',
  },
  {
    id: 23,
    decks: ['fate'],
    stages: [3],
    title: "接到假檢警電話詐騙",
    desc: "對方自稱檢察官，說帳戶涉案要「監管」，一緊張就把退休金匯了出去。",
    deltaMoney: -60000,
    icon: "👮",
    tag: "詐騙風險",
    scene: "scam",
    claimName: "不在保障範圍",
    tip: TIP_165,
  },
  {
    id: 24,
    decks: ['chance'],
    stages: [3],
    title: "子女包孝親紅包",
    desc: "孩子們回家團聚，每人都包了孝親紅包，祝你身體健康！",
    deltaMoney: 20000,
    icon: "🧧",
    tag: "天倫之樂",
    scene: "party",
    claimName: "無需理賠",
    tip: TIP_LIFE_HOTLINE,
  },
  {
    id: 40,
    decks: ['fate'],
    stages: [1, 2],
    insurance: 'disability',
    health: true,
    title: "工作時機台夾傷手掌",
    desc: "趕工時手被機台夾到，開刀後手指無法彎曲，被評定為失能，只能換薪水比較低的工作。",
    deltaMoney: -120000,
    insuredBonus: DISABILITY_SUM * 0.2,
    alsoCovers: [
      { key: 'labor', bonus: 40000, note: '職災失能給付' },
      { key: 'micro', bonus: MICRO_SUM * 0.2, note: '傷害保險失能保險金' },
      { key: 'termMedical', bonus: 30000, note: '手術費實支實付' },
    ],
    icon: "✋",
    tag: "職場意外",
    scene: "hospital",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險（失能保險金）",
    coverage: "意外傷害致失能，依失能等級比例給付",
    calc: `失能保險金額 $${DISABILITY_SUM.toLocaleString()} × 第 9 級 20%（遊戲示意等級）`,
    tip: TIP_DISABILITY,
  },
  {
    id: 41,
    decks: ['fate'],
    stages: [1, 2],
    insurance: 'disability',
    health: true,
    title: "高處墜落，完全失能",
    desc: "從鷹架摔下傷到脊椎，被判定完全失能，需要長期照護，再也無法工作。",
    deltaMoney: -250000,
    insuredBonus: DISABILITY_SUM,
    alsoCovers: [
      { key: 'termLife', bonus: TERM_LIFE_SUM, note: '完全失能保險金' },
      { key: 'wholeLife', bonus: WHOLE_LIFE_SUM, note: '完全失能保險金' },
      { key: 'labor', bonus: 100000, note: '職災失能給付' },
      { key: 'micro', bonus: MICRO_SUM, note: '傷害保險失能保險金' },
    ],
    icon: "🏗️",
    tag: "重大意外",
    scene: "fall",
    insurer: "法國巴黎產險",
    claimName: "個人傷害保險（失能保險金）",
    coverage: "意外傷害致失能，依失能等級比例給付",
    calc: `失能保險金額 $${DISABILITY_SUM.toLocaleString()} × 第 1 級 100%`,
    tip: TIP_DISABILITY,
  },
  {
    id: 42,
    decks: ['fate'],
    stages: [2, 3],
    insurance: 'termMedical',
    health: true,
    title: "自費達文西手術",
    desc: "醫師建議用達文西機械手臂開刀，傷口小、恢復快，但手術和特材要自費，住院 5 天。",
    deltaMoney: -150000,
    insuredBonus: 100000,
    alsoCovers: [{ key: 'medical', bonus: 5 * MEDICAL_DAILY + 3 * MEDICAL_DAILY, note: '住院 5 天日額＋手術' }],
    icon: "🤖",
    tag: "醫療自費",
    scene: "hospital",
    insurer: "市售商品（遊戲示意）",
    claimName: "一年期實支實付醫療保險",
    coverage: "住院手術費用、醫療雜費依收據實支實付",
    calc: '手術及雜費限額 $100,000（遊戲示意）',
    tip: TIP_RECEIPT,
  },
  {
    id: 43,
    decks: ['fate', 'chance'],
    stages: [1, 2, 3],
    insurance: 'termMedical',
    health: true,
    title: "住院只剩單人房",
    desc: "急診後要住院，健保病房滿了，只能先住單人房 7 天，病房差額要自己付。",
    deltaMoney: -30000,
    insuredBonus: 7 * 2000,
    alsoCovers: [{ key: 'medical', bonus: 7 * MEDICAL_DAILY, note: '住院 7 天日額' }],
    icon: "🛏️",
    tag: "醫療自費",
    scene: "hospital",
    insurer: "市售商品（遊戲示意）",
    claimName: "一年期實支實付醫療保險",
    coverage: "病房費用差額實支實付",
    calc: '病房費每日限額 $2,000 × 7 天（遊戲示意）',
    tip: TIP_RECEIPT,
  },
  {
    id: 44,
    decks: ['fate', 'chance'],
    stages: [1, 2],
    insurance: 'labor',
    health: true,
    title: "上班途中被機車擦撞",
    desc: "騎車上班時被擦撞，腳踝骨折住院 3 天、休養一個月，屬於上下班途中的職業災害。",
    deltaMoney: -40000,
    insuredBonus: LABOR_WAGE,
    alsoCovers: [
      { key: 'accident', bonus: 3 * ACCIDENT_DAILY, note: '傷害住院 3 天日額' },
      { key: 'micro', bonus: 10000, note: '實支實付型傷害醫療' },
      { key: 'termMedical', bonus: 10000, note: '住院雜費實支實付' },
    ],
    icon: "🛵",
    tag: "職業災害",
    scene: "car",
    insurer: "勞動部勞工保險局",
    claimName: "勞工職業災害保險",
    coverage: "職災傷病給付（不能工作期間）",
    calc: `月投保薪資 $${LABOR_WAGE.toLocaleString()} × 1 個月（前 2 個月按全額發給）`,
    tip: TIP_LABOR,
  },
  {
    id: 45,
    decks: ['fate'],
    stages: [3],
    insurance: 'wholeLife',
    health: true,
    title: "中風後長期臥床",
    desc: "再次中風後沒辦法自理生活，被判定完全失能，要請看護長期照顧。",
    deltaMoney: -200000,
    insuredBonus: WHOLE_LIFE_SUM,
    alsoCovers: [
      { key: 'termLife', bonus: TERM_LIFE_SUM, note: '完全失能保險金（老年已不能續保）' },
      { key: 'termMedical', bonus: 30000, note: '住院雜費實支實付' },
    ],
    icon: "🧓",
    tag: "長期照顧",
    scene: "hospital",
    insurer: "法國巴黎人壽",
    claimName: "享e通小額終身壽險",
    coverage: "完全失能保險金",
    calc: `保險金額 $${WHOLE_LIFE_SUM.toLocaleString()}（遊戲示意保額）`,
    tip: TIP_LIFE_INSURANCE,
  },
];

// Face-down cards shown on the 機會 / 命運 draw screen
const PICK_CARD_COUNT = 6;

// 老年: health-crisis cards weigh this much more when drawing
const ELDER_HEALTH_WEIGHT = 3;

// Travel / business-trip cards weigh this much when drawing
const LIFE_EVENT_WEIGHT = 2;

// 青壯年 (青年・中年) get insurance sales pitches after collecting income; 幼年 never does
const AD_CHANCE = 0.45;
interface AdSource {
  icon: string;
  where: string;
  pitch: (product: string) => string;
}
const AD_SOURCES: AdSource[] = [
  { icon: '🧑‍💼', where: '路上遇到保險業務員', pitch: (n) => `先生小姐請留步！看您這麼年輕，要不要了解一下「${n}」？` },
  { icon: '🎪', where: '逛市集遇到保險攤位', pitch: (n) => `填問卷送小禮物！順便幫您做保障健檢，推薦您「${n}」～` },
  { icon: '📞', where: '手機接到推銷電話', pitch: (n) => `您好，這裡是保險專員，「${n}」現在投保最划算喔！` },
  { icon: '📱', where: '滑手機跳出廣告', pitch: (n) => `【限時推薦】一天不到一杯咖啡錢，就能擁有「${n}」！` },
];
interface InsuranceAd {
  key: InsuranceKey;
  source: AdSource;
}

// Events when a player lands on a tile where another player stands
interface MeetEvent {
  id: string;
  stages?: number[]; // life stages (0 幼年 … 3 老年) where this can happen; all if omitted
  title: string;
  icon: string;
  color: string;
  bad: boolean;
  desc: (me: string, other: string) => string;
  selfDelta: number;
  otherDelta: number;
  fx: string[];
  tip?: string;
}
const MEET_EVENTS: MeetEvent[] = [
  {
    id: 'fight',
    title: '吵架打起來了！',
    icon: '🥊',
    color: '#ef4444',
    bad: true,
    desc: (a, b) => `${a} 和 ${b} 為了搶位置吵起來，最後扭打成一團，兩人都掛彩送醫…`,
    selfDelta: -15000,
    otherDelta: -15000,
    fx: ['💢', '💥', '⭐'],
    tip: '打架受傷如果涉及犯罪行為（例如傷害罪），可能屬於保險的除外責任，不一定能理賠。',
  },
  {
    id: 'bump',
    title: '走路撞在一起',
    icon: '📱',
    color: '#f97316',
    bad: true,
    desc: (a, b) => `${a} 低頭滑手機撞到 ${b}，把對方的手機摔壞了，只好賠錢。`,
    selfDelta: -8000,
    otherDelta: 8000,
    fx: ['💥', '😵'],
  },
  {
    id: 'treat',
    title: '巧遇老朋友',
    icon: '🍜',
    color: '#0ea5e9',
    bad: false,
    desc: (a, b) => `${a} 在路上巧遇 ${b}，開心地請對方吃了一頓飯。`,
    selfDelta: -5000,
    otherDelta: 0,
    fx: ['💬', '😋'],
  },
  {
    id: 'study',
    stages: [0],
    title: '一起讀書考高分',
    icon: '📝',
    color: '#8b5cf6',
    bad: false,
    desc: (a, b) => `${a} 和 ${b} 放學一起讀書，考試都考了高分，爸媽各給一筆獎勵！`,
    selfDelta: 3000,
    otherDelta: 3000,
    fx: ['💯', '✨'],
  },
  {
    id: 'job',
    stages: [1, 2],
    title: '互相介紹工作',
    icon: '🤝',
    color: '#10b981',
    bad: false,
    desc: (a, b) => `${a} 和 ${b} 聊天交換情報，兩人都接到兼職案子！`,
    selfDelta: 10000,
    otherDelta: 10000,
    fx: ['✨', '💼'],
  },
];
interface MeetState {
  event: MeetEvent;
  otherIdx: number;
  tileIndex: number;
}

const DICE_MAX = 6; // standard 1-6 die
const MAX_NAME_LENGTH = 12;
const PASS_START_BONUS = 50000;
const MEET_CHANCE = 0.6; // landing on another player starts an interaction this often
const CPU_DECLINE_RENEWAL = 0.2; // chance a CPU chooses not to renew a policy

interface PlayerState {
  id: number;
  preset: CharacterPreset;
  position: number;
  money: number; // cash
  property: number; // home value
  insurance: InsuranceKey[]; // products this player holds
  isHuman: boolean;
  waiting: Partial<Record<InsuranceKey, number>>; // own turns left before cover starts (等待期)
  concealed: InsuranceKey[]; // bought while hiding a past hospital stay (違反告知義務)
  healthLog: string[]; // past hospital stays / injuries: what 健康告知 asks about
  incomeSkips: number; // ordinary tiles left with no income (on sick leave)
  debt: number; // money borrowed from the bank
  bankrupt: boolean;
  finished: boolean; // walked the whole lap of life and reached the finish (起點)
  premiums: Partial<Record<InsuranceKey, number>>; // premium agreed at purchase (incl. 加費)
  premiumStage: number; // life stage whose premiums are already paid
  premiumsPaid: number; // all premiums paid so far
  mishaps: number; // insurable accidents / illnesses met
  claimed: number; // insurance payouts received
  outOfPocket: number; // what those events cost after payouts
  history: string[]; // key events and decisions, sent to the AI analysis at the end
}

// ---- Premium renewal: every new life stage pays the premiums again ----
// Health products cost more as the player ages (game assumption); 一年期 products rise faster.
// 終身壽險, 勞保, 微型保險, home and warranty keep the same premium.
const AGE_RATES: Partial<Record<InsuranceKey, number[]>> = {
  medical: [1, 1, 1.2, 1.5],
  accident: [1, 1, 1.2, 1.5],
  critical: [1, 1, 1.2, 1.5],
  disability: [1, 1, 1.2, 1.5],
  termMedical: [1, 1, 1.5, 2.5],
  termLife: [1, 1, 2, 4],
};
const renewalCost = (p: PlayerState, k: InsuranceKey, stage: number) =>
  Math.round((p.premiums[k] ?? INSURANCE_PRODUCTS[k].price) * (AGE_RATES[k]?.[stage] ?? 1));

// ---- Buying insurance is a process (rules from the official product sheets / policy terms) ----
// 等待期: 住院醫療保險 diseases 30 days, 愛有靠3 cancer 90 days. The game counts it in the player's own turns.
const WAITING_TURNS: Partial<Record<InsuranceKey, number>> = { medical: 1, critical: 2, termMedical: 1 };
const WAITING_LABEL: Partial<Record<InsuranceKey, string>> = {
  medical: '疾病等待期 30 日',
  critical: '癌症等待期 90 日',
  termMedical: '疾病等待期 30 日',
};
// Products that ask health questions before underwriting (健康告知)
const NEEDS_DISCLOSURE: InsuranceKey[] = ['medical', 'accident', 'critical', 'termMedical', 'disability', 'termLife', 'wholeLife'];
const EXTRA_PREMIUM_RATE = 0.5; // 加費承保: +50% premium (game assumption)
const DECLINE_CHANCE = 0.3; // chance of 拒保 with a hospital history (game assumption)

// ---- What happens when cash runs out ----
const PROPERTY_SALE_RATE = 0.8; // a rushed home sale only fetches 80% of its value
const DEBT_INTEREST = 0.05; // interest charged on debt at the start of each own turn
const DEBT_LIMIT = 300000; // debt above this = bankrupt
const CASH_BUFFER = 20000; // cash kept aside before repaying debt

// Products whose events are hospital stays / injuries (they go on the health record and cost work days)
const HEALTH_INSURANCE: InsuranceKey[] = [
  'medical',
  'accident',
  'critical',
  'termMedical',
  'disability',
  'termLife',
  'wholeLife',
  'micro',
  'labor',
];

const UNINSURED_STORY: Record<InsuranceKey, string> = {
  medical: '沒有住院醫療險：病房費、手術費都要自己付，家人還得輪流請假來照顧。',
  accident: '沒有意外險：醫藥費自己付，養傷這段時間也沒有收入。',
  critical: '沒有防癌險：治療要花錢又不能工作，只好動用存款。',
  termMedical: '沒有實支實付醫療險：健保不給付的自費項目，全部要自己付。',
  disability: '沒有失能險：以後沒辦法做原本的工作，少賺的收入沒有人補。',
  termLife: '沒有壽險：完全失能後家裡少了一份收入，照顧費用也沒有著落。',
  wholeLife: '沒有壽險：完全失能後需要長期照顧，費用只能靠存款和家人。',
  micro: '沒有微型保險：一點小意外的醫藥費，對經濟弱勢家庭也是沉重負擔。',
  labor: '沒有勞保：上班途中受傷，休養期間沒有職災傷病給付。',
};

interface Shortfall {
  sold: number; // home value sold
  raised: number; // cash the sale brought in
  borrowed: number;
  bankrupt: boolean;
}

// Cash below zero: sell the home at a discount (if allowed), then borrow the rest.
const settleShortfall = (p: PlayerState, allowSale: boolean): { player: PlayerState; result: Shortfall | null } => {
  if (p.money >= 0) return { player: p, result: null };
  let { money, property, debt } = p;
  let sold = 0;
  let raised = 0;
  if (allowSale && property > 0) {
    sold = Math.min(property, Math.ceil(-money / PROPERTY_SALE_RATE));
    raised = Math.round(sold * PROPERTY_SALE_RATE);
    property -= sold;
    money += raised;
  }
  let borrowed = 0;
  if (money < 0) {
    borrowed = -money;
    debt += borrowed;
    money = 0;
  }
  const bankrupt = debt > DEBT_LIMIT;
  return {
    player: { ...p, money, property, debt, bankrupt: p.bankrupt || bankrupt },
    result: { sold, raised, borrowed, bankrupt },
  };
};

type ClaimStatus = 'paid' | 'uninsured' | 'waiting' | 'rescinded' | 'none';

// Result of one event card, worked out when the card is drawn
interface EventOutcome {
  status: ClaimStatus;
  bonus: number; // insurance actually paid (all policies)
  primaryBonus: number; // paid by the card's main product
  extras: { key: InsuranceKey; amount: number; note: string; paid: boolean }[]; // other policies
  loss: number; // card money after any medical discount
  net: number; // card money + payout
  incomeSkips: number; // sick-leave tiles added
  story: string[]; // what happened because of (missing) insurance
}

type BuyStep = 'disclose' | 'terms' | 'result';
type Underwriting = 'standard' | 'extra' | 'declined';
interface BuyFlow {
  key: InsuranceKey;
  kicker: string;
  color: string;
  step: BuyStep;
  concealed: boolean; // answered 「沒有」 although there is a hospital history
  agreed: boolean; // ticked 「我已閱讀」
  outcome?: Underwriting;
  price: number;
  atTurnStart?: boolean; // started from the renewal dialog: the player still has to roll afterwards
}

// 核保: the insurer only knows what was disclosed
// ==========================================
// DEMO MODE (open the page with ?demo): same story every time, for recording the showcase video.
// You play 中低收; your dice and event cards follow DEMO_SCRIPT, the computer players walk
// quietly through 幼年 and their pop-ups close by themselves.
// ==========================================
const DEMO = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo');
const DEMO_SCRIPT = {
  avatarId: 'poor',
  // 0 → 2 命運卡 → 8 → 13 (青年: next turn shows 續約＋加保) → 18 → 20 命運卡
  humanDice: [FIRST_CHANCE_TILE, 6, 5, 5, 2],
  // 過馬路被車撞了 (微型保險 pays part), then 突發中風住院 (shows what concealing / no cover does)
  humanCards: [1, 15],
  // computer players only step on ordinary 幼年 tiles: no pop-ups slow the video down
  cpuDice: [1, 2, 1, 1, 1, 1, 1, 1],
};

const underwrite = (key: InsuranceKey, hasHistory: boolean, concealed: boolean): Underwriting => {
  if (!hasHistory || concealed || key === 'accident' || !NEEDS_DISCLOSURE.includes(key)) return 'standard';
  if (DEMO) return 'extra'; // honest answer → 加費承保 (never a random 拒保 on camera)
  return Math.random() < DECLINE_CHANCE ? 'declined' : 'extra';
};

const shortfallLines = (r: Shortfall): string[] => [
  ...(r.sold
    ? [`現金不夠，只好把價值 $${r.sold.toLocaleString()} 的房子打八折賣掉，換到 $${r.raised.toLocaleString()}。`]
    : []),
  ...(r.borrowed
    ? [`還差 $${r.borrowed.toLocaleString()}，只好跟銀行借錢，之後每回合要付 ${DEBT_INTEREST * 100}% 利息。`]
    : []),
  ...(r.bankrupt ? [`負債超過 $${DEBT_LIMIT.toLocaleString()}，還不起了…破產出局！`] : []),
];

// Computer players always use these names, whatever family background they end up with
const CPU_NAMES = ['阿真', '小雲', '小怡'];
const DEFAULT_PLAYER_NAME = '你';

// 4 players, 3 family backgrounds. The human plays seat 0 (chosen background + name).
// The two other backgrounds always appear; the third CPU repeats background `extraIdx`.
const buildPlayers = (avatarIdx: number, name: string, extraIdx: number): PlayerState[] => {
  const human = { ...CHARACTER_MODELS[avatarIdx], name: name.trim() || DEFAULT_PLAYER_NAME };
  const cpuPresets = [...CHARACTER_MODELS.filter((_, i) => i !== avatarIdx), CHARACTER_MODELS[extraIdx]];
  const cpus = cpuPresets.map((preset, i) => ({ ...preset, name: CPU_NAMES[i] }));
  return [human, ...cpus].map((preset, idx) => ({
    id: idx,
    preset,
    position: 0,
    money: preset.startMoney,
    property: 0,
    insurance: [...preset.insurance],
    isHuman: idx === 0,
    waiting: {},
    concealed: [],
    healthLog: [],
    incomeSkips: 0,
    debt: 0,
    bankrupt: false,
    finished: false,
    premiums: Object.fromEntries((preset.freeInsurance ?? []).map((k) => [k, 0])) as Partial<Record<InsuranceKey, number>>,
    premiumStage: 0,
    premiumsPaid: 0,
    mishaps: 0,
    claimed: 0,
    outOfPocket: 0,
    history: [],
  }));
};

const sumIncome = (items: IncomeItem[]) => items.reduce((t, i) => t + i.amount, 0);
// Used when the AI analysis is unavailable (no API key, offline): a short rule-based write-up
const offlineAnalysis = (me: PlayerState, ranked: PlayerState[]): string => {
  const rank = ranked.findIndex((p) => p.id === me.id) + 1;
  const best = [...ranked].sort((a, b) => a.outOfPocket - b.outOfPocket)[0];
  const misses = me.history.filter((h) => h.includes('沒有') || h.includes('被解約') || h.includes('等待期'));
  const drops = me.history.filter((h) => h.includes('不續保') || h.includes('停效'));
  return [
    `【這局回顧】你排名第 ${rank}，遇到 ${me.mishaps} 次意外或疾病，保險理賠 $${me.claimed.toLocaleString()}，自己付了 $${me.outOfPocket.toLocaleString()}，總共繳了 $${me.premiumsPaid.toLocaleString()} 保費。`,
    me.claimed > 0
      ? `【做得好的地方】出事時有保單撐住，理賠幫你擋下了 $${me.claimed.toLocaleString()} 的支出。`
      : me.debt > 0 || me.bankrupt
        ? '【做得好的地方】你撐過了好幾次意外，也親身體會到沒有保障時，負債是怎麼累積起來的。'
        : '【做得好的地方】你省下了保費，這局也撐過來了，但遇到大事時沒有理賠可以分擔。',
    misses.length || drops.length
      ? `【可以改進的地方】${[...misses, ...drops].slice(0, 2).join('；')}。`
      : best.id === me.id
        ? `【可以改進的地方】你是自付最少的人。可以再想想：繳了 $${me.premiumsPaid.toLocaleString()} 保費，哪些保障是真的需要的？`
        : `【可以改進的地方】自付最少的是 ${best.preset.name}（$${best.outOfPocket.toLocaleString()}），可以比較看看保障規劃的差別。`,
    '【給你的建議】先補上「發生機率不高但損失很大」的風險，例如住院與意外，並記得按時續繳、據實告知。',
  ].join('\n\n');
};

const insuranceNames = (keys: InsuranceKey[]) => keys.map((k) => INSURANCE_PRODUCTS[k].name.replace('險', '')).join('、');

const INITIAL_PLAYERS: PlayerState[] = buildPlayers(0, CHARACTER_MODELS[0].name, 0);

// Slight 2x2 offset (%) on a tile so 4 characters standing on the same tile never overlap
const PLAYER_TILE_OFFSETS: [number, number][] = [
  [-2, -1.8],
  [2, -1.8],
  [-2, 1.8],
  [2, 1.8],
];

// CPU decision helpers
const CPU_THINK_MS = DEMO ? 300 : 1200; // demo mode: computer players move quickly
const CPU_READ_RESULT_MS = 3800;
const NOTICE_MS_CPU = DEMO ? 900 : 1900;
const NOTICE_MS_HUMAN = 3000;
const MONEY_FLOAT_MS = 1700;

// ==========================================
// 8. ASSET STATS, FLOATING +/- NUMBERS & CENTER NOTICES
// ==========================================
type StatKey = 'cash' | 'property' | 'total';
interface PlayerStats {
  cash: number;
  property: number;
  total: number;
}
interface MoneyFloat {
  id: number;
  playerIdx: number;
  stat: StatKey;
  delta: number;
}
interface TileNotice {
  allowAd?: boolean; // closing this notice may trigger an insurance sales pitch
  startOfTurn?: boolean; // shown before the player rolls: closing it does not end the turn
  icon: string;
  color: string;
  kicker: string;
  title: string;
  desc: string;
  effect?: TileEffect;
}

const HUD_STATS: { key: StatKey; icon: string; label: string }[] = [
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
  // Demo mode: how far each script has got
  const demoStep = useRef({ humanDice: 0, cpuDice: 0, humanCards: 0 });
  // Safety net only: the game normally ends when everyone has finished the lap
  const maxTurns = 4 * 60;
  const [hasRolled, setHasRolled] = useState(false);

  const [diceRoll, setDiceRoll] = useState(3);
  const [spinCount, setSpinCount] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [hopProgress, setHopProgress] = useState(0);
  const [logMessage, setLogMessage] = useState('建立你的角色，準備出發！');

  // Opening setup: choose a family background + name
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing'>('setup');
  const [setupStep, setSetupStep] = useState<'profile' | 'summary'>('profile');
  const [playerName, setPlayerName] = useState('');
  const [avatarIdx, setAvatarIdx] = useState(0);
  // Birth background is drawn at random; the player may still pick one by hand
  const [birthDrawn, setBirthDrawn] = useState(false);
  const [isDrawingBirth, setIsDrawingBirth] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [cameraMode, setCameraMode] = useState<'iso' | 'closeup' | 'top'>('iso');
  const [isDragging, setIsDragging] = useState(false);
  const [customRotZ, setCustomRotZ] = useState(-2);
  const [customRotX, setCustomRotX] = useState(32);
  // Desktop layout (same query as the `desk` variant in index.css): flatter board so far tiles stay readable
  const DESK_QUERY = '(min-width: 900px) and (min-height: 520px)';
  const [isDesk, setIsDesk] = useState(() => typeof window !== 'undefined' && window.matchMedia(DESK_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(DESK_QUERY);
    const onChange = () => setIsDesk(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const [isHighlightCar, setIsHighlightCar] = useState(false);
  const [pendingBuyTile, setPendingBuyTile] = useState<BoardTile | null>(null);
  const [tileNotice, setTileNotice] = useState<TileNotice | null>(null);

  // Chance Card Modal States
  const [chanceModalStep, setChanceModalStep] = useState<'closed' | 'pick' | 'animating' | 'revealed'>('closed');
  const [drawnChanceCard, setDrawnChanceCard] = useState<ChanceCard | null>(null);
  const [drawDeck, setDrawDeck] = useState<CardDeck>('fate');
  const [insuranceAd, setInsuranceAd] = useState<InsuranceAd | null>(null);
  const [meet, setMeet] = useState<MeetState | null>(null);

  // Final Winner Settlement Modal State
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [buyFlow, setBuyFlow] = useState<BuyFlow | null>(null);
  // End-of-game personal analysis written by Claude (server-side /api/analysis)
  const [analysis, setAnalysis] = useState<{ status: 'loading' | 'ai' | 'offline'; text: string } | null>(null);
  // New life stage: the human picks which policies to renew (CPUs decide on their own)
  const [renewal, setRenewal] = useState<{
    stage: number;
    expired: InsuranceKey[]; // policies that ended (一年期定期壽險 past renewal age)
    newLabor: boolean; // employer enrolled the player in 勞保 this stage
    items: { key: InsuranceKey; cost: number; keep: boolean; isNew: boolean }[]; // isNew: not held yet (加保)
  } | null>(null);
  // Policies picked to add in the renewal dialog, bought one by one before the player rolls
  const [buyQueue, setBuyQueue] = useState<InsuranceKey[]>([]);
  const [eventOutcome, setEventOutcome] = useState<EventOutcome | null>(null);
  // Auto-play: result screens close by themselves. Off = they wait for 繼續 so everyone can read them.
  const [autoPlay, setAutoPlay] = useState(() => {
    try {
      // Manual by default: auto-play only when this browser turned it on (new key, so the old default doesn't carry over)
      return localStorage.getItem('cardif-autoplay-v2') === 'on';
    } catch {
      return false;
    }
  });
  const toggleAutoPlay = () => {
    setAutoPlay((on) => {
      try {
        localStorage.setItem('cardif-autoplay-v2', on ? 'off' : 'on');
      } catch {
        /* storage unavailable: keep the choice for this session only */
      }
      return !on;
    });
  };

  // Floating "+12,000 / -25,000" numbers shown above the asset stats
  const [moneyFloats, setMoneyFloats] = useState<MoneyFloat[]>([]);
  const prevStatsRef = useRef<PlayerStats[] | null>(null);
  const prevPhaseRef = useRef(gamePhase);
  const floatIdRef = useRef(0);

  const currentPlayer = players[activeTurnIdx];
  const currentTile = BOARD_TILES[currentPlayer.position];
  const isHumanTurn = currentPlayer.isHuman;
  const humanBankrupt = players.some((p) => p.isHuman && p.bankrupt);
  const stillPlaying = (p: PlayerState) => !p.bankrupt && !p.finished;
  const gameOver =
    turnCount >= maxTurns || humanBankrupt || players.filter((p) => !p.bankrupt).length <= 1 || !players.some(stillPlaying);
  const finishedCount = players.filter((p) => p.finished).length;
  const roundNo = Math.floor(turnCount / players.length) + 1;

  // Cash + home value for any player
  const getPlayerStats = (playerIdx: number, playerList = players): PlayerStats => {
    const p = playerList[playerIdx];
    return { cash: p.money, property: p.property, total: p.money + p.property - p.debt };
  };

  const allStats = players.map((_, i) => getPlayerStats(i));
  const currentStats = allStats[activeTurnIdx];

  // Spawn a floating +/- number whenever a player's cash / home / total change
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
    const alive = players.filter((p) => !p.bankrupt);
    if (nextTurnCount >= maxTurns || humanBankrupt || alive.length <= 1 || !players.some(stillPlaying)) {
      setShowSettlementModal(true);
      setLogMessage(humanBankrupt ? '💥 你破產了，遊戲結束…' : '🏆 大家都走完人生旅程了！來看看結果！');
      return;
    }
    // Bankrupt players are out and finished players wait at the finish: skip their seats
    let nextIdx = (activeTurnIdx + 1) % players.length;
    while (!stillPlaying(players[nextIdx])) nextIdx = (nextIdx + 1) % players.length;
    setActiveTurnIdx(nextIdx);

    // Start of the next player's turn: waiting periods tick down, debt charges interest and is repaid
    const np = players[nextIdx];
    const interest = Math.round(np.debt * DEBT_INTEREST);
    const owed = np.debt + interest;
    const repay = Math.min(owed, Math.max(0, np.money - CASH_BUFFER));
    const nowCovered = (Object.keys(np.waiting) as InsuranceKey[]).filter((k) => (np.waiting[k] ?? 0) <= 1);

    // New life stage: renew every policy. No cash for one = it lapses (停效).
    const stageNow = Math.floor(np.position / SIDE_LEN) % 4;
    const renewing = stageNow !== np.premiumStage;
    const askHuman = renewing && np.isHuman;
    // Starting work: the employer enrolls the player in 勞保
    const getsLabor = renewing && stageNow === 1 && !!np.preset.laborAtWork && !np.insurance.includes('labor');
    // 一年期定期壽險 can't be renewed past the renewal age
    const expired: InsuranceKey[] =
      renewing && stageNow > TERM_LIFE_LAST_STAGE && np.insurance.includes('termLife') ? ['termLife'] : [];
    let cashLeft = np.money - repay;
    const renewed: InsuranceKey[] = [];
    const lapsed: InsuranceKey[] = []; // no cash for the premium
    const declined: InsuranceKey[] = []; // CPU chose not to renew
    if (renewing && !askHuman) {
      np.insurance.forEach((k) => {
        if (expired.includes(k)) return;
        const cost = renewalCost(np, k, stageNow);
        if (!MANDATORY_INSURANCE.includes(k) && Math.random() < CPU_DECLINE_RENEWAL) declined.push(k);
        else if (cashLeft >= cost) {
          cashLeft -= cost;
          renewed.push(k);
        } else lapsed.push(k);
      });
    }
    const renewTotal = np.money - repay - cashLeft;
    const keep = (k: InsuranceKey) => !lapsed.includes(k) && !declined.includes(k) && !expired.includes(k);

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== nextIdx) return p;
        const waiting: Partial<Record<InsuranceKey, number>> = {};
        (Object.keys(p.waiting) as InsuranceKey[]).forEach((k) => {
          const left = (p.waiting[k] ?? 0) - 1;
          if (left > 0 && keep(k)) waiting[k] = left;
        });
        const debt = p.debt + interest - repay;
        return {
          ...p,
          waiting,
          debt,
          money: p.money - repay - renewTotal,
          bankrupt: p.bankrupt || debt > DEBT_LIMIT,
          insurance: [...p.insurance.filter(keep), ...(getsLabor ? (['labor'] as InsuranceKey[]) : [])],
          premiums: getsLabor ? { ...p.premiums, labor: priceFor(p, 'labor') } : p.premiums,
          concealed: p.concealed.filter(keep),
          premiumStage: stageNow,
          premiumsPaid: p.premiumsPaid + renewTotal,
          history: renewing && !askHuman && (renewed.length || lapsed.length || declined.length)
            ? [
                ...p.history,
                ...(getsLabor ? [`${LIFE_STAGES[stageNow].name}・開始工作，公司投保勞工保險`] : []),
                ...(expired.length ? [`${LIFE_STAGES[stageNow].name}・一年期定期壽險超過續保年齡，保單到期`] : []),
                `${LIFE_STAGES[stageNow].name}・續繳保費 $${renewTotal.toLocaleString()}${declined.length ? `；選擇不續保${insuranceNames(declined)}` : ''}${lapsed.length ? `；現金不夠，${insuranceNames(lapsed)}停效` : ''}`,
              ]
            : p.history,
        };
      })
    );
    if (askHuman) {
      let budget = np.money - repay;
      setRenewal({
        stage: stageNow,
        expired,
        newLabor: getsLabor,
        items: [
          ...np.insurance.filter((k) => !expired.includes(k)).map((k) => {
            const cost = renewalCost(np, k, stageNow);
            const keep = budget >= cost;
            if (keep) budget -= cost;
            return { key: k, cost, keep, isNew: false };
          }),
          ...INSURANCE_KEYS.filter(
            (k) => !np.insurance.includes(k) && canBuy(np, k, stageNow) && !(getsLabor && k === 'labor')
          ).map((k) => ({
            key: k,
            cost: priceFor(np, k),
            keep: false,
            isNew: true,
          })),
        ],
      });
    } else if (renewing && (renewed.length || lapsed.length || declined.length || expired.length || getsLabor)) {
      const stage = LIFE_STAGES[stageNow];
      const older = stageNow >= 2 && renewed.some((k) => HEALTH_INSURANCE.includes(k));
      setTileNotice({
        startOfTurn: true,
        icon: '🧾',
        color: stage.color,
        kicker: `${stage.name}・保單續約`,
        title: lapsed.length ? '保費繳不出來…' : '繳續期保費',
        desc: [
          `${np.preset.name} 進入${stage.name}，保單要續約，再繳一次保費。`,
          renewed.length
            ? `${renewed.map((k) => `${INSURANCE_PRODUCTS[k].name} $${renewalCost(np, k, stageNow).toLocaleString()}`).join('、')}。`
            : '',
          older ? '年紀越大，健康險的保費越高。' : '',
          getsLabor ? '開始工作了，公司幫忙投保勞工保險。' : '',
          expired.length ? '一年期定期壽險超過續保年齡，保單到期了。' : '',
          declined.length ? `${np.preset.name} 決定不續繳${insuranceNames(declined)}，保單停效。` : '',
          lapsed.length ? `現金不夠，${insuranceNames(lapsed)}停效了，之後出事不會理賠。` : '',
        ].join(''),
        effect: renewTotal ? { cash: -renewTotal } : undefined,
      });
    }
    const notes = [
      ...(nowCovered.length ? [`🛡️ ${insuranceNames(nowCovered)}等待期結束，開始保障`] : []),
      ...(np.debt > 0
        ? [`🏦 負債利息 $${interest.toLocaleString()}${repay ? `，還款 $${repay.toLocaleString()}` : ''}，還欠 $${(owed - repay).toLocaleString()}`]
        : []),
      ...(renewTotal ? [`🧾 續繳保費 $${renewTotal.toLocaleString()}`] : []),
      ...(lapsed.length || declined.length ? [`⚠️ ${insuranceNames([...declined, ...lapsed])}停效`] : []),
    ];
    setLogMessage([turnPrompt(np), ...notes].join('｜'));
  };

  const showNotice = (n: TileNotice) => {
    setTileNotice(n);
    setLogMessage(`${n.icon} ${n.title}`);
  };

  const handleCloseNotice = () => {
    if (!tileNotice) return;
    const { allowAd, startOfTurn } = tileNotice;
    setTileNotice(null);
    if (startOfTurn) {
      nextQueuedBuy();
      return;
    }
    if (allowAd && maybeShowInsuranceAd()) return;
    advanceTurn();
  };

  // 青年・中年 only: sometimes a salesperson / phone ad recommends a missing insurance
  const maybeShowInsuranceAd = () => {
    const stageIdx = Math.floor(currentPlayer.position / SIDE_LEN) % 4;
    if (stageIdx !== 1 && stageIdx !== 2) return false;
    const options = INSURANCE_KEYS.filter(
      (k) =>
        !currentPlayer.insurance.includes(k) &&
        canBuy(currentPlayer, k, stageIdx) &&
        currentPlayer.money >= priceFor(currentPlayer, k)
    );
    if (DEMO || !options.length || Math.random() >= AD_CHANCE) return false;
    const ad: InsuranceAd = {
      key: options[Math.floor(Math.random() * options.length)],
      source: AD_SOURCES[Math.floor(Math.random() * AD_SOURCES.length)],
    };
    setInsuranceAd(ad);
    setLogMessage(`${ad.source.icon} ${currentPlayer.preset.name}${ad.source.where}…`);
    return true;
  };

  const rollDiceAndMove = (byCpu = false) => {
    if (gamePhase !== 'playing' || gameOver || hasRolled || isRolling || isWalking || chanceModalStep !== 'closed' || showSettlementModal) return;
    if (pendingBuyTile || tileNotice || insuranceAd || meet) return;
    if (!byCpu && !currentPlayer.isHuman) return;
    setHasRolled(true);
    setPendingBuyTile(null);
    setIsRolling(true);
    setSpinCount((prev) => prev + 1);
    // 幼年・青年: every turn brings the family's basic allowance (no wage while on sick leave)
    const stageNow = Math.floor(currentPlayer.position / SIDE_LEN) % 4;
    const allItems = currentPlayer.preset.turnAllowance[stageNow] ?? [];
    const onLeave = currentPlayer.incomeSkips > 0 && allItems.some((i) => i.work);
    const allowance = allItems.filter((i) => !(i.work && onLeave));
    const allowanceSum = sumIncome(allowance);
    if (allowanceSum || onLeave) {
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activeTurnIdx
            ? { ...p, money: p.money + allowanceSum, incomeSkips: onLeave ? p.incomeSkips - 1 : p.incomeSkips }
            : p
        )
      );
    }
    setLogMessage(
      `${allowance.map((i) => `${i.icon} ${i.label} +$${i.amount.toLocaleString()}｜`).join('')}${
        onLeave ? '🛌 請假休養，這輪沒有基本工資｜' : ''
      }🎲 ${currentPlayer.preset.name} 擲骰子中…`
    );

    // Make it easy for the human to hit a Chance tile, then the Car Crash tile, on early rolls
    let targetSteps = Math.floor(Math.random() * DICE_MAX) + 1;
    if (currentPlayer.position === 0 && activeTurnIdx === 0) targetSteps = FIRST_CHANCE_TILE;
    if (DEMO) {
      const d = demoStep.current;
      if (currentPlayer.isHuman && d.humanDice < DEMO_SCRIPT.humanDice.length) targetSteps = DEMO_SCRIPT.humanDice[d.humanDice++];
      else if (!currentPlayer.isHuman) targetSteps = DEMO_SCRIPT.cpuDice[d.cpuDice++ % DEMO_SCRIPT.cpuDice.length];
    }

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
        const done = curr === 0; // back at 起點: the whole life lap is done
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === activeTurnIdx
              ? {
                  ...p,
                  position: curr,
                  money: done ? p.money + PASS_START_BONUS : p.money,
                  finished: done || p.finished,
                  history: done ? [...p.history, `走完人生旅程，抵達終點`] : p.history,
                }
              : p
          )
        );
        currentStepCount++;

        setTimeout(() => {
          setHopProgress(0);
          if (done) {
            setIsWalking(false);
            const tile = BOARD_TILES[0];
            const left = players.filter((p, i) => i !== activeTurnIdx && stillPlaying(p)).length;
            showNotice({
              icon: '🏁',
              color: tile.color,
              kicker: '終點',
              title: '走完人生旅程！',
              desc: `${currentPlayer.preset.name} 從幼年走到老年，抵達終點，領到退休紀念金。${
                left ? `還有 ${left} 位玩家在路上，等大家都抵達就結算。` : '大家都抵達了，準備結算！'
              }`,
              effect: { cash: PASS_START_BONUS },
            });
            return;
          }
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

  const handleTileLanded = (tileIndex: number, skipMeet = false) => {
    const tile = BOARD_TILES[tileIndex];
    const pName = currentPlayer.preset.name;

    // Landed where another player stands → a meeting event happens first
    const others = players.map((_, i) => i).filter((i) => i !== activeTurnIdx && players[i].position === tileIndex);
    if (!DEMO && !skipMeet && tileIndex !== 0 && others.length && Math.random() < MEET_CHANCE) {
      const otherIdx = others[Math.floor(Math.random() * others.length)];
      const stageIdx = Math.floor(tileIndex / SIDE_LEN) % 4;
      const pool = MEET_EVENTS.filter((e) => !e.stages || e.stages.includes(stageIdx));
      const event = pool[Math.floor(Math.random() * pool.length)];
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activeTurnIdx
            ? { ...p, money: p.money + event.selfDelta }
            : idx === otherIdx
            ? { ...p, money: p.money + event.otherDelta }
            : p
        )
      );
      setMeet({ event, otherIdx, tileIndex });
      setLogMessage(`${event.icon} ${pName} 遇到 ${players[otherIdx].preset.name}：${event.title}`);
      return;
    }

    if (tile.type === 'CHANCE' || tile.type === 'FATE') {
      const deck: CardDeck = tile.type === 'CHANCE' ? 'chance' : 'fate';
      setDrawDeck(deck);
      setLogMessage(`${tile.icon} ${pName} 踩到${tile.name}！抽一張吧`);
      setChanceModalStep('pick');
      return;
    }

    if (tile.type === 'RISK') {
      setIsHighlightCar(true);
      runEvent(CHANCE_CARDS.find((c) => c.scene === 'car')!);
      return;
    }

    if (tile.type === 'INSURANCE') {
      const missing = INSURANCE_KEYS.filter(
        (k) => !currentPlayer.insurance.includes(k) && canBuy(currentPlayer, k, Math.floor(tileIndex / SIDE_LEN) % 4)
      );
      const affordable = missing.filter((k) => currentPlayer.money >= priceFor(currentPlayer, k));
      if (affordable.length) {
        setPendingBuyTile(tile);
        setLogMessage(`🛡️ ${pName} 來到保障規劃站，要補哪一種保險？`);
      } else {
        showNotice({
          icon: '🛡️',
          color: tile.color,
          kicker: tile.name,
          title: missing.length ? '現金不足，無法投保' : '保障已經很完整！',
          desc: missing.length
            ? `${pName} 的現金不夠支付保費，下次再來吧…`
            : `${pName} 檢視了保單，各種保障一切正常。`,
        });
      }
      return;
    }

    // Ordinary life tile: a life moment with no income (money comes from the per-turn allowance)
    if (tile.type === 'LIFE') {
      setLogMessage(`${tile.icon} ${pName}：${stageOf(tileIndex).name}・${tile.name}`);
      setTimeout(() => {
        if (!maybeShowInsuranceAd()) advanceTurn();
      }, DEMO && !isHumanTurn ? 150 : 600);
      return;
    }

    if (tile.effect) {
      const { cash = 0, property = 0 } = tile.effect;
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activeTurnIdx ? { ...p, money: p.money + cash, property: p.property + property } : p
        )
      );
      const net = cash + property;
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
      desc: `${pName} 剛好停在起點，又長大一歲了`,
    });
  };

  // Pick a Chance Card -> play the event animation -> reveal result
  const handlePickChanceCard = () => {
    const stageIdx = Math.floor(currentPlayer.position / SIDE_LEN) % 4;
    const elder = stageIdx === 3;
    const pile = CHANCE_CARDS.filter(
      (c) =>
        c.stages.includes(stageIdx) &&
        (!c.presetIds || c.presetIds.includes(currentPlayer.preset.id)) &&
        (c.decks.includes(drawDeck) || (elder && c.health))
    );
    // Trips and business trips come up more often, so 命運卡 isn't only accidents
    const weightOf = (c: ChanceCard) =>
      elder && c.health ? ELDER_HEALTH_WEIGHT : c.spend || c.presetIds ? LIFE_EVENT_WEIGHT : 1;
    let r = Math.random() * pile.reduce((t, c) => t + weightOf(c), 0);
    let card = pile.find((c) => (r -= weightOf(c)) < 0) ?? pile[pile.length - 1];
    if (DEMO && currentPlayer.isHuman && demoStep.current.humanCards < DEMO_SCRIPT.humanCards.length) {
      const id = DEMO_SCRIPT.humanCards[demoStep.current.humanCards++];
      card = CHANCE_CARDS.find((c) => c.id === id) ?? card;
    }
    runEvent(card);
  };

  const runEvent = (randomCard: ChanceCard) => {
    setDrawnChanceCard(randomCard);
    setChanceModalStep('animating');
    setLogMessage(`${randomCard.icon} ${currentPlayer.preset.name}：${randomCard.title}`);

    const me = currentPlayer;
    const key = randomCard.insurance;
    const isMishap = randomCard.deltaMoney < 0 && !randomCard.spend;
    let status: ClaimStatus = 'none';
    if (key && randomCard.insuredBonus && isMishap) {
      if (!me.insurance.includes(key)) status = 'uninsured';
      else if (me.waiting[key]) status = 'waiting';
      else if (me.concealed.includes(key)) status = 'rescinded';
      else status = 'paid';
    }
    const isHealth = !!key && HEALTH_INSURANCE.includes(key) && isMishap;
    const costRate = isHealth ? me.preset.medicalCostRate ?? 1 : 1;
    const loss = Math.round(randomCard.deltaMoney * costRate);
    // Main product first, then every other policy that covers this event; never more than the loss
    let room = isMishap ? -loss : 0;
    const primaryBonus = status === 'paid' ? Math.min(randomCard.insuredBonus!, room) : 0;
    room -= primaryBonus;
    const extras: EventOutcome['extras'] = [];
    const rescindedExtra: InsuranceKey[] = [];
    if (isMishap) {
      for (const c of randomCard.alsoCovers ?? []) {
        const holds = me.insurance.includes(c.key);
        if (holds && me.concealed.includes(c.key)) {
          rescindedExtra.push(c.key);
          extras.push({ key: c.key, amount: 0, note: '隱瞞病史，契約被解除', paid: false });
        } else if (holds && !me.waiting[c.key]) {
          const amount = Math.min(c.bonus, room);
          room -= amount;
          extras.push({ key: c.key, amount, note: c.note, paid: true });
        } else {
          extras.push({ key: c.key, amount: c.bonus, note: holds ? '還在等待期' : c.note, paid: false });
        }
      }
    }
    const bonus = primaryBonus + extras.filter((x) => x.paid).reduce((t, x) => t + x.amount, 0);
    const netDelta = loss + bonus;
    const payers = [
      ...(primaryBonus ? [key!] : []),
      ...extras.filter((x) => x.paid && x.amount > 0).map((x) => x.key),
    ];
    // No payout for a hospital stay / injury: sick leave without income
    const hasWork = (me.preset.turnAllowance[Math.floor(me.position / SIDE_LEN) % 4] ?? []).some((i) => i.work);
    const incomeSkips = isHealth && hasWork && !payers.length ? (randomCard.deltaMoney <= -70000 ? 2 : 1) : 0;

    const story: string[] = [];
    const prodName = key ? INSURANCE_PRODUCTS[key].name : '';
    if (costRate < 1)
      story.push(`低收入戶看病免健保部分負擔，醫療費從 $${(-randomCard.deltaMoney).toLocaleString()} 降到 $${(-loss).toLocaleString()}。`);
    if (status === 'uninsured') {
      story.push(UNINSURED_STORY[key!]);
      story.push(`如果有投保${prodName}，這次可以領 $${Math.min(randomCard.insuredBonus!, -loss).toLocaleString()}。`);
    } else if (status === 'waiting') {
      story.push(`${prodName}還在等待期（${WAITING_LABEL[key!] ?? '等待期'}），保單還沒開始保障，這次不賠。`);
    } else if (status === 'rescinded') {
      story.push(
        `保險公司調閱病歷，發現投保時隱瞞了「${me.healthLog[0] ?? '過去的住院紀錄'}」。違反告知義務，契約被解除，這次不賠，保單也沒了。`
      );
    } else if (status === 'paid' && isHealth) {
      story.push('理賠金撐住了休養期間的開銷，不用擔心收入中斷。');
    }
    const paidExtras = extras.filter((x) => x.paid && x.amount > 0);
    if (paidExtras.length && status !== 'paid')
      story.push(`還好有${insuranceNames(paidExtras.map((x) => x.key))}分擔了 $${paidExtras.reduce((t, x) => t + x.amount, 0).toLocaleString()}。`);
    const missedExtras = extras.filter((x) => !x.paid && !me.insurance.includes(x.key) && canBuy(me, x.key, Math.floor(me.position / SIDE_LEN) % 4));
    if (missedExtras.length && room > 0)
      story.push(`如果還有${insuranceNames(missedExtras.map((x) => x.key))}，最多可以再領 $${Math.min(room, missedExtras.reduce((t, x) => t + x.amount, 0)).toLocaleString()}。`);
    if (rescindedExtra.length) story.push(`${insuranceNames(rescindedExtra)}也因為隱瞞病史被解除了。`);
    if (incomeSkips) story.push(`要請假休養，接下來 ${incomeSkips} 輪領不到基本工資。`);

    // Cash after the event; if it runs out, sell the home or borrow
    const after: PlayerState = {
      ...me,
      money: me.money + netDelta,
      incomeSkips: me.incomeSkips + incomeSkips,
      healthLog: isHealth ? [...me.healthLog, randomCard.title] : me.healthLog,
      mishaps: me.mishaps + (status !== 'none' ? 1 : 0),
      claimed: me.claimed + bonus,
      outOfPocket: me.outOfPocket + (status !== 'none' ? Math.max(0, -netDelta) : 0),
      insurance: me.insurance.filter((k) => !(status === 'rescinded' && k === key) && !rescindedExtra.includes(k)),
      concealed: me.concealed.filter((k) => !(status === 'rescinded' && k === key) && !rescindedExtra.includes(k)),
    };
    const { player: settled, result } = settleShortfall(after, true);
    if (result) story.push(...shortfallLines(result));
    const cost = Math.max(0, -netDelta);
    const what =
      payers.length
        ? `${insuranceNames(payers)}理賠 $${bonus.toLocaleString()}，自付 $${cost.toLocaleString()}`
        : status === 'uninsured'
          ? `沒有${prodName}，自付 $${cost.toLocaleString()}（有保可領 $${randomCard.insuredBonus!.toLocaleString()}）`
          : status === 'waiting'
            ? `${prodName}還在等待期，不賠，自付 $${cost.toLocaleString()}`
            : status === 'rescinded'
              ? `隱瞞病史被發現，${prodName}被解約，自付 $${cost.toLocaleString()}`
              : fmtDelta(netDelta);
    const aftermath = [
      incomeSkips ? `請假 ${incomeSkips} 輪沒工資` : '',
      result?.sold ? `賣房換現金 $${result.raised.toLocaleString()}` : '',
      result?.borrowed ? `借錢 $${result.borrowed.toLocaleString()}` : '',
      result?.bankrupt ? '破產出局' : '',
    ].filter(Boolean);
    settled.history = [
      ...settled.history,
      `${stageOf(me.position).name}・${randomCard.title}：${what}${aftermath.length ? `；${aftermath.join('、')}` : ''}`,
    ];
    setEventOutcome({ status, bonus, primaryBonus, extras, loss, net: netDelta, incomeSkips, story });

    setTimeout(() => {
      setChanceModalStep('revealed');
      setPlayers((prev) => prev.map((p, idx) => (idx === activeTurnIdx ? settled : p)));
      setLogMessage(`${randomCard.icon} ${me.preset.name}：${randomCard.title}（${fmtDelta(netDelta)}）`);
    }, EVENT_SCENE_MS);
  };

  const handleCloseChanceModal = () => {
    setChanceModalStep('closed');
    setDrawnChanceCard(null);
    setEventOutcome(null);
    setIsHighlightCar(false);
    advanceTurn();
  };

  const handleBuyInsurance = (key: InsuranceKey) => {
    if (!pendingBuyTile) return;
    const tile = pendingBuyTile;
    setPendingBuyTile(null);
    startBuy(key, tile.name, tile.color);
  };

  const handleAdBuy = () => {
    if (!insuranceAd) return;
    const ad = insuranceAd;
    setInsuranceAd(null);
    startBuy(ad.key, ad.source.where, '#0ea5e9');
  };

  const handleAdSkip = () => {
    if (!insuranceAd) return;
    setLogMessage(`🙅 ${currentPlayer.preset.name} 婉拒了推銷`);
    setInsuranceAd(null);
    setTimeout(() => advanceTurn(), 400);
  };

  const handleCloseMeet = () => {
    if (!meet) return;
    const { tileIndex } = meet;
    setMeet(null);
    handleTileLanded(tileIndex, true);
  };

  // Humans go through 健康告知 → 閱讀條款 → 核保; computer players decide on their own
  const startBuy = (key: InsuranceKey, kicker: string, color: string, atTurnStart = false) => {
    const price = priceFor(currentPlayer, key);
    if (isHumanTurn) {
      setBuyFlow({
        key,
        kicker,
        color,
        step: NEEDS_DISCLOSURE.includes(key) ? 'disclose' : 'terms',
        concealed: false,
        agreed: false,
        price,
        atTurnStart,
      });
      return;
    }
    const hasHistory = currentPlayer.healthLog.length > 0;
    const concealed = hasHistory && NEEDS_DISCLOSURE.includes(key) && Math.random() < 0.3;
    const outcome = underwrite(key, hasHistory, concealed);
    const finalPrice = outcome === 'extra' ? Math.round(price * (1 + EXTRA_PREMIUM_RATE)) : price;
    if (outcome === 'declined' || currentPlayer.money < finalPrice) {
      showNotice({
        icon: '📄',
        color,
        kicker,
        title: outcome === 'declined' ? '核保沒通過' : '加費後太貴，放棄投保',
        desc:
          outcome === 'declined'
            ? `${currentPlayer.preset.name} 有住院紀錄，保險公司評估後決定不承保${INSURANCE_PRODUCTS[key].name}。`
            : `${currentPlayer.preset.name} 有住院紀錄，保費要加 ${EXTRA_PREMIUM_RATE * 100}%，現金不夠，只好放棄。`,
      });
      return;
    }
    completeBuy(key, kicker, color, finalPrice, concealed, outcome);
  };

  const completeBuy = (
    key: InsuranceKey,
    kicker: string,
    color: string,
    price: number,
    concealed: boolean,
    outcome: Underwriting,
    atTurnStart = false
  ) => {
    const product = INSURANCE_PRODUCTS[key];
    const wait = WAITING_TURNS[key];
    setPlayers((prev) =>
      prev.map((p, idx) =>
        idx === activeTurnIdx
          ? {
              ...p,
              money: p.money - price,
              insurance: [...p.insurance, key],
              waiting: wait ? { ...p.waiting, [key]: wait } : p.waiting,
              concealed: concealed ? [...p.concealed, key] : p.concealed,
              premiums: { ...p.premiums, [key]: price },
              premiumsPaid: p.premiumsPaid + price,
              history: [
                ...p.history,
                `${stageOf(p.position).name}・投保${product.name} $${price.toLocaleString()}${outcome === 'extra' ? '（加費承保）' : ''}${concealed ? '（隱瞞病史）' : ''}`,
              ],
            }
          : p
      )
    );
    showNotice({
      icon: product.icon,
      color,
      kicker,
      title: `投保${product.name}${outcome === 'extra' ? '（加費承保）' : ''}！`,
      desc: wait
        ? `${currentPlayer.preset.name} 完成投保。${WAITING_LABEL[key]}，要再過 ${wait} 回合才開始保障！`
        : `${currentPlayer.preset.name} 完成投保，之後遇到「${product.desc}」都有理賠！`,
      effect: { cash: -price },
      startOfTurn: atTurnStart,
    });
  };

  const handleBuyFlowCancel = () => {
    if (!buyFlow) return;
    setLogMessage(`⏭️ ${currentPlayer.preset.name} 沒有投保${INSURANCE_PRODUCTS[buyFlow.key].name}`);
    const atTurnStart = buyFlow.atTurnStart;
    setBuyFlow(null);
    if (atTurnStart) nextQueuedBuy();
    else setTimeout(() => advanceTurn(), 400);
  };

  const handleBuyFlowSubmit = () => {
    if (!buyFlow) return;
    const outcome = underwrite(buyFlow.key, currentPlayer.healthLog.length > 0, buyFlow.concealed);
    const price = outcome === 'extra' ? Math.round(buyFlow.price * (1 + EXTRA_PREMIUM_RATE)) : buyFlow.price;
    setBuyFlow({ ...buyFlow, step: 'result', outcome, price });
  };

  const handleBuyFlowAccept = () => {
    if (!buyFlow || !buyFlow.outcome || buyFlow.outcome === 'declined') return;
    const f = buyFlow;
    setBuyFlow(null);
    completeBuy(f.key, f.kicker, f.color, f.price, f.concealed, f.outcome!, f.atTurnStart);
  };

  const buyableInsurance = INSURANCE_KEYS.filter(
    (k) =>
      !currentPlayer.insurance.includes(k) &&
      canBuy(currentPlayer, k, Math.floor(currentPlayer.position / SIDE_LEN) % 4) &&
      currentPlayer.money >= priceFor(currentPlayer, k)
  );

  const handleSkipBuy = () => {
    if (!pendingBuyTile) return;
    setLogMessage(`⏭️ ${currentPlayer.preset.name} 暫時不投保`);
    setPendingBuyTile(null);
    setTimeout(() => advanceTurn(), 500);
  };

  // Cash below zero from anything else (meeting events, milestones): borrow from the bank
  useEffect(() => {
    if (gamePhase !== 'playing' || !players.some((p) => p.money < 0)) return;
    const settled = players.map((p) => settleShortfall(p, false));
    setPlayers(settled.map((x) => x.player));
    const notes = settled
      .map((x, i) => (x.result ? `🏦 ${players[i].preset.name} 現金不夠，跟銀行借了 $${x.result.borrowed.toLocaleString()}${x.result.bankrupt ? '，負債太多破產了！' : ''}` : ''))
      .filter(Boolean);
    if (notes.length) setLogMessage(notes.join('｜'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, gamePhase]);

  // Center notice auto-closes (the human can also tap to continue)
  useEffect(() => {
    if (!tileNotice || !(autoPlay || (DEMO && !isHumanTurn))) return;
    const timer = setTimeout(handleCloseNotice, isHumanTurn ? NOTICE_MS_HUMAN : NOTICE_MS_CPU);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileNotice, autoPlay]);

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
      if (autoPlay || DEMO) timer = setTimeout(handleCloseChanceModal, CPU_READ_RESULT_MS);
    } else if (meet) {
      if (autoPlay || DEMO) timer = setTimeout(handleCloseMeet, CPU_READ_RESULT_MS);
    } else if (insuranceAd) {
      timer = setTimeout(() => (Math.random() < 0.4 ? handleAdBuy() : handleAdSkip()), CPU_THINK_MS + 900);
    } else if (pendingBuyTile) {
      timer = setTimeout(() => {
        if (buyableInsurance.length && Math.random() < 0.6) {
          handleBuyInsurance(buyableInsurance[Math.floor(Math.random() * buyableInsurance.length)]);
        } else handleSkipBuy();
      }, CPU_THINK_MS + 400);
    } else if (!hasRolled) {
      timer = setTimeout(() => rollDiceAndMove(true), CPU_THINK_MS);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamePhase, activeTurnIdx, isHumanTurn, gameOver, showSettlementModal, isRolling, isWalking, chanceModalStep, pendingBuyTile, tileNotice, hasRolled, insuranceAd, meet, autoPlay]);

  // Background shared by two players: re-drawn only when the player's own background changes
  const extraIdx = useMemo(() => Math.floor(Math.random() * CHARACTER_MODELS.length), [avatarIdx]);
  const setupPlayers = buildPlayers(avatarIdx, playerName, extraIdx);

  // Slot-machine style draw of the family background
  const drawBirth = () => {
    if (isDrawingBirth) return;
    setIsDrawingBirth(true);
    setShowPicker(false);
    const final = DEMO
      ? CHARACTER_MODELS.findIndex((m) => m.id === DEMO_SCRIPT.avatarId)
      : Math.floor(Math.random() * CHARACTER_MODELS.length);
    let n = 0;
    const tick = () => {
      n++;
      if (n < 14) {
        setAvatarIdx((i) => (i + 1) % CHARACTER_MODELS.length);
        setTimeout(tick, 60 + n * 10);
      } else {
        setAvatarIdx(final);
        setIsDrawingBirth(false);
        setBirthDrawn(true);
      }
    };
    tick();
  };

  const handleStartGame = () => {
    setPlayers(setupPlayers);
    setGamePhase('playing');
    setLogMessage(`輪到你了，${setupPlayers[0].preset.name}！按 GO 開始人生旅程`);
  };

  const handleRenewalConfirm = () => {
    if (!renewal) return;
    const kept = renewal.items.filter((i) => i.keep && !i.isNew);
    const dropped = renewal.items.filter((i) => !i.keep && !i.isNew).map((i) => i.key);
    const adds = renewal.items.filter((i) => i.keep && i.isNew).map((i) => i.key);
    const total = kept.reduce((sum, i) => sum + i.cost, 0);
    const keep = (k: InsuranceKey) => !dropped.includes(k);
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activeTurnIdx) return p;
        const waiting = { ...p.waiting };
        dropped.forEach((k) => delete waiting[k]);
        const gone = (k: InsuranceKey) => keep(k) && !renewal.expired.includes(k);
        const labor = renewal.newLabor && !p.insurance.includes('labor');
        return {
          ...p,
          money: p.money - total,
          premiumsPaid: p.premiumsPaid + total,
          insurance: [...p.insurance.filter(gone), ...(labor ? (['labor'] as InsuranceKey[]) : [])],
          premiums: labor ? { ...p.premiums, labor: priceFor(p, 'labor') } : p.premiums,
          concealed: p.concealed.filter(gone),
          waiting,
          history: [
            ...p.history,
            `${LIFE_STAGES[renewal.stage].name}・續繳保費 $${total.toLocaleString()}${dropped.length ? `；選擇不續保${insuranceNames(dropped)}` : ''}`,
          ],
        };
      })
    );
    setLogMessage(
      [
        total ? `🧾 續繳保費 $${total.toLocaleString()}` : '',
        dropped.length ? `⚠️ 不續保：${insuranceNames(dropped)}` : '',
        turnPrompt(currentPlayer),
      ]
        .filter(Boolean)
        .join('｜')
    );
    const stageColor = LIFE_STAGES[renewal.stage].color;
    setRenewal(null);
    // New policies still go through 健康告知 → 條款 → 核保, one at a time
    if (adds.length) {
      setBuyQueue(adds.slice(1));
      startBuy(adds[0], '保單續約・加保', stageColor, true);
    }
  };

  // Next policy picked in the renewal dialog (after the previous one was bought or skipped)
  const nextQueuedBuy = () => {
    if (!buyQueue.length) return;
    const [k, ...rest] = buyQueue;
    setBuyQueue(rest);
    startBuy(k, '保單續約・加保', '#0ea5e9', true);
  };

  const handleReset = () => {
    demoStep.current = { humanDice: 0, cpuDice: 0, humanCards: 0 };
    setRenewal(null);
    setBuyQueue([]);
    setAnalysis(null);
    setGamePhase('setup');
    setSetupStep('profile');
    setBirthDrawn(false);
    setShowPicker(false);
    setInsuranceAd(null);
    setMeet(null);
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
      return `rotateX(16deg) rotateZ(0deg) scale(1.02)`;
    }
    if (cameraMode === 'closeup') {
      const mid = (BOARD_SIZE - 1) / 2;
      const offsetX = (mid - currentTile.col) * 16;
      const offsetY = (mid - currentTile.row) * 16;
      return `rotateX(58deg) rotateZ(${customRotZ}deg) scale(1.7) translate3d(${offsetX}px, ${offsetY}px, 0px)`;
    }
    return `rotateX(${isDesk ? customRotX * 0.6 : customRotX}deg) rotateZ(${customRotZ}deg) scale(1)`;
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
    // Winner = least money lost to accidents after insurance payouts (bankrupt players last; ties: more assets)
    .sort(
      (a, b) =>
        Number(a.bankrupt) - Number(b.bankrupt) || a.outOfPocket - b.outOfPocket || b.totalAssets - a.totalAssets
    );

  // Ask for the AI analysis once the game is over
  useEffect(() => {
    if (!showSettlementModal || !(gameOver || DEMO) || analysis) return;
    const me = players.find((p) => p.isHuman);
    if (!me) return;
    setAnalysis({ status: 'loading', text: '' });
    const report = {
      totalRounds: Math.ceil(turnCount / players.length),
      players: rankedPlayers.map((p, i) => ({
        name: p.isHuman ? `${p.preset.name}（你）` : p.preset.name,
        background: p.preset.archetype,
        rank: i + 1,
        totalAssets: p.totalAssets,
        debt: p.debt,
        bankrupt: p.bankrupt,
        insuranceAtEnd: p.insurance.map((k) => INSURANCE_PRODUCTS[k].name),
        mishaps: p.mishaps,
        claimed: p.claimed,
        outOfPocket: p.outOfPocket,
        premiumsPaid: p.premiumsPaid,
        history: p.isHuman ? p.history : p.history.slice(-6),
      })),
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    fetch('/api/analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { text?: string }) => {
        if (!d.text) throw new Error('empty');
        setAnalysis({ status: 'ai', text: d.text });
      })
      .catch(() => setAnalysis({ status: 'offline', text: offlineAnalysis(me, rankedPlayers) }))
      .finally(() => clearTimeout(timer));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSettlementModal, gameOver]);


  const canRoll =
    gamePhase === 'playing' && isHumanTurn && !gameOver && !hasRolled && !isRolling && !isWalking && chanceModalStep === 'closed' && !pendingBuyTile && !tileNotice && !insuranceAd && !meet && !buyFlow && !renewal && !showSettlementModal;

  const floatsFor = (playerIdx: number, stat: StatKey) =>
    moneyFloats.filter((f) => f.playerIdx === playerIdx && f.stat === stat);

  // Shared overlay: dims the board but leaves the bottom asset bar visible
  // Pop-ups sit above the bottom HUD (z-55) so their buttons are never covered on short phone screens
  const overlayClass =
    'absolute inset-0 bg-sky-950/50 z-[56] flex items-start justify-center px-4 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] desk:pb-4 desk:items-center overflow-y-auto';

  return (
    <div
      className="min-h-[100dvh] text-[#0c4a6e] flex items-center justify-center p-2 max-sm:p-0 font-sans select-none overflow-hidden"
      onPointerUp={handlePointerUp}
    >
      {/* ======================================================== */}
      {/* SMARTPHONE FRAME CONTAINER (Light Blue Sky Theme)         */}
      {/* On desktop (desk:) it becomes a landscape screen:        */}
      {/* left column = players + controls, right = big board      */}
      {/* ======================================================== */}
      <div className="relative w-[393px] h-[852px] max-sm:w-full max-sm:h-[100dvh] max-sm:rounded-none max-sm:border-0 max-sm:shadow-none desk:w-[min(1480px,98vw)] desk:h-[min(1000px,97dvh)] desk:rounded-[40px] desk:grid desk:grid-cols-[340px_minmax(0,1fr)] desk:grid-rows-[minmax(0,1fr)_auto] desk:gap-x-4 desk:p-4 bg-gradient-to-b from-[#f0f9ff] via-[#e0f2fe] to-[#dbeefe] rounded-[52px] border-[7px] border-white shadow-[0_0_0_3px_#bfe3f7,0_25px_60px_-15px_rgba(14,116,180,0.4)] p-3 flex flex-col justify-between overflow-hidden isolate">

        {/* Soft Daylight Sun & Cloud Glow */}
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.5),transparent)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.4),transparent)] pointer-events-none" />

        {/* ======================================================== */}
        {/* TOP: 4-PLAYER LIVE SCOREBOARD                            */}
        {/* ======================================================== */}
        <div className="w-full flex flex-col items-center z-40 desk:col-start-1 desk:row-start-1 desk:min-h-0 desk:overflow-y-auto desk:gap-2">
          <div className="hidden desk:block w-full pt-1 pb-1 text-center">
            <div className="text-xl font-black text-[#0c4a6e]">🏝️ BOBI ISLAND</div>
            <div className="text-[11px] text-[#4a8ab5]">人生大富翁・保障可以自己補起來</div>
          </div>
          <div className="w-full grid grid-cols-4 gap-1 px-0.5 mt-1.5 desk:grid-cols-2 desk:gap-2 desk:mt-0">
            {players.map((p, idx) => {
              const isTurn = activeTurnIdx === idx;
              return (
                <div
                  key={p.id}
                  className={`relative rounded-2xl px-1.5 py-1 desk:px-3 desk:py-2 desk:[zoom:1.25] border-2 transition flex flex-col justify-between ${
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
                    <span title={p.insurance.length ? insuranceNames(p.insurance) : '沒有保險'} className="text-[8px] font-black text-emerald-600 whitespace-nowrap">
                      {p.insurance.length ? `🛡️${p.insurance.length}` : ''}
                    </span>
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
                  {(p.debt > 0 || p.incomeSkips > 0) && (
                    <div className="text-[8px] font-black text-rose-500 leading-tight truncate">
                      {p.debt > 0 && `負債${fmtWan(p.debt)}`} {p.incomeSkips > 0 && `🛌休養${p.incomeSkips}`}
                    </div>
                  )}
                  {p.bankrupt && (
                    <div className="absolute inset-0 rounded-2xl bg-slate-700/75 flex items-center justify-center text-[11px] font-black text-white">
                      💥 破產
                    </div>
                  )}
                  {p.finished && !p.bankrupt && (
                    <div className="absolute -top-1.5 -right-1 rounded-full bg-emerald-500 border-2 border-white px-1.5 text-[8px] font-black text-white">
                      🏁 抵達
                    </div>
                  )}
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
                onClick={() => { setCameraMode('iso'); setCustomRotX(32); setCustomRotZ(-2); }}
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
                onClick={toggleAutoPlay}
                aria-pressed={autoPlay}
                title={autoPlay ? '自動播放中：其他人的結果會自動跳過。點一下改成手動按「繼續」' : '手動模式：其他人的結果要按「繼續」才會下一步。點一下改成自動播放'}
                className={`px-2 py-1 rounded-full font-black text-[10px] btn-pop cursor-pointer transition border-2 ${
                  autoPlay ? 'bg-sky-400 border-sky-400 text-white' : 'bg-white border-[#bfe3f7] text-[#2f6f9a]'
                }`}
              >
                {autoPlay ? '⏩ 自動' : '⏸ 手動'}
              </button>
              <button
                onClick={() => setShowSettlementModal(true)}
                className="px-2.5 py-1 rounded-full bg-sky-200 hover:bg-sky-100 text-[#0c4a6e] font-black text-[10px] btn-pop flex items-center gap-1 cursor-pointer transition"
              >
                {DEMO && '🎬 '}🏆 第 {roundNo} 輪 • 🏁 {finishedCount}/{players.length}
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

          {/* Desktop only: the current player's coverage at a glance */}
          <div className="hidden desk:block w-full bg-white/90 rounded-2xl border-2 border-white shadow-sm p-3 text-xs text-[#2f6f9a]">
            <div className="font-black text-[#0c4a6e] mb-1.5">🛡️ {currentPlayer.preset.name} 的保障</div>
            <div className="grid grid-cols-1 gap-1">
              {INSURANCE_KEYS.map((k) => {
                const has = currentPlayer.insurance.includes(k);
                const waitLeft = currentPlayer.waiting[k];
                return (
                  <div key={k} className={`rounded-lg px-2 py-1 ${has ? (waitLeft ? 'bg-amber-50' : 'bg-emerald-50') : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className={has ? (waitLeft ? 'font-bold text-amber-700' : 'font-bold text-emerald-700') : 'font-bold text-slate-500'}>
                        {INSURANCE_PRODUCTS[k].icon} {INSURANCE_PRODUCTS[k].name}
                      </span>
                      <span className={`text-[10px] font-black ${has ? (waitLeft ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'}`}>
                        {has ? (waitLeft ? `等待期 ${waitLeft} 回合` : '已投保') : `未投保・$${priceFor(currentPlayer, k).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="text-[10px] leading-snug text-[#4a8ab5] mt-0.5">{INSURANCE_DETAIL[k]}</div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowSources(true)} className="mt-2 text-[10px] text-[#4a8ab5] underline cursor-pointer">
              📚 資料來源及保險數字參考法國巴黎人壽官網
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CENTER STAGE: 3D LIFE-JOURNEY BOARD                      */}
        {/* ======================================================== */}
        <div
          className="relative my-auto w-full h-[500px] desk:col-start-2 desk:row-start-1 desk:row-span-2 desk:h-full desk:my-0 flex items-center justify-center scene-perspective overflow-visible cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerCancel={handlePointerUp}
        >
          {/* Island Base */}
          <div
            style={{ transform: getBoard3DTransform() }}
            className={`w-full aspect-square shrink-0 desk:w-auto desk:h-[92%] desk:max-w-full bg-gradient-to-br from-sky-200 via-sky-100 to-cyan-200 rounded-[20px] p-1 border-2 border-white board-slab-3d ${isDragging ? '' : 'transition-transform duration-500 ease-out'} relative`}
          >
            <div
              style={{
                transform: "translateZ(1px)",
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              }}
              className="grid gap-px w-full h-full relative preserve-3d"
            >
              {BOARD_TILES.map((tile) => {
                const isHere = currentPlayer.position === tile.id;
                const isAccident = tile.id === CAR_CRASH_TILE;
                const isChance = tile.type === 'CHANCE';
                const isFate = tile.type === 'FATE';
                const stage = stageOf(tile.id);
                const isStageStart = tile.id % SIDE_LEN === 0;

                return (
                  <div
                    key={tile.id}
                    title={`${stage.name}・${tile.name}`}
                    style={{
                      gridArea: tile.gridArea,
                      ...(!isHere && !isChance && !isFate && !(isAccident && isHighlightCar)
                        ? { backgroundColor: isStageStart ? stage.color : stage.tint, borderColor: stage.color }
                        : {}),
                    }}
                    className={`relative rounded-md flex items-center justify-center transition-all duration-300 border ${
                      isHere
                        ? 'bg-gradient-to-b from-sky-100 to-white border-sky-400 tile-3d-active z-20'
                        : isAccident && isHighlightCar
                        ? 'bg-gradient-to-b from-red-100 to-red-50 border-red-500 tile-3d-danger animate-danger-pulse'
                        : isChance
                        ? 'bg-gradient-to-b from-amber-200 to-yellow-100 border-amber-400 tile-3d'
                        : isFate
                        ? 'bg-gradient-to-b from-violet-200 to-purple-100 border-violet-400 tile-3d'
                        : 'tile-3d'
                    }`}
                  >
                    {/* Tile color tab */}
                    <span className="absolute top-0.5 inset-x-1 h-[2px] rounded-full" style={{ backgroundColor: tile.color }} />
                    <span className="flex flex-col items-center justify-center gap-0.5 leading-none min-w-0">
                      <span className="text-[18px] desk:text-[28px] leading-none">{tile.icon}</span>
                      {/* Desktop only: tile name under the icon */}
                      <span className="hidden desk:block text-[10px] font-black text-[#0c4a6e] whitespace-nowrap leading-none">
                        {tile.name}
                      </span>
                    </span>
                  </div>
                );
              })}

              {/* ======================================================== */}
              {/* CENTRAL PLAZA                                            */}
              {/* ======================================================== */}
              <div
                style={{ gridArea: `2 / 2 / ${BOARD_SIZE} / ${BOARD_SIZE}` }}
                className="bg-gradient-to-br from-[#e0f2fe] via-white to-[#dff1fb] rounded-3xl px-2.5 pt-8 pb-8 border-4 border-white flex flex-col justify-between items-center text-center shadow-[inset_0_4px_15px_rgba(14,165,233,0.25)] relative preserve-3d"
              >
                {/* Life-stage labels, one beside each board side */}
                {LIFE_STAGES.map((st, i) => (
                  <span
                    key={st.name}
                    style={{ backgroundColor: st.color, transform: 'translateZ(4px)' }}
                    className={`absolute px-2 py-0.5 rounded-full text-white text-[10px] font-black whitespace-nowrap shadow-sm ${
                      ['top-1.5 left-1/2 -translate-x-1/2', 'right-1.5 top-1/2 -translate-y-1/2', 'bottom-1.5 left-1/2 -translate-x-1/2', 'left-1.5 top-1/2 -translate-y-1/2'][i]
                    }`}
                  >
                    {st.icon} {st.name}
                  </span>
                ))}
                <div style={{ transform: "translateZ(6px)" }} className="text-[13px] font-black text-[#0c4a6e] tracking-wide">
                  🏝️ BOBI ISLAND
                </div>
                <div style={{ transform: "translateZ(6px)" }} className="flex flex-col items-center gap-1">
                  <div className="bg-white rounded-full py-1 px-3 border-2 border-[#bfe3f7] shadow-sm flex items-center gap-1.5 text-[10px] font-extrabold text-[#2f6f9a]">
                    <ChibiAvatar preset={currentPlayer.preset} size={16} />
                    輪到 {currentPlayer.preset.name}
                    {!isHumanTurn && <span>🤖</span>}
                  </div>
                  <div className="text-[10px] font-extrabold text-[#2f6f9a]">
                    {stageOf(currentTile.id).name}・{currentTile.icon} {currentTile.name}
                  </div>
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
                const charJumpZ = isTurn && hopProgress ? 30 : 10;

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
                      scale={isTurn ? 0.9 : 0.68}
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
                {isHumanTurn ? '要補上哪一種保險？' : `🤖 ${currentPlayer.preset.name} 正在考慮要不要投保…`}
              </p>
              <div className="text-[10.5px] text-[#4a8ab5]">
                目前保障：{currentPlayer.insurance.length ? insuranceNames(currentPlayer.insurance) : '沒有任何保險'}
              </div>
              {isHumanTurn && (
                <div className="space-y-1.5">
                  {buyableInsurance.map((k) => {
                    const prod = INSURANCE_PRODUCTS[k];
                    return (
                      <button
                        key={k}
                        onClick={() => handleBuyInsurance(k)}
                        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-white border-2 border-[#bfe3f7] hover:border-orange-400 text-left btn-pop cursor-pointer"
                      >
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-[#0c4a6e]">{prod.icon} {prod.name}</span>
                          <span className="block text-[9.5px] text-[#4a8ab5] truncate">{prod.desc}</span>
                        </span>
                        <span className="shrink-0 text-xs font-black text-orange-500">${priceFor(currentPlayer, k).toLocaleString()}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={handleSkipBuy}
                    className="w-full py-2 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-sm btn-pop cursor-pointer"
                  >
                    先不要
                  </button>
                </div>
              )}
            </GameDialog>
          </div>
        )}

        {/* ======================================================== */}
        {/* CENTER POP-UP: BUYING INSURANCE STEP BY STEP              */}
        {/* 健康告知 → 閱讀條款 → 核保結果                              */}
        {/* ======================================================== */}
        {renewal && (() => {
          const stage = LIFE_STAGES[renewal.stage];
          const renewTotal = renewal.items.filter((i) => i.keep && !i.isNew).reduce((sum, i) => sum + i.cost, 0);
          const addTotal = renewal.items.filter((i) => i.keep && i.isNew).reduce((sum, i) => sum + i.cost, 0);
          const total = renewTotal + addTotal;
          const tooMuch = total > currentPlayer.money;
          const held = renewal.items.filter((i) => !i.isNew);
          const fresh = renewal.items.filter((i) => i.isNew);
          const older = renewal.stage >= 2 && held.some((i) => HEALTH_INSURANCE.includes(i.key));
          const toggle = (key: InsuranceKey, keep: boolean) =>
            setRenewal({ ...renewal, items: renewal.items.map((x) => (x.key === key ? { ...x, keep } : x)) });
          const row = (it: (typeof renewal.items)[number]) => {
            const prod = INSURANCE_PRODUCTS[it.key];
            return (
              <label
                key={it.key}
                className={`flex items-center gap-2 rounded-xl border-2 px-2.5 py-1.5 cursor-pointer ${
                  it.keep ? (it.isNew ? 'border-emerald-300 bg-emerald-50' : 'border-sky-300 bg-sky-50') : 'border-slate-200 bg-white opacity-70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={it.keep}
                  disabled={MANDATORY_INSURANCE.includes(it.key) && !it.isNew}
                  onChange={(ev) => toggle(it.key, ev.target.checked)}
                  className={`w-4 h-4 ${it.isNew ? 'accent-emerald-500' : 'accent-sky-500'}`}
                />
                <span className="text-lg">{prod.icon}</span>
                <span className="flex-1 text-xs font-black text-[#0c4a6e]">
                  {prod.name}
                  <span
                    className={`block text-[9px] font-bold ${
                      it.isNew ? (it.keep ? 'text-emerald-600' : 'text-slate-400') : it.keep ? 'text-sky-600' : 'text-rose-500'
                    }`}
                  >
                    {it.isNew
                      ? it.keep
                        ? NEEDS_DISCLOSURE.includes(it.key)
                          ? '加保（接著填健康告知、讀條款）'
                          : '加保（接著讀條款）'
                        : prod.desc
                      : MANDATORY_INSURANCE.includes(it.key)
                        ? '法定強制加保，自動續繳'
                        : it.keep
                          ? '續繳'
                          : '不續繳，保單停效'}
                  </span>
                </span>
                <span className={`text-xs font-black ${it.keep ? 'text-orange-500' : 'text-slate-400'} ${!it.keep && !it.isNew ? 'line-through' : ''}`}>
                  ${it.cost.toLocaleString()}
                </span>
              </label>
            );
          };
          return (
            <div className={overlayClass}>
              <GameDialog
                title={held.length ? '保單續約' : '要不要加保？'}
                color={stage.color}
                scene={
                  <>
                    <div className="relative" style={anim('evBob', 1.1, 0, {}, 'ease-in-out', 'infinite')}>
                      <ChibiAvatar preset={currentPlayer.preset} size={54} />
                    </div>
                    <span className="relative text-5xl">🧾</span>
                  </>
                }
              >
                <div className="text-[10px] font-black text-sky-500 tracking-wider">{stage.name}・續繳保費</div>
                <p className="text-sm font-bold text-[#0c4a6e] leading-relaxed">
                  進入{stage.name}了，
                  {held.length
                    ? `要續繳哪些保單？${older ? '年紀越大，健康險的保費越高。' : ''}沒續繳的保單會停效，之後出事不理賠。`
                    : '你目前沒有保單。'}
                  也可以趁這時候加保。
                </p>
                {(renewal.newLabor || renewal.expired.length > 0) && (
                  <div className="text-[10.5px] font-bold text-left rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-amber-800 space-y-0.5">
                    {renewal.newLabor && <div>👷 開始工作了，公司幫你投保勞工保險。</div>}
                    {renewal.expired.length > 0 && <div>📃 一年期定期壽險超過續保年齡，保單到期了，不能再續保。</div>}
                  </div>
                )}
                {held.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <div className="text-[10px] font-black text-sky-600">續繳</div>
                    {held.map(row)}
                  </div>
                )}
                {fresh.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <div className="text-[10px] font-black text-emerald-600">加保</div>
                    {fresh.map(row)}
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-[#0c4a6e] px-1">
                  <span>現金 ${currentPlayer.money.toLocaleString()}</span>
                  <span>
                    應繳 <span className="text-orange-500">${total.toLocaleString()}</span>
                  </span>
                </div>
                {addTotal > 0 && (
                  <div className="text-[10px] text-[#4a8ab5]">加保的保費等核保通過才付；有住院紀錄可能加費或被拒保。</div>
                )}
                {tooMuch && <div className="text-[10px] text-rose-500">現金不夠，請取消部分保單</div>}
                <button
                  onClick={handleRenewalConfirm}
                  disabled={tooMuch}
                  className="w-full py-2 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 disabled:from-slate-200 disabled:to-slate-300 border-2 border-white text-white font-black text-sm btn-pop enabled:cursor-pointer"
                >
                  {total
                    ? [renewTotal ? `續繳 $${renewTotal.toLocaleString()}` : '', addTotal ? `加保 ${fresh.filter((i) => i.keep).length} 張` : '']
                        .filter(Boolean)
                        .join('，')
                    : held.length
                      ? '確定全部不續繳'
                      : '先不加保'}
                </button>
                {renewTotal > 0 && (
                  <button
                    onClick={() =>
                      setRenewal({
                        ...renewal,
                        items: renewal.items.map((x) => (x.isNew || MANDATORY_INSURANCE.includes(x.key) ? x : { ...x, keep: false })),
                      })
                    }
                    className="w-full py-1.5 rounded-full bg-white border-2 border-slate-200 text-slate-500 font-bold text-xs btn-pop cursor-pointer"
                  >
                    全部不續繳
                  </button>
                )}
              </GameDialog>
            </div>
          );
        })()}

        {buyFlow && (() => {
          const prod = INSURANCE_PRODUCTS[buyFlow.key];
          const src = PRODUCT_SOURCES.find((x) => x.key === buyFlow.key);
          const history = currentPlayer.healthLog;
          const steps: { id: BuyStep; label: string }[] = [
            ...(NEEDS_DISCLOSURE.includes(buyFlow.key) ? [{ id: 'disclose' as BuyStep, label: '健康告知' }] : []),
            { id: 'terms', label: '閱讀條款' },
            { id: 'result', label: '核保結果' },
          ];
          const stepIdx = steps.findIndex((x) => x.id === buyFlow.step);
          const wait = WAITING_LABEL[buyFlow.key];
          return (
            <div className={overlayClass}>
              <GameDialog
                title={`投保 ${prod.name}`}
                color={buyFlow.color}
                scene={
                  <>
                    <div className="relative" style={anim('evBob', 1.1, 0, {}, 'ease-in-out', 'infinite')}>
                      <ChibiAvatar preset={currentPlayer.preset} size={54} />
                    </div>
                    <span className="relative text-5xl">{buyFlow.step === 'disclose' ? '🩺' : buyFlow.step === 'terms' ? '📜' : '🏢'}</span>
                  </>
                }
              >
                {/* Step indicator */}
                <div className="flex items-center justify-center gap-1 text-[10px] font-black">
                  {steps.map((st, i) => (
                    <span
                      key={st.id}
                      className={`px-2 py-0.5 rounded-full ${
                        i < stepIdx ? 'bg-emerald-100 text-emerald-700' : i === stepIdx ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {i + 1}. {st.label}
                    </span>
                  ))}
                </div>

                {buyFlow.step === 'disclose' && (
                  <div className="space-y-2 text-left">
                    <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-xs text-[#0c4a6e]">
                      <div className="font-black mb-1">要保書・健康告知</div>
                      <div>過去有沒有因為生病或受傷住院、開刀、骨折？</div>
                    </div>
                    <div className="bg-amber-50 border-2 border-amber-100 rounded-2xl px-3 py-2 text-[11px] text-amber-900">
                      📁 你的真實紀錄：{history.length ? history.join('、') : '沒有住院或受傷紀錄'}
                    </div>
                    {history.length ? (
                      <>
                        <button
                          onClick={() => setBuyFlow({ ...buyFlow, step: 'terms', concealed: false })}
                          className="w-full py-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-white text-white font-black text-sm btn-pop cursor-pointer"
                        >
                          據實告知：有 ✋
                        </button>
                        <button
                          onClick={() => setBuyFlow({ ...buyFlow, step: 'terms', concealed: true })}
                          className="w-full py-2 rounded-full bg-white border-2 border-rose-200 text-rose-500 font-black text-sm btn-pop cursor-pointer"
                        >
                          隱瞞不說：沒有 🤫
                        </button>
                        <div className="text-[9.5px] text-[#7fb0cf]">
                          ⚠️ 要保人有據實說明的義務。隱匿或不實說明，保險公司可以解除契約（告知義務）。
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => setBuyFlow({ ...buyFlow, step: 'terms', concealed: false })}
                        className="w-full py-2 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 border-2 border-white text-white font-black text-sm btn-pop cursor-pointer"
                      >
                        據實告知：沒有 ✅
                      </button>
                    )}
                  </div>
                )}

                {buyFlow.step === 'terms' && (
                  <div className="space-y-2 text-left">
                    <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-[11px] text-[#2f6f9a] space-y-1 max-h-48 overflow-y-auto">
                      <div className="font-black text-[#0c4a6e] text-xs">📜 重要條款摘要</div>
                      {src && <div className="text-[10px]">{src.insurer}：{src.product}</div>}
                      <ul className="list-disc pl-4 space-y-0.5">
                        {src?.facts.map((f) => <li key={f}>{f}</li>)}
                        {wait && <li className="font-bold text-amber-700">{wait}：買了不會馬上生效（遊戲中要等 {WAITING_TURNS[buyFlow.key]} 回合）</li>}
                        <li className="font-bold text-amber-700">保費不是只繳一次：每進入新的人生階段要續繳，現金不夠保單會停效{HEALTH_INSURANCE.includes(buyFlow.key) ? '；年紀越大保費越高' : ''}</li>
                        <li>投保前有不少於三日的條款審閱期</li>
                        <li>收到保單翌日起十日內可以撤銷契約</li>
                        <li>告知不實：保險公司可以解除契約，不負理賠責任</li>
                      </ul>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-[#0c4a6e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyFlow.agreed}
                        onChange={(e) => setBuyFlow({ ...buyFlow, agreed: e.target.checked })}
                        className="w-4 h-4 accent-sky-500"
                      />
                      我已閱讀並了解保障內容與不保事項
                    </label>
                    <button
                      onClick={handleBuyFlowSubmit}
                      disabled={!buyFlow.agreed}
                      className="w-full py-2 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 disabled:from-slate-200 disabled:to-slate-300 border-2 border-white text-white font-black text-sm btn-pop enabled:cursor-pointer"
                    >
                      送出要保書 📨
                    </button>
                  </div>
                )}

                {buyFlow.step === 'result' && buyFlow.outcome && (
                  <div className="space-y-2 text-left">
                    <div
                      className={`rounded-2xl p-3 border-2 text-xs ${
                        buyFlow.outcome === 'declined'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : buyFlow.outcome === 'extra'
                          ? 'bg-amber-50 border-amber-200 text-amber-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <div className="font-black text-sm mb-1">
                        {buyFlow.outcome === 'declined' ? '❌ 核保未通過（拒保）' : buyFlow.outcome === 'extra' ? '⚠️ 加費承保' : '✅ 正常承保'}
                      </div>
                      {buyFlow.outcome === 'declined' && '因為有住院紀錄，保險公司評估風險太高，這次無法承保。'}
                      {buyFlow.outcome === 'extra' && `因為有住院紀錄，保費要多加 ${EXTRA_PREMIUM_RATE * 100}%。`}
                      {buyFlow.outcome === 'standard' &&
                        (buyFlow.concealed ? '保險公司照你填的資料核保通過…但隱瞞的事，理賠時可能會被查到。' : '恭喜！依你告知的資料，保險公司同意承保。')}
                    </div>
                    {buyFlow.outcome !== 'declined' && (
                      <div className="flex justify-between bg-white rounded-2xl px-3 py-2 border-2 border-[#bfe3f7] text-xs font-black text-[#0c4a6e]">
                        <span>應繳保費</span>
                        <span className="text-orange-500">${buyFlow.price.toLocaleString()}</span>
                      </div>
                    )}
                    {buyFlow.outcome !== 'declined' && currentPlayer.money < buyFlow.price && (
                      <div className="text-[10px] text-rose-500">現金不夠繳保費…</div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleBuyFlowCancel}
                        className={`py-2 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-sm btn-pop cursor-pointer ${
                          buyFlow.outcome === 'declined' ? 'col-span-2' : ''
                        }`}
                      >
                        {buyFlow.outcome === 'declined' ? '知道了' : '不買了'}
                      </button>
                      {buyFlow.outcome !== 'declined' && (
                        <button
                          onClick={handleBuyFlowAccept}
                          disabled={currentPlayer.money < buyFlow.price}
                          className="py-2 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 disabled:from-slate-200 disabled:to-slate-300 border-2 border-white text-white font-black text-sm btn-pop enabled:cursor-pointer"
                        >
                          繳費投保 🛡️
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {buyFlow.step !== 'result' && (
                  <button onClick={handleBuyFlowCancel} className="text-[10px] text-[#7fb0cf] underline cursor-pointer">
                    先不買了
                  </button>
                )}
              </GameDialog>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* CENTER POP-UP: INSURANCE SALES PITCH (青年・中年)           */}
        {/* ======================================================== */}
        {insuranceAd && (() => {
          const prod = INSURANCE_PRODUCTS[insuranceAd.key];
          return (
            <div className={overlayClass}>
              <GameDialog
                title={insuranceAd.source.where}
                color="#0ea5e9"
                scene={
                  <>
                    <div className="relative" style={anim('evBob', 1.1, 0, {}, 'ease-in-out', 'infinite')}>
                      <ChibiAvatar preset={currentPlayer.preset} size={56} mood="shock" />
                    </div>
                    <span className="relative text-6xl" style={anim('evShake', 0.25, 0, {}, 'linear', 'infinite')}>
                      {insuranceAd.source.icon}
                    </span>
                    <span style={{ left: '62%', top: '14%', ...anim('evPop', 0.5, 0.4) }} className="absolute text-3xl">
                      {prod.icon}
                    </span>
                    <span style={{ left: '14%', top: '20%', ...anim('evPop', 0.4, 0.7) }} className="absolute text-2xl">💬</span>
                  </>
                }
              >
                <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl px-3 py-2 text-[11.5px] font-bold text-[#0c4a6e] text-left leading-snug">
                  「{insuranceAd.source.pitch(prod.name)}」
                </div>
                <div className="flex items-center justify-between bg-white rounded-2xl px-3 py-1.5 border-2 border-[#bfe3f7] text-left">
                  <span className="min-w-0">
                    <span className="block text-xs font-black text-[#0c4a6e]">{prod.icon} {prod.name}</span>
                    <span className="block text-[9.5px] text-[#4a8ab5]">{prod.desc}</span>
                  </span>
                  <span className="shrink-0 text-xs font-black text-orange-500">${priceFor(currentPlayer, insuranceAd.key).toLocaleString()}</span>
                </div>
                <div className="text-[9.5px] text-[#7fb0cf] text-left">💡 遇到推銷先確認對方身分和保單條款，想清楚再決定。</div>
                {isHumanTurn ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAdSkip}
                      className="py-2.5 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-sm btn-pop cursor-pointer"
                    >
                      不用了 🙅
                    </button>
                    <button
                      onClick={handleAdBuy}
                      className="py-2.5 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white text-white font-black text-sm btn-pop cursor-pointer"
                    >
                      投保 🛡️
                    </button>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#7fb0cf]">🤖 {currentPlayer.preset.name} 正在考慮…</div>
                )}
              </GameDialog>
            </div>
          );
        })()}

        {/* ======================================================== */}
        {/* CENTER POP-UP: TWO PLAYERS MEET ON THE SAME TILE         */}
        {/* ======================================================== */}
        {meet && (() => {
          const ev = meet.event;
          const other = players[meet.otherIdx];
          const rows: [PlayerState, number][] = [
            [currentPlayer, ev.selfDelta],
            [other, ev.otherDelta],
          ];
          return (
            <div className={overlayClass}>
              <GameDialog
                title={ev.title}
                color={ev.color}
                scene={
                  <>
                    {[currentPlayer, other].map((pl, i) => (
                      <div
                        key={pl.id}
                        className="relative"
                        style={ev.bad ? anim('evShake', 0.22, 0.2, {}, 'linear', 'infinite') : anim('evBob', 0.9, i * 0.2, {}, 'ease-in-out', 'infinite')}
                      >
                        <div style={i ? { transform: 'scaleX(-1)' } : undefined}>
                          <ChibiAvatar preset={pl.preset} size={54} mood={ev.bad ? 'dizzy' : 'happy'} />
                        </div>
                      </div>
                    ))}
                    <span style={{ left: '50%', top: '30%', transform: 'translateX(-50%)' }} className="absolute">
                      <span style={anim('evPop', 0.5, 0.3)} className="block text-5xl">{ev.icon}</span>
                    </span>
                    {ev.fx.map((fx, i) => (
                      <span
                        key={i}
                        style={{ left: `${18 + i * 30}%`, top: `${12 + (i % 2) * 14}%`, ...anim('evPop', 0.4, 0.6 + i * 0.25) }}
                        className="absolute text-2xl"
                      >
                        {fx}
                      </span>
                    ))}
                  </>
                }
              >
                <div className="text-[10px] font-black text-sky-500 tracking-wider">玩家相遇事件</div>
                <p className="text-sm font-bold text-[#0c4a6e] leading-relaxed">{ev.desc(currentPlayer.preset.name, other.preset.name)}</p>
                <div className="bg-white rounded-2xl p-2 border-2 border-[#bfe3f7] space-y-1">
                  {rows.map(([pl, d]) => (
                    <div key={pl.id} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-black text-[#0c4a6e]">
                        <ChibiAvatar preset={pl.preset} size={20} /> {pl.preset.name}
                      </span>
                      <span className={`font-black tabular-nums ${d > 0 ? 'money-up' : d < 0 ? 'money-down' : 'text-slate-400'}`}>
                        {d === 0 ? '±0' : fmtDelta(d)}
                      </span>
                    </div>
                  ))}
                </div>
                {ev.tip && <div className="text-[10px] text-[#4a8ab5] text-left leading-snug">💡 {ev.tip}</div>}
                {isHumanTurn || !autoPlay ? (
                  <button
                    onClick={handleCloseMeet}
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
        {/* CENTER POP-UP: TILE EVENT NOTICE                         */}
        {/* ======================================================== */}
        {tileNotice && (() => {
          const e = tileNotice.effect;
          const isLoss = !!e && (e.cash ?? 0) + (e.property ?? 0) < 0;
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
                      ['total', '🏦 總資產', (e.cash ?? 0) + (e.property ?? 0)],
                    ] as const)
                      .filter(([, , v]) => v)
                      .map(([k, label, v], i) => {
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
                {isHumanTurn || !autoPlay ? (
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
                <div className={`text-xs font-black tracking-wider ${drawDeck === 'chance' ? 'text-amber-500' : 'text-violet-500'}`}>
                  {drawDeck === 'chance' ? '🍀 機會卡：可能有好事發生！' : '🔮 命運卡：人生意外來了…'}
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
                  {Array.from({ length: PICK_CARD_COUNT }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={handlePickChanceCard}
                      disabled={!isHumanTurn}
                      style={{ animation: `evBob 1.4s ease-in-out ${num * 0.15}s infinite` }}
                      className={`h-24 rounded-3xl bg-gradient-to-br border-4 border-white btn-pop enabled:hover:scale-105 transition-transform flex flex-col items-center justify-center gap-1.5 enabled:cursor-pointer text-white ${
                        drawDeck === 'chance' ? 'from-amber-300 via-orange-400 to-yellow-300' : 'from-violet-300 via-purple-500 to-fuchsia-400'
                      }`}
                    >
                      <span className="text-3xl">{drawDeck === 'chance' ? '🍀' : '🔮'}</span>
                      <span className="text-[11px] font-black tracking-wide drop-shadow">第 {num} 張</span>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[#4a8ab5]">
                  {currentPlayer.insurance.length
                    ? `🛡️ ${isHumanTurn ? '你' : currentPlayer.preset.name}的保障：${insuranceNames(currentPlayer.insurance)}`
                    : `⚠️ ${isHumanTurn ? '你' : currentPlayer.preset.name}沒有任何保險，遇到意外要自己付喔…`}
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
              const card = drawnChanceCard;
              const status = eventOutcome?.status ?? 'none';
              const bonus = eventOutcome?.bonus ?? 0;
              const primaryBonus = eventOutcome?.primaryBonus ?? 0;
              const extras = eventOutcome?.extras ?? [];
              const insured = bonus > 0;
              const extraPayers = extras.filter((x) => x.paid && x.amount > 0).map((x) => x.key);
              const total = eventOutcome?.net ?? drawnChanceCard.deltaMoney;
              const isSpend = !!card.spend;
              const isLoss = drawnChanceCard.deltaMoney < 0 && !isSpend;
              const prodName = card.insurance ? INSURANCE_PRODUCTS[card.insurance].name : '';
              const story = eventOutcome?.story ?? [];
              return (
                <div className="w-full max-w-[360px] card-cute rounded-[32px] p-4 text-center space-y-2.5 animate-card-in my-auto">
                  <div className="text-base font-black text-[#0c4a6e]">
                    {drawnChanceCard.icon} {drawnChanceCard.title}
                  </div>

                  <InsuranceOutcomeFx outcome={!isLoss ? 'good' : insured ? 'insured' : 'uninsured'} />

                  <div className={`text-sm font-black ${insured ? 'text-emerald-600' : isLoss ? 'text-rose-500' : 'text-sky-600'}`}>
                    {isSpend
                      ? '出發去玩！這是計畫好的花費'
                      : !isLoss
                      ? '好事發生！'
                      : status === 'paid'
                      ? `還好有${prodName}！幫你理賠`
                      : insured
                      ? `還好有${insuranceNames(extraPayers)}！幫你分擔`
                      : status === 'waiting'
                      ? `${prodName}還在等待期…這次不賠`
                      : status === 'rescinded'
                      ? `隱瞞病史被發現，${prodName}被解除了`
                      : card.insurance
                      ? `沒有${prodName}…只能自掏腰包`
                      : '這種損失保險不理賠，只能自己吸收'}
                  </div>

                  <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-xs space-y-1.5 text-left">
                    <div className="flex justify-between text-[#2f6f9a]">
                      <span>{isLoss ? '事件損失' : isSpend ? '旅行花費' : '事件獎勵'}</span>
                      <span className={`font-black ${drawnChanceCard.deltaMoney < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {drawnChanceCard.deltaMoney >= 0 ? '+' : '-'}${Math.abs(eventOutcome?.loss ?? drawnChanceCard.deltaMoney).toLocaleString()}
                      </span>
                    </div>
                    {card.insurance ? (
                      <div className="flex justify-between gap-2 text-[#2f6f9a]">
                        <span className="leading-snug">
                          🛡️ {card.insurer ?? INSURANCE_PRODUCTS[card.insurance].name}
                          <br />
                          <span className="font-bold">「{card.claimName}」</span>
                        </span>
                        <span className={`font-black shrink-0 ${status === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {status === 'paid'
                            ? `+$${primaryBonus.toLocaleString()}`
                            : status === 'waiting'
                            ? '等待期 $0'
                            : status === 'rescinded'
                            ? '解約 $0'
                            : isLoss
                            ? '未投保 $0'
                            : '無需理賠'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-[#2f6f9a]">
                        <span>🛡️ 保險</span>
                        <span className="font-black text-slate-400">{isLoss ? '不在保障範圍' : '無需理賠'}</span>
                      </div>
                    )}
                    {extras.map((x) => (
                      <div key={x.key} className="flex justify-between gap-2 text-[#2f6f9a]">
                        <span className="leading-snug">
                          {INSURANCE_PRODUCTS[x.key].icon} {INSURANCE_PRODUCTS[x.key].name}
                          <span className="block text-[10px] text-[#4a8ab5]">{x.note}</span>
                        </span>
                        <span className={`font-black shrink-0 ${x.paid ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {x.paid ? `+$${x.amount.toLocaleString()}` : '未理賠 $0'}
                        </span>
                      </div>
                    ))}
                    {drawnChanceCard.coverage && (
                      <div className="text-[10px] text-[#4a8ab5]">保障項目：{drawnChanceCard.coverage}</div>
                    )}
                    {drawnChanceCard.calc && (
                      <div className="text-[10px] text-[#4a8ab5]">
                        🧮 理賠試算：{drawnChanceCard.calc} = ${drawnChanceCard.insuredBonus!.toLocaleString()}
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5 border-t border-dashed border-[#bfe3f7] text-[#0c4a6e] font-black">
                      <span>淨變化</span>
                      <span className={total >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                        {total >= 0 ? '+' : '-'}${Math.abs(total).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {story.length > 0 && (
                    <div
                      className={`rounded-2xl px-3 py-2 text-[11px] text-left leading-snug space-y-1 border-2 ${
                        insured ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      <div className="font-black">{insured ? '🛡️ 有保險的差別' : '😣 沒有保障的代價'}</div>
                      {story.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                    </div>
                  )}

                  <div className="bg-sky-50 border-2 border-sky-100 rounded-2xl px-3 py-2 text-[10.5px] text-[#2f6f9a] text-left leading-snug">
                    💡 <b>{isLoss ? '理賠小知識：' : '保險小知識：'}</b>{drawnChanceCard.tip}
                    <div className="text-[9px] text-[#7fb0cf] mt-1">
                      資料來源及保險數字參考法國巴黎人壽／產險官網，理賠依官網給付公式試算。實際理賠依保單條款為準。
                      <button onClick={() => setShowSources(true)} className="ml-1 underline font-bold cursor-pointer">
                        查看資料來源
                      </button>
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
        {/* BOTTOM HUD (大富翁 style): avatar • cash/home/total • GO */}
        {/* ======================================================== */}
        <div className="relative z-[55] pt-1 desk:col-start-1 desk:row-start-2 desk:pt-3">
          {/* Status line */}
          <div className="flex items-center gap-1.5 mb-1.5 desk:mb-3">
            <div className="flex-1 min-w-0 bg-white/95 rounded-full py-1 px-3 border-2 border-white shadow-sm text-center text-[11px] font-bold text-[#0c4a6e] truncate desk:whitespace-normal desk:rounded-2xl desk:py-2 desk:text-xs">
              {logMessage}
            </div>
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
              {currentPlayer.insurance.length > 0 && (
                <span
                  className="absolute -top-1 -right-1 h-6 min-w-6 px-1 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] font-black text-white"
                  title={insuranceNames(currentPlayer.insurance)}
                >
                  🛡️{currentPlayer.insurance.length}
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
              <div className="text-xl font-black text-[#0c4a6e]">BOBI ISLAND</div>
              <div className="text-[11px] text-[#4a8ab5] mt-0.5">每個人的起跑點不同，但保障可以自己補起來！</div>
              <button
                onClick={() => setShowSources(true)}
                className="mt-1 text-[10px] text-[#4a8ab5] underline cursor-pointer"
              >
                📚 資料來源及保險數字參考法國巴黎人壽官網
              </button>
            </div>

            {setupStep === 'profile' ? (
              <div className="w-full max-w-[350px] card-cute rounded-[32px] p-5 text-center space-y-3.5 animate-card-in">
                <div className="text-sm font-black text-[#0c4a6e]">👶 你會出生在什麼家庭？</div>
                <div
                  className="relative flex justify-center"
                  style={{ animation: isDrawingBirth ? 'evShake 0.18s linear infinite' : 'evBob 1.2s ease-in-out infinite' }}
                >
                  {/* Hidden behind a mystery box until the background is drawn */}
                  <div className={!birthDrawn && !isDrawingBirth ? 'opacity-0' : ''}>
                    <ChibiAvatar preset={CHARACTER_MODELS[avatarIdx]} size={72} />
                  </div>
                  {!birthDrawn && !isDrawingBirth && (
                    <span className="absolute inset-0 flex items-center justify-center text-6xl">🎁</span>
                  )}
                </div>
                {(birthDrawn || isDrawingBirth) && (
                  <div className="text-base font-black text-[#0c4a6e]">
                    {CHARACTER_MODELS[avatarIdx].archetypeIcon} {CHARACTER_MODELS[avatarIdx].archetype}
                    {birthDrawn && !isDrawingBirth && <span style={anim('evPop', 0.5, 0)} className="inline-block ml-1">🎉</span>}
                  </div>
                )}

                {!birthDrawn ? (
                  <button
                    onClick={drawBirth}
                    disabled={isDrawingBirth}
                    className="w-full py-3 rounded-full bg-gradient-to-b from-amber-300 to-orange-500 border-2 border-white text-white font-black text-sm btn-pop enabled:cursor-pointer disabled:opacity-80"
                  >
                    {isDrawingBirth ? '抽籤中…' : '🎲 抽出身'}
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={drawBirth}
                      disabled={isDrawingBirth}
                      className="py-2 rounded-full bg-white border-2 border-[#bfe3f7] text-[#4a8ab5] font-black text-xs btn-pop enabled:cursor-pointer"
                    >
                      🎲 再抽一次
                    </button>
                    <button
                      onClick={() => setShowPicker((v) => !v)}
                      disabled={isDrawingBirth}
                      className={`py-2 rounded-full border-2 font-black text-xs btn-pop enabled:cursor-pointer ${
                        showPicker ? 'bg-sky-400 border-sky-400 text-white' : 'bg-white border-[#bfe3f7] text-[#4a8ab5]'
                      }`}
                    >
                      ✋ 不喜歡？自己選
                    </button>
                  </div>
                )}

                {/* Manual family background picker */}
                {showPicker && !isDrawingBirth && <div className="grid grid-cols-4 gap-1.5">
                  {CHARACTER_MODELS.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setAvatarIdx(i)}
                      aria-label={`選擇出身：${m.archetype}`}
                      className={`pt-2.5 pb-1 rounded-2xl border-2 transition cursor-pointer flex flex-col items-center gap-0.5 ${
                        i === avatarIdx ? 'border-sky-400 bg-sky-50 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ChibiAvatar preset={m} size={32} />
                      <span className="text-[10px] font-black text-[#0c4a6e] whitespace-nowrap">{m.archetype}</span>
                    </button>
                  ))}
                </div>}

                {birthDrawn && !isDrawingBirth && (<>
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

                {/* What this background starts with */}
                {(() => {
                  const m = CHARACTER_MODELS[avatarIdx];
                  return (
                    <div className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-left text-[10.5px] text-[#2f6f9a] space-y-1.5">
                      <div className="font-black text-[#0c4a6e] text-xs">
                        {m.archetypeIcon} {m.archetype}
                      </div>
                      <div className="leading-snug">{m.blurb}</div>
                      <div>
                        💰 起始現金 <b className="text-[#0c4a6e]">${m.startMoney.toLocaleString()}</b>
                      </div>
                      <div>
                        🛡️ 出生保險：
                        {m.insurance.length ? (
                          <span className="inline-flex flex-wrap gap-1 align-middle">
                            {m.insurance.map((k) => (
                              <span key={k} className="px-1.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                                {INSURANCE_PRODUCTS[k].icon} {INSURANCE_PRODUCTS[k].name}
                              </span>
                            ))}
                          </span>
                        ) : (
                          <b className="text-rose-500">沒有任何保險</b>
                        )}
                      </div>
                      <div>
                        {([0, 1, 2, 3] as const).map((st) =>
                          m.turnAllowance[st] ? (
                            <div key={st}>
                              🔁 {LIFE_STAGES[st].name}每輪：
                              {m.turnAllowance[st]!.map((i) => `${i.label} $${i.amount.toLocaleString()}`).join(' + ')}
                            </div>
                          ) : null
                        )}
                      </div>
                      {m.perks && (
                        <div>
                          🤝 弱勢家庭照顧：
                          {m.perks.map((t) => (
                            <div key={t} className="pl-4">・{t}</div>
                          ))}
                        </div>
                      )}
                      <div className="text-[9px] text-[#7fb0cf] pt-1 border-t border-dashed border-[#bfe3f7]">
                        每輪擲骰子前領一次。生病請假只會少領基本工資，補助、零用錢、退休金照領。遊戲金額僅供示意。
                      </div>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setSetupStep('summary')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-sm btn-pop cursor-pointer"
                >
                  下一步 ➔
                </button>
                </>)}
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
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                          p.insurance.length ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {p.preset.archetype} • {p.insurance.length ? `🛡️ ${p.insurance.length} 種保險` : '沒有保險'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-[#4a8ab5]">其他 3 種出身由電腦扮演，停在「保障規劃」可以補買保險。</div>
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
                  🎉 贏家：{rankedPlayers[0].preset.name}（只付了 ${rankedPlayers[0].outOfPocket.toLocaleString()}）
                </div>
                <div className="text-[10px] text-[#4a8ab5] mt-0.5">
                  比的是遇到意外、生病時，扣掉保險理賠後自己付了多少錢，越少越好
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
                            <span className="text-[9px] bg-sky-100 text-sky-700 px-1.5 rounded-full font-bold whitespace-nowrap">
                              {rp.preset.archetypeIcon} {rp.preset.archetype}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#4a8ab5]">
                            {rp.bankrupt ? '💥 破產出局 • ' : ''}發生 {rp.mishaps} 次事件
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right leading-tight">
                        <div className="text-[9px] font-bold text-[#4a8ab5]">付了</div>
                        <div className="text-xs font-black text-rose-500">${rp.outOfPocket.toLocaleString()}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal analysis from Claude */}
              {analysis && (
                <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-3 space-y-1.5 text-left">
                  <div className="text-xs font-black text-violet-800 flex items-center justify-between">
                    <span>🤖 AI 個人分析</span>
                    {analysis.status === 'offline' && <span className="text-[9px] font-bold text-violet-500">離線版</span>}
                  </div>
                  {analysis.status === 'loading' ? (
                    <div className="text-[11px] text-violet-700 animate-pulse">AI 正在分析你這局的決策…</div>
                  ) : (
                    <div className="text-[11px] text-[#3b2a63] leading-relaxed whitespace-pre-line">{analysis.text}</div>
                  )}
                </div>
              )}

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-[11px] text-emerald-900 leading-snug">
                💡 <b>勝負關鍵總結：</b>每個人出生的起跑點不同，但<b>保險</b>可以後天補起來。有對應保障的角色，遇到車禍、住院、癌症、失能時都有理賠，資產不會一夕歸零！
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

        {/* ======================================================== */}
        {/* DATA SOURCES: official product pages and figures          */}
        {/* ======================================================== */}
        {showSources && (
          <div
            className="absolute inset-0 bg-sky-950/55 z-[70] flex items-start justify-center p-4 overflow-y-auto rounded-[44px] max-sm:rounded-none"
            onClick={() => setShowSources(false)}
          >
            <div
              className="w-full max-w-[380px] card-cute rounded-[28px] p-4 space-y-3 text-left my-auto animate-card-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-base font-black text-[#0c4a6e]">📚 資料來源</div>
                <div className="text-[11px] text-[#4a8ab5] mt-0.5 leading-snug">
                  資料來源及保險數字參考法國巴黎人壽、法國巴黎產險官網的商品說明與保單條款。
                </div>
              </div>

              {PRODUCT_SOURCES.map((s) => {
                const prod = INSURANCE_PRODUCTS[s.key];
                return (
                  <div key={s.key} className="bg-white rounded-2xl p-3 border-2 border-[#bfe3f7] text-[11px] text-[#2f6f9a] space-y-1">
                    <div className="font-black text-[#0c4a6e] text-xs">
                      {prod.icon} 遊戲中的「{prod.name}」
                    </div>
                    <div className="leading-snug">
                      {s.insurer}：<b>{s.product}</b>
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 leading-snug">
                      {s.facts.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                    {s.assumption && <div className="text-[10px] text-amber-700">⚠️ {s.assumption}</div>}
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-[10px] text-sky-600 underline break-all">
                        {s.url}
                      </a>
                    )}
                  </div>
                );
              })}

              <div className="text-[10px] text-[#7fb0cf] leading-snug">
                遊戲裡的保費是示意價格，每進入新的人生階段續繳一次；真實保費每年繳，依年齡和保額而定。事件損失金額為遊戲設定。實際理賠依保單條款為準。
                <br />
                法國巴黎人壽 0800-012-899 • 法國巴黎產險 0800-266-288
              </div>

              <button
                onClick={() => setShowSources(false)}
                className="w-full py-2 bg-gradient-to-r from-sky-400 to-cyan-400 text-white font-black text-sm rounded-full btn-pop cursor-pointer"
              >
                關閉
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}