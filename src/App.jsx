import { useState, useEffect, useRef, Component } from "react";

// MAPA App-42.0
// ├── ErrorBoundary
// ├── DATA (categorías, ejercicios, pasos, defaults)
// ├── BLOCK_TYPES (normal/superset/giantset)
// ├── STORAGE (historial, sessions v2, weekly plan)
// ├── AUDIO
// ├── SKELETON POSES + MOVENET + useMoveNet + PoseView + CameraView
// ├── HistoryScreen (sin cambios)
// ├── ProgramScreen ← ACTUALIZADO (preview sesión + colores celestes + fix bug volver)
// └── RepCountApp (nuevo HOME + flujo libre + flujo programa + pausa overlay)
//
// CAMBIOS EN App-42.0:
// ✅ Bug fix: "← PROGRAMA RÁPIDO" ya no borra bloques (va a session_list)
// ✅ Botones celestes (#4a9eff) en libre_select y setup
// ✅ Popup "última sesión" en libre_select
// ✅ Botón HISTORIAL en libre_select
// ✅ se agrego mesosiclo

// ─── ERROR BOUNDARY ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return (
      <div style={{minHeight:"100vh",background:"#0A0A0F",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px",fontFamily:"monospace"}}>
        <div style={{fontSize:"32px",marginBottom:"16px"}}>⚠️</div>
        <div style={{fontSize:"14px",color:"#FF4D4D",marginBottom:"8px",letterSpacing:"2px"}}>ERROR EN RENDER</div>
        <div style={{fontSize:"11px",color:"#555",background:"rgba(255,255,255,0.05)",padding:"16px",borderRadius:"8px",maxWidth:"400px",wordBreak:"break-word"}}>{this.state.error.message}</div>
      </div>
    );
    return this.props.children;
  }
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const categories = [
  { id:"fullbody", name:"Full Body", icon:"🔥", color:"#FF4D4D", exercises:[
    { id:"burpee_sin_salto", name:"Burpee Sin Salto", steps:6, icon:"⚡", color:"#FF4D4D", desc:"6 pasos · sin impacto final" },
    { id:"burpee_con_salto", name:"Burpee Con Salto", steps:7, icon:"🚀", color:"#FF2222", desc:"7 pasos · versión completa" },
    { id:"jumping_jacks",   name:"Jumping Jacks",    steps:2, icon:"🌟", color:"#FF6B6B", desc:"Pies + brazos · cardio" },
  ]},
  { id:"empuje", name:"Empuje", icon:"💪", color:"#FF8C00", exercises:[
    { id:"flexiones",          name:"Flexiones",          steps:2, icon:"💪", color:"#FF8C00", desc:"Agarre normal · pecho" },
    { id:"flexiones_diamante", name:"Flexiones Diamante", steps:2, icon:"💎", color:"#FF8C00", desc:"Agarre cerrado · tríceps" },
    { id:"pike_pushup",        name:"Pike Pushup",        steps:2, icon:"🔺", color:"#FF8C00", desc:"Cadera alta · hombros" },
    { id:"dips",               name:"Dips",               steps:2, icon:"🔽", color:"#FF8C00", desc:"Fondos · tríceps y pecho" },
  ]},
  { id:"tiron", name:"Tirón", icon:"🏋️", color:"#6C63FF", exercises:[
    { id:"dominadas",        name:"Dominadas",        steps:2, icon:"🏋️", color:"#6C63FF", desc:"Agarre ancho · espalda" },
    { id:"dominada_supina",  name:"Dominada Supina",  steps:2, icon:"💪", color:"#8B5CF6", desc:"Chin-up · bíceps dominante" },
    { id:"dominada_neutra",  name:"Dominada Neutra",  steps:2, icon:"🤲", color:"#7C3AED", desc:"Agarre neutro · completo" },
    { id:"remo_australiano", name:"Remo Australiano", steps:2, icon:"📐", color:"#5B21B6", desc:"Barra baja · espalda media" },
  ]},
  { id:"piernas", name:"Piernas", icon:"🦵", color:"#00C9A7", exercises:[
    { id:"sentadillas",           name:"Sentadillas",           steps:2, icon:"🦵", color:"#00C9A7", desc:"Bilateral · cuádriceps" },
    { id:"zancadas",              name:"Zancadas",              steps:2, icon:"🚶", color:"#00C9A7", desc:"Alternadas · glúteos" },
    { id:"sissy_squat",           name:"Sissy Squat",           steps:2, icon:"⚡", color:"#06B6D4", desc:"Rodillas adelante · cuádriceps" },
    { id:"sentadilla_una_pierna", name:"Sentadilla Una Pierna", steps:2, icon:"🦾", color:"#00C9A7", desc:"Pistol squat · avanzado" },
  ]},
  { id:"hold", name:"Isométrico", icon:"🧘", color:"#F59E0B", exercises:[
    { id:"plancha", name:"Plancha", steps:1, icon:"⏱", color:"#F59E0B", desc:"Hold · core y alineación", holdMode:true },
  ]},
];

const exercises = categories.flatMap(c => c.exercises);

const exerciseSteps = {
  burpee_sin_salto:["De pie","Agachado","Plancha","Flex abajo","Flex arriba","De pie"],
  burpee_con_salto:["De pie","Agachado","Plancha","Flex abajo","Flex arriba","De pie","Salto"],
  jumping_jacks:["Juntos","Abierto"], flexiones:["Arriba","Abajo"],
  flexiones_diamante:["Arriba","Abajo"], pike_pushup:["Arriba","Abajo"], dips:["Arriba","Abajo"],
  dominadas:["Abajo","Arriba"], dominada_supina:["Abajo","Arriba"], dominada_neutra:["Abajo","Arriba"],
  remo_australiano:["Abajo","Arriba"], sentadillas:["De pie","Abajo"], zancadas:["De pie","Abajo"],
  sissy_squat:["De pie","Abajo"], sentadilla_una_pierna:["De pie","Abajo"], plancha:["HOLD"],
};

const exerciseDefaults = {
  burpee_sin_salto:{sets:3,duration:300,rest:90}, burpee_con_salto:{sets:3,duration:300,rest:90},
  jumping_jacks:{sets:3,duration:60,rest:30}, flexiones:{sets:4,duration:480,rest:60},
  flexiones_diamante:{sets:3,duration:360,rest:60}, pike_pushup:{sets:3,duration:300,rest:60},
  dips:{sets:3,duration:360,rest:60}, dominadas:{sets:4,duration:300,rest:90},
  dominada_supina:{sets:4,duration:300,rest:90}, dominada_neutra:{sets:4,duration:300,rest:90},
  remo_australiano:{sets:4,duration:300,rest:60}, sentadillas:{sets:4,duration:480,rest:45},
  zancadas:{sets:3,duration:420,rest:45}, sissy_squat:{sets:3,duration:300,rest:60},
  sentadilla_una_pierna:{sets:3,duration:300,rest:60}, plancha:{sets:3,duration:60,rest:60},
};

// ─── BLOCK TYPES ──────────────────────────────────────────────────────────────
const BLOCK_TYPES = {
  normal:   { label:"SERIE NORMAL",  emoji:"💪", color:"#FF8C00", restWithin:0,  restAfter:90,  maxEx:1,
    desc:"Un ejercicio, varios sets con descanso entre ellos. Perfecto para aprender o focalizarte en un músculo." },
  superset: { label:"SUPERSERIE",    emoji:"⚡", color:"#6C63FF", restWithin:15, restAfter:120, maxEx:2,
    desc:"2 ejercicios alternados casi sin descanso entre sí. Músculos antagónicos, más trabajo en menos tiempo." },
  giantset: { label:"SERIE GIGANTE", emoji:"🔥", color:"#FF4D4D", restWithin:0,  restAfter:150, maxEx:6,
    desc:"3 o más ejercicios encadenados sin descanso entre ellos. Alta intensidad, para entrenados." },
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const STORAGE_KEY    = "repcount-history";
const PR_KEY         = "repcount-prs";
const ROUTINES_KEY   = "repcount-routines";
const SESSIONS_KEY   = "repcount-sessions-v2";
const WEEKPLAN_KEY   = "repcount-weekplan-v2";
const MESO_KEY       = "repcount-meso-v1";

async function loadHistory() { try { const r=await window.storage.get(STORAGE_KEY);return r?JSON.parse(r.value):[]; }catch{return [];} }
async function saveSession(session) { try{const h=await loadHistory();const u=[session,...h].slice(0,100);await window.storage.set(STORAGE_KEY,JSON.stringify(u));return u;}catch{return null;} }
async function loadPRs() { try{const r=await window.storage.get(PR_KEY);return r?JSON.parse(r.value):{};}catch{return {};} }
async function savePR(exerciseId,reps) { try{const prs=await loadPRs();prs[exerciseId]=reps;await window.storage.set(PR_KEY,JSON.stringify(prs));}catch{} }
async function loadRoutines() { try{const r=await window.storage.get(ROUTINES_KEY);return r?JSON.parse(r.value):{};}catch{return {};} }
async function saveRoutines(r) { try{await window.storage.set(ROUTINES_KEY,JSON.stringify(r));}catch{} }
async function clearHistory() { try{await window.storage.delete(STORAGE_KEY);}catch{} }

async function loadSessions() { try{const r=await window.storage.get(SESSIONS_KEY);return r?JSON.parse(r.value):[];}catch{return [];} }
async function saveSessions(s) { try{await window.storage.set(SESSIONS_KEY,JSON.stringify(s));}catch{} }

async function loadWeekPlan() { try{const r=await window.storage.get(WEEKPLAN_KEY);return r?JSON.parse(r.value):{};}catch{return {};} }
async function saveWeekPlan(p) { try{await window.storage.set(WEEKPLAN_KEY,JSON.stringify(p));}catch{} }
async function loadMeso() { try{const r=await window.storage.get(MESO_KEY);return r?JSON.parse(r.value):null;}catch{return null;} }
async function saveMeso(m) { try{await window.storage.set(MESO_KEY,JSON.stringify(m));}catch{} }

const daysAgo=n=>new Date(Date.now()-n*86400000).toISOString();
const FAKE_HISTORY=[
  {id:"f1",date:daysAgo(0),exerciseId:"burpee_con_salto",totalReps:28,sets:[8,10,10],duration:5,rest:60,mode:"series"},
  {id:"f2",date:daysAgo(0),exerciseId:"flexiones",totalReps:45,sets:[],duration:8,rest:0,mode:"libre",elapsed:480},
  {id:"f3",date:daysAgo(1),exerciseId:"burpee_sin_salto",totalReps:35,sets:[10,12,13],duration:5,rest:60,mode:"series"},
  {id:"f4",date:daysAgo(2),exerciseId:"dominadas",totalReps:18,sets:[6,6,6],duration:3,rest:90,mode:"series"},
  {id:"f5",date:daysAgo(4),exerciseId:"flexiones",totalReps:50,sets:[15,18,17],duration:5,rest:45,mode:"series"},
];
async function seedFakeHistory() { try{const e=await loadHistory();if(e.length>0)return;await window.storage.set(STORAGE_KEY,JSON.stringify(FAKE_HISTORY));}catch{} }

// ─── AUDIO ────────────────────────────────────────────────────────────────────
function playBeep(type="alarm") {
  try {
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const b=(f,s,d,vol=0.4,wave="sine")=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type=wave;g.gain.setValueAtTime(0,ctx.currentTime+s);g.gain.linearRampToValueAtTime(vol,ctx.currentTime+s+0.01);g.gain.linearRampToValueAtTime(0,ctx.currentTime+s+d);o.start(ctx.currentTime+s);o.stop(ctx.currentTime+s+d+0.1);};
    const whistle=(offset,dur=0.15)=>{const o=ctx.createOscillator(),g=ctx.createGain(),lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=10;lfo.type="sine";lg.gain.value=14;lfo.connect(lg);lg.connect(o.frequency);o.frequency.value=3100;o.type="sine";o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0,ctx.currentTime+offset);g.gain.linearRampToValueAtTime(0.5,ctx.currentTime+offset+0.02);g.gain.setValueAtTime(0.45,ctx.currentTime+offset+dur-0.04);g.gain.linearRampToValueAtTime(0,ctx.currentTime+offset+dur);lfo.start(ctx.currentTime+offset);lfo.stop(ctx.currentTime+offset+dur+0.05);o.start(ctx.currentTime+offset);o.stop(ctx.currentTime+offset+dur+0.05);};
    if(type==="go"){b(660,0,.1);b(880,.15,.1);b(1100,.3,.25);}
    else if(type==="whistle"){whistle(0,0.18);}
    else if(type==="ready"){whistle(0,0.15);whistle(0.3,0.15);}
    else if(type==="victory"){whistle(0,0.55);whistle(0.75,0.55);whistle(1.5,0.55);}
    else if(type==="warning"){b(1480,0,0.08,0.35);b(1480,0.15,0.08,0.35);b(1480,0.30,0.08,0.35);}
    else if(type==="rep"){const o=ctx.createOscillator(),g=ctx.createGain();o.type="triangle";o.frequency.value=1800;o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(0.5,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.6);o.start(ctx.currentTime);o.stop(ctx.currentTime+0.65);}
    else if(type==="incomplete"){b(180,0,0.18,0.25,"sawtooth");}
    else if(type==="alarm"){b(880,0,.15);b(1100,.2,.15);b(1320,.4,.3);b(1760,.8,.5);}
  }catch{}
}

// ─── SKELETON POSES ──────────────────────────────────────────────────────────
const POSES = {
  standing:   {pts:[[140,28],[140,48],[118,52],[162,52],[105,80],[175,80],[98,108],[182,108],[140,98],[126,140],[154,140],[122,182],[158,182]],conf:[1,1,1,1,1,1,0.9,0.9,1,1,1,1,1]},
  squat_down: {pts:[[140,36],[140,56],[122,62],[158,62],[112,90],[168,90],[108,118],[172,118],[140,108],[120,148],[160,148],[115,175],[165,175]],conf:[1,1,1,1,1,1,0.9,0.9,1,1,1,1,1]},
  plank:      {pts:[[56,92],[70,96],[74,82],[66,82],[88,72],[52,72],[102,66],[38,66],[138,104],[150,118],[126,118],[160,130],[112,130]],conf:[1,1,1,1,1,1,0.85,0.85,1,1,1,1,1]},
  pushup_down:{pts:[[56,108],[70,110],[74,96],[66,96],[88,86],[52,86],[102,80],[38,80],[138,118],[150,132],[126,132],[160,144],[112,144]],conf:[1,1,1,1,1,1,0.85,0.85,1,1,1,1,1]},
  jump:       {pts:[[140,18],[140,38],[116,44],[164,44],[102,70],[178,70],[94,52],[186,52],[140,88],[124,122],[156,122],[118,158],[162,158]],conf:[1,1,1,1,1,1,1,1,1,1,1,1,1]},
  pullup_up:  {pts:[[140,22],[140,42],[118,30],[162,30],[126,16],[154,16],[130,30],[150,30],[140,90],[128,132],[152,132],[124,172],[156,172]],conf:[1,1,1,1,1,1,0.9,0.9,1,1,1,1,1]},
};
function getPose(exerciseId,stepIndex){
  const map={burpee_sin_salto:["standing","squat_down","plank","pushup_down","plank","standing"],burpee_con_salto:["standing","squat_down","plank","pushup_down","plank","standing","jump"],jumping_jacks:["standing","jump"],flexiones:["plank","pushup_down"],flexiones_diamante:["plank","pushup_down"],pike_pushup:["plank","pushup_down"],dips:["standing","squat_down"],dominadas:["standing","pullup_up"],dominada_supina:["standing","pullup_up"],dominada_neutra:["standing","pullup_up"],remo_australiano:["plank","pushup_down"],sentadillas:["standing","squat_down"],zancadas:["standing","squat_down"],sissy_squat:["standing","squat_down"],sentadilla_una_pierna:["standing","squat_down"],plancha:["plank"]};
  return POSES[map[exerciseId]?.[stepIndex]||"standing"];
}
const BONES=[[0,1],[1,2],[1,3],[2,4],[4,6],[3,5],[5,7],[2,8],[3,8],[8,9],[8,10],[9,11],[10,12]];

// ─── MOVENET ──────────────────────────────────────────────────────────────────
function calcAngle(a,b,c){const ab=[a[0]-b[0],a[1]-b[1]],cb=[c[0]-b[0],c[1]-b[1]],dot=ab[0]*cb[0]+ab[1]*cb[1],mag=Math.sqrt(ab[0]**2+ab[1]**2)*Math.sqrt(cb[0]**2+cb[1]**2);return mag<0.0001?0:Math.acos(Math.max(-1,Math.min(1,dot/mag)))*180/Math.PI;}
const MIN_CONF=0.25;
const REP_DETECTORS={
  flexiones:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};if((kps[11][1]+kps[12][1])/2-(kps[5][1]+kps[6][1])/2>130)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"down":a>140?"up":null,conf:L?cL:cR};},
  flexiones_diamante:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};if((kps[11][1]+kps[12][1])/2-(kps[5][1]+kps[6][1])/2>130)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<85?"down":a>140?"up":null,conf:L?cL:cR};},
  dips:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"down":a>150?"up":null,conf:L?cL:cR};},
  pike_pushup:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};if((kps[5][1]+kps[6][1])/2-(kps[11][1]+kps[12][1])/2<30)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"down":a>140?"up":null,conf:L?cL:cR};},
  sentadillas:(kps)=>{const cL=Math.min(kps[11][2],kps[13][2],kps[15][2]),cR=Math.min(kps[12][2],kps[14][2],kps[16][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const kd=Math.abs(kps[13][1]-kps[14][1]),hw=Math.abs(kps[11][0]-kps[12][0]);if(!(hw<10||kd<hw*0.8))return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[11],kps[13],kps[15]):calcAngle(kps[12],kps[14],kps[16]);return{angle:Math.round(a),phase:a<100?"down":a>160?"up":null,conf:L?cL:cR};},
  zancadas:(kps)=>{const cL=Math.min(kps[11][2],kps[13][2],kps[15][2]),cR=Math.min(kps[12][2],kps[14][2],kps[16][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const hw=Math.abs(kps[11][0]-kps[12][0])||40;if(!(Math.abs(kps[13][1]-kps[14][1])>hw*0.4||Math.abs(kps[15][1]-kps[16][1])>hw*0.4))return{angle:null,phase:null,conf:0};const aL=cL>=MIN_CONF?calcAngle(kps[11],kps[13],kps[15]):180,aR=cR>=MIN_CONF?calcAngle(kps[12],kps[14],kps[16]):180;const ui=aL<aR,a=ui?aL:aR;return{angle:Math.round(a),phase:a<105?"down":a>160?"up":null,conf:ui?cL:cR};},
  sentadilla_una_pierna:(kps)=>{const cL=Math.min(kps[11][2],kps[13][2],kps[15][2]),cR=Math.min(kps[12][2],kps[14][2],kps[16][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const aL=cL>=MIN_CONF?calcAngle(kps[11],kps[13],kps[15]):180,aR=cR>=MIN_CONF?calcAngle(kps[12],kps[14],kps[16]):180;if(Math.abs(aL-aR)<40||Math.max(aL,aR)<130)return{angle:null,phase:null,conf:0};const wa=Math.min(aL,aR),L=aL<aR;return{angle:Math.round(wa),phase:wa<95?"down":wa>155?"up":null,conf:L?cL:cR};},
  sissy_squat:(kps)=>{const cL=Math.min(kps[11][2],kps[13][2],kps[15][2]),cR=Math.min(kps[12][2],kps[14][2],kps[16][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[11],kps[13],kps[15]):calcAngle(kps[12],kps[14],kps[16]);return{angle:Math.round(a),phase:a<75?"down":a>155?"up":null,conf:L?cL:cR};},
  dominadas:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"up":a>155?"down":null,conf:L?cL:cR};},
  dominada_supina:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"up":a>155?"down":null,conf:L?cL:cR};},
  dominada_neutra:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"up":a>155?"down":null,conf:L?cL:cR};},
  remo_australiano:(kps)=>{const cL=Math.min(kps[5][2],kps[7][2],kps[9][2]),cR=Math.min(kps[6][2],kps[8][2],kps[10][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};if(Math.abs((kps[11][1]+kps[12][1])/2-(kps[5][1]+kps[6][1])/2)>=120)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[7],kps[9]):calcAngle(kps[6],kps[8],kps[10]);return{angle:Math.round(a),phase:a<90?"up":a>150?"down":null,conf:L?cL:cR};},
  jumping_jacks:(kps)=>{const cA=Math.min(kps[15][2],kps[16][2]),cW=Math.min(kps[9][2],kps[10][2]);if(cA<MIN_CONF&&cW<MIN_CONF)return{angle:null,phase:null,conf:0};const sw=Math.abs(kps[5][0]-kps[6][0])||80,as=Math.abs(kps[15][0]-kps[16][0])/sw,wu=(kps[5][1]+kps[6][1])/2-(kps[9][1]+kps[10][1])/2;return{angle:Math.round(as*100),phase:(as>0.55&&wu>10)?"up":wu<-20?"down":null,conf:Math.max(cA,cW)};},
  plancha:(kps)=>{const cL=Math.min(kps[5][2],kps[11][2],kps[15][2]),cR=Math.min(kps[6][2],kps[12][2],kps[16][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const sy=(kps[5][1]+kps[6][1])/2,hy=(kps[11][1]+kps[12][1])/2,ay=(kps[15][1]+kps[16][1])/2,bl=Math.abs(ay-sy)||1,hd=Math.abs(hy-(sy+ay)/2)/bl;return{angle:Math.round(hd*100),phase:hd<0.15?"up":null,conf:cL>=cR?cL:cR};},
  burpee_sin_salto:(kps)=>{const cL=Math.min(kps[5][2],kps[11][2],kps[13][2]),cR=Math.min(kps[6][2],kps[12][2],kps[14][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[11],kps[13]):calcAngle(kps[6],kps[12],kps[14]);return{angle:Math.round(a),phase:a<110?"down":a>160?"up":null,conf:L?cL:cR};},
  burpee_con_salto:(kps)=>{const cL=Math.min(kps[5][2],kps[11][2],kps[13][2]),cR=Math.min(kps[6][2],kps[12][2],kps[14][2]);if(cL<MIN_CONF&&cR<MIN_CONF)return{angle:null,phase:null,conf:0};const L=cL>=cR,a=L?calcAngle(kps[5],kps[11],kps[13]):calcAngle(kps[6],kps[12],kps[14]);return{angle:Math.round(a),phase:a<110?"down":a>155?"up":null,conf:L?cL:cR};},
};

const TF_URL="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js";
const PD_URL="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js";
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function preloadMoveNetScripts(){return loadScript(TF_URL).then(()=>loadScript(PD_URL)).catch(()=>{});}

// ─── useMoveNet HOOK ──────────────────────────────────────────────────────────
function useMoveNet({active,exerciseId,onRep,onStatus,onAngle,onReady,facingMode="user"}){
  const videoRef=useRef(null),keypointsRef=useRef(null),phaseRef=useRef(null),frameRef=useRef(null);
  const angleHistRef=useRef([]),phaseHistRef=useRef([]),lastRepRef=useRef(0);
  const SF=5,PF=3,RC=600;
  useEffect(()=>{
    if(!active){if(frameRef.current)cancelAnimationFrame(frameRef.current);return;}
    let cancelled=false;
    const init=async()=>{
      try{
        const isMob=/Android|iPhone|iPad/i.test(navigator.userAgent),cW=isMob?320:640,cH=isMob?240:480;
        onStatus("1/3 · Descargando IA...");
        let stream;
        try{[,stream]=await Promise.all([loadScript(TF_URL),navigator.mediaDevices.getUserMedia({video:{facingMode,width:{ideal:cW},height:{ideal:cH}},audio:false})]);await loadScript(PD_URL);}
        catch(e){await loadScript(TF_URL).catch(()=>{});await loadScript(PD_URL).catch(()=>{});throw e;}
        if(cancelled){stream?.getTracks().forEach(t=>t.stop());return;}
        const vid=document.createElement("video");vid.srcObject=stream;vid.playsInline=true;vid.muted=true;await vid.play();videoRef.current=vid;
        onStatus("2/3 · Motor IA...");
        let bu="cpu";try{await window.tf.setBackend("webgl");await window.tf.ready();bu="webgl";}catch(e){try{await window.tf.setBackend("cpu");await window.tf.ready();}catch(e2){}}
        onStatus("3/3 · Modelo... ["+bu+"]");
        let r=0;while((!window.poseDetection?.movenet)&&r<3){r++;await new Promise(x=>setTimeout(x,1500));try{await loadScript(PD_URL);}catch(e){}}
        if(!window.poseDetection?.movenet){onStatus("Error: recargá la página");return;}
        const det=await window.poseDetection.createDetector(window.poseDetection.SupportedModels.MoveNet,{modelType:window.poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,enableSmoothing:true});
        try{await det.estimatePoses(videoRef.current);}catch(e){}
        let fsd=0;const MFSD=90;onStatus("ACTIVO");onReady?.();
        let fc=0;const SKIP=isMob?2:1;
        const detect=async()=>{
          if(cancelled||!videoRef.current)return;
          fc++;if(fc%SKIP!==0){frameRef.current=requestAnimationFrame(detect);return;}
          if(videoRef.current.readyState<2||videoRef.current.videoWidth===0){frameRef.current=requestAnimationFrame(detect);return;}
          try{
            const poses=await det.estimatePoses(videoRef.current);
            if(poses?.[0]?.keypoints?.length>=17){
              const kps=poses[0].keypoints.map(k=>[k.x,k.y,k.score??k.confidence??0]);
              if(kps.filter(k=>k[2]>=MIN_CONF).length<3){fsd++;if(fsd>=MFSD){onStatus("Sin detección — usá + MANUAL");fsd=0;}frameRef.current=requestAnimationFrame(detect);return;}
              fsd=0;keypointsRef.current=kps;
              const rd=REP_DETECTORS[exerciseId];
              if(rd){
                const{angle,phase,conf}=rd(kps);
                if(angle!==null&&conf>=MIN_CONF){
                  angleHistRef.current=[...angleHistRef.current,angle].slice(-SF);
                  const sa=Math.round(angleHistRef.current.reduce((a,b)=>a+b,0)/angleHistRef.current.length);
                  onAngle?.({angle:sa,phase:phaseRef.current,conf});
                  if(phase){
                    phaseHistRef.current=[...phaseHistRef.current,phase].slice(-PF);
                    const stable=phaseHistRef.current.length===PF&&phaseHistRef.current.every(p=>p===phase);
                    if(stable&&phase!==phaseRef.current){const prev=phaseRef.current;phaseRef.current=phase;const now=Date.now();if(phase==="up"&&prev==="down"&&(now-lastRepRef.current)>RC){lastRepRef.current=now;playBeep("rep");onRep();}}
                  }else{if(phaseRef.current==="down"&&phaseHistRef.current.length>0)playBeep("incomplete");phaseHistRef.current=[];phaseRef.current=null;onAngle?.({angle:null,phase:null,conf:0});}
                }else{phaseHistRef.current=[];phaseRef.current=null;onAngle?.({angle:null,phase:null,conf:0});}
              }
            }
          }catch(e){}
          frameRef.current=requestAnimationFrame(detect);
        };detect();
      }catch(err){if(!cancelled)onStatus("Error: "+(err.message||"No se pudo iniciar"));}
    };
    init();
    return()=>{cancelled=true;if(frameRef.current)cancelAnimationFrame(frameRef.current);if(videoRef.current)videoRef.current.srcObject?.getTracks().forEach(t=>t.stop());};
  },[active,exerciseId]);
  return{videoRef,keypointsRef};
}

// ─── POSE VIEW ────────────────────────────────────────────────────────────────
function PoseView({color,exerciseId,onRep,active,facingMode,onFlipCamera,onReady,onPhaseChange}){
  const canvasRef=useRef(null),drawRef=useRef(null);
  const[status,setStatus]=useState("En espera...");
  const[liveAngle,setLiveAngle]=useState(null);
  const[livePhase,setLivePhase]=useState(null);
  const[liveConf,setLiveConf]=useState(0);
  const[repFlash,setRepFlash]=useState(false);
  const rfRef=useRef(false),lpRef=useRef(null);
  const HL={flexiones:[[5,7,9],[6,8,10]],flexiones_diamante:[[5,7,9],[6,8,10]],pike_pushup:[[5,7,9],[6,8,10]],dips:[[5,7,9],[6,8,10]],dominadas:[[5,7,9],[6,8,10]],dominada_supina:[[5,7,9],[6,8,10]],dominada_neutra:[[5,7,9],[6,8,10]],remo_australiano:[[5,7,9],[6,8,10]],sentadillas:[[11,13,15],[12,14,16]],zancadas:[[11,13,15],[12,14,16]],sissy_squat:[[11,13,15],[12,14,16]],sentadilla_una_pierna:[[11,13,15],[12,14,16]],jumping_jacks:[[15,16],[9,10]],burpee_sin_salto:[[5,11,13],[6,12,14]],burpee_con_salto:[[5,11,13],[6,12,14]],plancha:[[5,11,15],[6,12,16]]};
  const CONN=[[5,6],[5,7],[7,9],[6,8],[8,10],[5,11],[6,12],[11,12],[11,13],[13,15],[12,14],[14,16]];
  const handleRep=()=>{onRep();rfRef.current=true;setRepFlash(true);setTimeout(()=>{rfRef.current=false;setRepFlash(false);},400);};
  const handleAngle=({angle,phase,conf})=>{setLiveAngle(angle);setLivePhase(phase);setLiveConf(conf);if(phase!==lpRef.current){lpRef.current=phase;onPhaseChange?.(phase);}};
  const{videoRef,keypointsRef}=useMoveNet({active,exerciseId,onRep:handleRep,onStatus:setStatus,onAngle:handleAngle,facingMode,onReady});
  const laRef=useRef(null),lpvRef=useRef(null);
  useEffect(()=>{laRef.current=liveAngle;},[liveAngle]);
  useEffect(()=>{lpvRef.current=livePhase;},[livePhase]);
  useEffect(()=>{
    if(!active){if(drawRef.current)cancelAnimationFrame(drawRef.current);return;}
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d"),W=canvas.width,H=canvas.height;
    const draw=()=>{
      ctx.clearRect(0,0,W,H);ctx.fillStyle="#060810";ctx.fillRect(0,0,W,H);
      const vid=videoRef.current;if(vid&&vid.readyState>=2){ctx.save();ctx.translate(W,0);ctx.scale(-1,1);ctx.drawImage(vid,0,0,W,H);ctx.restore();}
      if(rfRef.current){ctx.fillStyle=`${color}33`;ctx.fillRect(0,0,W,H);}
      const kps=keypointsRef.current;
      if(kps){
        const sx=W/640,sy=H/480,px=(i)=>[W-kps[i][0]*sx,kps[i][1]*sy];
        const hlS=HL[exerciseId]||[],hlF=new Set(hlS.flat());
        CONN.forEach(([a,b])=>{if(kps[a][2]<0.2||kps[b][2]<0.2)return;const[ax,ay]=px(a),[bx,by]=px(b),iH=hlF.has(a)&&hlF.has(b);ctx.strokeStyle=iH?color:`${color}55`;ctx.lineWidth=iH?4:2;ctx.lineCap="round";ctx.shadowColor=iH?color:"transparent";ctx.shadowBlur=iH?10:0;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();ctx.shadowBlur=0;});
        kps.forEach(([x,y,s],i)=>{if(s<0.2)return;const[px2,py2]=[W-x*sx,y*sy],iH=hlF.has(i);ctx.fillStyle=iH?color:`${color}77`;ctx.shadowColor=iH?color:"transparent";ctx.shadowBlur=iH?12:0;ctx.beginPath();ctx.arc(px2,py2,iH?6:3.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
        const la=laRef.current,lp=lpvRef.current;
        if(hlS.length>0&&la!==null){const bg=hlS.find(g=>g.every(i=>kps[i][2]>=MIN_CONF))||hlS[0],mid=bg[1];if(kps[mid][2]>=0.3){const[mx,my]=[W-kps[mid][0]*sx,kps[mid][1]*sy];ctx.fillStyle="rgba(0,0,0,0.75)";ctx.beginPath();ctx.roundRect(mx-28,my-22,56,20,4);ctx.fill();ctx.fillStyle=lp==="down"?"#FF4D4D":lp==="up"?"#00C9A7":color;ctx.font="bold 13px monospace";ctx.textAlign="center";ctx.fillText(`${la}°`,mx,my-7);ctx.textAlign="left";}}
      }
      [[10,10],[W-10,10],[10,H-10],[W-10,H-10]].forEach(([cx,cy],i)=>{const sx2=i%2===0?1:-1,sy2=i<2?1:-1;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy+sy2*20);ctx.lineTo(cx,cy+sy2*4);ctx.lineTo(cx+sx2*20,cy+sy2*4);ctx.stroke();});
      drawRef.current=requestAnimationFrame(draw);
    };draw();return()=>cancelAnimationFrame(drawRef.current);
  },[active,color,exerciseId]);
  const pLabel=livePhase==="down"?"↓ BAJANDO":livePhase==="up"?"↑ ARRIBA":"· ESPERANDO";
  const pColor=livePhase==="down"?"#FF4D4D":livePhase==="up"?"#00C9A7":"#555";
  return(<div style={{position:"relative"}}><canvas ref={canvasRef} width={280} height={210} style={{width:"100%",borderRadius:"16px",display:"block",border:`2px solid ${repFlash?color:color+"33"}`,boxShadow:repFlash?`0 0 20px ${color}55`:"none",transition:"border-color 0.1s,box-shadow 0.1s"}}/>{onFlipCamera&&<button onClick={onFlipCamera} style={{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.6)",border:`1px solid ${color}44`,borderRadius:"8px",color:"#fff",fontSize:"16px",padding:"4px 8px",cursor:"pointer",lineHeight:1}}>{facingMode==="user"?"📷":"🤳"}</button>}<div style={{position:"absolute",bottom:"8px",left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:"8px",background:"rgba(0,0,0,0.8)",border:`1px solid ${color}44`,borderRadius:"20px",padding:"4px 12px",whiteSpace:"nowrap"}}>{liveAngle!==null&&<span style={{fontSize:"13px",fontFamily:"monospace",color:pColor,fontWeight:"bold"}}>{liveAngle}°</span>}<span style={{fontSize:"9px",letterSpacing:"2px",color:pColor}}>{status==="ACTIVO"?pLabel:status}</span>{status==="ACTIVO"&&<div style={{width:"36px",height:"5px",borderRadius:"3px",background:"rgba(255,255,255,0.1)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"3px",width:`${liveConf*100}%`,background:liveConf>0.6?"#00C9A7":liveConf>0.35?"#FFD700":"#FF4D4D",transition:"width 0.1s"}}/></div>}</div></div>);
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
function formatDate(iso){const d=new Date(iso),t=new Date(),y=new Date();y.setDate(y.getDate()-1);if(d.toDateString()===t.toDateString())return"Hoy";if(d.toDateString()===y.toDateString())return"Ayer";return d.toLocaleDateString("es-AR",{day:"numeric",month:"short"});}
function formatTime(iso){return new Date(iso).toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});}
function fmt(s){const h=Math.floor(s/3600),m=String(Math.floor((s%3600)/60)).padStart(2,"0"),sec=String(s%60).padStart(2,"0");return h>0?`${h}:${m}:${sec}`:`${m}:${sec}`;}

// Formatea fecha corta: "4-4-26"
function formatDateShort(iso){const d=new Date(iso);return`${d.getDate()}-${d.getMonth()+1}-${String(d.getFullYear()).slice(2)}`;}

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
function HistoryScreen({onBack}){
  const[history,setHistory]=useState([]);
const[mesoData,setMesoData]=useState(null);
const[mesoWeekIdx,setMesoWeekIdx]=useState(null);
const[mesoDayIdx,setMesoDayIdx]=useState(null);
const[progSource,setProgSource]=useState("program");
  const[confirmClear,setConfirmClear]=useState(false);
  const[detail,setDetail]=useState(null);
  useEffect(()=>{(async()=>{await seedFakeHistory();const h=await loadHistory();setHistory(h);})();},[]);
  const handleClear=async()=>{await clearHistory();setHistory([]);setConfirmClear(false);};
  const pbMap={};exercises.forEach(ex=>{const all=history.filter(s=>s.exerciseId===ex.id);if(all.length>0)pbMap[ex.id]=Math.max(...all.map(s=>s.totalReps));});
  const grouped=history.reduce((acc,s)=>{const l=formatDate(s.date);if(!acc[l])acc[l]=[];acc[l].push(s);return acc;},{});

  if(detail){
    const ex=exercises.find(e=>e.id===detail.exerciseId),C=ex?.color||"#FF4D4D",best=detail.sets?.length>0?Math.max(...detail.sets):0,isLibre=detail.mode==="libre";
    const fmtE=s=>{const m=String(Math.floor((s||0)/60)).padStart(2,"0"),sc=String((s||0)%60).padStart(2,"0");return`${m}:${sc}`;};
    return(<div style={{width:"100%",maxWidth:"420px"}}>
      <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",marginBottom:"24px",padding:0}}>← HISTORIAL</button>
      <div style={{textAlign:"center",marginBottom:"20px"}}>
        <div style={{fontSize:"38px",marginBottom:"4px"}}>{ex?.icon}</div>
        <div style={{fontSize:"30px",color:C,letterSpacing:"3px"}}>{ex?.name?.toUpperCase()}</div>
        <div style={{fontSize:"11px",color:"#555",marginTop:"6px"}}>{formatDate(detail.date)} · {formatTime(detail.date)}</div>
      </div>
      <div style={{textAlign:"center",background:`${C}0d`,border:`1px solid ${C}33`,borderRadius:"16px",padding:"20px",marginBottom:"14px"}}>
        <div style={{fontSize:"72px",lineHeight:1,color:C}}>{detail.totalReps}</div>
        <div style={{fontSize:"12px",letterSpacing:"5px",color:"#555"}}>REPS TOTALES</div>
      </div>
      <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>
        {(isLibre?[{v:fmtE(detail.elapsed),l:"TIEMPO"},{v:detail.totalReps,l:"REPS"},{v:detail.elapsed>0?(detail.totalReps/(detail.elapsed/60)).toFixed(1):"—",l:"REPS/MIN"}]:[{v:detail.sets.length,l:"SETS"},{v:`${detail.duration}m`,l:"DURACIÓN"},{v:best,l:"MEJOR SET"}]).map(({v,l})=>(
          <div key={l} style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${C}22`,borderRadius:"10px",padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:"18px",color:C}}>{v}</div>
            <div style={{fontSize:"8px",letterSpacing:"1px",color:"#555",fontFamily:"sans-serif"}}>{l}</div>
          </div>
        ))}
      </div>
      {!isLibre&&detail.sets.length>1&&<div style={{display:"flex",gap:"6px"}}>{detail.sets.map((r,i)=>{const p=best>0?r/best:0;return(<div key={i} style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${r===best?C:C+"33"}`,borderRadius:"10px",padding:"10px 6px",textAlign:"center",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",bottom:0,left:0,right:0,height:`${p*100}%`,background:`${C}18`}}/><div style={{position:"relative"}}><div style={{fontSize:"22px",color:r===best?C:C+"aa"}}>{r}</div><div style={{fontSize:"8px",color:"#555",fontFamily:"sans-serif"}}>S{i+1}</div></div></div>);})}</div>}
    </div>);
  }

  return(<div style={{width:"100%",maxWidth:"420px"}}>
    <div style={{display:"flex",alignItems:"center",marginBottom:"24px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:0}}>← VOLVER</button>
      <div style={{flex:1,textAlign:"center",fontSize:"22px",letterSpacing:"5px"}}>HISTORIAL</div>
      {history.length>0&&<button onClick={()=>setConfirmClear(true)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"11px",fontFamily:"sans-serif",padding:0}}>borrar</button>}
    </div>
    {confirmClear&&<div style={{background:"rgba(255,77,77,0.08)",border:"1px solid #FF4D4D44",borderRadius:"12px",padding:"16px",marginBottom:"16px",textAlign:"center"}}>
      <div style={{fontFamily:"sans-serif",fontSize:"13px",color:"#ccc",marginBottom:"12px"}}>¿Borrar todo el historial?</div>
      <div style={{display:"flex",gap:"8px"}}>
        <button onClick={()=>setConfirmClear(false)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid #333",borderRadius:"8px",color:"#888",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        <button onClick={handleClear} style={{flex:1,padding:"10px",background:"#FF4D4D",border:"none",borderRadius:"8px",color:"#000",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>BORRAR</button>
      </div>
    </div>}
    {history.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>📭</div><div style={{fontSize:"14px",letterSpacing:"4px",color:"#444"}}>SIN SESIONES AÚN</div></div>}
    <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
      {Object.entries(grouped).map(([dateLabel,sessions])=>(
        <div key={dateLabel}>
          <div style={{fontSize:"11px",letterSpacing:"4px",color:"#444",marginBottom:"8px"}}>{dateLabel.toUpperCase()}</div>
          <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
            {sessions.map((s,i)=>{const ex=exercises.find(e=>e.id===s.exerciseId),C=ex?.color||"#FF4D4D",isPB=pbMap[s.exerciseId]===s.totalReps;
              return(<button key={i} onClick={()=>setDetail(s)} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C}33`,borderRadius:"12px",padding:"12px 14px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",color:"#fff",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background=`${C}11`} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
                <span style={{fontSize:"22px"}}>{ex?.icon}</span>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"3px"}}><span style={{fontSize:"15px",letterSpacing:"2px"}}>{ex?.name?.toUpperCase()}</span>{isPB&&<span style={{fontSize:"10px",color:C}}>🏆</span>}</div>
                  <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"#444"}}>{s.mode==="libre"?`⏱ libre · ${formatTime(s.date)}`:`${s.sets.length} sets · ${formatTime(s.date)}`}</div>
                </div>
                <div style={{textAlign:"right"}}><div style={{fontSize:"26px",lineHeight:1,color:C}}>{s.totalReps}</div><div style={{fontSize:"9px",letterSpacing:"2px",color:"#555"}}>REPS</div></div>
                <span style={{fontSize:"14px",color:"#333"}}>›</span>
              </button>);
            })}
          </div>
        </div>
      ))}
    </div>
  </div>);
}

// ─── EXERCISE PICKER MODAL ────────────────────────────────────────────────────
function ExercisePicker({onSelect,onClose,title="ELEGIR EJERCICIO"}){
  const[open,setOpen]=useState(null);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{maxWidth:"420px",width:"100%",margin:"0 auto",padding:"24px 16px",minHeight:"100%"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:0}}>✕ CANCELAR</button>
          <div style={{flex:1,textAlign:"center",fontSize:"14px",letterSpacing:"4px",color:"#fff"}}>{title}</div>
        </div>
        {categories.map(cat=>(
          <div key={cat.id} style={{marginBottom:"8px"}}>
            <button onClick={()=>setOpen(open===cat.id?null:cat.id)} style={{width:"100%",background:`${cat.color}18`,border:`1px solid ${cat.color}44`,borderRadius:open===cat.id?"12px 12px 0 0":"12px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",color:"#fff",textAlign:"left"}}>
              <span style={{fontSize:"20px"}}>{cat.icon}</span>
              <span style={{fontSize:"16px",letterSpacing:"2px",color:cat.color}}>{cat.name.toUpperCase()}</span>
              <span style={{marginLeft:"auto",color:cat.color}}>{open===cat.id?"▲":"▼"}</span>
            </button>
            {open===cat.id&&<div style={{border:`1px solid ${cat.color}33`,borderTop:"none",borderRadius:"0 0 12px 12px",overflow:"hidden"}}>
              {cat.exercises.map((ex,i)=>(
                <button key={ex.id} onClick={()=>onSelect(ex)} style={{width:"100%",background:"rgba(255,255,255,0.02)",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none",border:"none",padding:"11px 16px 11px 28px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",color:"#fff",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background=`${ex.color}18`} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
                  <span style={{fontSize:"18px"}}>{ex.icon}</span>
                  <div><div style={{fontSize:"14px",letterSpacing:"2px",color:"#ddd"}}>{ex.name.toUpperCase()}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginTop:"2px"}}>{ex.desc}</div></div>
                </button>
              ))}
            </div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INFO MODAL ────────────────────────────────────────────────────────────────
function InfoModal({onClose}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px",padding:"28px 24px",maxWidth:"380px",width:"100%"}}>
        <div style={{fontSize:"22px",letterSpacing:"4px",marginBottom:"20px",textAlign:"center"}}>¿CÓMO FUNCIONA?</div>
        <div style={{display:"flex",flexDirection:"column",gap:"16px",marginBottom:"24px"}}>
          {[
            {icon:"⏱",title:"MODO LIBRE",desc:"Elegís un ejercicio y entrenás sin estructura. Ideal para sesiones cortas o cuando no querés pensar."},
            {icon:"📋",title:"PROGRAMA RÁPIDO",desc:"Armás tu semana con sesiones planificadas. La app te guía automáticamente: ejercicio → descanso → siguiente."},
            {icon:"💪",title:"SERIE NORMAL",desc:"Un ejercicio, varios sets con descanso entre ellos."},
            {icon:"⚡",title:"SUPERSERIE",desc:"2 ejercicios alternados. Trabajás más en menos tiempo."},
            {icon:"🔥",title:"SERIE GIGANTE",desc:"3 o más ejercicios encadenados. Alta intensidad."},
            {icon:"🤖",title:"IA DE POSE",desc:"La cámara detecta tus movimientos y cuenta las reps automáticamente. Podés usarla o contar manual."},
          ].map(({icon,title,desc})=>(
            <div key={title} style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
              <span style={{fontSize:"22px",flexShrink:0}}>{icon}</span>
              <div><div style={{fontSize:"12px",letterSpacing:"3px",color:"#FF4D4D",marginBottom:"3px"}}>{title}</div><div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#888",lineHeight:1.5}}>{desc}</div></div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"16px",background:"#FF4D4D",border:"none",borderRadius:"12px",fontSize:"16px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>ENTENDIDO</button>
      </div>
    </div>
  );
}

// ─── LAST SESSION POPUP ───────────────────────────────────────────────────────
// Popup que muestra la última sesión de entrenamiento
function LastSessionPopup({session,onClose}){
  if(!session)return null;
  const ex=exercises.find(e=>e.id===session.exerciseId);
  const C=ex?.color||"#FF4D4D";
  const isLibre=session.mode==="libre";
  const fmtMin=s=>{const m=Math.floor((s||0)/60);return m>0?`${m} min`:"< 1 min";};

  // Línea de resumen: "3 sets · 45 reps" o "8 min · 45 reps"
  const summary=isLibre
    ? `${fmtMin(session.elapsed)} · ${session.totalReps} reps`
    : `${session.sets?.length||0} set${(session.sets?.length||0)!==1?"s":""} · ${session.totalReps} reps`;

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
      <div style={{background:"#111",border:`1px solid ${C}44`,borderRadius:"20px",padding:"28px 24px",maxWidth:"340px",width:"100%"}}>
        <div style={{fontSize:"10px",letterSpacing:"4px",color:"#555",marginBottom:"16px",textAlign:"center"}}>ÚLTIMA SESIÓN</div>

        {/* Ejercicio */}
        <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"20px"}}>
          <span style={{fontSize:"36px"}}>{ex?.icon}</span>
          <div>
            <div style={{fontSize:"20px",letterSpacing:"2px",color:C}}>{ex?.name?.toUpperCase()}</div>
            <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555",marginTop:"3px"}}>
              {formatDateShort(session.date)} · {formatTime(session.date)}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{background:`${C}0f`,border:`1px solid ${C}33`,borderRadius:"12px",padding:"14px 16px",marginBottom:"20px",textAlign:"center"}}>
          <div style={{fontSize:"28px",letterSpacing:"1px",color:C,marginBottom:"2px"}}>{summary}</div>
          {!isLibre&&session.sets?.length>0&&(
            <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginTop:"4px"}}>
              {session.sets.map((r,i)=>`S${i+1}: ${r}`).join("  ·  ")}
            </div>
          )}
        </div>

        <button onClick={onClose} style={{width:"100%",padding:"14px",background:"#4a9eff",border:"none",borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:"#fff",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>OK</button>
      </div>
    </div>
  );
}

// ─── PROGRAM SCREEN ─────────────────────────────────────────────────────────────
function ProgramScreen({onBack,onStartSession,clipboard,setClipboard}){
  const[sessions,setSessions]=useState([]);
  const[weekPlan,setWeekPlan]=useState({});
  const[view,setView]=useState("week");
  const[editSession,setEditSession]=useState(null);
  const[showPicker,setShowPicker]=useState(null);
  const[showBlockType,setShowBlockType]=useState(false);
  const[showTypeInfo,setShowTypeInfo]=useState(null);
  const[selectedDay,setSelectedDay]=useState(null);
  const[confirmPasteDay,setConfirmPasteDay]=useState(false);
  const[copyFlash,setCopyFlash]=useState(false);
  const DIAS=["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];

  useEffect(()=>{(async()=>{const s=await loadSessions(),w=await loadWeekPlan();setSessions(s);setWeekPlan(w);})();},[]);

  const saveSes=async(updated)=>{setSessions(updated);await saveSessions(updated);};
  const saveWP=async(updated)=>{setWeekPlan(updated);await saveWeekPlan(updated);};

  const createSession=async(type)=>{
    const s={id:Date.now().toString(),name:"Nueva sesión",blocks:[{id:Date.now().toString()+"b",type,rounds:3,exercises:[],restWithin:BLOCK_TYPES[type].restWithin,restAfter:BLOCK_TYPES[type].restAfter}]};
    const updated=[...sessions,s];await saveSes(updated);setEditSession(s);setView("session_edit");setShowBlockType(false);
  };

  const assignToDay=async(dayIdx,sessionId)=>{
    const wp={...weekPlan,[dayIdx]:sessionId||null};await saveWP(wp);setSelectedDay(null);
  };

  const pasteSession=async(dayIdx)=>{
    if(!clipboard)return;
    const newBlocks=clipboard.blocks.map(b=>({...b,id:Date.now().toString()+Math.random().toString(36).slice(2),exercises:b.exercises.map(e=>({...e}))}));
    const newSes={id:Date.now().toString(),name:clipboard.name+" (copia)",blocks:newBlocks};
    const all=[...sessions,newSes];
    await saveSes(all);
    const wp={...weekPlan,[dayIdx]:newSes.id};await saveWP(wp);
    setConfirmPasteDay(false);setSelectedDay(null);
  };

  const saveEditSession=async(updated)=>{
    const all=sessions.map(s=>s.id===updated.id?updated:s);setEditSession(updated);await saveSes(all);
  };

  // ── Vista almanaque semanal ──
  if(view==="week"){
    const hoy=(new Date().getDay()+6)%7;
    return(<div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:"24px"}}>
        <button onClick={onBack} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← VOLVER</button>
        <div style={{flex:1,textAlign:"center",fontSize:"22px",letterSpacing:"5px"}}>PROGRAMA RÁPIDO</div>
        <button onClick={()=>setView("session_list")} style={{background:"none",border:"none",color:"#FF4D4D",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",fontFamily:"sans-serif",padding:0}}>SESIONES</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:"6px",marginBottom:"20px"}}>
        {DIAS.map((d,i)=>{
          const sid=weekPlan[i],ses=sessions.find(s=>s.id===sid),esHoy=i===hoy,hasSession=!!ses;
          return(<div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
            <div style={{fontSize:"9px",letterSpacing:"1px",color:esHoy?"#FF4D4D":"#555"}}>{d}</div>
            <button onClick={()=>setSelectedDay(selectedDay===i?null:i)} style={{width:"100%",aspectRatio:"1",borderRadius:"10px",border:`1px solid ${esHoy?"#FF4D4D33":hasSession?"#FF4D4D44":"rgba(255,255,255,0.07)"}`,background:selectedDay===i?"rgba(255,77,77,0.15)":hasSession?"rgba(255,77,77,0.08)":"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px",padding:"4px"}}>
              {hasSession?<><span style={{fontSize:"16px"}}>💪</span><span style={{fontSize:"7px",color:"#FF4D4D",letterSpacing:"0.5px",textAlign:"center",lineHeight:1.2}}>{ses.name.slice(0,6)}</span></>:<span style={{fontSize:"16px",color:"#333"}}>—</span>}
            </button>
            {esHoy&&<div style={{width:"5px",height:"5px",borderRadius:"50%",background:"#FF4D4D"}}/>}
          </div>);
        })}
      </div>

      {selectedDay!==null&&<div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",padding:"14px",marginBottom:"16px"}}>
        <div style={{fontSize:"11px",letterSpacing:"4px",color:"#555",marginBottom:"12px"}}>{DIAS[selectedDay]} — {weekPlan[selectedDay]?`SESIÓN ASIGNADA`:"SIN SESIÓN"}</div>
        {weekPlan[selectedDay]&&<div>
          <div style={{fontFamily:"sans-serif",fontSize:"15px",color:"#fff",marginBottom:"4px",letterSpacing:"1px"}}>SESIÓN: {sessions.find(s=>s.id===weekPlan[selectedDay])?.name}</div>
          <div style={{height:"1px",background:"rgba(255,255,255,0.1)",marginBottom:"12px"}}/>
          {sessions.find(s=>s.id===weekPlan[selectedDay])?.blocks.map((block,bi)=>{
            const bt=BLOCK_TYPES[block.type];
            const toMmSs=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
            return(<div key={bi} style={{marginBottom:"12px"}}>
              <div style={{fontSize:"11px",letterSpacing:"2px",color:bt.color,marginBottom:"6px"}}>{bt.emoji} {bt.label}</div>
              {block.exercises.map((ex,ei)=>{
                const exData=exercises.find(e=>e.id===ex.exerciseId);
                return(<div key={ei} style={{fontFamily:"sans-serif",fontSize:"11px",color:"#aaa",marginLeft:"12px",marginBottom:"3px"}}>
                  • {exData?.name}: {ex.mode==="time"?`${toMmSs(ex.duration)} × ${block.rounds} rondas`:`${block.rounds} × ${ex.targetReps||10} reps`}
                </div>);
              })}
              <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginLeft:"12px",marginTop:"4px"}}>Descanso: {block.restAfter}s</div>
            </div>);
          })}
          <button onClick={()=>{const ses=sessions.find(s=>s.id===weekPlan[selectedDay]);if(ses)onStartSession(ses);}} style={{width:"100%",padding:"14px",background:"#4caf50",border:"none",borderRadius:"10px",fontSize:"16px",letterSpacing:"4px",color:"#fff",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"6px",marginTop:"8px"}}>▶ ARRANCAR HOY</button>
          <button onClick={()=>assignToDay(selectedDay,null)} style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(255,77,77,0.3)",borderRadius:"10px",fontSize:"12px",letterSpacing:"2px",color:"#FF4D4D44",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>QUITAR</button>
        </div>}
        {!weekPlan[selectedDay]&&sessions.length===0&&<div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#555",marginBottom:"10px"}}>Todavía no tenés sesiones. Creá una primero.</div>}
        {!weekPlan[selectedDay]&&sessions.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"6px"}}>
          {sessions.map(s=><button key={s.id} onClick={()=>assignToDay(selectedDay,s.id)} style={{padding:"10px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",color:"#fff",cursor:"pointer",textAlign:"left",fontSize:"13px",letterSpacing:"1px",fontFamily:"'Bebas Neue',sans-serif"}}>{s.name}</button>)}
        </div>}
        {clipboard&&<button onClick={()=>{if(weekPlan[selectedDay])setConfirmPasteDay(true);else pasteSession(selectedDay);}} style={{width:"100%",marginTop:"8px",padding:"10px",background:"rgba(255,215,0,0.07)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"10px",fontSize:"11px",letterSpacing:"3px",color:"#FFD700",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>📋 PEGAR: {clipboard.name}</button>}
        <button onClick={()=>setShowBlockType(true)} style={{width:"100%",marginTop:"8px",padding:"10px",background:"transparent",border:"1px dashed rgba(255,255,255,0.15)",borderRadius:"10px",fontSize:"11px",letterSpacing:"3px",color:"#555",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+ CREAR SESIÓN NUEVA</button>
      </div>}

      {selectedDay===null&&<button onClick={()=>setShowBlockType(true)} style={{width:"100%",padding:"16px",background:"transparent",border:"1px dashed rgba(255,255,255,0.15)",borderRadius:"14px",fontSize:"13px",letterSpacing:"3px",color:"#555",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+ CREAR SESIÓN</button>}

      {confirmPasteDay&&selectedDay!==null&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:"#111",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"20px",padding:"28px 24px",maxWidth:"340px",width:"100%"}}>
          <div style={{fontSize:"28px",textAlign:"center",marginBottom:"12px"}}>📋</div>
          <div style={{fontSize:"14px",letterSpacing:"3px",textAlign:"center",marginBottom:"8px"}}>REEMPLAZAR SESIÓN</div>
          <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#888",textAlign:"center",marginBottom:"20px"}}>Este día ya tiene una sesión asignada. ¿Querés reemplazarla con la copia de "{clipboard?.name}"?</div>
          <button onClick={()=>pasteSession(selectedDay)} style={{width:"100%",padding:"14px",background:"#FFD700",border:"none",borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>SÍ, REEMPLAZAR</button>
          <button onClick={()=>setConfirmPasteDay(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#555",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        </div>
      </div>}

      {showBlockType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:"420px",background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",padding:"24px 16px"}}>
          <div style={{fontSize:"14px",letterSpacing:"4px",marginBottom:"6px",textAlign:"center"}}>TIPO DE SESIÓN</div>
          <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555",textAlign:"center",marginBottom:"20px"}}>Tocá el ⓘ para saber más</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
            {Object.entries(BLOCK_TYPES).map(([k,bt])=>(
              <div key={k} style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <button onClick={()=>createSession(k)} style={{flex:1,padding:"14px 16px",background:`${bt.color}18`,border:`1px solid ${bt.color}44`,borderRadius:"12px",color:bt.color,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"2px"}}>
                  <span style={{fontSize:"22px"}}>{bt.emoji}</span>{bt.label}
                </button>
                <button onClick={()=>setShowTypeInfo(k)} style={{width:"36px",height:"36px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",color:"#888",cursor:"pointer",fontSize:"14px",flexShrink:0}}>ⓘ</button>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowBlockType(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        </div>
      </div>}

      {showTypeInfo&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:250,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
        <div style={{background:"#111",border:`1px solid ${BLOCK_TYPES[showTypeInfo].color}44`,borderRadius:"20px",padding:"28px 24px",maxWidth:"360px",width:"100%"}}>
          <div style={{fontSize:"36px",textAlign:"center",marginBottom:"12px"}}>{BLOCK_TYPES[showTypeInfo].emoji}</div>
          <div style={{fontSize:"18px",letterSpacing:"3px",color:BLOCK_TYPES[showTypeInfo].color,textAlign:"center",marginBottom:"12px"}}>{BLOCK_TYPES[showTypeInfo].label}</div>
          <div style={{fontFamily:"sans-serif",fontSize:"13px",color:"#aaa",lineHeight:1.6,textAlign:"center",marginBottom:"8px"}}>{BLOCK_TYPES[showTypeInfo].desc}</div>
          <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555",textAlign:"center",marginBottom:"20px"}}>Descanso sugerido entre bloques: <span style={{color:BLOCK_TYPES[showTypeInfo].color}}>{BLOCK_TYPES[showTypeInfo].restAfter}s</span></div>
          <button onClick={()=>setShowTypeInfo(null)} style={{width:"100%",padding:"14px",background:BLOCK_TYPES[showTypeInfo].color,border:"none",borderRadius:"12px",fontSize:"16px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>OK</button>
        </div>
      </div>}
    </div>);
  }

  // ── Vista lista de sesiones ──
  if(view==="session_list"){
    return(<div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:"24px"}}>
        <button onClick={()=>setView("week")} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← SEMANA</button>
        <div style={{flex:1,textAlign:"center",fontSize:"18px",letterSpacing:"4px"}}>MIS SESIONES</div>
        <button onClick={()=>setShowBlockType(true)} style={{background:"none",border:"none",color:"#FF4D4D",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",fontFamily:"sans-serif",padding:0}}>+ NUEVA</button>
      </div>
      {sessions.length===0&&<div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>📋</div><div style={{fontSize:"14px",letterSpacing:"4px",color:"#444"}}>SIN SESIONES AÚN</div><div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#333",marginTop:"8px"}}>Creá tu primera sesión arriba</div></div>}
      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {sessions.map(ses=>{
          const blockCount=ses.blocks.length,exCount=ses.blocks.reduce((a,b)=>a+b.exercises.length,0);
          return(<div key={ses.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"14px",padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",marginBottom:"8px"}}>
              <div style={{flex:1}}><div style={{fontSize:"18px",letterSpacing:"2px"}}>{ses.name}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginTop:"2px"}}>{blockCount} bloque{blockCount!==1?"s":""} · {exCount} ejercicio{exCount!==1?"s":""}</div></div>
 <button onClick={(e)=>{e.stopPropagation();setEditSession(ses);setView("session_edit");}} style={{background:"none",border:"1px solid rgba(255,255,255,0.1)",color:"#555",cursor:"pointer",fontSize:"18px",padding:"6px 10px",borderRadius:"8px",lineHeight:1}}>✏️</button>
              <button onClick={async()=>{const updated=sessions.filter(s=>s.id!==ses.id);await saveSes(updated);}} style={{background:"none",border:"none",color:"#333",cursor:"pointer",fontSize:"16px",padding:"4px"}}>🗑</button>
            </div>
            <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
              {ses.blocks.map((b,bi)=>{const bt=BLOCK_TYPES[b.type];return(<div key={bi} style={{background:`${bt.color}18`,border:`1px solid ${bt.color}33`,borderRadius:"8px",padding:"3px 8px",fontSize:"9px",letterSpacing:"1px",color:bt.color}}>{bt.emoji} {bt.label}</div>);})}</div>
          </div>);
        })}
      </div>
      {showBlockType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:"420px",background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",padding:"24px 16px"}}>
          <div style={{fontSize:"14px",letterSpacing:"4px",marginBottom:"20px",textAlign:"center"}}>TIPO DE SESIÓN</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
            {Object.entries(BLOCK_TYPES).map(([k,bt])=>(<button key={k} onClick={()=>createSession(k)} style={{padding:"14px 16px",background:`${bt.color}18`,border:`1px solid ${bt.color}44`,borderRadius:"12px",color:bt.color,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"2px"}}><span style={{fontSize:"22px"}}>{bt.emoji}</span>{bt.label}</button>))}
          </div>
          <button onClick={()=>setShowBlockType(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        </div>
      </div>}
    </div>);
  }

  // ── Vista editor de sesión ──
  if(view==="session_edit"&&editSession){
    const ses=editSession;
    const updateName=async(name)=>{ const u={...ses,name}; await saveEditSession(u); };
    const addBlock=async(type)=>{const b={id:Date.now().toString(),type,rounds:3,exercises:[],restWithin:BLOCK_TYPES[type].restWithin,restAfter:BLOCK_TYPES[type].restAfter};const u={...ses,blocks:[...ses.blocks,b]};await saveEditSession(u);};
    const removeBlock=async(bi)=>{const u={...ses,blocks:ses.blocks.filter((_,i)=>i!==bi)};await saveEditSession(u);};
    const updateBlock=async(bi,field,val)=>{const b=[...ses.blocks];b[bi]={...b[bi],[field]:val};const u={...ses,blocks:b};await saveEditSession(u);};
    const addExToBlock=async(bi,ex)=>{const b=[...ses.blocks];const bt=BLOCK_TYPES[b[bi].type];if(b[bi].exercises.length>=bt.maxEx)return;const def=exerciseDefaults[ex.id]||{duration:120,sets:3};b[bi].exercises=[...b[bi].exercises,{exerciseId:ex.id,duration:def.duration,mode:"time"}];const u={...ses,blocks:b};await saveEditSession(u);setShowPicker(null);};
    const removeExFromBlock=async(bi,ei)=>{const b=[...ses.blocks];b[bi].exercises=b[bi].exercises.filter((_,i)=>i!==ei);const u={...ses,blocks:b};await saveEditSession(u);};
    const updateEx=async(bi,ei,field,val)=>{const b=[...ses.blocks];b[bi].exercises[ei]={...b[bi].exercises[ei],[field]:val};const u={...ses,blocks:b};await saveEditSession(u);};
    const toMmSs=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

    return(<div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>
        <button onClick={()=>setView("session_list")} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← SESIONES</button>
        <div style={{flex:1,textAlign:"center",fontSize:"14px",letterSpacing:"4px"}}>EDITAR SESIÓN</div>
        <button onClick={()=>{setClipboard({blocks:ses.blocks,name:ses.name});setCopyFlash(true);setTimeout(()=>setCopyFlash(false),1500);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"20px",padding:"0 4px",opacity:copyFlash?1:0.5,transition:"opacity 0.3s"}} title="Copiar sesión">{copyFlash?"✅":"📋"}</button>
      </div>

      <input value={ses.name} onChange={e=>updateName(e.target.value)} placeholder="Nombre de la sesión"
        style={{width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:"12px",color:"#fff",fontSize:"18px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"2px",outline:"none",boxSizing:"border-box",marginBottom:"20px"}}/>

      {ses.blocks.map((block,bi)=>{
        const bt=BLOCK_TYPES[block.type];
        return(<div key={block.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${bt.color}33`,borderRadius:"14px",padding:"14px",marginBottom:"12px"}}>
          <div style={{display:"flex",alignItems:"center",marginBottom:"12px"}}>
            <span style={{fontSize:"18px",marginRight:"8px"}}>{bt.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:"13px",letterSpacing:"2px",color:bt.color}}>{bt.label}</div></div>
            <button onClick={()=>removeBlock(bi)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"16px",padding:"0 4px"}}>✕</button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
            <div style={{fontSize:"9px",letterSpacing:"3px",color:"#555",width:"60px"}}>RONDAS</div>
            <button onClick={()=>updateBlock(bi,"rounds",Math.max(1,block.rounds-1))} style={{width:"32px",height:"32px",borderRadius:"8px",border:`1px solid ${bt.color}44`,background:"transparent",color:bt.color,fontSize:"16px",cursor:"pointer"}}>−</button>
            <div style={{flex:1,textAlign:"center",fontSize:"20px",color:bt.color}}>{block.rounds}</div>
            <button onClick={()=>updateBlock(bi,"rounds",block.rounds+1)} style={{width:"32px",height:"32px",borderRadius:"8px",border:`1px solid ${bt.color}44`,background:"transparent",color:bt.color,fontSize:"16px",cursor:"pointer"}}>+</button>
          </div>
          {block.exercises.map((ex,ei)=>{
            const exData=exercises.find(e=>e.id===ex.exerciseId);
            return(<div key={ei} style={{background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"10px",marginBottom:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                <span style={{fontSize:"18px"}}>{exData?.icon}</span>
                <div style={{flex:1,fontSize:"13px",letterSpacing:"1px",color:exData?.color||"#fff"}}>{exData?.name?.toUpperCase()}</div>
                <button onClick={()=>removeExFromBlock(bi,ei)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"14px",padding:0}}>✕</button>
              </div>
              <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
                {["time","reps"].map(m=><button key={m} onClick={()=>updateEx(bi,ei,"mode",m)} style={{flex:1,padding:"6px",background:ex.mode===m?`${bt.color}33`:"transparent",border:`1px solid ${ex.mode===m?bt.color+"66":"rgba(255,255,255,0.1)"}`,borderRadius:"6px",color:ex.mode===m?bt.color:"#555",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>{m==="time"?"⏱ TIEMPO":"🔢 REPS"}</button>)}
              </div>
              {ex.mode==="time"&&<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <button onClick={()=>updateEx(bi,ei,"duration",Math.max(15,ex.duration-15))} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>−</button>
                <div style={{flex:1,textAlign:"center",fontSize:"16px",color:"#fff"}}>{toMmSs(ex.duration)}</div>
                <button onClick={()=>updateEx(bi,ei,"duration",ex.duration+15)} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>+</button>
              </div>}
              {ex.mode==="reps"&&<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                <button onClick={()=>updateEx(bi,ei,"targetReps",Math.max(1,(ex.targetReps||10)-1))} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>−</button>
                <div style={{flex:1,textAlign:"center",fontSize:"16px",color:"#fff"}}>{ex.targetReps||10} <span style={{fontSize:"11px",color:"#555"}}>reps</span></div>
                <button onClick={()=>updateEx(bi,ei,"targetReps",(ex.targetReps||10)+1)} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>+</button>
              </div>}
            </div>);
          })}
          {block.exercises.length<bt.maxEx&&<button onClick={()=>setShowPicker({bi})} style={{width:"100%",padding:"10px",background:"transparent",border:`1px dashed ${bt.color}44`,borderRadius:"10px",color:bt.color+"88",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>+ AGREGAR EJERCICIO {block.type==="superset"?`(${block.exercises.length}/2)`:block.type==="normal"?"(1/1)":`(${block.exercises.length}/${bt.maxEx})`}</button>}
          <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"10px"}}>
            <div style={{fontSize:"8px",letterSpacing:"3px",color:"#444",flex:1}}>DESCANSO TRAS BLOQUE</div>
            <button onClick={()=>updateBlock(bi,"restAfter",Math.max(15,block.restAfter-15))} style={{width:"28px",height:"28px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"12px",cursor:"pointer"}}>−</button>
            <div style={{fontSize:"14px",color:"#fff",minWidth:"36px",textAlign:"center"}}>{block.restAfter}s</div>
            <button onClick={()=>updateBlock(bi,"restAfter",block.restAfter+15)} style={{width:"28px",height:"28px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"12px",cursor:"pointer"}}>+</button>
          </div>
        </div>);
      })}

      <button onClick={()=>setShowBlockType(true)} style={{width:"100%",padding:"14px",background:"transparent",border:"1px dashed rgba(255,255,255,0.15)",borderRadius:"12px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"12px"}}>+ AGREGAR BLOQUE</button>

      <button onClick={()=>onStartSession(ses)} disabled={ses.blocks.some(b=>b.exercises.length===0)} style={{width:"100%",padding:"18px",background:ses.blocks.some(b=>b.exercises.length===0)?"rgba(255,255,255,0.05)":"#FF4D4D",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:ses.blocks.some(b=>b.exercises.length===0)?"#333":"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>▶ ARRANCAR SESIÓN</button>

      {/* ✅ FIX: ahora va a session_list, no a week — evita pérdida de bloques */}
      <button onClick={()=>setView("session_list")} style={{width:"100%",marginTop:"10px",padding:"12px",background:"#4a9eff",border:"none",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#fff",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>← PROGRAMA RÁPIDO</button>

      {showBlockType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:"420px",background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",padding:"24px 16px"}}>
          <div style={{fontSize:"14px",letterSpacing:"4px",marginBottom:"20px",textAlign:"center"}}>TIPO DE BLOQUE</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
            {Object.entries(BLOCK_TYPES).map(([k,bt])=>(<button key={k} onClick={()=>{addBlock(k);setShowBlockType(false);}} style={{padding:"14px 16px",background:`${bt.color}18`,border:`1px solid ${bt.color}44`,borderRadius:"12px",color:bt.color,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"2px"}}><span style={{fontSize:"22px"}}>{bt.emoji}</span><div><div>{bt.label}</div><div style={{fontFamily:"sans-serif",fontSize:"9px",color:bt.color+"88",fontWeight:"normal",marginTop:"2px"}}>{bt.desc.slice(0,50)}...</div></div></button>))}
          </div>
          <button onClick={()=>setShowBlockType(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        </div>
      </div>}

      {showPicker&&<ExercisePicker onSelect={(ex)=>addExToBlock(showPicker.bi,ex)} onClose={()=>setShowPicker(null)}/>}
    </div>);
  }

  return null;
}

// ─── CATEGORY ITEM (libre_select) ────────────────────────────────────────────
function CategoryItem({cat,onSelect}){
  const[open,setOpen]=useState(false);
  return(
    <div>
      <button onClick={()=>setOpen(!open)} style={{width:"100%",background:open?`${cat.color}18`:"rgba(255,255,255,0.04)",border:`1px solid ${cat.color}${open?"88":"33"}`,borderRadius:open?"14px 14px 0 0":"14px",padding:"14px 18px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",color:"#fff",transition:"all 0.2s"}}>
        <span style={{fontSize:"24px"}}>{cat.icon}</span>
        <div style={{flex:1,textAlign:"left"}}><div style={{fontSize:"20px",letterSpacing:"3px",color:open?cat.color:"#fff"}}>{cat.name.toUpperCase()}</div></div>
        <span style={{fontSize:"16px",color:open?cat.color:"#444",transform:open?"rotate(90deg)":"rotate(0deg)",display:"inline-block",transition:"transform 0.2s"}}>›</span>
      </button>
      {open&&<div style={{border:`1px solid ${cat.color}33`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
        {cat.exercises.map((ex,i)=>(
          <button key={ex.id} onClick={()=>onSelect(ex)} style={{width:"100%",background:"rgba(255,255,255,0.02)",borderTop:i>0?"1px solid rgba(255,255,255,0.05)":"none",border:"none",padding:"12px 18px 12px 28px",display:"flex",alignItems:"center",gap:"12px",cursor:"pointer",color:"#fff",textAlign:"left"}} onMouseEnter={e=>e.currentTarget.style.background=`${ex.color}18`} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.02)"}>
            <span style={{fontSize:"20px"}}>{ex.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:"16px",letterSpacing:"2px",color:"#ddd"}}>{ex.name.toUpperCase()}</div><div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginTop:"2px"}}>{ex.desc}</div></div>
            <div style={{width:"7px",height:"7px",borderRadius:"50%",background:ex.color,boxShadow:`0 0 6px ${ex.color}`,flexShrink:0}}/>
          </button>
        ))}
      </div>}
    </div>
  );
}

// ─── PROG PREP SCREEN ────────────────────────────────────────────────────────
function ProgPrepScreen({activeSession,progBlockIdx,progRoundIdx,onReady}){
  const block=activeSession.blocks[progBlockIdx];
  const bt=BLOCK_TYPES[block?.type||"normal"];
  const ex=block?.exercises[0];
  const exData=exercises.find(e=>e.id===ex?.exerciseId);
  const[prepCount,setPrepCount]=useState(5);
  useEffect(()=>{
    if(prepCount<=0){onReady();return;}
    if(prepCount<=3)playBeep("warning");
    const t=setTimeout(()=>setPrepCount(n=>n-1),1000);
    return()=>clearTimeout(t);
  },[prepCount]);
  return(<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
    <div style={{fontSize:"11px",letterSpacing:"4px",color:"#555",marginBottom:"6px"}}>BLOQUE {progBlockIdx+1} · RONDA {progRoundIdx+1}/{block?.rounds}</div>
    <div style={{fontSize:"14px",letterSpacing:"3px",color:bt.color,marginBottom:"24px"}}>{bt.emoji} {bt.label}</div>
    <div style={{fontSize:"60px",marginBottom:"12px"}}>{exData?.icon||"💪"}</div>
    <div style={{fontSize:"26px",letterSpacing:"3px",color:"#fff",marginBottom:"6px"}}>{exData?.name?.toUpperCase()}</div>
    <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#555",marginBottom:"32px"}}>{ex?.mode==="reps"?`${ex?.targetReps||10} reps`:fmt(ex?.duration||120)}</div>
    <div style={{fontSize:"72px",color:bt.color,fontFamily:"'DSEG7 Classic',monospace",textShadow:`0 0 30px ${bt.color}88`,lineHeight:1,marginBottom:"16px"}}>{prepCount}</div>
    <div style={{fontSize:"11px",letterSpacing:"4px",color:"#444"}}>PREPARATE</div>
  </div>);
}

// ─── PAUSE OVERLAY ────────────────────────────────────────────────────────────
function PauseOverlay({onResume,onSkip,onAbandon,setRestLeft,restLeft,isRest}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",gap:"16px"}}>
      <div style={{fontSize:"32px",letterSpacing:"4px",marginBottom:"8px"}}>⏸ PAUSADO</div>
      {isRest&&<>
        <div style={{fontFamily:"sans-serif",fontSize:"13px",color:"#888",marginBottom:"8px"}}>Ajustar descanso</div>
        <div style={{display:"flex",gap:"12px"}}>
          <button onClick={()=>setRestLeft(r=>Math.max(3,r-15))} style={{padding:"12px 24px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"16px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>−15s</button>
          <button onClick={()=>setRestLeft(r=>r+15)} style={{padding:"12px 24px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"16px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+15s</button>
        </div>
      </>}
      <button onClick={onResume} style={{width:"100%",maxWidth:"300px",padding:"18px",background:"#00C9A7",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>▶ CONTINUAR</button>
      <button onClick={onSkip} style={{width:"100%",maxWidth:"300px",padding:"14px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:"#888",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>⏭ SALTAR</button>
      <button onClick={onAbandon} style={{width:"100%",maxWidth:"300px",padding:"12px",background:"transparent",border:"1px solid rgba(255,77,77,0.3)",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#FF4D4D44",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>✕ ABANDONAR</button>
    </div>
  );
}
// ─── CYCLE CREATOR SCREEN ────────────────────────────────────────────────────
function CycleCreatorScreen({onBack,onCreate}){
  const[step,setStep]=useState(1);
  const[cycleName,setCycleName]=useState("");
  const[workWeeks,setWorkWeeks]=useState(6);

  const handleCreate=()=>{
    const totalWeeks=workWeeks+1;
    const newMeso={
      cycle:{
        id:Date.now().toString(),
        name:cycleName.trim()||"Mi Mesociclo",
        totalWeeks,
        createdAt:new Date().toISOString(),
        weeks:Array.from({length:totalWeeks},(_,i)=>({
          weekNumber:i+1,
          isDeload:i===totalWeeks-1,
          days:{0:null,1:null,2:null,3:null,4:null,5:null,6:null},
          completedDays:{0:false,1:false,2:false,3:false,4:false,5:false,6:false}
        }))
      },
      sessions:{}
    };
    onCreate(newMeso);
  };

  if(step===1)return(
    <div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"24px"}}>
        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#FFD700"}}/>
        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"rgba(255,255,255,0.15)"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",marginBottom:"28px"}}>
        <button onClick={onBack} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← VOLVER</button>
        <div style={{flex:1,textAlign:"center",fontSize:"20px",letterSpacing:"4px"}}>NUEVO MESOCICLO</div>
      </div>
      <div style={{marginBottom:"24px"}}>
        <div style={{fontSize:"10px",letterSpacing:"4px",color:"#555",marginBottom:"8px"}}>NOMBRE DEL CICLO</div>
        <input value={cycleName} onChange={e=>setCycleName(e.target.value)} placeholder="Ej: Fuerza Enero"
          style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"12px",color:"#fff",fontSize:"18px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"2px",outline:"none",boxSizing:"border-box"}}/>
      </div>
      <div style={{marginBottom:"32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}}>
          <div style={{fontSize:"10px",letterSpacing:"4px",color:"#555"}}>DURACIÓN</div>
          <div style={{fontSize:"11px",color:"#FFD700",letterSpacing:"2px"}}>{workWeeks} + 1 SEMANAS</div>
        </div>
        <input type="range" min="3" max="13" value={workWeeks} onChange={e=>setWorkWeeks(Number(e.target.value))}
          style={{width:"100%",accentColor:"#FFD700",marginBottom:"12px"}}/>
        <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
          <div style={{fontSize:"15px",letterSpacing:"2px",color:"#FFD700",marginBottom:"4px"}}>{workWeeks} sem. de trabajo · 1 sem. de descarga 😴</div>
          <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555"}}>{workWeeks+1} semanas en total</div>
        </div>
      </div>
      <button onClick={()=>setStep(2)} disabled={!cycleName.trim()}
        style={{width:"100%",padding:"18px",background:cycleName.trim()?"#FFD700":"rgba(255,215,0,0.1)",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:cycleName.trim()?"#000":"#444",cursor:cycleName.trim()?"pointer":"default",fontFamily:"'Bebas Neue',sans-serif"}}>
        SIGUIENTE →
      </button>
    </div>
  );

  return(
    <div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",justifyContent:"center",gap:"8px",marginBottom:"24px"}}>
        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"rgba(255,215,0,0.35)"}}/>
        <div style={{width:"10px",height:"10px",borderRadius:"50%",background:"#FFD700"}}/>
      </div>
      <div style={{display:"flex",alignItems:"center",marginBottom:"28px"}}>
        <button onClick={()=>setStep(1)} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← ATRÁS</button>
        <div style={{flex:1,textAlign:"center",fontSize:"20px",letterSpacing:"4px"}}>CONFIRMAR</div>
      </div>
      <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.4)",borderRadius:"16px",padding:"28px 24px",marginBottom:"24px",textAlign:"center"}}>
        <div style={{fontSize:"36px",marginBottom:"12px"}}>📅</div>
        <div style={{fontSize:"28px",letterSpacing:"3px",color:"#FFD700",marginBottom:"12px"}}>{cycleName}</div>
        <div style={{fontFamily:"sans-serif",fontSize:"13px",color:"#aaa",marginBottom:"4px"}}>{workWeeks} semanas de trabajo</div>
        <div style={{fontFamily:"sans-serif",fontSize:"13px",color:"#888",marginBottom:"16px"}}>+ 1 semana de descarga 😴</div>
        <div style={{height:"1px",background:"rgba(255,215,0,0.15)",marginBottom:"12px"}}/>
        <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555"}}>{workWeeks+1} semanas en total</div>
      </div>
      <button onClick={handleCreate} style={{width:"100%",padding:"18px",background:"#FFD700",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"10px"}}>✓ CREAR MESOCICLO</button>
      <button onClick={onBack} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#555",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
    </div>
  );
}

// ─── MESO SCREEN ──────────────────────────────────────────────────────────────
function MesoScreen({onBack,onStartSession,mesoData,onMesoUpdate}){
  const DIAS=["L","M","M","J","V","S","D"];
  const[selectedCell,setSelectedCell]=useState(null);
  const[view,setView]=useState("almanac");
  const[editSession,setEditSession]=useState(null);
  const[showPicker,setShowPicker]=useState(null);
  const[showBlockType,setShowBlockType]=useState(false);

  const sessions=Object.values(mesoData?.sessions||{});
  const toMmSs=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const persistMeso=async(updated)=>{await saveMeso(updated);onMesoUpdate(updated);};

  const assignDay=async(weekIdx,dayIdx,sessionId)=>{
    const u=JSON.parse(JSON.stringify(mesoData));
    u.cycle.weeks[weekIdx].days[dayIdx]=sessionId||null;
    await persistMeso(u);setSelectedCell(null);
  };

  const createSession=async(type)=>{
    const s={id:Date.now().toString(),name:"Nueva sesión",blocks:[{id:Date.now().toString()+"b",type,rounds:3,exercises:[],restWithin:BLOCK_TYPES[type].restWithin,restAfter:BLOCK_TYPES[type].restAfter}]};
    const u={...mesoData,sessions:{...mesoData.sessions,[s.id]:s}};
    await persistMeso(u);setEditSession(s);setShowBlockType(false);setView("session_edit");
  };

  const saveEditSession=async(upd)=>{
    const u={...mesoData,sessions:{...mesoData.sessions,[upd.id]:upd}};
    setEditSession(upd);await persistMeso(u);
  };

  const addBlock=async(type)=>{
    if(!editSession)return;
    const b={id:Date.now().toString(),type,rounds:3,exercises:[],restWithin:BLOCK_TYPES[type].restWithin,restAfter:BLOCK_TYPES[type].restAfter};
    await saveEditSession({...editSession,blocks:[...editSession.blocks,b]});
    setShowBlockType(false);
  };
  const removeBlock=async(bi)=>{if(!editSession)return;await saveEditSession({...editSession,blocks:editSession.blocks.filter((_,i)=>i!==bi)});};
  const updateBlock=async(bi,field,val)=>{if(!editSession)return;const b=[...editSession.blocks];b[bi]={...b[bi],[field]:val};await saveEditSession({...editSession,blocks:b});};
  const addExToBlock=async(bi,ex)=>{
    if(!editSession)return;
    const b=[...editSession.blocks];const bt=BLOCK_TYPES[b[bi].type];
    if(b[bi].exercises.length>=bt.maxEx)return;
    const def=exerciseDefaults[ex.id]||{duration:120};
    b[bi].exercises=[...b[bi].exercises,{exerciseId:ex.id,duration:def.duration,mode:"time"}];
    await saveEditSession({...editSession,blocks:b});setShowPicker(null);
  };
  const removeExFromBlock=async(bi,ei)=>{if(!editSession)return;const b=[...editSession.blocks];b[bi].exercises=b[bi].exercises.filter((_,i)=>i!==ei);await saveEditSession({...editSession,blocks:b});};
  const updateEx=async(bi,ei,field,val)=>{if(!editSession)return;const b=[...editSession.blocks];b[bi].exercises[ei]={...b[bi].exercises[ei],[field]:val};await saveEditSession({...editSession,blocks:b});};

  // ── Vista editor de sesión ──
  if(view==="session_edit"&&editSession){
    const ses=editSession;
    return(
      <div style={{width:"100%",maxWidth:"420px"}}>
        <div style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>
          <button onClick={()=>setView("almanac")} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← MESOCICLO</button>
          <div style={{flex:1,textAlign:"center",fontSize:"14px",letterSpacing:"4px"}}>EDITAR SESIÓN</div>
        </div>
        <input value={ses.name} onChange={e=>saveEditSession({...ses,name:e.target.value})} placeholder="Nombre de la sesión"
          style={{width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"12px",color:"#fff",fontSize:"18px",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:"2px",outline:"none",boxSizing:"border-box",marginBottom:"20px"}}/>
        {ses.blocks.map((block,bi)=>{
          const bt=BLOCK_TYPES[block.type];
          return(
            <div key={block.id} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${bt.color}33`,borderRadius:"14px",padding:"14px",marginBottom:"12px"}}>
              <div style={{display:"flex",alignItems:"center",marginBottom:"12px"}}>
                <span style={{fontSize:"18px",marginRight:"8px"}}>{bt.emoji}</span>
                <div style={{flex:1,fontSize:"13px",letterSpacing:"2px",color:bt.color}}>{bt.label}</div>
                <button onClick={()=>removeBlock(bi)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"16px",padding:"0 4px"}}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"10px"}}>
                <div style={{fontSize:"9px",letterSpacing:"3px",color:"#555",width:"60px"}}>RONDAS</div>
                <button onClick={()=>updateBlock(bi,"rounds",Math.max(1,block.rounds-1))} style={{width:"32px",height:"32px",borderRadius:"8px",border:`1px solid ${bt.color}44`,background:"transparent",color:bt.color,fontSize:"16px",cursor:"pointer"}}>−</button>
                <div style={{flex:1,textAlign:"center",fontSize:"20px",color:bt.color}}>{block.rounds}</div>
                <button onClick={()=>updateBlock(bi,"rounds",block.rounds+1)} style={{width:"32px",height:"32px",borderRadius:"8px",border:`1px solid ${bt.color}44`,background:"transparent",color:bt.color,fontSize:"16px",cursor:"pointer"}}>+</button>
              </div>
              {block.exercises.map((ex,ei)=>{
                const exData=exercises.find(e=>e.id===ex.exerciseId);
                return(
                  <div key={ei} style={{background:"rgba(255,255,255,0.04)",borderRadius:"10px",padding:"10px",marginBottom:"8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"8px"}}>
                      <span style={{fontSize:"18px"}}>{exData?.icon}</span>
                      <div style={{flex:1,fontSize:"13px",letterSpacing:"1px",color:exData?.color||"#fff"}}>{exData?.name?.toUpperCase()}</div>
                      <button onClick={()=>removeExFromBlock(bi,ei)} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:"14px",padding:0}}>✕</button>
                    </div>
                    <div style={{display:"flex",gap:"6px",marginBottom:"8px"}}>
                      {["time","reps"].map(m=><button key={m} onClick={()=>updateEx(bi,ei,"mode",m)} style={{flex:1,padding:"6px",background:ex.mode===m?`${bt.color}33`:"transparent",border:`1px solid ${ex.mode===m?bt.color+"66":"rgba(255,255,255,0.1)"}`,borderRadius:"6px",color:ex.mode===m?bt.color:"#555",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>{m==="time"?"⏱ TIEMPO":"🔢 REPS"}</button>)}
                    </div>
                    {ex.mode==="time"&&<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <button onClick={()=>updateEx(bi,ei,"duration",Math.max(15,ex.duration-15))} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>−</button>
                      <div style={{flex:1,textAlign:"center",fontSize:"16px",color:"#fff"}}>{toMmSs(ex.duration)}</div>
                      <button onClick={()=>updateEx(bi,ei,"duration",ex.duration+15)} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>+</button>
                    </div>}
                    {ex.mode==="reps"&&<div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                      <button onClick={()=>updateEx(bi,ei,"targetReps",Math.max(1,(ex.targetReps||10)-1))} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>−</button>
                      <div style={{flex:1,textAlign:"center",fontSize:"16px",color:"#fff"}}>{ex.targetReps||10} <span style={{fontSize:"11px",color:"#555"}}>reps</span></div>
                      <button onClick={()=>updateEx(bi,ei,"targetReps",(ex.targetReps||10)+1)} style={{width:"30px",height:"30px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"14px",cursor:"pointer"}}>+</button>
                    </div>}
                  </div>
                );
              })}
              {block.exercises.length<bt.maxEx&&<button onClick={()=>setShowPicker({bi})} style={{width:"100%",padding:"10px",background:"transparent",border:`1px dashed ${bt.color}44`,borderRadius:"10px",color:bt.color+"88",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>+ AGREGAR EJERCICIO</button>}
              <div style={{display:"flex",alignItems:"center",gap:"8px",marginTop:"10px",borderTop:"1px solid rgba(255,255,255,0.06)",paddingTop:"10px"}}>
                <div style={{fontSize:"8px",letterSpacing:"3px",color:"#444",flex:1}}>DESCANSO TRAS BLOQUE</div>
                <button onClick={()=>updateBlock(bi,"restAfter",Math.max(15,block.restAfter-15))} style={{width:"28px",height:"28px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"12px",cursor:"pointer"}}>−</button>
                <div style={{fontSize:"14px",color:"#fff",minWidth:"36px",textAlign:"center"}}>{block.restAfter}s</div>
                <button onClick={()=>updateBlock(bi,"restAfter",block.restAfter+15)} style={{width:"28px",height:"28px",borderRadius:"6px",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"#888",fontSize:"12px",cursor:"pointer"}}>+</button>
              </div>
            </div>
          );
        })}
        <button onClick={()=>setShowBlockType(true)} style={{width:"100%",padding:"14px",background:"transparent",border:"1px dashed rgba(255,255,255,0.15)",borderRadius:"12px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"12px"}}>+ AGREGAR BLOQUE</button>
        <button onClick={()=>onStartSession(ses,selectedCell?.weekIdx,selectedCell?.dayIdx)}
          disabled={ses.blocks.some(b=>b.exercises.length===0)}
          style={{width:"100%",padding:"18px",background:ses.blocks.some(b=>b.exercises.length===0)?"rgba(255,255,255,0.05)":"#FFD700",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:ses.blocks.some(b=>b.exercises.length===0)?"#333":"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"10px"}}>▶ ARRANCAR SESIÓN</button>
        <button onClick={()=>setView("almanac")} style={{width:"100%",padding:"12px",background:"#4a9eff",border:"none",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#fff",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>← MESOCICLO</button>
        {showBlockType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div style={{width:"100%",maxWidth:"420px",background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",padding:"24px 16px"}}>
            <div style={{fontSize:"14px",letterSpacing:"4px",marginBottom:"20px",textAlign:"center"}}>TIPO DE BLOQUE</div>
            <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
              {Object.entries(BLOCK_TYPES).map(([k,bt])=>(<button key={k} onClick={()=>addBlock(k)} style={{padding:"14px 16px",background:`${bt.color}18`,border:`1px solid ${bt.color}44`,borderRadius:"12px",color:bt.color,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"2px"}}><span style={{fontSize:"22px"}}>{bt.emoji}</span>{bt.label}</button>))}
            </div>
            <button onClick={()=>setShowBlockType(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
          </div>
        </div>}
        {showPicker&&<ExercisePicker onSelect={(ex)=>addExToBlock(showPicker.bi,ex)} onClose={()=>setShowPicker(null)}/>}
      </div>
    );
  }

  // ── Vista almanaque ──
  if(!mesoData||!mesoData.cycle)return null;
  const{cycle}=mesoData;
  const selWeek=selectedCell?cycle.weeks[selectedCell.weekIdx]:null;
  const selSid=selWeek?selWeek.days[selectedCell.dayIdx]:null;
  const selSession=selSid?mesoData.sessions[selSid]:null;

  return(
    <div style={{width:"100%",maxWidth:"420px"}}>
      <div style={{display:"flex",alignItems:"center",marginBottom:"20px"}}>
        <button onClick={onBack} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← VOLVER</button>
        <div style={{flex:1,textAlign:"center"}}>
          <div style={{fontSize:"18px",letterSpacing:"4px",color:"#FFD700"}}>{cycle.name.toUpperCase()}</div>
          <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginTop:"2px"}}>📅 MESOCICLO · {cycle.totalWeeks} semanas</div>
        </div>
      </div>

      {/* Header días */}
      <div style={{display:"grid",gridTemplateColumns:"40px repeat(7,1fr)",gap:"4px",marginBottom:"6px"}}>
        <div/>
        {DIAS.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:"9px",letterSpacing:"1px",color:"#444"}}>{d}</div>)}
      </div>

      {/* Grilla scrolleable */}
      <div style={{maxHeight:"320px",overflowY:"auto",marginBottom:"16px",paddingRight:"2px"}}>
        {cycle.weeks.map((week,wi)=>(
          <div key={wi} style={{display:"grid",gridTemplateColumns:"40px repeat(7,1fr)",gap:"4px",marginBottom:"4px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontSize:week.isDeload?"14px":"8px",color:week.isDeload?"#FFD700":"#444",textAlign:"center",lineHeight:1}}>
                {week.isDeload?"😴":`S${week.weekNumber}`}
              </div>
            </div>
            {[0,1,2,3,4,5,6].map(di=>{
              const sid=week.days[di];
              const done=week.completedDays[di];
              const isSelected=selectedCell?.weekIdx===wi&&selectedCell?.dayIdx===di;
              let emoji="─",fg="#333",bg="rgba(255,255,255,0.02)",border="rgba(255,255,255,0.06)";
              if(done){emoji="✓";fg="#4a9eff";bg="rgba(74,158,255,0.1)";border="rgba(74,158,255,0.3)";}
              else if(sid&&week.isDeload){emoji="😴";fg="#FFD700";bg="rgba(255,215,0,0.06)";border="rgba(255,215,0,0.2)";}
              else if(sid){emoji="🏋";bg="rgba(255,215,0,0.06)";border="rgba(255,215,0,0.2)";}
              if(isSelected){bg="rgba(255,215,0,0.18)";border="#FFD700";}
              return(
                <button key={di} onClick={()=>setSelectedCell(isSelected?null:{weekIdx:wi,dayIdx:di})}
                  style={{aspectRatio:"1",borderRadius:"8px",border:`1px solid ${border}`,background:bg,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:sid||done?"14px":"10px",color:fg,transition:"all 0.15s",padding:0}}>
                  {emoji}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Panel día seleccionado */}
      {selectedCell&&<div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${selSession?"rgba(255,215,0,0.35)":"rgba(255,255,255,0.1)"}`,borderRadius:"16px",padding:"16px",marginBottom:"16px"}}>
        <div style={{fontSize:"10px",letterSpacing:"4px",color:"#555",marginBottom:"12px"}}>
          {["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"][selectedCell.dayIdx]} · SEM {selectedCell.weekIdx+1}
          {selWeek?.isDeload&&<span style={{color:"#FFD700"}}> · 😴 DESCARGA</span>}
        </div>
        {selSession?(<>
          <div style={{fontSize:"18px",letterSpacing:"2px",color:"#FFD700",marginBottom:"4px"}}>{selSession.name}</div>
          <div style={{fontFamily:"sans-serif",fontSize:"10px",color:"#555",marginBottom:"12px"}}>
            {selSession.blocks.flatMap(b=>b.exercises.map(e=>exercises.find(ex=>ex.id===e.exerciseId)?.name)).filter(Boolean).join(" · ")}
          </div>
          <button onClick={()=>onStartSession(selSession,selectedCell.weekIdx,selectedCell.dayIdx)}
            style={{width:"100%",padding:"14px",background:"#FFD700",border:"none",borderRadius:"10px",fontSize:"16px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"6px"}}>▶ ARRANCAR</button>
          <button onClick={()=>{setEditSession(selSession);setView("session_edit");}}
            style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"10px",fontSize:"12px",letterSpacing:"2px",color:"#FFD700",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"6px"}}>✏️ EDITAR SESIÓN</button>
          <button onClick={()=>assignDay(selectedCell.weekIdx,selectedCell.dayIdx,null)}
            style={{width:"100%",padding:"10px",background:"transparent",border:"1px solid rgba(255,77,77,0.2)",borderRadius:"10px",fontSize:"11px",letterSpacing:"2px",color:"rgba(255,77,77,0.45)",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>✕ QUITAR SESIÓN</button>
        </>):(
          <>
            {sessions.length>0&&<div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"10px"}}>
              <div style={{fontSize:"9px",letterSpacing:"3px",color:"#444",marginBottom:"4px"}}>TUS SESIONES</div>
              {sessions.map(s=><button key={s.id} onClick={()=>assignDay(selectedCell.weekIdx,selectedCell.dayIdx,s.id)}
                style={{padding:"10px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"10px",color:"#fff",cursor:"pointer",textAlign:"left",fontSize:"13px",letterSpacing:"1px",fontFamily:"'Bebas Neue',sans-serif"}}>{s.name}</button>)}
            </div>}
            <button onClick={()=>setShowBlockType(true)}
              style={{width:"100%",padding:"12px",background:"transparent",border:"1px dashed rgba(255,215,0,0.3)",borderRadius:"10px",fontSize:"12px",letterSpacing:"3px",color:"#FFD700",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+ CREAR SESIÓN NUEVA</button>
          </>
        )}
      </div>}

      {!selectedCell&&<button onClick={()=>setShowBlockType(true)}
        style={{width:"100%",padding:"14px",background:"transparent",border:"1px dashed rgba(255,215,0,0.2)",borderRadius:"14px",fontSize:"13px",letterSpacing:"3px",color:"rgba(255,215,0,0.6)",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>
        + CREAR SESIÓN
      </button>}

      {showBlockType&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:"420px",background:"#111",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"20px 20px 0 0",padding:"24px 16px"}}>
          <div style={{fontSize:"14px",letterSpacing:"4px",marginBottom:"20px",textAlign:"center"}}>TIPO DE SESIÓN</div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"16px"}}>
            {Object.entries(BLOCK_TYPES).map(([k,bt])=>(<button key={k} onClick={()=>createSession(k)} style={{padding:"14px 16px",background:`${bt.color}18`,border:`1px solid ${bt.color}44`,borderRadius:"12px",color:bt.color,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"10px",fontFamily:"'Bebas Neue',sans-serif",fontSize:"16px",letterSpacing:"2px"}}><span style={{fontSize:"22px"}}>{bt.emoji}</span>{bt.label}</button>))}
          </div>
          <button onClick={()=>setShowBlockType(false)} style={{width:"100%",padding:"12px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#555",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
        </div>
      </div>}
    </div>
  );
}

// ─── MESO DONE SCREEN ─────────────────────────────────────────────────────────
function MesoDoneScreen({session,weekNumber,progDoneLog,onRepeat,onBack,onUnmark}){
  const[confirmUnmark,setConfirmUnmark]=useState(false);
  const totalReps=progDoneLog.reduce((a,b)=>a+b.reps,0);
  return(
    <div style={{width:"100%",maxWidth:"420px",textAlign:"center"}}>
      <div style={{fontSize:"13px",letterSpacing:"6px",color:"#FFD700",marginBottom:"6px"}}>SESIÓN COMPLETADA 🎉</div>
      <div style={{fontSize:"20px",letterSpacing:"3px",marginBottom:"4px"}}>{session?.name?.toUpperCase()}</div>
      <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555",marginBottom:"20px"}}>Semana {weekNumber}</div>
      <div style={{background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.3)",borderRadius:"14px",padding:"16px",marginBottom:"16px"}}>
        <div style={{fontSize:"11px",letterSpacing:"4px",color:"#555",marginBottom:"4px"}}>TOTAL REPS</div>
        <div style={{fontSize:"72px",lineHeight:1,color:"#FFD700",textShadow:"0 0 40px #FFD70088"}}>{totalReps}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"16px"}}>
        {progDoneLog.map((item,i)=>{
          const ex=exercises.find(e=>e.id===item.exerciseId);
          const Cx=ex?.color||"#FFD700";
          return(<div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${Cx}33`,borderRadius:"12px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px"}}>
            <span style={{fontSize:"20px"}}>{ex?.icon}</span>
            <div style={{flex:1,textAlign:"left",fontSize:"14px",letterSpacing:"2px",color:Cx}}>{ex?.name?.toUpperCase()}</div>
            <div style={{textAlign:"right"}}><div style={{fontSize:"28px",color:Cx,lineHeight:1}}>{item.reps}</div><div style={{fontSize:"8px",color:"#555",letterSpacing:"2px"}}>REPS</div></div>
          </div>);
        })}
      </div>
      <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(74,158,255,0.12)",border:"1px solid rgba(74,158,255,0.4)",borderRadius:"20px",padding:"6px 16px",marginBottom:"20px"}}>
        <span style={{fontSize:"12px"}}>✅</span>
        <span style={{fontSize:"11px",letterSpacing:"3px",color:"#4a9eff"}}>DÍA MARCADO COMPLETO</span>
      </div>
      <button onClick={onRepeat} style={{width:"100%",padding:"18px",background:"#FFD700",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>REPETIR SESIÓN</button>
      <button onClick={onBack} style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"14px",letterSpacing:"3px",color:"#777",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"16px"}}>← VOLVER AL MESOCICLO</button>
      {confirmUnmark
        ?<div style={{background:"rgba(255,77,77,0.08)",border:"1px solid rgba(255,77,77,0.3)",borderRadius:"12px",padding:"14px"}}>
          <div style={{fontFamily:"sans-serif",fontSize:"12px",color:"#ccc",marginBottom:"10px"}}>¿Seguro que querés desmarcar este día?</div>
          <div style={{display:"flex",gap:"8px"}}>
            <button onClick={()=>setConfirmUnmark(false)} style={{flex:1,padding:"10px",background:"rgba(255,255,255,0.05)",border:"1px solid #333",borderRadius:"8px",color:"#888",cursor:"pointer",fontSize:"13px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>CANCELAR</button>
            <button onClick={onUnmark} style={{flex:1,padding:"10px",background:"#FF4D4D",border:"none",borderRadius:"8px",color:"#000",cursor:"pointer",fontSize:"13px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>DESMARCAR</button>
          </div>
        </div>
        :<button onClick={()=>setConfirmUnmark(true)} style={{padding:"6px 16px",background:"transparent",border:"1px solid rgba(255,77,77,0.2)",borderRadius:"20px",fontSize:"10px",letterSpacing:"2px",color:"rgba(255,77,77,0.45)",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>desmarcar día</button>}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function RepCountApp(){
  const[screen,setScreen]=useState("home");
  const[showInfo,setShowInfo]=useState(false);
  const[paused,setPaused]=useState(false);

  // ── LIBRE ──
  const[selected,setSelected]=useState(null);
  const[mode,setMode]=useState("series");
  const[seriesMode,setSeriesMode]=useState("time");
  const[duration,setDuration]=useState(120);
  const[totalSets,setTotalSets]=useState(3);
  const[restDuration,setRestDuration]=useState(60);
  const[repsPerSet,setRepsPerSet]=useState(10);
  const[repGoal,setRepGoal]=useState(0);
  const[currentSet,setCurrentSet]=useState(1);
  const[reps,setReps]=useState(0);
  const[setRepsLog,setSetRepsLog]=useState([]);
  const[activeStep,setActiveStep]=useState(0);
  const[animating,setAnimating]=useState(false);
  const[timeLeft,setTimeLeft]=useState(0);
  const[elapsed,setElapsed]=useState(0);
  const[restLeft,setRestLeft]=useState(0);
  const[goalReached,setGoalReached]=useState(false);
  const[sessionSaved,setSessionSaved]=useState(false);
  const[lastSession,setLastSession]=useState(null);
  const[currentPR,setCurrentPR]=useState(0);
  const historicalPRRef=useRef(0),prShownRef=useRef(false);
  const[prBroken,setPrBroken]=useState(false);
  const[countdownLeft,setCountdownLeft]=useState(5);
  const[poseActive,setPoseActive]=useState(false);
  const[poseReady,setPoseReady]=useState(true);
  const[holdPhase,setHoldPhase]=useState(null);
  const holdPhaseRef=useRef(null);
  const[facingMode,setFacingMode]=useState("user");
  const[cameraKey,setCameraKey]=useState(0);
  const[showFireworks,setShowFireworks]=useState(false);
  useEffect(()=>{holdPhaseRef.current=holdPhase;},[holdPhase]);

  // ── CLIPBOARD ──
  const[clipboard,setClipboard]=useState(null);

  // ── HISTORIAL: desde dónde se abrió ──
  const[historyFrom,setHistoryFrom]=useState("home");
  const[mesoData,setMesoData]=useState(null);
  const[mesoWeekIdx,setMesoWeekIdx]=useState(null);
  const[mesoDayIdx,setMesoDayIdx]=useState(null);
  const[progSource,setProgSource]=useState("program");

  // ── POPUP ÚLTIMA SESIÓN (libre_select) ──
  const[libreLastSession,setLibreLastSession]=useState(null);
  const[showLastPopup,setShowLastPopup]=useState(false);

  // Cargar última sesión al entrar a libre_select
  useEffect(()=>{
    if(screen!=="libre_select")return;
    (async()=>{
      const h=await loadHistory();
      if(h.length>0)setLibreLastSession(h[0]);
      else setLibreLastSession(null);
    })();
  },[screen]);

  // ── PROGRAMA ──
  const[activeSession,setActiveSession]=useState(null);
  const[progBlockIdx,setProgBlockIdx]=useState(0);
  const[progRoundIdx,setProgRoundIdx]=useState(0);
  const[progExIdx,setProgExIdx]=useState(0);
  const[progReps,setProgReps]=useState(0);
  const[progSets,setProgSets]=useState([]);
  const[progRestLeft,setProgRestLeft]=useState(0);
  const[progIsRestWithin,setProgIsRestWithin]=useState(false);
  const[progDoneLog,setProgDoneLog]=useState([]);

  const timerRef=useRef(null),spinRef=useRef(null);

  const[particles]=useState(()=>Array.from({length:24},(_,i)=>({id:i,angle:(i/24)*360,distance:80+Math.random()*120,color:["#FF4D4D","#FFD700","#00C9A7","#6C63FF","#FF8C00","#00BFFF"][i%6],size:4+Math.random()*6})));

  useEffect(()=>{seedFakeHistory();},[]);
  useEffect(()=>{(async()=>{const m=await loadMeso();setMesoData(m);})();},[]);

  const C=selected?.color||"#FF4D4D";
  const fmtM=(s)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const isHold=!!exercises.find(e=>e.id===selected?.id)?.holdMode;
  const pct=screen==="counting"?seriesMode==="reps"?(reps/repsPerSet)*100:((duration-timeLeft)/duration)*100:screen==="rest"?((restDuration-restLeft)/restDuration)*100:100;
  const grandTotal=setRepsLog.reduce((a,b)=>a+b,0);

  const resetAll=()=>{
    clearInterval(timerRef.current);cancelAnimationFrame(spinRef.current);
    setScreen("home");setSelected(null);setReps(0);setTimeLeft(0);setElapsed(0);
    setSetRepsLog([]);setCurrentSet(1);setShowFireworks(false);setSessionSaved(false);
    setGoalReached(false);setPoseActive(false);setPoseReady(true);setHoldPhase(null);
    setPaused(false);setActiveSession(null);setProgBlockIdx(0);setProgRoundIdx(0);
    setProgExIdx(0);setProgReps(0);setProgSets([]);setProgDoneLog([]);
  };

  const selectExercise=async(ex)=>{
    setSelected(ex);setReps(0);setActiveStep(0);setSetRepsLog([]);setPrBroken(false);prShownRef.current=false;
    const def=exerciseDefaults[ex.id];if(def){setTotalSets(def.sets);setDuration(def.duration);setRestDuration(def.rest);}
    const prs=await loadPRs(),pr=prs[ex.id]||0;setCurrentPR(pr);historicalPRRef.current=pr;
    const h=await loadHistory();const prev=h.find(s=>s.exerciseId===ex.id)||null;setLastSession(prev);
  };

  const startSession=()=>{setReps(0);setActiveStep(0);setGoalReached(false);setSessionSaved(false);setCountdownLeft(5);setScreen("countdown");};

  const launchSession=()=>{
    setPoseReady(false);setPoseActive(true);
    if(mode==="libre"){setElapsed(0);setScreen("libre");}
    else if(seriesMode==="reps"){setCurrentSet(1);setSetRepsLog([]);setScreen("counting");}
    else{setTimeLeft(duration);setCurrentSet(1);setSetRepsLog([]);setScreen("counting");}
    playBeep("go");
  };

  const simulateRep=()=>{
    if(animating)return;setAnimating(true);
    const steps=exerciseSteps[selected?.id]||[""];let step=0;
    const iv=setInterval(()=>{
      step++;setActiveStep(step%steps.length);
      if(step>=steps.length){
        clearInterval(iv);
        setReps(r=>{
          const nr=r+1;
          if(repGoal>0&&nr===repGoal&&!goalReached){setGoalReached(true);playBeep("goal");}
          if(historicalPRRef.current>0&&nr>historicalPRRef.current&&!prShownRef.current){prShownRef.current=true;setPrBroken(true);setTimeout(()=>setPrBroken(false),3000);}
          if(seriesMode==="reps"&&nr>=repsPerSet){setTimeout(()=>{setSetRepsLog(log=>{const nl=[...log,nr];setCurrentSet(cs=>{if(cs>=totalSets){setScreen("finished");playBeep("victory");}else{setRestLeft(restDuration);setScreen("rest");playBeep("whistle");}return cs;});return nl;});setReps(0);setActiveStep(0);},400);}
          return nr;
        });
        setActiveStep(0);setAnimating(false);
      }
    },300);
  };

  const progSimulateRep=()=>{
    if(!activeSession)return;
    const block=activeSession.blocks[progBlockIdx];
    const ex=block?.exercises[progExIdx];
    setProgReps(r=>{
      const nr=r+1;
      if(ex?.mode==="reps"&&nr>=(ex?.targetReps||10)){
        setTimeout(()=>finishProgExercise(nr),400);
      }
      return nr;
    });
    playBeep("rep");
  };

  // ── COUNTDOWN ──
  useEffect(()=>{
    if(screen!=="countdown")return;
    if(countdownLeft<=0){launchSession();return;}
    if(countdownLeft<=3)playBeep(countdownLeft===1?"whistle":"warning");
    const t=setTimeout(()=>setCountdownLeft(n=>n-1),1000);
    return()=>clearTimeout(t);
  },[screen,countdownLeft]);

  useEffect(()=>{if(screen==="countdown"||screen==="prog_prep")preloadMoveNetScripts();},[screen]);

  // ── TIMER LIBRE ──
  useEffect(()=>{
    if(screen!=="libre")return;
    timerRef.current=setInterval(()=>{if(isHold&&poseActive&&holdPhaseRef.current!=="up")return;setElapsed(t=>t+1);},1000);
    return()=>clearInterval(timerRef.current);
  },[screen,poseActive]);

  // ── TIMER COUNTING ──
  useEffect(()=>{
    if(screen!=="counting")return;
    if(seriesMode==="reps")return;
    if(poseActive&&!poseReady)return;
    if(paused)return;
    if(isHold){
      timerRef.current=setInterval(()=>{if(holdPhaseRef.current!=="up")return;setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setReps(cr=>{setSetRepsLog(log=>{const nl=[...log,cr+1];setCurrentSet(cs=>{if(cs>=totalSets){setScreen("finished");playBeep("victory");}else{setRestLeft(restDuration);setScreen("rest");playBeep("ready");}return cs;});return nl;});return cr;});return 0;}if(t===6)playBeep("warning");return t-1;});},1000);
    }else{
      timerRef.current=setInterval(()=>{setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);setReps(cr=>{setSetRepsLog(log=>{const nl=[...log,cr];setCurrentSet(cs=>{if(cs>=totalSets){setScreen("finished");playBeep("victory");}else{setRestLeft(restDuration);setScreen("rest");playBeep("whistle");}return cs;});return nl;});return cr;});return 0;}if(t===6)playBeep("warning");return t-1;});},1000);
    }
    return()=>clearInterval(timerRef.current);
  },[screen,seriesMode,totalSets,restDuration,duration,poseActive,poseReady,paused]);

  // ── TIMER REST ──
  useEffect(()=>{
    if(screen!=="rest")return;
    if(paused)return;
    let rp=false;
    timerRef.current=setInterval(()=>{setRestLeft(t=>{if(t<=1){clearInterval(timerRef.current);setCurrentSet(cs=>cs+1);setReps(0);setActiveStep(0);setTimeLeft(duration);setCameraKey(k=>k+1);setPoseReady(false);setScreen("counting");playBeep("go");return 0;}if(t===4&&!rp){rp=true;playBeep("ready");}return t-1;});},1000);
    return()=>clearInterval(timerRef.current);
  },[screen,duration,paused]);

  // ── TIMER PROGRAMA — DESCANSO ──
  useEffect(()=>{
    if(screen!=="prog_rest")return;
    if(paused)return;
    timerRef.current=setInterval(()=>{setProgRestLeft(t=>{if(t<=1){clearInterval(timerRef.current);advanceProgram();return 0;}if(t===4)playBeep("ready");return t-1;});},1000);
    return()=>clearInterval(timerRef.current);
  },[screen,paused]);

  // ── TIMER PROGRAMA — EJERCICIO ──
  useEffect(()=>{
    if(screen!=="prog_counting")return;
    if(paused)return;
    if(!activeSession)return;
    const block=activeSession.blocks[progBlockIdx];if(!block)return;
    const ex=block.exercises[progExIdx];if(!ex)return;
    if(ex.mode==="reps")return;
    timerRef.current=setInterval(()=>{setTimeLeft(t=>{if(t<=1){clearInterval(timerRef.current);finishProgExercise();return 0;}if(t===6)playBeep("warning");return t-1;});},1000);
    return()=>clearInterval(timerRef.current);
  },[screen,paused,progBlockIdx,progExIdx,activeSession]);

  // ── FIREWORKS ──
  useEffect(()=>{
    if(screen!=="finished"&&screen!=="prog_done")return;
    setShowFireworks(true);const t=setTimeout(()=>setShowFireworks(false),2500);
    return()=>clearTimeout(t);
  },[screen]);
  // ── MARCAR DÍA MESO ──
  useEffect(()=>{
    if(screen!=="prog_done"||progSource!=="meso")return;
    if(mesoWeekIdx===null||mesoDayIdx===null){setScreen("meso_done");return;}
    (async()=>{
      const u=JSON.parse(JSON.stringify(mesoData));
      u.cycle.weeks[mesoWeekIdx].completedDays[mesoDayIdx]=true;
      await saveMeso(u);setMesoData(u);setScreen("meso_done");
    })();
  },[screen,progSource]);

  // ── SAVE libre/series ──
  useEffect(()=>{
    if(screen!=="finished"||sessionSaved||!selected)return;
    setSessionSaved(true);
    if(mode==="libre"){const s={id:Date.now().toString(),date:new Date().toISOString(),exerciseId:selected.id,totalReps:reps,sets:[reps],duration:Math.ceil(elapsed/60),rest:0,mode:"libre",elapsed};saveSession(s);if(reps>currentPR)savePR(selected.id,reps);}
    else{setSetRepsLog(log=>{const total=log.reduce((a,b)=>a+b,0);const s={id:Date.now().toString(),date:new Date().toISOString(),exerciseId:selected.id,totalReps:total,sets:log,duration,rest:restDuration,mode:"series"};saveSession(s);if(total>currentPR)savePR(selected.id,total);return log;});}
  },[screen]);

  // ── LÓGICA PROGRAMA ──
  const startProgram=(session,source="program")=>{
    setProgSource(source);
    setActiveSession(session);setProgBlockIdx(0);setProgRoundIdx(0);setProgExIdx(0);
    setProgReps(0);setProgSets([]);setProgDoneLog([]);setPaused(false);
    setScreen("prog_prep");
  };

  const startMesoSession=(session,weekIdx,dayIdx)=>{
    setMesoWeekIdx(weekIdx??null);setMesoDayIdx(dayIdx??null);
    startProgram(session,"meso");
  };

  const finishProgExercise=(finalReps)=>{
    if(!activeSession)return;
    const block=activeSession.blocks[progBlockIdx];
    const ex=block.exercises[progExIdx];
    setProgDoneLog(log=>[...log,{exerciseId:ex.exerciseId,reps:finalReps!==undefined?finalReps:progReps}]);
    setProgReps(0);

    const isSuperset=block.type==="superset"||block.type==="giantset";
    const nextExIdx=progExIdx+1;

    if(isSuperset&&nextExIdx<block.exercises.length){
      setProgExIdx(nextExIdx);
      if(block.restWithin>0){setProgRestLeft(block.restWithin);setProgIsRestWithin(true);setScreen("prog_rest");}
      else{const nextEx=block.exercises[nextExIdx];setTimeLeft(nextEx.duration||120);setScreen("prog_counting");}
    }else{
      const nextRound=progRoundIdx+1;
      if(nextRound<block.rounds){
        setProgRoundIdx(nextRound);setProgExIdx(0);
        setProgRestLeft(restDuration);setProgIsRestWithin(false);setScreen("prog_rest");
      }else{
        const nextBlock=progBlockIdx+1;
        if(nextBlock<activeSession.blocks.length){
          setProgBlockIdx(nextBlock);setProgRoundIdx(0);setProgExIdx(0);
          setProgRestLeft(block.restAfter);setProgIsRestWithin(false);setScreen("prog_rest");
        }else{
          setScreen("prog_done");playBeep("victory");
        }
      }
    }
  };

  const advanceProgram=()=>{
    if(!activeSession)return;
    const block=activeSession.blocks[progBlockIdx];
    const ex=block.exercises[progExIdx];
    setScreen("prog_counting");
    setTimeLeft(ex.duration||120);
    setPoseActive(true);setPoseReady(false);
    playBeep("go");
  };

  // ── SCREENS ──────────────────────────────────────────────────────────────────

  if(screen==="meso_creator")return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",overflow:"hidden"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <CycleCreatorScreen onBack={()=>setScreen("home")} onCreate={async(newMeso)=>{await saveMeso(newMeso);setMesoData(newMeso);setScreen("meso");}}/>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );

  if(screen==="meso")return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",overflow:"hidden"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <MesoScreen onBack={()=>setScreen("home")} onStartSession={startMesoSession} mesoData={mesoData} onMesoUpdate={(u)=>setMesoData(u)}/>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );

  if(screen==="meso_done")return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",overflow:"hidden"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>
        <MesoDoneScreen
          session={activeSession}
          weekNumber={mesoWeekIdx!==null?mesoWeekIdx+1:null}
          progDoneLog={progDoneLog}
          onRepeat={()=>startMesoSession(activeSession,mesoWeekIdx,mesoDayIdx)}
          onBack={()=>{resetAll();setScreen("meso");}}
          onUnmark={async()=>{
            if(mesoWeekIdx===null||mesoDayIdx===null)return;
            const u=JSON.parse(JSON.stringify(mesoData));
            u.cycle.weeks[mesoWeekIdx].completedDays[mesoDayIdx]=false;
            await saveMeso(u);setMesoData(u);resetAll();setScreen("meso");
          }}
        />
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );

  if(screen==="history")return(<div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"40px 20px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:"-100px",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",background:"radial-gradient(circle, #FF4D4D22 0%, transparent 70%)",pointerEvents:"none"}}/><HistoryScreen onBack={()=>{setScreen(historyFrom);setHistoryFrom("home");}}/><style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style></div>);

  if(screen==="program")return(<div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px",overflow:"hidden"}}><div style={{width:"100%",maxWidth:"420px"}}><ProgramScreen onBack={()=>setScreen("home")} onStartSession={(ses)=>{startProgram(ses);}} clipboard={clipboard} setClipboard={setClipboard}/></div><style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style></div>);

  // ── LIBRE SELECT ──
  // ✅ Botón volver celeste + popup última sesión + botón historial
  if(screen==="libre_select")return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 20px"}}>
      <div style={{width:"100%",maxWidth:"420px"}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"center",marginBottom:"24px"}}>
          <button onClick={()=>setScreen("home")} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← VOLVER</button>
          <div style={{flex:1,textAlign:"center",fontSize:"22px",letterSpacing:"5px"}}>ELEGIR EJERCICIO</div>
        </div>

        {/* Selector de modo */}
        <div style={{display:"flex",gap:"8px",marginBottom:"24px"}}>
          {[{id:"series",label:"📋 SERIES",desc:"Sets + descanso + tiempo"},{id:"libre",label:"⏱ LIBRE",desc:"Cronómetro libre"}].map(m=>{
            const active=mode===m.id;
            return(<button key={m.id} onClick={()=>setMode(m.id)} style={{flex:1,padding:"12px 10px",background:active?"#FF4D4D":"rgba(255,255,255,0.03)",border:`1px solid ${active?"#FF4D4D":"rgba(255,255,255,0.07)"}`,borderRadius:"12px",cursor:"pointer",transition:"all 0.2s",textAlign:"center"}}>
              <div style={{fontSize:"14px",letterSpacing:"2px",color:active?"#000":"#555",fontFamily:"'Bebas Neue',sans-serif"}}>{m.label}</div>
              <div style={{fontFamily:"sans-serif",fontSize:"9px",color:active?"#00000077":"#333",marginTop:"3px"}}>{m.desc}</div>
            </button>);
          })}
        </div>

        {/* Categorías */}
        <div style={{display:"flex",flexDirection:"column",gap:"10px",marginBottom:"20px"}}>
          {categories.map(cat=><CategoryItem key={cat.id} cat={cat} onSelect={async(ex)=>{await selectExercise(ex);setScreen("setup");}}/>)}
        </div>

        {/* Botones inferiores: Última sesión + Historial */}
        <div style={{display:"flex",gap:"8px",marginTop:"4px"}}>
          <button
            onClick={()=>setShowLastPopup(true)}
            disabled={!libreLastSession}
            style={{flex:1,padding:"12px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:libreLastSession?"#aaa":"#333",cursor:libreLastSession?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            <span style={{fontSize:"14px"}}>📋</span>
            <span style={{fontSize:"11px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>ÚLTIMA SESIÓN</span>
          </button>
          <button
            onClick={()=>{setHistoryFrom("libre_select");setScreen("history");}}
            style={{flex:1,padding:"12px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#aaa",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}>
            <span style={{fontSize:"14px"}}>📊</span>
            <span style={{fontSize:"11px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>HISTORIAL</span>
          </button>
        </div>
      </div>

      {/* Popup última sesión */}
      {showLastPopup&&libreLastSession&&(
        <LastSessionPopup session={libreLastSession} onClose={()=>setShowLastPopup(false)}/>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#0A0A0F",fontFamily:"'Bebas Neue','Arial Black',sans-serif",color:"#fff",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"-100px",left:"50%",transform:"translateX(-50%)",width:"600px",height:"600px",background:`radial-gradient(circle, ${C}22 0%, transparent 70%)`,pointerEvents:"none",transition:"background 0.5s"}}/>

      {prBroken&&<div style={{position:"fixed",top:"20px",left:"50%",transform:"translateX(-50%)",zIndex:999,background:"linear-gradient(135deg,#FFD700,#FF8C00)",borderRadius:"30px",padding:"8px 20px",display:"flex",alignItems:"center",gap:"8px",boxShadow:"0 0 30px #FFD70088",animation:"prPop 0.4s ease-out"}}><span style={{fontSize:"18px"}}>🏆</span><span style={{fontSize:"14px",letterSpacing:"3px",color:"#000",fontFamily:"'Bebas Neue',sans-serif"}}>NUEVO RECORD · {reps} REPS</span></div>}

      {/* ── HOME ── */}
      {screen==="home"&&<div style={{width:"100%",maxWidth:"420px",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"32px"}}>
          <div style={{fontSize:"32px",letterSpacing:"6px",textShadow:"0 0 30px #FF4D4D66"}}>REP<span style={{color:"#FF4D4D",textShadow:"0 0 20px #FF4D4D"}}>COUNT</span></div>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{fontSize:"9px",letterSpacing:"2px",color:"#FF4D4D",background:"rgba(255,77,77,0.12)",border:"1px solid rgba(255,77,77,0.3)",borderRadius:"20px",padding:"4px 10px"}}>AI POWERED</div>
            <button onClick={()=>setShowInfo(true)} style={{width:"32px",height:"32px",borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#666",cursor:"pointer",fontSize:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>ⓘ</button>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginBottom:"16px"}}>
          <button onClick={()=>setScreen("libre_select")} style={{padding:"24px 20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"16px",color:"#fff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"16px",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}>
            <span style={{fontSize:"36px"}}>⏱</span>
            <div><div style={{fontSize:"22px",letterSpacing:"4px"}}>MODO LIBRE</div><div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555",marginTop:"4px"}}>Elegís un ejercicio y entrenás sin estructura</div></div>
            <span style={{marginLeft:"auto",fontSize:"20px",color:"#444"}}>›</span>
          </button>
          <button onClick={()=>setScreen("program")} style={{padding:"24px 20px",background:"rgba(255,77,77,0.08)",border:"1px solid rgba(255,77,77,0.25)",borderRadius:"16px",color:"#fff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"16px",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,77,77,0.14)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,77,77,0.08)"}>
            <span style={{fontSize:"36px"}}>📋</span>
            <div><div style={{fontSize:"22px",letterSpacing:"4px",color:"#FF4D4D"}}>PROGRAMA RÁPIDO</div><div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#888",marginTop:"4px"}}>Sesiones planificadas · La app te guía sola</div></div>
            <span style={{marginLeft:"auto",fontSize:"20px",color:"#FF4D4D44"}}>›</span>
          </button>
        <button onClick={()=>setScreen(mesoData?"meso":"meso_creator")} style={{padding:"24px 20px",background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.25)",borderRadius:"16px",color:"#fff",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:"16px",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,215,0,0.14)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,215,0,0.08)"}>
            <span style={{fontSize:"36px"}}>📅</span>
            <div><div style={{fontSize:"22px",letterSpacing:"4px",color:"#FFD700"}}>MESOCICLO</div><div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#888",marginTop:"4px"}}>{mesoData?`${mesoData.cycle.name} · ${mesoData.cycle.totalWeeks} semanas`:"Ciclo multi-semana con progresión"}</div></div>
            <span style={{marginLeft:"auto",fontSize:"20px",color:"rgba(255,215,0,0.44)"}}>›</span>
          </button>
        </div>
        <button onClick={()=>setScreen("history")} style={{width:"100%",padding:"12px 16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",display:"flex",alignItems:"center",gap:"10px",cursor:"pointer",color:"#fff"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
          <span style={{fontSize:"16px"}}>📊</span>
          <div style={{fontSize:"13px",letterSpacing:"3px",color:"#666"}}>HISTORIAL</div>
          <span style={{fontSize:"12px",color:"#333",marginLeft:"auto"}}>›</span>
        </button>
      </div>}

      {/* ── SETUP ── */}
      {screen==="setup"&&selected&&(<div style={{width:"100%",maxWidth:"420px",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          {/* ✅ Botón volver celeste en setup */}
          <button onClick={()=>setScreen("libre_select")} style={{background:"#4a9eff",border:"none",color:"#fff",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",padding:"8px 14px",borderRadius:"8px"}}>← VOLVER</button>
          <div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{fontSize:"22px"}}>{selected.icon}</span><span style={{fontSize:"20px",color:C,letterSpacing:"2px"}}>{selected.name.toUpperCase()}</span></div>
          <div style={{fontFamily:"sans-serif",fontSize:"9px",color:"#444",letterSpacing:"2px"}}>{mode==="libre"?"LIBRE":"SERIES"}</div>
        </div>
        {lastSession&&lastSession.exerciseId===selected.id&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px",padding:"8px 12px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C}22`,borderRadius:"10px"}}>
          <div style={{fontFamily:"sans-serif",fontSize:"11px",color:"#555"}}>Última vez: <span style={{color:"#888"}}>{lastSession.sets.length} sets · {lastSession.totalReps} reps</span></div>
          <button onClick={()=>{setDuration(lastSession.duration);setTotalSets(lastSession.sets.length);setRestDuration(lastSession.rest);}} style={{padding:"4px 10px",background:"transparent",border:`1px solid ${C}44`,borderRadius:"6px",color:C,cursor:"pointer",fontSize:"10px",letterSpacing:"2px",fontFamily:"'Bebas Neue',sans-serif"}}>↩ USAR</button>
        </div>}
        {mode==="series"&&<div style={{display:"flex",gap:"6px",marginBottom:"16px"}}>
          {[{id:"time",label:"TIEMPO",icon:"⏱",desc:"Duración fija"},{id:"reps",label:"REPS",icon:"🔢",desc:"Meta de reps"}].map(m=>{const active=seriesMode===m.id;return(<button key={m.id} onClick={()=>setSeriesMode(m.id)} style={{flex:1,padding:"10px 6px",background:active?C:"rgba(255,255,255,0.04)",border:`1px solid ${active?C:"rgba(255,255,255,0.07)"}`,borderRadius:"10px",cursor:"pointer",textAlign:"center"}}><div style={{fontSize:"16px",marginBottom:"3px"}}>{m.icon}</div><div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:"13px",letterSpacing:"2px",color:active?"#000":C+"77"}}>{m.label}</div><div style={{fontFamily:"sans-serif",fontSize:"8px",color:active?"#00000088":"#444",marginTop:"2px"}}>{m.desc}</div></button>);})}</div>}
        {mode==="series"&&(()=>{
          const toMmSs=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
          const btn={width:"48px",height:"48px",borderRadius:"10px",border:`1px solid ${C}44`,background:"rgba(255,255,255,0.04)",color:C,fontSize:"22px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0};
          const val={flex:1,textAlign:"center",fontSize:"32px",color:C,fontFamily:"'DSEG7 Classic',monospace",letterSpacing:"2px"};
          const timeRow=(label,v,setFn,step=15)=>(<div style={{marginBottom:"14px"}}><div style={{fontSize:"10px",letterSpacing:"4px",color:"#555",marginBottom:"8px"}}>{label}</div><div style={{display:"flex",alignItems:"center",gap:"8px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C}22`,borderRadius:"12px",padding:"8px"}}><button onClick={()=>setFn(x=>Math.max(step,x-step))} style={btn}>−</button><div style={val}>{toMmSs(v)}</div><button onClick={()=>setFn(x=>x+step)} style={btn}>+</button></div></div>);
          const numRow=(label,v,setFn,unit)=>(<div style={{marginBottom:"14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}><div style={{fontSize:"10px",letterSpacing:"4px",color:"#555"}}>{label}</div><div style={{fontFamily:"sans-serif",fontSize:"9px",color:"#444"}}>{unit}</div></div><div style={{display:"flex",alignItems:"center",gap:"8px",background:"rgba(255,255,255,0.03)",border:`1px solid ${C}22`,borderRadius:"12px",padding:"8px"}}><button onClick={()=>setFn(x=>Math.max(1,x-1))} style={btn}>−</button><div style={val}>{String(v).padStart(2,"0")}</div><button onClick={()=>setFn(x=>x+1)} style={btn}>+</button></div></div>);
          if(seriesMode==="time")return(<>{timeRow("DURACIÓN",duration,setDuration)}{numRow("SERIES",totalSets,setTotalSets,"sets")}{timeRow("DESCANSO",restDuration,setRestDuration)}</>);
          return(<>{numRow("REPS POR SET",repsPerSet,setRepsPerSet,"reps")}{numRow("SERIES",totalSets,setTotalSets,"sets")}{timeRow("DESCANSO",restDuration,setRestDuration)}</>);
        })()}
        <button onClick={startSession} style={{width:"100%",padding:"20px",background:C,border:"none",borderRadius:"16px",fontSize:"22px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>INICIAR SESIÓN</button>
      </div>)}

      {/* ── COUNTDOWN ── */}
      {screen==="countdown"&&selected&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",gap:"24px"}}>
        <div style={{fontSize:"13px",letterSpacing:"6px",color:"#555"}}>{selected.name.toUpperCase()}</div>
        <div style={{position:"relative",width:"200px",height:"200px",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="200" height="200" style={{position:"absolute",top:0,left:0,transform:"rotate(-90deg)"}}><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/><circle cx="100" cy="100" r="88" fill="none" stroke={C} strokeWidth="10" strokeDasharray={`${2*Math.PI*88}`} strokeDashoffset={`${2*Math.PI*88*(countdownLeft/5)}`} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.9s linear"}}/></svg>
          <div style={{fontSize:"96px",color:C,fontFamily:"'DSEG7 Classic',monospace",textShadow:`0 0 30px ${C}88`,lineHeight:1}}>{countdownLeft}</div>
        </div>
        <div style={{fontSize:"11px",letterSpacing:"4px",color:"#444"}}>{countdownLeft>1?"SEG PARA ARRANCAR":"¡YA!"}</div>
        <button onClick={launchSession} style={{marginTop:"8px",padding:"12px 32px",background:"transparent",border:`1px solid ${C}44`,borderRadius:"12px",color:"#555",fontSize:"12px",letterSpacing:"3px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>SALTAR</button>
      </div>}

      {/* ── COUNTING ── */}
      {screen==="counting"&&selected&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
        {paused&&<PauseOverlay onResume={()=>setPaused(false)} onSkip={()=>{clearInterval(timerRef.current);setCurrentSet(cs=>cs+1);setReps(0);setActiveStep(0);setTimeLeft(duration);setCameraKey(k=>k+1);setPoseReady(false);setScreen("counting");playBeep("go");setPaused(false);}} onAbandon={resetAll} setRestLeft={()=>{}} restLeft={0} isRest={false}/>}
        <div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"6px"}}>{Array.from({length:totalSets},(_,i)=><div key={i} style={{flex:1,maxWidth:i===currentSet-1?"28px":"12px",height:"5px",borderRadius:"3px",background:i<currentSet-1?C+"88":i===currentSet-1?C:"rgba(255,255,255,0.1)",boxShadow:i===currentSet-1?`0 0 8px ${C}`:"none",transition:"all 0.3s"}}/>)}</div>
        <div style={{fontSize:"10px",letterSpacing:"3px",color:C+"99",marginBottom:"12px"}}>{`SET ${currentSet} / ${totalSets}`}</div>
        {seriesMode!=="reps"&&<div style={{marginBottom:"10px",padding:"0 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
            <div style={{fontSize:"9px",letterSpacing:"3px",color:"#444"}}>TIEMPO</div>
            <div style={{fontSize:"20px",letterSpacing:"2px",color:timeLeft<=10?"#FF4D4D":C,fontVariantNumeric:"tabular-nums"}}>{fmt(timeLeft)}</div>
          </div>
          <div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"2px",width:`${pct}%`,background:timeLeft<=10?"#FF4D4D":C,transition:"width 1s linear"}}/></div>
        </div>}
        <div style={{position:"relative",width:"220px",height:"220px",margin:"0 auto 12px"}}>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"160px",height:"160px",borderRadius:"50%",background:`radial-gradient(circle, ${goalReached?"#FFD700":C}18 0%, transparent 70%)`}}/>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",width:"200px"}}>
            <div style={{fontSize:"100px",lineHeight:0.9,color:goalReached?"#FFD700":C,fontVariantNumeric:"tabular-nums"}}>{reps}</div>
            <div style={{fontSize:"11px",letterSpacing:"6px",color:"#333",marginTop:"8px"}}>{seriesMode==="reps"?`/ ${repsPerSet} REPS`:"REPS"}</div>
          </div>
        </div>
        {setRepsLog.length>0&&<div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"10px"}}>{setRepsLog.map((r,i)=><div key={i} style={{padding:"4px 8px",borderRadius:"8px",background:`${C}15`,border:`1px solid ${C}33`,textAlign:"center"}}><div style={{fontSize:"14px",color:C,lineHeight:1}}>{r}</div><div style={{fontSize:"8px",color:"#444",fontFamily:"sans-serif"}}>S{i+1}</div></div>)}</div>}
        {poseActive&&<div style={{marginBottom:"10px"}}><PoseView key={cameraKey} color={C} exerciseId={selected.id} onRep={simulateRep} active={poseActive} facingMode={facingMode} onFlipCamera={()=>{setFacingMode(m=>m==="user"?"environment":"user");setCameraKey(k=>k+1);}} onReady={()=>setPoseReady(true)} onPhaseChange={p=>setHoldPhase(p)}/></div>}
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <button onClick={simulateRep} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C}33`,borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:C+"99",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>{animating?"...":"+ MANUAL"}</button>
          <button onClick={()=>setPoseActive(v=>!v)} style={{padding:"12px 14px",background:poseActive?`${C}22`:"rgba(255,255,255,0.04)",border:`1px solid ${poseActive?C:"rgba(255,255,255,0.1)"}`,borderRadius:"12px",color:poseActive?C:"#555",cursor:"pointer",fontSize:"18px"}}>🤖</button>
          <button onClick={()=>setPaused(true)} style={{padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"#888",cursor:"pointer",fontSize:"18px"}}>⏸</button>
        </div>
        <button onClick={resetAll} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#444",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>ABANDONAR</button>
      </div>}

      {/* ── LIBRE ── */}
      {screen==="libre"&&selected&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
        {paused&&<PauseOverlay onResume={()=>setPaused(false)} onSkip={()=>{clearInterval(timerRef.current);setScreen("finished");playBeep("victory");setPaused(false);}} onAbandon={resetAll} setRestLeft={()=>{}} restLeft={0} isRest={false}/>}
        <div style={{fontSize:"9px",letterSpacing:"6px",color:"#555",marginBottom:"12px"}}>⏱ MODO LIBRE</div>
        <div style={{marginBottom:"10px",padding:"0 8px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><div style={{fontSize:"9px",letterSpacing:"3px",color:"#444"}}>TIEMPO</div><div style={{fontSize:"20px",color:C,fontVariantNumeric:"tabular-nums"}}>{fmt(elapsed)}</div></div><div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"2px",width:`${((elapsed%180)/180)*100}%`,background:C,transition:"width 1s linear"}}/></div></div>
        <div style={{position:"relative",width:"220px",height:"220px",margin:"0 auto 16px"}}><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",width:"200px"}}><div style={{fontSize:"100px",lineHeight:0.9,color:C,fontVariantNumeric:"tabular-nums"}}>{reps}</div><div style={{fontSize:"11px",letterSpacing:"6px",color:"#333",marginTop:"8px"}}>REPS</div></div></div>
        {poseActive&&<div style={{marginBottom:"10px"}}><PoseView key={cameraKey} color={C} exerciseId={selected.id} onRep={simulateRep} active={poseActive} facingMode={facingMode} onFlipCamera={()=>{setFacingMode(m=>m==="user"?"environment":"user");setCameraKey(k=>k+1);}} onReady={()=>setPoseReady(true)} onPhaseChange={p=>setHoldPhase(p)}/></div>}
        <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
          <button onClick={simulateRep} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C}33`,borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:C+"99",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+ MANUAL</button>
          <button onClick={()=>setPoseActive(v=>!v)} style={{padding:"12px 14px",background:poseActive?`${C}22`:"rgba(255,255,255,0.04)",border:`1px solid ${poseActive?C:"rgba(255,255,255,0.1)"}`,borderRadius:"12px",color:poseActive?C:"#555",cursor:"pointer",fontSize:"18px"}}>🤖</button>
          <button onClick={()=>setPaused(true)} style={{padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"#888",cursor:"pointer",fontSize:"18px"}}>⏸</button>
        </div>
        <button onClick={()=>{clearInterval(timerRef.current);setScreen("finished");playBeep("victory");}} style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${C}55`,borderRadius:"12px",fontSize:"15px",letterSpacing:"4px",color:C,cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>⏹ TERMINAR</button>
        <button onClick={resetAll} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#444",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>ABANDONAR</button>
      </div>}

      {/* ── REST ── */}
      {screen==="rest"&&selected&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
        {paused&&<PauseOverlay onResume={()=>setPaused(false)} onSkip={()=>{clearInterval(timerRef.current);setCurrentSet(cs=>cs+1);setReps(0);setActiveStep(0);setTimeLeft(duration);setCameraKey(k=>k+1);setPoseReady(false);setScreen("counting");playBeep("go");setPaused(false);}} onAbandon={resetAll} setRestLeft={setRestLeft} restLeft={restLeft} isRest={true}/>}
        <div style={{fontSize:"13px",letterSpacing:"6px",color:"#555",marginBottom:"16px"}}>DESCANSO</div>
        <div style={{position:"relative",width:"180px",height:"180px",margin:"0 auto 16px"}}>
          <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}><circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/><circle cx="90" cy="90" r="78" fill="none" stroke={C} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*78}`} strokeDashoffset={`${2*Math.PI*78*(1-pct/100)}`} style={{transition:"stroke-dashoffset 1s linear",filter:`drop-shadow(0 0 8px ${C})`}}/></svg>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}><div style={{fontSize:"52px",lineHeight:1}}>{fmt(restLeft)}</div><div style={{fontSize:"10px",letterSpacing:"3px",color:"#555",marginTop:"4px"}}>REST</div></div>
        </div>
        <div style={{display:"flex",gap:"10px",justifyContent:"center",marginBottom:"16px"}}>
          <button onClick={()=>setRestLeft(r=>Math.max(3,r-15))} style={{padding:"10px 22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"15px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>−15s</button>
          <button onClick={()=>setRestLeft(r=>r+15)} style={{padding:"10px 22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"15px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+15s</button>
        </div>
        <div style={{fontSize:"10px",letterSpacing:"3px",color:"#444",marginBottom:"14px"}}>PRÓXIMO: SET {currentSet+1} / {totalSets}</div>
        <button onClick={()=>setPaused(true)} style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:"#888",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>⏸ PAUSAR</button>
        <button onClick={()=>{clearInterval(timerRef.current);setCurrentSet(cs=>cs+1);setReps(0);setActiveStep(0);setTimeLeft(duration);setCameraKey(k=>k+1);setPoseReady(false);setScreen("counting");playBeep("go");}} style={{width:"100%",padding:"16px",background:C,border:"none",borderRadius:"14px",fontSize:"18px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>⚡ SALTAR</button>
        <button onClick={resetAll} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",color:"#444",cursor:"pointer",fontSize:"13px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>ABANDONAR</button>
      </div>}

      {/* ── FINISHED ── */}
      {screen==="finished"&&selected&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center",position:"relative"}}>
        {showFireworks&&particles.map(p=><div key={p.id} style={{position:"absolute",top:"50%",left:"50%",width:`${p.size}px`,height:`${p.size}px`,borderRadius:"50%",background:p.color,boxShadow:`0 0 ${p.size*2}px ${p.color}`,animation:`explode-${p.id} 1.5s ease-out forwards`,opacity:0}}/>)}
        <div style={{position:"relative",marginBottom:"24px"}}>
          <div style={{fontSize:"13px",letterSpacing:"6px",color:C+"99",marginBottom:"8px"}}>{selected.icon} {selected.name.toUpperCase()}</div>
          <div style={{fontSize:"110px",lineHeight:0.85,color:C,textShadow:`0 0 80px ${C}`,fontVariantNumeric:"tabular-nums",animation:"finishPop 0.5s ease-out"}}>{grandTotal}</div>
          <div style={{fontSize:"12px",letterSpacing:"8px",color:"#555",marginTop:"10px"}}>REPS TOTALES</div>
          <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(0,201,167,0.12)",border:"1px solid #00C9A744",borderRadius:"20px",padding:"4px 12px",marginTop:"12px"}}><span style={{fontSize:"10px"}}>✅</span><span style={{fontSize:"10px",letterSpacing:"3px",color:"#00C9A7"}}>GUARDADO</span></div>
        </div>
        {setRepsLog.length>0&&<div style={{display:"flex",gap:"6px",marginBottom:"16px"}}>{setRepsLog.map((r,i)=>{const best=Math.max(...setRepsLog),p2=best>0?r/best:0;return(<div key={i} style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${r===best?C:C+"22"}`,borderRadius:"10px",padding:"10px 6px",position:"relative",overflow:"hidden"}}><div style={{position:"absolute",bottom:0,left:0,right:0,height:`${p2*100}%`,background:`${C}22`}}/><div style={{position:"relative"}}><div style={{fontSize:"22px",color:r===best?C:C+"88"}}>{r}</div><div style={{fontSize:"8px",color:"#444",fontFamily:"sans-serif"}}>S{i+1}</div></div></div>);})}</div>}
        <button onClick={startSession} style={{width:"100%",padding:"18px",background:C,border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>REPETIR</button>
        <div style={{display:"flex",gap:"8px"}}>
          <button onClick={()=>setScreen("history")} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#777",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>📊 HISTORIAL</button>
          <button onClick={resetAll} style={{flex:1,padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"13px",letterSpacing:"3px",color:"#777",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>INICIO</button>
        </div>
      </div>}

      {/* ── PROGRAMA: PREP ── */}
      {screen==="prog_prep"&&activeSession&&<ProgPrepScreen
        activeSession={activeSession}
        progBlockIdx={progBlockIdx}
        progRoundIdx={progRoundIdx}
        onReady={()=>{
          const ex=activeSession.blocks[progBlockIdx]?.exercises[0];
          setScreen("prog_counting");
          setTimeLeft(ex?.duration||120);
          setPoseActive(true);setPoseReady(false);
          playBeep("go");
        }}
      />}

      {/* ── PROGRAMA: COUNTING ── */}
      {screen==="prog_counting"&&activeSession&&(()=>{
        const block=activeSession.blocks[progBlockIdx];const bt=BLOCK_TYPES[block?.type||"normal"];
        const ex=block?.exercises[progExIdx];const exData=exercises.find(e=>e.id===ex?.exerciseId);
        const exColor=exData?.color||"#FF4D4D";
        const totExInBlock=block?.exercises.length||1;
        return(<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
          {paused&&<PauseOverlay onResume={()=>setPaused(false)} onSkip={()=>{clearInterval(timerRef.current);finishProgExercise();setPaused(false);}} onAbandon={resetAll} setRestLeft={()=>{}} restLeft={0} isRest={false}/>}
          <div style={{fontSize:"9px",letterSpacing:"3px",color:"#555",marginBottom:"4px"}}>{bt.emoji} {bt.label} · BLOQUE {progBlockIdx+1} · RONDA {progRoundIdx+1}/{block?.rounds}</div>
          {totExInBlock>1&&<div style={{display:"flex",gap:"6px",justifyContent:"center",marginBottom:"6px"}}>{block.exercises.map((_,i)=><div key={i} style={{width:i===progExIdx?"22px":"8px",height:"5px",borderRadius:"3px",background:i<progExIdx?exColor+"88":i===progExIdx?exColor:"rgba(255,255,255,0.1)",transition:"all 0.3s"}}/> )}</div>}
          <div style={{fontSize:"22px",marginBottom:"4px"}}>{exData?.icon}</div>
          <div style={{fontSize:"18px",letterSpacing:"2px",color:exColor,marginBottom:"12px"}}>{exData?.name?.toUpperCase()}</div>
          {ex?.mode!=="reps"&&<div style={{marginBottom:"10px",padding:"0 8px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><div style={{fontSize:"9px",letterSpacing:"3px",color:"#444"}}>TIEMPO</div><div style={{fontSize:"20px",letterSpacing:"2px",color:timeLeft<=10?"#FF4D4D":exColor,fontVariantNumeric:"tabular-nums"}}>{fmt(timeLeft)}</div></div><div style={{height:"4px",borderRadius:"2px",background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{height:"100%",borderRadius:"2px",width:`${((ex?.duration||120)-timeLeft)/(ex?.duration||120)*100}%`,background:timeLeft<=10?"#FF4D4D":exColor,transition:"width 1s linear"}}/></div></div>}
          <div style={{position:"relative",width:"200px",height:"200px",margin:"0 auto 12px"}}>
            {ex?.mode==="reps"&&<svg width="200" height="200" style={{transform:"rotate(-90deg)",position:"absolute",top:0,left:0}}><circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8"/><circle cx="100" cy="100" r="88" fill="none" stroke={exColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2*Math.PI*88}`} strokeDashoffset={`${2*Math.PI*88*(1-Math.min(progReps/(ex?.targetReps||10),1))}`} style={{transition:"stroke-dashoffset 0.3s ease",filter:`drop-shadow(0 0 10px ${exColor})`}}/></svg>}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",width:"180px"}}><div style={{fontSize:"90px",lineHeight:0.9,color:exColor,fontVariantNumeric:"tabular-nums"}}>{progReps}</div><div style={{fontSize:"11px",letterSpacing:"4px",color:"#333",marginTop:"8px"}}>{ex?.mode==="reps"?`/ ${ex?.targetReps||10} REPS`:"REPS"}</div></div>
          </div>
          {poseActive&&exData&&<div style={{marginBottom:"10px"}}><PoseView key={`prog-${progBlockIdx}-${progExIdx}-${cameraKey}`} color={exColor} exerciseId={exData.id} onRep={progSimulateRep} active={poseActive} facingMode={facingMode} onFlipCamera={()=>{setFacingMode(m=>m==="user"?"environment":"user");setCameraKey(k=>k+1);}} onReady={()=>setPoseReady(true)} onPhaseChange={()=>{}}/></div>}
          <div style={{display:"flex",gap:"8px",marginBottom:"8px"}}>
            <button onClick={progSimulateRep} style={{flex:1,padding:"12px",background:"rgba(255,255,255,0.04)",border:`1px solid ${exColor}33`,borderRadius:"12px",fontSize:"15px",letterSpacing:"3px",color:exColor+"99",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+ MANUAL</button>
            <button onClick={()=>setPoseActive(v=>!v)} style={{padding:"12px 14px",background:poseActive?`${exColor}22`:"rgba(255,255,255,0.04)",border:`1px solid ${poseActive?exColor:"rgba(255,255,255,0.1)"}`,borderRadius:"12px",color:poseActive?exColor:"#555",cursor:"pointer",fontSize:"18px"}}>🤖</button>
            <button onClick={()=>setPaused(true)} style={{padding:"12px 14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",color:"#888",cursor:"pointer",fontSize:"18px"}}>⏸</button>
          </div>
          {ex?.mode==="reps"&&<button onClick={()=>{clearInterval(timerRef.current);finishProgExercise();}} style={{width:"100%",padding:"14px",background:exColor,border:"none",borderRadius:"12px",fontSize:"18px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>✓ LISTO</button>}
          <button onClick={resetAll} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",color:"#333",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>ABANDONAR</button>
        </div>);
      })()}

      {/* ── PROGRAMA: DESCANSO ── */}
      {screen==="prog_rest"&&activeSession&&(()=>{
        const block=activeSession.blocks[progBlockIdx];const bt=BLOCK_TYPES[block?.type||"normal"];
        const nextBlockIdx=block&&progBlockIdx<activeSession.blocks.length-1?progBlockIdx+1:null;
        const nextBlock=nextBlockIdx!==null?activeSession.blocks[nextBlockIdx]:null;
        const nextBt=nextBlock?BLOCK_TYPES[nextBlock.type]:null;
        const title=progIsRestWithin?"CAMBIO DE EJERCICIO":"DESCANSO";
        return(<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center"}}>
          {paused&&<PauseOverlay onResume={()=>setPaused(false)} onSkip={()=>{clearInterval(timerRef.current);advanceProgram();setPaused(false);}} onAbandon={resetAll} setRestLeft={setProgRestLeft} restLeft={progRestLeft} isRest={true}/>}
          <div style={{fontSize:"13px",letterSpacing:"6px",color:"#555",marginBottom:"6px"}}>{title}</div>
          <div style={{position:"relative",width:"180px",height:"180px",margin:"0 auto 20px"}}>
            <svg width="180" height="180" style={{transform:"rotate(-90deg)"}}><circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/><circle cx="90" cy="90" r="78" fill="none" stroke={bt.color} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*78}`} strokeDashoffset={`${2*Math.PI*78*(progRestLeft/(progIsRestWithin?block?.restWithin||15:block?.restAfter||90))}`} style={{transition:"stroke-dashoffset 1s linear",filter:`drop-shadow(0 0 8px ${bt.color})`}}/></svg>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}><div style={{fontSize:"52px",lineHeight:1}}>{fmt(progRestLeft)}</div><div style={{fontSize:"9px",letterSpacing:"3px",color:"#555",marginTop:"4px"}}>REST</div></div>
          </div>
          {nextBlock&&!progIsRestWithin&&<div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${nextBt?.color||"#fff"}33`,borderRadius:"14px",padding:"12px",marginBottom:"16px"}}>
            <div style={{fontSize:"9px",letterSpacing:"4px",color:"#555",marginBottom:"6px"}}>SIGUIENTE BLOQUE</div>
            <div style={{fontSize:"22px",marginBottom:"4px"}}>{nextBt?.emoji}</div>
            <div style={{fontSize:"14px",letterSpacing:"2px",color:nextBt?.color}}>{nextBt?.label}</div>
          </div>}
          <div style={{display:"flex",gap:"10px",justifyContent:"center",marginBottom:"16px"}}>
            <button onClick={()=>setProgRestLeft(r=>Math.max(3,r-15))} style={{padding:"10px 22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"15px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>−15s</button>
            <button onClick={()=>setProgRestLeft(r=>r+15)} style={{padding:"10px 22px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"10px",color:"#888",fontSize:"15px",letterSpacing:"2px",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>+15s</button>
          </div>
          <button onClick={()=>setPaused(true)} style={{width:"100%",padding:"12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"14px",letterSpacing:"3px",color:"#888",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>⏸ PAUSAR</button>
          <button onClick={()=>{clearInterval(timerRef.current);advanceProgram();}} style={{width:"100%",padding:"16px",background:bt.color,border:"none",borderRadius:"14px",fontSize:"18px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>⚡ SALTAR</button>
          <button onClick={resetAll} style={{width:"100%",padding:"10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"10px",color:"#333",cursor:"pointer",fontSize:"12px",letterSpacing:"3px",fontFamily:"'Bebas Neue',sans-serif"}}>ABANDONAR</button>
        </div>);
      })()}

      {/* ── PROGRAMA: DONE ── */}
      {screen==="prog_done"&&activeSession&&<div style={{width:"100%",maxWidth:"420px",zIndex:1,textAlign:"center",position:"relative"}}>
        {showFireworks&&particles.map(p=><div key={p.id} style={{position:"absolute",top:"50%",left:"50%",width:`${p.size}px`,height:`${p.size}px`,borderRadius:"50%",background:p.color,boxShadow:`0 0 ${p.size*2}px ${p.color}`,animation:`explode-${p.id} 1.5s ease-out forwards`,opacity:0}}/>)}
        <div style={{fontSize:"13px",letterSpacing:"6px",color:"#FF4D4D",marginBottom:"8px"}}>SESIÓN COMPLETADA 🎉</div>
        <div style={{fontSize:"22px",letterSpacing:"3px",marginBottom:"24px"}}>{activeSession.name.toUpperCase()}</div>
        <div style={{display:"flex",flexDirection:"column",gap:"8px",marginBottom:"24px"}}>
          {progDoneLog.map((item,i)=>{const ex=exercises.find(e=>e.id===item.exerciseId),C2=ex?.color||"#FF4D4D";return(<div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${C2}33`,borderRadius:"12px",padding:"12px 16px",display:"flex",alignItems:"center",gap:"12px"}}><span style={{fontSize:"20px"}}>{ex?.icon}</span><div style={{flex:1,textAlign:"left"}}><div style={{fontSize:"14px",letterSpacing:"2px",color:C2}}>{ex?.name?.toUpperCase()}</div></div><div style={{textAlign:"right"}}><div style={{fontSize:"28px",color:C2,lineHeight:1}}>{item.reps}</div><div style={{fontSize:"8px",color:"#555",letterSpacing:"2px"}}>REPS</div></div></div>);})}</div>
        <div style={{background:"rgba(255,77,77,0.08)",border:"1px solid #FF4D4D33",borderRadius:"14px",padding:"16px",marginBottom:"24px"}}>
          <div style={{fontSize:"11px",letterSpacing:"4px",color:"#555",marginBottom:"4px"}}>TOTAL REPS</div>
          <div style={{fontSize:"72px",lineHeight:1,color:"#FF4D4D",textShadow:"0 0 40px #FF4D4D88"}}>{progDoneLog.reduce((a,b)=>a+b.reps,0)}</div>
        </div>
        <button onClick={()=>startProgram(activeSession)} style={{width:"100%",padding:"18px",background:"#FF4D4D",border:"none",borderRadius:"14px",fontSize:"20px",letterSpacing:"4px",color:"#000",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif",marginBottom:"8px"}}>REPETIR SESIÓN</button>
        <button onClick={resetAll} style={{width:"100%",padding:"14px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",fontSize:"14px",letterSpacing:"3px",color:"#777",cursor:"pointer",fontFamily:"'Bebas Neue',sans-serif"}}>IR AL INICIO</button>
      </div>}

      {showInfo&&<InfoModal onClose={()=>setShowInfo(false)}/>}

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.min.css"/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes prPop{0%{opacity:0;transform:translateX(-50%) scale(0.7)}60%{transform:translateX(-50%) scale(1.05)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
        @keyframes finishPop{0%{opacity:0;transform:scale(0.6)}70%{transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
        ${particles.map(p=>`@keyframes explode-${p.id}{0%{opacity:1;transform:rotate(${p.angle}deg) translateX(20px) scale(1)}60%{opacity:1;transform:rotate(${p.angle}deg) translateX(${p.distance}px) scale(1.2)}100%{opacity:0;transform:rotate(${p.angle}deg) translateX(${p.distance*1.5}px) scale(0)}}`).join("")}
      `}</style>
    </div>
  );
}

const WrappedApp=()=><ErrorBoundary><RepCountApp/></ErrorBoundary>;
export default WrappedApp;
