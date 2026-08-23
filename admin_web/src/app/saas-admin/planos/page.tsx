"use client";

import { useState } from "react";
import { Check, Zap, Sparkles, Building2, Users, DollarSign, Calculator } from "lucide-react";

export default function SaasAdminPlanosPage() {
  const [vendorCount, setVendorCount] = useState(15);
  const pricePerVendor = 126.0; // R$ 126 / vendedor
  const basePlatformFee = 490.0; // Taxa base da plataforma

  const calculatedMonthly = basePlatformFee + vendorCount * pricePerVendor;
  const calculatedAnnual = calculatedMonthly * 12 * 0.9; // 10% desconto anual

  const plans = [
    {
      id: "starter",
      name: "Starter",
      tagline: "Para pequenas distribuidoras e operações locais",
      price: 690.0,
      period: "/mês",
      includedSeats: "Até 5 Vendedores",
      features: [
        "Painel Web Executivo",
        "Modo Rua Mobile (PWA)",
        "Isolamento Multi-Tenant Firestore",
        "Fechamento de Rota Anti-Fraude",
        "Suporte por E-mail",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Professional (Plano LUKE)",
      tagline: "Para médias distribuidoras e indústrias em expansão",
      price: 1890.0,
      period: "/mês",
      includedSeats: "Até 15 Vendedores",
      features: [
        "Tudo do Plano Starter",
        "Conciliação Financeira Pix & Dinheiro",
        "Rastreamento de Rotas em Tempo Real",
        "Personalização de Cores da Marca",
        "Múltiplos Supervisores",
        "Suporte Prioritário",
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise Custom",
      tagline: "Para grandes redes e indústrias nacionais",
      price: 3490.0,
      period: "/mês",
      includedSeats: "Vendedores Ilimitados",
      features: [
        "Tudo do Plano Professional",
        "API para Integração ERP / SAP",
        "Relatórios Customizados",
        "SLA de 99.9% de Disponibilidade",
        "Gerente de Conta Dedicado",
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Planos & Modelo de Negócio
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Definição de preços de licenciamento por empresa e simulador de propostas comerciais.
        </p>
      </div>

      {/* Cards de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-2xl border flex flex-col justify-between transition ${
              plan.popular
                ? "bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/30"
                : "bg-slate-900/60 border-slate-800"
            }`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{plan.tagline}</p>
                </div>
                {plan.popular && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white uppercase tracking-wider">
                    Mais Vendido
                  </span>
                )}
              </div>

              <div className="pt-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-white">
                    R$ {plan.price.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                </div>
                <p className="text-xs font-semibold text-indigo-400 mt-1">{plan.includedSeats}</p>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5 text-xs">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center space-x-2 text-slate-300">
                    <Check size={14} className="text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SIMULADOR DE PROPOSTAS COMERCIAIS */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 p-6 sm:p-8 rounded-2xl border border-indigo-500/30 shadow-xl space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Simulador de Proposta Comercial para Novos Clientes
            </h3>
            <p className="text-xs text-slate-400">
              Calcule a precificação ideal com base no número de vendedores da empresa prospectada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
          {/* Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-300">
                Quantidade de Vendedores na Rua:
              </label>
              <span className="text-xl font-black text-indigo-400">{vendorCount} Vendedores</span>
            </div>

            <input
              type="range"
              min="1"
              max="100"
              value={vendorCount}
              onChange={(e) => setVendorCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />

            <div className="flex justify-between text-[11px] text-slate-500">
              <span>1 vendedor</span>
              <span>50 vendedores</span>
              <span>100 vendedores</span>
            </div>
          </div>

          {/* Resultado do Cálculo */}
          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Mensalidade Recomendada:</span>
              <span className="text-2xl font-black text-emerald-400">
                R$ {calculatedMonthly.toFixed(2).replace(".", ",")}
                <span className="text-xs font-normal text-slate-500">/mês</span>
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Contrato Anual (c/ 10% desc.):</span>
              <span className="text-sm font-bold text-indigo-300">
                R$ {calculatedAnnual.toFixed(2).replace(".", ",")}/ano
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
