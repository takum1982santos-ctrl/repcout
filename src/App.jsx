import { useState, useEffect, useRef, Component } from "react";

// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight:"100vh", background:"#0A0A0F", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px", fontFamily:"monospace" }}>
          <div style={{ fontSize:"32px", marginBottom:"16px" }}>⚠️</div>
          <div style={{ fontSize:"14px", color:"#FF4D4D", marginBottom:"8px", letterSpacing:"2px" }}>ERROR EN RENDER</div>
          <div style={{ fontSize:"11px", color:"#555", background:"rgba(255,255,255,0.05)", padding:"16px", borderRadius:"8px", maxWidth:"400px", wordBreak:"break-word" }}>
            {this.state.error.message}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── DATA ──────────────────────────────────────────────────────────────────

const categories = [
  {
    id: "fullbody", name: "Full Body", icon: "🔥", color: "#FF4D4D",
    exercises: [
      { id: "burpee_sin_salto", name: "Burpee Sin Salto",  steps: 6, icon: "⚡", color: "#FF4D4D", desc: "6 pasos · sin impacto final" },
      { id: "burpee_con_salto", name: "Burpee Con Salto",  steps: 7, icon: "🚀", color: "#FF2222", desc: "7 pasos · versión completa" },
      { id: "jumping_jacks",    name: "Jumping Jacks",     steps: 2, icon: "🌟", color: "#FF6B6B", desc: "Pies + brazos · cardio" },
    ],
  },
  {
    id: "empuje", name: "Empuje", icon: "💪", color: "#FF8C00",
    exercises: [
      { id: "flexiones",          name: "Flexiones",           steps: 2, icon: "💪", color: "#FF8C00", desc: "Agarre normal · pecho" },
      { id: "flexiones_diamante", name: "Flexiones Diamante",  steps: 2, icon: "💎", color: "#FF8C00", desc: "Agarre cerrado · tríceps" },
      { id: "pike_pushup",        name: "Pike Pushup",         steps: 2, icon: "🔺", color: "#FF8C00", desc: "Cadera alta · hombros" },
      { id: "dips",               name: "Dips",                steps: 2, icon: "🔽", color: "#FF8C00", desc: "Fondos · tríceps y pecho" },
    ],
  },
  {
    id: "tiron", name: "Tirón", icon: "🏋️", color: "#6C63FF",
    exercises: [
      { id: "dominadas",        name: "Dominadas",        steps: 2, icon: "🏋️", color: "#6C63FF", desc: "Agarre ancho · espalda" },
      { id: "dominada_supina",  name: "Dominada Supina",  steps: 2, icon: "💪", color: "#8B5CF6", desc: "Chin-up · bíceps dominante" },
      { id: "dominada_neutra",  name: "Dominada Neutra",  steps: 2, icon: "🤲", color: "#7C3AED", desc: "Agarre neutro · completo" },
      { id: "remo_australiano", name: "Remo Australiano", steps: 2, icon: "📐", color: "#5B21B6", desc: "Barra baja · espalda media" },
    ],
  },
  {
    id: "piernas", name: "Piernas", icon: "🦵", color: "#00C9A7",
    exercises: [
      { id: "sentadillas",           name: "Sentadillas",           steps: 2, icon: "🦵", color: "#00C9A7", desc: "Bilateral · cuádriceps" },
      { id: "zancadas",              name: "Zancadas",              steps: 2, icon: "🚶", color: "#00C9A7", desc: "Alternadas · glúteos" },
      { id: "sissy_squat",           name: "Sissy Squat",           steps: 2, icon: "⚡", color: "#06B6D4", desc: "Rodillas adelante · cuádriceps" },
      { id: "sentadilla_una_pierna", name: "Sentadilla Una Pierna", steps: 2, icon: "🦾", color: "#00C9A7", desc: "Pistol squat · avanzado" },
    ],
  },
  {
    id: "hold", name: "Isométrico", icon: "🧘", color: "#F59E0B",
    exercises: [
      { id: "plancha", name: "Plancha", steps: 1, icon: "⏱", color: "#F59E0B", desc: "Hold · core y alineación", holdMode: true },
      // TODO: agregar L-sit, hollow body, wall sit, etc.
    ],
  },
];

// Lista plana para búsquedas rápidas por id
const exercises = categories.flatMap(c => c.exercises);

const exerciseSteps = {
  burpee_sin_salto:       ["De pie","Agachado","Plancha","Flex abajo","Flex arriba","De pie"],
  burpee_con_salto:       ["De pie","Agachado","Plancha","Flex abajo","Flex arriba","De pie","Salto"],
  jumping_jacks:          ["Juntos","Abierto"],
  flexiones:              ["Arriba","Abajo"],
  flexiones_diamante:     ["Arriba","Abajo"],
  pike_pushup:            ["Arriba","Abajo"],
  dips:                   ["Arriba","Abajo"],
  dominadas:              ["Abajo","Arriba"],
  dominada_supina:        ["Abajo","Arriba"],
  dominada_neutra:        ["Abajo","Arriba"],
  remo_australiano:       ["Abajo","Arriba"],
  sentadillas:            ["De pie","Abajo"],
  zancadas:               ["De pie","Abajo"],
  sissy_squat:            ["De pie","Abajo"],
  sentadilla_una_pierna:  ["De pie","Abajo"],
  plancha:                ["HOLD"],
};

// Sugerencias por ejercicio { sets, reps (por set en modo series), duration (min libre), rest (seg) }
// Valores por defecto al seleccionar ejercicio
const exerciseDefaults = {
  burpee_sin_salto:       { sets:3, duration:300, rest:90 },
  burpee_con_salto:       { sets:3, duration:300, rest:90 },
  jumping_jacks:          { sets:3, duration:60,  rest:30 },
  flexiones:              { sets:4, duration:480, rest:60 },
  flexiones_diamante:     { sets:3, duration:360, rest:60 },
  pike_pushup:            { sets:3, duration:300, rest:60 },
  dips:                   { sets:3, duration:360, rest:60 },
  dominadas:              { sets:4, duration:300, rest:90 },
  dominada_supina:        { sets:4, duration:300, rest:90 },
  dominada_neutra:        { sets:4, duration:300, rest:90 },
  remo_australiano:       { sets:4, duration:300, rest:60 },
  sentadillas:            { sets:4, duration:480, rest:45 },
  zancadas:               { sets:3, duration:420, rest:45 },
  sissy_squat:            { sets:3, duration:300, rest:60 },
  sentadilla_una_pierna:  { sets:3, duration:300, rest:60 },
  plancha:                { sets:3, duration:60,  rest:60 }, // duración = meta de hold en segundos
};




// ─── STORAGE HELPERS ───────────────────────────────────────────────────────

const STORAGE_KEY    = "repcount-history";

// ─── MENSAJES MILITARES ─────────────────────────────────────────────────────
// TODO: mensajes motivacionales — pendiente de rediseño
const PR_KEY         = "repcount-prs";
const ROUTINES_KEY         = "repcount-routines";
const WORKOUT_ROUTINES_KEY = "repcount-workout-routines";

async function loadWorkoutRoutines() {
  try { const r = await window.storage.get(WORKOUT_ROUTINES_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveWorkoutRoutines(routines) {
  try { await window.storage.set(WORKOUT_ROUTINES_KEY, JSON.stringify(routines)); } catch {}
}

async function loadHistory() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : []; } catch { return []; }
}
async function saveSession(session) {
  try { const h = await loadHistory(); const u = [session, ...h].slice(0, 100); await window.storage.set(STORAGE_KEY, JSON.stringify(u)); return u; } catch { return null; }
}
async function loadPRs() {
  try { const r = await window.storage.get(PR_KEY); return r ? JSON.parse(r.value) : {}; } catch { return {}; }
}
async function savePR(exerciseId, reps) {
  try { const prs = await loadPRs(); prs[exerciseId] = reps; await window.storage.set(PR_KEY, JSON.stringify(prs)); } catch {}
}
async function loadRoutines() {
  try { const r = await window.storage.get(ROUTINES_KEY); return r ? JSON.parse(r.value) : {}; } catch { return {}; }
}
async function saveRoutines(routines) {
  try { await window.storage.set(ROUTINES_KEY, JSON.stringify(routines)); } catch {}
}
async function clearHistory() {
  try { await window.storage.delete(STORAGE_KEY); } catch {}
}

// ─── DATOS DE PRUEBA (nivel módulo para uso inmediato) ─────────────────────
const daysAgo = n => new Date(Date.now() - n * 86400000).toISOString();
const FAKE_HISTORY = [
  { id:"f1",  date:daysAgo(0),  exerciseId:"burpee_con_salto",     totalReps:28, sets:[8,10,10],  duration:5, rest:60, mode:"series" },
  { id:"f2",  date:daysAgo(0),  exerciseId:"flexiones",             totalReps:45, sets:[],         duration:8, rest:0,  mode:"libre", elapsed:480 },
  { id:"f3",  date:daysAgo(1),  exerciseId:"burpee_sin_salto",      totalReps:35, sets:[10,12,13], duration:5, rest:60, mode:"series" },
  { id:"f4",  date:daysAgo(1),  exerciseId:"dominadas",          totalReps:18, sets:[6,6,6],    duration:3, rest:90, mode:"series" },
  { id:"f5",  date:daysAgo(1),  exerciseId:"sentadillas",           totalReps:60, sets:[20,20,20], duration:5, rest:45, mode:"series" },
  { id:"f6",  date:daysAgo(2),  exerciseId:"flexiones_diamante",    totalReps:24, sets:[8,8,8],    duration:4, rest:60, mode:"series" },
  { id:"f7",  date:daysAgo(2),  exerciseId:"burpee_con_salto",      totalReps:22, sets:[7,8,7],    duration:5, rest:60, mode:"series" },
  { id:"f8",  date:daysAgo(4),  exerciseId:"dominada_supina",    totalReps:15, sets:[5,5,5],    duration:3, rest:90, mode:"series" },
  { id:"f9",  date:daysAgo(4),  exerciseId:"dips",                  totalReps:36, sets:[12,12,12], duration:4, rest:60, mode:"series" },
  { id:"f10", date:daysAgo(4),  exerciseId:"zancadas",              totalReps:40, sets:[],         duration:6, rest:0,  mode:"libre", elapsed:360 },
  { id:"f11", date:daysAgo(5),  exerciseId:"burpee_sin_salto",      totalReps:30, sets:[10,10,10], duration:5, rest:60, mode:"series" },
  { id:"f12", date:daysAgo(5),  exerciseId:"flexiones",             totalReps:50, sets:[15,18,17], duration:5, rest:45, mode:"series" },
  { id:"f13", date:daysAgo(7),  exerciseId:"burpee_con_salto",      totalReps:32, sets:[10,11,11], duration:5, rest:60, mode:"series" },
  { id:"f14", date:daysAgo(7),  exerciseId:"dominada_neutra",    totalReps:12, sets:[4,4,4],    duration:3, rest:90, mode:"series" },
  { id:"f15", date:daysAgo(7),  exerciseId:"sentadilla_una_pierna", totalReps:10, sets:[5,5],      duration:4, rest:60, mode:"series" },
  { id:"f16", date:daysAgo(10), exerciseId:"burpee_sin_salto",      totalReps:25, sets:[8,9,8],    duration:5, rest:60, mode:"series" },
  { id:"f17", date:daysAgo(10), exerciseId:"flexiones",             totalReps:38, sets:[12,13,13], duration:4, rest:45, mode:"series" },
  { id:"f18", date:daysAgo(10), exerciseId:"dominadas",          totalReps:21, sets:[7,7,7],    duration:3, rest:90, mode:"series" },
];

async function seedFakeHistory() {
  try {
    const existing = await loadHistory();
    if (existing.length > 0) return;
    await window.storage.set(STORAGE_KEY, JSON.stringify(FAKE_HISTORY));
  } catch {}
}



// ─── AUDIO ─────────────────────────────────────────────────────────────────

function playBeep(type = "alarm") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const b = (f, s, d, vol=0.4, wave="sine") => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = wave;
      g.gain.setValueAtTime(0, ctx.currentTime + s);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + s + 0.01);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + s + d);
      o.start(ctx.currentTime + s); o.stop(ctx.currentTime + s + d + 0.1);
    };
    // Silbato — dur controla la duración (corto ~0.15s, largo ~0.5s)
    const whistle = (offset, dur = 0.15) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 10; lfo.type = "sine";
      lg.gain.value = 14; lfo.connect(lg); lg.connect(o.frequency);
      o.frequency.value = 3100; o.type = "sine";
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0, ctx.currentTime + offset);
      g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + offset + 0.02);
      g.gain.setValueAtTime(0.45, ctx.currentTime + offset + dur - 0.04);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + offset + dur);
      lfo.start(ctx.currentTime + offset); lfo.stop(ctx.currentTime + offset + dur + 0.05);
      o.start(ctx.currentTime + offset); o.stop(ctx.currentTime + offset + dur + 0.05);
    };
    if (type === "alarm")    { b(880,0,.15); b(1100,.2,.15); b(1320,.4,.3); b(1760,.8,.5); }
    else if (type === "rest"){ b(440,0,.2);  b(330,.25,.3); }
    else if (type === "go")  { b(660,0,.1);  b(880,.15,.1); b(1100,.3,.25); }
    else if (type === "goal"){ b(1320,0,.1); b(1760,.12,.1); b(2093,.24,.1); b(1760,.36,.1); b(2093,.48,.25); }
    // 1 silbato al terminar set
    else if (type === "whistle")  { whistle(0, 0.18); }
    // 2 silbatos cortos de aviso (3s antes de arrancar)
    else if (type === "ready")    { whistle(0, 0.15); whistle(0.3, 0.15); }
    // 3 silbatos largos al terminar la sesión completa
    else if (type === "victory")  { whistle(0, 0.55); whistle(0.75, 0.55); whistle(1.5, 0.55); }
    // pip corto — aviso de que quedan pocos segundos
    else if (type === "warning")  { b(1480, 0, 0.08, 0.35); b(1480, 0.15, 0.08, 0.35); b(1480, 0.30, 0.08, 0.35); }
    // ding metálico — rep contada correctamente
    else if (type === "rep") {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "triangle"; o.frequency.value = 1800;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.5, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.65);
    }
    // buzz suave — rep incompleta o detección dudosa
    else if (type === "incomplete") { b(180, 0, 0.18, 0.25, "sawtooth"); }
  } catch {}
}

// ─── SKELETON POSES ────────────────────────────────────────────────────────
// Coordenadas normalizadas [0-1] para un canvas de 280x210
// Keypoints: [head, neck, shoulderL, shoulderR, elbowL, elbowR, wristL, wristR, hip, kneeL, kneeR, ankleL, ankleR]

const POSES = {
  // Postura de pie
  standing: {
    pts: [[140,28],[140,48],[118,52],[162,52],[105,80],[175,80],[98,108],[182,108],[140,98],[126,140],[154,140],[122,182],[158,182]],
    conf: [1,1,1,1,1,1,0.9,0.9,1,1,1,1,1],
  },
  // Agachado / sentadilla abajo
  squat_down: {
    pts: [[140,36],[140,56],[122,62],[158,62],[112,90],[168,90],[108,118],[172,118],[140,108],[120,148],[160,148],[115,175],[165,175]],
    conf: [1,1,1,1,1,1,0.9,0.9,1,1,1,1,1],
  },
  // Plancha
  plank: {
    pts: [[56,92],[70,96],[74,82],[66,82],[88,72],[52,72],[102,66],[38,66],[138,104],[150,118],[126,118],[160,130],[112,130]],
    conf: [1,1,1,1,1,1,0.85,0.85,1,1,1,1,1],
  },
  // Flexión abajo
  pushup_down: {
    pts: [[56,108],[70,110],[74,96],[66,96],[88,86],[52,86],[102,80],[38,80],[138,118],[150,132],[126,132],[160,144],[112,144]],
    conf: [1,1,1,1,1,1,0.85,0.85,1,1,1,1,1],
  },
  // Salto
  jump: {
    pts: [[140,18],[140,38],[116,44],[164,44],[102,70],[178,70],[94,52],[186,52],[140,88],[124,122],[156,122],[118,158],[162,158]],
    conf: [1,1,1,1,1,1,1,1,1,1,1,1,1],
  },
  // Pull-up arriba
  pullup_up: {
    pts: [[140,22],[140,42],[118,30],[162,30],[126,16],[154,16],[130,30],[150,30],[140,90],[128,132],[152,132],[124,172],[156,172]],
    conf: [1,1,1,1,1,1,0.9,0.9,1,1,1,1,1],
  },
};

// Mapa ejercicio+paso → pose
function getPose(exerciseId, stepIndex) {
  const map = {
    burpee_sin_salto:       ["standing","squat_down","plank","pushup_down","plank","standing"],
    burpee_con_salto:       ["standing","squat_down","plank","pushup_down","plank","standing","jump"],
    jumping_jacks:          ["standing","jump"],
    flexiones:              ["plank","pushup_down"],
    flexiones_diamante:     ["plank","pushup_down"],
    pike_pushup:            ["plank","pushup_down"],  // mismo mock, diferente detector
    dips:                   ["standing","squat_down"],
    dominadas:              ["standing","pullup_up"],
    dominada_supina:        ["standing","pullup_up"],
    dominada_neutra:        ["standing","pullup_up"],
    remo_australiano:       ["plank","pushup_down"],  // cuerpo inclinado similar a plancha
    sentadillas:            ["standing","squat_down"],
    zancadas:               ["standing","squat_down"],
    sissy_squat:            ["standing","squat_down"],
    sentadilla_una_pierna:  ["standing","squat_down"],
    plancha:                ["plank"],
  };
  const key = map[exerciseId]?.[stepIndex] || "standing";
  return POSES[key];
}

// Conexiones del esqueleto
const BONES = [
  [0,1],[1,2],[1,3],[2,4],[4,6],[3,5],[5,7],[2,8],[3,8],[8,9],[8,10],[9,11],[10,12]
];

// ─── MOVENET POSE DETECTION ────────────────────────────────────────────────

// Índices MoveNet: 0=nariz,1=ojo_i,2=ojo_d,3=oreja_i,4=oreja_d,
// 5=hombro_i,6=hombro_d,7=codo_i,8=codo_d,9=muñeca_i,10=muñeca_d,
// 11=cadera_i,12=cadera_d,13=rodilla_i,14=rodilla_d,15=tobillo_i,16=tobillo_d

function calcAngle(a, b, c) {
  // Ángulo en b formado por a-b-c
  const ab = [a[0]-b[0], a[1]-b[1]];
  const cb = [c[0]-b[0], c[1]-b[1]];
  const dot = ab[0]*cb[0] + ab[1]*cb[1];
  const mag = Math.sqrt(ab[0]**2+ab[1]**2) * Math.sqrt(cb[0]**2+cb[1]**2);
  return mag < 0.0001 ? 0 : Math.acos(Math.max(-1, Math.min(1, dot/mag))) * 180 / Math.PI;
}

// ─── DETECCIÓN DE REPS — P-33 ─────────────────────────────────────────────
// Mejoras: best-side selection, confidence checks, ángulos correctos para
// dominadas y burpees, y retorna conf para el overlay visual.

const MIN_CONF = 0.25; // bajado de 0.35 para mejor detección en dispositivos de gama baja (A03s)

const REP_DETECTORS = {
  // ── EMPUJE: ángulo de codo + verificación de plancha ────────────────────
  // isPlank: hombro, cadera y tobillo alineados horizontalmente (Y similares)
  flexiones: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    // Verificar plancha: los hombros NO deben estar muy por encima de las caderas.
    // Parado/sentado: shdY << hipY (hombros altos, caderas bajas en pantalla).
    // En plancha (cualquier ángulo): shdY ≈ hipY.
    const shdY = (kps[5][1] + kps[6][1]) / 2;
    const hipY = (kps[11][1] + kps[12][1]) / 2;
    // Si la cadera está más de 30% del alto del video por debajo del hombro → de pie
    const notPlank = (hipY - shdY) > 130;
    if (notPlank) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "down" : a > 140 ? "up" : null, conf: L ? cL : cR };
  },
  flexiones_diamante: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const shdY2 = (kps[5][1] + kps[6][1]) / 2;
    const hipY2 = (kps[11][1] + kps[12][1]) / 2;
    const notPlank2 = (hipY2 - shdY2) > 130;
    if (notPlank2) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 85 ? "down" : a > 140 ? "up" : null, conf: L ? cL : cR };
  },
  dips: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "down" : a > 150 ? "up" : null, conf: L ? cL : cR };
  },
  // ── PIERNAS: ángulo de rodilla, mejor lado ───────────────────────────────
  sentadillas: (kps) => {
    const cL = Math.min(kps[11][2], kps[13][2], kps[15][2]);
    const cR = Math.min(kps[12][2], kps[14][2], kps[16][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    // Verificar simetría: ambas rodillas deben estar a altura similar (sentadilla bilateral)
    // Si una rodilla está mucho más alta que la otra es zancada o rodilla al pecho
    const kneeYdiff = Math.abs(kps[13][1] - kps[14][1]);
    const hipW      = Math.abs(kps[11][0] - kps[12][0]);
    const isSymmetric = hipW < 10 || kneeYdiff < hipW * 0.8;
    if (!isSymmetric) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[11], kps[13], kps[15]) : calcAngle(kps[12], kps[14], kps[16]);
    return { angle: Math.round(a), phase: a < 100 ? "down" : a > 160 ? "up" : null, conf: L ? cL : cR };
  },
  zancadas: (kps) => {
    const cL = Math.min(kps[11][2], kps[13][2], kps[15][2]);
    const cR = Math.min(kps[12][2], kps[14][2], kps[16][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    // Verificar asimetría de zancada: una rodilla debe estar significativamente
    // más abajo que la otra en Y (la rodilla trasera cae hacia el suelo)
    const kneeYdiff = Math.abs(kps[13][1] - kps[14][1]);
    const ankYdiff  = Math.abs(kps[15][1] - kps[16][1]);
    const hipW      = Math.abs(kps[11][0] - kps[12][0]) || 40;
    // En zancada las rodillas están a diferente altura Y, o los tobillos separados
    const isLunge = kneeYdiff > hipW * 0.4 || ankYdiff > hipW * 0.4;
    if (!isLunge) return { angle: null, phase: null, conf: 0 };
    // En zancadas alternadas el lado dominante cambia con cada rep.
    // Usar la pierna que está zancando (menor ángulo de rodilla) en lugar del lado con más conf.
    const aL = cL >= MIN_CONF ? calcAngle(kps[11], kps[13], kps[15]) : 180;
    const aR = cR >= MIN_CONF ? calcAngle(kps[12], kps[14], kps[16]) : 180;
    const usarIzq = aL < aR;
    const a    = usarIzq ? aL : aR;
    const conf = usarIzq ? cL : cR;
    return { angle: Math.round(a), phase: a < 105 ? "down" : a > 160 ? "up" : null, conf };
  },
  sentadilla_una_pierna: (kps) => {
    const cL = Math.min(kps[11][2], kps[13][2], kps[15][2]);
    const cR = Math.min(kps[12][2], kps[14][2], kps[16][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    // Verificar que es pistol y no sentadilla bilateral:
    // La pierna libre debe estar extendida (>130°) y haber diferencia significativa (>40°) entre piernas.
    // Datos reales del usuario: pierna trabajando 76-101°, pierna libre 155-174°, diff siempre >40°.
    const aL = cL >= MIN_CONF ? calcAngle(kps[11], kps[13], kps[15]) : 180;
    const aR = cR >= MIN_CONF ? calcAngle(kps[12], kps[14], kps[16]) : 180;
    const diff = Math.abs(aL - aR);
    const freeAngle = Math.max(aL, aR);   // la más extendida = pierna libre
    const workAngle = Math.min(aL, aR);   // la más doblada = pierna trabajando
    // Si las dos están similares → bilateral, no pistol
    if (diff < 40 || freeAngle < 130) return { angle: null, phase: null, conf: 0 };
    const L = aL < aR; // lado que trabaja
    const conf = L ? cL : cR;
    return { angle: Math.round(workAngle), phase: workAngle < 95 ? "down" : workAngle > 155 ? "up" : null, conf };
  },
  // ── PIKE PUSHUP: codo + cadera alta ──────────────────────────────────────
  pike_pushup: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const shdY = (kps[5][1] + kps[6][1]) / 2;
    const hipY = (kps[11][1] + kps[12][1]) / 2;
    // En pike: cadera por encima del hombro (hipY < shdY en pantalla donde Y crece hacia abajo)
    if ((shdY - hipY) < 30) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "down" : a > 140 ? "up" : null, conf: L ? cL : cR };
  },
  // ── TIRÓN: ángulo de codo (mejor que posición Y) ─────────────────────────
  // Codo doblado (<90°) = arriba; codo extendido (>155°) = abajo
  dominadas: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "up" : a > 155 ? "down" : null, conf: L ? cL : cR };
  },
  dominada_supina: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "up" : a > 155 ? "down" : null, conf: L ? cL : cR };
  },
  dominada_neutra: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "up" : a > 155 ? "down" : null, conf: L ? cL : cR };
  },
  // ── REMO AUSTRALIANO: codo + verificación cuerpo inclinado ───────────────
  // El cuerpo queda casi horizontal tirando de una barra baja.
  // Cuerpo inclinado: shdY ≈ hipY (alineados horizontalmente como en plancha pero invertido)
  remo_australiano: (kps) => {
    const cL = Math.min(kps[5][2], kps[7][2], kps[9][2]);
    const cR = Math.min(kps[6][2], kps[8][2], kps[10][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const shdY = (kps[5][1] + kps[6][1]) / 2;
    const hipY = (kps[11][1] + kps[12][1]) / 2;
    // En remo australiano el cuerpo está inclinado: hombro y cadera a altura similar
    const isInclined = Math.abs(hipY - shdY) < 120;
    if (!isInclined) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[7], kps[9]) : calcAngle(kps[6], kps[8], kps[10]);
    return { angle: Math.round(a), phase: a < 90 ? "up" : a > 150 ? "down" : null, conf: L ? cL : cR };
  },
  // ── SISSY SQUAT: ángulo de rodilla muy agudo + cadera extendida ──────────
  // Las rodillas van muy adelante, ángulo de rodilla ~50-70° en el punto más bajo
  sissy_squat: (kps) => {
    const cL = Math.min(kps[11][2], kps[13][2], kps[15][2]);
    const cR = Math.min(kps[12][2], kps[14][2], kps[16][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[11], kps[13], kps[15]) : calcAngle(kps[12], kps[14], kps[16]);
    // Rango más agudo que sentadilla normal: abajo <75°, arriba >155°
    return { angle: Math.round(a), phase: a < 75 ? "down" : a > 155 ? "up" : null, conf: L ? cL : cR };
  },
  // ── JUMPING JACKS: posición de pies y muñecas ───────────────────────────
  // Fase "abajo": pies juntos + manos bajas (junto al cuerpo)
  // Fase "arriba": pies separados + manos arriba (por encima de hombros)
  jumping_jacks: (kps) => {
    const cAnk = Math.min(kps[15][2], kps[16][2]);
    const cWri = Math.min(kps[9][2],  kps[10][2]);
    if (cAnk < MIN_CONF && cWri < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    // Separación de tobillos normalizada por ancho de hombros
    const shdW = Math.abs(kps[5][0] - kps[6][0]) || 80;
    const ankSep = Math.abs(kps[15][0] - kps[16][0]) / shdW;
    // Altura de muñecas relativa a hombros (Y crece hacia abajo)
    const shdY  = (kps[5][1] + kps[6][1]) / 2;
    const wriY  = (kps[9][1]  + kps[10][1]) / 2;
    const wriUp = shdY - wriY; // positivo = muñecas por encima de hombros
    const conf  = Math.max(cAnk, cWri);
    // "up": pies separados (>0.55×hombros) Y manos arriba
    // "down": brazos claramente abajo (<-20px) — datos reales muestran wriUp=-85 en pos. cerrada
    // Los tobillos en A5 dan ratio ~0.49 incluso cerrado, por eso no los usamos para "down"
    const phase = (ankSep > 0.55 && wriUp > 10) ? "up"
                : (wriUp < -20)                  ? "down"
                : null;
    return { angle: Math.round(ankSep * 100), phase, conf };
  },
  // ── PLANCHA HOLD: modo isométrico — detecta pose correcta ────────────────
  // No cuenta reps, sostiene un timer mientras la alineación es válida.
  // La lógica de hold se maneja en el componente, acá solo devuelve si la pose es válida.
  plancha: (kps) => {
    const cL = Math.min(kps[5][2], kps[11][2], kps[15][2]);
    const cR = Math.min(kps[6][2], kps[12][2], kps[16][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const shdY = (kps[5][1] + kps[6][1]) / 2;
    const hipY = (kps[11][1] + kps[12][1]) / 2;
    const ankY = (kps[15][1] + kps[16][1]) / 2;
    // Alineación: hombro, cadera y tobillo deben estar a altura similar (cuerpo horizontal)
    const bodyLen = Math.abs(ankY - shdY) || 1;
    const hipDev  = Math.abs(hipY - (shdY + ankY) / 2) / bodyLen;
    // hipDev < 0.1 = plancha buena; > 0.15 = cadera caída o levantada
    const isValid = hipDev < 0.15;
    const L = cL >= cR;
    return { angle: Math.round(hipDev * 100), phase: isValid ? "up" : null, conf: L ? cL : cR };
  },
  // ── BURPEES: ángulo de cadera (hombro-cadera-rodilla) ────────────────────
  // Cuerpo recto (de pie) = >160°; agachado/plancha = <110°
  burpee_sin_salto: (kps) => {
    const cL = Math.min(kps[5][2], kps[11][2], kps[13][2]);
    const cR = Math.min(kps[6][2], kps[12][2], kps[14][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[11], kps[13]) : calcAngle(kps[6], kps[12], kps[14]);
    return { angle: Math.round(a), phase: a < 110 ? "down" : a > 160 ? "up" : null, conf: L ? cL : cR };
  },
  burpee_con_salto: (kps) => {
    const cL = Math.min(kps[5][2], kps[11][2], kps[13][2]);
    const cR = Math.min(kps[6][2], kps[12][2], kps[14][2]);
    if (cL < MIN_CONF && cR < MIN_CONF) return { angle: null, phase: null, conf: 0 };
    const L = cL >= cR;
    const a = L ? calcAngle(kps[5], kps[11], kps[13]) : calcAngle(kps[6], kps[12], kps[14]);
    return { angle: Math.round(a), phase: a < 110 ? "down" : a > 155 ? "up" : null, conf: L ? cL : cR };
  },
};

// ─── MOVENET SCRIPTS — URLs y pre-carga ───────────────────────────────────

const TF_URL = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js";
const PD_URL = "https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js";

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// Llamar durante el countdown para que los scripts ya estén en caché cuando el usuario activa IA
function preloadMoveNetScripts() {
  return loadScript(TF_URL).then(() => loadScript(PD_URL)).catch(() => {});
}

// ─── MOVENET HOOK — con smoothing, debounce y cooldown ────────────────────

function useMoveNet({ active, exerciseId, onRep, onIncomplete, onStatus, onAngle, onReady, facingMode = "user" }) {
  const videoRef     = useRef(null);
  const keypointsRef = useRef(null);
  const phaseRef     = useRef(null);
  const frameRef     = useRef(null);
  const angleHistRef = useRef([]);  // últimos N ángulos para suavizar
  const phaseHistRef = useRef([]);  // últimas N fases para debounce
  const lastRepRef   = useRef(0);   // timestamp última rep

  const SMOOTH_FRAMES = 5;   // frames para promedio de ángulo
  const PHASE_FRAMES  = 3;   // frames consecutivos para confirmar fase
  const REP_COOLDOWN  = 600; // ms mínimos entre reps

  useEffect(() => {
    if (!active) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }
    let cancelled = false;

    const init = async () => {
      try {
        // 🔧 SPEED OPT 1: resolución baja en mobile (4x menos trabajo)
        const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
        const camW = isMobile ? 320 : 640;
        const camH = isMobile ? 240 : 480;

        onStatus("1/3 · Descargando IA...");

        // 🔧 SPEED OPT 2: tf.js + cámara en paralelo; pose-detection después (depende de tf.js)
        let stream;
        try {
          [, stream] = await Promise.all([
            loadScript(TF_URL),
            navigator.mediaDevices.getUserMedia({
              video: { facingMode: facingMode, width:{ ideal:camW }, height:{ ideal:camH } }, audio:false
            })
          ]);
          await loadScript(PD_URL); // pose-detection necesita tf.js listo primero
        } catch(e) {
          await loadScript(TF_URL).catch(()=>{});
          await loadScript(PD_URL).catch(()=>{});
          throw e;
        }
        if (cancelled) { stream?.getTracks().forEach(t=>t.stop()); return; }

        const video = document.createElement("video");
        video.srcObject = stream; video.playsInline = true; video.muted = true;
        await video.play();
        videoRef.current = video;

        onStatus("2/3 · Motor IA...");

        // 🔧 SPEED OPT 3: fallback de backend — webgl → cpu
        let backendUsed = "cpu";
        try {
          await window.tf.setBackend("webgl");
          await window.tf.ready();
          backendUsed = "webgl";
        } catch(e) {
          try { await window.tf.setBackend("cpu"); await window.tf.ready(); } catch(e2) {}
        }

        onStatus("3/3 · Modelo pose... [" + backendUsed + "]");
        const detector = await window.poseDetection.createDetector(
          window.poseDetection.SupportedModels.MoveNet,
          {
            modelType: window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
            enableSmoothing: true,
          }
        );
        // Warm-up: pasar un frame al modelo para que inicialice los pesos internos
        // Algunos phones (A03s) se quedan en ESPERANDO sin este paso
        try { await detector.estimatePoses(videoRef.current); } catch(e) {}

        // Timeout: si después de 15s el modelo no detecta nada, avisar al usuario
        let framesSinDeteccion = 0;
        const MAX_FRAMES_SIN_DETECCION = 90; // ~15s a 6fps en mobile lento
        onStatus("ACTIVO");
        onReady?.(); // notifica al padre que la IA está lista para detectar

        // 🔧 SPEED OPT 4: frame skipping en mobile (1 de cada 2 frames)
        let frameCount = 0;
        const SKIP = isMobile ? 2 : 1;

        const detect = async () => {
          if (cancelled || !videoRef.current) return;
          frameCount++;
          if (frameCount % SKIP !== 0) {
            frameRef.current = requestAnimationFrame(detect);
            return;
          }
          // Esperar a que el video tenga frames reales (evita freeze en A03s)
          if (videoRef.current.readyState < 2 || videoRef.current.videoWidth === 0) {
            frameRef.current = requestAnimationFrame(detect);
            return;
          }
          try {
            const poses = await detector.estimatePoses(videoRef.current);
            if (poses?.[0]?.keypoints?.length >= 17) {
              const kps = poses[0].keypoints.map(k => [k.x, k.y, k.score ?? k.confidence ?? 0]);
              // Verificar que al menos algunos keypoints tengan confianza mínima
              const kpsValidos = kps.filter(k => k[2] >= MIN_CONF).length;
              if (kpsValidos < 3) {
                framesSinDeteccion++;
                if (framesSinDeteccion >= MAX_FRAMES_SIN_DETECCION) {
                  onStatus("Sin detección — usá + MANUAL");
                  framesSinDeteccion = 0; // reset para no spamear
                }
                frameRef.current = requestAnimationFrame(detect);
                return;
              }
              framesSinDeteccion = 0;
              keypointsRef.current = kps;

              const repDet = REP_DETECTORS[exerciseId];
              if (repDet) {
                const { angle, phase, conf } = repDet(kps);

                if (angle !== null && conf >= MIN_CONF) {
                  // 1. Suavizar ángulo (rolling average)
                  angleHistRef.current = [...angleHistRef.current, angle].slice(-SMOOTH_FRAMES);
                  const smoothAngle = Math.round(
                    angleHistRef.current.reduce((a,b)=>a+b,0) / angleHistRef.current.length
                  );

                  // 2. Notificar UI con ángulo suavizado
                  onAngle?.({ angle: smoothAngle, phase: phaseRef.current, conf });

                  // 3. Debounce de fase — sólo cambia si N frames seguidos coinciden
                  if (phase) {
                    phaseHistRef.current = [...phaseHistRef.current, phase].slice(-PHASE_FRAMES);
                    const stable = phaseHistRef.current.length === PHASE_FRAMES
                      && phaseHistRef.current.every(p => p === phase);

                    if (stable && phase !== phaseRef.current) {
                      const prev = phaseRef.current;
                      phaseRef.current = phase;

                      // 4. Cooldown entre reps
                      const now = Date.now();
                      if (phase === "up" && prev === "down" && (now - lastRepRef.current) > REP_COOLDOWN) {
                        lastRepRef.current = now;
                        playBeep("rep");
                        onRep();
                      }
                    }
                  } else {
                    // Zona neutral: si venía de "down" sin llegar a "up" → rep incompleta
                    if (phaseRef.current === "down" && phaseHistRef.current.length > 0) {
                      playBeep("incomplete");
                    }
                    // Limpiar historial para evitar fase "fantasma"
                    phaseHistRef.current = [];
                  }
                } else {
                  // Pasar phase: null (no phaseRef.current) para que el hold mode sepa
                  // que la posición es inválida y pause el timer
                  phaseHistRef.current = [];
                  phaseRef.current = null;
                  onAngle?.({ angle: null, phase: null, conf: 0 });
                }
              }
            }
          } catch(e) {}
          frameRef.current = requestAnimationFrame(detect);
        };
        detect();
      } catch(err) {
        if (!cancelled) onStatus("Error: " + (err.message || "No se pudo iniciar"));
      }
    };

    init();
    return () => {
      cancelled = true;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (videoRef.current) videoRef.current.srcObject?.getTracks().forEach(t=>t.stop());
    };
  }, [active, exerciseId]);

  return { videoRef, keypointsRef };
}

// ─── POSE VIEW — con overlay de ángulo y fase ─────────────────────────────

function PoseView({ color, exerciseId, onRep, active, facingMode, onFlipCamera, onReady, onPhaseChange }) {
  const canvasRef    = useRef(null);
  const drawFrameRef = useRef(null);
  const [status, setStatus]   = useState("En espera...");
  const [liveAngle, setLiveAngle] = useState(null);
  const [livePhase, setLivePhase] = useState(null);
  const [liveConf,  setLiveConf]  = useState(0);
  const [repFlash,  setRepFlash]  = useState(false);
  const repFlashRef = useRef(false);
  const lastPhaseRef = useRef(null); // para no spamear onPhaseChange

  const handleRep = () => {
    onRep();
    repFlashRef.current = true;
    setRepFlash(true);
    setTimeout(() => { repFlashRef.current = false; setRepFlash(false); }, 400);
  };

  const handleAngle = ({ angle, phase, conf }) => {
    setLiveAngle(angle);
    setLivePhase(phase);
    setLiveConf(conf);
    // Notificar al padre solo cuando la fase cambia
    if (phase !== lastPhaseRef.current) {
      lastPhaseRef.current = phase;
      onPhaseChange?.(phase);
    }
  };

  const { videoRef, keypointsRef } = useMoveNet({
    active, exerciseId, onRep: handleRep, onIncomplete: () => {}, onStatus: setStatus, onAngle: handleAngle, facingMode,
    onReady,
  });

  const CONNECTIONS = [
    [5,6],[5,7],[7,9],[6,8],[8,10],
    [5,11],[6,12],[11,12],
    [11,13],[13,15],[12,14],[14,16],
  ];

  // Joints a resaltar según ejercicio
  const HIGHLIGHT_JOINTS = {
    flexiones:             [[5,7,9],[6,8,10]],
    flexiones_diamante:    [[5,7,9],[6,8,10]],
    pike_pushup:           [[5,7,9],[6,8,10]],
    dips:                  [[5,7,9],[6,8,10]],
    dominadas:             [[5,7,9],[6,8,10]],
    dominada_supina:       [[5,7,9],[6,8,10]],
    dominada_neutra:       [[5,7,9],[6,8,10]],
    remo_australiano:      [[5,7,9],[6,8,10]],
    sentadillas:           [[11,13,15],[12,14,16]],
    zancadas:              [[11,13,15],[12,14,16]],
    sissy_squat:           [[11,13,15],[12,14,16]],
    sentadilla_una_pierna: [[11,13,15],[12,14,16]],
    jumping_jacks:         [[15,16],[9,10]],   // tobillos + muñecas
    burpee_sin_salto:      [[5,11,13],[6,12,14]],
    burpee_con_salto:      [[5,11,13],[6,12,14]],
    plancha:               [[5,11,15],[6,12,16]], // hombro-cadera-tobillo
  };

  useEffect(() => {
    if (!active) { if (drawFrameRef.current) cancelAnimationFrame(drawFrameRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#060810";
      ctx.fillRect(0, 0, W, H);

      // Video espejado
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        ctx.save();
        ctx.translate(W, 0); ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, W, H);
        ctx.restore();
      }

      // Flash de rep
      if (repFlashRef.current) {
        ctx.fillStyle = `${color}33`;
        ctx.fillRect(0, 0, W, H);
      }

      const kps = keypointsRef.current;
      if (kps) {
        const scaleX = W / 640, scaleY = H / 480;
        const px = (i) => [W - kps[i][0] * scaleX, kps[i][1] * scaleY];

        // Obtener joints a resaltar
        const hlSets = HIGHLIGHT_JOINTS[exerciseId] || [];
        const hlFlat = new Set(hlSets.flat());

        // Bones normales
        CONNECTIONS.forEach(([a, b]) => {
          if (kps[a][2] < 0.2 || kps[b][2] < 0.2) return;
          const [ax, ay] = px(a), [bx, by] = px(b);
          const isHL = hlFlat.has(a) && hlFlat.has(b);
          ctx.strokeStyle = isHL ? color : `${color}55`;
          ctx.lineWidth   = isHL ? 4 : 2;
          ctx.lineCap = "round";
          ctx.shadowColor = isHL ? color : "transparent";
          ctx.shadowBlur  = isHL ? 10 : 0;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          ctx.shadowBlur = 0;
        });

        // Keypoints
        kps.forEach(([x, y, score], i) => {
          if (score < 0.2) return;
          const [px2, py2] = [W - x * scaleX, y * scaleY];
          const isHL = hlFlat.has(i);
          ctx.fillStyle   = isHL ? color : `${color}77`;
          ctx.shadowColor = isHL ? color : "transparent";
          ctx.shadowBlur  = isHL ? 12 : 0;
          ctx.beginPath(); ctx.arc(px2, py2, isHL ? 6 : 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Dibujar ángulo en la articulación del medio del grupo resaltado
        if (hlSets.length > 0 && liveAngle !== null) {
          // Buscar el grupo con mayor conf combinada
          const bestGroup = hlSets.find(g => g.every(i => kps[i][2] >= MIN_CONF)) || hlSets[0];
          const midIdx = bestGroup[1]; // articulación del medio
          if (kps[midIdx][2] >= 0.3) {
            const [mx, my] = [W - kps[midIdx][0] * scaleX, kps[midIdx][1] * scaleY];
            // Fondo del texto
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.beginPath();
            ctx.roundRect(mx - 28, my - 22, 56, 20, 4);
            ctx.fill();
            ctx.fillStyle = livePhase === "down" ? "#FF4D4D" : livePhase === "up" ? "#00C9A7" : color;
            ctx.font = "bold 13px monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${liveAngle}°`, mx, my - 7);
            ctx.textAlign = "left";
          }
        }
      }

      // Brackets
      [[10,10],[W-10,10],[10,H-10],[W-10,H-10]].forEach(([cx,cy],i) => {
        const sx = i%2===0?1:-1, sy = i<2?1:-1;
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy+sy*20); ctx.lineTo(cx, cy+sy*4); ctx.lineTo(cx+sx*20, cy+sy*4);
        ctx.stroke();
      });

      drawFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(drawFrameRef.current);
  }, [active, color, exerciseId]);

  // Sincronizar liveAngle en el loop de draw sin reiniciar
  const liveAngleRef = useRef(null);
  const livePhaseRef = useRef(null);
  useEffect(() => { liveAngleRef.current = liveAngle; }, [liveAngle]);
  useEffect(() => { livePhaseRef.current = livePhase; }, [livePhase]);

  const phaseLabel = livePhase === "down" ? "↓ BAJANDO" : livePhase === "up" ? "↑ ARRIBA" : "· ESPERANDO";
  const phaseColor = livePhase === "down" ? "#FF4D4D" : livePhase === "up" ? "#00C9A7" : "#555";

  return (
    <div style={{ position:"relative" }}>
      <canvas ref={canvasRef} width={280} height={210}
        style={{ width:"100%", borderRadius:"16px", display:"block",
          border:`2px solid ${repFlash ? color : color+"33"}`,
          boxShadow: repFlash ? `0 0 20px ${color}55` : "none",
          transition:"border-color 0.1s, box-shadow 0.1s" }} />

      {/* Botón rotar cámara */}
      {onFlipCamera && (
        <button onClick={onFlipCamera} style={{ position:"absolute", top:"8px", right:"8px", background:"rgba(0,0,0,0.6)", border:`1px solid ${color}44`, borderRadius:"8px", color:"#fff", fontSize:"16px", padding:"4px 8px", cursor:"pointer", lineHeight:1 }}
          title="Cambiar cámara">
          {facingMode === "user" ? "📷" : "🤳"}
        </button>
      )}

      {/* Status bar */}
      <div style={{ position:"absolute", bottom:"8px", left:"50%", transform:"translateX(-50%)",
        display:"flex", alignItems:"center", gap:"8px",
        background:"rgba(0,0,0,0.8)", border:`1px solid ${color}44`, borderRadius:"20px",
        padding:"4px 12px", whiteSpace:"nowrap" }}>
        {/* Ángulo */}
        {liveAngle !== null && (
          <span style={{ fontSize:"13px", fontFamily:"monospace", color:phaseColor, fontWeight:"bold" }}>
            {liveAngle}°
          </span>
        )}
        {/* Fase */}
        <span style={{ fontSize:"9px", letterSpacing:"2px", color:phaseColor }}>
          {status === "ACTIVO" ? phaseLabel : status}
        </span>
        {/* Barra de confianza */}
        {status === "ACTIVO" && (
          <div style={{ width:"36px", height:"5px", borderRadius:"3px", background:"rgba(255,255,255,0.1)", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:"3px", width:`${liveConf * 100}%`,
              background: liveConf > 0.6 ? "#00C9A7" : liveConf > 0.35 ? "#FFD700" : "#FF4D4D",
              transition:"width 0.1s" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CAMERA MOCK ───────────────────────────────────────────────────────────

function CameraView({ color, animating, activeStep, exerciseId }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  const timeRef   = useRef(0);
  const poseRef   = useRef({ pts: POSES.standing.pts.map(p => [...p]) });

  // Actualizar pose objetivo cuando cambia el paso
  useEffect(() => {
    poseRef.current.target = getPose(exerciseId || "sentadillas", activeStep || 0);
  }, [activeStep, exerciseId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;

    // Estado interno del render
    const state = {
      pts: POSES.standing.pts.map(p => [...p]),  // posición actual interpolada
      scanY: 0,
      scanDir: 1,
      pulseR: 0,
      detectedFlash: 0,
      noiseOffset: 0,
      confidenceAnim: 1,
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const draw = (ts) => {
      const dt = Math.min((ts - timeRef.current) / 1000, 0.05);
      timeRef.current = ts;

      // Interpolar pose actual hacia objetivo
      const target = poseRef.current.target || POSES.standing;
      const speed = animating ? 8 : 3;
      state.pts = state.pts.map((p, i) => [
        lerp(p[0], target.pts[i][0], dt * speed),
        lerp(p[1], target.pts[i][1], dt * speed),
      ]);

      // Scan line
      state.scanY += dt * 60 * state.scanDir;
      if (state.scanY > H) state.scanDir = -1;
      if (state.scanY < 0) state.scanDir = 1;

      // Pulse
      state.pulseR = (state.pulseR + dt * 2) % (Math.PI * 2);

      // Flash on rep detect
      if (animating) state.detectedFlash = Math.min(state.detectedFlash + dt * 4, 1);
      else state.detectedFlash = Math.max(state.detectedFlash - dt * 3, 0);

      // ── Draw ──────────────────────────────────────────────────────────────

      // Background
      ctx.fillStyle = "#060810";
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Vignette
      const vg = ctx.createRadialGradient(W/2, H/2, H*0.2, W/2, H/2, H*0.8);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.6)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      // Detected flash overlay
      if (state.detectedFlash > 0) {
        ctx.fillStyle = `${color}${Math.round(state.detectedFlash * 22).toString(16).padStart(2,"0")}`;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Skeleton ──────────────────────────────────────────────────────────

      const pts = state.pts;
      const conf = target.conf;

      // Add subtle jitter when animating
      const jitter = animating ? 1.5 : 0.4;

      // Bones
      BONES.forEach(([a, b]) => {
        const ca = conf[a], cb = conf[b];
        if (ca < 0.5 || cb < 0.5) return;
        const ax = pts[a][0] + (Math.sin(ts * 0.003 + a) * jitter);
        const ay = pts[a][1] + (Math.cos(ts * 0.002 + a) * jitter);
        const bx = pts[b][0] + (Math.sin(ts * 0.003 + b) * jitter);
        const by = pts[b][1] + (Math.cos(ts * 0.002 + b) * jitter);

        // Glow bone
        ctx.strokeStyle = `${color}44`;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();

        // Main bone
        ctx.strokeStyle = `${color}cc`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      });

      // Keypoints
      pts.forEach(([x, y], i) => {
        if (conf[i] < 0.5) return;
        const jx = x + Math.sin(ts * 0.003 + i) * jitter;
        const jy = y + Math.cos(ts * 0.002 + i) * jitter;
        const r = i === 0 ? 6 : 4; // head bigger

        // Outer glow
        const gr = ctx.createRadialGradient(jx, jy, 0, jx, jy, r * 3);
        gr.addColorStop(0, `${color}66`);
        gr.addColorStop(1, "transparent");
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(jx, jy, r * 3, 0, Math.PI * 2); ctx.fill();

        // Dot
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(jx, jy, r * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(jx, jy, r, 0, Math.PI * 2); ctx.fill();

        // Inner white center
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath(); ctx.arc(jx, jy, r * 0.35, 0, Math.PI * 2); ctx.fill();
      });

      // ── Scan line ─────────────────────────────────────────────────────────
      const sg = ctx.createLinearGradient(0, state.scanY - 12, 0, state.scanY + 12);
      sg.addColorStop(0, "transparent");
      sg.addColorStop(0.5, `${color}55`);
      sg.addColorStop(1, "transparent");
      ctx.fillStyle = sg;
      ctx.fillRect(0, state.scanY - 12, W, 24);

      // Thin bright line
      ctx.strokeStyle = `${color}99`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, state.scanY); ctx.lineTo(W, state.scanY); ctx.stroke();

      // ── HUD ───────────────────────────────────────────────────────────────

      // Top-left: label
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      roundRect(ctx, 10, 10, 120, 22, 4);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.font = "bold 9px monospace";
      ctx.letterSpacing = "2px";
      ctx.fillText("AI POSE TRACKING", 16, 24);

      // Top-right: LIVE badge
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      roundRect(ctx, W - 58, 10, 48, 20, 10);
      ctx.fill();
      // Pulsing dot
      const dotAlpha = 0.6 + Math.sin(state.pulseR * 3) * 0.4;
      ctx.fillStyle = `rgba(255,60,60,${dotAlpha})`;
      ctx.beginPath(); ctx.arc(W - 48, 20, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("LIVE", W - 40, 24);

      // Bottom: confidence bar
      const barY = H - 22;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      roundRect(ctx, 10, barY, W - 20, 14, 3);
      ctx.fill();

      const confPct = animating ? 0.6 + Math.sin(ts * 0.008) * 0.3 : 0.82 + Math.sin(ts * 0.002) * 0.05;
      ctx.fillStyle = `${color}33`;
      roundRect(ctx, 11, barY + 1, (W - 22) * confPct, 12, 2);
      ctx.fill();
      ctx.fillStyle = color;
      roundRect(ctx, 11, barY + 1, (W - 22) * confPct, 12, 2);
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.font = "bold 8px monospace";
      ctx.fillText(`CONF: ${Math.round(confPct * 100)}%`, 16, barY + 10);

      // ── Detected flash text ───────────────────────────────────────────────
      if (state.detectedFlash > 0.1) {
        ctx.globalAlpha = state.detectedFlash;
        ctx.fillStyle = color;
        ctx.font = `bold ${14 + state.detectedFlash * 4}px monospace`;
        ctx.textAlign = "center";
        ctx.fillText("⚡ REP DETECTADA", W / 2, H / 2 - 10);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }

      // Corner brackets
      const bL = 20, bT = 4;
      [[10,10],[W-10,10],[10,H-10],[W-10,H-10]].forEach(([cx, cy], i) => {
        const sx = i % 2 === 0 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * bL);
        ctx.lineTo(cx, cy + sy * bT);
        ctx.lineTo(cx + sx * bL, cy + sy * bT);
        ctx.stroke();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [color, animating]);

  // Actualizar la ref de animating sin reiniciar el loop
  useEffect(() => {
    poseRef.current.animating = animating;
  }, [animating]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={210}
      style={{ width: "100%", borderRadius: "16px", display: "block", border: `1px solid ${color}33` }}
    />
  );
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── DATE HELPERS ──────────────────────────────────────────────────────────

function formatDate(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-AR", { day:"numeric", month:"short" });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour:"2-digit", minute:"2-digit" });
}

function HistoryScreen({ onBack }) {
  const [history, setHistory] = useState(FAKE_HISTORY);
  const [detail, setDetail]   = useState(null);
  const [tab, setTab]         = useState("cal");
  const [confirmClear, setConfirmClear] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [selectedDay, setSelectedDay] = useState(null);
  // Rutina semanal: { 0..6: { exerciseId, hora, activo } } (0=lunes)
  const [rutina, setRutina] = useState({});
  const [notifPermiso, setNotifPermiso] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");
  const [rutinaPickerDay, setRutinaPickerDay] = useState(null); // qué día está abriendo el selector

  useEffect(() => {
    (async () => {
      try {
        await seedFakeHistory();
        const h = await loadHistory();
        if (h && h.length > 0) setHistory(h);
        // Cargar rutina guardada
        const r = await loadRoutines();
        if (r && Object.keys(r).length > 0) setRutina(r);
      } catch { /* mantiene defaults */ }
    })();
  }, []);

  const handleClear = async () => { await clearHistory(); setHistory([]); setConfirmClear(false); };

  if (history === null) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"60vh" }}>
        <div style={{ width:"36px", height:"36px", borderRadius:"50%", border:"3px solid #FF4D4D33", borderTop:"3px solid #FF4D4D", animation:"spin 0.8s linear infinite" }} />
      </div>
    );
  }

  // ── DETALLE ──────────────────────────────────────────────────────────────
  if (detail) {
    const ex   = exercises.find(e => e.id === detail.exerciseId);
    const cat  = categories.find(c => c.exercises.some(e => e.id === detail.exerciseId));
    const C    = ex?.color || "#FF4D4D";
    const best = detail.sets?.length > 0 ? Math.max(...detail.sets) : 0;
    const isLibre = detail.mode === "libre";
    const fmtElapsed = s => { const m = String(Math.floor((s||0)/60)).padStart(2,"0"); const sec = String((s||0)%60).padStart(2,"0"); return `${m}:${sec}`; };

    // ¿Es récord personal para este ejercicio?
    const allForEx = history.filter(s => s.exerciseId === detail.exerciseId);
    const isPB = detail.totalReps === Math.max(...allForEx.map(s => s.totalReps));

    return (
      <div style={{ width:"100%", maxWidth:"420px", zIndex:1 }}>
        <button onClick={() => setDetail(null)} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", marginBottom:"24px", padding:0 }}>← HISTORIAL</button>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"20px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"6px" }}>
            {cat?.name?.toUpperCase()} · {formatDate(detail.date)} · {formatTime(detail.date)}
          </div>
          <div style={{ fontSize:"38px", marginBottom:"4px" }}>{ex?.icon}</div>
          <div style={{ fontSize:"30px", color:C, letterSpacing:"3px" }}>{ex?.name?.toUpperCase()}</div>
          <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginTop:"8px" }}>
            <span style={{ fontFamily:"sans-serif", fontSize:"10px", letterSpacing:"2px", color:"#555", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"20px", padding:"3px 10px" }}>
              {isLibre ? "⏱ LIBRE" : "📋 SERIES"}
            </span>
            {isPB && (
              <span style={{ fontFamily:"sans-serif", fontSize:"10px", letterSpacing:"2px", color:C, background:`${C}18`, border:`1px solid ${C}44`, borderRadius:"20px", padding:"3px 10px" }}>
                🏆 RÉCORD PERSONAL
              </span>
            )}
          </div>
        </div>

        {/* Total reps */}
        <div style={{ textAlign:"center", background:`${C}0d`, border:`1px solid ${C}33`, borderRadius:"16px", padding:"20px", marginBottom:"14px" }}>
          <div style={{ fontSize:"72px", lineHeight:1, color:C, textShadow:`0 0 40px ${C}66` }}>{detail.totalReps}</div>
          <div style={{ fontSize:"12px", letterSpacing:"5px", color:"#555" }}>REPS TOTALES</div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex", gap:"8px", marginBottom:"14px" }}>
          {(isLibre ? [
            { v: fmtElapsed(detail.elapsed), l:"TIEMPO" },
            { v: detail.totalReps, l:"REPS" },
            { v: detail.elapsed > 0 ? (detail.totalReps / (detail.elapsed/60)).toFixed(1) : "—", l:"REPS/MIN" },
          ] : [
            { v: detail.sets.length, l:"SETS" },
            { v: `${detail.duration}m`, l:"DURACIÓN" },
            { v: `${detail.rest}s`, l:"DESCANSO" },
            { v: best, l:"MEJOR SET" },
          ]).map(({ v, l }) => (
            <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:`1px solid ${C}22`, borderRadius:"10px", padding:"10px 6px", textAlign:"center" }}>
              <div style={{ fontSize:"18px", color:C }}>{v}</div>
              <div style={{ fontSize:"8px", letterSpacing:"1px", color:"#555", fontFamily:"sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Desglose por set — solo en modo series */}
        {!isLibre && detail.sets.length > 1 && (
          <div>
            <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"10px" }}>DESGLOSE POR SET</div>
            <div style={{ display:"flex", gap:"8px" }}>
              {detail.sets.map((r, i) => {
                const p = best > 0 ? r / best : 0;
                return (
                  <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:`1px solid ${r===best?C:C+"33"}`, borderRadius:"10px", padding:"10px 6px", textAlign:"center", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${p*100}%`, background:`${C}18` }} />
                    <div style={{ position:"relative" }}>
                      <div style={{ fontSize:"22px", color:r===best?C:C+"aa" }}>{r}</div>
                      <div style={{ fontSize:"8px", color:"#555", fontFamily:"sans-serif" }}>S{i+1}</div>
                      {r===best && detail.sets.filter(x=>x===best).length===1 && <div style={{ fontSize:"9px", color:C }}>★</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── STATS por categoría ───────────────────────────────────────────────────
  const statsByCategory = categories.map(cat => {
    const exStats = cat.exercises.map(ex => {
      const sessions = history.filter(s => s.exerciseId === ex.id);
      const totalReps = sessions.reduce((a, s) => a + s.totalReps, 0);
      const pb = sessions.reduce((best, s) => s.totalReps > (best?.totalReps||0) ? s : best, null);
      return { ...ex, sessions: sessions.length, totalReps, pb };
    }).filter(e => e.sessions > 0);
    const catTotal = exStats.reduce((a, e) => a + e.totalReps, 0);
    return { ...cat, exStats, catTotal };
  }).filter(c => c.exStats.length > 0);

  // ── SESIONES agrupadas por fecha ──────────────────────────────────────────
  const grouped = history.reduce((acc, s) => {
    const label = formatDate(s.date);
    if (!acc[label]) acc[label] = [];
    acc[label].push(s);
    return acc;
  }, {});

  // Récords personales por ejercicio
  const pbMap = {};
  exercises.forEach(ex => {
    const all = history.filter(s => s.exerciseId === ex.id);
    if (all.length > 0) pbMap[ex.id] = Math.max(...all.map(s => s.totalReps));
  });

  return (
    <div style={{ width:"100%", maxWidth:"420px", zIndex:1 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", marginBottom:"24px" }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", padding:0 }}>← VOLVER</button>
        <div style={{ flex:1, textAlign:"center", fontSize:"22px", letterSpacing:"5px" }}>HISTORIAL</div>
        {history.length > 0 && <button onClick={() => setConfirmClear(true)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:"11px", letterSpacing:"2px", fontFamily:"sans-serif", padding:0 }}>borrar</button>}
      </div>

      {/* Confirmar borrar */}
      {confirmClear && (
        <div style={{ background:"rgba(255,77,77,0.08)", border:"1px solid #FF4D4D44", borderRadius:"12px", padding:"16px", marginBottom:"16px", textAlign:"center" }}>
          <div style={{ fontFamily:"sans-serif", fontSize:"13px", color:"#ccc", marginBottom:"12px" }}>¿Borrar todo el historial?</div>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => setConfirmClear(false)} style={{ flex:1, padding:"10px", background:"rgba(255,255,255,0.05)", border:"1px solid #333", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"14px", letterSpacing:"2px", fontFamily:"'Bebas Neue',sans-serif" }}>CANCELAR</button>
            <button onClick={handleClear} style={{ flex:1, padding:"10px", background:"#FF4D4D", border:"none", borderRadius:"8px", color:"#000", cursor:"pointer", fontSize:"14px", letterSpacing:"2px", fontFamily:"'Bebas Neue',sans-serif" }}>BORRAR</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
        {[{id:"cal",label:"📅 CAL"},{id:"all",label:"SESIONES"},{id:"stats",label:"STATS"},{id:"rutina",label:"🗓 RUTINA"}].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedDay(null); }}
            style={{ flex:1, padding:"9px 4px", background:tab===t.id?"rgba(255,255,255,0.08)":"rgba(255,255,255,0.03)", border:`1px solid ${tab===t.id?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.07)"}`, borderRadius:"10px", color:tab===t.id?"#fff":"#555", cursor:"pointer", fontSize:"11px", letterSpacing:"1px", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Estado vacío */}
      {history.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px" }}>
          <div style={{ fontSize:"48px", marginBottom:"12px" }}>📭</div>
          <div style={{ fontSize:"14px", letterSpacing:"4px", color:"#444" }}>SIN SESIONES AÚN</div>
          <div style={{ fontFamily:"sans-serif", fontSize:"12px", color:"#333", marginTop:"8px" }}>Completá una sesión para verla acá</div>
        </div>
      )}

      {/* ── TAB CALENDARIO ── */}
      {tab === "cal" && (() => {
        const { year, month } = calMonth;
        const monthNames = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        const dayNames   = ["L","M","M","J","V","S","D"];
        const firstDay   = new Date(year, month, 1);
        const startDow   = (firstDay.getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dayMap = {};
        history.forEach(s => {
          const d = new Date(s.date);
          if (d.getFullYear() === year && d.getMonth() === month) {
            const key = d.getDate();
            if (!dayMap[key]) dayMap[key] = [];
            dayMap[key].push(s);
          }
        });
        const today = new Date();
        const isToday = d => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const cells = [...Array(startDow).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
        const daySessionsSelected = selectedDay ? (dayMap[selectedDay] || []) : [];
        return (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <button onClick={() => { const d = new Date(year, month-1,1); setCalMonth({year:d.getFullYear(),month:d.getMonth()}); setSelectedDay(null); }}
                style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"18px", padding:"4px 12px", fontFamily:"'Bebas Neue',sans-serif" }}>‹</button>
              <div style={{ fontSize:"18px", letterSpacing:"4px" }}>{monthNames[month].toUpperCase()} {year}</div>
              <button onClick={() => { const d = new Date(year, month+1,1); setCalMonth({year:d.getFullYear(),month:d.getMonth()}); setSelectedDay(null); }}
                style={{ background:"none", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#888", cursor:"pointer", fontSize:"18px", padding:"4px 12px", fontFamily:"'Bebas Neue',sans-serif" }}>›</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"4px", marginBottom:"4px" }}>
              {dayNames.map((d,i) => <div key={i} style={{ textAlign:"center", fontFamily:"sans-serif", fontSize:"10px", color:"#444", padding:"4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap:"4px", marginBottom:"20px" }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const sessions = dayMap[day] || [];
                const hasSessions = sessions.length > 0;
                const isSelected = selectedDay === day;
                const dots = sessions.slice(0,3).map(s => exercises.find(e => e.id === s.exerciseId)?.color || "#FF4D4D");
                // Día de la semana (0=lunes) para mostrar rutina planeada
                const dowCell = (new Date(year, month, day).getDay() + 6) % 7;
                const rutinaDelDia = rutina[dowCell];
                const tieneRutina = rutinaDelDia?.exerciseId && rutinaDelDia?.activo;
                const rutColor = tieneRutina ? (exercises.find(e => e.id === rutinaDelDia.exerciseId)?.color || "#FF4D4D") : null;
                return (
                  <button key={i} onClick={() => setSelectedDay(isSelected ? null : day)}
                    style={{ aspectRatio:"1", borderRadius:"10px", border:`1px solid ${isSelected?"rgba(255,255,255,0.3)":hasSessions?"rgba(255,255,255,0.1)":tieneRutina?`${rutColor}33`:"rgba(255,255,255,0.04)"}`, background:isSelected?"rgba(255,255,255,0.1)":hasSessions?"rgba(255,255,255,0.05)":tieneRutina?`${rutColor}0a`:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"2px", padding:"4px", position:"relative", transition:"all 0.15s" }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"15px", color:isToday(day)?"#FF4D4D":isSelected?"#fff":hasSessions?"#ccc":tieneRutina?rutColor+"aa":"#333", lineHeight:1 }}>{day}</span>
                    {hasSessions && (
                      <div style={{ display:"flex", gap:"2px", justifyContent:"center" }}>
                        {dots.map((c,di) => <div key={di} style={{ width:"4px", height:"4px", borderRadius:"50%", background:c, boxShadow:`0 0 4px ${c}` }} />)}
                      </div>
                    )}
                    {!hasSessions && tieneRutina && (
                      <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:rutColor+"66", border:`1px dashed ${rutColor}` }} />
                    )}
                    {isToday(day) && <div style={{ position:"absolute", top:"3px", right:"4px", width:"4px", height:"4px", borderRadius:"50%", background:"#FF4D4D" }} />}
                  </button>
                );
              })}
            </div>
            {selectedDay && (
              <div>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"10px" }}>
                  {daySessionsSelected.length > 0 ? `${daySessionsSelected.length} SESIÓN${daySessionsSelected.length>1?"ES":""} · DÍA ${selectedDay}` : `SIN SESIONES · DÍA ${selectedDay}`}
                </div>
                {daySessionsSelected.length === 0
                  ? <div style={{ textAlign:"center", padding:"20px", color:"#333", fontFamily:"sans-serif", fontSize:"12px" }}>Día de descanso 💤</div>
                  : <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                      {daySessionsSelected.map((s,i) => {
                        const ex = exercises.find(e => e.id === s.exerciseId);
                        const C  = ex?.color || "#FF4D4D";
                        const isPB = pbMap[s.exerciseId] === s.totalReps;
                        return (
                          <button key={i} onClick={() => setDetail(s)}
                            style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C}33`, borderRadius:"12px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer", color:"#fff", textAlign:"left" }}
                            onMouseEnter={e => e.currentTarget.style.background=`${C}11`}
                            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
                            <span style={{ fontSize:"22px" }}>{ex?.icon}</span>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"2px" }}>
                                <span style={{ fontSize:"15px", letterSpacing:"2px" }}>{ex?.name?.toUpperCase()}</span>
                                {isPB && <span>🏆</span>}
                              </div>
                              <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:"#555" }}>
                                {s.mode==="libre" ? "⏱ libre" : `${s.sets.length} sets · ${s.duration}min`} · {formatTime(s.date)}
                              </div>
                            </div>
                            <div style={{ textAlign:"right" }}>
                              <div style={{ fontSize:"24px", lineHeight:1, color:C }}>{s.totalReps}</div>
                              <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px" }}>REPS</div>
                            </div>
                            <span style={{ fontSize:"14px", color:"#333" }}>›</span>
                          </button>
                        );
                      })}
                    </div>
                }
              </div>
            )}
            {!selectedDay && <div style={{ textAlign:"center", padding:"10px 0", fontFamily:"sans-serif", fontSize:"11px", color:"#333" }}>Tocá un día para ver las sesiones</div>}
          </div>
        );
      })()}

      {/* ── TAB SESIONES ── */}
      {tab === "all" && history.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
          {Object.entries(grouped).map(([dateLabel, sessions]) => (
            <div key={dateLabel}>
              <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"8px" }}>{dateLabel.toUpperCase()}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {sessions.map((s, i) => {
                  const ex  = exercises.find(e => e.id === s.exerciseId);
                  const cat = categories.find(c => c.exercises.some(e => e.id === s.exerciseId));
                  const C   = ex?.color || "#FF4D4D";
                  const isPB = pbMap[s.exerciseId] === s.totalReps;
                  const isLibre = s.mode === "libre";
                  return (
                    <button key={i} onClick={() => setDetail(s)}
                      style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C}33`, borderRadius:"12px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer", color:"#fff", textAlign:"left", transition:"all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background=`${C}11`}
                      onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
                      <span style={{ fontSize:"22px" }}>{ex?.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"3px" }}>
                          <span style={{ fontSize:"15px", letterSpacing:"2px" }}>{ex?.name?.toUpperCase()}</span>
                          {isPB && <span style={{ fontSize:"10px", color:C }}>🏆</span>}
                        </div>
                        <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                          <span style={{ fontFamily:"sans-serif", fontSize:"9px", color:"#444", background:"rgba(255,255,255,0.05)", borderRadius:"10px", padding:"1px 7px" }}>
                            {cat?.name}
                          </span>
                          <span style={{ fontFamily:"sans-serif", fontSize:"9px", color:"#444" }}>
                            {isLibre ? `⏱ libre · ${formatTime(s.date)}` : `${s.sets.length} sets · ${s.duration}min · ${formatTime(s.date)}`}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:"26px", lineHeight:1, color:C }}>{s.totalReps}</div>
                        <div style={{ fontSize:"9px", letterSpacing:"2px", color:"#555" }}>REPS</div>
                      </div>
                      <span style={{ fontSize:"14px", color:"#333" }}>›</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB ESTADÍSTICAS ── */}
      {tab === "stats" && history.length > 0 && (
        <div>
          {/* Totales globales */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
            {[
              { v:history.length, l:"SESIONES" },
              { v:history.reduce((a,s)=>a+s.totalReps,0), l:"REPS TOTALES" },
              { v:Math.max(...history.map(s=>s.totalReps),0), l:"MEJOR SESIÓN" },
            ].map(({ v, l }) => (
              <div key={l} style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"14px 8px", textAlign:"center" }}>
                <div style={{ fontSize:"28px", color:"#FF4D4D" }}>{v}</div>
                <div style={{ fontSize:"8px", letterSpacing:"1px", color:"#555", fontFamily:"sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Por categoría */}
          <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            {statsByCategory.map(cat => (
              <div key={cat.id}>
                {/* Cabecera de categoría */}
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px" }}>
                  <span style={{ fontSize:"16px" }}>{cat.icon}</span>
                  <div style={{ fontSize:"12px", letterSpacing:"4px", color:cat.color }}>{cat.name.toUpperCase()}</div>
                  <div style={{ flex:1, height:"1px", background:`${cat.color}22` }}/>
                  <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#444" }}>{cat.catTotal} reps</div>
                </div>
                {/* Ejercicios de la categoría */}
                <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                  {cat.exStats.map(ex => (
                    <div key={ex.id} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${ex.color}22`, borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"12px" }}>
                      <span style={{ fontSize:"20px" }}>{ex.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"14px", letterSpacing:"2px" }}>{ex.name.toUpperCase()}</div>
                        <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#555", marginTop:"2px" }}>{ex.sessions} sesión{ex.sessions!==1?"es":""}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:"22px", lineHeight:1, color:ex.color }}>{ex.totalReps}</div>
                        <div style={{ fontSize:"8px", letterSpacing:"1px", color:"#555", fontFamily:"sans-serif" }}>REPS</div>
                      </div>
                      {ex.pb && (
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:"16px", color:ex.color }}>🏆</div>
                          <div style={{ fontSize:"8px", color:"#555", fontFamily:"sans-serif" }}>{ex.pb.totalReps}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB RUTINA ── */}
      {tab === "rutina" && (() => {
        const diasNombre = ["LUNES","MARTES","MIÉRCOLES","JUEVES","VIERNES","SÁBADO","DOMINGO"];
        const hoy = (new Date().getDay() + 6) % 7; // 0=lunes

        const pedirPermiso = async () => {
          if (typeof Notification === "undefined") return;
          const p = await Notification.requestPermission();
          setNotifPermiso(p);
        };

        const programarNotificacion = (diaIdx, exId, hora) => {
          if (notifPermiso !== "granted" || !hora || !exId) return;
          const ex = exercises.find(e => e.id === exId);
          if (!ex) return;
          const ahora = new Date();
          const [hh, mm] = hora.split(":").map(Number);
          // Calcular próxima ocurrencia de este día de la semana a esa hora
          const diasHastaProximo = (diaIdx - hoy + 7) % 7 || 0;
          const objetivo = new Date(ahora);
          objetivo.setDate(ahora.getDate() + diasHastaProximo);
          objetivo.setHours(hh, mm, 0, 0);
          if (objetivo <= ahora) objetivo.setDate(objetivo.getDate() + 7);
          const ms = objetivo - ahora;
          setTimeout(() => {
            new Notification("RepCount 💪", {
              body: `Hoy toca: ${ex.icon} ${ex.name}`,
              icon: "/icon.png",
            });
          }, ms);
        };

        const guardarDia = async (diaIdx, campo, valor) => {
          const nueva = { ...rutina, [diaIdx]: { ...(rutina[diaIdx] || { hora:"07:00", activo:true }), [campo]: valor }};
          setRutina(nueva);
          await saveRoutines(nueva);
          // Reprogramar si está activo
          const d = nueva[diaIdx];
          if (d?.activo && d?.exerciseId && d?.hora) programarNotificacion(diaIdx, d.exerciseId, d.hora);
        };

        return (
          <div>
            {/* Banner de notificaciones */}
            {notifPermiso !== "granted" && (
              <div style={{ background:"rgba(255,77,77,0.08)", border:"1px solid #FF4D4D33", borderRadius:"12px", padding:"12px 14px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"18px" }}>🔔</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"11px", letterSpacing:"2px", color:"#FF4D4D" }}>NOTIFICACIONES DESACTIVADAS</div>
                  <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#555", marginTop:"2px" }}>Activá para recibir avisos cuando toca entrenar</div>
                </div>
                <button onClick={pedirPermiso} style={{ padding:"6px 12px", background:"#FF4D4D", border:"none", borderRadius:"8px", color:"#000", cursor:"pointer", fontSize:"11px", letterSpacing:"2px", fontFamily:"'Bebas Neue',sans-serif" }}>ACTIVAR</button>
              </div>
            )}

            {/* Días de la semana */}
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {diasNombre.map((nombre, diaIdx) => {
                const d = rutina[diaIdx] || {};
                const ex = exercises.find(e => e.id === d.exerciseId);
                const esHoy = diaIdx === hoy;
                const abriendo = rutinaPickerDay === diaIdx;
                return (
                  <div key={diaIdx} style={{ background: esHoy ? "rgba(255,77,77,0.06)" : "rgba(255,255,255,0.02)", border:`1px solid ${esHoy?"#FF4D4D33":d.exerciseId?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.05)"}`, borderRadius:"12px", overflow:"hidden" }}>
                    {/* Fila principal */}
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px" }}>
                      {/* Día */}
                      <div style={{ width:"36px", textAlign:"center" }}>
                        <div style={{ fontSize:"11px", letterSpacing:"2px", color: esHoy ? "#FF4D4D" : "#555" }}>{nombre.slice(0,3)}</div>
                        {esHoy && <div style={{ fontSize:"8px", color:"#FF4D4D44", fontFamily:"sans-serif" }}>hoy</div>}
                      </div>
                      {/* Ejercicio seleccionado */}
                      <button onClick={() => setRutinaPickerDay(abriendo ? null : diaIdx)}
                        style={{ flex:1, background:"rgba(255,255,255,0.04)", border:`1px solid ${ex?ex.color+"44":"rgba(255,255,255,0.08)"}`, borderRadius:"8px", padding:"7px 10px", display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", color:"#fff", textAlign:"left", transition:"all 0.15s" }}>
                        {ex ? (
                          <>
                            <span style={{ fontSize:"14px" }}>{ex.icon}</span>
                            <span style={{ fontSize:"11px", letterSpacing:"1px", color:ex.color }}>{ex.name.toUpperCase()}</span>
                          </>
                        ) : (
                          <span style={{ fontSize:"11px", color:"#444", letterSpacing:"1px" }}>— SIN EJERCICIO</span>
                        )}
                        <span style={{ marginLeft:"auto", fontSize:"12px", color:"#444" }}>{abriendo?"▲":"▼"}</span>
                      </button>
                      {/* Hora */}
                      <input type="time" value={d.hora || "07:00"}
                        onChange={e => guardarDia(diaIdx, "hora", e.target.value)}
                        style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"8px", color:"#888", padding:"6px 8px", fontSize:"12px", fontFamily:"sans-serif", outline:"none", width:"76px" }}/>
                      {/* Toggle activo */}
                      <button onClick={() => guardarDia(diaIdx, "activo", !d.activo)}
                        style={{ width:"32px", height:"18px", borderRadius:"9px", background:d.activo&&d.exerciseId?"#FF4D4D":"rgba(255,255,255,0.1)", border:"none", cursor:"pointer", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
                        <div style={{ position:"absolute", top:"2px", left: d.activo&&d.exerciseId?"14px":"2px", width:"14px", height:"14px", borderRadius:"50%", background:"#fff", transition:"left 0.2s" }}/>
                      </button>
                    </div>
                    {/* Picker de ejercicio */}
                    {abriendo && (
                      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", maxHeight:"200px", overflowY:"auto" }}>
                        <button onClick={() => { guardarDia(diaIdx, "exerciseId", null); setRutinaPickerDay(null); }}
                          style={{ width:"100%", padding:"10px 14px", background:"none", border:"none", color:"#444", cursor:"pointer", textAlign:"left", fontSize:"12px", fontFamily:"sans-serif", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                          — Sin ejercicio
                        </button>
                        {categories.map(cat => (
                          <div key={cat.id}>
                            <div style={{ padding:"6px 14px", fontSize:"9px", letterSpacing:"3px", color:cat.color+"88", background:"rgba(255,255,255,0.02)" }}>{cat.name.toUpperCase()}</div>
                            {cat.exercises.map(ex2 => (
                              <button key={ex2.id} onClick={() => { guardarDia(diaIdx, "exerciseId", ex2.id); setRutinaPickerDay(null); }}
                                style={{ width:"100%", padding:"9px 14px 9px 24px", background: d.exerciseId===ex2.id?`${ex2.color}18`:"none", border:"none", color: d.exerciseId===ex2.id?ex2.color:"#888", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", fontFamily:"sans-serif", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                                <span>{ex2.icon}</span>
                                <span>{ex2.name}</span>
                                {d.exerciseId===ex2.id && <span style={{ marginLeft:"auto" }}>✓</span>}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#333", textAlign:"center", marginTop:"14px" }}>
              Las notificaciones solo funcionan con el navegador abierto
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// ─── ROUTINES SCREEN ─────────────────────────────────────────────────────────

function RoutinesScreen({ routines, onBack, onSave, onStart }) {
  const [view, setView]         = useState("list");  // "list" | "build"
  const [editing, setEditing]   = useState(null);    // rutina en edición
  const [name, setName]         = useState("");
  const [exList, setExList]     = useState([]);      // [{ exerciseId, sets, duration }]
  const [restBetween, setRestBetween] = useState(90);
  const [restBetweenSets, setRestBetweenSets] = useState(60);
  const [pickerOpen, setPickerOpen] = useState(false);

  const startNew = () => {
    setName("Mi Rutina");
    setExList([]);
    setRestBetween(90);
    setRestBetweenSets(60);
    setEditing(null);
    setView("build");
  };

  const startEdit = (r) => {
    setName(r.name);
    setExList([...r.exercises]);
    setRestBetween(r.restBetweenExercises || 90);
    setRestBetweenSets(r.restBetweenSets || 60);
    setEditing(r.id);
    setView("build");
  };

  const saveRutina = () => {
    if (exList.length === 0) return;
    const nueva = {
      id: editing || Date.now().toString(),
      name: name || "Rutina",
      exercises: exList,
      restBetweenExercises: restBetween,
      restBetweenSets,
    };
    const updated = editing
      ? routines.map(r => r.id === editing ? nueva : r)
      : [...routines, nueva];
    onSave(updated);
    setView("list");
  };

  const deleteRutina = (id) => {
    onSave(routines.filter(r => r.id !== id));
  };

  const addEx = (ex) => {
    setExList(prev => [...prev, { exerciseId: ex.id, sets: 3, duration: 120 }]);
    setPickerOpen(false);
  };

  const removeEx = (idx) => setExList(prev => prev.filter((_, i) => i !== idx));

  const updateEx = (idx, campo, val) => {
    setExList(prev => prev.map((e, i) => i === idx ? { ...e, [campo]: val } : e));
  };

  const btnStepper = { width:"36px", height:"36px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.04)", color:"#fff", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };

  if (view === "build") return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", fontFamily:"'Bebas Neue','Arial Black',sans-serif", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 20px", position:"relative" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div style={{ display:"flex", alignItems:"center", marginBottom:"24px" }}>
          <button onClick={() => setView("list")} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", padding:0 }}>← VOLVER</button>
          <div style={{ flex:1, textAlign:"center", fontSize:"16px", letterSpacing:"4px" }}>{editing ? "EDITAR" : "NUEVA"} RUTINA</div>
        </div>

        {/* Nombre */}
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la rutina"
          style={{ width:"100%", padding:"12px 16px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"12px", color:"#fff", fontSize:"18px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"2px", outline:"none", boxSizing:"border-box", marginBottom:"20px" }}/>

        {/* Descanso entre ejercicios */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"10px 14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"11px", letterSpacing:"3px", color:"#555" }}>DESCANSO ENTRE EJERCICIOS</div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
            <button onClick={() => setRestBetween(v => Math.max(15, v-15))} style={btnStepper}>−</button>
            <div style={{ fontSize:"18px", color:"#FF4D4D", minWidth:"44px", textAlign:"center" }}>{restBetween}s</div>
            <button onClick={() => setRestBetween(v => v+15)} style={btnStepper}>+</button>
          </div>
        </div>

        {/* Lista de ejercicios */}
        <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"10px" }}>EJERCICIOS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"12px" }}>
          {exList.map((item, idx) => {
            const ex = exercises.find(e => e.id === item.exerciseId);
            const C2 = ex?.color || "#FF4D4D";
            return (
              <div key={idx} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C2}33`, borderRadius:"12px", padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                  <span style={{ fontSize:"20px" }}>{ex?.icon}</span>
                  <div style={{ flex:1, fontSize:"14px", letterSpacing:"2px", color:C2 }}>{ex?.name?.toUpperCase()}</div>
                  <div style={{ fontSize:"11px", color:"#444", fontFamily:"sans-serif" }}>#{idx+1}</div>
                  <button onClick={() => removeEx(idx)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:"16px", padding:0 }}>✕</button>
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <div style={{ flex:1, display:"flex", alignItems:"center", gap:"4px", background:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"4px 8px" }}>
                    <button onClick={() => updateEx(idx,"sets", Math.max(1, item.sets-1))} style={{ ...btnStepper, width:"28px", height:"28px" }}>−</button>
                    <div style={{ flex:1, textAlign:"center", fontSize:"14px", color:C2 }}>{item.sets} sets</div>
                    <button onClick={() => updateEx(idx,"sets", item.sets+1)} style={{ ...btnStepper, width:"28px", height:"28px" }}>+</button>
                  </div>
                  <div style={{ flex:1, display:"flex", alignItems:"center", gap:"4px", background:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"4px 8px" }}>
                    <button onClick={() => updateEx(idx,"duration", Math.max(15, item.duration-15))} style={{ ...btnStepper, width:"28px", height:"28px" }}>−</button>
                    <div style={{ flex:1, textAlign:"center", fontSize:"14px", color:C2 }}>{Math.floor(item.duration/60)}:{String(item.duration%60).padStart(2,"0")}</div>
                    <button onClick={() => updateEx(idx,"duration", item.duration+15)} style={{ ...btnStepper, width:"28px", height:"28px" }}>+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Agregar ejercicio */}
        <button onClick={() => setPickerOpen(v => !v)} style={{ width:"100%", padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px dashed rgba(255,255,255,0.15)", borderRadius:"12px", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"4px" }}>
          + AGREGAR EJERCICIO
        </button>
        {pickerOpen && (
          <div style={{ background:"#0D0D14", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", marginBottom:"12px", maxHeight:"220px", overflowY:"auto" }}>
            {categories.map(cat => (
              <div key={cat.id}>
                <div style={{ padding:"6px 14px", fontSize:"9px", letterSpacing:"3px", color:cat.color+"88", background:"rgba(255,255,255,0.02)" }}>{cat.name.toUpperCase()}</div>
                {cat.exercises.map(ex2 => (
                  <button key={ex2.id} onClick={() => addEx(ex2)}
                    style={{ width:"100%", padding:"9px 14px 9px 24px", background:"none", border:"none", color:"#888", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", fontFamily:"sans-serif", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                    <span>{ex2.icon}</span><span>{ex2.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        <button onClick={saveRutina} disabled={exList.length === 0}
          style={{ width:"100%", padding:"18px", background: exList.length > 0 ? "#FF4D4D" : "rgba(255,255,255,0.05)", border:"none", borderRadius:"14px", fontSize:"20px", letterSpacing:"4px", color: exList.length > 0 ? "#000" : "#333", cursor: exList.length > 0 ? "pointer" : "not-allowed", fontFamily:"'Bebas Neue',sans-serif", marginTop:"8px" }}>
          GUARDAR RUTINA
        </button>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );

  // Vista lista
  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", fontFamily:"'Bebas Neue','Arial Black',sans-serif", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 20px", position:"relative" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div style={{ display:"flex", alignItems:"center", marginBottom:"24px" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", padding:0 }}>← VOLVER</button>
          <div style={{ flex:1, textAlign:"center", fontSize:"22px", letterSpacing:"5px" }}>RUTINAS</div>
          <button onClick={startNew} style={{ background:"none", border:"none", color:"#FF4D4D", cursor:"pointer", fontSize:"13px", letterSpacing:"2px", padding:0 }}>+ NUEVA</button>
        </div>

        {routines.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <div style={{ fontSize:"48px", marginBottom:"12px" }}>💪</div>
            <div style={{ fontSize:"14px", letterSpacing:"4px", color:"#444" }}>SIN RUTINAS AÚN</div>
            <div style={{ fontFamily:"sans-serif", fontSize:"12px", color:"#333", marginTop:"8px" }}>Creá tu primera rutina tocando + NUEVA</div>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {routines.map(r => (
              <div key={r.id} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", marginBottom:"10px" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"18px", letterSpacing:"3px" }}>{r.name.toUpperCase()}</div>
                    <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#555", marginTop:"2px" }}>{r.exercises.length} ejercicios · {r.restBetweenExercises}s entre ejercicios</div>
                  </div>
                  <button onClick={() => startEdit(r)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"13px", letterSpacing:"2px", padding:"4px 8px" }}>EDITAR</button>
                  <button onClick={() => deleteRutina(r.id)} style={{ background:"none", border:"none", color:"#333", cursor:"pointer", fontSize:"16px", padding:"4px" }}>🗑</button>
                </div>
                {/* Preview ejercicios */}
                <div style={{ display:"flex", gap:"4px", flexWrap:"wrap", marginBottom:"12px" }}>
                  {r.exercises.map((item, i) => {
                    const ex = exercises.find(e => e.id === item.exerciseId);
                    return (
                      <div key={i} style={{ background:`${ex?.color||"#FF4D4D"}18`, border:`1px solid ${ex?.color||"#FF4D4D"}33`, borderRadius:"8px", padding:"4px 8px", display:"flex", alignItems:"center", gap:"4px" }}>
                        <span style={{ fontSize:"12px" }}>{ex?.icon}</span>
                        <span style={{ fontSize:"10px", color:ex?.color||"#FF4D4D", letterSpacing:"1px" }}>{item.sets}x</span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => onStart(r)} style={{ width:"100%", padding:"14px", background:"#FF4D4D", border:"none", borderRadius:"10px", fontSize:"16px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", boxShadow:"0 0 16px #FF4D4D44" }}>
                  ▶ INICIAR RUTINA
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────

function RepCountApp() {
  const [screen, setScreen]           = useState("home");
  const [countdownLeft, setCountdownLeft] = useState(5);
  const [mode, setMode]               = useState("series");
  // seriesMode: "time" (duración por set) | "reps" (reps target por set) | "tabata"
  const [seriesMode, setSeriesMode]   = useState("time");
  const [openCat, setOpenCat]         = useState(null);
  const [selected, setSelected]       = useState(null);
  const [duration, setDuration]       = useState(120); // segundos
  const [totalSets, setTotalSets]     = useState(3);
  const [restDuration, setRestDuration] = useState(60);
  const [repGoal, setRepGoal]         = useState(0);
  const [repsPerSet, setRepsPerSet]   = useState(10);   // meta por set en modo reps
  const [workDuration, setWorkDuration] = useState(40); // segundos de trabajo en tabata
  const [currentSet, setCurrentSet]   = useState(1);
  const [reps, setReps]               = useState(0);
  const [setRepsLog, setSetRepsLog]   = useState([]);
  const [activeStep, setActiveStep]   = useState(0);
  const [animating, setAnimating]     = useState(false);
  const [timeLeft, setTimeLeft]       = useState(0);
  const [elapsed, setElapsed]         = useState(0); // cronómetro libre
  const [restLeft, setRestLeft]       = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [sessionSaved, setSessionSaved]  = useState(false);
  const [goalReached, setGoalReached]    = useState(false);
  const [lastSession, setLastSession]    = useState(null);
  const [poseActive, setPoseActive]      = useState(false);
  const [poseReady, setPoseReady]        = useState(true);
  const [holdPhase, setHoldPhase]        = useState(null);
  const holdPhaseRef = useRef(null);

  // Mantener ref sincronizada para uso dentro de setInterval
  useEffect(() => { holdPhaseRef.current = holdPhase; }, [holdPhase]);
  const [facingMode, setFacingMode]      = useState("user");
  const [cameraKey, setCameraKey]        = useState(0);
  // Rutinas de entrenamiento
  const [workoutRoutines, setWorkoutRoutines] = useState([]);
  const [activeRoutine, setActiveRoutine]     = useState(null); // rutina en ejecución
  const [routineExIdx, setRoutineExIdx]       = useState(0);    // índice del ejercicio actual
  const [routineLog, setRoutineLog]           = useState([]);   // reps por ejercicio
  const [editingField, setEditingField]  = useState(null);
  const [editingVal, setEditingVal]      = useState("");
  
  const [currentPR, setCurrentPR]        = useState(0);
  const historicalPRRef                  = useRef(0); // PR real del historial, no cambia durante la sesión
  const prShownRef                       = useRef(false); // evita closure stale
  const [prBroken, setPrBroken]          = useState(false);
  const [prBadgeTimer, setPrBadgeTimer]  = useState(null);
  const timerRef = useRef(null);
  const spinRef  = useRef(null);

  // Sembrar datos de prueba la primera vez
  useEffect(() => {
    seedFakeHistory();
    loadWorkoutRoutines().then(r => setWorkoutRoutines(r));
  }, []);

  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i, angle: (i / 24) * 360,
      distance: 80 + Math.random() * 120,
      color: ["#FF4D4D","#FFD700","#00C9A7","#6C63FF","#FF8C00","#00BFFF"][i % 6],
      size: 4 + Math.random() * 6,
    }))
  );

  const selectExercise = async ex => {
    setSelected(ex); setScreen("setup"); setReps(0); setActiveStep(0); setSetRepsLog([]); setPrBroken(false); prShownRef.current = false;
    // Pre-cargar valores sugeridos para el ejercicio
    const def = exerciseDefaults[ex.id];
    if (def) { setTotalSets(def.sets); setDuration(def.duration); setRestDuration(def.rest); }
    // Cargar PR del ejercicio
    const prs = await loadPRs();
    const pr = prs[ex.id] || 0;
    setCurrentPR(pr);
    historicalPRRef.current = pr;
    // Cargar última sesión del ejercicio seleccionado
    const history = await loadHistory();
    // Si no hay historial, sembrar una sesión de prueba para poder ver cómo se ve
    if (history.length === 0) {
      const fake = {
        id: "demo",
        date: new Date(Date.now() - 86400000).toISOString(), // ayer
        exerciseId: ex.id,
        totalReps: 42,
        sets: [12, 15, 15],
        duration: 5,
        rest: 60,
      };
      await saveSession(fake);
      setLastSession(fake);
    } else {
      const prev = history.find(s => s.exerciseId === ex.id) || null;
      setLastSession(prev);
    }
  };
  const startSession = () => {
    setReps(0); setActiveStep(0); setGoalReached(false); setSessionSaved(false);
    setCountdownLeft(5);
    setScreen("countdown");
  };

  const launchSession = () => {
    setPoseReady(false); // MoveNet todavía no cargó, timer esperará
    setPoseActive(true);
    if (mode === "libre") {
      setElapsed(0); setScreen("libre");
    } else if (seriesMode === "reps") {
      setCurrentSet(1); setSetRepsLog([]); setScreen("counting");
    } else {
      setTimeLeft(duration); setCurrentSet(1); setSetRepsLog([]); setScreen("counting");
    }
    playBeep("go");
  };
  const resetApp = () => {
    clearInterval(timerRef.current); cancelAnimationFrame(spinRef.current);
    setScreen("home"); setSelected(null); setReps(0); setTimeLeft(0); setElapsed(0);
    setSetRepsLog([]); setCurrentSet(1); setShowFireworks(false); setSessionSaved(false); setGoalReached(false); setOpenCat(null); setPoseActive(false); setPoseReady(true); setHoldPhase(null);
    setActiveRoutine(null); setRoutineExIdx(0); setRoutineLog([]);
  };

  // Pre-carga MoveNet durante el countdown — así cuando el usuario activa 🤖 los scripts ya están listos
  useEffect(() => {
    if (screen === "countdown") preloadMoveNetScripts();
  }, [screen]);

  // Cuenta regresiva antes de arrancar (5 seg)
  useEffect(() => {
    if (screen !== "countdown") return;
    if (countdownLeft <= 0) { launchSession(); return; }
    // Pitido en 3, 2, 1 — silbato largo en 0
    if (countdownLeft <= 3) playBeep(countdownLeft === 1 ? "whistle" : "warning");
    const t = setTimeout(() => setCountdownLeft(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [screen, countdownLeft]);

  // Cronómetro libre — cuenta hacia arriba
  // Para ejercicios hold (plancha): solo avanza cuando la pose es correcta
  useEffect(() => {
    if (screen !== "libre") return;
    const isHold = exercises.find(e => e.id === selected?.id)?.holdMode;
    timerRef.current = setInterval(() => {
      if (isHold && poseActive && holdPhaseRef.current !== "up") return; // pausa si pose incorrecta
      setElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, poseActive]);

  useEffect(() => {
    if (screen !== "counting") return;
    if (seriesMode === "reps") return;
    if (poseActive && !poseReady) return;

    const isHold = exercises.find(e => e.id === selected?.id)?.holdMode;

    if (isHold) {
      // ── MODO HOLD (plancha): timer solo avanza cuando la pose es válida ──
      timerRef.current = setInterval(() => {
        if (holdPhaseRef.current !== "up") return;
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setReps(cr => {
              setSetRepsLog(log => {
                const nl = [...log, cr + 1];
                setCurrentSet(cs => {
                  if (cs >= totalSets) { setScreen("finished"); playBeep("victory"); }
                  else { setRestLeft(restDuration); setScreen("rest"); playBeep("ready"); } // doble silbato
                  return cs;
                });
                return nl;
              });
              return cr;
            });
            return 0;
          }
          if (t === 6) playBeep("warning");
          return t - 1;
        });
      }, 1000);
    } else {
      // ── MODO NORMAL: countdown continuo ──
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setReps(cr => {
              setSetRepsLog(log => {
                const nl = [...log, cr];
                setCurrentSet(cs => {
                  if (cs >= totalSets) { setScreen("finished"); playBeep("victory"); }
                  else { setRestLeft(restDuration); setScreen("rest"); playBeep("whistle"); }
                  return cs;
                });
                return nl;
              });
              return cr;
            });
            return 0;
          }
          if (t === 6) playBeep("warning");
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [screen, seriesMode, totalSets, restDuration, duration, poseActive, poseReady]);

  // Timer para descanso entre ejercicios de rutina
  useEffect(() => {
    if (screen !== "routine_rest" || !activeRoutine) return;
    timerRef.current = setInterval(() => {
      setRestLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setReps(0); setActiveStep(0); setSetRepsLog([]); setCurrentSet(1);
          setTimeLeft(activeRoutine.exercises[routineExIdx]?.duration || 120);
          setSessionSaved(false);
          setScreen("counting");
          playBeep("go");
          return 0;
        }
        if (t === 4) playBeep("ready");
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  useEffect(() => {
    if (screen !== "rest") return;
    let readyPlayed = false;
    timerRef.current = setInterval(() => {
      setRestLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setCurrentSet(cs => cs + 1);
          setReps(0); setActiveStep(0); setTimeLeft(duration);
          setCameraKey(k => k + 1); // remount PoseView para limpiar estado del detector
          setPoseReady(false);      // MoveNet necesita reiniciarse, esperar antes de arrancar timer
          setScreen("counting"); playBeep("go");
          return 0;
        }
        // 2 silbatos de aviso 3 segundos antes
        if (t === 4 && !readyPlayed) { readyPlayed = true; playBeep("ready"); }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, duration]);

  useEffect(() => {
    if (screen !== "finished") return;
    setShowFireworks(true);
    const t = setTimeout(() => setShowFireworks(false), 2500);
    return () => { clearTimeout(t); cancelAnimationFrame(spinRef.current); };
  }, [screen]);

  useEffect(() => {
    if (screen !== "finished" || sessionSaved || !selected) return;
    setSessionSaved(true);
    if (mode === "libre") {
      const session = { id:Date.now().toString(), date:new Date().toISOString(), exerciseId:selected.id, totalReps:reps, sets:[reps], duration: Math.ceil(elapsed/60), rest:0, mode:"libre", elapsed };
      saveSession(session);
      setLastSession(session);
      if (reps > currentPR) savePR(selected.id, reps);
    } else {
      setSetRepsLog(log => {
        const total = log.reduce((a, b) => a + b, 0);
        const session = { id:Date.now().toString(), date:new Date().toISOString(), exerciseId:selected.id, totalReps:total, sets:log, duration, rest:restDuration, mode:"series" };
        saveSession(session);
        setLastSession(session);
        if (total > currentPR) savePR(selected.id, total);
        // Si hay rutina activa, registrar el ejercicio y pasar al siguiente
        if (activeRoutine) {
          setRoutineLog(prev => {
            const newLog = [...prev, { exerciseId: selected.id, totalReps: total }];
            const nextIdx = routineExIdx + 1;
            if (nextIdx < activeRoutine.exercises.length) {
              // Hay más ejercicios — descanso entre ejercicios y después el siguiente
              const nextEx = exercises.find(e => e.id === activeRoutine.exercises[nextIdx].exerciseId);
              setTimeout(() => {
                setRoutineExIdx(nextIdx);
                selectExercise(nextEx).then(() => {
                  setDuration(activeRoutine.exercises[nextIdx].duration || 120);
                  setTotalSets(activeRoutine.exercises[nextIdx].sets || 3);
                  setRestDuration(activeRoutine.restBetweenSets || 60);
                  setRestLeft(activeRoutine.restBetweenExercises || 90);
                  setSessionSaved(false);
                  setScreen("routine_rest");
                });
              }, 100);
            } else {
              // Rutina completa
              setTimeout(() => {
                setScreen("routine_finished");
              }, 100);
            }
            return newLog;
          });
        }
        return log;
      });
    }
  }, [screen]);

  // Terminar sesión libre manualmente
  const finishLibre = () => {
    clearInterval(timerRef.current);
    setScreen("finished");
    playBeep("victory");
  };

  const simulateRep = () => {
    if (animating) return;
    setAnimating(true);
    const steps = exerciseSteps[selected.id];
    let step = 0;
    const iv = setInterval(() => {
      step++; setActiveStep(step % steps.length);
      if (step >= steps.length) {
        clearInterval(iv);
        setReps(r => {
          const newReps = r + 1;
          if (repGoal > 0 && newReps === repGoal && !goalReached) {
            setGoalReached(true);
            playBeep("goal");
          }
          // Chequear PR — ref evita stale closure, badge aparece solo una vez por sesión
          if (historicalPRRef.current > 0 && newReps > historicalPRRef.current && !prShownRef.current) {
            prShownRef.current = true;
            setPrBroken(true);
            if (prBadgeTimer) clearTimeout(prBadgeTimer);
            const t = setTimeout(() => setPrBroken(false), 3000);
            setPrBadgeTimer(t);
          }
          // Modo reps: completar set automáticamente al llegar al target
          if (seriesMode === "reps" && newReps >= repsPerSet) {
            setTimeout(() => {
              setSetRepsLog(log => {
                const nl = [...log, newReps];
                setCurrentSet(cs => {
                  if (cs >= totalSets) { setScreen("finished"); playBeep("victory"); }
                  else { setRestLeft(restDuration); setScreen("rest"); playBeep("whistle"); }
                  return cs;
                });
                return nl;
              });
              setReps(0); setActiveStep(0);
            }, 400);
          }
          return newReps;
        });
        setActiveStep(0); setAnimating(false);
      }
    }, 300);
  };

  

  const fmt = s => {
    const h = Math.floor(s / 3600);
    const m = String(Math.floor((s % 3600) / 60)).padStart(2,"0");
    const sec = String(s % 60).padStart(2,"0");
    return h > 0 ? `${h}:${m}:${sec}` : `${m}:${sec}`;
  };
  const pct = screen==="counting"
    ? seriesMode === "reps" ? (reps / repsPerSet) * 100
    : ((duration - timeLeft) / duration) * 100
    : screen==="rest" ? ((restDuration - restLeft) / restDuration) * 100
    : 100;
  const grandTotal = setRepsLog.reduce((a,b) => a+b, 0);
  const C = selected?.color || "#FF4D4D";

  if (screen === "history") {
    return (
      <div style={{ minHeight:"100vh", background:"#0A0A0F", fontFamily:"'Bebas Neue','Arial Black',sans-serif", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", padding:"40px 20px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-100px", left:"50%", transform:"translateX(-50%)", width:"600px", height:"600px", background:"radial-gradient(circle, #FF4D4D22 0%, transparent 70%)", pointerEvents:"none" }} />
        <HistoryScreen onBack={() => setScreen("home")} />
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  if (screen === "routines") {
    return (
      <RoutinesScreen
        routines={workoutRoutines}
        onBack={() => setScreen("home")}
        onSave={async (r) => { await saveWorkoutRoutines(r); setWorkoutRoutines(r); }}
        onStart={(routine) => {
          const firstEx = exercises.find(e => e.id === routine.exercises[0].exerciseId);
          if (!firstEx) return;
          setActiveRoutine(routine);
          setRoutineExIdx(0);
          setRoutineLog([]);
          setDuration(routine.exercises[0].duration || 120);
          setTotalSets(routine.exercises[0].sets || 3);
          setRestDuration(routine.restBetweenSets || 60);
          setMode("series");
          setSeriesMode("time");
          selectExercise(firstEx).then(() => startSession());
          setScreen("home"); // se redirige solo al countdown
        }}
      />
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0A0F", fontFamily:"'Bebas Neue','Arial Black',sans-serif", color:"#fff", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"-100px", left:"50%", transform:"translateX(-50%)", width:"600px", height:"600px", background:`radial-gradient(circle, ${C}22 0%, transparent 70%)`, pointerEvents:"none", transition:"background 0.5s ease" }} />

      {/* TODO: mensajes motivacionales — pendiente de rediseño */}

      {/* ── HOME ── */}
      {screen === "home" && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px" }}>
            <div style={{ fontSize:"32px", letterSpacing:"6px", textShadow:"0 0 30px #FF4D4D66" }}>REP<span style={{ color:"#FF4D4D", textShadow:"0 0 20px #FF4D4D" }}>COUNT</span></div>
            <div style={{ fontSize:"9px", letterSpacing:"2px", color:"#FF4D4D", background:"rgba(255,77,77,0.12)", border:"1px solid rgba(255,77,77,0.3)", borderRadius:"20px", padding:"4px 10px", boxShadow:"0 0 10px rgba(255,77,77,0.15)" }}>AI POWERED</div>
          </div>

          {/* SELECTOR DE MODO */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
            {[
              { id:"series", label:"📋 SERIES",   desc:"Sets + descanso + tiempo" },
              { id:"libre",  label:"⏱ LIBRE",     desc:"Cronómetro libre, vos manejás" },
            ].map(m => {
              const active = mode === m.id;
              return (
                <button key={m.id} onClick={() => setMode(m.id)} style={{ flex:1, padding:"12px 10px", background:active?"#FF4D4D":"rgba(255,255,255,0.03)", border:`1px solid ${active?"#FF4D4D":"rgba(255,255,255,0.07)"}`, borderRadius:"12px", cursor:"pointer", transition:"all 0.2s", textAlign:"center", boxShadow:active?"0 0 16px #FF4D4D55":"none" }}>
                  <div style={{ fontSize:"14px", letterSpacing:"2px", color:active?"#000":"#555", fontFamily:"'Bebas Neue',sans-serif" }}>{m.label}</div>
                  <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:active?"#00000077":"#333", marginTop:"3px", letterSpacing:"0.5px" }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
          <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
            <button onClick={() => setScreen("history")} style={{ flex:1, padding:"10px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", color:"#fff", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <span style={{ fontSize:"14px" }}>📋</span>
              <div style={{ fontSize:"12px", letterSpacing:"3px", color:"#666" }}>HISTORIAL</div>
              <span style={{ fontSize:"12px", color:"#333", marginLeft:"auto" }}>›</span>
            </button>
            <button onClick={() => setScreen("routines")} style={{ flex:1, padding:"10px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", display:"flex", alignItems:"center", gap:"8px", cursor:"pointer", color:"#fff", transition:"all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
              <span style={{ fontSize:"14px" }}>💪</span>
              <div style={{ fontSize:"12px", letterSpacing:"3px", color:"#666" }}>RUTINAS</div>
              <span style={{ fontSize:"12px", color:"#333", marginLeft:"auto" }}>›</span>
            </button>
          </div>

          <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444", marginBottom:"12px" }}>EJERCICIOS</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {categories.map(cat => (
              <div key={cat.id}>
                {/* Cabecera de categoría */}
                <button
                  onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
                  style={{ width:"100%", background: openCat===cat.id ? `${cat.color}18` : "rgba(255,255,255,0.04)", border:`1px solid ${cat.color}${openCat===cat.id?"88":"33"}`, borderRadius: openCat===cat.id ? "14px 14px 0 0" : "14px", padding:"14px 18px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer", color:"#fff", transition:"all 0.2s" }}>
                  <span style={{ fontSize:"24px" }}>{cat.icon}</span>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <div style={{ fontSize:"20px", letterSpacing:"3px", color: openCat===cat.id ? cat.color : "#fff" }}>{cat.name.toUpperCase()}</div>
                    <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#555", marginTop:"2px" }}>{cat.exercises.length} ejercicios</div>
                  </div>
                  <span style={{ fontSize:"16px", color: openCat===cat.id ? cat.color : "#444", transition:"transform 0.2s", display:"inline-block", transform: openCat===cat.id ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
                </button>

                {/* Ejercicios de la categoría */}
                {openCat === cat.id && (
                  <div style={{ border:`1px solid ${cat.color}33`, borderTop:"none", borderRadius:"0 0 14px 14px", overflow:"hidden" }}>
                    {cat.exercises.map((ex, i) => (
                      <button
                        key={ex.id}
                        onClick={() => selectExercise(ex)}
                        style={{ width:"100%", background:"rgba(255,255,255,0.02)", borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none", border:"none", padding:"12px 18px 12px 28px", display:"flex", alignItems:"center", gap:"12px", cursor:"pointer", color:"#fff", transition:"all 0.15s", textAlign:"left" }}
                        onMouseEnter={e => e.currentTarget.style.background=`${ex.color}18`}
                        onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
                      >
                        <span style={{ fontSize:"20px" }}>{ex.icon}</span>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:"16px", letterSpacing:"2px", color:"#ddd" }}>{ex.name.toUpperCase()}</div>
                          <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#555", marginTop:"2px" }}>{ex.desc}</div>
                        </div>
                        <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:ex.color, boxShadow:`0 0 6px ${ex.color}`, flexShrink:0 }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SETUP ── */}
      {screen === "setup" && selected && (() => {
        return (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
            <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:"#666", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", padding:0 }}>← VOLVER</button>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ fontSize:"22px" }}>{selected.icon}</span>
              <span style={{ fontSize:"20px", color:C, letterSpacing:"2px" }}>{selected.name.toUpperCase()}</span>
            </div>
            <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:"#444", letterSpacing:"2px" }}>{mode === "libre" ? "LIBRE" : "SERIES"}</div>
          </div>

          {/* ÚLTIMA SESIÓN — línea compacta */}
          {lastSession && lastSession.exerciseId === selected.id && (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", padding:"8px 12px", background:"rgba(255,255,255,0.03)", border:`1px solid ${C}22`, borderRadius:"10px" }}>
              <div style={{ fontFamily:"sans-serif", fontSize:"11px", color:"#555" }}>
                Última vez: <span style={{ color:"#888" }}>{lastSession.sets.length} sets · {lastSession.totalReps} reps</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ fontFamily:"sans-serif", fontSize:"10px", color:"#444" }}>
                  {new Date(lastSession.date).toLocaleDateString("es-AR", { day:"numeric", month:"short" })}
                </div>
                <button onClick={() => { setDuration(lastSession.duration); setTotalSets(lastSession.sets.length); setRestDuration(lastSession.rest); }}
                  style={{ padding:"4px 10px", background:"transparent", border:`1px solid ${C}44`, borderRadius:"6px", color:C, cursor:"pointer", fontSize:"10px", letterSpacing:"2px", fontFamily:"'Bebas Neue',sans-serif" }}>
                  ↩ USAR
                </button>
              </div>
            </div>
          )}
          {/* SELECTOR DE SUB-MODO (solo en series) */}
          {mode === "series" && (() => {
            const modos = [
              { id:"time",   label:"TIEMPO",  icon:"⏱", desc:"Duración fija por set" },
              { id:"reps",   label:"REPS",    icon:"🔢", desc:"Meta de reps por set" },
            ];
            return (
              <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
                {modos.map(m => {
                  const active = seriesMode === m.id;
                  return (
                    <button key={m.id} onClick={() => setSeriesMode(m.id)} style={{ flex:1, padding:"10px 6px", background:active?C:"rgba(255,255,255,0.04)", border:`1px solid ${active?C:"rgba(255,255,255,0.07)"}`, borderRadius:"10px", cursor:"pointer", textAlign:"center", transition:"all 0.2s", boxShadow:active?`0 0 14px ${C}44`:"none" }}>
                      <div style={{ fontSize:"16px", marginBottom:"3px" }}>{m.icon}</div>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"13px", letterSpacing:"2px", color:active?"#000":C+"77" }}>{m.label}</div>
                      <div style={{ fontFamily:"sans-serif", fontSize:"8px", color:active?"#00000088":"#444", marginTop:"2px", lineHeight:1.3 }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {/* CONFIGURACIÓN DINÁMICA */}
          {mode === "series" && (() => {
            const toMmSs = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

            const btnStyle = { width:"48px", height:"48px", borderRadius:"10px", border:`1px solid ${C}44`, background:"rgba(255,255,255,0.04)", color:C, fontSize:"22px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:"sans-serif", lineHeight:1, transition:"all 0.15s" };
            const valStyle = { flex:1, textAlign:"center", fontSize:"32px", color:C, fontFamily:"'DSEG7 Classic',monospace", letterSpacing:"2px", textShadow:`0 0 8px ${C}44` };

            // Control de tiempo: pasos de 15s con botones +/-
            const timeRow = (label, val, setFn, step=15) => (
              <div key={label} style={{ marginBottom:"14px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"4px", color:"#555", marginBottom:"8px" }}>{label}</div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.03)", border:`1px solid ${C}22`, borderRadius:"12px", padding:"8px" }}>
                  <button onClick={() => setFn(v => Math.max(step, v - step))} style={btnStyle}>−</button>
                  <div style={valStyle}>{toMmSs(val)}</div>
                  <button onClick={() => setFn(v => v + step)} style={btnStyle}>+</button>
                </div>
              </div>
            );

            // Control numérico: sets, reps, rondas
            const numRow = (label, val, setFn, unit, step=1, min=1) => (
              <div key={label} style={{ marginBottom:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <div style={{ fontSize:"10px", letterSpacing:"4px", color:"#555" }}>{label}</div>
                  <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:"#444" }}>{unit}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"rgba(255,255,255,0.03)", border:`1px solid ${C}22`, borderRadius:"12px", padding:"8px" }}>
                  <button onClick={() => setFn(v => Math.max(min, v - step))} style={btnStyle}>−</button>
                  <div style={valStyle}>{String(val).padStart(2,"0")}</div>
                  <button onClick={() => setFn(v => v + step)} style={btnStyle}>+</button>
                </div>
              </div>
            );

            if (seriesMode === "time") return (<>
              {timeRow("DURACIÓN", duration, setDuration, 15)}
              {numRow("SERIES", totalSets, setTotalSets, "sets")}
              {timeRow("DESCANSO", restDuration, setRestDuration, 15)}
            </>);
            if (seriesMode === "reps") return (<>
              {numRow("REPS POR SET", repsPerSet, setRepsPerSet, "reps")}
              {numRow("SERIES", totalSets, setTotalSets, "sets")}
              {timeRow("DESCANSO", restDuration, setRestDuration, 15)}
            </>);
          })()}

          {/* META DE REPS — fila compacta */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px", padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:`1px solid ${repGoal > 0 ? C+"44" : "rgba(255,255,255,0.07)"}`, borderRadius:"12px", transition:"border 0.2s" }}>
            <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#555", whiteSpace:"nowrap", fontFamily:"'Bebas Neue',sans-serif" }}>META</div>
            <input
              type="number" min="1" max="9999" placeholder="— sin meta"
              value={repGoal === 0 ? "" : repGoal}
              onChange={e => { const v = parseInt(e.target.value); setRepGoal(isNaN(v) || v < 1 ? 0 : v); }}
              style={{ flex:1, background:"none", border:"none", outline:"none", color: repGoal > 0 ? C : "#444", fontSize:"22px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"2px", textAlign:"right", MozAppearance:"textfield" }}
            />
            {repGoal > 0 && (
              <button onClick={() => setRepGoal(0)} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:"16px", lineHeight:1, padding:0, flexShrink:0 }}>✕</button>
            )}
            {repGoal > 0 && <div style={{ fontSize:"10px", color:"#555", letterSpacing:"1px", fontFamily:"sans-serif", flexShrink:0 }}>reps</div>}
          </div>
          <style>{`input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}`}</style>

          {mode === "series" && (() => {
            let secs = 0;
            if (seriesMode === "time") secs = totalSets * duration + (totalSets - 1) * restDuration;
            if (seriesMode === "reps") secs = (totalSets - 1) * restDuration;
            const mm = String(Math.floor(secs / 60)).padStart(2,"0");
            const ss = String(secs % 60).padStart(2,"0");
            return (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#555" }}>TOTAL ESTIMADO</div>
                <div style={{ fontSize:"26px", color:"#fff", fontFamily:"'DSEG7 Classic',monospace", letterSpacing:"3px" }}>{mm}:{ss}</div>
              </div>
            );
          })()}
          <button onClick={startSession} style={{ width:"100%", padding:"20px", background:C, border:"none", borderRadius:"16px", fontSize:"22px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>INICIAR SESIÓN</button>
        </div>
        );
      })()}

      {/* ── COUNTDOWN ── */}
      {screen === "countdown" && selected && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", gap:"24px" }}>
          <div style={{ fontSize:"13px", letterSpacing:"6px", color:"#555", textTransform:"uppercase" }}>{selected.name}</div>
          <div style={{ fontSize:"14px", letterSpacing:"4px", color:"#444" }}>PREPARATE</div>
          {/* Número grande */}
          <div style={{ position:"relative", width:"200px", height:"200px", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {/* Ring */}
            <svg width="200" height="200" style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
              <circle cx="100" cy="100" r="88" fill="none" stroke={C} strokeWidth="10"
                strokeDasharray={`${2*Math.PI*88}`}
                strokeDashoffset={`${2*Math.PI*88 * (countdownLeft / 5)}`}
                strokeLinecap="round"
                style={{ transition:"stroke-dashoffset 0.9s linear" }}/>
            </svg>
            <div style={{ fontSize:"96px", color:C, fontFamily:"'DSEG7 Classic',monospace", textShadow:`0 0 30px ${C}88`, lineHeight:1 }}>
              {countdownLeft}
            </div>
          </div>
          <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#444" }}>
            {countdownLeft > 1 ? "SEG PARA ARRANCAR" : "¡YA!"}
          </div>
          {/* Botón para saltar la cuenta */}
          <button onClick={launchSession}
            style={{ marginTop:"8px", padding:"12px 32px", background:"transparent", border:`1px solid ${C}44`, borderRadius:"12px", color:"#555", fontSize:"12px", letterSpacing:"3px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>
            SALTAR
          </button>
        </div>
      )}

      {/* ── COUNTING ── */}
      {screen === "counting" && selected && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center" }}>

          {/* PR BADGE */}
          {prBroken && (
            <div style={{ position:"fixed", top:"20px", left:"50%", transform:"translateX(-50%)", zIndex:999, background:"linear-gradient(135deg, #FFD700, #FF8C00)", borderRadius:"30px", padding:"8px 20px", display:"flex", alignItems:"center", gap:"8px", boxShadow:"0 0 30px #FFD70088", animation:"prPop 0.4s ease-out" }}>
              <span style={{ fontSize:"18px" }}>🏆</span>
              <span style={{ fontSize:"14px", letterSpacing:"3px", color:"#000", fontFamily:"'Bebas Neue',sans-serif" }}>NUEVO RECORD · {reps} REPS</span>
            </div>
          )}

          {/* Header: set progress */}
          <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"6px" }}>
            {Array.from({ length:totalSets }, (_,i) => (
              <div key={i} style={{ flex:1, maxWidth:i===currentSet-1?"28px":"12px", height:"5px", borderRadius:"3px", background:i<currentSet-1?C+"88":i===currentSet-1?C:"rgba(255,255,255,0.1)", boxShadow:i===currentSet-1?`0 0 8px ${C}`:"none", transition:"all 0.3s" }} />
            ))}
          </div>
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:C+"99", marginBottom:"16px" }}>
            {`SET ${currentSet} / ${totalSets}`}
          </div>

          {/* CRONÓMETRO — barra fina con tiempo, solo en modos con tiempo */}
          {seriesMode !== "reps" && (() => {
            const isHold = exercises.find(e => e.id === selected.id)?.holdMode;
            const holdPaused = isHold && poseActive && holdPhase !== "up";
            const timerColor = holdPaused ? "#FF4D4D" : timeLeft <= 10 ? "#FF4D4D" : C;
            const timerLabel = isHold ? (holdPaused ? "⏸ MANTENÉ LA POSICIÓN" : "▶ CONTANDO") : "TIEMPO";
            return (
              <div style={{ marginBottom:"12px", padding:"0 8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
                  <div style={{ fontSize:"9px", letterSpacing:"3px", color: holdPaused ? "#FF4D4D" : "#444",
                    animation: holdPaused ? "pulse 0.8s ease-in-out infinite" : "none" }}>{timerLabel}</div>
                  <div style={{ fontSize:"20px", letterSpacing:"2px", color: timerColor,
                    fontVariantNumeric:"tabular-nums", transition:"color 0.3s",
                    textShadow: holdPaused ? "0 0 12px #FF4D4D" : timeLeft<=10 ? "0 0 12px #FF4D4D" : "none",
                    animation: holdPaused ? "pulse 0.8s ease-in-out infinite" : "none" }}>{fmt(timeLeft)}</div>
                </div>
                <div style={{ height:"4px", borderRadius:"2px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:"2px", width:`${pct}%`,
                    background: holdPaused ? "#FF4D4D" : timeLeft<=10 ? "#FF4D4D" : C,
                    transition:"width 1s linear",
                    boxShadow:`0 0 8px ${holdPaused ? "#FF4D4D" : timeLeft<=10 ? "#FF4D4D" : C}` }}/>
                </div>
              </div>
            );
          })()}

          {/* BIG COUNTER — protagonista total */}
          <div style={{ position:"relative", width:"240px", height:"240px", margin:"0 auto 16px" }}>
            {/* Ring solo en modo reps */}
            {seriesMode === "reps" && (
              <svg width="240" height="240" style={{ transform:"rotate(-90deg)", position:"absolute", top:0, left:0 }}>
                <circle cx="120" cy="120" r="108" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/>
                <circle cx="120" cy="120" r="108" fill="none" stroke={C} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*108}`} strokeDashoffset={`${2*Math.PI*108*(1-pct/100)}`}
                  style={{ transition:"stroke-dashoffset 0.3s ease", filter:`drop-shadow(0 0 10px ${C})` }}/>
              </svg>
            )}
            {/* Glow de fondo */}
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"180px", height:"180px", borderRadius:"50%", background:`radial-gradient(circle, ${goalReached?"#FFD700":C}18 0%, transparent 70%)`, transition:"background 0.3s" }}/>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", width:"200px" }}>
              <div style={{ fontSize:"112px", lineHeight:0.9, color:goalReached?"#FFD700":C, textShadow:`0 0 60px ${goalReached?"#FFD700":C}99`, transition:"color 0.3s, text-shadow 0.3s", fontVariantNumeric:"tabular-nums" }}>{reps}</div>
              <div style={{ fontSize:"11px", letterSpacing:"6px", color:"#333", marginTop:"8px" }}>
                {seriesMode === "reps" ? `/ ${repsPerSet} REPS` : "REPS"}
              </div>
            </div>
          </div>

          {/* Historial de sets anteriores */}
          {setRepsLog.length > 0 && (
            <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"14px" }}>
              {setRepsLog.map((r, i) => (
                <div key={i} style={{ padding:"5px 10px", borderRadius:"8px", background:`${C}15`, border:`1px solid ${C}33`, textAlign:"center" }}>
                  <div style={{ fontSize:"16px", color:C, lineHeight:1 }}>{r}</div>
                  <div style={{ fontSize:"8px", color:"#444", fontFamily:"sans-serif", marginTop:"1px" }}>S{i+1}</div>
                </div>
              ))}
            </div>
          )}

          {/* Meta progress */}
          {repGoal > 0 && seriesMode !== "reps" && (
            <div style={{ padding:"0 32px", marginBottom:"14px" }}>
              <div style={{ height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:"2px", width:`${Math.min((reps/repGoal)*100,100)}%`, background:goalReached?"#FFD700":C, transition:"width 0.3s ease" }}/>
              </div>
              <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:goalReached?"#FFD700":"#555", marginTop:"3px" }}>
                {goalReached ? "🏆 ¡META!" : `${reps} / ${repGoal}`}
              </div>
            </div>
          )}

          {/* Pasos del movimiento */}
          {(() => { const steps = exerciseSteps[selected.id] || []; return steps.length > 0 && (
            <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"16px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ padding:"4px 10px", borderRadius:"20px", background:i===activeStep?`${C}22`:"rgba(255,255,255,0.03)", border:`1px solid ${i===activeStep?C+"66":"rgba(255,255,255,0.06)"}`, transition:"all 0.2s" }}>
                  <div style={{ fontSize:"9px", letterSpacing:"1px", color:i===activeStep?C:"#444", fontFamily:"sans-serif" }}>{s}</div>
                </div>
              ))}
            </div>
          ); })()}

          {/* POSE VIEW */}
          {poseActive && (
            <div style={{ marginBottom:"14px" }}>
              <PoseView key={cameraKey} color={C} exerciseId={selected.id} onRep={simulateRep} active={poseActive} facingMode={facingMode}
                onFlipCamera={() => { setFacingMode(m => m === "user" ? "environment" : "user"); setCameraKey(k => k+1); }}
                onReady={() => setPoseReady(true)}
                onPhaseChange={p => setHoldPhase(p)} />
            </div>
          )}

          {/* MANUAL + POSE TOGGLE + ABANDONAR */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
            <button onClick={simulateRep} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:`1px solid ${C}33`, borderRadius:"12px", fontSize:"15px", letterSpacing:"3px", color:C+"99", cursor:animating?"not-allowed":"pointer", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.2s" }}>
              {animating ? "..." : "+ MANUAL"}
            </button>
            <button onClick={() => setPoseActive(v => !v)} style={{ padding:"12px 14px", background:poseActive?`${C}22`:"rgba(255,255,255,0.04)", border:`1px solid ${poseActive?C:"rgba(255,255,255,0.1)"}`, borderRadius:"12px", color:poseActive?C:"#555", cursor:"pointer", fontSize:"18px", transition:"all 0.2s" }} title="IA Pose Detection">
              🤖
            </button>
          </div>
          <button onClick={resetApp} style={{ width:"100%", padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#444", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.2s" }}>ABANDONAR</button>
        </div>
      )}

      {/* ── LIBRE ── */}
      {screen === "libre" && selected && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center" }}>

          {/* PR BADGE */}
          {prBroken && (
            <div style={{ position:"fixed", top:"20px", left:"50%", transform:"translateX(-50%)", zIndex:999, background:"linear-gradient(135deg, #FFD700, #FF8C00)", borderRadius:"30px", padding:"8px 20px", display:"flex", alignItems:"center", gap:"8px", boxShadow:"0 0 30px #FFD70088", animation:"prPop 0.4s ease-out" }}>
              <span style={{ fontSize:"18px" }}>🏆</span>
              <span style={{ fontSize:"14px", letterSpacing:"3px", color:"#000", fontFamily:"'Bebas Neue',sans-serif" }}>NUEVO RECORD · {reps} REPS</span>
            </div>
          )}

          <div style={{ fontSize:"9px", letterSpacing:"6px", color:"#555", marginBottom:"16px" }}>⏱ MODO LIBRE</div>

          {/* CRONÓMETRO LIBRE — barra fina con elapsed */}
          {(() => {
            const isHold = exercises.find(e => e.id === selected.id)?.holdMode;
            const holdPaused = isHold && poseActive && holdPhase !== "up";
            const timerColor = holdPaused ? "#FF4D4D" : C;
            const timerLabel = isHold ? (holdPaused ? "⏸ MANTENÉ LA POSICIÓN" : "▶ CONTANDO") : "TIEMPO";
            return (
              <div style={{ marginBottom:"12px", padding:"0 8px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
                  <div style={{ fontSize:"9px", letterSpacing:"3px", color: holdPaused ? "#FF4D4D" : "#444",
                    animation: holdPaused ? "pulse 0.8s ease-in-out infinite" : "none" }}>{timerLabel}</div>
                  <div style={{ fontSize:"20px", letterSpacing:"2px", color: timerColor, fontVariantNumeric:"tabular-nums",
                    textShadow: holdPaused ? "0 0 12px #FF4D4D" : "none",
                    animation: holdPaused ? "pulse 0.8s ease-in-out infinite" : "none" }}>{fmt(elapsed)}</div>
                </div>
                <div style={{ height:"4px", borderRadius:"2px", background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:"2px",
                    width:`${((elapsed % 180) / 180) * 100}%`,
                    background: holdPaused ? "#FF4D4D" : goalReached ? "#FFD700" : C,
                    transition:"width 1s linear",
                    boxShadow:`0 0 8px ${holdPaused ? "#FF4D4D" : goalReached ? "#FFD700" : C}` }}/>
                </div>
              </div>
            );
          })()}

          {/* BIG COUNTER — protagonista total */}
          <div style={{ position:"relative", width:"240px", height:"240px", margin:"0 auto 20px" }}>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"180px", height:"180px", borderRadius:"50%", background:`radial-gradient(circle, ${goalReached?"#FFD700":C}18 0%, transparent 70%)`, transition:"background 0.3s" }}/>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", width:"200px" }}>
              <div style={{ fontSize:"112px", lineHeight:0.9, color:goalReached?"#FFD700":C, textShadow:`0 0 60px ${goalReached?"#FFD700":C}99`, transition:"color 0.3s, text-shadow 0.3s", fontVariantNumeric:"tabular-nums" }}>{reps}</div>
              <div style={{ fontSize:"11px", letterSpacing:"6px", color:"#333", marginTop:"8px" }}>REPS</div>
            </div>
          </div>

          {/* Meta */}
          {repGoal > 0 && (
            <div style={{ padding:"0 32px", marginBottom:"16px" }}>
              <div style={{ height:"3px", borderRadius:"2px", background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                <div style={{ height:"100%", borderRadius:"2px", width:`${Math.min((reps/repGoal)*100,100)}%`, background:goalReached?"#FFD700":C, transition:"width 0.3s ease" }}/>
              </div>
              <div style={{ fontFamily:"sans-serif", fontSize:"9px", color:goalReached?"#FFD700":"#555", marginTop:"3px" }}>
                {goalReached ? "🏆 ¡META!" : `${reps} / ${repGoal}`}
              </div>
            </div>
          )}

          {/* Pasos */}
          {(() => { const steps = exerciseSteps[selected.id] || []; return steps.length > 0 && (
            <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"18px" }}>
              {steps.map((s, i) => (
                <div key={i} style={{ padding:"4px 10px", borderRadius:"20px", background:i===activeStep?`${C}22`:"rgba(255,255,255,0.03)", border:`1px solid ${i===activeStep?C+"66":"rgba(255,255,255,0.06)"}`, transition:"all 0.2s" }}>
                  <div style={{ fontSize:"9px", letterSpacing:"1px", color:i===activeStep?C:"#444", fontFamily:"sans-serif" }}>{s}</div>
                </div>
              ))}
            </div>
          ); })()}

          {/* POSE VIEW */}
          {poseActive && (
            <div style={{ marginBottom:"14px" }}>
              <PoseView key={cameraKey} color={C} exerciseId={selected.id} onRep={simulateRep} active={poseActive} facingMode={facingMode}
                onFlipCamera={() => { setFacingMode(m => m === "user" ? "environment" : "user"); setCameraKey(k => k+1); }}
                onReady={() => setPoseReady(true)}
                onPhaseChange={p => setHoldPhase(p)} />
            </div>
          )}

          {/* MANUAL + TERMINAR + ABANDONAR */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"8px" }}>
            <button onClick={simulateRep} style={{ flex:1, padding:"12px", background:"rgba(255,255,255,0.04)", border:`1px solid ${C}33`, borderRadius:"12px", fontSize:"15px", letterSpacing:"3px", color:C+"99", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>
              + MANUAL
            </button>
            <button onClick={() => setPoseActive(v => !v)} style={{ padding:"12px 14px", background:poseActive?`${C}22`:"rgba(255,255,255,0.04)", border:`1px solid ${poseActive?C:"rgba(255,255,255,0.1)"}`, borderRadius:"12px", color:poseActive?C:"#555", cursor:"pointer", fontSize:"18px", transition:"all 0.2s" }} title="IA Pose Detection">
              🤖
            </button>
          </div>
          <button onClick={finishLibre} style={{ width:"100%", padding:"14px", background:"rgba(255,255,255,0.04)", border:`1px solid ${C}55`, borderRadius:"12px", fontSize:"15px", letterSpacing:"4px", color:C, cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"8px" }}>
            ⏹ TERMINAR SESIÓN
          </button>
          <button onClick={resetApp} style={{ width:"100%", padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#444", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", fontFamily:"'Bebas Neue',sans-serif", transition:"all 0.2s" }}>ABANDONAR</button>
        </div>
      )}
      {screen === "rest" && selected && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center" }}>

          {/* Título */}
          <div style={{ fontSize:"13px", letterSpacing:"6px", color:"#555", marginBottom:"6px" }}>DESCANSO</div>

          {/* Puntitos de progreso de sets */}
          <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"20px" }}>
            {Array.from({ length: totalSets }).map((_, i) => {
              const done = i < currentSet - 1;
              const next = i === currentSet - 1;
              return (
                <div key={i} style={{
                  width: next ? "22px" : "8px", height:"8px", borderRadius:"4px",
                  background: done ? C : next ? C+"66" : "rgba(255,255,255,0.08)",
                  transition:"all 0.3s ease",
                  boxShadow: done ? `0 0 6px ${C}88` : "none"
                }}/>
              );
            })}
          </div>

          {/* Reps del set anterior */}
          {setRepsLog.length > 0 && (
            <div style={{ marginBottom:"20px", background:`${C}0d`, border:`1px solid ${C}22`, borderRadius:"12px", padding:"10px 16px", display:"inline-flex", alignItems:"baseline", gap:"8px" }}>
              <div style={{ fontSize:"36px", color:C, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
                {setRepsLog[setRepsLog.length - 1]}
              </div>
              <div style={{ fontSize:"9px", letterSpacing:"3px", color:C+"88" }}>REPS · SET ANTERIOR</div>
            </div>
          )}

          {/* Círculo countdown */}
          <div style={{ position:"relative", width:"180px", height:"180px", margin:"0 auto 16px" }}>
            <svg width="180" height="180" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
              <circle cx="90" cy="90" r="78" fill="none" stroke={C} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2*Math.PI*78}`} strokeDashoffset={`${2*Math.PI*78*(1-pct/100)}`}
                style={{ transition:"stroke-dashoffset 1s linear", filter:`drop-shadow(0 0 8px ${C})` }}/>
            </svg>
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
              <div style={{ fontSize:"52px", lineHeight:1 }}>{fmt(restLeft)}</div>
              <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#555", marginTop:"4px" }}>REST</div>
            </div>
          </div>

          {/* Botones +15 / -15 */}
          <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginBottom:"20px" }}>
            <button onClick={() => setRestLeft(r => Math.max(3, r - 15))}
              style={{ padding:"10px 22px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#888", fontSize:"15px", letterSpacing:"2px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>
              −15s
            </button>
            <button onClick={() => setRestLeft(r => r + 15)}
              style={{ padding:"10px 22px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", color:"#888", fontSize:"15px", letterSpacing:"2px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>
              +15s
            </button>
          </div>

          {/* Guía de respiración */}
          {(() => {
            const cycle = 8; // 4s inhala + 4s exhala
            const phase = Math.floor((restLeft % cycle) / 4);
            const isInhale = phase === 0;
            const progress = (restLeft % 4) / 4;
            const scale = isInhale ? 1 + (1 - progress) * 0.35 : 1 + progress * 0.35;
            return (
              <div style={{ marginBottom:"18px", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px" }}>
                <div style={{ fontSize:"8px", letterSpacing:"4px", color:"#333" }}>RESPIRACIÓN</div>
                <div style={{ position:"relative", width:"70px", height:"70px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{
                    width:"70px", height:"70px", borderRadius:"50%",
                    background: isInhale ? `${C}18` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${isInhale ? C+"44" : "rgba(255,255,255,0.08)"}`,
                    transform: `scale(${scale})`,
                    transition: "transform 0.5s ease, background 0.5s ease",
                    boxShadow: isInhale ? `0 0 20px ${C}33` : "none",
                  }}/>
                  <div style={{ position:"absolute", fontSize:"8px", letterSpacing:"1px", color: isInhale ? C : "#555", transition:"color 0.5s", fontFamily:"sans-serif", fontWeight:"bold" }}>
                    {isInhale ? "INHALÁ" : "EXHALÁ"}
                  </div>
                </div>
                <div style={{ fontSize:"8px", color:"#2a2a2a", letterSpacing:"2px", fontFamily:"sans-serif" }}>
                  {isInhale ? "por la nariz" : "por la boca"}
                </div>
              </div>
            );
          })()}

          {/* Próximo set label */}
          <div style={{ fontSize:"10px", letterSpacing:"3px", color:"#444", marginBottom:"14px" }}>
            PRÓXIMO: SET {currentSet + 1} / {totalSets}
          </div>

          <button onClick={() => { clearInterval(timerRef.current); setCurrentSet(cs=>cs+1); setReps(0); setActiveStep(0); setTimeLeft(duration); setCameraKey(k => k+1); setScreen("counting"); playBeep("go"); }} style={{ width:"100%", padding:"16px", background:C, border:"none", borderRadius:"14px", fontSize:"18px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"10px" }}>⚡ SALTAR DESCANSO</button>
          <button onClick={resetApp} style={{ width:"100%", padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#444", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", fontFamily:"'Bebas Neue',sans-serif" }}>ABANDONAR</button>
        </div>
      )}

      {/* ── ROUTINE REST — descanso entre ejercicios ── */}
      {screen === "routine_rest" && activeRoutine && selected && (() => {
        const nextEx = exercises.find(e => e.id === activeRoutine.exercises[routineExIdx].exerciseId);
        const total = activeRoutine.exercises.length;
        return (
          <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center" }}>
            <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#555", marginBottom:"4px" }}>RUTINA · EJERCICIO {routineExIdx + 1} DE {total}</div>
            <div style={{ fontSize:"13px", letterSpacing:"3px", color:"#FF4D4D", marginBottom:"32px" }}>DESCANSÁ</div>
            <div style={{ position:"relative", width:"180px", height:"180px", margin:"0 auto 24px" }}>
              <svg width="180" height="180" style={{ transform:"rotate(-90deg)" }}>
                <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                <circle cx="90" cy="90" r="78" fill="none" stroke="#FF4D4D" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${2*Math.PI*78}`} strokeDashoffset={`${2*Math.PI*78*(restLeft/(activeRoutine.restBetweenExercises||90))}`}
                  style={{ transition:"stroke-dashoffset 1s linear", filter:"drop-shadow(0 0 8px #FF4D4D)" }}/>
              </svg>
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center" }}>
                <div style={{ fontSize:"52px", lineHeight:1 }}>{fmt(restLeft)}</div>
                <div style={{ fontSize:"9px", letterSpacing:"3px", color:"#555", marginTop:"4px" }}>REST</div>
              </div>
            </div>
            {nextEx && (
              <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"14px", marginBottom:"20px" }}>
                <div style={{ fontSize:"10px", letterSpacing:"4px", color:"#555", marginBottom:"6px" }}>SIGUIENTE</div>
                <div style={{ fontSize:"20px", marginBottom:"4px" }}>{nextEx.icon}</div>
                <div style={{ fontSize:"18px", letterSpacing:"3px", color:nextEx.color }}>{nextEx.name.toUpperCase()}</div>
              </div>
            )}
            <button onClick={() => {
              clearInterval(timerRef.current);
              setRestLeft(0);
              setReps(0); setActiveStep(0); setSetRepsLog([]); setCurrentSet(1);
              setTimeLeft(activeRoutine.exercises[routineExIdx].duration || 120);
              setSessionSaved(false);
              setCameraKey(k => k + 1);
              setScreen("counting");
              playBeep("go");
            }} style={{ width:"100%", padding:"16px", background:"#FF4D4D", border:"none", borderRadius:"14px", fontSize:"18px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"10px" }}>⚡ EMPEZAR YA</button>
            <button onClick={resetApp} style={{ width:"100%", padding:"12px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", color:"#444", cursor:"pointer", fontSize:"13px", letterSpacing:"3px", fontFamily:"'Bebas Neue',sans-serif" }}>ABANDONAR</button>
          </div>
        );
      })()}

      {/* ── ROUTINE FINISHED ── */}
      {screen === "routine_finished" && activeRoutine && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center" }}>
          <div style={{ fontSize:"13px", letterSpacing:"6px", color:"#FF4D4D", marginBottom:"8px" }}>RUTINA COMPLETADA 🎉</div>
          <div style={{ fontSize:"24px", letterSpacing:"3px", marginBottom:"24px" }}>{activeRoutine.name.toUpperCase()}</div>
          {/* Resumen por ejercicio */}
          <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
            {routineLog.map((item, i) => {
              const ex = exercises.find(e => e.id === item.exerciseId);
              const C2 = ex?.color || "#FF4D4D";
              return (
                <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${C2}33`, borderRadius:"12px", padding:"12px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                  <span style={{ fontSize:"20px" }}>{ex?.icon}</span>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <div style={{ fontSize:"14px", letterSpacing:"2px", color:C2 }}>{ex?.name?.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"28px", color:C2, lineHeight:1 }}>{item.totalReps}</div>
                    <div style={{ fontSize:"8px", color:"#555", letterSpacing:"2px" }}>REPS</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background:"rgba(255,77,77,0.08)", border:"1px solid #FF4D4D33", borderRadius:"14px", padding:"16px", marginBottom:"24px" }}>
            <div style={{ fontSize:"11px", letterSpacing:"4px", color:"#555", marginBottom:"4px" }}>TOTAL REPS</div>
            <div style={{ fontSize:"72px", lineHeight:1, color:"#FF4D4D", textShadow:"0 0 40px #FF4D4D88" }}>
              {routineLog.reduce((a, b) => a + b.totalReps, 0)}
            </div>
          </div>
          <button onClick={resetApp} style={{ width:"100%", padding:"18px", background:"#FF4D4D", border:"none", borderRadius:"14px", fontSize:"20px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"8px" }}>IR AL INICIO</button>
        </div>
      )}

      {/* ── FINISHED ── */}
      {screen === "finished" && selected && (
        <div style={{ width:"100%", maxWidth:"420px", zIndex:1, textAlign:"center", position:"relative" }}>
          {showFireworks && particles.map(p => (
            <div key={p.id} style={{ position:"absolute", top:"50%", left:"50%", width:`${p.size}px`, height:`${p.size}px`, borderRadius:"50%", background:p.color, boxShadow:`0 0 ${p.size*2}px ${p.color}`, animation:`explode-${p.id} 1.5s ease-out forwards`, opacity:0 }} />
          ))}

          {/* HERO — impacto visual principal */}
          <div style={{ position:"relative", marginBottom:"24px" }}>
            {/* Glow de fondo grande */}
            <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"280px", height:"280px", borderRadius:"50%", background:`radial-gradient(circle, ${C}30 0%, transparent 70%)`, pointerEvents:"none" }}/>
            {/* Ejercicio */}
            <div style={{ fontSize:"13px", letterSpacing:"6px", color:C+"99", marginBottom:"8px" }}>{selected.icon} {selected.name.toUpperCase()}</div>
            {/* Número grande */}
            <div style={{ fontSize:"120px", lineHeight:0.85, color:C, textShadow:`0 0 80px ${C}`, fontVariantNumeric:"tabular-nums", animation:"finishPop 0.5s ease-out" }}>{grandTotal}</div>
            <div style={{ fontSize:"12px", letterSpacing:"8px", color:"#555", marginTop:"10px" }}>REPS TOTALES</div>
            {/* Badge guardado */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(0,201,167,0.12)", border:"1px solid #00C9A744", borderRadius:"20px", padding:"4px 12px", marginTop:"12px" }}>
              <span style={{ fontSize:"10px" }}>✅</span>
              <span style={{ fontSize:"10px", letterSpacing:"3px", color:"#00C9A7" }}>GUARDADO</span>
            </div>
          </div>

          {/* SETS — barras de progreso */}
          {setRepsLog.length > 0 && (
            <div style={{ display:"flex", gap:"6px", marginBottom:"16px" }}>
              {setRepsLog.map((r,i) => {
                const best = Math.max(...setRepsLog);
                const pct2 = best > 0 ? r/best : 0;
                return (
                  <div key={i} style={{ flex:1, background:"rgba(255,255,255,0.03)", border:`1px solid ${r===best?C:C+"22"}`, borderRadius:"10px", padding:"10px 6px", position:"relative", overflow:"hidden" }}>
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:`${pct2*100}%`, background:`${C}22`, transition:"height 0.8s ease" }}/>
                    <div style={{ position:"relative" }}>
                      <div style={{ fontSize:"26px", color:r===best?C:C+"88", textShadow:r===best?`0 0 12px ${C}88`:"none" }}>{r}</div>
                      <div style={{ fontSize:"8px", color:"#444", fontFamily:"sans-serif", marginTop:"1px" }}>S{i+1}</div>
                      {r===best && setRepsLog.filter(x=>x===best).length===1 && (
                        <div style={{ fontSize:"9px", color:C, marginTop:"1px" }}>★</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* STATS — con color y más presencia */}
          <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
            {[
              { val:totalSets,                                                          label:"SETS",      icon:"📋" },
              { val:(grandTotal/(totalSets*(duration/60)||1)).toFixed(1),              label:"REPS/MIN",  icon:"⚡" },
              { val:Math.max(...setRepsLog, 0),                                        label:"MEJOR SET", icon:"★" },
            ].map(({ val, label, icon }) => (
              <div key={label} style={{ flex:1, background:`${C}10`, border:`1px solid ${C}44`, borderRadius:"12px", padding:"14px 6px" }}>
                <div style={{ fontSize:"10px", marginBottom:"4px" }}>{icon}</div>
                <div style={{ fontSize:"26px", color:C, textShadow:`0 0 12px ${C}66`, lineHeight:1 }}>{val}</div>
                <div style={{ fontSize:"8px", letterSpacing:"1px", color:C+"77", fontFamily:"sans-serif", marginTop:"4px" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* BOTONES */}
          <button onClick={startSession} style={{ width:"100%", padding:"18px", background:C, border:"none", borderRadius:"14px", fontSize:"20px", letterSpacing:"4px", color:"#000", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", marginBottom:"8px", boxShadow:`0 0 20px ${C}55` }}>REPETIR SESIÓN</button>
          <div style={{ display:"flex", gap:"8px" }}>
            <button onClick={() => setScreen("history")} style={{ flex:1, padding:"14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", fontSize:"13px", letterSpacing:"3px", color:"#777", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>📋 HISTORIAL</button>
            <button onClick={resetApp} style={{ flex:1, padding:"14px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"12px", fontSize:"13px", letterSpacing:"3px", color:"#777", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif" }}>NUEVA</button>
          </div>
        </div>
      )}

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.min.css" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes prPop{0%{opacity:0;transform:translateX(-50%) scale(0.7)}60%{transform:translateX(-50%) scale(1.05)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes toastIn{0%{opacity:0;transform:translateX(-50%) translateY(16px)}100%{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes finishPop{0%{opacity:0;transform:scale(0.6)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        ${particles.map(p=>`@keyframes explode-${p.id}{0%{opacity:1;transform:rotate(${p.angle}deg) translateX(20px) scale(1)}60%{opacity:1;transform:rotate(${p.angle}deg) translateX(${p.distance}px) scale(1.2)}100%{opacity:0;transform:rotate(${p.angle}deg) translateX(${p.distance*1.5}px) scale(0)}}`).join("")}
      `}</style>
    </div>
  );
}

const WrappedApp = () => <ErrorBoundary><RepCountApp /></ErrorBoundary>;
export default WrappedApp;
