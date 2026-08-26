"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Autenticação no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // 2. Roteamento Inteligente Automático
      // Caso 1: Administrador Master do SaaS (Tech Costa Systems)
      if (cleanEmail === "contato@techcosta.net" || cleanEmail.endsWith("@techcosta.net")) {
        router.push("/saas-admin");
        return;
      }

      // Caso 2: Consulta de Tenant no Firestore
      try {
        const mappingSnap = await getDoc(doc(db, "user_mappings", user.uid));
        if (mappingSnap.exists()) {
          const mappingData = mappingSnap.data();
          const tenantId = mappingData?.tenantId;

          if (tenantId === "tenant_luke_001" || cleanEmail.includes("luke")) {
            router.push("/luke");
            return;
          } else if (tenantId) {
            router.push(`/dashboard`);
            return;
          }
        }
      } catch (firestoreErr) {
        console.warn("Consulta Firestore ignorada, usando roteamento por credencial:", firestoreErr);
      }

      // Caso 3: Usuários da empresa LUKE Brasil (fallback por e-mail)
      if (cleanEmail.includes("luke") || cleanEmail === "admin@luke.com" || cleanEmail === "lucas@luke.com") {
        router.push("/luke");
      } else {
        // Padrão de entrada
        router.push("/luke");
      }

    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("E-mail ou senha incorretos. Por favor, tente novamente.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Muitas tentativas sem sucesso. Aguarde alguns instantes e tente de novo.");
      } else {
        setError("Falha ao autenticar. Verifique sua conexão e credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden px-4 font-sans">
      {/* Background Decorativo Moderno e Suave */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Card de Login Clean */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 sm:p-10 border border-slate-200/80 space-y-6 relative z-10">
        {/* Cabeçalho da Plataforma */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-2xl mx-auto shadow-lg shadow-indigo-600/25">
            K
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
            Kliro-SALES
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Plataforma Comercial Multi-Tenant • Tech Costa Systems
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {/* Formulário Único */}
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
                className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-2xs"
                placeholder="seu.email@empresa.com"
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
                className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-2xs"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Acessando...</span>
              </>
            ) : (
              <>
                <span>Acessar Plataforma</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Rodapé Institucional Seguro */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>Ambiente seguro protegido por criptografia</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-6 relative z-10">
        <span className="font-mono font-bold text-indigo-600/80 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/80">
          v1.2.0
        </span>
        <span>•</span>
        <span>Tech Costa Systems • Todos os direitos reservados</span>
      </div>
    </div>
  );
}
