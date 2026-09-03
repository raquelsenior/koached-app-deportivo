import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { computeTrafficLight, trafficLightConfig, todayISO } from "@/lib/training";
import { ChevronLeft, Check } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function CheckIn() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [existing, setExisting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    session_completed: "completed",
    rpe: 5,
    sleep_hours: 7,
    sleep_quality: 3,
    muscle_soreness: 2,
    mood: 3,
    pain_reported: false,
    pain_notes: "",
    notes: "",
    actual_distance_km: null,
    actual_duration_min: null,
    cycle_phase: "",
  });

  useEffect(() => {
    (async () => {
      const a = await base44.entities.Athlete.get(athleteId);
      setAthlete(a);
      const cis = await base44.entities.DailyCheckIn.filter({ athlete_id: athleteId, date: todayISO() });
      if (cis[0]) {
        setExisting(cis[0]);
        setForm((f) => ({ ...f, ...cis[0] }));
      }
    })();
  }, [athleteId]);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const { t } = useLang();
  const previewLight = computeTrafficLight(form);
  const cfg = trafficLightConfig(previewLight);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, athlete_id: athleteId, athlete_name: athlete?.full_name, date: todayISO(), traffic_light: previewLight };
      if (existing?.id) await base44.entities.DailyCheckIn.update(existing.id, payload);
      else await base44.entities.DailyCheckIn.create(payload);
      navigate(`/runner/${athleteId}`);
    } finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-md mx-auto px-5 py-6">
        <button onClick={() => navigate(`/runner/${athleteId}`)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ChevronLeft className="w-4 h-4" /> Volver
        </button>
        <h1 className="text-xl font-semibold text-slate-900">{t("checkInTitle")}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{t("checkInSubtitle")}</p>

        <form onSubmit={submit} className="mt-5 space-y-5">
          {/* Session completion */}
          <Section title={t("sessionCompleted")}>
            <div className="grid grid-cols-4 gap-2">
              {[["completed", `✅ ${t("complete")}`], ["partial", `⚡ ${t("partial")}`], ["missed", `❌ ${t("missed")}`], ["rest_day", `😴 ${t("restDayLabel")}`]].map(([v, l]) => (
                <button type="button" key={v} onClick={() => set("session_completed", v)} className={`text-xs py-2 rounded-lg border ${form.session_completed === v ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>{l}</button>
              ))}
            </div>
          </Section>

          <Section title={`${t("effort")}: ${form.rpe}/10`}>
            <input type="range" min="1" max="10" value={form.rpe} onChange={(e) => set("rpe", Number(e.target.value))} className="w-full accent-slate-900" />
            <div className="flex justify-between text-[10px] text-slate-400"><span>Descanso</span><span>Máximo</span></div>
          </Section>

          <Section title={`${t("sleepHours")}: ${form.sleep_hours}h`}>
            <input type="range" min="0" max="12" step="0.5" value={form.sleep_hours} onChange={(e) => set("sleep_hours", Number(e.target.value))} className="w-full accent-slate-900" />
          </Section>

          <div className="grid grid-cols-2 gap-3">
            <Section title={`${t("soreness")}: ${form.muscle_soreness}/5`}>
              <input type="range" min="1" max="5" value={form.muscle_soreness} onChange={(e) => set("muscle_soreness", Number(e.target.value))} className="w-full accent-slate-900" />
            </Section>
            <Section title={`${t("mood")}: ${form.mood}/5`}>
              <input type="range" min="1" max="5" value={form.mood} onChange={(e) => set("mood", Number(e.target.value))} className="w-full accent-slate-900" />
            </Section>
          </div>

          {/* Pain */}
          <Section title={t("painReported")}>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.pain_reported} onChange={(e) => set("pain_reported", e.target.checked)} className="accent-rose-600" />
              {t("reportPain")}
            </label>
            {form.pain_reported && <input value={form.pain_notes} onChange={(e) => set("pain_notes", e.target.value)} placeholder={t("painLocation")} className="inp mt-2" />}
          </Section>

          {athlete?.gender === "female" && athlete?.cycle_tracking_enabled && (
            <Section title="Fase del ciclo (opcional)">
              <select value={form.cycle_phase} onChange={(e) => set("cycle_phase", e.target.value)} className="inp">
                <option value="">—</option>
                <option value="early_follicular">Folicular temprana</option>
                <option value="late_follicular">Folicular tardía</option>
                <option value="ovulation">Ovulación</option>
                <option value="early_luteal">Lútea temprana</option>
                <option value="late_luteal">Lútea tardía</option>
              </select>
            </Section>
          )}

          <Section title={t("notes")}>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="inp" rows={2} placeholder={t("notes")} />
          </Section>

          {/* Traffic light preview */}
          <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 flex items-center gap-3`}>
            <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
            <div>
              <div className={`font-semibold ${cfg.text}`}>Estado: {cfg.label}</div>
              <div className="text-xs text-slate-500">{cfg.description}</div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">
            <Check className="w-4 h-4" /> {saving ? t("saving") : t("submitCheckIn")}
          </button>
        </form>
      </div>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-sm font-medium text-slate-700 mb-2">{title}</div>
      {children}
    </div>
  );
}