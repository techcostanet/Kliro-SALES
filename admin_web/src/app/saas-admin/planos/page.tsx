"use client";

import { useState } from "react";
import {
  CreditCard,
  Users,
  Check,
  Zap,
  Shield,
  Percent,
  Sliders,
  DollarSign,
  Calculator,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SaasAdminPlanosPage() {
  // Simulador Comercial
  const [simVendors, setSimVendors] = useState(15);
  const [simPricePerSeat, setSimPricePerSeat] = useState(120);
  const [simDiscount, setSimDiscount] = useState(0);

  const baseTotal = simVendors * simPricePerSeat;
  const finalTotal = Math.max(0, baseTotal - simDiscount);
  const annualTotal = finalTotal * 12;

  return (
    <div className="space-y-8">
      {/* Header Clean Light */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Modelo Comercial & Licenciamento
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Planos & Tabela por Vendedor
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Estrutura de preços baseada no número de vendedores de rua (seats), com flexibilidade total para descontos.
          </p>
        </div>

        <Link
          href="/saas-admin/clientes"
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
        >
          <span>Aplicar em um Cliente</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Grid de Planos Referência - Clean Light */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Starter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                Pequenas Equipes
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Starter</h3>
            <p className="text-xs text-slate-500 mt-1">Para distribuidoras iniciando a digitalização.</p>

            <div className="mt-5 pb-5 border-b border-slate-100">
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-slate-900">R$ 140</span>
                <span className="text-xs text-slate-500 ml-1">/ vendedor / mês</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Até 5 vendedores</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Aplicativo Modo Rua Completo</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Gestão de Rotas & Pedidos</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Fechamento Anti-Fraude</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Suporte via WhatsApp</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 block">Exemplo com 5 vendedores:</span>
            <span className="text-sm font-bold text-slate-800">R$ 700,00 / mês</span>
          </div>
        </div>

        {/* Professional (Destaque) */}
        <div className="bg-indigo-50/40 rounded-2xl border-2 border-indigo-500 p-6 flex flex-col justify-between shadow-md relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            Mais Escolhido (Ex: LUKE Brasil)
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                Médio Porte
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Professional</h3>
            <p className="text-xs text-slate-600 mt-1">Para operações em ritmo de expansão comercial.</p>

            <div className="mt-5 pb-5 border-b border-indigo-100">
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-indigo-700">R$ 120</span>
                <span className="text-xs text-slate-600 ml-1">/ vendedor / mês</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">De 6 a 25 vendedores</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center">
                <Check size={16} className="text-emerald-600 mr-2 shrink-0" />
                <span>Tudo do plano Starter</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-600 mr-2 shrink-0" />
                <span>Relatórios de Conciliação Financeira</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-600 mr-2 shrink-0" />
                <span>Múltiplos Supervisores de Rota</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-600 mr-2 shrink-0" />
                <span>Backup Automatizado</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-indigo-100">
            <span className="text-xs text-indigo-600/80 block">Exemplo com 15 vendedores:</span>
            <span className="text-base font-black text-indigo-900">R$ 1.800,00 / mês</span>
          </div>
        </div>

        {/* Enterprise */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                Grandes Redes
              </span>
            </div>
            <h3 className="text-xl font-black text-slate-900">Enterprise</h3>
            <p className="text-xs text-slate-500 mt-1">Para grandes indústrias e distribuidoras nacionais.</p>

            <div className="mt-5 pb-5 border-b border-slate-100">
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-slate-900">R$ 90</span>
                <span className="text-xs text-slate-500 ml-1">/ vendedor / mês</span>
              </div>
              <p className="text-[11px] text-indigo-600 font-semibold mt-1">Acima de 25 vendedores</p>
            </div>

            <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Vendedores Ilimitados</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>API de Integração com ERP (TOTVS/SAP)</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>Gerente de Contas Dedicado</span>
              </li>
              <li className="flex items-center">
                <Check size={16} className="text-emerald-500 mr-2 shrink-0" />
                <span>SLA de 99.9% Garantido</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-400 block">Exemplo com 50 vendedores:</span>
            <span className="text-sm font-bold text-slate-800">R$ 4.500,00 / mês</span>
          </div>
        </div>
      </div>

      {/* CALCULADORA / SIMULADOR DE PROPOSTAS COMERCIAL FLEXÍVEL */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Simulador Comercial de Propostas & Descontos
            </h3>
            <p className="text-xs text-slate-500">
              Personalize a quantidade de vendedores, altere o preço unitário e defina descontos especiais para negociações.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controles do Simulador */}
          <div className="space-y-5">
            {/* Vendedores Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quantidade de Vendedores:
                </label>
                <span className="text-base font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                  {simVendors} Vendedores
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={simVendors}
                onChange={(e) => setSimVendors(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 vendedor</span>
                <span>50 vendedores</span>
                <span>100 vendedores</span>
              </div>
            </div>

            {/* Preço Unitário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Preço / Vendedor (R$)
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={simPricePerSeat}
                  onChange={(e) => setSimPricePerSeat(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Desconto Especial (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={simDiscount}
                  onChange={(e) => setSimDiscount(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Resultado do Cálculo */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resumo da Proposta Comercial
              </p>

              <div className="flex justify-between text-xs text-slate-600 pt-1">
                <span>Valor Bruto ({simVendors} x R$ {simPricePerSeat}):</span>
                <span className="font-semibold">R$ {baseTotal.toFixed(2).replace(".", ",")}</span>
              </div>

              {simDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-bold">
                  <span>Desconto Aplicado:</span>
                  <span>- R$ {simDiscount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-500 block">Mensalidade Final:</span>
                  <span className="text-3xl font-black text-slate-900">
                    R$ {finalTotal.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-slate-400"> / mês</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Projeção Anual:</span>
                  <span className="text-lg font-extrabold text-indigo-700">
                    R$ {annualTotal.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/saas-admin/clientes"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm text-center block"
            >
              Criar Contrato com Este Valor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
