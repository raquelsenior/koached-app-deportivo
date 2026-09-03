import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Package, ClipboardList, Plus, CheckCircle2, X, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUS_LABELS = { active: "Activo", sold: "Vendido", pending_review: "En revisión", inactive: "Inactivo" };
const STATUS_COLORS = {
  active: "bg-emerald-100 text-emerald-700",
  sold: "bg-slate-100 text-slate-500",
  pending_review: "bg-amber-100 text-amber-700",
  inactive: "bg-rose-100 text-rose-700",
};
const ORDER_STATUS = { pending: "Pendiente", confirmed: "Confirmado", shipped: "Enviado", completed: "Completado", cancelled: "Cancelado" };

export default function StoreManager() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const [prods, ords] = await Promise.all([
      base44.entities.StoreProduct.list("-created_date"),
      base44.entities.StoreOrder.list("-created_date", 50),
    ]);
    setProducts(prods);
    setOrders(ords);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    await base44.entities.StoreProduct.update(id, { status });
    load();
  }

  async function updateOrderStatus(id, status) {
    await base44.entities.StoreOrder.update(id, { status });
    load();
  }

  const pending = products.filter(p => p.status === "pending_review");
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((s, o) => s + (o.club_fee_usd || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2"><ShoppingBag className="w-6 h-6" /> Gestión de Tienda</h1>
          <p className="text-sm text-slate-500 mt-1">Administra productos, marketplace y pedidos</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-1.5"><Plus className="w-4 h-4" /> Añadir producto</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Productos activos" value={products.filter(p => p.status === "active").length} color="emerald" />
        <StatCard label="En revisión" value={pending.length} color={pending.length > 0 ? "amber" : "slate"} />
        <StatCard label="Pedidos pendientes" value={orders.filter(o => o.status === "pending").length} color="blue" />
        <StatCard label="Ingresos del club (fees)" value={`$${totalRevenue.toFixed(2)}`} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-slate-200">
        <TabBtn active={tab === "products"} onClick={() => setTab("products")} icon={<Package className="w-4 h-4" />}>Productos</TabBtn>
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={<ClipboardList className="w-4 h-4" />}>Pedidos</TabBtn>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : tab === "products" ? (
        <div className="space-y-2">
          {pending.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span><strong>{pending.length}</strong> artículos del marketplace esperan aprobación.</span>
            </div>
          )}
          {products.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-2xl shrink-0">🛍️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm">{p.title}</div>
                <div className="text-xs text-slate-400">{p.product_type === "official" ? "Oficial" : `Marketplace · ${p.seller_name}`} · ${p.price_usd?.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{STATUS_LABELS[p.status]}</span>
                <select
                  value={p.status}
                  onChange={e => updateStatus(p.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  <option value="pending_review">En revisión</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="sold">Vendido</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map(o => (
            <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{o.product_title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Comprador: {o.buyer_name} · {o.buyer_contact}</div>
                  {o.seller_name && <div className="text-xs text-slate-400">Vendedor: {o.seller_name}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900">${o.total_usd?.toFixed(2)}</div>
                  {o.club_fee_usd > 0 && <div className="text-xs text-emerald-600">Fee: ${o.club_fee_usd?.toFixed(2)}</div>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">{o.payment_method} · qty {o.quantity}</span>
                <select
                  value={o.status}
                  onChange={e => updateOrderStatus(o.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                >
                  {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-center text-slate-400 text-sm py-12">Aún no hay pedidos.</div>}
        </div>
      )}

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = { emerald: "border-emerald-200 bg-emerald-50 text-emerald-700", amber: "border-amber-200 bg-amber-50 text-amber-700", blue: "border-blue-200 bg-blue-50 text-blue-700", purple: "border-purple-200 bg-purple-50 text-purple-700", slate: "border-slate-200 bg-slate-50 text-slate-600" };
  return (
    <div className={`rounded-2xl border ${colors[color]} p-4`}>
      <div className="text-[11px] uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${active ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
      {icon}{children}
    </button>
  );
}

function AddProductModal({ onClose, onSaved }) {
  const [form, setForm] = useState({ title: "", description: "", category: "uniform", product_type: "official", price_usd: "", size: "", brand: "", image_url: "", is_digital: false, stock: 1 });
  const [saving, setSaving] = useState(false);
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set("image_url", file_url);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.entities.StoreProduct.create({ ...form, price_usd: parseFloat(form.price_usd), stock: parseInt(form.stock), status: "active", listing_fee_paid: true });
      onSaved();
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4" onClick={onClose}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Añadir producto oficial</h3>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-slate-400" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1 col-span-2">
            <span className="text-xs font-medium text-slate-500">Título *</span>
            <input required value={form.title} onChange={e => set("title", e.target.value)} className="inp" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500">Categoría</span>
            <select value={form.category} onChange={e => set("category", e.target.value)} className="inp">
              <option value="uniform">Uniforme oficial</option>
              <option value="clothing">Ropa</option>
              <option value="footwear">Calzado</option>
              <option value="accessories">Accesorios</option>
              <option value="nutrition_guide">Guía nutrición</option>
              <option value="training_guide">Guía entrenamiento</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500">Precio (USD) *</span>
            <input required type="number" step="0.01" min="0" value={form.price_usd} onChange={e => set("price_usd", e.target.value)} className="inp" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500">Talla</span>
            <input value={form.size} onChange={e => set("size", e.target.value)} className="inp" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-slate-500">Stock</span>
            <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} className="inp" />
          </label>
        </div>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Descripción</span>
          <textarea rows={2} value={form.description} onChange={e => set("description", e.target.value)} className="inp resize-none" />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_digital} onChange={e => set("is_digital", e.target.checked)} />
          Producto digital (guía, PDF, acceso)
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-slate-500">Imagen del producto</span>
          {form.image_url ? (
            <div className="relative"><img src={form.image_url} alt="preview" className="w-full h-28 object-cover rounded-xl" /><button type="button" onClick={() => set("image_url", "")} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"><X className="w-3.5 h-3.5" /></button></div>
          ) : (
            <label className="flex flex-col items-center gap-1 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-slate-400">
              <span className="text-xs text-slate-400">Subir imagen</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-medium">Cancelar</button>
          <button type="submit" disabled={saving} className="flex-1 bg-slate-900 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-50">{saving ? "Guardando..." : "Guardar"}</button>
        </div>
        <style>{`.inp{width:100%;border:1px solid #e2e8f0;border-radius:0.75rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:white}`}</style>
      </form>
    </div>
  );
}