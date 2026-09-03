import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lock, Trophy, Star } from "lucide-react";

const ALL_BADGES = [
  // Monetización
  {
    id: "beast_mode", emoji: "🏋️", name: "Beast Mode", category: "Compras",
    desc: "Compra e incorpora la Rutina de Gimnasio A a tu plan.",
    reward: "Descuento del 10% en tu próxima compra.",
    purchaseRequired: true,
  },
  {
    id: "fuel_master", emoji: "🥗", name: "Fuel Master", category: "Compras",
    desc: "Adquiere la guía de nutrición personalizada periodizada.",
    reward: "Ícono 'Atleta Nutrito' + recetas exclusivas pre-fondo.",
    purchaseRequired: true,
  },
  {
    id: "vip_runner", emoji: "👑", name: "VIP Runner / Leyenda", category: "Compras",
    desc: "Mantén activa tu membresía por 3 o 6 meses consecutivos.",
    reward: "Marco dorado en los rankings del club.",
    purchaseRequired: true,
  },
  {
    id: "bio_hacker", emoji: "🧬", name: "Bio-Hacker", category: "Compras",
    desc: "Compra un módulo premium (HRV, ciclo menstrual, recuperación avanzada).",
    reward: "Reportes semanales PDF descargables.",
    purchaseRequired: true,
  },
  {
    id: "test_driver", emoji: "👟", name: "Test-Driver", category: "Compras",
    desc: "Compra una sesión 1-on-1 con Lucirio desde la app.",
    reward: "Estatus 'Atleta Asesorado' en tu perfil.",
    purchaseRequired: true,
  },
  // Consistencia
  {
    id: "imparable", emoji: "🔥", name: "Inmortal / Imparable", category: "Consistencia",
    desc: "Racha de 14, 30 u 80 días completando el entrenamiento asignado.",
    reward: "Estatus de racha visible en el ranking.",
  },
  {
    id: "semaforo_verde", emoji: "🟢", name: "Semáforo Verde", category: "Consistencia",
    desc: "5 entrenamientos consecutivos en rango óptimo de RPE.",
    reward: "Premia la disciplina de intensidad correcta.",
  },
  {
    id: "madrugador", emoji: "☀️", name: "Pájaro Madrugador", category: "Consistencia",
    desc: "Registra 5 entrenamientos completados antes de las 7:00 AM en un mes.",
    reward: "Orgullo del corredor madrugador.",
  },
  {
    id: "data_freak", emoji: "📊", name: "Data Freak", category: "Consistencia",
    desc: "Check-in diario de bienestar durante 21 días seguidos.",
    reward: "Desbloquea reportes de tendencias personales.",
  },
  // Rendimiento
  {
    id: "salon_fama", emoji: "💯", name: "Club Salón de la Fama", category: "Rendimiento",
    desc: "Acumula 100 km, 250 km o 500 km dentro de la app.",
    reward: "Progreso por niveles: Bronce, Plata, Oro, Platino.",
  },
  {
    id: "rompe_marca", emoji: "⚡️", name: "Rompe-Marca", category: "Rendimiento",
    desc: "Registra un nuevo PR en 5K, 10K o 21K sincronizado con Strava.",
    reward: "Notificación PUSH a todo el club celebrando tu récord.",
  },
  {
    id: "altimetria", emoji: "⛰️", name: "Cazador de Altimetría", category: "Rendimiento",
    desc: "Acumula +1,000 m de desnivel positivo en un mes.",
    reward: "Ideal para trail runners y lomas.",
  },
  // Comunidad
  {
    id: "embajador", emoji: "📣", name: "Embajador del Club", category: "Comunidad",
    desc: "Invita a 2 amigos que completen su primer mes de membresía.",
    reward: "1 mes gratis o acceso a una rutina pagada.",
  },
  {
    id: "podium", emoji: "🥇", name: "Podium Striker", category: "Comunidad",
    desc: "Termina el mes en el TOP 3 del ranking de km acumulados.",
    reward: "Trofeo virtual en tu avatar durante todo el mes siguiente.",
  },
];

const CATEGORIES = ["Todos", "Consistencia", "Rendimiento", "Comunidad", "Compras"];

const catColors = {
  Compras:     "bg-amber-100 text-amber-700",
  Consistencia:"bg-orange-100 text-orange-700",
  Rendimiento: "bg-blue-100 text-blue-700",
  Comunidad:   "bg-emerald-100 text-emerald-700",
};

export default function BadgesAndChallenges({ athleteId, athleteName }) {
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [selectedCat, setSelectedCat] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!athleteId) { setLoading(false); return; }
    base44.entities.AthleteBadge.filter({ athlete_id: athleteId })
      .then((rows) => setUnlockedIds(rows.map((r) => r.badge_id)))
      .finally(() => setLoading(false));
  }, [athleteId]);

  const filtered = selectedCat === "Todos"
    ? ALL_BADGES
    : ALL_BADGES.filter((b) => b.category === selectedCat);

  const unlocked = unlockedIds.length;
  const total = ALL_BADGES.length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Insignias & Desafíos</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Completa retos para desbloquear badges exclusivos del club.
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
        <Trophy className="w-8 h-8 text-amber-500 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-slate-700">Progreso total</span>
            <span className="text-sm font-bold text-slate-900">{unlocked}/{total}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${(unlocked / total) * 100}%` }}
            />
          </div>
          {unlocked >= 10 && (
            <p className="text-xs text-amber-600 mt-1.5 font-medium">
              🎉 ¡10+ badges desbloqueados! Reclama tu beneficio con el coach.
            </p>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              selectedCat === c
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      {loading ? (
        <p className="text-sm text-slate-400 text-center py-8">Cargando insignias...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((badge) => {
            const isUnlocked = unlockedIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl border p-4 flex gap-3 transition-all ${
                  isUnlocked
                    ? "bg-white border-amber-200 shadow-sm"
                    : "bg-slate-50 border-slate-200 opacity-70"
                }`}
              >
                <div className={`text-3xl shrink-0 ${!isUnlocked ? "grayscale" : ""}`}>
                  {isUnlocked ? badge.emoji : "🔒"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold text-sm ${isUnlocked ? "text-slate-900" : "text-slate-500"}`}>
                      {badge.name}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${catColors[badge.category] || "bg-slate-100 text-slate-600"}`}>
                      {badge.category}
                    </span>
                    {isUnlocked && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
                  <p className={`text-xs mt-1 font-medium ${isUnlocked ? "text-emerald-600" : "text-slate-400"}`}>
                    🎁 {badge.reward}
                  </p>
                  {!isUnlocked && badge.purchaseRequired && (
                    <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Requiere compra — contacta al coach
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}