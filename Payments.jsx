import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { PAYMENT_METHODS, todayISO } from "@/lib/training";
import { Plus, RefreshCw, X, Check, AlertCircle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dues");
  const [showPay, setShowPay] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    setLoading(true);
    try {
      const [pays, aths, infos] = await Promise.all([
        base44.entities.Payment.list("-due_date"),
        base44.entities.Athlete.list(),
        base44.entities.PaymentInfo.list("-valid_date", 1),
      ]);
      setPayments(pays);
      setAthletes(aths);
      setInfo(infos[0] || null);
    } finally { setLoading(false); }
  }

  const pending = payments.filter((p) => p.status !== "paid");
  const overdue = pending.filter((p) => p.due_date < todayISO());

  async function markPaid(p) {
    await base44.entities.Payment.update(p.id, { status: "paid", paid_date: todayISO() });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pagos</h1>
          <p className="text-sm text-slate-500 mt-1">{pending.length} pendientes · {overdue.length} vencidos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInfo(true)} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"><CreditCard className="w-4 h-4" /> Info de pago</button>
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-700"><RefreshCw className="w-5 h-5" /></button>
          <Button onClick={() => setShowPay(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Cobro</Button>
        </div>
      </div>

      {/* Current payment info banner */}
      {info && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm">
              <span className="font-semibold text-slate-900">Info de pago vigente</span>
              <span className="text-slate-400 ml-2">· actualizada {info.valid_date}</span>
            </div>
            <button onClick={() => setShowInfo(true)} className="text-xs text-slate-500 underline">Editar</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
            <InfoCell label="Tasa USD→VES" value={info.exchange_rate_usd_ves ? `Bs ${info.exchange_rate_usd_ves}` : "—"} />
            <InfoCell label="PIN tarjeta del día" value={info.daily_card_pin ? `****${info.daily_card_pin}` : "—"} />
            <InfoCell label="Métodos" value={(info.accepted_methods || []).map((m) => PAYMENT_METHODS[m]?.label || m).join(", ") || "—"} />
          </div>
        </div>
      )}

      {/* Overdue reminders */}
      {overdue.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-center gap-2 text-rose-700 font-medium text-sm"><AlertCircle className="w-4 h-4" /> Recordatorios de pago vencido</div>
          <div className="mt-2 space-y-1">
            {overdue.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm text-rose-800">
                <span>{p.athlete_name} · {p.period} · vencía {p.due_date}</span>
                <a href={waLink(athletes.find((a) => a.id === p.athlete_id)?.phone)} target="_blank" rel="noreferrer" className="underline font-medium">Recordar</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <TabBtn active={tab === "dues"} onClick={() => setTab("dues")}>Pendientes ({pending.length})</TabBtn>
        <TabBtn active={tab === "paid"} onClick={() => setTab("paid")}>Pagados</TabBtn>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : (tab === "dues" ? pending : payments.filter((p) => p.status === "paid")).length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Nada por aquí.</p>
      ) : (
        <div className="space-y-2">
          {(tab === "dues" ? pending : payments.filter((p) => p.status === "paid")).map((p) => {
            const m = PAYMENT_METHODS[p.payment_method];
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{p.athlete_name}</div>
                  <div className="text-xs text-slate-500">{p.period} · vence {p.due_date} {p.due_date < todayISO() && <span className="text-rose-600 font-medium">(vencido)</span>}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-900">${p.amount_usd} {p.currency}</div>
                  {p.currency !== "USD" && p.amount_in_currency && <div className="text-xs text-slate-400">{p.amount_in_currency.toFixed(2)} {p.currency}</div>}
                </div>
                {m && <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 hidden sm:inline">{m.emoji} {m.label}</span>}
                {p.status !== "paid" && (
                  <button onClick={() => markPaid(p)} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><Check className="w-3.5 h-3.5" /> Marcar pagado</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showPay && <PaymentForm athletes={athletes} info={info} onClose={() => setShowPay(false)} onSaved={() => { setShowPay(false); load(); }} />}
      {showInfo && <PaymentInfoForm existing={info} onClose={() => setShowInfo(false)} onSaved={() => { setShowInfo(false); load(); }} />}
    </div>
  );
}

function waLink(phone) { const p = (phone || "").replace(/\D/g, ""); return p ? `https://wa.me/${p}` : "#"; }

function TabBtn({ active, onClick, children }) {
  return <button onClick={onClick} className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400"}`}>{children}</button>;
}

function InfoCell({ label, value }) {
  return <div><div className="text-[11px] uppercase tracking-wide text-slate-400">{label}</div><div className="text-slate-700">{value}</div></div>;
}

function PaymentForm({ athletes, info, onClose, onSaved }) {
  const [form, setForm] = useState({ athlete_id: athletes[0]?.id || "", amount_usd: 30, currency: "USD", period: "Mensual", due_date: new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0], payment_method: "zelle" });
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const athlete = athletes.find((a) => a.id === form.athlete_id);
  const usdRate = info?.exchange_rate_usd_ves;
  const eurRate = info?.exchange_rate_eur_usd;

  function computeAmount() {
    if (form.currency === "VES" && usdRate) return form.amount_usd * usdRate;
    if (form.currency === "EUR" && eurRate) return form.amount_usd * eurRate;
    if (form.currency === "USDT") return form.amount_usd;
    return form.amount_usd;
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.Payment.create({
        ...form,
        athlete_name: athlete?.full_name,
        amount_in_currency: computeAmount(),
        exchange_rate: form.currency === "VES" ? usdRate : form.currency === "EUR" ? eurRate : 1,
        status: "pending",
      });
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Registrar cobro" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Atleta">
          <select value={form.athlete_id} onChange={(e) => set("athlete_id", e.target.value)} className="inp">
            {athletes.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Monto USD"><input type="number" value={form.amount_usd} onChange={(e) => set("amount_usd", Number(e.target.value))} className="inp" /></Field>
          <Field label="Moneda">
            <select value={form.currency} onChange={(e) => set("currency", e.target.value)} className="inp">
              <option value="USD">USD</option><option value="EUR">EUR</option><option value="USDT">USDT</option><option value="VES">VES (Bs)</option>
            </select>
          </Field>
        </div>
        {form.currency !== "USD" && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
            Equivale a <strong>{computeAmount().toFixed(2)} {form.currency}</strong>
            {form.currency === "VES" && usdRate && <span className="text-slate-400"> · tasa {usdRate}</span>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Periodo"><input value={form.period} onChange={(e) => set("period", e.target.value)} className="inp" /></Field>
          <Field label="Vence"><input type="date" value={form.due_date} onChange={(e) => set("due_date", e.target.value)} className="inp" /></Field>
        </div>
        <Field label="Método preferido">
          <select value={form.payment_method} onChange={(e) => set("payment_method", e.target.value)} className="inp">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>
        </Field>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "..." : "Registrar"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function PaymentInfoForm({ existing, onClose, onSaved }) {
  const [form, setForm] = useState(existing || { valid_date: todayISO(), exchange_rate_usd_ves: null, exchange_rate_eur_usd: null, accepted_methods: ["zelle", "binance", "pago_movil"], daily_card_pin: "", card_last4: "", zelle_email: "", binance_id: "", pago_movil_bank: "", pago_movil_cedula: "", pago_movil_phone: "", zinli_email: "", notes: "" });
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleMethod(m) { setForm((f) => ({ ...f, accepted_methods: (f.accepted_methods || []).includes(m) ? f.accepted_methods.filter((x) => x !== m) : [...(f.accepted_methods || []), m] })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (existing?.id) await base44.entities.PaymentInfo.update(existing.id, form);
      else await base44.entities.PaymentInfo.create(form);
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <Modal title="Información de pago vigente" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          ⚠ Esta información es visible para los atletas. El PIN de la tarjeta se renueva cada día; recuerda actualizarlo.
        </div>
        <Field label="Fecha vigente"><input type="date" value={form.valid_date} onChange={(e) => set("valid_date", e.target.value)} className="inp" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tasa USD→VES"><input type="number" step="0.01" value={form.exchange_rate_usd_ves ?? ""} onChange={(e) => set("exchange_rate_usd_ves", e.target.value ? Number(e.target.value) : null)} className="inp" /></Field>
          <Field label="Tasa EUR→USD"><input type="number" step="0.01" value={form.exchange_rate_eur_usd ?? ""} onChange={(e) => set("exchange_rate_eur_usd", e.target.value ? Number(e.target.value) : null)} className="inp" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="PIN tarjeta del día"><input value={form.daily_card_pin} onChange={(e) => set("daily_card_pin", e.target.value)} className="inp" placeholder="1234" /></Field>
          <Field label="Últimos 4 tarjeta"><input value={form.card_last4} onChange={(e) => set("card_last4", e.target.value)} className="inp" placeholder="4242" /></Field>
        </div>
        <Field label="Zelle (email)"><input value={form.zelle_email} onChange={(e) => set("zelle_email", e.target.value)} className="inp" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Binance ID"><input value={form.binance_id} onChange={(e) => set("binance_id", e.target.value)} className="inp" /></Field>
          <Field label="Zinli (email)"><input value={form.zinli_email} onChange={(e) => set("zinli_email", e.target.value)} className="inp" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Banco (Pago Móvil)"><input value={form.pago_movil_bank} onChange={(e) => set("pago_movil_bank", e.target.value)} className="inp" /></Field>
          <Field label="Cédula"><input value={form.pago_movil_cedula} onChange={(e) => set("pago_movil_cedula", e.target.value)} className="inp" /></Field>
          <Field label="Teléfono"><input value={form.pago_movil_phone} onChange={(e) => set("pago_movil_phone", e.target.value)} className="inp" /></Field>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-600">Métodos aceptados</span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => {
              const on = (form.accepted_methods || []).includes(k);
              return <button type="button" key={k} onClick={() => toggleMethod(k)} className={`text-xs px-2.5 py-1 rounded-full border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>{v.emoji} {v.label}</button>;
            })}
          </div>
        </div>
        <Field label="Notas"><textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} className="inp" rows={2} /></Field>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={saving}>{saving ? "..." : "Guardar"}</Button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        {children}
      </div>
      <style>{`.inp{width:100%;border:1px solid hsl(var(--border));border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="block space-y-1.5"><span className="text-xs font-medium text-slate-600">{label}</span>{children}</label>;
}