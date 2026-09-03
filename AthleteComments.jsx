import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, CheckCircle2 } from "lucide-react";

const PRIORITIES = [
  { value: "low",    label: "Poco importante",  color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "medium", label: "Importante",        color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "high",   label: "Muy importante",    color: "bg-rose-50 text-rose-700 border-rose-200" },
  { value: "urgent", label: "¡Urgente!",          color: "bg-rose-600 text-white border-rose-600" },
];

export default function AthleteComments({ athleteName }) {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await base44.entities.AthleteComment.create({
        athlete_name: athleteName || "Atleta",
        message: message.trim(),
        priority,
      });
      setMessage("");
      setPriority("medium");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Comentarios al entrenador</h2>
        <p className="text-sm text-slate-500 mt-0.5">Envía sugerencias, dudas o feedback directamente a Lucirio.</p>
      </div>

      {sent && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Mensaje enviado correctamente. ¡Gracias por tu feedback!
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-600 block mb-2">Prioridad del mensaje</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`text-sm px-3 py-2 rounded-xl border font-medium transition-all ${
                  priority === p.value
                    ? p.color + " ring-2 ring-offset-1 ring-slate-400"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 block mb-1.5">Tu mensaje</label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Escribe aquí tu sugerencia, duda o comentario..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {sending ? "Enviando..." : "Enviar al entrenador"}
        </button>
      </form>
    </div>
  );
}