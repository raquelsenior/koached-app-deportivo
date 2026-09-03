import React, { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Upload, RefreshCw, CheckCircle2, AlertCircle, Trash2, Clock, MapPin, Zap, Heart } from "lucide-react";

const ACTIVITY_TYPES = [
  { value: "run", label: "Carrera", emoji: "🏃" },
  { value: "bike", label: "Bicicleta", emoji: "🚴" },
  { value: "swim", label: "Natación", emoji: "🏊" },
  { value: "strength", label: "Fuerza", emoji: "🏋️" },
  { value: "walk", label: "Caminata", emoji: "🚶" },
  { value: "other", label: "Otro", emoji: "⚡" },
];

const SOURCE_LABELS = {
  manual: "Manual",
  garmin: "Garmin",
  apple_watch: "Apple Watch",
  strava: "Strava",
  gpx_file: "Archivo GPX",
};

const SOURCE_ICONS = {
  garmin: "⌚",
  apple_watch: "🍎",
  strava: "🟠",
  gpx_file: "📁",
  manual: "✏️",
};

function fmtPace(sec) {
  if (!sec) return "--";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")} /km`;
}

function fmtDur(min) {
  if (!min) return "--";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ----- Manual Form -----
function ManualForm({ athleteId, athleteName, onSaved }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().substring(0, 10),
    activity_type: "run",
    title: "",
    distance_km: "",
    duration_min: "",
    avg_hr: "",
    elevation_gain_m: "",
    rpe: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        athlete_id: athleteId,
        athlete_name: athleteName,
        source: "manual",
        date: form.date,
        activity_type: form.activity_type,
        title: form.title || ACTIVITY_TYPES.find(a => a.value === form.activity_type)?.label,
        distance_km: form.distance_km ? parseFloat(form.distance_km) : undefined,
        duration_min: form.duration_min ? parseFloat(form.duration_min) : undefined,
        avg_hr: form.avg_hr ? parseFloat(form.avg_hr) : undefined,
        elevation_gain_m: form.elevation_gain_m ? parseFloat(form.elevation_gain_m) : undefined,
        rpe: form.rpe ? parseInt(form.rpe) : undefined,
        notes: form.notes || undefined,
      };
      // compute avg pace
      if (payload.distance_km && payload.duration_min) {
        payload.avg_pace_sec_km = Math.round((payload.duration_min * 60) / payload.distance_km);
      }
      await base44.entities.TrainingLog.create(payload);
      setOk(true);
      setTimeout(() => { setOk(false); onSaved(); }, 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {ok && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4" /> ¡Actividad guardada!
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Fecha</span>
          <input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="inp" required />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Tipo</span>
          <select value={form.activity_type} onChange={e => set("activity_type", e.target.value)} className="inp">
            {ACTIVITY_TYPES.map(a => <option key={a.value} value={a.value}>{a.emoji} {a.label}</option>)}
          </select>
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-slate-500">Título (opcional)</span>
        <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Ej. Rodaje matutino en el parque" className="inp" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Distancia (km)</span>
          <input type="number" step="0.01" min="0" value={form.distance_km} onChange={e => set("distance_km", e.target.value)} className="inp" placeholder="10.5" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Duración (min)</span>
          <input type="number" min="0" value={form.duration_min} onChange={e => set("duration_min", e.target.value)} className="inp" placeholder="60" />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">FC media (bpm)</span>
          <input type="number" min="0" value={form.avg_hr} onChange={e => set("avg_hr", e.target.value)} className="inp" placeholder="145" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Desnivel (m)</span>
          <input type="number" min="0" value={form.elevation_gain_m} onChange={e => set("elevation_gain_m", e.target.value)} className="inp" placeholder="120" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">RPE (1-10)</span>
          <input type="number" min="1" max="10" value={form.rpe} onChange={e => set("rpe", e.target.value)} className="inp" placeholder="7" />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs font-medium text-slate-500">Notas</span>
        <textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} className="inp resize-none" placeholder="Cómo te sentiste, condiciones, etc." />
      </label>

      <button type="submit" disabled={saving} className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
        {saving ? "Guardando..." : "Guardar actividad"}
      </button>

      <style>{`.inp{width:100%;border:1px solid #e2e8f0;border-radius:0.75rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white;outline:none}.inp:focus{border-color:#0f172a;box-shadow:0 0 0 2px rgba(15,23,42,.15)}`}</style>
    </form>
  );
}

// ----- GPX/File Upload -----
function GpxUpload({ athleteId, athleteName, source, onSaved }) {
  const fileRef = useRef();
  const [status, setStatus] = useState("idle"); // idle | parsing | ok | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("parsing");
    setErrorMsg("");
    try {
      let text = await file.text();

      // If .fit file, we can't parse it client-side — ask user to export as GPX
      if (file.name.endsWith(".fit")) {
        setStatus("error");
        setErrorMsg("Los archivos .fit no se pueden leer directamente. En Garmin Connect, exporta la actividad como GPX y vuelve a subirla.");
        return;
      }

      const res = await base44.functions.invoke("parseGpxActivity", {
        gpx_text: text,
        athlete_id: athleteId,
        athlete_name: athleteName,
        source,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setStatus("ok");
      setTimeout(() => { setStatus("idle"); onSaved(); }, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Error al procesar el archivo.");
    }
    e.target.value = "";
  }

  const sourceLabel = SOURCE_LABELS[source] || source;

  return (
    <div className="space-y-3">
      {status === "ok" && (
        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-sm">
          <CheckCircle2 className="w-4 h-4" /> ¡Actividad importada exitosamente!
        </div>
      )}
      {status === "error" && (
        <div className="flex items-start gap-2 text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {errorMsg}
        </div>
      )}

      <label className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-colors ${status === "parsing" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-white"}`}>
        {status === "parsing" ? (
          <>
            <RefreshCw className="w-7 h-7 text-amber-500 animate-spin" />
            <span className="text-sm text-amber-700 font-medium">Procesando actividad...</span>
          </>
        ) : (
          <>
            <Upload className="w-7 h-7 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Subir archivo GPX de {sourceLabel}</span>
            <span className="text-xs text-slate-400">Arrastra o toca para seleccionar (.gpx)</span>
          </>
        )}
        <input ref={fileRef} type="file" accept=".gpx,.xml" className="hidden" onChange={handleFile} disabled={status === "parsing"} />
      </label>
    </div>
  );
}

// ----- Main Component -----
export default function TrainingLogbook({ athleteId, athleteName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // null | "manual" | "garmin" | "apple_watch" | "strava"

  async function load() {
    if (!athleteId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await base44.entities.TrainingLog.filter({ athlete_id: athleteId }, "-date", 30);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [athleteId]);

  function afterSave() { setMode(null); load(); }

  async function deleteLog(id) {
    await base44.entities.TrainingLog.delete(id);
    load();
  }

  const actEmoji = (type) => ACTIVITY_TYPES.find(a => a.value === type)?.emoji || "⚡";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bitácora de Entrenamiento</h2>
        <p className="text-sm text-slate-500 mt-0.5">Registra actividades manualmente o importa desde tu dispositivo.</p>
      </div>

      {/* Source selector */}
      {!mode && (
        <div className="grid grid-cols-2 gap-3">
          <SourceCard icon="✏️" label="Registro manual" sub="Introduce los datos tú mismo" onClick={() => setMode("manual")} />
          <SourceCard icon="⌚" label="Garmin" sub="Exporta como GPX desde Garmin Connect" onClick={() => setMode("garmin")} />
          <SourceCard icon="🍎" label="Apple Watch" sub="Exporta GPX via WorkOutDoors o Health Export" onClick={() => setMode("apple_watch")} />
          <SourceCard icon="🟠" label="Strava" sub="Descarga el GPX desde Strava y súbelo" onClick={() => setMode("strava")} />
        </div>
      )}

      {/* Import panel */}
      {mode && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              {SOURCE_ICONS[mode]} {SOURCE_LABELS[mode]}
            </h3>
            <button onClick={() => setMode(null)} className="text-xs text-slate-400 hover:text-slate-700">← Volver</button>
          </div>

          {mode === "manual" && (
            <ManualForm athleteId={athleteId} athleteName={athleteName} onSaved={afterSave} />
          )}
          {(mode === "garmin" || mode === "apple_watch" || mode === "strava") && (
            <>
              {mode === "garmin" && (
                <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                  <strong>Cómo exportar de Garmin Connect:</strong> Abre la actividad → ··· → Exportar original → GPX
                </div>
              )}
              {mode === "apple_watch" && (
                <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                  <strong>Cómo exportar de Apple Watch:</strong> Usa la app <em>WorkOutDoors</em> o <em>Health Export</em> para exportar tu actividad como GPX.
                </div>
              )}
              {mode === "strava" && (
                <div className="text-xs text-slate-500 bg-slate-50 rounded-xl px-3 py-2.5">
                  <strong>Cómo exportar de Strava:</strong> Abre la actividad en la web → ··· → Exportar GPX
                </div>
              )}
              <GpxUpload athleteId={athleteId} athleteName={athleteName} source={mode} onSaved={afterSave} />
            </>
          )}
        </div>
      )}

      {/* Log list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Actividades recientes</h3>
          <button onClick={load} className="text-slate-400 hover:text-slate-700"><RefreshCw className="w-4 h-4" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            Aún no hay actividades registradas. ¡Empieza arriba! 👆
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0">{actEmoji(log.activity_type)}</span>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 text-sm truncate">{log.title || SOURCE_LABELS[log.source]}</div>
                    <div className="text-xs text-slate-400">{log.date} · {SOURCE_ICONS[log.source]} {SOURCE_LABELS[log.source]}</div>
                  </div>
                </div>
                <button onClick={() => deleteLog(log.id)} className="text-slate-300 hover:text-rose-400 shrink-0 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-600">
                {log.distance_km > 0 && (
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" />{log.distance_km} km</span>
                )}
                {log.duration_min > 0 && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" />{fmtDur(log.duration_min)}</span>
                )}
                {log.avg_pace_sec_km > 0 && (
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" />{fmtPace(log.avg_pace_sec_km)}</span>
                )}
                {log.avg_hr > 0 && (
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" />{log.avg_hr} bpm</span>
                )}
                {log.elevation_gain_m > 0 && (
                  <span>⛰️ +{log.elevation_gain_m} m</span>
                )}
                {log.rpe && (
                  <span>RPE {log.rpe}/10</span>
                )}
              </div>
              {log.notes && <p className="text-xs text-slate-500 mt-2 italic">{log.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SourceCard({ icon, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-400 hover:shadow-sm transition-all text-center"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="text-[11px] text-slate-400 leading-tight">{sub}</span>
    </button>
  );
}