import React, { useState } from "react";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function N(v) { return parseFloat(v) || 0; }
function Row({ label, value, highlight }) {
  return (
    <div className={`flex justify-between py-1.5 px-3 rounded-lg ${highlight ? "bg-slate-900 text-white font-semibold" : "bg-slate-50 text-slate-700"}`}>
      <span className="text-sm">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
function Inp({ label, value, onChange, unit, step = "1", min = "0", placeholder = "" }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">{label}{unit ? ` (${unit})` : ""}</span>
      <input
        type="number" step={step} min={min} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
      />
    </label>
  );
}
function Sel({ label, value, onChange, options }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

// ─── 1. Müller — Calorías de Mantenimiento ───────────────────────────────────
function CalcMuller() {
  const [w, setW] = useState(""); const [h, setH] = useState(""); const [age, setAge] = useState("");
  const [sex, setSex] = useState("male"); const [act, setAct] = useState("1.55");
  const bmr = sex === "male"
    ? 3.4 * N(w) + 15.31 * N(h) - 6.68 * N(age) + 374.6
    : 3.4 * N(w) + 15.31 * N(h) - 6.68 * N(age) + 374.6 - 122.7;
  const tdee = bmr * N(act);
  const valid = N(w) > 0 && N(h) > 0 && N(age) > 0;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Calcula tus calorías de mantenimiento usando la ecuación de Müller (considerada más precisa para atletas que Harris-Benedict).</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Peso" unit="kg" step="0.1" value={w} onChange={setW} />
        <Inp label="Talla" unit="cm" step="1" value={h} onChange={setH} />
        <Inp label="Edad" unit="años" value={age} onChange={setAge} />
        <Sel label="Sexo" value={sex} onChange={setSex} options={[{ value: "male", label: "Masculino" }, { value: "female", label: "Femenino" }]} />
      </div>
      <Sel label="Nivel de actividad" value={act} onChange={setAct} options={[
        { value: "1.2",  label: "Sedentario (sin ejercicio)" },
        { value: "1.375",label: "Ligero (1–3 días/semana)" },
        { value: "1.55", label: "Moderado (3–5 días/semana)" },
        { value: "1.725",label: "Activo (6–7 días/semana)" },
        { value: "1.9",  label: "Muy activo (2 sesiones/día)" },
      ]} />
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="TMB (Tasa Metabólica Basal)" value={`${Math.round(bmr)} kcal/día`} />
          <Row label="Mantenimiento (TDEE)" value={`${Math.round(tdee)} kcal/día`} highlight />
          <Row label="Déficit moderado (–15%)" value={`${Math.round(tdee * 0.85)} kcal/día`} />
          <Row label="Déficit agresivo (–25%)" value={`${Math.round(tdee * 0.75)} kcal/día`} />
          <Row label="Superávit (+10%)" value={`${Math.round(tdee * 1.1)} kcal/día`} />
        </div>
      )}
    </div>
  );
}

// ─── 2. Macros ───────────────────────────────────────────────────────────────
function CalcMacros() {
  const [cals, setCals] = useState(""); const [w, setW] = useState(""); const [goal, setGoal] = useState("maintain");
  const calories = N(cals); const weight = N(w);
  const configs = {
    maintain: { prot: 1.8, fat: 0.9 },
    cut:      { prot: 2.2, fat: 0.8 },
    bulk:     { prot: 1.8, fat: 1.0 },
  };
  const cfg = configs[goal];
  const protG = Math.round(weight * cfg.prot);
  const fatG  = Math.round(weight * cfg.fat);
  const carbG = calories > 0 ? Math.round((calories - protG * 4 - fatG * 9) / 4) : 0;
  const valid = calories > 0 && weight > 0;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Calcula tus macros diarios basados en tu peso y objetivo. La proteína y grasa se calculan en g/kg; los carbos completan las calorías restantes.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Calorías objetivo" unit="kcal/día" value={cals} onChange={setCals} placeholder="ej. 2200" />
        <Inp label="Peso corporal" unit="kg" step="0.1" value={w} onChange={setW} />
      </div>
      <Sel label="Objetivo" value={goal} onChange={setGoal} options={[
        { value: "maintain", label: "Mantenimiento" },
        { value: "cut",      label: "Pérdida de grasa (déficit)" },
        { value: "bulk",     label: "Ganancia muscular (superávit)" },
      ]} />
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label={`Proteína (${cfg.prot} g/kg)`} value={`${protG} g — ${protG * 4} kcal`} highlight />
          <Row label={`Grasa (${cfg.fat} g/kg)`}     value={`${fatG} g — ${fatG * 9} kcal`} />
          <Row label="Carbohidratos (resto)"          value={`${carbG > 0 ? carbG : "—"} g — ${carbG > 0 ? carbG * 4 : "—"} kcal`} />
          {carbG < 100 && valid && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">⚠ Los carbos son muy bajos. Considera ajustar las calorías objetivo.</p>}
        </div>
      )}
    </div>
  );
}

// ─── 3. ¿Cuánto tiempo para alcanzar % grasa objetivo? ───────────────────────
function CalcHowLong() {
  const [w, setW] = useState(""); const [bf, setBf] = useState(""); const [targetBf, setTargetBf] = useState(""); const [rate, setRate] = useState("0.5");
  const weight = N(w); const currentBF = N(bf) / 100; const targetBF = N(targetBf) / 100;
  const fatMass = weight * currentBF;
  const leanMass = weight - fatMass;
  const targetWeight = leanMass / (1 - targetBF);
  const fatToLose = weight - targetWeight;
  const weeksNeeded = fatToLose / N(rate);
  const valid = weight > 0 && N(bf) > 0 && N(targetBf) > 0 && N(targetBf) < N(bf);
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Estima cuánto tiempo necesitas para alcanzar tu porcentaje de grasa objetivo perdiendo 0.5–1% del peso corporal por semana.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Peso actual" unit="kg" step="0.1" value={w} onChange={setW} />
        <Inp label="% Grasa actual" unit="%" step="0.5" value={bf} onChange={setBf} placeholder="ej. 20" />
        <Inp label="% Grasa objetivo" unit="%" step="0.5" value={targetBf} onChange={setTargetBf} placeholder="ej. 12" />
        <Sel label="Tasa de pérdida" value={rate} onChange={setRate} options={[
          { value: "0.5", label: "0.5% peso/semana (suave)" },
          { value: "0.75", label: "0.75% peso/semana (moderado)" },
          { value: "1.0",  label: "1% peso/semana (agresivo)" },
        ]} />
      </div>
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="Masa grasa actual" value={`${fatMass.toFixed(1)} kg`} />
          <Row label="Masa magra estimada" value={`${leanMass.toFixed(1)} kg`} />
          <Row label="Peso objetivo" value={`${targetWeight.toFixed(1)} kg`} />
          <Row label="Grasa a perder" value={`${fatToLose.toFixed(1)} kg`} highlight />
          <Row label="Semanas estimadas" value={`${Math.ceil(weeksNeeded)} semanas (~${Math.ceil(weeksNeeded / 4.3)} meses)`} highlight />
        </div>
      )}
    </div>
  );
}

// ─── 4. Deficit Calórico Diario ───────────────────────────────────────────────
function CalcDeficit() {
  const [tdee, setTdee] = useState(""); const [rate, setRate] = useState("0.5"); const [w, setW] = useState("");
  const maintenance = N(tdee); const weight = N(w);
  const weeklyKcalDeficit = N(rate) * weight * 7.7; // ~7700 kcal por kg de grasa
  const dailyDeficit = weeklyKcalDeficit / 7;
  const targetCals = maintenance - dailyDeficit;
  const valid = maintenance > 0 && weight > 0;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Calcula las calorías diarias necesarias para perder grasa a la tasa elegida sin exceder el 25% de déficit.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Calorías mantenimiento (TDEE)" unit="kcal" value={tdee} onChange={setTdee} placeholder="ej. 2400" />
        <Inp label="Peso corporal" unit="kg" step="0.1" value={w} onChange={setW} />
        <Sel label="Tasa de pérdida" value={rate} onChange={setRate} options={[
          { value: "0.5",  label: "0.5 kg/semana (conservador)" },
          { value: "0.75", label: "0.75 kg/semana (moderado)" },
          { value: "1.0",  label: "1 kg/semana (agresivo)" },
        ]} />
      </div>
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="Déficit diario necesario" value={`${Math.round(dailyDeficit)} kcal/día`} />
          <Row label="Calorías objetivo" value={`${Math.round(targetCals)} kcal/día`} highlight />
          <Row label="% de déficit vs mantenimiento" value={`${((dailyDeficit / maintenance) * 100).toFixed(1)}%`} />
          {dailyDeficit / maintenance > 0.25 && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">⚠ El déficit supera el 25% — riesgo de perder masa muscular. Reduce la tasa de pérdida.</p>}
        </div>
      )}
    </div>
  );
}

// ─── 5. Reverse Dieting ───────────────────────────────────────────────────────
function CalcReverse() {
  const [currentCals, setCurrentCals] = useState(""); const [targetCals, setTargetCals] = useState(""); const [weeks, setWeeks] = useState("8"); const [w, setW] = useState("");
  const current = N(currentCals); const target = N(targetCals); const nWeeks = N(weeks); const weight = N(w);
  const totalIncrease = target - current;
  const weeklyIncrease = totalIncrease / nWeeks;
  const valid = current > 0 && target > current && nWeeks > 0;
  const weekData = valid ? Array.from({ length: Math.min(nWeeks, 12) }, (_, i) => ({
    week: i + 1,
    cals: Math.round(current + weeklyIncrease * (i + 1)),
    prot: weight > 0 ? Math.round(weight * 1.8) : null,
    carbs: weight > 0 ? Math.round(((current + weeklyIncrease * (i + 1)) - weight * 1.8 * 4 - weight * 0.9 * 9) / 4) : null,
  })) : [];
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Aumenta calorías gradualmente después de un período de déficit para minimizar ganancia de grasa y restaurar hormonas (método Layne Norton).</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Calorías actuales (fin de dieta)" unit="kcal" value={currentCals} onChange={setCurrentCals} />
        <Inp label="Calorías objetivo (mantenimiento)" unit="kcal" value={targetCals} onChange={setTargetCals} />
        <Inp label="Semanas del proceso" step="1" value={weeks} onChange={setWeeks} placeholder="8" />
        <Inp label="Peso corporal" unit="kg" step="0.1" value={w} onChange={setW} placeholder="para macros" />
      </div>
      {valid && (
        <div className="space-y-3 mt-2">
          <Row label="Incremento semanal" value={`+${Math.round(weeklyIncrease)} kcal/semana`} highlight />
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                <th className="px-3 py-2 text-left">Semana</th>
                <th className="px-3 py-2 text-right">Calorías</th>
                {weight > 0 && <><th className="px-3 py-2 text-right">Prot (g)</th><th className="px-3 py-2 text-right">Carbs (g)</th></>}
              </tr></thead>
              <tbody>{weekData.map((d, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="px-3 py-1.5 text-slate-700">Semana {d.week}</td>
                  <td className="px-3 py-1.5 text-right font-medium text-slate-900">{d.cals}</td>
                  {weight > 0 && <><td className="px-3 py-1.5 text-right text-slate-600">{d.prot}</td><td className="px-3 py-1.5 text-right text-slate-600">{d.carbs > 0 ? d.carbs : "—"}</td></>}
                </tr>
              ))}</tbody>
            </table>
            {nWeeks > 12 && <p className="text-xs text-slate-400 text-center py-2">Mostrando primeras 12 semanas</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 6. Diet Break ────────────────────────────────────────────────────────────
function CalcDietBreak() {
  const [tdee, setTdee] = useState(""); const [deficitCals, setDeficitCals] = useState(""); const [breakWeeks, setBreakWeeks] = useState("1");
  const maintenance = N(tdee); const deficit = N(deficitCals);
  const deficitPct = maintenance > 0 ? ((maintenance - deficit) / maintenance * 100).toFixed(1) : 0;
  const breakCals = Math.round(maintenance * 0.95);
  const valid = maintenance > 0 && deficit > 0;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Un "diet break" es una pausa de 1–2 semanas a calorías de mantenimiento (~95%) para restaurar hormonas, reducir fatiga psicológica y mejorar adherencia.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="TDEE / Mantenimiento" unit="kcal" value={tdee} onChange={setTdee} />
        <Inp label="Calorías en déficit" unit="kcal" value={deficitCals} onChange={setDeficitCals} />
        <Sel label="Duración del break" value={breakWeeks} onChange={setBreakWeeks} options={[
          { value: "1", label: "1 semana" },
          { value: "2", label: "2 semanas (recomendado)" },
        ]} />
      </div>
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="Tu déficit actual" value={`${Math.round(maintenance - deficit)} kcal/día (${deficitPct}%)`} />
          <Row label="Calorías durante diet break" value={`${breakCals} kcal/día`} highlight />
          <Row label="Duración recomendada" value={`${breakWeeks} semana${breakWeeks > 1 ? "s" : ""}`} />
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2.5 mt-2">
            <p className="text-xs text-blue-800">💡 Después del diet break, retoma el déficit. Mantén el entrenamiento normal. No es una "trampa" — es parte del protocolo.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 7. Tasa de Sudoración ────────────────────────────────────────────────────
function CalcSweatRate() {
  const [prePeso, setPrePeso] = useState(""); const [postPeso, setPostPeso] = useState(""); const [duration, setDuration] = useState(""); const [fluid, setFluid] = useState("0");
  const sweatLoss = (N(prePeso) - N(postPeso) + N(fluid) / 1000);
  const sweatRate = duration > 0 ? (sweatLoss / (N(duration) / 60)).toFixed(2) : 0;
  const deficitPct = prePeso > 0 ? ((N(prePeso) - N(postPeso)) / N(prePeso) * 100).toFixed(2) : 0;
  const valid = N(prePeso) > 0 && N(postPeso) > 0 && N(duration) > 0;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Mide cuánto líquido pierdes por hora de entrenamiento para personalizar tu estrategia de hidratación.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Peso PRE-entreno" unit="kg" step="0.05" value={prePeso} onChange={setPrePeso} />
        <Inp label="Peso POST-entreno" unit="kg" step="0.05" value={postPeso} onChange={setPostPeso} />
        <Inp label="Duración sesión" unit="min" value={duration} onChange={setDuration} />
        <Inp label="Líquido consumido" unit="mL" step="50" value={fluid} onChange={setFluid} placeholder="0 si no tomaste" />
      </div>
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="Pérdida total de sudor" value={`${sweatLoss.toFixed(2)} L`} />
          <Row label="Tasa de sudoración" value={`${sweatRate} L/hora`} highlight />
          <Row label="Déficit de peso" value={`${deficitPct}%`} />
          {N(deficitPct) > 2 && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">⚠ Deshidratación {">"} 2% — el rendimiento se ve afectado. Aumenta la ingesta de líquidos.</p>}
          {N(deficitPct) <= 2 && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">✓ Hidratación adecuada durante la sesión.</p>}
        </div>
      )}
    </div>
  );
}

// ─── 8. Disponibilidad Energética (EA) ────────────────────────────────────────
function CalcEA() {
  const [intake, setIntake] = useState(""); const [exCal, setExCal] = useState(""); const [leanMass, setLeanMass] = useState("");
  const ea = leanMass > 0 ? ((N(intake) - N(exCal)) / N(leanMass)).toFixed(1) : 0;
  const valid = N(intake) > 0 && N(exCal) > 0 && N(leanMass) > 0;
  const status = ea >= 45 ? { label: "Óptima ✓", color: "emerald" } : ea >= 30 ? { label: "Zona de alerta ⚠", color: "amber" } : { label: "Deficiencia (RED-S) ⛔", color: "rose" };
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">La Disponibilidad Energética (EA) mide la energía disponible para las funciones corporales tras descontar el gasto de ejercicio. Crítica para atletas, especialmente mujeres.</p>
      <div className="grid grid-cols-2 gap-3">
        <Inp label="Ingesta calórica diaria" unit="kcal" value={intake} onChange={setIntake} />
        <Inp label="Calorías quemadas en ejercicio" unit="kcal" value={exCal} onChange={setExCal} />
        <Inp label="Masa magra" unit="kg" step="0.1" value={leanMass} onChange={setLeanMass} placeholder="peso × (1 – %grasa/100)" />
      </div>
      {valid && (
        <div className="space-y-1.5 mt-2">
          <Row label="Disponibilidad Energética" value={`${ea} kcal/kg MM/día`} highlight />
          <div className={`rounded-xl px-3 py-2.5 bg-${status.color}-50 border border-${status.color}-200`}>
            <p className={`text-sm font-semibold text-${status.color}-700`}>Estado: {status.label}</p>
            <p className="text-xs text-slate-600 mt-0.5">Óptimo ≥45 · Alerta 30-45 · RED-S {"<"}30 kcal/kg MM/día</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 9. Race Predictor (Riegel + VO2 Max) ─────────────────────────────────────
const RACE_DISTANCES = [
  { label: "1K",          km: 1 },
  { label: "5K",          km: 5 },
  { label: "10K",         km: 10 },
  { label: "15K",         km: 15 },
  { label: "Medio Maratón", km: 21.0975 },
  { label: "Maratón",     km: 42.195 },
  { label: "50K",         km: 50 },
  { label: "100K",        km: 100 },
];

function parseTime(hh, mm, ss) {
  return N(hh) * 3600 + N(mm) * 60 + N(ss);
}
function formatTime(totalSec) {
  if (!totalSec || totalSec <= 0) return "—";
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
function formatPace(totalSec, km) {
  if (!totalSec || !km || km <= 0) return "—";
  const secPerKm = totalSec / km;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

function CalcRacePredictor() {
  const [hh, setHh] = useState(""); const [mm, setMm] = useState(""); const [ss, setSs] = useState("");
  const [knownDist, setKnownDist] = useState("10");
  const [goalDist, setGoalDist] = useState("21.0975");
  const [units, setUnits] = useState("km");

  const knownTimeSec = parseTime(hh, mm, ss);
  const knownKm = N(knownDist);
  const goalKm = N(goalDist);
  const RIEGEL = 1.06;

  // Riegel formula: T2 = T1 * (D2/D1)^1.06
  const predictedSec = knownTimeSec > 0 && knownKm > 0 && goalKm > 0
    ? knownTimeSec * Math.pow(goalKm / knownKm, RIEGEL)
    : 0;

  // VO2 Max approximation (Daniels & Gilbert simplified via pace)
  // v = distance/time in m/min
  const v = knownKm > 0 && knownTimeSec > 0 ? (knownKm * 1000) / (knownTimeSec / 60) : 0;
  const vo2max = v > 0 ? (-4.6 + 0.182258 * v + 0.000104 * v * v) / (0.8 + 0.1894393 * Math.exp(-0.012778 * knownTimeSec / 60) + 0.2989558 * Math.exp(-0.1932605 * knownTimeSec / 60)) : 0;

  const valid = knownTimeSec > 0 && knownKm > 0 && goalKm > 0;

  const allPredictions = RACE_DISTANCES.map(d => ({
    label: d.label,
    km: d.km,
    time: knownTimeSec > 0 && knownKm > 0 ? knownTimeSec * Math.pow(d.km / knownKm, RIEGEL) : 0,
  }));

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Predice tus tiempos en cualquier distancia usando la fórmula de Riegel. Introduce un tiempo conocido y selecciona la distancia objetivo.</p>

      <div className="space-y-3">
        <div>
          <span className="text-xs font-medium text-slate-600 block mb-1.5">Tiempo conocido (hh:mm:ss)</span>
          <div className="flex items-center gap-2">
            <input type="number" min="0" max="23" placeholder="hh" value={hh} onChange={e => setHh(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-center" />
            <span className="text-slate-400 font-bold">:</span>
            <input type="number" min="0" max="59" placeholder="mm" value={mm} onChange={e => setMm(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-center" />
            <span className="text-slate-400 font-bold">:</span>
            <input type="number" min="0" max="59" placeholder="ss" value={ss} onChange={e => setSs(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-center" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Sel label="Distancia conocida" value={knownDist} onChange={setKnownDist} options={RACE_DISTANCES.map(d => ({ value: String(d.km), label: d.label }))} />
          <Sel label="Distancia objetivo" value={goalDist} onChange={setGoalDist} options={RACE_DISTANCES.map(d => ({ value: String(d.km), label: d.label }))} />
        </div>
      </div>

      {valid && (
        <div className="space-y-3 mt-2">
          <div className="space-y-1.5">
            <Row label="Ritmo conocido" value={formatPace(knownTimeSec, knownKm)} />
            <Row label={`Tiempo predicho (${RACE_DISTANCES.find(d => String(d.km) === goalDist)?.label || goalKm + " km"})`} value={formatTime(predictedSec)} highlight />
            <Row label="Ritmo predicho" value={formatPace(predictedSec, goalKm)} />
            <Row label="VO2 Max estimado" value={vo2max > 0 ? `${vo2max.toFixed(1)} ml/kg/min` : "—"} />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Predicciones para todas las distancias</div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="px-3 py-2 text-left">Distancia</th>
                  <th className="px-3 py-2 text-right">Tiempo</th>
                  <th className="px-3 py-2 text-right">Ritmo /km</th>
                </tr></thead>
                <tbody>{allPredictions.map((d, i) => (
                  <tr key={i} className={`${String(d.km) === goalDist ? "bg-slate-900 text-white font-semibold" : i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-3 py-1.5">{d.label}</td>
                    <td className="px-3 py-1.5 text-right">{formatTime(d.time)}</td>
                    <td className="px-3 py-1.5 text-right">{formatPace(d.time, d.km)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-400">Fórmula de Riegel (exponente 1.06). VO2 Max: aproximación de Daniels & Gilbert.</p>
        </div>
      )}
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const calculators = [
  { id: "muller",    emoji: "🔥", title: "Calorías de Mantenimiento (Müller)", desc: "Calcula tu TDEE con la ecuación de Müller, más precisa para atletas.", Component: CalcMuller },
  { id: "macros",    emoji: "🍽️", title: "Calculadora de Macros",             desc: "Proteína, grasa y carbos según tu objetivo y peso corporal.",         Component: CalcMacros },
  { id: "howlong",   emoji: "📅", title: "¿Cuánto tiempo para bajar de % grasa?", desc: "Estima las semanas necesarias para alcanzar tu composición objetivo.", Component: CalcHowLong },
  { id: "deficit",   emoji: "📉", title: "Déficit Calórico Diario",           desc: "Cuántas calorías comer para perder peso a tu ritmo elegido.",          Component: CalcDeficit },
  { id: "reverse",   emoji: "📈", title: "Reverse Dieting",                   desc: "Plan semana a semana para aumentar calorías tras un período de dieta.", Component: CalcReverse },
  { id: "break",     emoji: "⏸️", title: "Diet Break",                        desc: "Calcula las calorías de tu pausa dietética para restaurar hormonas.",   Component: CalcDietBreak },
  { id: "sweat",     emoji: "💧", title: "Tasa de Sudoración",                desc: "Personaliza tu hidratación calculando cuánto sudo por hora.",           Component: CalcSweatRate },
  { id: "ea",        emoji: "⚡", title: "Disponibilidad Energética (EA)",    desc: "Detecta deficiencia energética y riesgo de Tríada / RED-S.",           Component: CalcEA },
  { id: "race",      emoji: "🏁", title: "Predictor de Tiempos de Carrera",   desc: "Predice tu tiempo en cualquier distancia usando la fórmula de Riegel.", Component: CalcRacePredictor },
];

export default function FitnessCalculators() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Calculadoras de Fitness</h2>
        <p className="text-sm text-slate-500 mt-1">Basadas en el método de Layne Norton, Ph.D. — introduce tus datos en cada calculadora.</p>
      </div>
      <div className="space-y-3">
        {calculators.map((calc) => (
          <div key={calc.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => setOpen(open === calc.id ? null : calc.id)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="text-2xl">{calc.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">{calc.title}</div>
                <div className="text-sm text-slate-500 truncate">{calc.desc}</div>
              </div>
              {open === calc.id ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {open === calc.id && (
              <div className="border-t border-slate-100 px-4 pb-5 pt-4">
                <calc.Component />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center pb-2">Fuentes: Layne Norton Ph.D. — Fat Loss Forever · The Fit Chemist Fitness Calculators</p>
    </div>
  );
}