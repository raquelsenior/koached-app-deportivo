import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, MessageSquare, Plus, X, Send, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Match logic ──────────────────────────────────────────────────────────────
// Returns pairs of athletes that share similar goals
function computeMatches(athletes, goals) {
  const goalsByAthlete = {};
  goals.forEach(g => {
    if (!goalsByAthlete[g.athlete_id]) goalsByAthlete[g.athlete_id] = [];
    goalsByAthlete[g.athlete_id].push(g);
  });

  const matches = [];
  const activeAthletes = athletes.filter(a => a.status === "active");

  for (let i = 0; i < activeAthletes.length; i++) {
    for (let j = i + 1; j < activeAthletes.length; j++) {
      const a = activeAthletes[i];
      const b = activeAthletes[j];
      const goalsA = goalsByAthlete[a.id] || [];
      const goalsB = goalsByAthlete[b.id] || [];

      // Check shared goal types
      const reasons = [];

      // Same level
      if (a.level === b.level) reasons.push(`Mismo nivel (${a.level})`);

      // Race goal match — same distance
      const racesA = goalsA.filter(g => g.goal_type === "race");
      const racesB = goalsB.filter(g => g.goal_type === "race");
      for (const ra of racesA) {
        for (const rb of racesB) {
          if (ra.distance && rb.distance && ra.distance.toLowerCase() === rb.distance.toLowerCase()) {
            reasons.push(`Ambos entrenan para ${ra.distance}`);
          } else if (ra.race_name && rb.race_name && ra.race_name === rb.race_name) {
            reasons.push(`Misma carrera: ${ra.race_name}`);
          }
          // Similar pace (within 30 sec/km)
          if (ra.target_pace && rb.target_pace) {
            const pa = parsePaceSec(ra.target_pace);
            const pb = parsePaceSec(rb.target_pace);
            if (pa && pb && Math.abs(pa - pb) <= 30) reasons.push("Ritmo objetivo similar");
          }
        }
      }

      // Both have sleep goals
      if (goalsA.some(g => g.goal_type === "sleep") && goalsB.some(g => g.goal_type === "sleep")) {
        reasons.push("Ambos trabajan en recuperación/sueño");
      }

      // Both have body composition goals
      if (goalsA.some(g => g.goal_type === "body") && goalsB.some(g => g.goal_type === "body")) {
        reasons.push("Objetivos de composición corporal similares");
      }

      if (reasons.length > 0) {
        matches.push({ athleteA: a, athleteB: b, reasons: [...new Set(reasons)] });
      }
    }
  }

  return matches;
}

function parsePaceSec(str) {
  const parts = (str || "").split(":");
  if (parts.length !== 2) return null;
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// ─── Chat Modal ───────────────────────────────────────────────────────────────
function GroupChatModal({ group, onClose, onUpdate }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const messages = group.chat_messages || [];

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    const newMsg = {
      sender_id: "coach",
      sender_name: "Entrenador",
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const updated = await base44.entities.TrainingGroup.update(group.id, {
      chat_messages: [...messages, newMsg],
    });
    setText("");
    setSending(false);
    onUpdate(updated);
  }

  function handleKey(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <div className="font-semibold text-slate-900">{group.name}</div>
            <div className="text-xs text-slate-400">{(group.member_names || []).join(", ")}</div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[200px]">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400 mt-6">El chat está vacío. ¡Inicia la conversación!</p>
          ) : messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.sender_id === "coach" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${m.sender_id === "coach" ? "bg-slate-900 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                {m.sender_id !== "coach" && <div className="text-[10px] font-semibold opacity-60 mb-0.5">{m.sender_name}</div>}
                {m.text}
                <div className="text-[10px] opacity-50 mt-0.5 text-right">
                  {new Date(m.timestamp).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
          <input
            value={text} onChange={e => setText(e.target.value)} onKeyDown={handleKey}
            placeholder="Escribe un mensaje..."
            className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button onClick={send} disabled={sending || !text.trim()} className="bg-slate-900 text-white rounded-xl p-2 disabled:opacity-40 hover:bg-slate-800">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ preselected, athletes, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIds, setSelectedIds] = useState(preselected.map(a => a.id));
  const [saving, setSaving] = useState(false);

  function toggleAthlete(id) {
    setSelectedIds(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  }

  async function submit(e) {
    e.preventDefault();
    if (selectedIds.length < 2) return;
    setSaving(true);
    const selectedAthletes = athletes.filter(a => selectedIds.includes(a.id));
    await base44.entities.TrainingGroup.create({
      name,
      description,
      member_ids: selectedIds,
      member_names: selectedAthletes.map(a => a.full_name),
      goal_type: "general",
      chat_messages: [],
    });
    setSaving(false);
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Crear grupo de entrenamiento</h2>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">Nombre del grupo</span>
          <input required value={name} onChange={e => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="ej. Equipo Media Maratón" />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-600">Descripción (opcional)</span>
          <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Objetivo del grupo..." />
        </label>
        <div className="space-y-1">
          <span className="text-xs font-medium text-slate-600">Miembros ({selectedIds.length} seleccionados)</span>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {athletes.map(a => (
              <label key={a.id} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${selectedIds.includes(a.id) ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white"}`}>
                <input type="checkbox" checked={selectedIds.includes(a.id)} onChange={() => toggleAthlete(a.id)} className="accent-slate-900" />
                <div className={`w-7 h-7 rounded-full ${a.avatar_color || "bg-slate-400"} flex items-center justify-center text-white text-xs font-bold`}>{a.full_name.charAt(0)}</div>
                <span className="text-sm text-slate-800">{a.full_name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving || selectedIds.length < 2}>{saving ? "Creando..." : "Crear grupo"}</Button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TrainingGroups({ athletes }) {
  const [goals, setGoals] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [showCreate, setShowCreate] = useState(null); // preselected athletes
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [gs, grps] = await Promise.all([
        base44.entities.AthleteGoal.list("-created_date", 300),
        base44.entities.TrainingGroup.list("-created_date", 50),
      ]);
      setGoals(gs);
      setGroups(grps);
    } finally { setLoading(false); }
  }

  const matches = computeMatches(athletes, goals);

  function updateGroup(updated) {
    setGroups(g => g.map(x => x.id === updated.id ? updated : x));
    if (activeChat?.id === updated.id) setActiveChat(updated);
  }

  return (
    <div className="space-y-4">
      {/* Matches */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-slate-900">Sugerencias de Match</div>
            <div className="text-xs text-slate-400">{loading ? "Calculando..." : `${matches.length} compatibilidades encontradas`}</div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded && (
          <div className="border-t border-slate-100 px-4 pb-4 space-y-3 pt-3">
            {matches.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Registra objetivos para los atletas en la pestaña "Objetivos" y aquí aparecerán las compatibilidades automáticamente.
              </p>
            ) : matches.map((m, i) => (
              <div key={i} className="rounded-xl border border-amber-100 bg-amber-50 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full ${m.athleteA.avatar_color || "bg-slate-400"} flex items-center justify-center text-white text-xs font-bold`}>{m.athleteA.full_name.charAt(0)}</div>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <div className={`w-8 h-8 rounded-full ${m.athleteB.avatar_color || "bg-slate-400"} flex items-center justify-center text-white text-xs font-bold`}>{m.athleteB.full_name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{m.athleteA.full_name} + {m.athleteB.full_name}</div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {m.reasons.slice(0, 2).map((r, j) => (
                        <span key={j} className="text-[10px] bg-amber-200 text-amber-800 rounded-full px-2 py-0.5">{r}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCreate([m.athleteA, m.athleteB])}
                    className="shrink-0 text-xs font-medium bg-slate-900 text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800"
                  >
                    Crear grupo
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Groups */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Grupos activos</h3>
          <button onClick={() => setShowCreate([])} className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Nuevo grupo
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 text-center py-4">Cargando...</p>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Sin grupos creados todavía. Usa una sugerencia de match o crea uno manualmente.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map(g => (
              <div key={g.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{g.name}</div>
                  <div className="text-xs text-slate-400">{(g.member_names || []).join(", ")}</div>
                  {g.description && <div className="text-xs text-slate-500 mt-0.5 truncate">{g.description}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400">{(g.chat_messages || []).length} msj</span>
                  <button
                    onClick={() => setActiveChat(g)}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeChat && (
        <GroupChatModal group={activeChat} onClose={() => setActiveChat(null)} onUpdate={updateGroup} />
      )}
      {showCreate !== null && (
        <CreateGroupModal
          preselected={showCreate}
          athletes={athletes}
          onClose={() => setShowCreate(null)}
          onCreated={() => { setShowCreate(null); load(); }}
        />
      )}
    </div>
  );
}