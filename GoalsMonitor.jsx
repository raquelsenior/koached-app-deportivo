import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Plus, X, ChevronDown, ChevronUp, Target, Moon, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPace(secPerKm) {
  if (!secPerKm || secPerKm <= 0) return "—";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

function parsePace(str) {
  // accepts "4:30" → seconds per km
  const parts = (str || "").split(":");
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(s)) return null;
  return m * 60 + s;
}

function ProgressBar({ value, max, color = "emerald" }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-400",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
  };
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full ${colors[color] || "bg-emerald-500"} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function statusColor(pct) {
  if (pct >= 90) return "emerald";
  if (pct >= 60) return "amber";
  return "rose";
}

// ─── Race Goal Card ───────────────────────────────────────────────────────────
function RaceGoalCard({ goal, latestMetric }) {
  const targetPaceSec = parsePace(goal.target_pace);
  const currentPaceSec = latestMetric?.session_rpe != null && goal.current_pace ? parsePace(goal.current_pace) : null;

  // Progress: closer to target = better. If no current pace logged, show 0
  let progressPct = 0;
  if (targetPaceSec && currentPaceSec) {
    // Assume athlete started from a "base pace" 30% slower than target
    const basePaceSec = targetPaceSec * 1.3;
    progressPct = Math.min(100, Math.round(((basePaceSec - currentPaceSec) / (basePaceSec - targetPaceSec)) * 100));
    if (progressPct < 0) progressPct = 0;
  }

  const color = statusColor(progressPct);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-sm">{goal.race_name}</div>
          <div className="text-xs text-slate-500">{goal.distance} · {goal.race_date || "Sin fecha"}</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${color}-100 text-${color}-700`}>
          {progressPct}%
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Ritmo objetivo: <span className="font-medium text-slate-700">{formatPace(targetPaceSec)}</span></span>
          {currentPaceSec && <span>Actual: <span className="font-medium text-slate-700">{formatPace(currentPaceSec)}</span></span>}
        </div>
        <ProgressBar value={progressPct} max={100} color={color} />
      </div>
      {goal.notes && <p className="text-xs text-slate-400 italic">{goal.notes}</p>}
    </div>
  );
}

// ─── Sleep Goal Card ──────────────────────────────────────────────────────────
function SleepGoalCard({ goal, latestMetric }) {
  const targetHours = parseFloat(goal.target_sleep_hours) || 0;
  const targetEff = parseFloat(goal.target_efficiency_pct) || 85;
  const actualHours = latestMetric?.sleep_hours || 0;
  const actualEff = latestMetric?.sleep_efficiency_pct || 0;
  const hoursOk = targetHours > 0 ? Math.min(100, Math.round((actualHours / targetHours) * 100)) : 0;
  const effOk = Math.min(100, Math.round((actualEff / targetEff) * 100));
  const overall = Math.round((hoursOk + effOk) / 2);
  const color = statusColor(overall);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-sm">😴 Calidad del sueño</div>
          <div className="text-xs text-slate-500">Objetivos de recuperación nocturna</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${color}-100 text-${color}-700`}>
          {overall}%
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-slate-400 mb-0.5">Horas · obj {targetHours}h</div>
          <ProgressBar value={hoursOk} max={100} color={statusColor(hoursOk)} />
          <div className="mt-0.5 text-slate-600 font-medium">{actualHours ? `${actualHours}h` : "—"}</div>
        </div>
        <div>
          <div className="text-slate-400 mb-0.5">Eficiencia · obj {targetEff}%</div>
          <ProgressBar value={effOk} max={100} color={statusColor(effOk)} />
          <div className="mt-0.5 text-slate-600 font-medium">{actualEff ? `${actualEff}%` : "—"}</div>
        </div>
      </div>
      {goal.notes && <p className="text-xs text-slate-400 italic">{goal.notes}</p>}
    </div>
  );
}

// ─── Body Composition Card ─────────────────────────────────────────────────────
function BodyGoalCard({ goal, latestMetric }) {
  const targetWeight = parseFloat(goal.target_weight_kg) || 0;
  const targetBF = parseFloat(goal.target_bf_pct) || 0;
  const startWeight = parseFloat(goal.start_weight_kg) || 0;
  const currentWeight = latestMetric?.weight_kg || startWeight;

  let weightPct = 0;
  if (startWeight && targetWeight && startWeight !== targetWeight) {
    const totalChange = Math.abs(startWeight - targetWeight);
    const achieved = Math.abs(startWeight - currentWeight);
    weightPct = Math.min(100, Math.round((achieved / totalChange) * 100));
  }

  const color = statusColor(weightPct);
  const losing = targetWeight < startWeight;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-slate-900 text-sm">⚖️ Composición corporal</div>
          <div className="text-xs text-slate-500">{losing ? "Pérdida de peso" : "Ganancia muscular"}</div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-${color}-100 text-${color}-700`}>
          {weightPct}%
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Inicio: <span className="font-medium text-slate-700">{startWeight ? `${startWeight} kg` : "—"}</span></span>
          <span>Actual: <span className="font-medium text-slate-700">{currentWeight ? `${currentWeight} kg` : "—"}</span></span>
          <span>Objetivo: <span className="font-medium text-slate-700">{targetWeight ? `${targetWeight} kg` : "—"}</span></span>
        </div>
        <ProgressBar value={weightPct} max={100} color={color} />
      </div>
      {targetBF > 0 && (
        <div className="text-xs text-slate-500">% Grasa objetivo: <span className="font-medium text-slate-700">{targetBF}%</span></div>
      )}
      {goal.notes && <p className="text-xs text-slate-400 italic">{goal.notes}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GoalsMonitor() {
  const [athletes, setAthletes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [aths, gs, mets] = await Promise.all([
        base44.entities.Athlete.filter({ status: "active" }),
        base44.entities.AthleteGoal.list("-created_date", 200),
        base44.entities.AthleteMetrics.list("-date", 100),
      ]);
      setAthletes(aths);
      setGoals(gs);
      setMetrics(mets);
    } finally { setLoading(false); }
  }

  const latestMetricByAthlete = {};
  metrics.forEach(m => {
    if (!latestMetricByAthlete[m.athlete_id] || m.date > latestMetricByAthlete[m.athlete_id].date) {
      latestMetricByAthlete[m.athlete_id] = m;
    }
  });

  const goalsByAthlete = {};
  goals.forEach(g => {
    if (!goalsByAthlete[g.athlete_id]) goalsByAthlete[g.athlete_id] = [];
    goalsByAthlete[g.athlete_id].push(g);
  });

  function toggle(id) { setExpanded(e => ({ ...e, [id]: !e[id] })); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Monitoreo de Objetivos</h2>
        <button onClick={load} className="text-slate-400 hover:text-slate-700"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-2">
          {athletes.map(athlete => {
            const athleteGoals = goalsByAthlete[athlete.id] || [];
            const latestMetric = latestMetricByAthlete[athlete.id] || null;
            const raceGoals = athleteGoals.filter(g => g.goal_type === "race");
            const sleepGoal = athleteGoals.find(g => g.goal_type === "sleep");
            const bodyGoal = athleteGoals.find(g => g.goal_type === "body");
            const totalGoals = raceGoals.length + (sleepGoal ? 1 : 0) + (bodyGoal ? 1 : 0);
            const isOpen = expanded[athlete.id];

            return (
              <div key={athlete.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggle(athlete.id)}>
                  <div className={`w-9 h-9 rounded-full ${athlete.avatar_color || "bg-slate-400"} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {athlete.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{athlete.full_name}</div>
                    <div className="text-xs text-slate-400">{totalGoals} objetivo{totalGoals !== 1 ? "s" : ""} registrado{totalGoals !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {raceGoals.length > 0 && <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-medium">🏁 {raceGoals.length}</span>}
                    {sleepGoal && <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">😴</span>}
                    {bodyGoal && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚖️</span>}
                  </div>
                  <button onClick={e => { e.stopPropagation(); setShowForm(athlete); }} className="text-slate-400 hover:text-slate-700 ml-1">
                    <Plus className="w-4 h-4" />
                  </button>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-4 space-y-4">
                    {totalGoals === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-400">Sin objetivos registrados.</p>
                        <button onClick={() => setShowForm(athlete)} className="mt-2 text-sm underline text-slate-600">Agregar objetivo</button>
                      </div>
                    ) : (
                      <>
                        {raceGoals.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              <Target className="w-3.5 h-3.5" /> Objetivos de Carrera
                            </div>
                            {raceGoals.map((g, i) => <RaceGoalCard key={i} goal={g} latestMetric={latestMetric} />)}
                          </div>
                        )}
                        {sleepGoal && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              <Moon className="w-3.5 h-3.5" /> Objetivo de Sueño
                            </div>
                            <SleepGoalCard goal={sleepGoal} latestMetric={latestMetric} />
                          </div>
                        )}
                        {bodyGoal && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                              <Scale className="w-3.5 h-3.5" /> Objetivo de Composición Corporal
                            </div>
                            <BodyGoalCard goal={bodyGoal} latestMetric={latestMetric} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <GoalForm
          athlete={showForm}
          onClose={() => setShowForm(null)}
          onSaved={() => { setShowForm(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Goal Form ─────────────────────────────────────────────────────────────────
function GoalForm({ athlete, onClose, onSaved }) {
  const [type, setType] = useState("race");
  const [form, setForm] = useState({ athlete_id: athlete.id, athlete_name: athlete.full_name, goal_type: "race" });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function changeType(t) { setType(t); setForm({ athlete_id: athlete.id, athlete_name: athlete.full_name, goal_type: t }); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try { await base44.entities.AthleteGoal.create(form); onSaved(); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Agregar objetivo · {athlete.full_name.split(" ")[0]}</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {/* Type selector */}
        <div className="flex gap-2">
          {[{ v: "race", label: "🏁 Carrera" }, { v: "sleep", label: "😴 Sueño" }, { v: "body", label: "⚖️ Cuerpo" }].map(t => (
            <button key={t.v} type="button" onClick={() => changeType(t.v)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-colors ${type === t.v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {type === "race" && <>
          <F label="Nombre de la carrera"><input type="text" onChange={e => set("race_name", e.target.value)} className="inp" placeholder="ej. Maratón Valencia" required /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Distancia"><input type="text" onChange={e => set("distance", e.target.value)} className="inp" placeholder="ej. 10K" /></F>
            <F label="Fecha de carrera"><input type="date" onChange={e => set("race_date", e.target.value)} className="inp" /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Ritmo objetivo (mm:ss /km)"><input type="text" onChange={e => set("target_pace", e.target.value)} className="inp" placeholder="4:30" /></F>
            <F label="Ritmo actual (mm:ss /km)"><input type="text" onChange={e => set("current_pace", e.target.value)} className="inp" placeholder="5:00" /></F>
          </div>
        </>}

        {type === "sleep" && <>
          <div className="grid grid-cols-2 gap-3">
            <F label="Horas de sueño objetivo"><input type="number" step="0.5" min="5" max="12" onChange={e => set("target_sleep_hours", e.target.value)} className="inp" placeholder="8" /></F>
            <F label="Eficiencia objetivo (%)"><input type="number" step="1" min="70" max="100" onChange={e => set("target_efficiency_pct", e.target.value)} className="inp" placeholder="85" /></F>
          </div>
        </>}

        {type === "body" && <>
          <div className="grid grid-cols-2 gap-3">
            <F label="Peso inicial (kg)"><input type="number" step="0.1" onChange={e => set("start_weight_kg", e.target.value)} className="inp" /></F>
            <F label="Peso objetivo (kg)"><input type="number" step="0.1" onChange={e => set("target_weight_kg", e.target.value)} className="inp" /></F>
          </div>
          <F label="% Grasa objetivo"><input type="number" step="0.5" min="5" max="40" onChange={e => set("target_bf_pct", e.target.value)} className="inp" placeholder="ej. 15" /></F>
        </>}

        <F label="Notas"><textarea onChange={e => set("notes", e.target.value)} className="inp" rows={2} /></F>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Guardando..." : "Guardar objetivo"}</Button>
        </div>
      </form>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
    </div>
  );
}

function F({ label, children }) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}