import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const guides = [
  {
    emoji: "⚡",
    title: "Carbohidratos: Combustible del Rendimiento",
    summary: "Adapta la ingesta de carbos según el volumen de entrenamiento.",
    content: `Los carbohidratos son el sustrato energético principal para el ejercicio de alta intensidad.

**Guías por volumen de sesión:**
- Sesiones <60 min o baja intensidad: 3–5 g/kg/día
- Sesiones 60–90 min o intensidad moderada: 5–7 g/kg/día  
- Sesiones >90 min o alta intensidad: 6–10 g/kg/día
- Sesiones de ultra-resistencia: 8–12 g/kg/día

**Timing (SSE #231):**
- 3–4 h antes: 3–4 g/kg de carbos de bajo IG
- 30–60 min antes: 1 g/kg si hay sesión intensa
- Durante (>60 min): 30–60 g/h (hasta 90 g/h con múltiples transportadores)
- 30 min post-sesión: 1–1.2 g/kg para recargar glucógeno`,
  },
  {
    emoji: "🥩",
    title: "Proteína: Construcción y Reparación",
    summary: "Distribuye la proteína estratégicamente para maximizar la síntesis muscular.",
    content: `La proteína es esencial para la reparación muscular, la adaptación al entrenamiento y la saciedad.

**Recomendaciones generales:**
- Atletas de resistencia: 1.4–1.7 g/kg/día
- Atletas de fuerza/hipertrofia: 1.6–2.2 g/kg/día
- En déficit calórico: hasta 2.4 g/kg/día (preserva masa magra)

**Distribución óptima:**
- 4–5 comidas con 20–40 g de proteína de alta calidad
- Fuentes: pollo, pescado, huevos, lácteos, legumbres
- Post-entrenamiento: 20–40 g dentro de los primeros 30–60 min

**Fuentes de alta calidad:** Pechuga de pollo, atún, salmón, claras de huevo, Greek yogurt, whey protein.`,
  },
  {
    emoji: "🥑",
    title: "Grasas: Salud Hormonal y Energía",
    summary: "Las grasas saludables son clave para hormonas y absorción de vitaminas.",
    content: `Las grasas deben representar 20–35% de las calorías totales y priorizarse fuentes saludables.

**Tipos de grasas:**
- **Monoinsaturadas** (aceite de oliva, aguacate, almendras): antiinflamatorias, cardioprotectoras
- **Poliinsaturadas Omega-3** (salmón, chía, nueces): recuperación, cognición, antiinflamatorio
- **Grasas saturadas** (carne roja, lácteos): moderar a <10% del total calórico
- **Evitar:** grasas trans (ultraprocesados)

**Para atletas en déficit:** mantener ≥1 g/kg de grasa para soporte hormonal (especialmente testosterona).`,
  },
  {
    emoji: "💧",
    title: "Hidratación Deportiva",
    summary: "El 2% de deshidratación ya reduce el rendimiento. Hidrátate de forma inteligente.",
    content: `La deshidratación deteriora fuerza, potencia, concentración y capacidad de termorregulación.

**Guía de hidratación:**
- Pre-entrenamiento: 5–7 mL/kg 4 h antes; si orina oscura, agregar 3–5 mL/kg 2 h antes
- Durante: 150–350 mL cada 15–20 min (ajustar a tasa de sudoración)
- Post-entrenamiento: 1.5 L por cada kg de peso perdido

**Electrolitos:**
- Sodio: 500–700 mg/L en sesiones >60 min o sudoración intensa
- Potasio, Magnesio: complementar con alimentación (banano, espinaca, almendra)

**Señal simple:** Orina amarillo pálido = bien hidratado. Oscuro = bebe más.`,
  },
  {
    emoji: "🌙",
    title: "Nutrición para la Recuperación",
    summary: "Lo que comes después del ejercicio determina qué tan rápido y bien te recuperas.",
    content: `La ventana anabólica post-entrenamiento es real, aunque más amplia de lo que se creía.

**Comida post-entrenamiento ideal:**
- Carbohidratos: 1–1.2 g/kg para reponer glucógeno
- Proteína: 20–40 g (0.4 g/kg) para síntesis proteica
- Ejemplo: arroz + pollo + vegetales + bebida isotónica

**Antes de dormir (si entrenas en la tarde):**
- 30–40 g de proteína de absorción lenta (caseína, requesón, Greek yogurt)
- Reduce degradación muscular nocturna

**Micronutrientes clave:**
- Vitamina D + Calcio: salud ósea, función muscular
- Hierro (especialmente mujeres atletas): transporte de oxígeno
- Magnesio: relajación muscular y calidad del sueño`,
  },
  {
    emoji: "⚠️",
    title: "Disponibilidad Energética (EA) y Tríada de la Atleta",
    summary: "Energía insuficiente daña hormonas, huesos y rendimiento — especialmente en atletas femeninas.",
    content: `La Disponibilidad Energética (EA) = Ingesta calórica – Gasto de ejercicio / kg de masa magra.

**Umbrales:**
- EA óptima: ≥45 kcal/kg MM/día
- Zona de alerta: 30–45 kcal/kg MM/día
- Deficiencia energética relativa (RED-S): <30 kcal/kg MM/día ⚠️

**Consecuencias de EA baja:**
- Disrupciones hormonales (amenorrea en mujeres)
- Pérdida de densidad ósea
- Fatiga crónica, mayor riesgo de lesiones
- Deterioro del sistema inmune

**Solución:** No reducir calorías drásticamente. Ajustar gradualmente el déficit y monitorear ciclo menstrual, HRV y estado de ánimo como señales de alerta.`,
  },
];

export default function NutritionGuides() {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Guías de Nutrición</h2>
        <p className="text-sm text-slate-500 mt-1">Basadas en evidencia científica para optimizar tu rendimiento y recuperación.</p>
      </div>
      <div className="space-y-3">
        {guides.map((g, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 p-4 text-left">
              <span className="text-2xl">{g.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">{g.title}</div>
                <div className="text-sm text-slate-500 truncate">{g.summary}</div>
              </div>
              {open === i ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </button>
            {open === i && (
              <div className="px-4 pb-5 border-t border-slate-100">
                <div className="mt-3 space-y-2 text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {g.content.split("\n").map((line, j) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={j} className="font-semibold text-slate-900 mt-3">{line.replace(/\*\*/g, "")}</p>;
                    }
                    if (line.startsWith("- ")) {
                      return <p key={j} className="pl-3 before:content-['•'] before:mr-2 before:text-slate-400">{line.slice(2)}</p>;
                    }
                    return line ? <p key={j}>{line}</p> : <div key={j} className="h-1" />;
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}