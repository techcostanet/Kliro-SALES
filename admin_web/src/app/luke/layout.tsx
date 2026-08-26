"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LayoutDashboard, Users, Map, LogOut, Package, Wallet, ArrowLeft, Truck, Store, DollarSign } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LukeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const navLinks = [
    { label: "Visão Geral", href: "/luke", icon: LayoutDashboard, exact: true },
    { label: "Salões & Clientes", href: "/luke/clientes", icon: Store },
    { label: "Rotas Ativas", href: "/luke/rotas", icon: Map },
    { label: "Carregamentos", href: "/luke/carregamento", icon: Truck },
    { label: "Financeiro & DRE", href: "/luke/financeiro", icon: DollarSign },
    { label: "Transações", href: "/luke/transacoes", icon: Wallet },
    { label: "Equipe Comercial", href: "/luke/vendedores", icon: Users },
    { label: "Produtos", href: "/luke/produtos", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row">
      {/* Sidebar Corporativa LUKE */}
      <aside className="w-full md:w-64 bg-brand-graphite border-r border-brand-blue/30 flex flex-col justify-between shrink-0">
        <div>
          {/* Header LUKE */}
          <div className="p-6 border-b border-brand-blue/30 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                <h1 className="text-xl font-black text-brand-gold tracking-wider uppercase">
                  LUKE Brasil
                </h1>
              </div>
              <p className="text-[11px] text-brand-offwhite/50 mt-0.5">Painel de Gestão Comercial</p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition ${
                    isActive
                      ? "bg-brand-blue/30 text-brand-gold border border-brand-gold/30 font-bold shadow-md"
                      : "text-brand-offwhite/70 hover:bg-brand-blue/10 hover:text-brand-offwhite"
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Atalho: Modo Rua */}
            <div className="pt-4 border-t border-brand-blue/20">
              <Link
                href="/luke/rua"
                className="flex items-center space-x-3 px-4 py-3 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 rounded-lg font-bold transition shadow-md text-sm"
              >
                <span className="text-lg">📱</span>
                <span>Modo Rua (LUKE)</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-brand-blue/30">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-bold text-brand-offwhite truncate">
                {user?.email || "admin@luke.com"}
              </p>
              <p className="text-[10px] text-brand-gold uppercase font-semibold">Administrador</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-brand-offwhite/40 hover:text-red-400 p-1.5 transition rounded-lg hover:bg-brand-blue/10"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Central */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
