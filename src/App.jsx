import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = "claude-sonnet-4-5";

const DEFAULT_PROFILE = {
  name: "York", weight: 81, height: 184, startWeight: 81,
  age: 27, phase: "Recomposición corporal",
  goal: "Bajar retención de líquidos y definir", activityLevel: 1.55,
  routineType: "Push Pull Legs", trainingDays: 6,
};
const PHASES = ["Recomposición corporal","Definición / Cutting","Volumen / Bulking","Mantenimiento","Pre-competencia"];
const ROUTINE_TYPES = ["Push Pull Legs","Arnold Split","Upper Lower","Full Body"];
const ACTIVITIES = [
  { id:"mma", label:"MMA", glyph:"⚔", met:9.8 },
  { id:"gym", label:"Gym / Pesas", glyph:"🏛", met:6.0 },
  { id:"basketball", label:"Básquetbol", glyph:"◯", met:7.5 },
  { id:"running", label:"Trote / Correr", glyph:"➤", met:9.0 },
  { id:"cycling", label:"Ciclismo", glyph:"◐", met:7.0 },
  { id:"swimming", label:"Natación", glyph:"≈", met:8.3 },
  { id:"football", label:"Fútbol", glyph:"✦", met:8.0 },
  { id:"yoga", label:"Yoga / Stretching", glyph:"☯", met:3.0 },
  { id:"walk", label:"Caminata", glyph:"↗", met:3.5 },
];
const DEFAULT_RITUALS = [
  { key:"agua3l", label:"Hidratación 2.5–3L", desc:"Más agua = menos retención", icon:"ψ" },
  { key:"sodio_bajo", label:"Bajo en Sodio", desc:"Menos de 2g de sodio hoy", icon:"△" },
  { key:"diuretico", label:"Diuréticos naturales", desc:"Espárragos, pepino, diente de león", icon:"⚘" },
  { key:"sin_alcohol", label:"Sin alcohol / Sin ultraprocesados", desc:"Principales causantes de edema", icon:"⊘" },
  { key:"cardio_ligero", label:"Cardio ligero 20min+", desc:"Activa sistema linfático", icon:"Ω" },
  { key:"sueno", label:"Dormir 7–8h", desc:"El cortisol alto retiene líquido", icon:"☽" },
];
const DAYS = ["L","M","X","J","V","S","D"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const GOLD="#c9a961", GOLD_DIM="#8b7339", MARBLE="#e8e2d4", STONE="#3a3733", BG_DARK="#0a0908", BG_PANEL="#13110f", RED="#a83232";

function ls_get(k) { try { const v=localStorage.getItem(k); return v?JSON.parse(v):null; } catch { return null; } }
function ls_set(k,v) { try { localStorage.setItem(k,JSON.stringify(v)); } catch {} }
function ls_del(k) { try { localStorage.removeItem(k); } catch {} }
function today_str() { return new Date().toISOString().split("T")[0]; }
function greet(name) {
  const h=new Date().getHours();
  return h<12?`AVE, ${name}`:h<19?`SALVE, ${name}`:`VESPER, ${name}`;
}
function calc1RM(weight,reps) { return reps===1?weight:Math.round(weight*(1+reps/30)); }

async function callClaude(messages, maxTokens=700) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key": API_KEY,
      "anthropic-version":"2023-06-01",
      "anthropic-dangerous-direct-browser-access":"true",
    },
    body: JSON.stringify({ model:MODEL, max_tokens:maxTokens, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

function Meander() {
  return (
    <div style={{height:12,opacity:0.4,margin:"8px 0"}}>
      <svg width="100%" height="12" preserveAspectRatio="none" viewBox="0 0 200 12">
        <g fill="none" stroke={GOLD} strokeWidth="0.8">
          {Array.from({length:12}).map((_,i)=>{
            const x=i*18;
            return <path key={i} d={`M${x} 2 L${x+10} 2 L${x+10} 10 L${x+4} 10 L${x+4} 6 L${x+14} 6`}/>;
          })}
        </g>
      </svg>
    </div>
  );
}
function Laurel({side="left",size=60}) {
  return (
    <svg width={size} height={size*1.5} viewBox="0 0 40 60" style={{transform:side==="right"?"scale(-1,1)":""}}>
      <g fill="none" stroke={GOLD} strokeWidth="0.8" opacity="0.5">
        <path d="M20 55 Q18 40 16 25 Q14 12 12 5"/>
        {Array.from({length:7}).map((_,i)=>{
          const y=50-i*7,angle=-25-i*2;
          return <ellipse key={i} cx={16-i*0.8} cy={y} rx="6" ry="2.5" transform={`rotate(${angle} ${16-i*0.8} ${y})`}/>;
        })}
      </g>
    </svg>
  );
}
function GreekBust({size=80}) {
  return (
    <svg width={size} height={size*1.2} viewBox="0 0 100 120" style={{opacity:0.15}}>
      <g fill="none" stroke={GOLD} strokeWidth="0.6">
        <ellipse cx="50" cy="35" rx="22" ry="28"/>
        <path d="M28 20 Q32 12 40 14 Q44 8 50 10 Q56 8 60 14 Q68 12 72 20"/>
        <circle cx="32" cy="22" r="3"/><circle cx="38" cy="16" r="2.5"/>
        <circle cx="62" cy="16" r="2.5"/><circle cx="68" cy="22" r="3"/>
        <path d="M40 38 Q50 42 60 38"/><line x1="50" y1="35" x2="50" y2="45"/>
        <path d="M46 50 Q50 53 54 50"/>
        <path d="M40 60 L42 75 L58 75 L60 60"/>
        <path d="M20 90 Q30 78 42 75 L58 75 Q70 78 80 90 L80 120 L20 120 Z"/>
        <path d="M30 90 Q40 95 50 92 Q60 95 70 90"/>
        <path d="M35 100 Q42 105 50 102 Q58 105 65 100"/>
      </g>
    </svg>
  );
}
function Stat({label,value,unit,small}) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"Cinzel,serif",fontSize:small?14:22,color:GOLD,fontWeight:600}}>
        {value}<span style={{fontSize:11,color:"#888",marginLeft:2}}>{unit}</span>
      </div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:9,color:GOLD_DIM,letterSpacing:3,marginTop:2}}>{label}</div>
    </div>
  );
}
function SectionTitle({icon,title,subtitle}) {
  return (
    <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
      <span style={{color:GOLD,fontSize:18,fontFamily:"Cinzel,serif"}}>{icon}</span>
      <div>
        <div style={{fontFamily:"Cinzel,serif",fontSize:13,color:MARBLE,letterSpacing:4,textTransform:"uppercase",fontWeight:500}}>{title}</div>
        {subtitle&&<div style={{fontFamily:"Cinzel,serif",fontSize:9,color:GOLD_DIM,letterSpacing:2,marginTop:2}}>{subtitle}</div>}
      </div>
    </div>
  );
}
function ProgressBar({value,max,color,height=4}) {
  return (
    <div style={{background:STONE,height,marginTop:8,borderRadius:0}}>
      <div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,transition:"width 0.6s ease"}}/>
    </div>
  );
}
function MiniStat({label,value,color=MARBLE}) {
  return (
    <div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:9,color:GOLD_DIM,letterSpacing:2}}>{label}</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:16,color,fontWeight:600,marginTop:2}}>{value}</div>
    </div>
  );
}
function BigStat({icon,val,label,color,small}) {
  return (
    <div style={{background:BG_PANEL,border:`1px solid ${STONE}`,padding:"12px 6px",textAlign:"center"}}>
      <div style={{fontSize:18,color:GOLD_DIM,fontFamily:"Cinzel,serif"}}>{icon}</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:small?15:19,color,fontWeight:600,marginTop:2}}>{val}</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:9,color:GOLD_DIM,letterSpacing:2,marginTop:2,textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}
function Pill({label,value,color}) {
  return (
    <div style={{textAlign:"center"}}>
      <div style={{fontFamily:"Cinzel,serif",fontSize:20,color,fontWeight:600}}>{value}</div>
      <div style={{fontFamily:"Cinzel,serif",fontSize:9,color:GOLD_DIM,letterSpacing:2,marginTop:2,textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

const inputStyle = {
  width:"100%",padding:"11px 14px",background:"#0e0c0a",
  border:`1px solid ${STONE}`,color:MARBLE,fontFamily:"Inter,sans-serif",
  fontSize:14,outline:"none",boxSizing:"border-box",borderRadius:0
};
const primaryBtn = {
  padding:"11px 18px",background:GOLD,color:BG_DARK,border:"none",
  fontFamily:"Cinzel,serif",fontSize:11,letterSpacing:3,cursor:"pointer",
  fontWeight:600,textTransform:"uppercase",borderRadius:0
};
const ghostBtn = {
  padding:"9px 14px",background:"transparent",border:`1px solid ${GOLD_DIM}`,
  color:GOLD,fontFamily:"Cinzel,serif",fontSize:10,letterSpacing:3,
  cursor:"pointer",fontWeight:500,textTransform:"uppercase",borderRadius:0
};
const dangerBtn = {
  padding:"9px 14px",background:"transparent",border:`1px solid ${RED}`,
  color:RED,fontFamily:"Cinzel,serif",fontSize:10,letterSpacing:3,
  cursor:"pointer",fontWeight:500,textTransform:"uppercase",borderRadius:0
};
const deleteXBtn = {
  background:"transparent",border:`1px solid ${STONE}`,color:GOLD_DIM,
  fontFamily:"Cinzel,serif",fontSize:12,cursor:"pointer",
  width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",
  flexShrink:0,lineHeight:1,borderRadius:0,padding:0,
};

function FormField({label,value,onChange,type="text"}) {
  return (
    <div style={{marginTop:12}}>
      <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>{label}</div>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} style={inputStyle}/>
    </div>
  );
}

function GuideSection({icon,title,children}) {
  const fontH="Cinzel,serif", fontB="Cormorant Garamond,Georgia,serif";
  return (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${GOLD_DIM}`}}>
        <span style={{color:GOLD,fontSize:20}}>{icon}</span>
        <div style={{fontFamily:fontH,fontSize:12,color:GOLD,letterSpacing:4,textTransform:"uppercase"}}>{title}</div>
      </div>
      <div style={{fontFamily:fontB,fontSize:15,color:MARBLE,lineHeight:1.8}}>{children}</div>
    </div>
  );
}
function GuideTip({children}) {
  const fontB="Cormorant Garamond,Georgia,serif";
  return <div style={{fontFamily:fontB,fontSize:14,color:GOLD,fontStyle:"italic",marginBottom:6}}>◆ {children}</div>;
}
function GuideDef({term,def}) {
  const fontH="Cinzel,serif", fontB="Cormorant Garamond,Georgia,serif";
  return (
    <div style={{marginBottom:10}}>
      <span style={{fontFamily:fontH,fontSize:10,color:GOLD,letterSpacing:2}}>{term}: </span>
      <span style={{fontFamily:fontB,fontSize:14,color:MARBLE}}>{def}</span>
    </div>
  );
}

export default function Olympus() {
  const [tab, setTab] = useState("today");
  const [profile, setProfile] = useState(()=>ls_get("oly_profile")||DEFAULT_PROFILE);
  const [logs, setLogs] = useState(()=>ls_get("oly_logs")||{});
  const [retChecks, setRetChecks] = useState(()=>ls_get("oly_ret_"+today_str())||{});
  const [customRituals, setCustomRituals] = useState(()=>ls_get("oly_rituals")||DEFAULT_RITUALS);
  const [personalStack, setPersonalStack] = useState(()=>ls_get("oly_stack")||[]);
  const [photos, setPhotos] = useState(()=>ls_get("oly_photos")||[]);
  const [workouts, setWorkouts] = useState(()=>ls_get("oly_workouts")||{});

  const [actForm, setActForm] = useState({type:"",duration:""});
  const [showActForm, setShowActForm] = useState(false);
  const [foodText, setFoodText] = useState("");
  const [foodResult, setFoodResult] = useState(null);
  const [loadingFood, setLoadingFood] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [waterInput, setWaterInput] = useState("");
  const [editProfile, setEditProfile] = useState({...DEFAULT_PROFILE,...(ls_get("oly_profile")||{})});
  const [notif, setNotif] = useState(null);
  const [oracleAdvice, setOracleAdvice] = useState(null);
  const [loadingOracle, setLoadingOracle] = useState(false);
  const [photoNote, setPhotoNote] = useState("");

  // Daily IA message
  const [dailyMessage, setDailyMessage] = useState(()=>ls_get("oly_daily_msg_"+today_str())||null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  // Ritual IA
  const [ritualObjective, setRitualObjective] = useState("");
  const [loadingRitualIA, setLoadingRitualIA] = useState(false);

  // Athlete state
  const [athleteSession, setAthleteSession] = useState(()=>ls_get("oly_athlete_"+today_str())||{exercises:[],score:null,notes:"",routineDay:""});
  const [exForm, setExForm] = useState({name:"",sets:"3",reps:"6",weight:""});
  const [loadingAthlete, setLoadingAthlete] = useState(false);
  const [athleteAnalysis, setAthleteAnalysis] = useState(()=>ls_get("oly_athlete_"+today_str())?.analysis||null);
  const [show1RM, setShow1RM] = useState(false);
  const [oneRMForm, setOneRMForm] = useState({weight:"",reps:""});
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Planning state
  const [planMonth, setPlanMonth] = useState(new Date().getMonth());
  const [planYear, setPlanYear] = useState(new Date().getFullYear());
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(()=>ls_get("oly_weekly_plan")||null);
  const [calDayNote, setCalDayNote] = useState(()=>ls_get("oly_cal_notes")||{});
  const [selectedCalDay, setSelectedCalDay] = useState(null);
  const [calNoteInput, setCalNoteInput] = useState("");

  // Rituals edit
  const [editingRituals, setEditingRituals] = useState(false);
  const [newRitual, setNewRitual] = useState({label:"",desc:"",icon:"◈"});
  const [editingStack, setEditingStack] = useState(false);
  const [newStack, setNewStack] = useState({name:"",desc:""});

  const day = today_str();
  const todayLog = logs[day]||{activities:[],foods:[],water:0,weight:null};
  const burned = (todayLog.activities||[]).reduce((s,a)=>s+a.calories,0);
  const eaten = (todayLog.foods||[]).reduce((s,f)=>s+f.calories,0);
  const totalProtein = (todayLog.foods||[]).reduce((s,f)=>s+(f.protein||0),0);
  const water = todayLog.water||0;
  const balance = eaten-burned;
  const bmr = Math.round(10*profile.weight+6.25*profile.height-5*profile.age+5);
  const tdee = Math.round(bmr*profile.activityLevel);
  const proteinGoal = Math.round(2.2*(profile.weight||81));
  const retDone = customRituals.filter(t=>retChecks[t.key]).length;
  const calPct = tdee>0?Math.min(Math.round((eaten/tdee)*100),999):0;

  function saveProfile(p){ls_set("oly_profile",p);setProfile(p);}
  function saveLogs(l){ls_set("oly_logs",l);setLogs(l);}
  function saveRet(r){ls_set("oly_ret_"+day,r);setRetChecks(r);}
  function savePhotos(ph){ls_set("oly_photos",ph);setPhotos(ph);}
  function saveWorkouts(w){ls_set("oly_workouts",w);setWorkouts(w);}
  function saveAthleteSession(s){ls_set("oly_athlete_"+day,s);setAthleteSession(s);}
  function notify(msg){setNotif(msg);setTimeout(()=>setNotif(null),2800);}

  // ── DAILY IA MESSAGE ──
  async function generateDailyMessage(currentEaten, currentTdee, currentProtein, currentProteinGoal) {
    if (loadingMessage) return;
    setLoadingMessage(true);
    try {
      const h = new Date().getHours();
      const slot = h<10?"mañana temprano":h<14?"mediodía":h<19?"tarde":h<22?"noche temprana":"noche";
      const pct = currentTdee>0?Math.round((currentEaten/currentTdee)*100):0;
      const text = await callClaude([{
        role:"user",
        content:`Eres coach de nutrición. Genera UN mensaje estratégico corto (máximo 2 oraciones) para este atleta ahora mismo:
Hora: ${slot} (${h}h)
Calorías: ${currentEaten}/${currentTdee} kcal (${pct}%)
Proteína: ${Math.round(currentProtein)}/${currentProteinGoal}g
Fase: ${profile.phase}

Reglas estrictas:
- Bajo 30% + mañana/mediodía → qué comer ahora específicamente
- 50-90% → motivación corta y directa
- Sobre 100% → qué evitar y cómo compensar
- Noche + bajo 70% → urgencia, alimento proteico rápido
- Sin saludos ni nombres. Tono clásico e imperativo.`
      }], 180);
      setDailyMessage(text);
      ls_set("oly_daily_msg_"+today_str(), text);
    } catch(e) { /* silent */ }
    setLoadingMessage(false);
  }

  useEffect(()=>{
    if (tab==="today" && !dailyMessage && !loadingMessage) {
      generateDailyMessage(eaten, tdee, totalProtein, proteinGoal);
    }
  }, [tab]);

  useEffect(()=>{
    if (tab==="today") {
      const saved = ls_get("oly_daily_msg_"+today_str());
      if (!saved) generateDailyMessage(eaten, tdee, totalProtein, proteinGoal);
    }
  }, [eaten, burned]);

  // ── RITUAL IA ──
  async function generateRitualsIA() {
    if (!ritualObjective.trim()) return;
    setLoadingRitualIA(true);
    try {
      const text = await callClaude([{
        role:"user",
        content:`Genera 5 rituales diarios personalizados para este objetivo:
Objetivo: ${ritualObjective}
Perfil: ${profile.weight}kg, fase "${profile.phase}", meta: "${profile.goal}"

Responde SOLO JSON sin backticks:
{"rituales":[{"label":"","desc":"","icon":"◈"}]}`
      }], 500);
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      const generated = parsed.rituales.map((r,i)=>({
        key:"ai_"+Date.now()+"_"+i,
        label:r.label, desc:r.desc, icon:r.icon||"◈"
      }));
      const updated=[...customRituals,...generated];
      ls_set("oly_rituals",updated); setCustomRituals(updated);
      setRitualObjective(""); notify(`${generated.length} rituales añadidos`);
    } catch(e){notify("Error IA: "+e.message);}
    setLoadingRitualIA(false);
  }

  function calcCal(actId,mins,kg){
    const a=ACTIVITIES.find(x=>x.id===actId);
    return a?Math.round(a.met*kg*(mins/60)):0;
  }
  function addActivity(){
    if(!actForm.type||!actForm.duration) return;
    const a=ACTIVITIES.find(x=>x.id===actForm.type);
    const cal=calcCal(actForm.type,parseFloat(actForm.duration),profile.weight);
    const newLog={...todayLog,activities:[...(todayLog.activities||[]),{id:actForm.type,label:a.label,glyph:a.glyph,duration:parseFloat(actForm.duration),calories:cal}]};
    saveLogs({...logs,[day]:newLog});
    setActForm({type:"",duration:""});setShowActForm(false);
    notify(`${a.label} · ${cal} kcal`);
  }
  function removeActivity(idx){
    const acts=(todayLog.activities||[]).filter((_,i)=>i!==idx);
    saveLogs({...logs,[day]:{...todayLog,activities:acts}});
  }
  function removeFood(idx){
    const foods=(todayLog.foods||[]).filter((_,i)=>i!==idx);
    saveLogs({...logs,[day]:{...todayLog,foods}});
    ls_set("oly_daily_msg_"+today_str(),null); setDailyMessage(null);
  }
  function removeExercise(idx){
    const exs=(athleteSession.exercises||[]).filter((_,i)=>i!==idx);
    const updated={...athleteSession,exercises:exs};
    saveAthleteSession(updated);
    saveWorkouts({...workouts,[day]:updated});
  }

  async function analyzeFood(){
    if(!foodText.trim()) return;
    setLoadingFood(true);setFoodResult(null);
    try {
      const text = await callClaude([{
        role:"user",
        content:`Analiza estas comidas para hipertrofia. Persona: ${profile.weight}kg, ${profile.height}cm, fase "${profile.phase}", meta proteína: ${proteinGoal}g/día.
Responde SOLO JSON sin backticks ni comentarios:
{"items":[{"name":"","calories":0,"protein":0,"sodium_mg":0}],"total_calories":0,"total_protein":0,"total_sodium":0,"retention_warning":"","tip_hipertrofia":""}

Comidas: ${foodText}`
      }], 700);
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      setFoodResult(parsed);
      const newLogs={...logs,[day]:{...todayLog,foods:[...(todayLog.foods||[]),{description:foodText,calories:parsed.total_calories,protein:parsed.total_protein,sodium:parsed.total_sodium,items:parsed.items}]}};
      saveLogs(newLogs);
      setFoodText("");
      ls_set("oly_daily_msg_"+today_str(),null); setDailyMessage(null);
    } catch(e) { notify("Error analizando comida: "+e.message); }
    setLoadingFood(false);
  }

  function saveWeight(){
    if(!weightInput) return;
    const w=parseFloat(weightInput);
    saveLogs({...logs,[day]:{...todayLog,weight:w}});
    saveProfile({...profile,weight:w});setEditProfile(p=>({...p,weight:w}));
    setWeightInput("");notify(`Peso: ${w} kg`);
  }
  function addWater(ml){
    const newLog={...todayLog,water:(todayLog.water||0)+ml};
    saveLogs({...logs,[day]:newLog});
    notify(`+${ml}ml · ${(newLog.water/1000).toFixed(1)}L total`);
  }
  function handlePhotoUpload(e){
    const file=e.target.files[0];if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const newPhoto={date:day,weight:profile.weight,note:photoNote,data:ev.target.result,timestamp:Date.now()};
      const updated=[newPhoto,...photos].slice(0,20);
      savePhotos(updated);setPhotoNote("");notify("Foto guardada");
    };
    reader.readAsDataURL(file);
  }

  async function consultOracle(){
    setLoadingOracle(true);setOracleAdvice(null);
    try {
      const l7=last7();
      const ctx={profile,avg_burned:Math.round(l7.reduce((s,d)=>s+d.burned,0)/7),avg_eaten:Math.round(l7.reduce((s,d)=>s+d.eaten,0)/7),avg_water:((l7.reduce((s,d)=>s+d.water,0)/7)/1000).toFixed(1)+"L",avg_protein:Math.round(l7.reduce((s,d)=>s+(d.protein||0),0)/7),retention_today:`${retDone}/${customRituals.length}`,photos_count:photos.length,workouts_this_week:Object.keys(workouts).filter(k=>{const d=new Date(k);return new Date()-d<7*86400000;}).length};
      const content=photos.length>0&&photos[0].data?[
        {type:"image",source:{type:"base64",media_type:"image/jpeg",data:photos[0].data.split(",")[1]}},
        {type:"text",text:`Coach experto. Analiza foto y datos:\n${JSON.stringify(ctx)}\nFase: ${profile.phase}\nMeta: ${profile.goal}\nRutina: ${profile.routineType}\n\n## ANÁLISIS VISUAL\n## DIAGNÓSTICO\n## RECOMENDACIONES INMEDIATAS\n## ALERTAS\n## SIGUIENTE OBJETIVO (14 días)`}
      ]:`Coach experto. Datos:\n${JSON.stringify(ctx)}\nFase: ${profile.phase}, Meta: ${profile.goal}, Rutina: ${profile.routineType}\n\n## DIAGNÓSTICO\n## RECOMENDACIONES INMEDIATAS\n## ALERTAS\n## SIGUIENTE OBJETIVO (14 días)`;
      const text = await callClaude([{role:"user",content}], 1200);
      setOracleAdvice(text);
    } catch(e){notify("Error del oráculo: "+e.message);}
    setLoadingOracle(false);
  }

  function last7(){
    return Array.from({length:7},(_,i)=>{
      const d=new Date();d.setDate(d.getDate()-(6-i));
      const key=d.toISOString().split("T")[0];
      const log=logs[key]||{};
      const di=d.getDay();
      return {day:DAYS[di===0?6:di-1],burned:(log.activities||[]).reduce((s,a)=>s+a.calories,0),eaten:(log.foods||[]).reduce((s,f)=>s+f.calories,0),weight:log.weight||null,water:log.water||0,protein:(log.foods||[]).reduce((s,f)=>s+(f.protein||0),0)};
    });
  }

  function addExercise(){
    if(!exForm.name||!exForm.weight) return;
    const exercise={name:exForm.name,sets:parseInt(exForm.sets)||3,reps:parseInt(exForm.reps)||6,weight:parseFloat(exForm.weight),oneRM:calc1RM(parseFloat(exForm.weight),parseInt(exForm.reps)||6),timestamp:Date.now()};
    const updated={...athleteSession,exercises:[...(athleteSession.exercises||[]),exercise]};
    saveAthleteSession(updated);
    saveWorkouts({...workouts,[day]:updated});
    setExForm({name:"",sets:"3",reps:"6",weight:""});
    notify(`${exercise.name} · 1RM: ${exercise.oneRM}kg`);
  }

  async function analyzeSession(){
    if(!(athleteSession.exercises?.length)) return;
    setLoadingAthlete(true);setAthleteAnalysis(null);
    try {
      const volTotal=athleteSession.exercises.reduce((s,e)=>s+e.sets*e.reps*e.weight,0);
      const text = await callClaude([{
        role:"user",
        content:`Coach de hipertrofia. Sesión:
Rutina: ${athleteSession.routineDay||profile.routineType}
Ejercicios: ${JSON.stringify(athleteSession.exercises)}
Volumen: ${Math.round(volTotal)}kg
Perfil: ${profile.weight}kg, ${profile.age}a, fase: ${profile.phase}

SOLO JSON sin backticks:
{"score":8,"volumen_total":${Math.round(volTotal)},"intensidad":"alta","mejoras":[""],"alertas":[""],"proximo_objetivo":"","consejo_recuperacion":""}`
      }], 800);
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setAthleteAnalysis(parsed);
      const updated={...athleteSession,score:parsed.score,analysis:parsed};
      saveAthleteSession(updated);
      saveWorkouts({...workouts,[day]:updated});
    } catch(e){notify("Error: "+e.message);}
    setLoadingAthlete(false);
  }

  function getExerciseHistory(name){
    return Object.entries(workouts)
      .sort(([a],[b])=>a.localeCompare(b)).slice(-8)
      .map(([date,session])=>{
        const ex=(session.exercises||[]).find(e=>e.name.toLowerCase()===name.toLowerCase());
        return {date:date.slice(5),oneRM:ex?.oneRM||0};
      }).filter(d=>d.oneRM>0);
  }

  function getDaysInMonth(y,m){return new Date(y,m+1,0).getDate();}
  function getFirstDay(y,m){const d=new Date(y,m,1).getDay();return d===0?6:d-1;}

  async function generateWeeklyPlan(){
    setLoadingPlan(true);setWeeklyPlan(null);
    try {
      const totalWeeks=Math.floor((new Date()-new Date(new Date().getFullYear(),0,1))/604800000);
      const mesocycle=Math.floor(totalWeeks/8)+1;
      const weekInMeso=totalWeeks%8+1;
      const text = await callClaude([{
        role:"user",
        content:`Plan semanal periodizado:
Rutina: ${profile.routineType||"Push Pull Legs"}
Días: ${profile.trainingDays||6}/semana
Mesociclo: ${mesocycle} (semana ${weekInMeso}/8)
Fase: ${profile.phase}, Peso: ${profile.weight}kg

SOLO JSON sin backticks:
{"mesociclo":${mesocycle},"semana_mesociclo":${weekInMeso},"deload":false,"dias":[{"dia":"Lunes","tipo":"Push","musculos":["Pecho"],"ejercicios_clave":["Press banca 4x6-8"],"volumen_series":16,"rep_range":"6-8","intensidad_pct":85,"notas":""}],"objetivo_semana":"","consejo_periodizacion":""}`
      }], 1400);
      const parsed=JSON.parse(text.replace(/```json|```/g,"").trim());
      setWeeklyPlan(parsed); ls_set("oly_weekly_plan",parsed);
      notify("Plan generado");
    } catch(e){notify("Error: "+e.message);}
    setLoadingPlan(false);
  }

  function toggleCalNote(dateStr){
    if(selectedCalDay===dateStr){setSelectedCalDay(null);return;}
    setSelectedCalDay(dateStr); setCalNoteInput(calDayNote[dateStr]||"");
  }
  function saveCalNote(){
    if(!selectedCalDay) return;
    const updated={...calDayNote,[selectedCalDay]:calNoteInput};
    ls_set("oly_cal_notes",updated); setCalDayNote(updated);
    setSelectedCalDay(null); notify("Nota guardada");
  }

  const last7Data=last7();
  const weightHist=last7Data.filter(d=>d.weight);
  const panel={background:BG_PANEL,border:`1px solid ${STONE}`,borderRadius:0,padding:18,position:"relative",marginBottom:14};
  const fontH="Cinzel,serif",fontB="Cormorant Garamond,Georgia,serif";

  const tabBtn=(id,label)=>(
    <button key={id} onClick={()=>setTab(id)} style={{
      padding:"10px 8px",background:"transparent",border:"none",
      borderBottom:tab===id?`2px solid ${GOLD}`:"2px solid transparent",
      color:tab===id?GOLD:"#888",fontFamily:fontH,fontSize:9,
      letterSpacing:2,textTransform:"uppercase",cursor:"pointer",fontWeight:600,
      transition:"all 0.3s",whiteSpace:"nowrap"
    }}>{label}</button>
  );

  const TABS=[["today","Hoy"],["retention","Rituales"],["nutrition","Ambrosía"],["athlete","Atleta"],["planning","Planificación"],["progress","Progreso"],["oracle","Oráculo"],["stats","Crónicas"],["settings","Templo"],["guide","Guía"]];

  return (
    <div style={{minHeight:"100vh",background:`radial-gradient(ellipse at top,#1a1612,${BG_DARK})`,color:MARBLE,paddingBottom:80,fontFamily:fontB}}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",opacity:0.03,backgroundImage:`repeating-linear-gradient(45deg,${MARBLE} 0,${MARBLE} 1px,transparent 1px,transparent 4px)`}}/>
      <div style={{position:"fixed",top:80,left:-20,pointerEvents:"none"}}><Laurel side="left" size={100}/></div>
      <div style={{position:"fixed",top:80,right:-20,pointerEvents:"none"}}><Laurel side="right" size={100}/></div>

      {notif&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:999,background:BG_PANEL,border:`1px solid ${GOLD}`,color:GOLD,padding:"12px 28px",fontFamily:fontH,fontSize:11,letterSpacing:3,textTransform:"uppercase"}}>{notif}</div>
      )}

      <div style={{background:`linear-gradient(180deg,#1c1814,${BG_DARK})`,borderBottom:`1px solid ${STONE}`,padding:"24px 16px 0",position:"relative"}}>
        <div style={{position:"absolute",top:12,right:16}}><GreekBust size={60}/></div>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:4}}>
            <div style={{fontFamily:fontH,fontSize:26,color:GOLD,letterSpacing:12,fontWeight:600}}>OLYMPUS</div>
            <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:6,marginTop:2}}>VIRTUS · DISCIPLINA · GLORIA</div>
          </div>
          <Meander/>
          <div style={{textAlign:"center",marginBottom:6}}>
            <div style={{fontFamily:fontB,fontSize:28,fontStyle:"italic",color:MARBLE,fontWeight:300}}>{greet(profile.name)}</div>
            <div style={{fontFamily:fontH,fontSize:9,color:"#666",letterSpacing:4,marginTop:4,textTransform:"uppercase"}}>
              {new Date().toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:32,padding:"16px 0 12px"}}>
            <Stat label="MASA" value={`${profile.weight}`} unit="kg"/>
            <div style={{width:1,background:STONE,height:30}}/>
            <Stat label="FASE" value={profile.phase.split(" ")[0]} unit="" small/>
            <div style={{width:1,background:STONE,height:30}}/>
            <Stat label="RITUAL" value={`${retDone}`} unit={`/${customRituals.length}`}/>
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:0,overflowX:"auto",borderTop:`1px solid ${STONE}`}}>
            {TABS.map(([id,l])=>tabBtn(id,l))}
          </div>
        </div>
      </div>

      <div style={{padding:"20px 16px",maxWidth:640,margin:"0 auto"}}>

        {/* ── HOY ── */}
        {tab==="today"&&<>
          {/* Hero: barra calórica grande */}
          <div style={{...panel,borderColor:eaten>tdee?RED:eaten>tdee*0.8?GOLD:STONE,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:4}}>
              <div style={{fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:4}}>EDICTO CALÓRICO</div>
              <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2}}>{profile.phase}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",margin:"8px 0 4px"}}>
              <div style={{fontFamily:fontH,fontSize:34,color:eaten>tdee?RED:GOLD,fontWeight:700,lineHeight:1}}>{eaten}</div>
              <div style={{fontFamily:fontH,fontSize:14,color:MARBLE}}>/ {tdee} <span style={{fontSize:10,color:GOLD_DIM}}>kcal</span></div>
            </div>
            <ProgressBar value={eaten} max={tdee} color={eaten>tdee?RED:eaten>tdee*0.8?GOLD:"#6a8a5a"} height={10}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#777"}}>{calPct}% completado</span>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:GOLD_DIM}}>{eaten>tdee?`+${eaten-tdee} exceso`:`${tdee-eaten} restantes`}</span>
            </div>
            {/* IA message */}
            <div style={{marginTop:12,padding:12,background:"#0e0c0a",border:`1px solid ${STONE}`,minHeight:48}}>
              {loadingMessage?(
                <div style={{fontFamily:fontB,fontStyle:"italic",color:GOLD_DIM,fontSize:13,textAlign:"center",padding:"4px 0"}}>El oráculo contempla tu día...</div>
              ):dailyMessage?(
                <div style={{fontFamily:fontB,fontStyle:"italic",color:MARBLE,fontSize:14,lineHeight:1.6}}>{dailyMessage}</div>
              ):(
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:fontB,fontStyle:"italic",color:"#555",fontSize:13}}>— Consulta el dictamen del día —</span>
                  <button onClick={()=>generateDailyMessage(eaten,tdee,totalProtein,proteinGoal)} style={{...ghostBtn,padding:"4px 10px",fontSize:9}}>Generar</button>
                </div>
              )}
            </div>
            {dailyMessage&&(
              <button onClick={()=>{ls_set("oly_daily_msg_"+today_str(),null);setDailyMessage(null);generateDailyMessage(eaten,tdee,totalProtein,proteinGoal);}} style={{...ghostBtn,width:"100%",marginTop:8,fontSize:9,padding:"6px"}}>↻ Actualizar mensaje</button>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            <BigStat icon="🔥" val={burned} label="Quemadas" color={GOLD}/>
            <BigStat icon="◉" val={`${Math.round(totalProtein)}g`} label="Proteína" color={totalProtein>=proteinGoal?GOLD:MARBLE} small/>
            <BigStat icon={balance<=0?"↓":"↑"} val={Math.abs(balance)} label={balance<=0?"Déficit":"Exceso"} color={balance<=0?GOLD:RED}/>
            <BigStat icon="ψ" val={`${(water/1000).toFixed(1)}L`} label="Hidor" color={MARBLE} small/>
          </div>

          <div style={panel}>
            <SectionTitle icon="◉" title="Proteína · Hipertrofia" subtitle={`Meta: ${proteinGoal}g · 2.2g/kg`}/>
            <ProgressBar value={totalProtein} max={proteinGoal} color={totalProtein>=proteinGoal?GOLD:"#5a7a5a"} height={6}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#777"}}>{Math.round(totalProtein)}g consumidos</span>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:totalProtein>=proteinGoal?GOLD:GOLD_DIM}}>{proteinGoal-Math.round(totalProtein)>0?`Faltan ${proteinGoal-Math.round(totalProtein)}g`:"✓ Meta cumplida"}</span>
            </div>
          </div>

          <div style={panel}>
            <SectionTitle icon="ψ" title="Hidor · Hidratación" subtitle="META · 2.5—3L"/>
            <div style={{display:"flex",gap:8,marginBottom:10,marginTop:10}}>
              <input type="number" placeholder="ml" value={waterInput} onChange={e=>setWaterInput(e.target.value)} style={inputStyle}/>
              {[250,500,750].map(ml=><button key={ml} onClick={()=>addWater(ml)} style={ghostBtn}>+{ml}</button>)}
              <button onClick={()=>{if(waterInput){addWater(parseFloat(waterInput));setWaterInput("");}}} style={primaryBtn}>OK</button>
            </div>
            <div style={{display:"flex",gap:3}}>
              {Array.from({length:10}).map((_,i)=><div key={i} style={{flex:1,height:6,background:i<Math.floor(water/300)?GOLD:STONE,transition:"background 0.3s"}}/>)}
            </div>
            <div style={{fontFamily:"Inter,sans-serif",fontSize:10,color:"#666",marginTop:6}}>{(water/1000).toFixed(2)}L de 3L</div>
          </div>

          <div style={panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <SectionTitle icon="⚔" title="Ágon · Entrenamiento"/>
              <button onClick={()=>setShowActForm(!showActForm)} style={ghostBtn}>+ Registrar</button>
            </div>
            {showActForm&&(
              <div style={{background:"#0e0c0a",border:`1px solid ${STONE}`,padding:14,marginTop:10,marginBottom:10}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <select value={actForm.type} onChange={e=>setActForm({...actForm,type:e.target.value})} style={inputStyle}>
                    <option value="">Actividad...</option>
                    {ACTIVITIES.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                  <input type="number" placeholder="Minutos" value={actForm.duration} onChange={e=>setActForm({...actForm,duration:e.target.value})} style={inputStyle}/>
                </div>
                {actForm.type&&actForm.duration&&<div style={{color:GOLD,fontFamily:fontB,fontStyle:"italic",fontSize:14,marginBottom:10}}>≈ {calcCal(actForm.type,parseFloat(actForm.duration),profile.weight)} kcal</div>}
                <button onClick={addActivity} style={{...primaryBtn,width:"100%"}}>Inscribir</button>
              </div>
            )}
            {(todayLog.activities||[]).length===0
              ?<div style={{color:"#555",textAlign:"center",padding:"20px 0",fontStyle:"italic",fontFamily:fontB}}>— Sin gestas registradas hoy —</div>
              :(todayLog.activities||[]).map((a,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",marginTop:8,background:"#0e0c0a",border:`1px solid ${STONE}`,gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
                    <span style={{color:GOLD,fontSize:20,fontFamily:fontH}}>{a.glyph}</span>
                    <div>
                      <div style={{fontFamily:fontH,fontSize:12,letterSpacing:2,color:MARBLE,textTransform:"uppercase"}}>{a.label}</div>
                      <div style={{fontFamily:fontB,fontSize:13,fontStyle:"italic",color:"#777"}}>{a.duration} min</div>
                    </div>
                  </div>
                  <div style={{fontFamily:fontH,color:GOLD,fontWeight:600,fontSize:16}}>-{a.calories}</div>
                  <button style={deleteXBtn} onClick={()=>removeActivity(i)} title="Eliminar">×</button>
                </div>
              ))
            }
          </div>

          <div style={panel}>
            <SectionTitle icon="☥" title="Pondus · Peso del día"/>
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <input type="number" step="0.1" placeholder={`${profile.weight} kg`} value={weightInput} onChange={e=>setWeightInput(e.target.value)} style={inputStyle}/>
              <button onClick={saveWeight} style={primaryBtn}>Sellar</button>
            </div>
            <div style={{display:"flex",gap:28,marginTop:14}}>
              <MiniStat label="ORIGEN" value={`${DEFAULT_PROFILE.startWeight} kg`}/>
              <MiniStat label="ACTUAL" value={`${profile.weight} kg`} color={GOLD}/>
              <MiniStat label="CAMBIO" value={`${(profile.weight-DEFAULT_PROFILE.startWeight).toFixed(1)} kg`} color={profile.weight<=DEFAULT_PROFILE.startWeight?GOLD:RED}/>
            </div>
          </div>
        </>}

        {/* ── RITUALES ── */}
        {tab==="retention"&&<>
          <div style={panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <SectionTitle icon="ψ" title="Rituales Anti-Edema"/>
              <button onClick={()=>setEditingRituals(!editingRituals)} style={ghostBtn}>{editingRituals?"Cerrar":"Editar"}</button>
            </div>
            <div style={{marginTop:10}}>
              <span style={{fontFamily:fontH,fontSize:11,color:retDone===customRituals.length?GOLD:"#888",letterSpacing:3}}>{retDone}/{customRituals.length} CUMPLIDO {retDone===customRituals.length?"· VIRTUOSO":""}</span>
            </div>
            <ProgressBar value={retDone} max={customRituals.length||1} color={GOLD} height={6}/>
          </div>

          {/* IA ritual generator */}
          <div style={{...panel,borderColor:GOLD_DIM}}>
            <SectionTitle icon="◉" title="Generar Rituales con IA"/>
            <p style={{fontFamily:fontB,fontStyle:"italic",color:"#888",fontSize:14,lineHeight:1.5,marginTop:6,marginBottom:10}}>Escribe tu objetivo y la IA crea rituales diarios personalizados.</p>
            <input
              placeholder="Ej: reducir retención de líquidos, mejorar recuperación, dormir mejor..."
              value={ritualObjective}
              onChange={e=>setRitualObjective(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={generateRitualsIA}
              disabled={loadingRitualIA||!ritualObjective.trim()}
              style={{...primaryBtn,width:"100%",marginTop:10,opacity:loadingRitualIA?0.5:1}}
            >
              {loadingRitualIA?"El oráculo diseña tus rituales...":"◈ Generar Rituales con IA"}
            </button>
          </div>

          {editingRituals&&(
            <div style={{...panel,borderColor:STONE}}>
              <SectionTitle icon="◈" title="Gestionar Rituales"/>
              {customRituals.map((r,i)=>(
                <div key={r.key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${STONE}`}}>
                  <div>
                    <span style={{fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:2}}>{r.icon} {r.label}</span>
                    <div style={{fontFamily:fontB,fontSize:12,color:"#666",fontStyle:"italic"}}>{r.desc}</div>
                  </div>
                  <button onClick={()=>{const u=customRituals.filter((_,idx)=>idx!==i);ls_set("oly_rituals",u);setCustomRituals(u);}} style={{...dangerBtn,padding:"4px 10px",fontSize:9}}>QUITAR</button>
                </div>
              ))}
              <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr 60px",gap:8}}>
                <input placeholder="Ritual..." value={newRitual.label} onChange={e=>setNewRitual({...newRitual,label:e.target.value})} style={inputStyle}/>
                <input placeholder="Descripción..." value={newRitual.desc} onChange={e=>setNewRitual({...newRitual,desc:e.target.value})} style={inputStyle}/>
                <input placeholder="⚘" value={newRitual.icon} onChange={e=>setNewRitual({...newRitual,icon:e.target.value})} style={inputStyle}/>
              </div>
              <button onClick={()=>{
                if(!newRitual.label) return;
                const r={key:"custom_"+Date.now(),label:newRitual.label,desc:newRitual.desc,icon:newRitual.icon||"◈"};
                const u=[...customRituals,r];ls_set("oly_rituals",u);setCustomRituals(u);
                setNewRitual({label:"",desc:"",icon:"◈"});notify("Ritual añadido");
              }} style={{...primaryBtn,width:"100%",marginTop:10}}>+ Añadir Manual</button>
            </div>
          )}

          {customRituals.map(tip=>(
            <div key={tip.key} onClick={()=>{const u={...retChecks,[tip.key]:!retChecks[tip.key]};saveRet(u);if(!retChecks[tip.key])notify(`${tip.label} · Cumplido`);}} style={{
              display:"flex",alignItems:"center",gap:14,padding:"16px 18px",
              background:retChecks[tip.key]?"#1a1612":BG_PANEL,border:`1px solid ${retChecks[tip.key]?GOLD:STONE}`,
              marginBottom:8,cursor:"pointer",transition:"all 0.25s"
            }}>
              <div style={{width:26,height:26,borderRadius:"50%",border:`1px solid ${GOLD}`,background:retChecks[tip.key]?GOLD:"transparent",color:BG_DARK,fontFamily:fontH,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{retChecks[tip.key]?"✓":""}</div>
              <div style={{color:GOLD,fontSize:22,fontFamily:fontH,minWidth:26,textAlign:"center"}}>{tip.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:fontH,fontSize:12,letterSpacing:2,color:retChecks[tip.key]?GOLD:MARBLE,textTransform:"uppercase",fontWeight:500}}>{tip.label}</div>
                <div style={{fontFamily:fontB,fontSize:14,fontStyle:"italic",color:"#777",marginTop:2}}>{tip.desc}</div>
              </div>
            </div>
          ))}

          <div style={panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <SectionTitle icon="⚕" title="Mi Stack Personal"/>
              <button onClick={()=>setEditingStack(!editingStack)} style={ghostBtn}>{editingStack?"Cerrar":"Editar"}</button>
            </div>
            {personalStack.length===0&&!editingStack&&(
              <p style={{fontFamily:fontB,fontStyle:"italic",color:"#666",fontSize:14,marginTop:8}}>— Añade tus suplementos y hábitos personales —</p>
            )}
            {personalStack.map((item,i)=>(
              <div key={i} style={{padding:"10px 0",borderBottom:`1px solid ${STONE}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:2,textTransform:"uppercase"}}>{item.name}</div>
                  <div style={{fontFamily:fontB,fontSize:13,fontStyle:"italic",color:"#777",marginTop:2}}>{item.desc}</div>
                </div>
                {editingStack&&<button onClick={()=>{const u=personalStack.filter((_,idx)=>idx!==i);ls_set("oly_stack",u);setPersonalStack(u);}} style={{...dangerBtn,padding:"4px 10px",fontSize:9}}>QUITAR</button>}
              </div>
            ))}
            {editingStack&&(
              <div style={{marginTop:12}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                  <input placeholder="Suplemento / hábito..." value={newStack.name} onChange={e=>setNewStack({...newStack,name:e.target.value})} style={inputStyle}/>
                  <input placeholder="Dosis / descripción..." value={newStack.desc} onChange={e=>setNewStack({...newStack,desc:e.target.value})} style={inputStyle}/>
                </div>
                <button onClick={()=>{
                  if(!newStack.name) return;
                  const u=[...personalStack,{name:newStack.name,desc:newStack.desc}];
                  ls_set("oly_stack",u);setPersonalStack(u);
                  setNewStack({name:"",desc:""});notify("Añadido al stack");
                }} style={{...primaryBtn,width:"100%"}}>+ Añadir al Stack</button>
              </div>
            )}
          </div>
        </>}

        {/* ── AMBROSÍA ── */}
        {tab==="nutrition"&&<>
          <div style={{...panel,borderColor:totalProtein>=proteinGoal?GOLD:STONE}}>
            <SectionTitle icon="◉" title="Proteína del Día" subtitle={`Meta hipertrofia: ${proteinGoal}g · 2.2g/kg`}/>
            <ProgressBar value={totalProtein} max={proteinGoal} color={totalProtein>=proteinGoal?GOLD:"#5a7a5a"} height={6}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:13,color:MARBLE,fontWeight:600}}>{Math.round(totalProtein)}g</span>
              <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:totalProtein>=proteinGoal?GOLD:"#888"}}>{totalProtein>=proteinGoal?"✓ Meta cumplida":`${Math.round(proteinGoal-totalProtein)}g restantes`}</span>
            </div>
          </div>
          <div style={panel}>
            <SectionTitle icon="🍇" title="Ambrosía · Registrar Comida"/>
            <textarea placeholder={"Describe lo que comiste...\n\nEj: avena con plátano y 2 huevos\narroz integral con pollo 200g\nalmendras"} value={foodText} onChange={e=>setFoodText(e.target.value)} rows={5}
              style={{...inputStyle,resize:"none",padding:14,fontFamily:fontB,fontSize:15,marginTop:10}}/>
            <button onClick={analyzeFood} disabled={loadingFood||!foodText.trim()} style={{...primaryBtn,width:"100%",marginTop:10,opacity:loadingFood?0.5:1}}>
              {loadingFood?"Invocando al oráculo...":"◈ Analizar con IA"}
            </button>
          </div>
          {foodResult&&(
            <div style={panel}>
              <SectionTitle icon="✦" title="Análisis Nutricional"/>
              <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${STONE}`}}>
                <Pill label="Kcal" value={foodResult.total_calories} color={GOLD}/>
                <Pill label="Proteína" value={`${foodResult.total_protein}g`} color={MARBLE}/>
                <Pill label="Sodio" value={`${foodResult.total_sodium}mg`} color={foodResult.total_sodium>1500?RED:MARBLE}/>
              </div>
              {foodResult.items.map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${STONE}`}}>
                  <span style={{fontFamily:fontB,fontSize:15,color:MARBLE}}>{item.name}</span>
                  <div style={{display:"flex",gap:12}}>
                    <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:GOLD}}>{item.calories}kcal</span>
                    <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#5a7a5a"}}>{item.protein}g P</span>
                    <span style={{fontFamily:"Inter,sans-serif",fontSize:12,color:"#666"}}>{item.sodium_mg}mg Na</span>
                  </div>
                </div>
              ))}
              {foodResult.retention_warning&&<div style={{marginTop:12,padding:12,border:`1px solid ${RED}`,color:"#e09090",fontFamily:fontB,fontStyle:"italic",fontSize:14}}>⚠ {foodResult.retention_warning}</div>}
              {foodResult.tip_hipertrofia&&<div style={{marginTop:10,fontFamily:fontB,fontStyle:"italic",color:GOLD,fontSize:14}}>◆ {foodResult.tip_hipertrofia}</div>}
            </div>
          )}
          {(todayLog.foods||[]).length>0&&(
            <div style={panel}>
              <SectionTitle icon="📜" title="Registro del Día"/>
              {(todayLog.foods||[]).map((f,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${STONE}`,gap:8}}>
                  <span style={{fontFamily:fontB,fontSize:14,color:"#999",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>{f.description}</span>
                  <div style={{display:"flex",gap:12,flexShrink:0,alignItems:"center"}}>
                    <span style={{fontFamily:fontH,color:"#5a7a5a",fontSize:12}}>{Math.round(f.protein||0)}g P</span>
                    <span style={{fontFamily:fontH,color:GOLD,fontSize:13}}>{f.calories} kcal</span>
                    <button style={deleteXBtn} onClick={()=>removeFood(i)} title="Eliminar">×</button>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:10,borderTop:`1px solid ${GOLD}`}}>
                <span style={{fontFamily:fontH,color:GOLD,letterSpacing:3,fontSize:12}}>TOTAL</span>
                <div style={{display:"flex",gap:20}}>
                  <span style={{fontFamily:fontH,color:"#5a7a5a",fontSize:13}}>{Math.round(totalProtein)}g proteína</span>
                  <span style={{fontFamily:fontH,color:GOLD,fontWeight:600}}>{eaten} kcal</span>
                </div>
              </div>
            </div>
          )}
        </>}

        {/* ── ATLETA ── */}
        {tab==="athlete"&&<>
          <div style={panel}>
            <SectionTitle icon="🏛" title="Sesión de Hoy" subtitle={`Rutina: ${profile.routineType||"Push Pull Legs"}`}/>
            <div style={{marginTop:10}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>DÍA DE HOY</div>
              <input value={athleteSession.routineDay||""} onChange={e=>saveAthleteSession({...athleteSession,routineDay:e.target.value})} placeholder="Ej: Push · Pecho & Hombros" style={inputStyle}/>
            </div>
          </div>
          <div style={panel}>
            <SectionTitle icon="◈" title="Registrar Ejercicio" subtitle="Rango óptimo hipertrofia: 6-8 reps"/>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:8,marginTop:10}}>
              <input placeholder="Ejercicio..." value={exForm.name} onChange={e=>setExForm({...exForm,name:e.target.value})} style={inputStyle}/>
              <input type="number" placeholder="Series" value={exForm.sets} onChange={e=>setExForm({...exForm,sets:e.target.value})} style={inputStyle}/>
              <input type="number" placeholder="Reps" value={exForm.reps} onChange={e=>setExForm({...exForm,reps:e.target.value})} style={inputStyle}/>
              <input type="number" placeholder="kg" value={exForm.weight} onChange={e=>setExForm({...exForm,weight:e.target.value})} style={inputStyle}/>
            </div>
            {exForm.weight&&exForm.reps&&(
              <div style={{fontFamily:fontB,fontStyle:"italic",color:GOLD,fontSize:14,marginTop:8}}>
                1RM estimado: {calc1RM(parseFloat(exForm.weight)||0,parseInt(exForm.reps)||1)} kg
              </div>
            )}
            <button onClick={addExercise} style={{...primaryBtn,width:"100%",marginTop:10}}>+ Inscribir Ejercicio</button>
          </div>
          {(athleteSession.exercises||[]).length>0&&(
            <div style={panel}>
              <SectionTitle icon="✦" title="Ejercicios de la Sesión"/>
              {(athleteSession.exercises||[]).map((ex,i)=>(
                <div key={i} style={{padding:"12px 0",borderBottom:`1px solid ${STONE}`,display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:fontH,fontSize:12,letterSpacing:2,color:MARBLE,textTransform:"uppercase"}}>{ex.name}</div>
                    <div style={{fontFamily:fontB,fontSize:14,fontStyle:"italic",color:"#777",marginTop:2}}>{ex.sets}×{ex.reps} · {ex.weight}kg</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:fontH,fontSize:16,color:GOLD,fontWeight:600}}>{ex.oneRM}kg</div>
                    <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2}}>1RM</div>
                  </div>
                  <button style={deleteXBtn} onClick={()=>removeExercise(i)} title="Eliminar">×</button>
                </div>
              ))}
              <div style={{display:"flex",gap:10,marginTop:14}}>
                <button onClick={analyzeSession} disabled={loadingAthlete} style={{...primaryBtn,flex:1,opacity:loadingAthlete?0.5:1}}>
                  {loadingAthlete?"Analizando...":"◈ Análisis IA Hipertrofia"}
                </button>
                <button onClick={()=>setShow1RM(!show1RM)} style={ghostBtn}>1RM</button>
              </div>
            </div>
          )}
          {show1RM&&(
            <div style={panel}>
              <SectionTitle icon="↯" title="Calculadora 1RM · Epley"/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
                <div>
                  <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>PESO (kg)</div>
                  <input type="number" value={oneRMForm.weight} onChange={e=>setOneRMForm({...oneRMForm,weight:e.target.value})} style={inputStyle}/>
                </div>
                <div>
                  <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>REPETICIONES</div>
                  <input type="number" value={oneRMForm.reps} onChange={e=>setOneRMForm({...oneRMForm,reps:e.target.value})} style={inputStyle}/>
                </div>
              </div>
              {oneRMForm.weight&&oneRMForm.reps&&(
                <div style={{marginTop:16,textAlign:"center"}}>
                  <div style={{fontFamily:fontH,fontSize:36,color:GOLD,fontWeight:700}}>{calc1RM(parseFloat(oneRMForm.weight),parseInt(oneRMForm.reps))} kg</div>
                  <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:4,marginTop:4}}>1 REP MAX ESTIMADO</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:16}}>
                    {[0.9,0.8,0.7,0.6].map(pct=>(
                      <div key={pct} style={{background:"#0e0c0a",border:`1px solid ${STONE}`,padding:"10px 6px",textAlign:"center"}}>
                        <div style={{fontFamily:fontH,fontSize:14,color:MARBLE,fontWeight:600}}>{Math.round(calc1RM(parseFloat(oneRMForm.weight),parseInt(oneRMForm.reps))*pct)}kg</div>
                        <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2,marginTop:2}}>{Math.round(pct*100)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {athleteAnalysis&&(
            <div style={{...panel,borderColor:GOLD}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <SectionTitle icon="◉" title="Veredicto de la Sesión"/>
                <div style={{textAlign:"center"}}>
                  <div style={{fontFamily:fontH,fontSize:32,color:GOLD,fontWeight:700}}>{athleteAnalysis.score}/10</div>
                  <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2}}>PUNTUACIÓN</div>
                </div>
              </div>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:2,marginBottom:12}}>INTENSIDAD: <span style={{color:MARBLE}}>{athleteAnalysis.intensidad?.toUpperCase()}</span> · VOLUMEN: <span style={{color:MARBLE}}>{athleteAnalysis.volumen_total}kg</span></div>
              {athleteAnalysis.mejoras?.length>0&&<div style={{marginBottom:10}}><div style={{fontFamily:fontH,fontSize:10,color:GOLD,letterSpacing:3,marginBottom:6}}>MEJORAS</div>{athleteAnalysis.mejoras.map((m,i)=><div key={i} style={{fontFamily:fontB,fontSize:14,color:MARBLE,marginBottom:4}}>· {m}</div>)}</div>}
              {athleteAnalysis.alertas?.length>0&&<div style={{marginBottom:10}}><div style={{fontFamily:fontH,fontSize:10,color:RED,letterSpacing:3,marginBottom:6}}>ALERTAS</div>{athleteAnalysis.alertas.map((a,i)=><div key={i} style={{fontFamily:fontB,fontSize:14,color:"#e09090",marginBottom:4}}>⚠ {a}</div>)}</div>}
              {athleteAnalysis.proximo_objetivo&&<div style={{padding:12,background:"#0e0c0a",border:`1px solid ${GOLD_DIM}`,fontFamily:fontB,fontStyle:"italic",color:GOLD,fontSize:14,marginTop:10}}>Próximo: {athleteAnalysis.proximo_objetivo}</div>}
              {athleteAnalysis.consejo_recuperacion&&<div style={{fontFamily:fontB,fontStyle:"italic",color:"#888",fontSize:13,marginTop:10}}>Recuperación: {athleteAnalysis.consejo_recuperacion}</div>}
            </div>
          )}
          <div style={panel}>
            <SectionTitle icon="◐" title="Historial por Ejercicio" subtitle="Progresión de 1RM"/>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,marginBottom:12}}>
              {[...new Set(Object.values(workouts).flatMap(s=>(s.exercises||[]).map(e=>e.name)))].slice(0,8).map(name=>(
                <button key={name} onClick={()=>setSelectedExercise(selectedExercise===name?null:name)} style={{
                  padding:"6px 12px",background:selectedExercise===name?GOLD:"transparent",
                  border:`1px solid ${selectedExercise===name?GOLD:STONE}`,
                  color:selectedExercise===name?BG_DARK:MARBLE,
                  fontFamily:fontH,fontSize:9,letterSpacing:2,cursor:"pointer",textTransform:"uppercase"
                }}>{name}</button>
              ))}
            </div>
            {selectedExercise&&(()=>{
              const hist=getExerciseHistory(selectedExercise);
              return hist.length>1?(
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={hist}>
                    <XAxis dataKey="date" tick={{fill:"#777",fontSize:10,fontFamily:"Cinzel"}} axisLine={{stroke:STONE}} tickLine={false}/>
                    <YAxis domain={["auto","auto"]} tick={{fill:"#666",fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:BG_DARK,border:`1px solid ${GOLD}`}} formatter={v=>[`${v}kg`,"1RM"]}/>
                    <Line type="monotone" dataKey="oneRM" stroke={GOLD} strokeWidth={2} dot={{fill:GOLD,r:4}}/>
                  </LineChart>
                </ResponsiveContainer>
              ):<div style={{fontFamily:fontB,fontStyle:"italic",color:"#666",textAlign:"center",padding:"20px 0"}}>Registra más sesiones para ver el progreso</div>;
            })()}
          </div>
        </>}

        {/* ── PLANIFICACIÓN ── */}
        {tab==="planning"&&<>
          <div style={panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <SectionTitle icon="◈" title="Plan Semanal IA" subtitle={`${profile.routineType} · ${profile.trainingDays||6} días/semana`}/>
              <button onClick={generateWeeklyPlan} disabled={loadingPlan} style={{...primaryBtn,opacity:loadingPlan?0.5:1,fontSize:9,padding:"8px 14px"}}>
                {loadingPlan?"Generando...":"Generar"}
              </button>
            </div>
            {weeklyPlan&&(
              <div style={{marginTop:14}}>
                <div style={{display:"flex",gap:20,marginBottom:12}}>
                  <div><div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:3}}>MESOCICLO</div><div style={{fontFamily:fontH,fontSize:18,color:GOLD,fontWeight:600}}>{weeklyPlan.mesociclo}</div></div>
                  <div><div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:3}}>SEMANA</div><div style={{fontFamily:fontH,fontSize:18,color:MARBLE,fontWeight:600}}>{weeklyPlan.semana_mesociclo}/8</div></div>
                  {weeklyPlan.deload&&<div style={{padding:"6px 14px",border:`1px solid ${GOLD}`,color:GOLD,fontFamily:fontH,fontSize:10,letterSpacing:2,alignSelf:"flex-start",marginTop:4}}>DELOAD</div>}
                </div>
                {weeklyPlan.objetivo_semana&&<div style={{fontFamily:fontB,fontStyle:"italic",color:GOLD,fontSize:15,marginBottom:12}}>"{weeklyPlan.objetivo_semana}"</div>}
                {(weeklyPlan.dias||[]).map((d,i)=>(
                  <div key={i} style={{padding:"14px 0",borderBottom:`1px solid ${STONE}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                      <div style={{fontFamily:fontH,fontSize:12,color:GOLD,letterSpacing:3,textTransform:"uppercase"}}>{d.dia}</div>
                      <div style={{fontFamily:fontH,fontSize:10,color:MARBLE,letterSpacing:2}}>{d.tipo}</div>
                    </div>
                    <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2,marginBottom:4}}>{d.musculos?.join(" · ")} · {d.rep_range} · {d.intensidad_pct}% · {d.volumen_series} series</div>
                    {(d.ejercicios_clave||[]).map((ej,j)=><div key={j} style={{fontFamily:fontB,fontSize:13,color:"#888",fontStyle:"italic",marginBottom:2}}>— {ej}</div>)}
                    {d.notas&&<div style={{fontFamily:fontB,fontSize:12,color:GOLD_DIM,fontStyle:"italic",marginTop:4}}>{d.notas}</div>}
                  </div>
                ))}
                {weeklyPlan.consejo_periodizacion&&<div style={{marginTop:12,padding:12,background:"#0e0c0a",border:`1px solid ${GOLD_DIM}`,fontFamily:fontB,fontStyle:"italic",color:MARBLE,fontSize:14}}>◆ {weeklyPlan.consejo_periodizacion}</div>}
              </div>
            )}
            {!weeklyPlan&&!loadingPlan&&<div style={{fontFamily:fontB,fontStyle:"italic",color:"#666",textAlign:"center",padding:"20px 0"}}>— Genera tu plan periodizado personalizado —</div>}
          </div>
          <div style={panel}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <SectionTitle icon="◐" title="Calendario" subtitle={`${MONTHS[planMonth]} ${planYear}`}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{if(planMonth===0){setPlanMonth(11);setPlanYear(y=>y-1);}else setPlanMonth(m=>m-1);}} style={{...ghostBtn,padding:"6px 10px"}}>‹</button>
                <button onClick={()=>{if(planMonth===11){setPlanMonth(0);setPlanYear(y=>y+1);}else setPlanMonth(m=>m+1);}} style={{...ghostBtn,padding:"6px 10px"}}>›</button>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:6}}>
              {["L","M","X","J","V","S","D"].map(d=><div key={d} style={{textAlign:"center",fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2,padding:"4px 0"}}>{d}</div>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
              {Array.from({length:getFirstDay(planYear,planMonth)}).map((_,i)=><div key={"e"+i}/>)}
              {Array.from({length:getDaysInMonth(planYear,planMonth)}).map((_,i)=>{
                const d=i+1;
                const dateStr=`${planYear}-${String(planMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                const hasWorkout=!!workouts[dateStr];
                const isToday=dateStr===today_str();
                const isSelected=selectedCalDay===dateStr;
                return (
                  <div key={d} onClick={()=>toggleCalNote(dateStr)} style={{textAlign:"center",padding:"8px 2px",cursor:"pointer",background:isSelected?GOLD:isToday?"#1c1814":"transparent",border:`1px solid ${isSelected?GOLD:isToday?GOLD_DIM:hasWorkout?STONE:"transparent"}`}}>
                    <div style={{fontFamily:fontH,fontSize:11,color:isSelected?BG_DARK:isToday?GOLD:MARBLE}}>{d}</div>
                    {hasWorkout&&<div style={{width:4,height:4,borderRadius:"50%",background:isSelected?BG_DARK:GOLD,margin:"2px auto 0"}}/>}
                  </div>
                );
              })}
            </div>
            {selectedCalDay&&(
              <div style={{marginTop:14,padding:14,background:"#0e0c0a",border:`1px solid ${STONE}`}}>
                <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:8}}>{selectedCalDay}</div>
                <textarea value={calNoteInput} onChange={e=>setCalNoteInput(e.target.value)} placeholder="Nota para este día..." rows={3} style={{...inputStyle,resize:"none"}}/>
                <button onClick={saveCalNote} style={{...primaryBtn,width:"100%",marginTop:8}}>Guardar Nota</button>
              </div>
            )}
          </div>
          <div style={panel}>
            <SectionTitle icon="↯" title="Mesociclos · 12 Meses"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginTop:14}}>
              {MONTHS.map((m,i)=>{
                const meso=Math.floor(i/2)+1;
                const isCurrentMeso=Math.floor(new Date().getMonth()/2)===Math.floor(i/2);
                return (
                  <div key={i} style={{background:isCurrentMeso?"#1c1814":BG_PANEL,border:`1px solid ${isCurrentMeso?GOLD:STONE}`,padding:"8px 4px",textAlign:"center"}}>
                    <div style={{fontFamily:fontH,fontSize:8,color:isCurrentMeso?GOLD:GOLD_DIM,letterSpacing:1}}>{m.slice(0,3).toUpperCase()}</div>
                    <div style={{fontFamily:fontH,fontSize:10,color:isCurrentMeso?GOLD:MARBLE,marginTop:2}}>M{meso}</div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:12,fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:2}}>MESOCICLO ACTUAL: {Math.floor(new Date().getMonth()/2)+1} · SEMANA {Math.ceil(new Date().getDate()/7)}/8</div>
          </div>
        </>}

        {/* ── PROGRESO ── */}
        {tab==="progress"&&<>
          <div style={panel}>
            <SectionTitle icon="📷" title="Memoria Visual" subtitle="Registra tu transformación"/>
            <input type="text" placeholder="Nota opcional (ej: semana 3, mañana en ayunas)" value={photoNote} onChange={e=>setPhotoNote(e.target.value)} style={{...inputStyle,marginTop:10}}/>
            <label style={{display:"block",marginTop:10,padding:14,background:"#0e0c0a",border:`1px dashed ${GOLD}`,textAlign:"center",cursor:"pointer",fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:3,textTransform:"uppercase"}}>
              ◈ Subir Foto de Progreso
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
            </label>
          </div>
          {photos.length===0
            ?<div style={{...panel,textAlign:"center"}}><div style={{fontFamily:fontB,fontStyle:"italic",color:"#666",padding:20}}>— Aún no hay imágenes —</div></div>
            :<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {photos.map((p,i)=>(
                  <div key={i} style={{background:BG_PANEL,border:`1px solid ${STONE}`,padding:8}}>
                    <div style={{position:"relative",paddingBottom:"120%",overflow:"hidden",background:"#000"}}>
                      <img src={p.data} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                    <div style={{padding:"8px 4px"}}>
                      <div style={{fontFamily:fontH,fontSize:10,letterSpacing:2,color:GOLD}}>{new Date(p.date).toLocaleDateString("es-CL",{day:"numeric",month:"short"}).toUpperCase()}</div>
                      <div style={{fontFamily:"Inter,sans-serif",fontSize:12,color:MARBLE,marginTop:2}}>{p.weight} kg</div>
                      {p.note&&<div style={{fontFamily:fontB,fontStyle:"italic",color:"#666",fontSize:11,marginTop:4}}>{p.note}</div>}
                      <button onClick={()=>{savePhotos(photos.filter((_,idx)=>idx!==i));notify("Foto eliminada");}} style={{marginTop:6,background:"transparent",border:`1px solid ${STONE}`,color:"#666",padding:"4px 8px",fontFamily:"Inter,sans-serif",fontSize:10,cursor:"pointer"}}>ELIMINAR</button>
                    </div>
                  </div>
                ))}
              </div>
          }
        </>}

        {/* ── ORÁCULO ── */}
        {tab==="oracle"&&<>
          <div style={panel}>
            <SectionTitle icon="◉" title="Oráculo · Coach IA"/>
            <p style={{fontFamily:fontB,fontStyle:"italic",color:"#999",fontSize:15,lineHeight:1.6,marginTop:10}}>Combina tu última foto con todos tus datos para darte un diagnóstico y recomendaciones como coach experto.</p>
            <div style={{marginTop:14,padding:12,background:"#0e0c0a",border:`1px solid ${STONE}`}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3}}>CONTEXTO ACTUAL</div>
              <div style={{fontFamily:fontB,fontSize:14,color:MARBLE,marginTop:6}}>Fase: <b style={{color:GOLD}}>{profile.phase}</b> · Peso: <b style={{color:GOLD}}>{profile.weight}kg</b> · Fotos: <b style={{color:GOLD}}>{photos.length}</b></div>
            </div>
            <button onClick={consultOracle} disabled={loadingOracle} style={{...primaryBtn,width:"100%",marginTop:14,padding:14,opacity:loadingOracle?0.5:1}}>
              {loadingOracle?"El oráculo medita...":"◈ Consultar al Oráculo"}
            </button>
            {photos.length===0&&<div style={{marginTop:10,fontFamily:fontB,fontStyle:"italic",color:"#777",fontSize:13}}>◆ Sube una foto en Progreso para análisis visual completo</div>}
          </div>
          {oracleAdvice&&(
            <div style={{...panel,background:"#100e0c"}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
                <GreekBust size={50}/>
                <div>
                  <div style={{fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:4}}>VEREDICTO DEL ORÁCULO</div>
                  <div style={{fontFamily:fontB,fontSize:11,color:"#666",fontStyle:"italic",marginTop:2}}>{new Date().toLocaleString("es-CL")}</div>
                </div>
              </div>
              <div style={{fontFamily:fontB,color:MARBLE,fontSize:15,lineHeight:1.7}}>
                {oracleAdvice.split("\n").map((line,i)=>{
                  if(line.startsWith("## ")) return <div key={i} style={{fontFamily:fontH,fontSize:11,color:GOLD,letterSpacing:3,marginTop:16,marginBottom:6,textTransform:"uppercase",borderBottom:`1px solid ${GOLD_DIM}`,paddingBottom:4}}>{line.replace("## ","")}</div>;
                  return <div key={i} style={{marginBottom:4}}>{line}</div>;
                })}
              </div>
            </div>
          )}
        </>}

        {/* ── CRÓNICAS ── */}
        {tab==="stats"&&<>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            {[{label:"PESO",value:`${profile.weight}`,unit:"kg"},{label:"TALLA",value:`${profile.height}`,unit:"cm"},{label:"TMB",value:`${bmr}`,unit:"kcal"},{label:"TDEE",value:`${tdee}`,unit:"kcal"}].map(s=>(
              <div key={s.label} style={{background:BG_PANEL,border:`1px solid ${STONE}`,padding:18,textAlign:"center"}}>
                <div style={{fontFamily:fontH,fontSize:28,color:GOLD,fontWeight:600}}>{s.value}</div>
                <div style={{fontFamily:fontB,fontSize:13,color:"#888",fontStyle:"italic"}}>{s.unit}</div>
                <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={panel}>
            <SectionTitle icon="◐" title="Calorías" subtitle="Últimos 7 días"/>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last7Data}>
                <XAxis dataKey="day" tick={{fill:"#777",fontSize:11,fontFamily:"Cinzel"}} axisLine={{stroke:STONE}} tickLine={false}/>
                <YAxis tick={{fill:"#666",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:BG_DARK,border:`1px solid ${GOLD}`,fontFamily:"Inter"}}/>
                <Bar dataKey="burned" name="Quemadas" fill={GOLD}/>
                <Bar dataKey="eaten" name="Comidas" fill={MARBLE} fillOpacity={0.5}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={panel}>
            <SectionTitle icon="◉" title="Proteína" subtitle="Últimos 7 días"/>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={last7Data}>
                <XAxis dataKey="day" tick={{fill:"#777",fontSize:11,fontFamily:"Cinzel"}} axisLine={{stroke:STONE}} tickLine={false}/>
                <YAxis tick={{fill:"#666",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:BG_DARK,border:`1px solid ${GOLD}`}} formatter={v=>[`${v}g`,"Proteína"]}/>
                <Bar dataKey="protein" name="Proteína" fill="#5a7a5a"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {weightHist.length>1&&(
            <div style={panel}>
              <SectionTitle icon="↯" title="Evolución de Peso"/>
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={weightHist}>
                  <XAxis dataKey="day" tick={{fill:"#777",fontSize:11,fontFamily:"Cinzel"}} axisLine={{stroke:STONE}} tickLine={false}/>
                  <YAxis domain={["auto","auto"]} tick={{fill:"#666",fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:BG_DARK,border:`1px solid ${GOLD}`}}/>
                  <Line type="monotone" dataKey="weight" stroke={GOLD} strokeWidth={2} dot={{fill:GOLD,r:4}}/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={panel}>
            <SectionTitle icon="ψ" title="Hidratación" subtitle="Últimos 7 días"/>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={last7Data}>
                <XAxis dataKey="day" tick={{fill:"#777",fontSize:11,fontFamily:"Cinzel"}} axisLine={{stroke:STONE}} tickLine={false}/>
                <YAxis tickFormatter={v=>`${(v/1000).toFixed(1)}L`} tick={{fill:"#666",fontSize:10}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={v=>[`${(v/1000).toFixed(2)}L`,"Agua"]} contentStyle={{background:BG_DARK,border:`1px solid ${GOLD}`}}/>
                <Bar dataKey="water" fill={MARBLE} fillOpacity={0.7}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {/* ── TEMPLO ── */}
        {tab==="settings"&&<>
          <div style={panel}>
            <SectionTitle icon="◈" title="Templo · Datos Personales"/>
            <FormField label="NOMBRE" value={editProfile.name} onChange={v=>setEditProfile({...editProfile,name:v})}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <FormField label="PESO (kg)" type="number" value={editProfile.weight} onChange={v=>setEditProfile({...editProfile,weight:parseFloat(v)||0})}/>
              <FormField label="TALLA (cm)" type="number" value={editProfile.height} onChange={v=>setEditProfile({...editProfile,height:parseFloat(v)||0})}/>
              <FormField label="EDAD" type="number" value={editProfile.age} onChange={v=>setEditProfile({...editProfile,age:parseInt(v)||0})}/>
            </div>
            <div style={{marginTop:14}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>FASE ACTUAL</div>
              <select value={editProfile.phase} onChange={e=>setEditProfile({...editProfile,phase:e.target.value})} style={{...inputStyle,width:"100%"}}>
                {PHASES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <FormField label="META PRINCIPAL" value={editProfile.goal} onChange={v=>setEditProfile({...editProfile,goal:v})}/>
            <div style={{marginTop:14}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>NIVEL DE ACTIVIDAD</div>
              <select value={editProfile.activityLevel} onChange={e=>setEditProfile({...editProfile,activityLevel:parseFloat(e.target.value)})} style={{...inputStyle,width:"100%"}}>
                <option value={1.2}>Sedentario</option>
                <option value={1.375}>Ligero (1–3 días/semana)</option>
                <option value={1.55}>Moderado (3–5 días/semana)</option>
                <option value={1.725}>Intenso (6–7 días/semana)</option>
                <option value={1.9}>Atleta doble jornada</option>
              </select>
            </div>
            <div style={{marginTop:14}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>TIPO DE RUTINA PREFERIDA</div>
              <select value={editProfile.routineType||"Push Pull Legs"} onChange={e=>setEditProfile({...editProfile,routineType:e.target.value})} style={{...inputStyle,width:"100%"}}>
                {ROUTINE_TYPES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{marginTop:14}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:3,marginBottom:6}}>DÍAS DE ENTRENAMIENTO POR SEMANA</div>
              <select value={editProfile.trainingDays||6} onChange={e=>setEditProfile({...editProfile,trainingDays:parseInt(e.target.value)})} style={{...inputStyle,width:"100%"}}>
                {[3,4,5,6,7].map(d=><option key={d} value={d}>{d} días/semana</option>)}
              </select>
            </div>
            <button onClick={()=>{saveProfile(editProfile);notify("Templo actualizado");}} style={{...primaryBtn,width:"100%",marginTop:18,padding:14}}>◈ Sellar Cambios</button>
          </div>
          <div style={{...panel,borderColor:"#3a2020"}}>
            <SectionTitle icon="⚠" title="Zona Roja"/>
            <p style={{fontFamily:fontB,fontStyle:"italic",color:"#777",fontSize:13,marginTop:8}}>Borrar todo el historial es irreversible.</p>
            <button onClick={()=>{if(window.confirm("¿Borrar TODOS los datos?")){ls_del("oly_logs");ls_del("oly_photos");ls_del("oly_workouts");setLogs({});setPhotos([]);setWorkouts({});notify("Datos borrados");}}} style={{width:"100%",marginTop:10,padding:12,background:"transparent",border:`1px solid ${RED}`,color:RED,fontFamily:fontH,fontSize:11,letterSpacing:3,cursor:"pointer",textTransform:"uppercase"}}>Borrar Historial Completo</button>
          </div>
        </>}

        {/* ── GUÍA ── */}
        {tab==="guide"&&(
          <div style={{paddingBottom:20}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontFamily:fontH,fontSize:20,color:GOLD,letterSpacing:8,fontWeight:600}}>CODEX OLYMPUS</div>
              <div style={{fontFamily:fontH,fontSize:9,color:GOLD_DIM,letterSpacing:4,marginTop:4}}>GUÍA DEL GLADIADOR DIGITAL</div>
              <Meander/>
            </div>

            <GuideSection icon="◈" title="Pestaña HOY">
              Tu campo de batalla diario. Aquí controlas todo lo que sucede en el día.
              <br/><br/>
              <GuideTip>El <b>Edicto Calórico</b> es tu marcador principal: la barra grande muestra tu progreso hacia la meta calórica. El mensaje de IA se actualiza automáticamente según la hora y tu ingesta.</GuideTip>
              <GuideTip>Registra <b>Actividades</b> para descontar calorías quemadas. Usa el botón <b>×</b> para eliminar registros incorrectos.</GuideTip>
              <GuideTip>Registra tu <b>Peso</b> siempre en ayunas y en las mismas condiciones para comparaciones válidas.</GuideTip>
              <GuideTip>Hidratación: 2.5–3L mínimo para reducir retención. Cada barra representa ~300ml.</GuideTip>
            </GuideSection>

            <GuideSection icon="ψ" title="Pestaña Rituales">
              Hábitos diarios que marcan la diferencia en composición corporal y bienestar.
              <br/><br/>
              <GuideTip>Usa <b>Generar Rituales con IA</b>: escribe tu objetivo específico (ej: "mejorar el sueño", "reducir cortisol") y la IA crea rituales personalizados para ti.</GuideTip>
              <GuideTip>Marca cada ritual como cumplido a lo largo del día. El objetivo es completar todos antes de dormir.</GuideTip>
              <GuideTip>El <b>Stack Personal</b> es tu registro de suplementos y hábitos. Úsalo como recordatorio visual diario.</GuideTip>
            </GuideSection>

            <GuideSection icon="🍇" title="Pestaña Ambrosía">
              Tu registro nutricional potenciado con IA.
              <br/><br/>
              <GuideTip>Describe tus comidas en lenguaje natural. Cuanto más detallado, más preciso el análisis (ej: "200g pechuga de pollo a la plancha con 150g arroz integral").</GuideTip>
              <GuideTip>La <b>barra de proteína</b> es clave: la meta de {Math.round(2.2*(profile.weight||81))}g/día ({profile.weight}kg × 2.2g) asegura síntesis muscular óptima para hipertrofia.</GuideTip>
              <GuideTip>Elimina entradas incorrectas con el botón <b>×</b> junto a cada comida registrada.</GuideTip>
              <GuideTip>El análisis incluye sodio — fundamental para controlar la retención de líquidos.</GuideTip>
            </GuideSection>

            <GuideSection icon="🏛" title="Pestaña Atleta">
              Tu diario de entrenamiento con análisis de hipertrofia.
              <br/><br/>
              <GuideTip>El rango <b>6–8 repeticiones</b> al 80–85% del 1RM es el rango óptimo para hipertrofia según la evidencia científica actual.</GuideTip>
              <GuideTip>El <b>1RM estimado</b> se calcula con la fórmula de Epley: 1RM = peso × (1 + reps/30). Útil para programar la carga de la próxima sesión.</GuideTip>
              <GuideTip>El <b>análisis IA</b> evalúa volumen total, intensidad y da una puntuación 1–10. Úsalo para comparar sesiones semana a semana.</GuideTip>
              <GuideTip>El <b>historial por ejercicio</b> muestra la evolución de tu 1RM a lo largo del tiempo — la métrica más honesta de progreso.</GuideTip>
              <GuideTip>Elimina ejercicios registrados por error con el botón <b>×</b>.</GuideTip>
            </GuideSection>

            <GuideSection icon="◐" title="Pestaña Planificación">
              Periodización y gestión del entrenamiento a largo plazo.
              <br/><br/>
              <GuideTip>El <b>Plan Semanal IA</b> genera una semana completa de entrenamiento basada en tu rutina, fase y mesociclo actual. Regenera cada semana.</GuideTip>
              <GuideTip>Un <b>mesociclo</b> dura 8 semanas con deload en la última. El deload reduce volumen e intensidad para permitir supercompensación.</GuideTip>
              <GuideTip>Usa el <b>calendario</b> para añadir notas por día: lesiones, viajes, días de descanso extra. Los puntos dorados indican días con entrenamiento registrado.</GuideTip>
            </GuideSection>

            <GuideSection icon="◉" title="Pestaña Oráculo">
              Diagnóstico completo de tu composición corporal con IA.
              <br/><br/>
              <GuideTip>Sube una foto en <b>Progreso</b> antes de consultar al Oráculo para obtener análisis visual además del análisis de datos.</GuideTip>
              <GuideTip>Consulta el Oráculo cada 2 semanas para tracking de cambios. El análisis considera promedios de 7 días, no solo el día actual.</GuideTip>
            </GuideSection>

            <GuideSection icon="↯" title="Métricas Clave">
              <GuideDef term="TMB" def="Tasa Metabólica Basal. Calorías que tu cuerpo quema en reposo absoluto. Calculado con la fórmula de Mifflin-St Jeor."/>
              <GuideDef term="TDEE" def="Gasto Energético Total Diario. Tu TMB multiplicado por tu factor de actividad. Es tu meta calórica de mantenimiento."/>
              <GuideDef term="1RM" def="Una Repetición Máxima. El peso máximo que puedes levantar en un movimiento una sola vez. Estimado con la fórmula de Epley."/>
              <GuideDef term="Mesociclo" def="Bloque de entrenamiento de 8 semanas con progresión planificada de volumen e intensidad, seguido de deload."/>
              <GuideDef term="Deload" def="Semana de reducción deliberada de carga (50-60% del volumen habitual) para recuperación y supercompensación."/>
              <GuideDef term="Déficit calórico" def="Consumir menos calorías de las que gastas. Necesario para cutting/definición. 300-500 kcal de déficit es lo recomendado."/>
              <GuideDef term="Superávit calórico" def="Consumir más calorías de las que gastas. Necesario para volumen/hipertrofia. 200-300 kcal de superávit controlado."/>
              <GuideDef term="2.2g proteína/kg" def="El estándar de proteína para hipertrofia máxima. Para un atleta de 81kg: 178g/día como mínimo."/>
            </GuideSection>

            <GuideSection icon="✦" title="Tips para Sacar el Máximo">
              <GuideTip>Registra comidas y actividades en tiempo real, no al final del día. La memoria es imprecisa.</GuideTip>
              <GuideTip>La constancia supera la perfección. 70% de adherencia sostenida &gt; 100% por 2 semanas.</GuideTip>
              <GuideTip>Pésate siempre en las mismas condiciones: mañana, en ayunas, después de ir al baño.</GuideTip>
              <GuideTip>El progreso real se mide en semanas, no en días. Compara fotos y métricas cada 2–4 semanas.</GuideTip>
              <GuideTip>Cuando el Oráculo da una alerta, actúa en las próximas 48h — no en "la semana que viene".</GuideTip>
              <GuideTip>Los rituales anti-edema funcionan en conjunto. No basta con solo hidratarse si el sodio está alto.</GuideTip>
            </GuideSection>

            <div style={{textAlign:"center",padding:"20px 0",borderTop:`1px solid ${STONE}`,marginTop:8}}>
              <div style={{fontFamily:fontH,fontSize:10,color:GOLD_DIM,letterSpacing:4}}>OLYMPUS FITNESS</div>
              <div style={{fontFamily:"Cormorant Garamond,Georgia,serif",fontStyle:"italic",color:"#555",fontSize:13,marginTop:6}}>"Forja tu cuerpo como el bronce, tu mente como el mármol."</div>
            </div>
          </div>
        )}

      </div>
      <div style={{textAlign:"center",padding:"30px 16px",color:"#444",fontFamily:fontB,fontStyle:"italic",fontSize:13}}>
        "Mens sana in corpore sano"
      </div>
    </div>
  );
}
