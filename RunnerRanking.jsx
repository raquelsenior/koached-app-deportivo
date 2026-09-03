import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Trophy, TrendingUp } from "lucide-react";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function RunnerRanking() {
  const [athletes, setAthletes] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDist, setFilterDist] = useState("all");

  useEffect(() => {
    Promise.all([
      base44.entities.Athlete.filter({ status: "active" }),
      base44.entities.AthleteGoal.filter({ goal_type: "race" }),
    ]).then(([aths, gs]) => {
      setAthletes(aths);
      setGoals(gs);
    }).finally(() => setLoading(false));
  }, []);

  // Build ranking rows enriched with goal info
  const rows = athletes.map((a) => {
    const goal = goals.find((g) => g.athlete_id === a.id);
    return {
      ...a,
      distance: goal?.distance || null,
      target_pace: goal?.target_pace || null,
      race_name: goal?.race_name || null,
    };
  });

  // Distances available for filter
  const distances = ["all", ...Array.from(new Set(rows.map((r) => r.distance).filter(Boolean)))];

  const filtered = (filterDist === "all" ? rows : rows.filter((r) => r.distance === filterDist))
    .sort((a, b) => (b.monthly_distance_km || 0) - (a.monthly_distance_km || 0));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Ranking de Corredores</h2>
        <p className="text-sm text-slate-500 mt-0.5">Clasificación mensual por kilómetros acumulados.</p>
      </div>

      {/* Filter by distance */}
      {distances.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {distances.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDist(d)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                filterDist === d
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {d === "all" ? "Todos" : d}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Cargando ranking...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No hay atletas con datos suficientes.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((a, i) => (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                i === 0
                  ? "bg-amber-50 border-amber-200 shadow-sm"
                  : i === 1
                  ? "bg-slate-50 border-slate-200"
                  : i === 2
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-slate-100"
              }`}
            >
              <span className="text-xl w-7 text-center shrink-0">
                {i < 3 ? MEDAL[i] : <span className="text-sm font-bold text-slate-400">#{i + 1}</span>}
              </span>
              <div className={`w-9 h-9 rounded-full ${a.avatar_color || "bg-slate-400"} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {a.full_name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm truncate">{a.full_name}</div>
                <div className="text-xs text-slate-400">
                  {a.distance && <span className="mr-2">{a.distance}</span>}
                  {a.target_pace && <span>Meta: {a.target_pace}/km</span>}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  {(a.monthly_distance_km || 0).toFixed(1)} km
                </div>
                <div className="text-[10px] text-slate-400">este mes</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500">
        <Trophy className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
        El TOP 3 al final del mes gana el badge <strong>Podium Striker 🥇</strong>.
      </div>
    </div>
  );
}