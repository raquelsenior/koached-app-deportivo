import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Trash2, AlertTriangle, LogOut, ChevronLeft } from "lucide-react";
import { useLang } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  async function handleDelete() {
    if (confirmText !== "ELIMINAR") return;
    setDeleting(true);
    try {
      // Log the user out and clear all local data
      await base44.auth.logout("/login");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 py-6 px-4" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      {/* Native-style back nav */}
      <div className="flex items-center gap-2 -ml-2">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 hover:text-slate-900 p-2 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm">{t("back")}</span>
        </button>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("settingsTitle")}</h1>
        <LangToggle />
      </div>

      {/* Account Deletion */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{t("deleteAccount")}</h2>
            <p className="text-sm text-slate-500">{t("deleteWarning")}</p>
          </div>
        </div>

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="w-full border border-rose-300 text-rose-600 rounded-xl py-2.5 text-sm font-medium hover:bg-rose-50 transition-colors"
          >
            {t("confirmDelete")}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-sm text-rose-800">
                <p className="font-medium mb-1">¿Estás seguro?</p>
                <p>Se eliminarán permanentemente tus datos de entrenamiento, métricas, historial de pagos y acceso a la plataforma. Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Escribe <strong>ELIMINAR</strong> para confirmar
              </label>
              <input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setConfirming(false); setConfirmText(""); }}
                className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-medium"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== "ELIMINAR" || deleting}
                className="flex-1 bg-rose-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-rose-700 transition-colors"
              >
                {deleting ? t("saving") : t("deleteAccount")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <button
          onClick={() => base44.auth.logout("/login")}
          className="w-full flex items-center justify-center gap-2 text-slate-600 text-sm font-medium py-2 hover:text-slate-900"
        >
          <LogOut className="w-4 h-4" /> {t("exit")}
        </button>
      </div>
    </div>
  );
}