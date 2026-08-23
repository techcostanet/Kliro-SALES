"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Users, Map, LogOut, Package, Wallet } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-black">
        <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black flex text-brand-offwhite">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-graphite border-r border-brand-blue/30 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-brand-gold">Kliro-SALES</h1>
          <p className="text-xs text-brand-offwhite/50 mt-1">Tenant: LUKE</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite rounded-lg transition">
            <LayoutDashboard size={20} />
            <span className="font-medium">Visão Geral</span>
          </Link>
          <Link href="/dashboard/rotas" className="flex items-center space-x-3 px-4 py-3 text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite rounded-lg transition">
            <Map size={20} />
            <span className="font-medium">Rotas Ativas</span>
          </Link>
          <Link href="/dashboard/transacoes" className="flex items-center space-x-3 px-4 py-3 text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite rounded-lg transition">
            <Wallet size={20} />
            <span className="font-medium">Transações</span>
          </Link>
          <Link href="/dashboard/vendedores" className="flex items-center space-x-3 px-4 py-3 text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite rounded-lg transition">
            <Users size={20} />
            <span className="font-medium">Vendedores</span>
          </Link>
          <Link href="/dashboard/produtos" className="flex items-center space-x-3 px-4 py-3 text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite rounded-lg transition">
            <Package size={20} />
            <span className="font-medium">Produtos</span>
          </Link>
          
          <div className="pt-4 border-t border-brand-blue/20">
            <Link
              href="/rua"
              className="flex items-center space-x-3 px-4 py-3 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 rounded-lg font-bold transition shadow-md"
            >
              <span className="text-lg">📱</span>
              <span>Modo Rua (Vendedor)</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-brand-blue/30">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-brand-offwhite/70 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
