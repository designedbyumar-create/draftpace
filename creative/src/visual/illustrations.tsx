/**
 * Spot illustrations for social creative: flat, editorial, drawn in code
 * so every one takes the product's own palette and stays sharp at any size.
 * Each is a 400 x 400 drawing of one everyday object or moment (a phone
 * call, a boarding pass, a pill bottle), never a fake screen or a fake
 * number: they set the scene, the real UI and the real words carry the
 * claims. Which one a slide gets is decided by director/illustration.ts.
 *
 * Style: one ink line weight with round ends, flat fills from the palette
 * (paper, accent, a soft tint of the accent), a soft ground shadow, a tinted
 * blob behind, a few accent sparkles.
 */
import React from "react";

export type Palette = { ink: string; accent: string; soft: string; paper: string };
type Draw = (c: Palette) => React.ReactNode;

const W = 7; // the one line weight
const line = (c: Palette) => ({ stroke: c.ink, strokeWidth: W, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
const shape = (c: Palette, fill: string) => ({ ...line(c), fill });

function Sparkle({ x, y, r = 10, c }: { x: number; y: number; r?: number; c: Palette }) {
  return <path d={`M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`} fill={c.accent} />;
}
const Dot = ({ x, y, r = 6, c }: { x: number; y: number; r?: number; c: Palette }) => <circle cx={x} cy={y} r={r} fill={c.accent} opacity={0.55} />;
const Shadow = ({ y = 336, w = 150, c }: { y?: number; w?: number; c: Palette }) => <ellipse cx={200} cy={y} rx={w} ry={14} fill={c.ink} opacity={0.08} />;
const Check = ({ x, y, s = 1, c, color }: { x: number; y: number; s?: number; c: Palette; color?: string }) => (
  <path d={`M${x - 10 * s} ${y} l${8 * s} ${8 * s} l${14 * s} ${-16 * s}`} fill="none" {...line(c)} stroke={color ?? c.ink} />
);
const Lines = ({ x, y, w, n, gap = 26, c, short = 0.6 }: { x: number; y: number; w: number; n: number; gap?: number; c: Palette; short?: number }) => (
  <>{Array.from({ length: n }, (_, i) => <line key={i} x1={x} y1={y + i * gap} x2={x + (i === n - 1 ? w * short : w)} y2={y + i * gap} {...line(c)} strokeWidth={5} opacity={0.75} />)}</>
);

const DRAWINGS: Record<string, Draw> = {
  phone: (c) => (
    <>
      <Shadow c={c} w={90} />
      <rect x={130} y={70} width={140} height={260} rx={26} {...shape(c, c.paper)} />
      <rect x={148} y={100} width={104} height={190} rx={10} fill={c.soft} />
      <line x1={180} y1={86} x2={220} y2={86} {...line(c)} strokeWidth={5} />
      <circle cx={200} cy={250} r={24} fill={c.accent} />
      <path d="M190 242 q4 -6 8 0 l-3 5 q4 8 10 10 l5 -3 q6 4 0 8 q-14 4 -24 -12 z" fill={c.paper} />
      <path d="M290 120 q22 22 0 44 M306 104 q38 38 0 76" fill="none" {...line(c)} stroke={c.accent} />
      <Sparkle x={104} y={120} c={c} />
      <Dot x={96} y={260} c={c} />
    </>
  ),
  speech: (c) => (
    <>
      <Shadow c={c} w={120} />
      <path d="M70 90 h190 a24 24 0 0 1 24 24 v80 a24 24 0 0 1 -24 24 h-120 l-40 34 v-34 h-30 a24 24 0 0 1 -24 -24 v-80 a24 24 0 0 1 24 -24 z" {...shape(c, c.paper)} />
      <Lines x={92} y={130} w={160} n={3} c={c} />
      <path d="M200 236 h110 a20 20 0 0 1 20 20 v40 a20 20 0 0 1 -20 20 h-14 v26 l-30 -26 h-66 a20 20 0 0 1 -20 -20 v-40 a20 20 0 0 1 20 -20 z" {...shape(c, c.accent)} />
      <circle cx={232} cy={276} r={6} fill={c.paper} /><circle cx={256} cy={276} r={6} fill={c.paper} /><circle cx={280} cy={276} r={6} fill={c.paper} />
      <Sparkle x={330} y={92} c={c} />
    </>
  ),
  checklist: (c) => (
    <>
      <Shadow c={c} w={110} />
      <rect x={110} y={76} width={180} height={250} rx={18} {...shape(c, c.paper)} />
      <rect x={160} y={60} width={80} height={36} rx={10} {...shape(c, c.accent)} />
      {[130, 190, 250].map((y, i) => (
        <g key={y}>
          <rect x={136} y={y - 16} width={32} height={32} rx={8} {...shape(c, i < 2 ? c.soft : c.paper)} />
          {i < 2 && <Check x={152} y={y} c={c} s={0.8} />}
          <line x1={186} y1={y} x2={i === 2 ? 236 : 262} y2={y} {...line(c)} strokeWidth={5} opacity={0.75} />
        </g>
      ))}
      <Sparkle x={320} y={110} c={c} /><Dot x={84} y={286} c={c} />
    </>
  ),
  calendar: (c) => (
    <>
      <Shadow c={c} w={130} />
      <rect x={80} y={90} width={240} height={226} rx={22} {...shape(c, c.paper)} />
      <path d="M80 112 a22 22 0 0 1 22 -22 h196 a22 22 0 0 1 22 22 v36 h-240 z" {...shape(c, c.accent)} />
      <line x1={136} y1={72} x2={136} y2={106} {...line(c)} /><line x1={264} y1={72} x2={264} y2={106} {...line(c)} />
      {[0, 1, 2, 3].map((r) => [0, 1, 2, 3, 4].map((k) => <circle key={`${r}${k}`} cx={112 + k * 44} cy={178 + r * 34} r={6} fill={c.ink} opacity={0.25} />))}
      <circle cx={244} cy={212} r={24} fill="none" {...line(c)} stroke={c.accent} />
      <Sparkle x={342} y={86} c={c} />
    </>
  ),
  clock: (c) => (
    <>
      <Shadow c={c} w={110} />
      <circle cx={200} cy={200} r={120} {...shape(c, c.paper)} />
      <path d="M200 80 a120 120 0 0 1 104 60 L200 200 Z" fill={c.soft} />
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={200 + Math.sin(a) * 100} y1={200 - Math.cos(a) * 100} x2={200 + Math.sin(a) * 110} y2={200 - Math.cos(a) * 110} {...line(c)} strokeWidth={5} />; })}
      <line x1={200} y1={200} x2={200} y2={124} {...line(c)} /><line x1={200} y1={200} x2={258} y2={228} {...line(c)} stroke={c.accent} />
      <circle cx={200} cy={200} r={10} fill={c.ink} />
      <Sparkle x={330} y={90} c={c} /><Dot x={70} y={110} c={c} />
    </>
  ),
  notebook: (c) => (
    <>
      <Shadow c={c} w={120} />
      <rect x={100} y={70} width={190} height={250} rx={14} {...shape(c, c.paper)} />
      <rect x={100} y={70} width={34} height={250} rx={10} {...shape(c, c.accent)} />
      <Lines x={156} y={124} w={108} n={5} gap={34} c={c} />
      <g transform="rotate(35 300 230)">
        <rect x={286} y={120} width={30} height={170} rx={6} {...shape(c, c.soft)} />
        <path d="M286 290 l15 34 l15 -34 z" {...shape(c, c.paper)} />
      </g>
      <Sparkle x={86} y={96} c={c} />
    </>
  ),
  envelope: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={70} y={120} width={260} height={180} rx={16} {...shape(c, c.paper)} />
      <path d="M70 136 l130 90 l130 -90" fill="none" {...line(c)} />
      <path d="M70 296 l96 -78 M330 296 l-96 -78" fill="none" {...line(c)} strokeWidth={5} opacity={0.6} />
      <circle cx={300} cy={130} r={30} {...shape(c, c.accent)} />
      <text x={300} y={142} textAnchor="middle" fontFamily="IBM Plex Sans" fontWeight={700} fontSize={32} fill={c.paper}>1</text>
      <Sparkle x={92} y={92} c={c} />
    </>
  ),
  document: (c) => (
    <>
      <Shadow c={c} w={110} />
      <rect x={140} y={90} width={170} height={220} rx={12} {...shape(c, c.soft)} transform="rotate(6 225 200)" />
      <path d="M100 70 h130 l50 50 v200 a12 12 0 0 1 -12 12 h-168 a12 12 0 0 1 -12 -12 v-238 a12 12 0 0 1 12 -12 z" {...shape(c, c.paper)} />
      <path d="M230 70 v38 a12 12 0 0 0 12 12 h38" fill="none" {...line(c)} />
      <Lines x={120} y={150} w={130} n={4} gap={30} c={c} />
      <circle cx={232} cy={282} r={26} {...shape(c, c.accent)} />
      <Check x={232} y={282} c={c} s={0.9} color={c.paper} />
      <Sparkle x={330} y={100} c={c} />
    </>
  ),
  binder: (c) => (
    <>
      <Shadow c={c} w={130} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={282} y={100 + i * 50} width={44} height={38} rx={8} {...shape(c, i === 1 ? c.accent : c.soft)} />)}
      <rect x={80} y={74} width={220} height={260} rx={18} {...shape(c, c.paper)} />
      <rect x={80} y={74} width={46} height={260} rx={14} {...shape(c, c.accent)} />
      {[130, 204, 278].map((y) => <circle key={y} cx={103} cy={y} r={9} fill={c.paper} />)}
      <rect x={150} y={120} width={120} height={56} rx={10} {...shape(c, c.soft)} />
      <Lines x={150} y={220} w={116} n={3} gap={28} c={c} />
      <Sparkle x={60} y={100} c={c} />
    </>
  ),
  receipt: (c) => (
    <>
      <Shadow c={c} w={100} />
      <path d="M120 64 h160 v260 l-20 -14 l-20 14 l-20 -14 l-20 14 l-20 -14 l-20 14 l-20 -14 l-20 14 z" {...shape(c, c.paper)} />
      <Lines x={146} y={110} w={108} n={4} gap={34} c={c} short={0.8} />
      <line x1={146} y1={252} x2={254} y2={252} {...line(c)} strokeDasharray="2 12" />
      <rect x={210} y={268} width={46} height={22} rx={6} fill={c.accent} />
      <circle cx={318} cy={110} r={28} {...shape(c, c.soft)} />
      <path d="M306 110 h24 M318 98 v24" {...line(c)} />
      <Dot x={86} y={180} c={c} />
    </>
  ),
  wallet: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={110} y={90} width={150} height={90} rx={12} {...shape(c, c.soft)} transform="rotate(-10 185 135)" />
      <rect x={70} y={140} width={240} height={170} rx={24} {...shape(c, c.accent)} />
      <rect x={236} y={196} width={92} height={58} rx={16} {...shape(c, c.paper)} />
      <circle cx={262} cy={225} r={10} fill={c.accent} />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={330} cy={318 - i * 18} rx={40} ry={12} {...shape(c, c.paper)} />)}
      <Sparkle x={92} y={110} c={c} />
    </>
  ),
  card: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={110} y={100} width={230} height={146} rx={18} {...shape(c, c.soft)} transform="rotate(-8 225 173)" />
      <rect x={66} y={156} width={240} height={150} rx={18} {...shape(c, c.paper)} />
      <rect x={66} y={190} width={240} height={30} fill={c.ink} />
      <rect x={90} y={244} width={44} height={32} rx={6} {...shape(c, c.accent)} />
      <line x1={160} y1={262} x2={270} y2={262} {...line(c)} strokeWidth={5} opacity={0.75} />
      <Sparkle x={334} y={292} c={c} />
    </>
  ),
  bank: (c) => (
    <>
      <Shadow c={c} w={150} />
      <path d="M70 150 l130 -76 l130 76 z" {...shape(c, c.accent)} />
      <rect x={80} y={150} width={240} height={22} {...shape(c, c.paper)} />
      {[104, 160, 216, 272].map((x) => <rect key={x} x={x} y={182} width={26} height={104} rx={4} {...shape(c, c.paper)} />)}
      <rect x={66} y={290} width={268} height={30} rx={6} {...shape(c, c.soft)} />
      <circle cx={200} cy={118} r={10} fill={c.paper} />
      <Sparkle x={340} y={96} c={c} />
    </>
  ),
  piggy: (c) => (
    <>
      <Shadow c={c} w={130} />
      <ellipse cx={196} cy={220} rx={124} ry={92} {...shape(c, c.soft)} />
      <path d="M150 140 l-14 -40 l40 26" {...shape(c, c.soft)} />
      <rect x={300} y={196} width={34} height={44} rx={14} {...shape(c, c.soft)} />
      <rect x={130} y={290} width={30} height={40} rx={8} {...shape(c, c.soft)} /><rect x={226} y={290} width={30} height={40} rx={8} {...shape(c, c.soft)} />
      <circle cx={276} cy={186} r={7} fill={c.ink} />
      <rect x={168} y={124} width={60} height={12} rx={6} fill={c.ink} />
      <circle cx={198} cy={70} r={30} {...shape(c, c.accent)} />
      <text x={198} y={82} textAnchor="middle" fontFamily="Newsreader" fontWeight={700} fontSize={34} fill={c.paper}>$</text>
      <Sparkle x={86} y={120} c={c} />
    </>
  ),
  chart: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={70} y={80} width={260} height={240} rx={20} {...shape(c, c.paper)} />
      {[150, 112, 76, 40].map((h, i) => <rect key={i} x={100 + i * 54} y={290 - h} width={36} height={h} rx={6} {...shape(c, i === 3 ? c.accent : c.soft)} />)}
      <path d="M110 120 L282 232" fill="none" {...line(c)} stroke={c.accent} strokeDasharray="4 14" />
      <path d="M262 240 l22 -6 l-6 -22" fill="none" {...line(c)} stroke={c.accent} />
      <Sparkle x={340} y={74} c={c} />
    </>
  ),
  plane: (c) => (
    <>
      <path d="M40 300 q90 -40 150 -110" fill="none" {...line(c)} stroke={c.accent} strokeDasharray="2 16" />
      <g transform="rotate(-28 230 170)">
        <path d="M120 170 q0 -22 30 -22 h160 q40 0 50 22 q-10 22 -50 22 h-160 q-30 0 -30 -22 z" {...shape(c, c.paper)} />
        <path d="M220 148 l-30 -70 h30 l60 70 z" {...shape(c, c.accent)} />
        <path d="M220 192 l-30 70 h30 l60 -70 z" {...shape(c, c.accent)} />
        <path d="M134 152 l-18 -36 h22 l26 34 z" {...shape(c, c.soft)} />
        {[250, 274, 298].map((x) => <circle key={x} cx={x} cy={166} r={6} fill={c.ink} opacity={0.6} />)}
      </g>
      <ellipse cx={96} cy={110} rx={40} ry={18} fill={c.soft} /><ellipse cx={320} cy={300} rx={50} ry={20} fill={c.soft} />
      <Sparkle x={340} y={80} c={c} />
    </>
  ),
  suitcase: (c) => (
    <>
      <Shadow c={c} w={110} />
      <path d="M166 110 v-30 a14 14 0 0 1 14 -14 h40 a14 14 0 0 1 14 14 v30" fill="none" {...line(c)} />
      <rect x={100} y={110} width={200} height={210} rx={24} {...shape(c, c.accent)} />
      <line x1={150} y1={110} x2={150} y2={320} {...line(c)} /><line x1={250} y1={110} x2={250} y2={320} {...line(c)} />
      <rect x={176} y={170} width={86} height={50} rx={10} {...shape(c, c.paper)} transform="rotate(-8 219 195)" />
      <circle cx={140} cy={330} r={10} {...shape(c, c.paper)} /><circle cx={260} cy={330} r={10} {...shape(c, c.paper)} />
      <Sparkle x={330} y={110} c={c} /><Dot x={74} y={180} c={c} />
    </>
  ),
  ticket: (c) => (
    <>
      <Shadow c={c} w={150} />
      <g transform="rotate(-6 200 200)">
        <path d="M60 130 h280 v40 a20 20 0 0 0 0 60 v40 h-280 v-40 a20 20 0 0 0 0 -60 z" {...shape(c, c.paper)} />
        <rect x={60} y={130} width={280} height={40} fill={c.accent} stroke={c.ink} strokeWidth={W} />
        <line x1={250} y1={182} x2={250} y2={262} {...line(c)} strokeDasharray="4 12" />
        <Lines x={86} y={200} w={130} n={3} gap={24} c={c} />
        {[270, 284, 298, 312].map((x, i) => <rect key={x} x={x} y={196} width={i % 2 ? 6 : 10} height={56} fill={c.ink} />)}
      </g>
      <Sparkle x={334} y={86} c={c} />
    </>
  ),
  hotel: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={60} y={290} width={280} height={24} rx={8} {...shape(c, c.soft)} />
      <path d="M90 290 a110 110 0 0 1 220 0 z" {...shape(c, c.accent)} />
      <line x1={200} y1={180} x2={200} y2={156} {...line(c)} /><rect x={182} y={146} width={36} height={14} rx={7} {...shape(c, c.paper)} />
      <path d="M130 270 a76 76 0 0 1 40 -66" fill="none" {...line(c)} stroke={c.paper} />
      <path d="M268 112 l18 -18 M296 132 l26 -6 M246 96 l-2 -26" {...line(c)} stroke={c.accent} />
      <Dot x={80} y={150} c={c} />
    </>
  ),
  route: (c) => (
    <>
      <Shadow c={c} w={150} />
      <path d="M60 110 l90 -30 l100 30 l90 -30 v220 l-90 30 l-100 -30 l-90 30 z" {...shape(c, c.paper)} />
      <path d="M150 80 v220 M250 110 v220" fill="none" {...line(c)} strokeWidth={5} opacity={0.4} />
      <path d="M100 250 q40 -90 100 -60 t100 -80" fill="none" {...line(c)} stroke={c.accent} strokeDasharray="4 14" />
      {[[100, 250], [200, 190], [300, 110]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} {...shape(c, i === 2 ? c.accent : c.soft)} />)}
      <Sparkle x={344} y={60} c={c} />
    </>
  ),
  car: (c) => (
    <>
      <Shadow c={c} y={318} w={160} />
      <path d="M60 270 v-40 q0 -20 20 -24 l40 -8 l40 -50 q10 -12 26 -12 h80 q16 0 26 12 l40 50 q30 4 30 30 v42 z" {...shape(c, c.accent)} />
      <path d="M150 196 l26 -36 h40 v36 z M232 196 v-36 h22 l26 36 z" {...shape(c, c.paper)} />
      <circle cx={120} cy={276} r={34} {...shape(c, c.paper)} /><circle cx={120} cy={276} r={12} fill={c.ink} />
      <circle cx={280} cy={276} r={34} {...shape(c, c.paper)} /><circle cx={280} cy={276} r={12} fill={c.ink} />
      <rect x={306} y={222} width={24} height={14} rx={6} fill={c.paper} />
      <Sparkle x={330} y={110} c={c} /><Dot x={70} y={140} c={c} />
    </>
  ),
  wrench: (c) => (
    <>
      <Shadow c={c} w={120} />
      <circle cx={200} cy={196} r={120} fill={c.soft} />
      <g transform="rotate(-40 200 200)">
        <rect x={180} y={170} width={40} height={180} rx={18} {...shape(c, c.paper)} />
        {/* An open-ended jaw: the head is a disc with its notch cut out of the top. */}
        <path d="M180 63.3 A62 62 0 1 0 220 63.3 L220 112 L180 112 Z" {...shape(c, c.accent)} />
        <circle cx={200} cy={318} r={9} fill={c.ink} />
      </g>
      <Sparkle x={330} y={300} c={c} /><Dot x={84} y={110} c={c} />
    </>
  ),
  house: (c) => (
    <>
      <Shadow c={c} w={150} />
      <rect x={250} y={86} width={34} height={60} rx={4} {...shape(c, c.soft)} />
      <path d="M60 190 l140 -110 l140 110" {...shape(c, c.accent)} />
      <rect x={90} y={180} width={220} height={146} rx={8} {...shape(c, c.paper)} />
      <rect x={176} y={240} width={48} height={86} rx={6} {...shape(c, c.soft)} />
      <rect x={112} y={214} width={44} height={40} rx={6} {...shape(c, c.soft)} /><rect x={244} y={214} width={44} height={40} rx={6} {...shape(c, c.soft)} />
      <circle cx={214} cy={286} r={4} fill={c.ink} />
      <Sparkle x={70} y={110} c={c} />
    </>
  ),
  toolbox: (c) => (
    <>
      <Shadow c={c} w={150} />
      <path d="M160 150 v-28 a12 12 0 0 1 12 -12 h56 a12 12 0 0 1 12 12 v28" fill="none" {...line(c)} />
      <rect x={70} y={150} width={260} height={160} rx={18} {...shape(c, c.accent)} />
      <rect x={70} y={150} width={260} height={50} rx={14} {...shape(c, c.soft)} />
      <rect x={180} y={186} width={40} height={30} rx={6} {...shape(c, c.paper)} />
      <g transform="rotate(-30 120 120)"><rect x={110} y={60} width={20} height={90} rx={6} {...shape(c, c.paper)} /></g>
      <Sparkle x={334} y={100} c={c} />
    </>
  ),
  water: (c) => (
    <>
      <Shadow c={c} w={110} />
      <rect x={70} y={120} width={160} height={40} rx={12} {...shape(c, c.paper)} />
      <rect x={210} y={100} width={40} height={140} rx={12} {...shape(c, c.paper)} />
      <circle cx={150} cy={104} r={34} fill="none" {...line(c)} stroke={c.accent} />
      <line x1={150} y1={104} x2={150} y2={140} {...line(c)} />
      <path d="M232 250 q-36 50 0 70 q36 -20 0 -70 z" {...shape(c, c.accent)} />
      <path d="M300 200 q-20 28 0 40 q20 -12 0 -40 z" {...shape(c, c.soft)} />
      <Sparkle x={330} y={110} c={c} />
    </>
  ),
  bulb: (c) => (
    <>
      <Shadow c={c} w={90} />
      <path d="M200 70 a90 90 0 0 1 52 164 q-12 10 -12 26 h-80 q0 -16 -12 -26 a90 90 0 0 1 52 -164 z" {...shape(c, c.soft)} />
      <rect x={160} y={260} width={80} height={24} rx={8} {...shape(c, c.paper)} /><rect x={168} y={284} width={64} height={24} rx={8} {...shape(c, c.paper)} />
      <path d="M180 200 q20 -40 40 0" fill="none" {...line(c)} stroke={c.accent} />
      <path d="M90 140 l-30 -12 M310 140 l30 -12 M110 70 l-20 -24 M290 70 l20 -24" {...line(c)} stroke={c.accent} />
    </>
  ),
  pills: (c) => (
    <>
      <Shadow c={c} w={130} />
      <rect x={110} y={80} width={130} height={40} rx={10} {...shape(c, c.accent)} />
      <rect x={100} y={118} width={150} height={204} rx={20} {...shape(c, c.paper)} />
      <rect x={118} y={170} width={114} height={90} rx={8} {...shape(c, c.soft)} />
      <Lines x={134} y={200} w={80} n={2} gap={30} c={c} />
      <g transform="rotate(-30 300 270)"><rect x={262} y={250} width={84} height={38} rx={19} {...shape(c, c.paper)} /><path d="M304 250 h23 a19 19 0 0 1 0 38 h-23 z" fill={c.accent} stroke={c.ink} strokeWidth={W} /></g>
      <circle cx={306} cy={180} r={20} {...shape(c, c.soft)} />
      <Sparkle x={320} y={94} c={c} />
    </>
  ),
  health: (c) => (
    <>
      <Shadow c={c} w={140} />
      <path d="M160 120 v-24 a12 12 0 0 1 12 -12 h56 a12 12 0 0 1 12 12 v24" fill="none" {...line(c)} />
      <rect x={70} y={120} width={260} height={196} rx={24} {...shape(c, c.paper)} />
      <path d="M182 168 h36 v36 h36 v36 h-36 v36 h-36 v-36 h-36 v-36 h36 z" {...shape(c, c.accent)} />
      <Sparkle x={340} y={96} c={c} /><Dot x={70} y={96} c={c} />
    </>
  ),
  doctor: (c) => (
    <>
      <Shadow c={c} w={130} />
      <rect x={90} y={80} width={170} height={236} rx={16} {...shape(c, c.paper)} />
      <rect x={140} y={64} width={70} height={32} rx={10} {...shape(c, c.soft)} />
      <Lines x={114} y={140} w={120} n={4} gap={32} c={c} />
      <path d="M300 110 v80 a50 50 0 0 1 -100 0" fill="none" {...line(c)} stroke={c.accent} />
      <circle cx={250} cy={276} r={28} {...shape(c, c.accent)} /><path d="M250 240 v12" {...line(c)} stroke={c.accent} />
      <circle cx={250} cy={276} r={10} fill={c.paper} />
      <Sparkle x={330} y={300} c={c} />
    </>
  ),
  books: (c) => (
    <>
      <Shadow c={c} w={140} />
      <rect x={70} y={250} width={230} height={50} rx={8} {...shape(c, c.accent)} />
      <rect x={90} y={200} width={200} height={50} rx={8} {...shape(c, c.soft)} />
      <rect x={80} y={150} width={210} height={50} rx={8} {...shape(c, c.paper)} />
      <line x1={110} y1={175} x2={250} y2={175} {...line(c)} strokeWidth={5} opacity={0.6} />
      <path d="M300 150 q-20 -30 0 -54 q20 24 0 54 z" {...shape(c, c.soft)} />
      <circle cx={306} cy={196} r={40} {...shape(c, c.accent)} />
      <path d="M306 156 q4 -16 18 -20" fill="none" {...line(c)} />
      <Sparkle x={96} y={100} c={c} />
    </>
  ),
  people: (c) => (
    <>
      <Shadow c={c} w={150} />
      <circle cx={140} cy={130} r={40} {...shape(c, c.soft)} />
      <path d="M70 320 v-60 a70 70 0 0 1 140 0 v60 z" {...shape(c, c.accent)} />
      <circle cx={262} cy={150} r={34} {...shape(c, c.paper)} />
      <path d="M200 320 v-50 a62 62 0 0 1 124 0 v50 z" {...shape(c, c.soft)} />
      <path d="M200 70 q12 -20 24 0 q12 -20 24 0 q0 20 -24 34 q-24 -14 -24 -34 z" fill={c.accent} />
      <Dot x={340} y={110} c={c} />
    </>
  ),
  magnifier: (c) => (
    <>
      <Shadow c={c} w={110} />
      <rect x={70} y={90} width={170} height={210} rx={14} {...shape(c, c.paper)} />
      <Lines x={94} y={136} w={120} n={5} gap={30} c={c} />
      <line x1={278} y1={262} x2={334} y2={318} {...line(c)} strokeWidth={22} />
      <circle cx={234} cy={218} r={66} {...shape(c, c.soft)} fillOpacity={0.85} />
      <path d="M200 190 a40 40 0 0 1 30 -16" fill="none" {...line(c)} stroke={c.paper} />
      <Sparkle x={340} y={100} c={c} />
    </>
  ),
  target: (c) => (
    <>
      <Shadow c={c} w={120} />
      <circle cx={190} cy={210} r={120} {...shape(c, c.paper)} />
      <circle cx={190} cy={210} r={80} {...shape(c, c.soft)} />
      <circle cx={190} cy={210} r={38} {...shape(c, c.accent)} />
      <line x1={196} y1={204} x2={316} y2={84} {...line(c)} />
      <path d="M316 84 l10 -38 l18 18 z M316 84 l38 -10 l-18 -18 z" {...shape(c, c.accent)} />
      <Dot x={70} y={96} c={c} />
    </>
  ),
  mind: (c) => (
    <>
      <Shadow c={c} w={120} />
      <path d="M120 330 v-60 q-40 -20 -40 -80 a110 110 0 0 1 220 -10 l26 50 h-26 v40 q0 20 -20 20 h-40 v40 z" {...shape(c, c.paper)} />
      <path d="M140 150 q-10 -40 30 -50 q20 -30 60 -10 q40 -10 50 30 q30 20 0 50 h-130 q-30 -6 -10 -20 z" {...shape(c, c.soft)} />
      <circle cx={170} cy={210} r={6} fill={c.accent} /><circle cx={200} cy={222} r={6} fill={c.accent} /><circle cx={230} cy={210} r={6} fill={c.accent} />
      <Sparkle x={330} y={96} c={c} />
    </>
  ),
  steps: (c) => (
    <>
      <Shadow c={c} w={150} />
      <path d="M60 320 v-60 h80 v-60 h80 v-60 h80 v180 z" {...shape(c, c.soft)} />
      <path d="M60 260 h80 v-60 h80 v-60 h80" fill="none" {...line(c)} />
      <circle cx={100} cy={232} r={18} {...shape(c, c.accent)} />
      <path d="M300 140 v-70 l40 18 l-40 18" {...shape(c, c.accent)} />
      <Dot x={180} y={110} c={c} />
    </>
  ),
  key: (c) => (
    <>
      <Shadow c={c} w={110} />
      <g transform="rotate(-35 200 200)">
        <circle cx={130} cy={200} r={56} {...shape(c, c.accent)} />
        <circle cx={118} cy={200} r={18} fill={c.paper} stroke={c.ink} strokeWidth={W} />
        <path d="M186 186 h150 v28 h-20 v26 h-26 v-26 h-20 v20 h-26 v-20 h-58 z" {...shape(c, c.paper)} />
      </g>
      <Sparkle x={330} y={96} c={c} /><Dot x={80} y={300} c={c} />
    </>
  ),
  shield: (c) => (
    <>
      <Shadow c={c} w={110} />
      <path d="M200 64 l120 40 v80 q0 100 -120 140 q-120 -40 -120 -140 v-80 z" {...shape(c, c.soft)} />
      <path d="M200 100 l84 28 v58 q0 72 -84 104 z" fill={c.accent} />
      <Check x={196} y={206} s={2.2} c={c} />
      <Sparkle x={340} y={96} c={c} />
    </>
  ),
  scale: (c) => (
    <>
      <Shadow c={c} w={130} />
      <line x1={200} y1={90} x2={200} y2={310} {...line(c)} />
      <rect x={150} y={300} width={100} height={22} rx={8} {...shape(c, c.soft)} />
      <line x1={90} y1={120} x2={310} y2={120} {...line(c)} />
      <circle cx={200} cy={90} r={14} {...shape(c, c.accent)} />
      <path d="M90 120 l-40 90 h80 z M310 120 l-40 90 h80 z" fill="none" {...line(c)} strokeWidth={4} />
      <path d="M44 210 a46 22 0 0 0 92 0 z" {...shape(c, c.accent)} /><path d="M264 210 a46 22 0 0 0 92 0 z" {...shape(c, c.paper)} />
    </>
  ),
  laptop: (c) => (
    <>
      <Shadow c={c} w={160} />
      <rect x={90} y={90} width={220} height={150} rx={14} {...shape(c, c.paper)} />
      <rect x={106} y={106} width={188} height={118} rx={6} fill={c.soft} />
      {[0, 1, 2].map((r) => <g key={r}><rect x={120} y={120 + r * 34} width={40} height={22} rx={4} fill={c.accent} opacity={r === 1 ? 1 : 0.45} /><rect x={170} y={124 + r * 34} width={108} height={14} rx={4} fill={c.paper} /></g>)}
      <path d="M60 250 h280 l-20 40 h-240 z" {...shape(c, c.accent)} />
      <Sparkle x={340} y={86} c={c} />
    </>
  ),
  moon: (c) => (
    <>
      <Shadow c={c} w={110} />
      <path d="M240 70 a130 130 0 1 0 90 210 a110 110 0 1 1 -90 -210 z" {...shape(c, c.soft)} />
      <Sparkle x={300} y={110} r={16} c={c} /><Sparkle x={250} y={180} r={10} c={c} /><Dot x={330} y={200} c={c} />
    </>
  ),
};

export const MOTIFS = Object.keys(DRAWINGS);

/** `ground` is how strongly the tinted blob behind shows: soft on a light slide, solid on a dark one so the drawing has a page to sit on. */
export function Illustration({ motif, palette, size, ground = 0.55 }: { motif: string; palette: Palette; size: number; ground?: number }) {
  const draw = DRAWINGS[motif];
  if (!draw) throw new Error(`no illustration "${motif}"`);
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible", display: "block" }}>
      <path d="M200 30 C300 30 380 100 370 210 C360 320 280 380 190 370 C90 360 20 290 30 190 C40 100 110 30 200 30 Z" fill={palette.soft} opacity={ground} />
      {draw(palette)}
    </svg>
  );
}
