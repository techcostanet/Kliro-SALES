"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Users,
  Map,
  LogOut,
  Package,
  Wallet,
  Truck,
  Store,
  DollarSign,
  Building2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrivacyProvider, usePrivacy } from "@/lib/privacyContext";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function LukeSidebarContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>("/images/luke-logo.png");
  const [companyName, setCompanyName] = useState<string>("LUKE Brasil");
  const { hideValues, togglePrivacy } = usePrivacy();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const loadCompanyBranding = async () => {
      try {
        const snap = await getDoc(doc(db, "tenants/tenant_luke_001/settings", "company"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.logoUrl) setCompanyLogo(data.logoUrl);
          if (data.tradeName || data.name) setCompanyName(data.tradeName || data.name);
        }
      } catch (e) {
        console.warn("Logo fallback:", e);
      }
    };
    loadCompanyBranding();

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  // Nomes de 1 palavra conforme Item 4
  const navLinks = [
    { label: "Visão", href: "/luke", icon: LayoutDashboard, exact: true },
    { label: "Clientes", href: "/luke/clientes", icon: Store },
    { label: "Rotas", href: "/luke/rotas", icon: Map },
    { label: "Cargas", href: "/luke/carregamento", icon: Truck },
    { label: "Financeiro", href: "/luke/financeiro", icon: DollarSign },
    { label: "Transações", href: "/luke/transacoes", icon: Wallet },
    { label: "Vendedores", href: "/luke/vendedores", icon: Users },
    { label: "Produtos", href: "/luke/produtos", icon: Package },
    { label: "Empresa", href: "/luke/empresa", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row">
      {/* Sidebar Corporativa */}
      <aside className="w-full md:w-64 bg-brand-graphite border-r border-brand-blue/30 flex flex-col justify-between shrink-0">
        <div>
          {/* Header com Logomarca Dinâmica */}
          <div className="p-5 border-b border-brand-blue/30 flex items-center justify-between">
            <Link href="/luke" className="block group">
              {companyLogo ? (
                <div className="flex items-center space-x-3">
                  <div className="h-10 max-w-[170px] flex items-center justify-start overflow-hidden">
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="max-h-10 w-auto object-contain transition-transform group-hover:scale-105"
                      onError={() => setCompanyLogo(null)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-gold" />
                    <h1 className="text-lg font-black text-brand-gold tracking-wider uppercase truncate max-w-[170px]">
                      {companyName}
                    </h1>
                  </div>
                  <p className="text-[10px] text-brand-offwhite/50 mt-0.5">Gestão de Distribuição</p>
                </div>
              )}
            </Link>
          </div>

          {/* Navegação de Palavra Única */}
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-medium text-sm transition ${
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
            <div className="pt-3 border-t border-brand-blue/20">
              <Link
                href="/luke/rua"
                className="flex items-center space-x-3 px-4 py-2.5 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 rounded-lg font-bold transition shadow-md text-sm"
              >
                <span className="text-lg">📱</span>
                <span>Rua</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Footer com Toggle de Privacidade e Logout */}
        <div className="p-4 border-t border-brand-blue/30 space-y-2">
          {/* Botão Global de Ocultar Valores */}
          <button
            onClick={togglePrivacy}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-bold border transition ${
              hideValues
                ? "bg-brand-gold/15 text-brand-gold border-brand-gold/30"
                : "bg-brand-black/40 text-brand-offwhite/70 border-brand-blue/30 hover:text-brand-offwhite"
            }`}
          >
            {hideValues ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{hideValues ? "Valores Ocultos (Padrão)" : "Valores Visíveis"}</span>
          </button>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 flex items-center justify-center font-bold text-xs">
                {user?.email?.[0]?.toUpperCase() || "L"}
              </div>
              <div className="text-xs">
                <p className="font-bold text-brand-offwhite truncate max-w-[100px]">
                  {user?.displayName || "Admin LUKE"}
                </p>
                <p className="text-[10px] text-brand-offwhite/50 truncate max-w-[100px]">
                  {user?.email || "admin@luke.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-brand-offwhite/50 hover:text-red-400 hover:bg-brand-blue/10 rounded-lg transition"
              title="Sair do Sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function LukeDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivacyProvider>
      <LukeSidebarContent>{children}</LukeSidebarContent>
    </PrivacyProvider>
  );
}
