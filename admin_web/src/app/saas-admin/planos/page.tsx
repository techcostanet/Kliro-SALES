"use client";

import { useState } from "react";
import {
  CreditCard,
  Check,
  Edit2,
  Plus,
  Trash2,
  Users,
  ShieldCheck,
  Save,
  CheckCircle2,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  badge: string;
  description: string;
  pricePerSeat: number;
  maxSeatsText: string;
  features: string[];
  isPopular?: boolean;
  active: boolean;
}

export default function SaasAdminPlanosPage() {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: "plan_basic",
      name: "Basic",
      badge: "Pequenas Equipes",
      description: "Ideal para distribuidoras que estão iniciando a digitalização da equipe externa.",
      pricePerSeat: 140,
      maxSeatsText: "Até 5 vendedores de rua",
      features: [
        "Aplicativo Modo Rua Completo (PWA)",
        "Gestão de Rotas & Clientes em Sequência",
        "Fechamento Anti-Fraude com Hash",
        "Formas de Pagamento: Pix, Dinheiro e A Prazo",
        "Suporte Comercial via WhatsApp",
      ],
      isPopular: false,
      active: true,
    },
    {
      id: "plan_premium",
      name: "Premium",
      badge: "Mais Escolhido • Alta Escala",
      description: "Para empresas que precisam de escala total, múltiplos supervisores e conciliação.",
      pricePerSeat: 110,
      maxSeatsText: "Vendedores ilimitados (A partir de 6)",
      features: [
        "Tudo incluso do Plano Basic",
        "Vendedores e Rotas Ilimitadas",
        "Múltiplos Supervisores e Permissões Avançadas",
        "Módulo de Conciliação Financeira Completo",
        "Exportação de Relatórios Gerenciais",
        "Backup Automatizado em Nuvem",
        "Suporte Prioritário VIP",
      ],
      isPopular: true,
      active: true,
    },
  ]);

  // Modal de Edição de Plano
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formName, setFormName] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPricePerSeat, setFormPricePerSeat] = useState(120);
  const [formMaxSeatsText, setFormMaxSeatsText] = useState("");
  const [formFeatures, setFormFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [formIsPopular, setFormIsPopular] = useState(false);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  const handleOpenEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormName(plan.name);
    setFormBadge(plan.badge);
    setFormDescription(plan.description);
    setFormPricePerSeat(plan.pricePerSeat);
    setFormMaxSeatsText(plan.maxSeatsText);
    setFormFeatures([...plan.features]);
    setFormIsPopular(!!plan.isPopular);
    setNewFeatureText("");
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormFeatures([...formFeatures, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    setPlans((prev) =>
      prev.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: formName,
              badge: formBadge,
              description: formDescription,
              pricePerSeat: Number(formPricePerSeat),
              maxSeatsText: formMaxSeatsText,
              features: formFeatures,
              isPopular: formIsPopular,
            }
          : p
      )
    );

    setSaveSuccessMsg(`Plano ${formName} atualizado com sucesso!`);
    setEditingPlan(null);
    setTimeout(() => {
      setSaveSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Clean Light */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Tabela de Preços & Licenciamento
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Planos Comerciais (Basic & Premium)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Defina o valor cobrado por vendedor de rua (*seat*) e customize os benefícios de cada plano.
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 shadow-xs animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <span className="text-sm font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Grid com os 2 Planos Editáveis (Basic & Premium) - Clean Light */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isHighlight = plan.isPopular;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border p-8 flex flex-col justify-between shadow-sm relative transition hover:shadow-md ${
                isHighlight
                  ? "border-2 border-indigo-500 bg-indigo-50/20"
                  : "border-slate-200"
              }`}
            >
              {isHighlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full shadow-xs">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {!isHighlight && (
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                        {plan.badge}
                      </span>
                    )}
                    <h3 className="text-2xl font-black text-slate-900 mt-2">{plan.name}</h3>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold border border-slate-200 transition"
                  >
                    <Edit2 size={13} />
                    <span>Editar Plano</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                {/* Preço por Vendedor */}
                <div className="mt-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-black text-slate-900">
                      R$ {plan.pricePerSeat.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">/ vendedor / mês</span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mt-1 flex items-center gap-1">
                    <Users size={14} />
                    <span>{plan.maxSeatsText}</span>
                  </p>
                </div>

                {/* Benefícios Inclusos */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    O que está incluso:
                  </p>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-700">
                        <Check size={16} className="text-emerald-600 mr-2.5 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Botão Inferior de Edição Rápida */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">Plano Ativo no Sistema</span>
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>Configurar Detalhes</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE EDIÇÃO DE PLANO */}
      {editingPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Editar Plano {editingPlan.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Altere nome, valor por vendedor e itens inclusos na assinatura.
                </p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nome do Plano
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Preço / Vendedor (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={formPricePerSeat}
                    onChange={(e) => setFormPricePerSeat(Number(e.target.value))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Selo / Badge
                </label>
                <input
                  type="text"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="Ex: Mais Escolhido"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Texto de Capacidade
                </label>
                <input
                  type="text"
                  value={formMaxSeatsText}
                  onChange={(e) => setFormMaxSeatsText(e.target.value)}
                  placeholder="Ex: Até 5 vendedores de rua"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Descrição Curta
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Lista de Recursos / Benefícios */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Benefícios Inclusos no Plano ({formFeatures.length})
                </label>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {formFeatures.map((feat, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <span className="text-slate-800">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-slate-400 hover:text-rose-600 transition ml-2"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="Adicionar novo benefício..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Destacar como "Mais Popular"</span>
                </label>

                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlan(null)}
                    className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
