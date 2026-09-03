import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LEVELS } from "@/lib/training";
import MetricsBadge, { flag } from "@/components/MetricsBadge";
import { RefreshCw, Plus, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Flag rules per metric ────────────────────────────────────────────────────
const RULES = {
  acwr:                    [{ fn: v => v > 1.5,  color: "red" }, { fn: v => v > 1.3,  color: "yellow" }],
  hrv_change_pct:          [{ fn: v => v < -20,  color: "red" }, { fn: v => v < -10,  color: "yellow" }],
  weight_loss_pct:         [{ fn: v => v > 3,    color: "red" }, { fn: v => v > 2,    color: "yellow" }],
  urine_color:             [{ fn: v => v >= 7,   color: "red" }, { fn: v => v >= 5,   color: "yellow" }],
  cmj_change_pct:          [{ fn: v => v < -15,  color: "red" }, { fn: v => v < -10,  color: "yellow" }],
  fatigue_level:           [{ fn: v => v >= 5,   color: "red" }, { fn: v => v >= 4,   color: "yellow" }],
  muscle_soreness:         [{ fn: v => v >= 5,   color: "red" }, { fn: v => v >= 4,   color: "yellow" }],
  stress_level:            [{ fn: v => v >= 5,   color: "red" }, { fn: v => v >= 4,   color: "yellow" }],
  energy_availability_kcal:[{ fn: v => v < 30,   color: "red" }, { fn: v => v < 45,   color: "yellow" }],
  protein_g_kg:            [{ fn: v => v < 1.0,  color: "red" }, { fn: v => v < 1.2,  color: "yellow" }],
  resting_hr:              [{ fn: v => v > 75,   color: "red" }, { fn: v => v > 65,   color: "yellow" }],
  // Sueño
  sleep_efficiency_pct:    [{ fn: v => v < 75,   color: "red" }, { fn: v => v < 85,   color: "yellow" }],
  sleep_latency_min:       [{ fn: v => v > 45,   color: "red" }, { fn: v => v > 20,   color: "yellow" }],
  waso_min:                [{ fn: v => v > 45,   color: "red" }, { fn: v => v > 30,   color: "yellow" }],
  sleep_deep_pct:          [{ fn: v => v < 10,   color: "red" }, { fn: v => v < 15,   color: "yellow" }],
  sleep_rem_pct:           [{ fn: v => v < 15,   color: "red" }, { fn: v => v < 20,   color: "yellow" }],
  sleep_inertia_min:       [{ fn: v => v > 45,   color: "red" }, { fn: v => v > 20,   color: "yellow" }],
  daytime_alertness:       [{ fn: v => v <= 1,   color: "red" }, { fn: v => v <= 2,   color: "yellow" }],
  sleep_continuity:        [{ fn: v => v <= 1,   color: "red" }, { fn: v => v <= 2,   color: "yellow" }],
  nocturnal_hrv_ms:        [{ fn: v => v < 20,   color: "red" }, { fn: v => v < 40,   color: "yellow" }],
};

function overallFlag(m) {
  if (!m) return "none";
  const checks = [
    flag(m.acwr, RULES.acwr),
    flag(m.hrv_change_pct, RULES.hrv_change_pct),
    flag(m.weight_loss_pct, RULES.weight_loss_pct),
    flag(m.urine_color, RULES.urine_color),
    flag(m.cmj_change_pct, RULES.cmj_change_pct),
    flag(m.fatigue_level, RULES.fatigue_level),
    flag(m.energy_availability_kcal, RULES.energy_availability_kcal),
    flag(m.sleep_efficiency_pct, RULES.sleep_efficiency_pct),
    flag(m.waso_min, RULES.waso_min),
    flag(m.daytime_alertness, RULES.daytime_alertness),
  ];
  if (checks.includes("red")) return "red";
  if (checks.includes("yellow")) return "yellow";
  if (checks.every(c => c === "none")) return "none";
  return "green";
}

const dotColor = { red: "bg-rose-500", yellow: "bg-amber-500", green: "bg-emerald-500", none: "bg-slate-300" };

// ─── Main component ───────────────────────────────────────────────────────────
export default function MetricsMonitor() {
  const [athletes, setAthletes] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showForm, setShowForm] = useState(null); // athlete obj

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const [aths, mets] = await Promise.all([
        base44.entities.Athlete.filter({ status: "active" }),
        base44.entities.AthleteMetrics.list("-date", 100),
      ]);
      setAthletes(aths);
      setMetrics(mets);
    } finally { setLoading(false); }
  }

  // Latest metric per athlete
  const latestByAthlete = {};
  metrics.forEach(m => {
    if (!latestByAthlete[m.athlete_id] || m.date > latestByAthlete[m.athlete_id].date) {
      latestByAthlete[m.athlete_id] = m;
    }
  });

  const rows = athletes.map(a => ({ athlete: a, latest: latestByAthlete[a.id] || null }));
  const sorted = [...rows].sort((a, b) => {
    const order = { red: 0, yellow: 1, none: 2, green: 3 };
    return (order[overallFlag(a.latest)] || 0) - (order[overallFlag(b.latest)] || 0);
  });

  function toggle(id) { setExpanded(e => ({ ...e, [id]: !e[id] })); }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Monitor de Métricas</h2>
        <button onClick={load} className="text-slate-400 hover:text-slate-700"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="w-5 h-5 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-2">
          {sorted.map(({ athlete, latest }) => {
            const lvl = LEVELS[athlete.level] || LEVELS.basic;
            const overall = overallFlag(latest);
            const isOpen = expanded[athlete.id];
            return (
              <div key={athlete.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                {/* Row header */}
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => toggle(athlete.id)}>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColor[overall]}`} />
                  <div className={`w-9 h-9 rounded-full ${athlete.avatar_color || "bg-slate-400"} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {athlete.full_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{athlete.full_name}</div>
                    <span className={`text-[11px] ${lvl.text}`}>{lvl.label}</span>
                  </div>
                  {/* Quick metric pills */}
                  <div className="hidden sm:flex gap-1.5 flex-wrap">
                    <MetricsBadge value={latest?.acwr?.toFixed(2)} rules={RULES.acwr} label="ACWR" />
                    <MetricsBadge value={latest?.hrv_change_pct != null ? `${latest.hrv_change_pct > 0 ? "+" : ""}${latest.hrv_change_pct}` : null} unit="%" rules={RULES.hrv_change_pct} label="ΔHRV" />
                    <MetricsBadge value={latest?.fatigue_level} unit="/5" rules={RULES.fatigue_level} label="Fatiga" />
                    <MetricsBadge value={latest?.sleep_efficiency_pct != null ? `${latest.sleep_efficiency_pct}` : null} unit="%" rules={RULES.sleep_efficiency_pct} label="Ef. Sueño" />
                    <MetricsBadge value={latest?.energy_availability_kcal} unit="" rules={RULES.energy_availability_kcal} label="EA kcal/kgMM" />
                  </div>
                  <button onClick={e => { e.stopPropagation(); setShowForm(athlete); }} className="ml-2 text-slate-400 hover:text-slate-700">
                    <Plus className="w-4 h-4" />
                  </button>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-4 py-4">
                    {!latest ? (
                      <p className="text-sm text-slate-400">Sin métricas registradas aún. <button onClick={() => setShowForm(athlete)} className="underline text-slate-600">Registrar primera</button></p>
                    ) : (
                      <div className="space-y-4">
                        <MetaRow label="Fecha" value={latest.date} />
                        <CategoryBlock title="🏃 Carga de Entrenamiento">
                          <Grid>
                            <Cell label="Session RPE" value={latest.session_rpe} unit="/10" />
                            <Cell label="Duración (min)" value={latest.session_duration_min} unit="min" />
                            <Cell label="Session Load" value={latest.session_load} />
                            <Cell label="Carga Semanal" value={latest.weekly_load} />
                            <Cell label="Carga Crónica 4w" value={latest.chronic_load_4w} />
                            <BadgeCell label="ACWR" value={latest.acwr?.toFixed(2)} rules={RULES.acwr} note="Alerta >1.5" />
                          </Grid>
                        </CategoryBlock>

                        <CategoryBlock title="⚖️ Composición Corporal">
                          <Grid>
                            <Cell label="Peso" value={latest.weight_kg} unit="kg" />
                            <Cell label="Cintura" value={latest.waist_cm} unit="cm" />
                            <Cell label="Brazo" value={latest.arm_cm} unit="cm" />
                            <Cell label="Muslo" value={latest.thigh_cm} unit="cm" />
                            <Cell label="Σ Pliegues" value={latest.skinfold_sum_mm} unit="mm" />
                          </Grid>
                        </CategoryBlock>

                        <CategoryBlock title="🍗 Nutrición y Energía">
                          <Grid>
                            <BadgeCell label="Proteína" value={latest.protein_g_kg} unit="g/kg" rules={RULES.protein_g_kg} note="<1.2 alerta" />
                            <Cell label="Carbohidratos" value={latest.carbs_g_kg} unit="g/kg" />
                            <BadgeCell label="Disp. Energética" value={latest.energy_availability_kcal} unit=" kcal/kgMM" rules={RULES.energy_availability_kcal} note="<45 alerta" />
                          </Grid>
                        </CategoryBlock>

                        <CategoryBlock title="💧 Hidratación">
                          <Grid>
                            <Cell label="Tasa sudor" value={latest.sweat_rate_l_h} unit="L/h" />
                            <BadgeCell label="Pérdida peso" value={latest.weight_loss_pct} unit="%" rules={RULES.weight_loss_pct} note=">2% alerta" />
                            <BadgeCell label="Color orina" value={latest.urine_color} unit="/8" rules={RULES.urine_color} note="≥5 alerta" />
                          </Grid>
                        </CategoryBlock>

                        <CategoryBlock title="❤️ Recuperación y VFC">
                          <Grid>
                            <Cell label="HRV" value={latest.hrv_ms} unit="ms" />
                            <BadgeCell label="ΔHRV" value={latest.hrv_change_pct != null ? `${latest.hrv_change_pct > 0 ? "+" : ""}${latest.hrv_change_pct}` : null} unit="%" rules={RULES.hrv_change_pct} note="<-10% alerta" />
                            <BadgeCell label="FC Reposo" value={latest.resting_hr} unit="bpm" rules={RULES.resting_hr} />
                            <Cell label="HRR 60s" value={latest.hrr_60s} unit="bpm" />
                            <BadgeCell label="Fatiga" value={latest.fatigue_level} unit="/5" rules={RULES.fatigue_level} />
                            <BadgeCell label="Dolor musc." value={latest.muscle_soreness} unit="/5" rules={RULES.muscle_soreness} />
                            <BadgeCell label="Estrés" value={latest.stress_level} unit="/5" rules={RULES.stress_level} />
                          </Grid>
                        </CategoryBlock>

                        <CategoryBlock title="😴 Calidad del Sueño">
                          <Grid>
                            <Cell label="Duración total" value={latest.sleep_hours} unit="h" />
                            <BadgeCell label="Eficiencia" value={latest.sleep_efficiency_pct} unit="%" rules={RULES.sleep_efficiency_pct} note="Obj: >85%" />
                            <BadgeCell label="Latencia" value={latest.sleep_latency_min} unit="min" rules={RULES.sleep_latency_min} note="Obj: 10-20 min" />
                            <BadgeCell label="WASO" value={latest.waso_min} unit="min" rules={RULES.waso_min} note="Obj: <30 min" />
                          </Grid>
                          <div className="mt-2">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Arquitectura del sueño</div>
                            <Grid>
                              <BadgeCell label="Profundo (N3)" value={latest.sleep_deep_pct} unit="%" rules={RULES.sleep_deep_pct} note="Obj: 15-25%" />
                              <BadgeCell label="REM" value={latest.sleep_rem_pct} unit="%" rules={RULES.sleep_rem_pct} note="Obj: 20-25%" />
                              <Cell label="Ligero (N1/N2)" value={latest.sleep_light_pct} unit="%" />
                            </Grid>
                          </div>
                          <div className="mt-2">
                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">HRV nocturna y estado diurno</div>
                            <Grid>
                              <BadgeCell label="HRV nocturna" value={latest.nocturnal_hrv_ms} unit="ms" rules={RULES.nocturnal_hrv_ms} note="Mayor=mejor" />
                              <BadgeCell label="Inercia sueño" value={latest.sleep_inertia_min} unit="min" rules={RULES.sleep_inertia_min} note="Niebla al despertar" />
                              <BadgeCell label="Alerta diurna" value={latest.daytime_alertness} unit="/5" rules={RULES.daytime_alertness} note="Obj: ≥4" />
                              <BadgeCell label="Continuidad" value={latest.sleep_continuity} unit="/5" rules={RULES.sleep_continuity} note="Obj: ≥4" />
                            </Grid>
                          </div>
                        </CategoryBlock>

                        <CategoryBlock title="🦵 Riesgo de Lesión">
                          <Grid>
                            <BadgeCell label="CMJ Δ%" value={latest.cmj_change_pct != null ? `${latest.cmj_change_pct > 0 ? "+" : ""}${latest.cmj_change_pct}` : null} unit="%" rules={RULES.cmj_change_pct} note="<-10% alerta" />
                            <Cell label="CMJ base" value={latest.cmj_cm} unit="cm" />
                          </Grid>
                        </CategoryBlock>

                        {latest.notes && <p className="text-xs text-slate-500 italic">Notas: {latest.notes}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <MetricsForm
          athlete={showForm}
          onClose={() => setShowForm(null)}
          onSaved={() => { setShowForm(null); load(); }}
        />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CategoryBlock({ title, children }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</div>
      {children}
    </div>
  );
}
function Grid({ children }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">{children}</div>;
}
function Cell({ label, value, unit = "" }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value != null ? `${value}${unit}` : "—"}</div>
    </div>
  );
}
function BadgeCell({ label, value, unit = "", rules, note }) {
  const color = rules ? flag(value != null ? parseFloat(value) : null, rules) : "none";
  const bg = { red: "bg-rose-50 border-rose-200", yellow: "bg-amber-50 border-amber-200", green: "bg-emerald-50 border-emerald-200", none: "bg-slate-50 border-slate-200" };
  const tx = { red: "text-rose-700", yellow: "text-amber-700", green: "text-emerald-700", none: "text-slate-400" };
  return (
    <div className={`rounded-lg border px-3 py-2 ${bg[color]}`}>
      <div className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</div>
      <div className={`text-sm font-semibold ${tx[color]}`}>{value != null ? `${value}${unit}` : "—"}</div>
      {note && <div className="text-[10px] opacity-60">{note}</div>}
    </div>
  );
}
function MetaRow({ label, value }) {
  return <div className="text-xs text-slate-500"><span className="font-medium">{label}:</span> {value}</div>;
}

// ─── Entry Form ───────────────────────────────────────────────────────────────
function MetricsForm({ athlete, onClose, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ athlete_id: athlete.id, athlete_name: athlete.full_name, date: today });
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm(f => ({ ...f, [k]: v === "" ? null : isNaN(Number(v)) ? v : Number(v) })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try { await base44.entities.AthleteMetrics.create(form); onSaved(); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Registrar métricas · {athlete.full_name.split(" ")[0]}</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        <Field label="Fecha"><input type="date" value={form.date || today} onChange={e => set("date", e.target.value)} className="inp" /></Field>

        <Section title="🏃 Carga">
          <TwoCol>
            <Field label="Session RPE (1-10)"><input type="number" min="1" max="10" onChange={e => set("session_rpe", e.target.value)} className="inp" /></Field>
            <Field label="Duración sesión (min)"><input type="number" onChange={e => set("session_duration_min", e.target.value)} className="inp" /></Field>
            <Field label="Carga semanal"><input type="number" onChange={e => set("weekly_load", e.target.value)} className="inp" /></Field>
            <Field label="Carga crónica 4 sem."><input type="number" onChange={e => set("chronic_load_4w", e.target.value)} className="inp" /></Field>
            <Field label="ACWR"><input type="number" step="0.01" onChange={e => set("acwr", e.target.value)} className="inp" placeholder="ej. 1.2" /></Field>
          </TwoCol>
        </Section>

        <Section title="⚖️ Composición corporal">
          <TwoCol>
            <Field label="Peso (kg)"><input type="number" step="0.1" onChange={e => set("weight_kg", e.target.value)} className="inp" /></Field>
            <Field label="Cintura (cm)"><input type="number" step="0.1" onChange={e => set("waist_cm", e.target.value)} className="inp" /></Field>
            <Field label="Brazo (cm)"><input type="number" step="0.1" onChange={e => set("arm_cm", e.target.value)} className="inp" /></Field>
            <Field label="Muslo (cm)"><input type="number" step="0.1" onChange={e => set("thigh_cm", e.target.value)} className="inp" /></Field>
            <Field label="Σ Pliegues (mm)"><input type="number" step="0.1" onChange={e => set("skinfold_sum_mm", e.target.value)} className="inp" /></Field>
          </TwoCol>
        </Section>

        <Section title="🍗 Nutrición">
          <TwoCol>
            <Field label="Proteína (g/kg)"><input type="number" step="0.1" onChange={e => set("protein_g_kg", e.target.value)} className="inp" /></Field>
            <Field label="Carbos (g/kg)"><input type="number" step="0.1" onChange={e => set("carbs_g_kg", e.target.value)} className="inp" /></Field>
            <Field label="Disp. energética (kcal/kgMM)"><input type="number" step="1" onChange={e => set("energy_availability_kcal", e.target.value)} className="inp" /></Field>
          </TwoCol>
        </Section>

        <Section title="💧 Hidratación">
          <TwoCol>
            <Field label="Tasa sudor (L/h)"><input type="number" step="0.01" onChange={e => set("sweat_rate_l_h", e.target.value)} className="inp" /></Field>
            <Field label="Pérdida de peso (%)"><input type="number" step="0.1" onChange={e => set("weight_loss_pct", e.target.value)} className="inp" /></Field>
            <Field label="Color orina (1-8)"><input type="number" min="1" max="8" onChange={e => set("urine_color", e.target.value)} className="inp" /></Field>
          </TwoCol>
        </Section>

        <Section title="❤️ Recuperación / HRV">
          <TwoCol>
            <Field label="HRV (ms)"><input type="number" onChange={e => set("hrv_ms", e.target.value)} className="inp" /></Field>
            <Field label="ΔHRV (%)"><input type="number" onChange={e => set("hrv_change_pct", e.target.value)} className="inp" placeholder="-15" /></Field>
            <Field label="FC reposo (bpm)"><input type="number" onChange={e => set("resting_hr", e.target.value)} className="inp" /></Field>
            <Field label="HRR 60s (bpm)"><input type="number" onChange={e => set("hrr_60s", e.target.value)} className="inp" /></Field>
            <Field label="Fatiga (1-5)"><input type="number" min="1" max="5" onChange={e => set("fatigue_level", e.target.value)} className="inp" /></Field>
            <Field label="Dolor muscular (1-5)"><input type="number" min="1" max="5" onChange={e => set("muscle_soreness", e.target.value)} className="inp" /></Field>
            <Field label="Estrés (1-5)"><input type="number" min="1" max="5" onChange={e => set("stress_level", e.target.value)} className="inp" /></Field>
          </TwoCol>
        </Section>

        <Section title="😴 Calidad del Sueño">
          <TwoCol>
            <Field label="Duración total (h)"><input type="number" step="0.5" onChange={e => set("sleep_hours", e.target.value)} className="inp" /></Field>
            <Field label="Eficiencia (%)"><input type="number" min="0" max="100" onChange={e => set("sleep_efficiency_pct", e.target.value)} className="inp" placeholder="Obj: >85" /></Field>
            <Field label="Latencia (min)"><input type="number" onChange={e => set("sleep_latency_min", e.target.value)} className="inp" placeholder="Obj: 10-20" /></Field>
            <Field label="WASO (min)"><input type="number" onChange={e => set("waso_min", e.target.value)} className="inp" placeholder="Obj: <30" /></Field>
            <Field label="Sueño Profundo N3 (%)"><input type="number" min="0" max="100" onChange={e => set("sleep_deep_pct", e.target.value)} className="inp" placeholder="Obj: 15-25" /></Field>
            <Field label="Sueño REM (%)"><input type="number" min="0" max="100" onChange={e => set("sleep_rem_pct", e.target.value)} className="inp" placeholder="Obj: 20-25" /></Field>
            <Field label="Sueño Ligero N1/N2 (%)"><input type="number" min="0" max="100" onChange={e => set("sleep_light_pct", e.target.value)} className="inp" placeholder="Obj: 50-60" /></Field>
            <Field label="HRV nocturna (ms)"><input type="number" onChange={e => set("nocturnal_hrv_ms", e.target.value)} className="inp" /></Field>
            <Field label="Inercia del sueño (min)"><input type="number" onChange={e => set("sleep_inertia_min", e.target.value)} className="inp" placeholder="Niebla al despertar" /></Field>
            <Field label="Alerta diurna (1-5)"><input type="number" min="1" max="5" onChange={e => set("daytime_alertness", e.target.value)} className="inp" placeholder="5=óptimo" /></Field>
            <Field label="Continuidad percibida (1-5)"><input type="number" min="1" max="5" onChange={e => set("sleep_continuity", e.target.value)} className="inp" placeholder="5=continuo" /></Field>
          </TwoCol>
        </Section>

        <Section title="🦵 Saltos (riesgo lesión)">
          <TwoCol>
            <Field label="CMJ base (cm)"><input type="number" step="0.1" onChange={e => set("cmj_cm", e.target.value)} className="inp" /></Field>
            <Field label="CMJ Δ% (vs base)"><input type="number" step="0.1" onChange={e => set("cmj_change_pct", e.target.value)} className="inp" placeholder="-8" /></Field>
          </TwoCol>
        </Section>

        <Field label="Notas"><textarea onChange={e => set("notes", e.target.value)} className="inp" rows={2} /></Field>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Guardando..." : "Guardar métricas"}</Button>
        </div>
      </form>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return <div><div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</div>{children}</div>;
}
function TwoCol({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, children }) {
  return <label className="block space-y-1"><span className="text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}