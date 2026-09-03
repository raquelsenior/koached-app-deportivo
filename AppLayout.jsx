import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, ClipboardList, CreditCard, Menu, X, Activity, BookOpen, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { t } = useLang();

  const nav = [
    { to: "/", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/atletas", label: t("athletes"), icon: Users },
    { to: "/planes", label: t("plans"), icon: ClipboardList },
    { to: "/pagos", label: t("payments"), icon: CreditCard },
    { to: "/tienda-admin", label: t("store"), icon: ShoppingBag },
    { to: "/atleta", label: t("athletePortal"), icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between bg-white border-b border-slate-200 px-4 h-14" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-2">
          <img src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png" alt="Fersarun" className="h-9 w-9 object-contain rounded-full" />
          <span className="font-semibold text-slate-900">Fersarun</span>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <button onClick={() => setOpen(true)} className="p-2 -mr-2">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png" alt="Fersarun" className="w-10 h-10 object-contain rounded-full" />
            <div className="leading-tight">
              <div className="font-semibold text-slate-900 text-sm">Fersarun</div>
              <div className="text-[11px] text-slate-400">{t("coachPanel")}</div>
            </div>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => {
            const active = loc.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <LangToggle />
          <div className="text-[11px] text-slate-400">{t("coach")}</div>
          <div className="text-sm font-medium text-slate-700">Lucirio</div>
        </div>
      </aside>

      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {nav.slice(0, 5).map((item) => {
          const active = loc.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} className={cn("flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors", active ? "text-slate-900" : "text-slate-400")}>
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}