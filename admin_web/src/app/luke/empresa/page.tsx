"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  User,
  Sparkles,
} from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CompanySettings {
  name: string;
  tradeName: string;
  cnpj: string;
  stateRegistration: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  pixKey: string;
  pixKeyType: string;
  legalRepresentative: string;
  // Endereço Estruturado
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  notes: string;
}

const INITIAL_COMPANY: CompanySettings = {
  name: "LUKE Brasil Cosméticos & Distribuição Profissional LTDA",
  tradeName: "LUKE Brasil",
  cnpj: "34.892.123/0001-90",
  stateRegistration: "003.892.144.0089",
  logoUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80",
  phone: "(31) 3344-5566",
  whatsapp: "(31) 98888-0001",
  email: "contato@luke.com",
  pixKey: "financeiro@luke.com",
  pixKeyType: "E-MAIL",
  legalRepresentative: "Lucas & Sabrina",
  cep: "30140-061",
  street: "Avenida Afonso Pena",
  number: "1500",
  complement: "Galpão 03",
  neighborhood: "Centro",
  city: "Belo Horizonte",
  state: "MG",
  notes: "Distribuição exclusiva de cosméticos para salões de beleza e barbearias.",
};

export default function LukeEmpresaPage() {
  const [formData, setFormData] = useState<CompanySettings>(INITIAL_COMPANY);
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const tenantId = "tenant_luke_001";

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const snap = await getDoc(doc(db, `tenants/${tenantId}/settings`, "company"));
        if (snap.exists()) {
          setFormData({ ...INITIAL_COMPANY, ...snap.data() } as CompanySettings);
        }
      } catch (e: any) {
        console.warn("Firestore company data fallback:", e?.message);
      }
    };
    fetchCompanyData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedMessage(null);

    try {
      await setDoc(doc(db, `tenants/${tenantId}/settings`, "company"), {
        ...formData,
        updatedAt: new Date(),
      });
      // Salva também no documento pai do tenant para leitura rápida
      await setDoc(
        doc(db, "tenants", tenantId),
        {
          name: formData.tradeName || formData.name,
          cnpj: formData.cnpj,
          logoUrl: formData.logoUrl,
          phone: formData.phone,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      setSavedMessage("✅ Dados da empresa e logomarca salvos com sucesso!");
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (err: any) {
      setSavedMessage(`❌ Erro ao salvar: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-3xl font-extrabold text-brand-offwhite">Empresa</h2>
            <span className="bg-brand-gold/20 text-brand-gold text-xs px-2.5 py-1 rounded-full font-bold border border-brand-gold/30">
              Dados Cadastrais
            </span>
          </div>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Logomarca, dados fiscais, endereço central e chaves de recebimento da LUKE Brasil.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 bg-brand-gold text-brand-black px-6 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm"
        >
          <Save size={18} />
          <span>{loading ? "Salvando..." : "Salvar Alterações"}</span>
        </button>
      </div>

      {/* Alerta de Sucesso */}
      {savedMessage && (
        <div className="p-4 rounded-xl bg-brand-graphite border border-brand-gold/50 text-sm text-brand-offwhite flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="text-brand-gold shrink-0" size={20} />
          <span>{savedMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* BLOCO 1: LOGOMARCA E IDENTIDADE */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
            <ImageIcon className="text-brand-gold" size={20} />
            <span>Logomarca da Empresa</span>
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-brand-black border-2 border-dashed border-brand-gold/40 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e: any) => {
                    e.target.src = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80";
                  }}
                />
              ) : (
                <ImageIcon size={36} className="text-brand-offwhite/30" />
              )}
            </div>

            <div className="flex-1 space-y-2 w-full">
              <label className="block text-xs font-semibold text-brand-offwhite/70">
                URL da Logomarca (PNG, JPG ou SVG)
              </label>
              <input
                type="url"
                value={formData.logoUrl || ""}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-brand-black border border-brand-blue/40 rounded-xl text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-mono"
                placeholder="https://suaempresa.com/logo.png"
              />
              <p className="text-[11px] text-brand-offwhite/40">
                Esta logo será exibida nos relatórios, pedidos do Modo Rua e no cabeçalho do painel.
              </p>
            </div>
          </div>
        </div>

        {/* BLOCO 2: DADOS FISCAIS & CONTATOS */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
            <Building2 className="text-brand-gold" size={20} />
            <span>Dados Fiscais & Contatos</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                required
                value={formData.tradeName || ""}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold font-bold text-brand-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj || ""}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={formData.stateRegistration || ""}
                onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Responsáveis / Sócios
              </label>
              <input
                type="text"
                value={formData.legalRepresentative || ""}
                onChange={(e) => setFormData({ ...formData, legalRepresentative: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                WhatsApp Oficial
              </label>
              <input
                type="text"
                value={formData.whatsapp || ""}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Telefone Fixo
              </label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                E-mail Comercial
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* BLOCO 3: ENDEREÇO ESTRUTURADO (CENTRO DE DISTRIBUIÇÃO) */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
            <MapPin className="text-brand-gold" size={20} />
            <span>Endereço Central (Base Operacional)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                CEP
              </label>
              <input
                type="text"
                value={formData.cep || ""}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono focus:outline-none focus:border-brand-gold"
                placeholder="00000-000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Logradouro (Rua / Avenida)
              </label>
              <input
                type="text"
                value={formData.street || ""}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Número
              </label>
              <input
                type="text"
                value={formData.number || ""}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complement || ""}
                onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
                placeholder="Galpão, Sala..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={formData.neighborhood || ""}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Estado (UF)
              </label>
              <input
                type="text"
                maxLength={2}
                value={formData.state || "MG"}
                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite font-mono uppercase focus:outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* BLOCO 4: CHAVE PIX DE RECEBIMENTO */}
        <div className="bg-brand-graphite p-6 rounded-2xl border border-brand-blue/30 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-brand-offwhite flex items-center space-x-2">
            <CreditCard className="text-brand-gold" size={20} />
            <span>Chave Pix de Recebimento de Vendas</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Tipo de Chave Pix
              </label>
              <select
                value={formData.pixKeyType || "E-MAIL"}
                onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-brand-offwhite focus:outline-none focus:border-brand-gold"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="E-MAIL">E-mail</option>
                <option value="TELEFONE">Celular / Telefone</option>
                <option value="ALEATORIA">Chave Aleatória (EVP)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-brand-offwhite/70 mb-1">
                Chave Pix (Usada nos QR Codes do Modo Rua)
              </label>
              <input
                type="text"
                value={formData.pixKey || ""}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full px-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-sm text-teal-400 font-mono font-bold focus:outline-none focus:border-brand-gold"
                placeholder="financeiro@luke.com"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-brand-gold text-brand-black px-8 py-3 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-xl text-base"
          >
            <Save size={20} />
            <span>{loading ? "Salvando..." : "Salvar Dados da Empresa"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
