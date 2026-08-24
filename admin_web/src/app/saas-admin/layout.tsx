"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Shield,
  Layers,
  Sparkles,
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
      label: "Gestão de Clientes",
      href: "/saas-admin/clientes",
      icon: Building2,
      active: pathname === "/saas-admin/clientes",
    },
    {
      label: "Planos & Preços",
      href: "/saas-admin/planos",
      icon: CreditCard,
      active: pathname === "/saas-admin/planos",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Sidebar Super Admin - Clean Light Theme */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo Kliro-SALES Master */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/20 text-lg">
                K
              </div>
              <div>
                <h1 className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  Kliro-SALES
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Gestão Central do SaaS
                </span>
              </div>
            </div>
          </div>

          {/* Navegação Master */}
          <nav className="p-4 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Menu Principal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                    item.active
                      ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 shadow-xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <Icon size={18} className={item.active ? "text-indigo-600" : "text-slate-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Status da Infraestrutura no Footer da Sidebar */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="px-3 py-2.5 bg-emerald-50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Spark</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md">
              100% GRÁTIS
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header Clean */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-indigo-600" />
            <span className="text-xs font-semibold text-slate-500">
              Painel Administrativo do Sistema Multi-Tenant
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">Administrador Master</p>
              <p className="text-[11px] text-slate-400">TechCosta Solutions</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
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
