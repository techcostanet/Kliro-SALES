"use client";

import {
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function SaasAdminOverview() {
  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
            Kliro-SALES Control Center
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Visão Geral do SaaS
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Acompanhe o faturamento recorrente, licenciamento de vendedores e saúde dos tenants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/saas-admin/clientes"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-indigo-600/30 text-sm"
          >
            <Plus size={18} />
            <span>Cadastrar Novo Cliente</span>
          </Link>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">MRR (Receita Mensal)</p>
              <h3 className="text-2xl font-black text-white mt-1">R$ 1.890,00</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-400 font-semibold">
            <TrendingUp size={14} className="mr-1" />
            <span>1º Cliente Conectado (LUKE)</span>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">ARR (Projeção Anual)</p>
              <h3 className="text-2xl font-black text-white mt-1">R$ 22.680,00</h3>
            </div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400">Contrato anual padrão</p>
        </div>

        {/* Clientes / Tenants */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">Clientes Corporativos</p>
              <h3 className="text-2xl font-black text-white mt-1">1 Empresa</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs text-indigo-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
            <span>LUKE Brasil (Ativo)</span>
          </div>
        </div>

        {/* Licenças Totais */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400">Licenças de Vendedores</p>
              <h3 className="text-2xl font-black text-white mt-1">15 Licenças</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-400">12 em uso no Modo Rua hoje</p>
        </div>
      </div>

      {/* Grid de Informações dos Clientes e Saúde do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Tenants em Destaque */}
        <div className="lg:col-span-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-white text-base">Clientes Ativos no SaaS</h3>
              <p className="text-xs text-slate-400">Empresas que utilizam o Kliro-SALES</p>
            </div>
            <Link
              href="/saas-admin/clientes"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
            >
              Ver todos →
            </Link>
          </div>

          <div className="divide-y divide-slate-800">
            {/* Cliente 01: LUKE Brasil */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800/40 transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center font-black text-amber-300 text-lg">
                  LK
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-white text-sm">LUKE Brasil Alimentos</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Ativo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    CNPJ: 00.000.000/0001-00 • Plano Enterprise (15 licenças)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Mensalidade</p>
                  <p className="font-extrabold text-white text-sm">R$ 1.890,00/mês</p>
                </div>
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Acessar Painel
                </Link>
              </div>
            </div>

            {/* Placeholder / Convite para Próximo Cliente */}
            <div className="p-5 flex justify-between items-center bg-slate-950/40">
              <div className="flex items-center space-x-3 text-slate-400">
                <div className="w-10 h-10 rounded-xl border border-dashed border-slate-700 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">
                    Pronto para receber o Cliente 02
                  </p>
                  <p className="text-[11px] text-slate-500">
                    O Firestore Multi-Tenant já está isolado e preparado
                  </p>
                </div>
              </div>

              <Link
                href="/saas-admin/clientes"
                className="text-xs text-indigo-400 hover:underline font-semibold"
              >
                Cadastrar Tenant
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna 3: Infraestrutura e Cotas do Firebase */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-md space-y-5">
          <div>
            <h3 className="font-bold text-white text-base">Infraestrutura Google</h3>
            <p className="text-xs text-slate-400">Consumo do Plano Spark (Gratuito)</p>
          </div>

          <div className="space-y-4">
            {/* Firestore Reads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Firestore Leituras</span>
                <span className="text-slate-400">1.240 / 50.000 dia</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: "3%" }} />
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold">Cota Livre: 97% restante</p>
            </div>

            {/* Firestore Writes */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Firestore Gravações</span>
                <span className="text-slate-400">380 / 20.000 dia</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: "2%" }} />
              </div>
              <p className="text-[10px] text-indigo-400 font-semibold">Cota Livre: 98% restante</p>
            </div>

            {/* Firebase Hosting */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Firebase Hosting</span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">kliro-sales.web.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
