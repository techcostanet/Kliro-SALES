"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/luke");
    } catch (err: any) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-black px-4">
      <div className="w-full max-w-md bg-brand-graphite rounded-xl shadow-2xl p-8 border border-brand-blue/30">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-gold">Kliro-SALES</h1>
          <p className="text-brand-offwhite/70 mt-2">Painel Executivo</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-offwhite mb-2">
              E-mail corporativo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-brand-offwhite/40" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-brand-black border border-brand-blue/50 rounded-lg text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
                placeholder="voce@empresa.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-offwhite mb-2">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-brand-offwhite/40" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-brand-black border border-brand-blue/50 rounded-lg text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-brand-black bg-brand-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Entrando..." : "Acessar Painel"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-brand-blue/30 flex flex-col items-center space-y-2 text-xs">
          <a
            href="/luke"
            className="text-brand-gold font-bold hover:underline"
          >
            🦁 Entrar no Painel LUKE Brasil (/luke) →
          </a>
          <a
            href="/luke/rua"
            className="text-brand-offwhite/60 hover:text-brand-gold font-medium"
          >
            📱 Abrir Modo Rua da LUKE (/luke/rua) →
          </a>
          <a
            href="/saas-admin"
            className="text-indigo-400 hover:text-indigo-300 font-semibold pt-2"
          >
            ⚙️ Portal Master SaaS Super Admin (/saas-admin) →
          </a>
        </div>
      </div>
    </div>
  );
}
