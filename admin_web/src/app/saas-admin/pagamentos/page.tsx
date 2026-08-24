"use client";

import { useState } from "react";
import {
  Wallet,
  QrCode,
  FileText,
  CreditCard,
  CheckCircle2,
  Lock,
  Unlock,
  Settings,
  Save,
  Key,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";

export default function SaasAdminPagamentosPage() {
  // Configuração Pix
  const [pixEnabled, setPixEnabled] = useState(true);
  const [pixProvider, setPixProvider] = useState("asaas");
  const [pixKeyType, setPixKeyType] = useState("CNPJ");
  const [pixKey, setPixKey] = useState("00.000.000/0001-00");
  const [pixApiKey, setPixApiKey] = useState("$aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ=");
  const [pixWebhook, setPixWebhook] = useState("https://kliro-sales.web.app/api/webhooks/pix");

  // Configuração Boleto Bancário
  const [boletoEnabled, setBoletoEnabled] = useState(true);
  const [boletoProvider, setBoletoProvider] = useState("asaas");
  const [boletoDaysToDue, setBoletoDaysToDue] = useState(5);
  const [boletoFinePercent, setBoletoFinePercent] = useState(2.0);
  const [boletoInterestPercent, setBoletoInterestPercent] = useState(1.0);
  const [boletoInstructions, setBoletoInstructions] = useState(
    "Não receber após 30 dias de atraso. Juros de 1% ao mês."
  );

  // Configuração Cartão de Crédito
  const [cardEnabled, setCardEnabled] = useState(true);
  const [cardProvider, setCardProvider] = useState("mercadopago");
  const [cardPublicKey, setCardPublicKey] = useState("APP_USR-88291039-4820-4100-bc12-99018401");
  const [cardSecretKey, setCardSecretKey] = useState("APP_USR-77301020-0012-9940-a100-88402910");
  const [cardMaxInstallments, setCardMaxInstallments] = useState(12);
  const [cardPassFeeToCustomer, setCardPassFeeToCustomer] = useState(false);

  // Feedback State
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Clean Light */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Gateways Financeiros & Recebimento
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Métodos de Pagamento & Configurações
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Configure credenciais de API, chaves Pix, regras de boletos e cartões para cobrança dos clientes SaaS.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
        >
          <Save size={18} />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-3 shadow-xs animate-fadeIn">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">Configurações salvas com sucesso!</p>
            <p className="text-xs text-emerald-700">
              As novas chaves de API e regras de pagamento foram atualizadas no sistema.
            </p>
          </div>
        </div>
      )}

      {/* Grid com os 3 Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. PIX */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 space-y-5">
            {/* Header do Card */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-2xs">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Pix Instantâneo</h3>
                  <p className="text-xs text-slate-500">Liquidação imediata</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPixEnabled(!pixEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  pixEnabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {pixEnabled ? "Ativo" : "Inativo"}
              </button>
            </div>

            {/* Campos de Configuração */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Provedor de Gateway
                </label>
                <select
                  value={pixProvider}
                  onChange={(e) => setPixProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="asaas">Asaas Pagamentos (Recomendado)</option>
                  <option value="mercadopago">Mercado Pago</option>
                  <option value="efi">Efí Bank (Gerencianet)</option>
                  <option value="openpix">OpenPix</option>
                  <option value="direct">Chave Pix Direta (Sem Gateway)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tipo & Chave Pix
                </label>
                <div className="flex gap-2">
                  <select
                    value={pixKeyType}
                    onChange={(e) => setPixKeyType(e.target.value)}
                    className="w-1/3 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CNPJ">CNPJ</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Telefone">Telefone</option>
                    <option value="Aleatória">EVP / Chave Aleatória</option>
                  </select>
                  <input
                    type="text"
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    className="w-2/3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Chave Pix"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  API Key / Token do Provedor
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={pixApiKey}
                    onChange={(e) => setPixApiKey(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  URL de Notificação (Webhook)
                </label>
                <input
                  type="text"
                  value={pixWebhook}
                  onChange={(e) => setPixWebhook(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Taxa Média:</span>
            <span className="font-bold text-teal-700">R$ 0,99 por Pix recebido</span>
          </div>
        </div>

        {/* 2. BOLETO BANCÁRIO */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 space-y-5">
            {/* Header do Card */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Boleto Bancário</h3>
                  <p className="text-xs text-slate-500">Cobrança corporativa</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBoletoEnabled(!boletoEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  boletoEnabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {boletoEnabled ? "Ativo" : "Inativo"}
              </button>
            </div>

            {/* Campos de Configuração */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Emissor de Boleto
                </label>
                <select
                  value={boletoProvider}
                  onChange={(e) => setBoletoProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="asaas">Asaas (Boleto Híbrido com Pix QR Code)</option>
                  <option value="itau">Banco Itaú Empresas</option>
                  <option value="bb">Banco do Brasil API</option>
                  <option value="bradesco">Bradesco Shopfácil</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Dias p/ Vencimento
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={boletoDaysToDue}
                    onChange={(e) => setBoletoDaysToDue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Multa por Atraso (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={boletoFinePercent}
                    onChange={(e) => setBoletoFinePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Juros Mensais (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={boletoInterestPercent}
                  onChange={(e) => setBoletoInterestPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Instruções Impressas no Boleto
                </label>
                <input
                  type="text"
                  value={boletoInstructions}
                  onChange={(e) => setBoletoInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Compensação:</span>
            <span className="font-bold text-amber-700">D+1 após pagamento</span>
          </div>
        </div>

        {/* 3. CARTÃO DE CRÉDITO */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-6 space-y-5">
            {/* Header do Card */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shadow-2xs">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Cartão de Crédito</h3>
                  <p className="text-xs text-slate-500">Recorrência automática</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCardEnabled(!cardEnabled)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  cardEnabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                {cardEnabled ? "Ativo" : "Inativo"}
              </button>
            </div>

            {/* Campos de Configuração */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Adquirente / Gateway
                </label>
                <select
                  value={cardProvider}
                  onChange={(e) => setCardProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="mercadopago">Mercado Pago Gateway</option>
                  <option value="stripe">Stripe Payments (Internacional/Brasil)</option>
                  <option value="asaas">Asaas Recorrência</option>
                  <option value="cielo">Cielo E-commerce 3.0</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Public Key (Cliente)
                </label>
                <input
                  type="text"
                  value={cardPublicKey}
                  onChange={(e) => setCardPublicKey(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Secret Key (Servidor)
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={cardSecretKey}
                    onChange={(e) => setCardSecretKey(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Parcelas Máximas
                  </label>
                  <select
                    value={cardMaxInstallments}
                    onChange={(e) => setCardMaxInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>1x (À vista)</option>
                    <option value={3}>Até 3x</option>
                    <option value={6}>Até 6x</option>
                    <option value={12}>Até 12x</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center space-x-2 text-xs text-slate-700 font-medium cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={cardPassFeeToCustomer}
                      onChange={(e) => setCardPassFeeToCustomer(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Repassar taxas</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Recorrência:</span>
            <span className="font-bold text-purple-700">Cobrança Automática Ativa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
