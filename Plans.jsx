import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { SESSION_TYPES, LEVELS, DAYS, nutritionRecommendation } from "@/lib/training";
import { Plus, ChevronLeft, RefreshCw, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const [ps, aths] = await Promise.all([base44.entities.TrainingPlan.list("-week_start_date"), base44.entities.Athlete.list()]);
      setPlans(ps);
      setAthletes(aths);
    } finally { setLoading(false); }
  }

  const selected = selectedId ? plans.find(p => p.id === selectedId) : null;

  if (selected) {
    return <PlanDetail plan={selected} athletes={athletes} onBack={() => { setSelectedId(null); load(); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Planes de entrenamiento</h1>
          <p className="text-sm text-slate-500 mt-1">Bloques semanales por nivel</p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-slate-700"><RefreshCw className="w-5 h-5" /></button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : plans.length === 0 ? (
        <NewPlanCard athletes={athletes} onCreated={(p) => { load(); }} />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((p) => {
              const lvl = LEVELS[p.level] || LEVELS.basic;
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)} className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.text} border ${lvl.border}`}>{lvl.label}</span>
                    <span className="text-xs text-slate-400">{p.assigned_athlete_ids?.length || 0} atletas</span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-2">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Semana del {p.week_start_date}</div>
                </button>
              );
            })}
          </div>
          <NewPlanCard athletes={athletes} onCreated={(p) => { load(); }} compact />
        </>
      )}
    </div>
  );
}

function NewPlanCard({ athletes, onCreated, compact }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", level: "basic", description: "", week_start_date: new Date().toISOString().split("T")[0], assigned_athlete_ids: [] });
  const [saving, setSaving] = useState(false);

  if (compact) {
    return (
      <>
        <button onClick={() => setOpen(true)} className="w-full rounded-2xl border border-dashed border-slate-300 bg-white p-4 flex items-center justify-center gap-2 text-slate-500 hover:bg-slate-50">
          <Plus className="w-4 h-4" /> Crear nuevo plan
        </button>
        {open && <PlanFormModal form={form} setForm={setForm} athletes={athletes} saving={saving} onClose={() => setOpen(false)} onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { const p = await base44.entities.TrainingPlan.create(form); onCreated(p); setOpen(false); } finally { setSaving(false); } }} />}
      </>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-slate-500 text-sm">Crea tu primer plan semanal.</p>
      <Button onClick={() => setOpen(true)} className="mt-4 gap-1.5"><Plus className="w-4 h-4" /> Nuevo plan</Button>
      {open && <PlanFormModal form={form} setForm={setForm} athletes={athletes} saving={saving} onClose={() => setOpen(false)} onSubmit={async (e) => { e.preventDefault(); setSaving(true); try { const p = await base44.entities.TrainingPlan.create(form); onCreated(p); setOpen(false); } finally { setSaving(false); } }} />}
    </div>
  );
}

function PlanFormModal({ form, setForm, athletes, saving, onClose, onSubmit }) {
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleAthlete(id) {
    setForm((f) => {
      const ids = f.assigned_athlete_ids || [];
      return { ...f, assigned_athlete_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
    });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={onSubmit} onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo plan</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <Field label="Nombre del plan"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className="inp" placeholder="Ej. Bloque fuerza 1" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nivel">
            <select value={form.level} onChange={(e) => set("level", e.target.value)} className="inp">
              <option value="basic">Básico</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option>
            </select>
          </Field>
          <Field label="Inicio de semana"><input type="date" value={form.week_start_date} onChange={(e) => set("week_start_date", e.target.value)} className="inp" /></Field>
        </div>
        <Field label="Descripción"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="inp" rows={2} /></Field>
        <div>
          <span className="text-xs font-medium text-slate-600">Asignar a atletas</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {athletes.map((a) => {
              const on = (form.assigned_athlete_ids || []).includes(a.id);
              return (
                <button type="button" key={a.id} onClick={() => toggleAthlete(a.id)} className={`text-xs px-2.5 py-1 rounded-full border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>{a.full_name}</button>
              );
            })}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Guardando..." : "Crear plan"}</Button>
        </div>
      </form>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
    </div>
  );
}

function PlanDetail({ plan, athletes, onBack }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => { loadSessions(); }, [plan.id]);
  async function loadSessions() {
    setLoading(true);
    try { setSessions(await base44.entities.TrainingSession.filter({ plan_id: plan.id })); } finally { setLoading(false); }
  }

  const lvl = LEVELS[plan.level];
  const assigned = athletes.filter((a) => (plan.assigned_athlete_ids || []).includes(a.id));

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="w-4 h-4" /> Planes</button>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-900">{plan.name}</h1>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.text} border ${lvl.border}`}>{lvl.label}</span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Semana del {plan.week_start_date}{assigned.length > 0 ? ` · ${assigned.length} atletas asignados` : ""}</p>
        </div>
      </div>

      <div className="space-y-2">
        {DAYS.map((day, idx) => {
          const s = sessions.find((x) => x.day_of_week === idx);
          const st = s ? SESSION_TYPES[s.session_type] : null;
          return (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-4">
              <div className="w-10 text-center">
                <div className="text-xs text-slate-400">{day}</div>
              </div>
              {s ? (
                <>
                  <div className="text-2xl">{st.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{s.title}</div>
                    <div className="text-xs text-slate-500">{st.label}{s.target_distance_km ? ` · ${s.target_distance_km} km` : ""}{s.target_duration_min ? ` · ${s.target_duration_min} min` : ""} · Z{s.intensity_zone || "-"}</div>
                  </div>
                  <button onClick={() => setEditing({ ...s })} className="text-xs text-slate-500 hover:text-slate-900 underline">Editar</button>
                </>
              ) : (
                <>
                  <div className="flex-1 text-sm text-slate-400">Descanso / sin sesión</div>
                  <button onClick={() => setEditing({ plan_id: plan.id, day_of_week: idx, title: "", session_type: "easy_run", target_distance_km: null, target_duration_min: null, intensity_zone: 2, description: "", nutrition_notes: "" })} className="text-xs text-slate-900 font-medium inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Agregar</button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {editing && <SessionEditor session={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); loadSessions(); }} />}
    </div>
  );
}

function SessionEditor({ session, onClose, onSaved }) {
  const [form, setForm] = useState(session);
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const rec = nutritionRecommendation(form.target_duration_min, 65);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (form.id) await base44.entities.TrainingSession.update(form.id, form);
      else await base44.entities.TrainingSession.create(form);
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sesión · {DAYS[form.day_of_week]}</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <Field label="Título"><input required value={form.title} onChange={(e) => set("title", e.target.value)} className="inp" /></Field>
        <Field label="Tipo de sesión">
          <select value={form.session_type} onChange={(e) => set("session_type", e.target.value)} className="inp">
            {Object.entries(SESSION_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Distancia (km)"><input type="number" step="0.1" value={form.target_distance_km ?? ""} onChange={(e) => set("target_distance_km", e.target.value ? Number(e.target.value) : null)} className="inp" /></Field>
          <Field label="Duración (min)"><input type="number" value={form.target_duration_min ?? ""} onChange={(e) => set("target_duration_min", e.target.value ? Number(e.target.value) : null)} className="inp" /></Field>
          <Field label="Zona"><input type="number" min="1" max="5" value={form.intensity_zone ?? ""} onChange={(e) => set("intensity_zone", Number(e.target.value))} className="inp" /></Field>
        </div>
        <Field label="Descripción"><textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="inp" rows={2} /></Field>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800 space-y-1">
          <div className="font-semibold">🍗 Nutrición sugerida (auto)</div>
          <div><strong>Antes:</strong> {rec.before}</div>
          <div><strong>Durante:</strong> {rec.during}</div>
          <div><strong>Después:</strong> {rec.after}</div>
        </div>
        <Field label="Notas de nutrición (editables)"><textarea value={form.nutrition_notes} onChange={(e) => set("nutrition_notes", e.target.value)} className="inp" rows={2} placeholder="Ej. Hidratarse bien, gel a los 45 min..." /></Field>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1 gap-1.5" disabled={saving}><Save className="w-4 h-4" /> {saving ? "..." : "Guardar"}</Button>
        </div>
        <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}