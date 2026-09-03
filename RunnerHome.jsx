import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { SESSION_TYPES, DAYS, todayDayOfWeek, trafficLightConfig, computeTrafficLight, nutritionRecommendation } from "@/lib/training";
import { Activity, Flame, Trophy, MapPin, Clock, ChevronRight, RefreshCw, CreditCard } from "lucide-react";
import { useLang } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function RunnerHome() {
  const { athleteId } = useParams();
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState(null);
  const [session, setSession] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [athleteId]);

  async function load() {
    setLoading(true);
    try {
      const [a, all, infos] = await Promise.all([
        base44.entities.Athlete.get(athleteId),
        base44.entities.Athlete.filter({ status: "active" }),
        base44.entities.PaymentInfo.list("-valid_date", 1),
      ]);
      setAthlete(a);
      setAthletes(all);
      setInfo(infos[0] || null);
      const plans = await base44.entities.TrainingPlan.filter({ assigned_athlete_ids: athleteId });
      if (plans.length) {
        const sessions = await base44.entities.TrainingSession.filter({ plan_id: plans[0].id });
        const dow = todayDayOfWeek();
        setSession(sessions.find((s) => s.day_of_week === dow) || null);
      }
      const cis = await base44.entities.DailyCheckIn.filter({ athlete_id: athleteId, date: new Date().toISOString().split("T")[0] });
      setCheckIn(cis[0] || null);
    } finally { setLoading(false); }
  }

  const { t } = useLang();

  if (loading) return <div className="flex justify-center py-24"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>;
  if (!athlete) return <p className="text-center py-24 text-slate-500">Atleta no encontrado.</p>;

  const dow = todayDayOfWeek();
  const st = session ? SESSION_TYPES[session.session_type] : null;
  const rec = session ? nutritionRecommendation(session.target_duration_min, athlete.weight_kg) : null;
  const light = checkIn ? computeTrafficLight(checkIn) : null;
  const lightCfg = trafficLightConfig(light);

  // Leaderboard
  const ranked = [...athletes].sort((a, b) => (b.monthly_distance_km || 0) - (a.monthly_distance_km || 0)).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-md mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
            <div>
              <div className="text-[11px] text-slate-400 leading-none"><LangToggle className="border-white/20 bg-white/10 text-white" /></div>
              <div className="font-semibold text-sm">Hola, {athlete.full_name.split(" ")[0]} 👋</div>
            </div>
          </div>
          {light && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${lightCfg.bg} ${lightCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${lightCfg.dot}`} /> {lightCfg.label}
            </div>
          )}
        </div>

        {/* Today's session */}
        <div className="mt-6">
          <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">{t("today")} · {DAYS[dow]}</div>
          {session ? (
            <div className="rounded-3xl bg-white text-slate-900 p-5 shadow-xl">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{st.emoji}</div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Zona</div>
                  <div className="text-2xl font-semibold">{session.intensity_zone || "-"}</div>
                </div>
              </div>
              <h2 className="text-xl font-semibold mt-3">{session.title}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{st.label}</p>
              <div className="flex gap-4 mt-4">
                {session.target_distance_km && <Stat icon={<MapPin className="w-4 h-4" />} value={`${session.target_distance_km} km`} label="Distancia" />}
                {session.target_duration_min && <Stat icon={<Clock className="w-4 h-4" />} value={`${session.target_duration_min} min`} label="Duración" />}
              </div>
              {session.description && <p className="text-sm text-slate-600 mt-4">{session.description}</p>}
              {rec && (
                <div className="mt-4 rounded-2xl bg-blue-50 border border-blue-100 p-3 text-xs text-blue-900 space-y-1">
                  <div className="font-semibold">🍗 Nutrición para hoy</div>
                  <div>{rec.summary}</div>
                  <div><strong>Antes:</strong> {rec.before}</div>
                  <div><strong>Durante:</strong> {rec.during}</div>
                </div>
              )}
              {session.nutrition_notes && <p className="text-xs text-slate-500 mt-2 italic">Nota del coach: {session.nutrition_notes}</p>}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/10 p-6 text-center">
              <div className="text-4xl mb-2">😴</div>
              <p className="text-slate-300 text-sm">{t("restMessage")}</p>
            </div>
          )}
        </div>

        {/* Check-in CTA */}
        {!checkIn ? (
          <button onClick={() => navigate(`/runner/${athleteId}/check-in`)} className="w-full mt-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3.5 flex items-center justify-center gap-2 transition-colors">
            {t("registerFeelings")} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="mt-4 rounded-2xl bg-white/10 p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{t("checkInSaved")}</div>
              <div className="text-xs text-slate-400">RPE {checkIn.rpe || "-"} · {checkIn.session_completed}</div>
            </div>
            <button onClick={() => navigate(`/runner/${athleteId}/check-in`)} className="text-xs underline text-slate-300">{t("editCheckIn")}</button>
          </div>
        )}

        {/* Leaderboard */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2"><Trophy className="w-4 h-4 text-amber-400" /><span className="text-xs uppercase tracking-wide text-slate-400">{t("clubRanking")}</span></div>
          <div className="rounded-2xl bg-white/5 divide-y divide-white/5 overflow-hidden">
            {ranked.map((a, i) => (
              <div key={a.id} className={`flex items-center gap-3 px-4 py-2.5 ${a.id === athleteId ? "bg-white/10" : ""}`}>
                <span className={`w-6 text-center font-semibold ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-700" : "text-slate-500"}`}>{i + 1}</span>
                <div className={`w-8 h-8 rounded-full ${a.avatar_color || "bg-slate-500"} flex items-center justify-center text-xs font-bold`}>{a.full_name.charAt(0)}</div>
                <span className="flex-1 text-sm truncate">{a.full_name}</span>
                <span className="text-sm font-medium">{(a.monthly_distance_km || 0).toFixed(1)} km</span>
                {a.current_streak > 0 && <Flame className="w-3.5 h-3.5 text-orange-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Payment info */}
        {info && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2"><CreditCard className="w-4 h-4 text-emerald-400" /><span className="text-xs uppercase tracking-wide text-slate-400">{t("activePaymentInfo")}</span></div>
            <div className="rounded-2xl bg-white/5 p-4 text-sm space-y-1.5">
              <Row label="Tasa USD→VES" value={info.exchange_rate_usd_ves ? `Bs ${info.exchange_rate_usd_ves}` : "—"} />
              {info.daily_card_pin && <Row label="PIN tarjeta" value="****" />}
              <Row label="Últimos 4" value={info.card_last4 || "—"} />
              {info.zelle_email && <Row label="Zelle" value={info.zelle_email} />}
              {info.binance_id && <Row label="Binance" value={info.binance_id} />}
              {info.pago_movil_phone && <Row label="Pago Móvil" value={`${info.pago_movil_bank || ""} · ${info.pago_movil_cedula || ""} · ${info.pago_movil_phone}`} />}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(info.accepted_methods || []).map((m) => <span key={m} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10">{m}</span>)}
              </div>
              {info.notes && <p className="text-xs text-slate-400 italic pt-1">{info.notes}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      {icon}<span className="font-semibold text-slate-900 text-sm">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-slate-400">{label}</span><span className="font-medium">{value}</span></div>;
}