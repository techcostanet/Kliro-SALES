"use client";

import {
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  Plus,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SaasAdminOverview() {
  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome - Clean Light */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Painel Executivo de Gestão
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Visão Geral do SaaS
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe a receita recorrente (MRR), total de licenças ativas e gestão de empresas parceiras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/saas-admin/clientes"
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
          >
            <Plus size={18} />
            <span>Gerenciar Clientes</span>
          </Link>
        </div>
      </div>

      {/* Global SaaS KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                MRR (Receita Mensal)
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">R$ 1.890,00</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-md w-fit">
            <TrendingUp size={14} className="mr-1" />
            <span>1º Contrato Ativo (LUKE Brasil)</span>
          </div>
        </div>

        {/* ARR */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ARR (Projeção Anual)
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">R$ 22.680,00</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Zap size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Valor anual dos contratos vigentes</p>
        </div>

        {/* Clientes / Tenants */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clientes Corporativos
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">1 Empresa</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-100">
              <Building2 size={20} />
            </div>
          </div>
          <div className="flex items-center text-xs text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
            <span>100% de adimplência na base</span>
          </div>
        </div>

        {/* Licenças Totais */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Licenças de Vendedores
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">15 Licenças</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl border border-purple-100">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500">Média de R$ 126,00 por vendedor/mês</p>
        </div>
      </div>

      {/* Grid de Informações dos Clientes e Saúde do Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Clientes Contratados */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Empresas Contratantes</h3>
              <p className="text-xs text-slate-500">Resumo cadastral e financeiro das licenças</p>
            </div>
            <Link
              href="/saas-admin/clientes"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition flex items-center gap-1"
            >
              <span>Gerenciar Clientes</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Cliente 01: LUKE Brasil */}
            <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/60 transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-800 text-base shadow-xs">
                  LK
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-slate-900 text-sm">LUKE Brasil Alimentos</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Ativo
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    15 Vendedores Contratados • Vencimento: Todo dia 10
                  </p>
                </div>
              </div>

              <div className="text-right w-full sm:w-auto">
                <p className="text-xs text-slate-400">Mensalidade</p>
                <p className="font-black text-slate-900 text-base">R$ 1.890,00<span className="text-xs font-normal text-slate-400">/mês</span></p>
              </div>
            </div>

            {/* Novo Cliente Box */}
            <div className="p-5 flex justify-between items-center bg-slate-50/40">
              <div className="flex items-center space-x-3 text-slate-500">
                <div className="w-10 h-10 rounded-xl border border-dashed border-slate-300 flex items-center justify-center bg-white">
                  <Plus size={18} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Pronto para receber o Cliente 02
                  </p>
                  <p className="text-[11px] text-slate-500">
                    O banco Multi-Tenant já está isolado e pronto para novas empresas
                  </p>
                </div>
              </div>

              <Link
                href="/saas-admin/clientes"
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition shadow-xs"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>

        {/* Coluna 3: Infraestrutura e Cotas do Firebase */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Status do Servidor</h3>
            <p className="text-xs text-slate-500">Monitoramento da camada gratuita (Spark)</p>
          </div>

          <div className="space-y-4">
            {/* Firestore Reads */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Firestore Leituras</span>
                <span className="text-slate-500">1.240 / 50.000 dia</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "3%" }} />
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold">Cota Livre: 97% restante</p>
            </div>

            {/* Firestore Writes */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-medium">Firestore Gravações</span>
                <span className="text-slate-500">380 / 20.000 dia</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "2%" }} />
              </div>
              <p className="text-[10px] text-indigo-600 font-semibold">Cota Livre: 98% restante</p>
            </div>

            {/* Firebase Hosting */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Firebase Hosting</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">kliro-sales.web.app</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
