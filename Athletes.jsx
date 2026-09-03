import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { LEVELS } from "@/lib/training";
import { Plus, Smartphone, RefreshCw, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrainingGroups from "@/components/athletes/TrainingGroups";

const COLORS = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-blue-500", "bg-purple-500", "bg-teal-500"];

export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("roster");

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try { setAthletes(await base44.entities.Athlete.list()); } finally { setLoading(false); }
  }

  async function createAthlete(data) {
    await base44.entities.Athlete.create({ ...data, avatar_color: COLORS[athletes.length % COLORS.length] });
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Atletas</h1>
          <p className="text-sm text-slate-500 mt-1">{athletes.length} registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-700"><RefreshCw className="w-5 h-5" /></button>
          <Button onClick={() => setShowForm(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Nuevo atleta</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        <TabBtn active={tab === "roster"} onClick={() => setTab("roster")} icon={<Users className="w-4 h-4" />}>Roster</TabBtn>
        <TabBtn active={tab === "grupos"} onClick={() => setTab("grupos")} icon={<Users className="w-4 h-4" />}>Grupos & Match</TabBtn>
      </div>

      {tab === "grupos" && <TrainingGroups athletes={athletes} />}

      {tab === "roster" && (
        loading ? (
          <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : athletes.length === 0 ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {athletes.map((a) => {
              const lvl = LEVELS[a.level] || LEVELS.basic;
              return (
                <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full ${a.avatar_color || "bg-slate-400"} flex items-center justify-center text-white font-semibold`}>
                      {a.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 truncate">{a.full_name}</div>
                      <div className="text-xs text-slate-500">{a.email}</div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${lvl.bg} ${lvl.text} border ${lvl.border}`}>{lvl.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>🔥 {a.current_streak || 0}d</span>
                      <span>📏 {(a.monthly_distance_km || 0).toFixed(1)} km</span>
                    </div>
                    <a href={`/runner/${a.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-slate-900 hover:underline">
                      <Smartphone className="w-3.5 h-3.5" /> Ver app
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showForm && <AthleteForm onClose={() => setShowForm(false)} onCreate={createAthlete} />}
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
      {icon}{children}
    </button>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-slate-500 text-sm">Aún no hay atletas registrados.</p>
      <Button onClick={onAdd} className="mt-4 gap-1.5"><Plus className="w-4 h-4" /> Agregar atleta</Button>
    </div>
  );
}

function AthleteForm({ onClose, onCreate }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", level: "basic", gender: "male", weight_kg: 65, cycle_tracking_enabled: false });
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try { await onCreate(form); } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Nuevo atleta</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <Field label="Nombre completo"><input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="inp" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="inp" /></Field>
          <Field label="Teléfono"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="inp" placeholder="+58..." /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nivel">
            <select value={form.level} onChange={(e) => set("level", e.target.value)} className="inp">
              <option value="basic">Básico</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </Field>
          <Field label="Género">
            <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="inp">
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </Field>
        </div>
        <Field label="Peso (kg)"><input type="number" value={form.weight_kg} onChange={(e) => set("weight_kg", Number(e.target.value))} className="inp" /></Field>
        {form.gender === "female" && (
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.cycle_tracking_enabled} onChange={(e) => set("cycle_tracking_enabled", e.target.checked)} />
            Activar seguimiento de ciclo menstrual
          </label>
        )}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </div>
      </form>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
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