export const SESSION_TYPES = {
  easy_run: { label: "Rodaje suave", color: "emerald", emoji: "🏃" },
  intervals: { label: "Intervalos", color: "orange", emoji: "⚡" },
  long_run: { label: "Tirada larga", color: "blue", emoji: "🏞️" },
  strength: { label: "Fuerza", color: "purple", emoji: "💪" },
  rest: { label: "Descanso", color: "slate", emoji: "😴" },
  recovery: { label: "Recuperación", color: "teal", emoji: "🌿" },
};

export const LEVELS = {
  basic: { label: "Básico", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  intermediate: { label: "Intermedio", dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  advanced: { label: "Avanzado", dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" },
};

export const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function computeTrafficLight(checkIn) {
  if (!checkIn) return null;
  const { session_completed, rpe, pain_reported, sleep_hours, muscle_soreness, mood } = checkIn;
  if (session_completed === "rest_day") return "green";
  if (session_completed === "missed") return "red";
  if (pain_reported) return "red";
  if (rpe >= 9) return "red";
  if (sleep_hours != null && sleep_hours < 4) return "red";
  if (session_completed === "partial") return "yellow";
  if (rpe >= 7) return "yellow";
  if (muscle_soreness >= 4) return "yellow";
  if (mood != null && mood <= 2) return "yellow";
  if (sleep_hours != null && sleep_hours < 6) return "yellow";
  return "green";
}

export function trafficLightConfig(light) {
  const map = {
    green: { label: "Verde", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", description: "Sesión completada, métricas normales" },
    yellow: { label: "Amarillo", dot: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", description: "Atención: fatiga o RPE elevado" },
    red: { label: "Rojo", dot: "bg-rose-500", bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", description: "Requiere acción inmediata" },
  };
  return map[light] || { label: "Sin datos", dot: "bg-slate-300", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", description: "Sin check-in hoy" };
}

export function nutritionRecommendation(durationMin, weightKg) {
  const w = weightKg || 65;
  if (!durationMin || durationMin < 90) {
    return {
      before: `1–2 g/kg de carbohidratos (${Math.round(w * 1)}–${Math.round(w * 2)} g) 2–3 h antes`,
      during: "Agua y electrolitos; no se requieren carbohidratos",
      after: `1–1.2 g/kg de carbohidratos + 20 g de proteína en 30 min (~${Math.round(w * 1)} g CH)`,
      summary: "Sesión corta (<90 min): reservas normales suficientes.",
    };
  }
  return {
    before: `3–4 g/kg de carbohidratos (${Math.round(w * 3)}–${Math.round(w * 4)} g) antes de la sesión`,
    during: "60–90 g/h de carbohidratos durante la sesión",
    after: `1–1.2 g/kg de carbohidratos + 20–30 g de proteína en 30 min (~${Math.round(w * 1.2)} g CH)`,
    summary: "Sesión larga (>90 min): cargar carbohidratos antes y reponer durante.",
  };
}

export function todayISO() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export function todayDayOfWeek() {
  // JS: 0=Sun..6=Sat → our array Lun..Dom (0=Lun)
  const js = new Date().getDay();
  return js === 0 ? 6 : js - 1;
}

export function draftMessage(light, athlete, checkIn) {
  const name = athlete?.full_name?.split(" ")[0] || "atleta";
  if (light === "red") {
    if (checkIn?.pain_reported) {
      return `Hola ${name}, vi que reportaste molestia (${checkIn?.pain_notes || "zona no especificada"}). Suspende la próxima sesión de impacto y vamos a evaluarlo. ¿Puedes describir dónde y desde cuándo? Si empeora, te derivo a fisio.`;
    }
    if (checkIn?.session_completed === "missed") {
      return `Hola ${name}, noté que no pudiste completar la sesión de hoy. ¿Todo bien? Cuéntame qué pasó para ajustar el plan de esta semana.`;
    }
    return `Hola ${name}, tu check-in de hoy marcó señales de alerta (RPE ${checkIn?.rpe || "?"}, sueño ${checkIn?.sleep_hours || "?"}h). Vamos a bajar la intensidad hoy y reevaluar mañana. ¿Cómo te sientes?`;
  }
  if (light === "yellow") {
    return `Hola ${name}, veo fatiga acumulada en tu check-in (RPE ${checkIn?.rpe || "?"}, dolor muscular ${checkIn?.muscle_soreness || "?"}/5). Mañana haremos una sesión suave de recuperación. ¿Dormiste bien?`;
  }
  return `Hola ${name}, buen trabajo hoy 🟢. Sigue así y mantén la hidratación.`;
}

export const PAYMENT_METHODS = {
  zelle: { label: "Zelle", emoji: "💛" },
  zinli: { label: "Zinli", emoji: "🟢" },
  binance: { label: "Binance (USDT)", emoji: "🟡" },
  pago_movil: { label: "Pago Móvil", emoji: "📱" },
  card: { label: "Tarjeta", emoji: "💳" },
  transfer: { label: "Transferencia", emoji: "🏦" },
  cash: { label: "Efectivo", emoji: "💵" },
};