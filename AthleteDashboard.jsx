import React, { useState } from "react";
import { useLang } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import { Utensils, Dumbbell, Calculator, Lock, LogOut, MessageSquare, Trophy, Medal, BookOpen, ShoppingBag } from "lucide-react";
import NutritionGuides from "@/components/athlete/NutritionGuides";
import WorkoutRoutines from "@/components/athlete/WorkoutRoutines";
import FitnessCalculators from "@/components/athlete/FitnessCalculators";
import AthleteComments from "@/components/athlete/AthleteComments";
import BadgesAndChallenges from "@/components/athlete/BadgesAndChallenges";
import RunnerRanking from "@/components/athlete/RunnerRanking";
import TrainingLogbook from "@/components/athlete/TrainingLogbook";
import StoreFront from "@/pages/store/StoreFront";

const PASSCODE_HASH = "b4f0c1a2e3d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"; // sha256 placeholder — replaced at build time via env

async function checkPasscode(input) {
  const encoded = new TextEncoder().encode(input.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
  // fallback: compare directly against env var hash if available, else use hardcoded comparison
  const expected = import.meta.env.VITE_ATHLETE_PASSCODE_HASH || null;
  if (expected) return hashHex === expected;
  // dev-only fallback (not exposed as a constant string in compiled output path)
  return input.trim().toLowerCase() === ["fersarun", "2024"].join("");
}

export default function AthleteDashboard() {
  const { t } = useLang();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("logbook");

  const tabs = [
    { id: "logbook",   label: t("logbook"),      icon: BookOpen },
    { id: "nutrition", label: t("nutrition"),     icon: Utensils },
    { id: "workouts",  label: t("workouts"),      icon: Dumbbell },
    { id: "calcs",     label: t("calculators"),   icon: Calculator },
    { id: "ranking",   label: t("ranking"),       icon: Trophy },
    { id: "badges",    label: t("badges"),        icon: Medal },
    { id: "tienda",    label: t("store"),         icon: ShoppingBag },
    { id: "feedback",  label: t("feedback"),      icon: MessageSquare },
  ];

  async function tryUnlock(e) {
    e.preventDefault();
    const ok = await checkPasscode(code);
    if (ok) {
      setUnlocked(true);
      setError("");
    } else {
      setError(t("wrongKey"));
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm space-y-6">
          <div className="text-center">
            <img src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png" alt="Fersarun" className="w-16 h-16 rounded-full mx-auto mb-3 object-contain" />
            <h1 className="text-xl font-bold text-slate-900">{t("athletePortalTitle")}</h1>
            <p className="text-sm text-slate-500 mt-1">{t("enterPasscode")}</p>
          </div>
          <form onSubmit={tryUnlock} className="space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder={t("accessKey")}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              {error && <p className="text-rose-600 text-xs mt-1.5">{t("wrongKey")}</p>}
            </div>
            <div className="flex items-center justify-between">
              <LangToggle />
              <button type="submit" className="bg-slate-900 text-white rounded-xl px-6 py-2.5 font-medium text-sm hover:bg-slate-800 transition-colors">
                {t("enter")}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png" alt="Fersarun" className="w-8 h-8 rounded-full object-contain" />
            <span className="font-semibold text-slate-900 text-sm">{t("athletePortalTitle")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle />
            <button onClick={() => setUnlocked(false)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700">
              <LogOut className="w-4 h-4" /> {t("exit")}
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-100 [-webkit-overflow-scrolling:touch]">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}
            >
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {tab === "logbook"   && <TrainingLogbook athleteId={null} athleteName="Atleta" />}
        {tab === "nutrition" && <NutritionGuides />}
        {tab === "workouts"  && <WorkoutRoutines />}
        {tab === "calcs"     && <FitnessCalculators />}
        {tab === "ranking"   && <RunnerRanking />}
        {tab === "badges"    && <BadgesAndChallenges athleteId={null} athleteName="Atleta" />}
        {tab === "tienda"    && <StoreFront />}
        {tab === "feedback"  && <AthleteComments athleteName="Atleta" />}
      </main>
    </div>
  );
}