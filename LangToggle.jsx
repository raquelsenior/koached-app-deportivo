import React from "react";
import { useLang } from "@/lib/i18n";

export default function LangToggle({ className = "" }) {
  const { lang, setLang } = useLang();

  return (
    <button
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors ${className}`}
      title="Cambiar idioma / Change language"
    >
      <span>{lang === "es" ? "🇻🇪" : "🇺🇸"}</span>
      <span className="uppercase">{lang === "es" ? "ES" : "EN"}</span>
    </button>
  );
}