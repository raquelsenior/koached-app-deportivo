import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Mail, Lock, Loader2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";
import OnboardingForm from "@/components/auth/OnboardingForm";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("form"); // form | otp | onboarding
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      setStep("onboarding");
    } catch (err) {
      setError(err.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Código enviado", description: "Revisa tu correo electrónico." });
    } catch (err) {
      setError(err.message || "Error al reenviar código");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  // After onboarding completes (or skipped), redirect
  const handleOnboardingDone = () => {
    window.location.href = safeReturnTo();
  };

  if (step === "onboarding") {
    return <OnboardingForm onDone={handleOnboardingDone} />;
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <img
              src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png"
              alt="Fersarun"
              className="w-20 h-20 rounded-2xl mx-auto object-contain bg-white/5 p-2"
            />
            <div>
              <h1 className="text-xl font-bold text-white">Verifica tu email</h1>
              <p className="text-slate-400 text-sm mt-1">Enviamos un código a <span className="text-white">{email}</span></p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
            )}
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : "Verificar"}
            </button>
            <p className="text-center text-sm text-slate-500">
              ¿No recibiste el código?{" "}
              <button onClick={handleResend} className="text-emerald-400 font-medium hover:underline">Reenviar</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Brand */}
        <div className="text-center space-y-3">
          <img
            src="https://media.base44.com/images/public/6a6d5f29ed58014e161b83cd/74c9afdea_Fersarun-Logo.png"
            alt="Fersarun"
            className="w-20 h-20 rounded-2xl mx-auto object-contain bg-white/5 p-2"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Únete a Fersarun</h1>
            <p className="text-slate-400 text-sm mt-1">El Club Inteligente · Crea tu cuenta</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 rounded-xl h-11 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            <GoogleIcon className="w-5 h-5" />
            Continuar con Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-500">o con email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email" autoComplete="email" autoFocus placeholder="correo@ejemplo.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 h-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                  value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 h-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400">Confirmar contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password" autoComplete="new-password" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 h-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</> : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link
            to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")}
            className="text-emerald-400 font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}