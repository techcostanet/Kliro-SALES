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
  Settings,
  History,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PrivacyProvider, usePrivacy } from "@/lib/privacyContext";
import { PermissionsProvider, usePermissions, MenuPermissionKey } from "@/lib/permissionsContext";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function LukeSidebarContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>("/images/luke-logo.png");
  const [companyName, setCompanyName] = useState<string>("LUKE Brasil");
  const { hideValues, togglePrivacy } = usePrivacy();
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        window.location.href = "/";
      }
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

  const navLinks: { label: string; href: string; icon: any; exact?: boolean; permissionKey: MenuPermissionKey }[] = [
    { label: "Visão", href: "/luke", icon: LayoutDashboard, exact: true, permissionKey: "visao" },
    { label: "Clientes", href: "/luke/clientes", icon: Store, permissionKey: "clientes" },
    { label: "Rotas", href: "/luke/rotas", icon: Map, permissionKey: "rotas" },
    { label: "Cargas", href: "/luke/carregamento", icon: Truck, permissionKey: "carregamento" },
    { label: "Financeiro", href: "/luke/financeiro", icon: DollarSign, permissionKey: "financeiro" },
    { label: "Transações", href: "/luke/transacoes", icon: Wallet, permissionKey: "transacoes" },
    { label: "Vendedores", href: "/luke/vendedores", icon: Users, permissionKey: "vendedores" },
    { label: "Produtos", href: "/luke/produtos", icon: Package, permissionKey: "produtos" },
    { label: "Empresa", href: "/luke/empresa", icon: Building2, permissionKey: "empresa" },
    { label: "Configurações", href: "/luke/configuracoes", icon: Settings, permissionKey: "configuracoes" },
    { label: "Logs", href: "/luke/logs", icon: History, permissionKey: "logs" },
  ];

  const visibleNavLinks = navLinks.filter((l) => hasPermission(l.permissionKey));

  return (
    <div className="min-h-screen bg-brand-black flex flex-col md:flex-row print:bg-white print:block">
      {/* Sidebar Corporativa */}
      <aside className="w-full md:w-64 bg-brand-graphite border-r border-brand-blue/30 flex flex-col justify-between shrink-0 print:hidden">
        <div>
          {/* Header com Logomarca Dinâmica */}
          <div className="px-5 py-4 border-b border-brand-blue/30 flex items-center justify-start">
            <Link href="/luke" className="block group w-full">
              {companyLogo ? (
                <div className="w-full flex items-center justify-start">
                  <div className="h-16 sm:h-20 w-full max-w-[210px] flex items-center justify-start overflow-hidden">
                    <img
                      src={companyLogo}
                      alt={companyName}
                      className="max-h-16 sm:max-h-20 h-auto w-auto max-w-full object-contain object-left transition-transform group-hover:scale-105"
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

          {/* Navegação Corporativa Filtrada por Permissões */}
          <nav className="flex-1 px-4 space-y-1 mt-4">
            {visibleNavLinks.map((link) => {
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

            {/* Atalho: Modo Rua (se autorizado) */}
            {hasPermission("rua") && (
              <div className="pt-3 border-t border-brand-blue/20">
                <Link
                  href="/luke/rua"
                  className="flex items-center space-x-3 px-4 py-2.5 bg-brand-gold/15 text-brand-gold hover:bg-brand-gold/25 border border-brand-gold/30 rounded-lg font-bold transition shadow-md text-sm"
                >
                  <span className="text-lg">📱</span>
                  <span>Rua</span>
                </Link>
              </div>
            )}
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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen print:p-0 print:m-0 print:max-h-none print:overflow-visible print:bg-white">
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
    <PermissionsProvider>
      <PrivacyProvider>
        <LukeSidebarContent>{children}</LukeSidebarContent>
      </PrivacyProvider>
    </PermissionsProvider>
  );
}
