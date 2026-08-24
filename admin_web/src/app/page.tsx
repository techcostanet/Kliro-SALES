"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail, Shield, Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [accessMode, setAccessMode] = useState<"MASTER" | "CLIENT">("MASTER");
  const [email, setEmail] = useState("contato@techcosta.net");
  const [password, setPassword] = useState("T3chCost@10");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSelectMode = (mode: "MASTER" | "CLIENT") => {
    setAccessMode(mode);
    setError("");
    if (mode === "MASTER") {
      setEmail("contato@techcosta.net");
      setPassword("T3chCost@10");
    } else {
      setEmail("admin@luke.com");
      setPassword("admin123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email.toLowerCase().includes("techcosta.net") || accessMode === "MASTER") {
        router.push("/saas-admin");
      } else {
        router.push("/luke");
      }
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl mx-auto shadow-md shadow-indigo-500/20">
            K
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Kliro-SALES</h1>
          <p className="text-xs text-slate-500 font-medium">
            Plataforma Comercial Multi-Tenant • Tech Costa Systems
          </p>
        </div>

        {/* Seletor de Perfil / Modo de Acesso */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => handleSelectMode("MASTER")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
              accessMode === "MASTER"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield size={14} />
            <span>SaaS Master</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectMode("CLIENT")}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
              accessMode === "CLIENT"
                ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 size={14} />
            <span>Cliente LUKE</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                placeholder="seu-email@dominio.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition shadow-sm ${
              accessMode === "MASTER"
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-slate-900 hover:bg-black"
            }`}
          >
            <span>
              {loading
                ? "Autenticando..."
                : accessMode === "MASTER"
                ? "Entrar no Painel Master SaaS"
                : "Entrar no Painel da Empresa"}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Tech Costa Systems • Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
