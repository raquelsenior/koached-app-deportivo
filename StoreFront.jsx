import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ShoppingBag, Tag, Plus, Star, Shield, BookOpen, Dumbbell, RefreshCw, Search } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import ProductDetail from "@/components/store/ProductDetail";
import SellForm from "@/components/store/SellForm";
import { useParams, useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "uniform", label: "Uniforme oficial" },
  { id: "clothing", label: "Ropa" },
  { id: "footwear", label: "Calzado" },
  { id: "accessories", label: "Accesorios" },
  { id: "nutrition_guide", label: "Guías nutrición" },
  { id: "training_guide", label: "Guías entrenamiento" },
];

const TYPES = [
  { id: "all", label: "Todos", icon: ShoppingBag },
  { id: "official", label: "Tienda oficial", icon: Shield },
  { id: "marketplace_new", label: "Nuevo", icon: Star },
  { id: "marketplace_used", label: "Usado", icon: Tag },
];

export default function StoreFront() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showSell, setShowSell] = useState(false);
  const { productId } = useParams();
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await base44.entities.StoreProduct.filter({ status: "active" }, "-created_date");
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    if (category !== "all" && p.category !== category) return false;
    if (typeFilter !== "all" && p.product_type !== typeFilter) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.brand?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const official = filtered.filter(p => p.product_type === "official");
  const marketplace = filtered.filter(p => p.product_type !== "official");

  const selected = productId ? products.find(p => p.id === productId) : null;
  if (selected) return <ProductDetail product={selected} onBack={() => navigate("/tienda")} onOrderPlaced={load} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" /> Tienda & Marketplace
          </h1>
          <p className="text-sm text-slate-500 mt-1">Uniforme oficial, guías digitales y productos de otros atletas</p>
        </div>
        <button
          onClick={() => setShowSell(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" /> Vender artículo
        </button>
      </div>

      {/* Fee notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800 flex gap-2 items-start">
        <span className="text-amber-500 mt-0.5">💡</span>
        <span>El Club cobra un <strong>3% sobre cada venta</strong> y una <strong>tarifa de publicación</strong> de $1 USD por artículo de marketplace. Las guías digitales y el uniforme oficial están exentos.</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar productos, marcas..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-slate-400"
        />
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 flex-wrap">
        {TYPES.map(t => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${typeFilter === t.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`}
          >
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border transition-colors ${category === c.id ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><RefreshCw className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400 text-sm">
          No hay productos en esta categoría.
        </div>
      ) : (
        <div className="space-y-8">
          {official.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" /> Tienda oficial del Club</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {official.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/tienda/${p.id}`)} />)}
              </div>
            </section>
          )}
          {marketplace.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-amber-500" /> Marketplace de atletas</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplace.map(p => <ProductCard key={p.id} product={p} onClick={() => navigate(`/tienda/${p.id}`)} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {showSell && <SellForm onClose={() => setShowSell(false)} onSaved={() => { setShowSell(false); load(); }} />}
    </div>
  );
}