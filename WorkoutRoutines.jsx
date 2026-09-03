import React, { useState } from "react";
import { Play, Download, ChevronDown, ChevronUp, Clock, Zap, Target } from "lucide-react";

const routines = [
  {
    id: 1,
    title: "Rodaje de Base Aeróbica",
    type: "🏃 Cardio",
    level: "Básico",
    duration: "45–60 min",
    intensity: "Zona 2 (60–70% FC máx)",
    description: "Construye tu base aeróbica a ritmo conversacional. Puedes hablar en oraciones completas.",
    videoUrl: null,
    exercises: [
      { name: "Calentamiento caminata", sets: "1", reps: "5 min", notes: "Ritmo muy suave" },
      { name: "Trote suave zona 2", sets: "1", reps: "35–45 min", notes: "Frecuencia cardíaca 60–70% del máx" },
      { name: "Vuelta a la calma", sets: "1", reps: "5 min", notes: "Caminata + respiración profunda" },
    ],
    tips: "Este es el entrenamiento más importante de la semana. No lo hagas más rápido — la zona 2 real construye mitocondrias.",
  },
  {
    id: 2,
    title: "Intervalos de Alta Intensidad (HIIT)",
    type: "⚡ Intervalos",
    level: "Intermedio",
    duration: "35–45 min",
    intensity: "Zona 4–5 (85–95% FC máx)",
    description: "Sesión de intervalos 4x4 para mejorar VO2 máx y potencia aeróbica.",
    videoUrl: null,
    exercises: [
      { name: "Calentamiento activación", sets: "1", reps: "10 min", notes: "Incluye drills de carrera" },
      { name: "Intervalos 4 min al 90% FC máx", sets: "4", reps: "4 min", notes: "Recuperación activa 3 min entre series" },
      { name: "Enfriamiento suave", sets: "1", reps: "10 min", notes: "Trote muy lento + estiramientos" },
    ],
    tips: "RPE objetivo: 8–9/10 en los intervalos. Si puedes hablar con facilidad, no estás yendo suficientemente fuerte.",
  },
  {
    id: 3,
    title: "Tirada Larga de Resistencia",
    type: "🏞️ Larga distancia",
    level: "Intermedio",
    duration: "90–120 min",
    intensity: "Zona 2–3 (65–75% FC máx)",
    description: "La tirada larga semanal: desarrolla resistencia aeróbica y eficiencia de combustible.",
    videoUrl: null,
    exercises: [
      { name: "Calentamiento dinámico", sets: "1", reps: "10 min", notes: "Incluye movilidad de cadera" },
      { name: "Trote continuo", sets: "1", reps: "70–100 min", notes: "Ritmo cómodo sostenible" },
      { name: "Avituallamiento", sets: "Cada 45 min", reps: "Gel o banana", notes: "30–60 g de carbos/hora" },
      { name: "Enfriamiento", sets: "1", reps: "10 min", notes: "Caminata + foam roller" },
    ],
    tips: "Recarga carbohidratos cada 45 min. Lleva siempre agua e hidratación con electrolitos para sesiones >90 min.",
  },
  {
    id: 4,
    title: "Fuerza para Corredores",
    type: "💪 Fuerza",
    level: "Intermedio",
    duration: "50–60 min",
    intensity: "Moderada–Alta",
    description: "Fuerza funcional para mejorar economía de carrera y prevenir lesiones.",
    videoUrl: null,
    exercises: [
      { name: "Sentadilla búlgara", sets: "3", reps: "10 c/pierna", notes: "3 RIR — controla la bajada" },
      { name: "Peso muerto rumano", sets: "3", reps: "8–10", notes: "Enfocarse en cadena posterior" },
      { name: "Hip thrust", sets: "3", reps: "12", notes: "Glúteo mayor — clave para propulsión" },
      { name: "Elevaciones de talón unilateral", sets: "3", reps: "15 c/pierna", notes: "Fortalece sóleo y gastrocnemio" },
      { name: "Plancha lateral", sets: "3", reps: "30 seg c/lado", notes: "Estabilidad de cadera" },
      { name: "Step-up con mancuerna", sets: "3", reps: "10 c/pierna", notes: "Simula patrón de carrera" },
    ],
    tips: "Realiza este entrenamiento el día antes de un día de descanso o sesión suave. La fuerza te hace más eficiente en carrera.",
  },
  {
    id: 5,
    title: "Recuperación Activa y Movilidad",
    type: "🌿 Recuperación",
    level: "Básico",
    duration: "30–40 min",
    intensity: "Muy baja",
    description: "Sesión de regeneración: activa la circulación, mejora la movilidad articular y reduce DOMS.",
    videoUrl: null,
    exercises: [
      { name: "Caminata ligera", sets: "1", reps: "10 min", notes: "Al aire libre, sin cronómetro" },
      { name: "Movilidad de cadera", sets: "2", reps: "10 c/lado", notes: "Círculos, aperturas, estocadas" },
      { name: "Estiramientos de cuádriceps", sets: "2", reps: "45 seg c/lado", notes: "Sin rebote" },
      { name: "Foam roller piernas", sets: "1", reps: "2 min c/zona", notes: "Gemelos, cuádriceps, IT band" },
      { name: "Respiración diafragmática", sets: "1", reps: "5 min", notes: "4-7-8: inhala 4, aguanta 7, exhala 8" },
    ],
    tips: "Este día es tan importante como los días de alta intensidad. El músculo crece en la recuperación, no durante el esfuerzo.",
  },
  {
    id: 6,
    title: "Entrenamiento de Umbral Lactato",
    type: "⚡ Intervalos",
    level: "Avanzado",
    duration: "60–70 min",
    intensity: "Zona 3–4 (75–85% FC máx)",
    description: "Mejora el ritmo que puedes sostener durante 1 hora. Clave para mejorar tiempos de carrera.",
    videoUrl: null,
    exercises: [
      { name: "Calentamiento progresivo", sets: "1", reps: "15 min", notes: "Comienza en zona 1, termina en zona 2" },
      { name: "Bloques de umbral", sets: "3", reps: "10 min al 80% FC máx", notes: "Recuperación 3 min al trote suave" },
      { name: "Tempo moderado", sets: "1", reps: "10 min", notes: "Zona 3 continua post-intervalos" },
      { name: "Enfriamiento", sets: "1", reps: "10 min", notes: "Trote regenerativo + estiramientos" },
    ],
    tips: "RPE objetivo en bloques: 7–8/10. Puedes hablar pocas palabras pero no oraciones completas.",
  },
];

const levelColors = {
  "Básico": "bg-emerald-100 text-emerald-700",
  "Intermedio": "bg-amber-100 text-amber-700",
  "Avanzado": "bg-rose-100 text-rose-700",
};

export default function WorkoutRoutines() {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("Todos");
  const types = ["Todos", "🏃 Cardio", "⚡ Intervalos", "💪 Fuerza", "🌿 Recuperación", "🏞️ Larga distancia"];
  const filtered = filter === "Todos" ? routines : routines.filter(r => r.type === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Rutinas de Entrenamiento</h2>
        <p className="text-sm text-slate-500 mt-1">Cada rutina incluye descripción, ejercicios y tips del entrenador.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filter === t ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex items-start gap-3 p-4 text-left">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{r.title}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${levelColors[r.level] || "bg-slate-100 text-slate-600"}`}>{r.level}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  <span>{r.type}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{r.intensity}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{r.description}</p>
              </div>
              {open === r.id ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
            </button>

            {open === r.id && (
              <div className="border-t border-slate-100 px-4 pb-5 space-y-4">
                {/* Video section */}
                <div className="mt-4">
                  {r.videoUrl ? (
                    <div className="space-y-2">
                      <video src={r.videoUrl} controls className="w-full rounded-xl max-h-64 bg-black" />
                      <a href={r.videoUrl} download className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                        <Download className="w-3.5 h-3.5" /> Descargar video
                      </a>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                      <Play className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Video de rutina próximamente</p>
                      <p className="text-xs text-slate-400 mt-0.5">El entrenador cargará el video de demostración</p>
                    </div>
                  )}
                </div>

                {/* Exercises table */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    <Target className="w-3.5 h-3.5" /> Ejercicios
                  </div>
                  <div className="space-y-2">
                    {r.exercises.map((ex, i) => (
                      <div key={i} className="rounded-xl bg-slate-50 px-3 py-2.5 grid grid-cols-3 gap-2 text-sm">
                        <div className="col-span-3 font-medium text-slate-900">{ex.name}</div>
                        <div className="text-xs text-slate-500">Series: <span className="font-medium text-slate-700">{ex.sets}</span></div>
                        <div className="text-xs text-slate-500">Reps/Tiempo: <span className="font-medium text-slate-700">{ex.reps}</span></div>
                        <div className="text-xs text-slate-400 col-span-3 italic">{ex.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                  <div className="text-xs font-semibold text-amber-700 mb-1">💡 Tip del entrenador</div>
                  <p className="text-sm text-amber-800">{r.tips}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}