"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Server,
  ArrowUpRight,
  Shield,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function SaasAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Visão Geral SaaS",
      href: "/saas-admin",
      icon: LayoutDashboard,
      active: pathname === "/saas-admin",
    },
    {
      label: "Clientes & Tenants",
      href: "/saas-admin/clientes",
      icon: Building2,
      active: pathname === "/saas-admin/clientes",
    },
    {
      label: "Planos & Licenças",
      href: "/saas-admin/planos",
      icon: CreditCard,
      active: pathname === "/saas-admin/planos",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Sidebar Super Admin */}
      <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Kliro-SALES Master */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-600/30">
                  K
                </div>
                <div>
                  <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                    Kliro-SALES
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    SaaS Master Admin
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navegação Master */}
          <nav className="p-4 space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Gestão Global
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    item.active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={item.active ? "text-white" : "text-slate-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tenant Impersonation & System Health */}
        <div className="p-4 space-y-3 border-t border-slate-800">
          {/* Acesso Direto ao Cliente LUKE */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Cliente 01 • Ativo
              </span>
              <span className="text-[10px] text-slate-400">Tenant LUKE</span>
            </div>
            <p className="text-xs font-semibold text-slate-200">LUKE Brasil Alimentos</p>
            <Link
              href="/luke"
              className="flex items-center justify-center space-x-1.5 w-full py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition"
            >
              <span>Abrir /luke</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Status da Infraestrutura */}
          <div className="px-3 py-2 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firebase Spark</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase">100% Grátis</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400">
              Painel de Controle Central de Multi-Empresas
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">TechCosta Admin</p>
              <p className="text-[11px] text-slate-400">Proprietário do Kliro-SALES</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-indigo-500/30">
              TC
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
