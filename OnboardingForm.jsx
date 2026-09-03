import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

const SECTIONS = ["Datos personales", "Perfil deportivo", "Objetivos", "Conectividad"];

const inp = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 h-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500";
const sel = "w-full bg-slate-800 border border-slate-700 rounded-xl px-3 h-10 text-sm text-white focus:outline-none focus:border-slate-500";

function OptionBtn({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-xl text-sm border transition-colors text-left ${selected ? "bg-emerald-500 border-emerald-500 text-white font-medium" : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500"}`}
    >
      {children}
    </button>
  );
}

function Label({ children }) {
  return <div className="text-xs font-medium text-slate-400 mb-2">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function OnboardingForm({ onDone }) {
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);

  // Section 1
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [cycleTracking, setCycleTracking] = useState(false);
  const [lastPeriod, setLastPeriod] = useState("");

  // Section 2
  const [level, setLevel] = useState("");
  const [weeklyKm, setWeeklyKm] = useState("");
  const [prDistance, setPrDistance] = useState("");
  const [prTime, setPrTime] = useState("");
  const [trainDays, setTrainDays] = useState("");

  // Section 3
  const [mainGoal, setMainGoal] = useState("");
  const [raceName, setRaceName] = useState("");
  const [raceDate, setRaceDate] = useState("");

  // Section 4
  const [device, setDevice] = useState("");
  const [shoeModel, setShoeModel] = useState("");
  const [injury, setInjury] = useState("");

  async function finish() {
    setSaving(true);
    try {
      const user = await base44.auth.me();
      // Save athlete profile
      const existing = await base44.entities.Athlete.filter({ email: user.email });
      const athleteData = {
        full_name: user.full_name || user.email,
        email: user.email,
        birth_date: birthDate || undefined,
        gender: gender || undefined,
        weight_kg: weightKg ? Number(weightKg) : undefined,
        height_cm: heightCm ? Number(heightCm) : undefined,
        cycle_tracking_enabled: cycleTracking,
        level: level || "basic",
        status: "active",
      };
      if (existing.length === 0) {
        await base44.entities.Athlete.create(athleteData);
      }
      // Save goal if provided
      if (mainGoal || raceName) {
        const athleteRecord = existing.length > 0 ? existing[0] : (await base44.entities.Athlete.filter({ email: user.email }))[0];
        if (athleteRecord) {
          await base44.entities.AthleteGoal.create({
            athlete_id: athleteRecord.id,
            athlete_name: athleteRecord.full_name,
            goal_type: "race",
            race_name: raceName || mainGoal || "",
            race_date: raceDate || undefined,
          });
        }
      }
    } catch (e) {
      // non-blocking — profile can be filled later
    } finally {
      setSaving(false);
      onDone();
    }
  }

  const progress = ((section + 1) / SECTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <img
            src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png"
            alt="Fersarun"
            className="w-14 h-14 rounded-2xl mx-auto object-contain bg-white/5 p-1.5 mb-3"
          />
          <p className="text-slate-400 text-sm">Completa tu perfil de atleta</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Sección {section + 1} de {SECTIONS.length}</span>
            <span className="text-emerald-400 font-medium">{SECTIONS[section]}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">

          {/* SECTION 1 */}
          {section === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Datos basales y antropométricos</h2>
                <p className="text-slate-400 text-xs mt-1">Ayuda a calcular tus zonas de esfuerzo y requerimientos de nutrición.</p>
              </div>
              <Field label="Fecha de nacimiento">
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inp} />
              </Field>
              <Field label="Sexo biológico">
                <div className="flex gap-2">
                  <OptionBtn selected={gender === "female"} onClick={() => setGender("female")}>♀ Femenino</OptionBtn>
                  <OptionBtn selected={gender === "male"} onClick={() => setGender("male")}>♂ Masculino</OptionBtn>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Peso corporal (kg)">
                  <input type="number" placeholder="e.g. 65" value={weightKg} onChange={e => setWeightKg(e.target.value)} className={inp} />
                </Field>
                <Field label="Estatura (cm)">
                  <input type="number" placeholder="e.g. 170" value={heightCm} onChange={e => setHeightCm(e.target.value)} className={inp} />
                </Field>
              </div>
              {gender === "female" && (
                <div className="space-y-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setCycleTracking(!cycleTracking)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${cycleTracking ? "bg-emerald-500" : "bg-slate-700"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${cycleTracking ? "translate-x-5" : "translate-x-0.5"}`} />
                    </div>
                    <span className="text-sm text-slate-300">Seguimiento del ciclo menstrual <span className="text-slate-500">(opcional)</span></span>
                  </label>
                  {cycleTracking && (
                    <Field label="Fecha del último período">
                      <input type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} className={inp} />
                    </Field>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2 */}
          {section === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Perfil deportivo y experiencia</h2>
                <p className="text-slate-400 text-xs mt-1">Diseñamos la carga de entrenamiento adecuada para ti.</p>
              </div>
              <Field label="Nivel de experiencia">
                <div className="grid grid-cols-3 gap-2">
                  <OptionBtn selected={level === "basic"} onClick={() => setLevel("basic")}>🟢 Principiante</OptionBtn>
                  <OptionBtn selected={level === "intermediate"} onClick={() => setLevel("intermediate")}>🟡 Intermedio</OptionBtn>
                  <OptionBtn selected={level === "advanced"} onClick={() => setLevel("advanced")}>🔴 Avanzado</OptionBtn>
                </div>
              </Field>
              <Field label="Volumen semanal actual">
                <div className="grid grid-cols-2 gap-2">
                  {["0–15 km/sem", "15–30 km/sem", "30–50 km/sem", "Más de 50 km/sem"].map(v => (
                    <OptionBtn key={v} selected={weeklyKm === v} onClick={() => setWeeklyKm(v)}>{v}</OptionBtn>
                  ))}
                </div>
              </Field>
              <div className="space-y-1.5">
                <Label>Mejor marca (PR) — opcional</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select value={prDistance} onChange={e => setPrDistance(e.target.value)} className={sel}>
                      <option value="">Distancia</option>
                      <option value="5K">5K</option>
                      <option value="10K">10K</option>
                      <option value="21K">21K</option>
                      <option value="42K">42K</option>
                    </select>
                  </div>
                  <input
                    type="text" placeholder="HH:MM:SS" value={prTime}
                    onChange={e => setPrTime(e.target.value)}
                    className={inp}
                  />
                </div>
              </div>
              <Field label="Días disponibles para entrenar por semana">
                <div className="flex gap-2">
                  {["2–3 días", "4–5 días", "6+ días"].map(d => (
                    <OptionBtn key={d} selected={trainDays === d} onClick={() => setTrainDays(d)}>{d}</OptionBtn>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* SECTION 3 */}
          {section === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Objetivos y metas</h2>
                <p className="text-slate-400 text-xs mt-1">¿Qué quieres lograr con nosotros?</p>
              </div>
              <Field label="Objetivo principal">
                <div className="space-y-2">
                  {[
                    "Empezar a correr / Salir del sedentarismo",
                    "Completar mis primeros 10K / 21K / 42K",
                    "Mejorar mi marca personal (PR)",
                    "Salud general y condición física",
                  ].map(g => (
                    <OptionBtn key={g} selected={mainGoal === g} onClick={() => setMainGoal(g)}>{g}</OptionBtn>
                  ))}
                </div>
              </Field>
              <div className="space-y-1.5">
                <Label>Próxima carrera objetivo — opcional</Label>
                <input
                  type="text" placeholder="Nombre del evento"
                  value={raceName} onChange={e => setRaceName(e.target.value)}
                  className={`${inp} mb-2`}
                />
                <input
                  type="date" value={raceDate} onChange={e => setRaceDate(e.target.value)}
                  className={inp}
                />
              </div>
            </div>
          )}

          {/* SECTION 4 */}
          {section === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-white font-semibold text-lg">Conectividad y salud</h2>
                <p className="text-slate-400 text-xs mt-1">Automatiza tus datos y entrena de forma segura.</p>
              </div>
              <Field label="Dispositivo / app principal">
                <div className="grid grid-cols-2 gap-2">
                  {["Strava", "Garmin", "Apple Watch", "Otro / Ninguno"].map(d => (
                    <OptionBtn key={d} selected={device === d} onClick={() => setDevice(d)}>{d}</OptionBtn>
                  ))}
                </div>
              </Field>
              <Field label="Calzado principal (opcional)">
                <input
                  type="text" placeholder="Marca y modelo"
                  value={shoeModel} onChange={e => setShoeModel(e.target.value)}
                  className={inp}
                />
              </Field>
              <Field label="¿Tienes alguna molestia o lesión reciente?">
                <div className="grid grid-cols-2 gap-2">
                  {["Ninguna", "Rodilla", "Tendón de Aquiles", "Periostitis / Tobillo", "Otra"].map(i => (
                    <OptionBtn key={i} selected={injury === i} onClick={() => setInjury(i)}>{i}</OptionBtn>
                  ))}
                </div>
              </Field>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {section > 0 && (
            <button
              onClick={() => setSection(s => s - 1)}
              className="flex items-center gap-1.5 px-4 h-11 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
          )}
          {section < SECTIONS.length - 1 ? (
            <button
              onClick={() => setSection(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Check className="w-4 h-4" /> Finalizar registro y crear plan</>}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-600">
          <button onClick={onDone} className="hover:text-slate-400 transition-colors">Omitir por ahora →</button>
        </p>
      </div>
    </div>
  );
}