import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { trafficLightConfig, computeTrafficLight, todayISO, draftMessage } from "@/lib/training";
import { AlertTriangle, CheckCircle2, MessageSquare, Smartphone, RefreshCw, Activity, BarChart2, Target } from "lucide-react";
import MetricsMonitor from "@/pages/coach/MetricsMonitor";
import GoalsMonitor from "@/pages/coach/GoalsMonitor";

export default function Dashboard() {
  const [tab, setTab] = useState("semaforo");
  const [athletes, setAthletes] = useState([]);
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [aths, cis] = await Promise.all([
        base44.entities.Athlete.filter({ status: "active" }),
        base44.entities.DailyCheckIn.filter({ date: todayISO() }),
      ]);
      setAthletes(aths);
      setCheckIns(cis);
    } finally { setLoading(false); }
  }

  const checkInByAthlete = {};
  checkIns.forEach((c) => { checkInByAthlete[c.athlete_id] = c; });

  const rows = athletes.map((a) => {
    const ci = checkInByAthlete[a.id];
    const light = computeTrafficLight(ci) || ci?.traffic_light || null;
    return { athlete: a, checkIn: ci, light };
  });

  const red = rows.filter((r) => r.light === "red");
  const yellow = rows.filter((r) => r.light === "yellow");
  const green = rows.filter((r) => r.light === "green");
  const noData = rows.filter((r) => !r.light);

  function waLink(phone) {
    const p = (phone || "").replace(/\D/g, "");
    return p ? `https://wa.me/${p}` : "#";
  }

  function generateDraft(athlete, checkIn, light) {
    setDrafts((d) => ({ ...d, [athlete.id]: draftMessage(light, athlete, checkIn) }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Buenos días, Lucirio</h1>
          <p className="text-sm text-slate-500 mt-1">
            {new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" })} · {athletes.length} atletas activos
          </p>
        </div>
        <button onClick={load} className="text-slate-400 hover:text-slate-700">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <TabBtn active={tab === "semaforo"} onClick={() => setTab("semaforo")} icon={<Activity className="w-4 h-4" />}>Semáforo</TabBtn>
        <TabBtn active={tab === "metricas"} onClick={() => setTab("metricas")} icon={<BarChart2 className="w-4 h-4" />}>Monitor de Métricas</TabBtn>
        <TabBtn active={tab === "objetivos"} onClick={() => setTab("objetivos")} icon={<Target className="w-4 h-4" />}>Objetivos</TabBtn>
      </div>

      {tab === "metricas" && <MetricsMonitor />}
      {tab === "objetivos" && <GoalsMonitor />}

      {tab === "semaforo" && <>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard count={red.length} label="Requiere acción" tone="rose" icon={<AlertTriangle className="w-4 h-4" />} />
        <SummaryCard count={yellow.length} label="Atención" tone="amber" icon={<AlertTriangle className="w-4 h-4" />} />
        <SummaryCard count={green.length} label="En verde" tone="emerald" icon={<CheckCircle2 className="w-4 h-4" />} />
        <SummaryCard count={noData.length} label="Sin check-in" tone="slate" icon={<AlertTriangle className="w-4 h-4" />} />
      </div>

      {/* Red & Yellow — the focus */}
      {(red.length > 0 || yellow.length > 0) && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Atletas que requieren tu atención</h2>
          {[...red, ...yellow].map(({ athlete, checkIn, light }) => {
            const cfg = trafficLightConfig(light);
            return (
              <div key={athlete.id} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} mt-1.5 shrink-0`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900">{athlete.full_name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text} border ${cfg.border}`}>{cfg.label}</span>
                      </div>
                      <p className={`text-sm ${cfg.text} mt-1`}>{cfg.description}</p>
                      {checkIn && (
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs text-slate-500">
                          <span>Sesión: {checkIn.session_completed}</span>
                          {checkIn.rpe && <span>RPE: {checkIn.rpe}/10</span>}
                          {checkIn.sleep_hours != null && <span>Sueño: {checkIn.sleep_hours}h</span>}
                          {checkIn.muscle_soreness != null && <span>Dolor muscular: {checkIn.muscle_soreness}/5</span>}
                          {checkIn.pain_reported && <span className="text-rose-600 font-medium">⚠ Reporta dolor: {checkIn.pain_notes}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {drafts[athlete.id] && (
                  <div className="mt-3 rounded-xl bg-white/70 border border-slate-200 p-3 text-sm text-slate-700">
                    <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Mensaje sugerido (IA)</div>
                    {drafts[athlete.id]}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={waLink(athlete.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <button
                    onClick={() => generateDraft(athlete, checkIn, light)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Borrador IA
                  </button>
                  <Link
                    to={`/atletas`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Green collapsed */}
      {green.length > 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm text-emerald-800">
            <strong>{green.length}</strong> atletas completaron su sesión con métricas normales. Sin acción requerida.
          </span>
        </div>
      )}

      {red.length === 0 && yellow.length === 0 && green.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-slate-500 text-sm">Aún no hay check-ins hoy. Los atletas verán su sesión al abrir la app.</p>
          <Link to="/atletas" className="inline-block mt-3 text-sm font-medium text-slate-900 underline">Ver atletas</Link>
        </div>
      )}
      </>}
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

function SummaryCard({ count, label, tone, icon }) {
  const tones = {
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return (
    <div className={`rounded-2xl border ${tones[tone]} p-4`}>
      <div className="flex items-center gap-1.5 opacity-80">{icon}<span className="text-[11px] uppercase tracking-wide">{label}</span></div>
      <div className="text-3xl font-semibold mt-1">{count}</div>
    </div>
  );
}