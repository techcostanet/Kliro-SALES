"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Percent,
  Calendar,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  adminEmail: string;
  phone: string;
  planName: string;
  seats: number;
  pricePerSeat: number;
  discountAmount: number;
  monthlyPrice: number;
  dueDay: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export default function SaasAdminClientesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: "tenant_luke_001",
      name: "LUKE Brasil Alimentos",
      cnpj: "00.000.000/0001-00",
      adminEmail: "admin@luke.com",
      phone: "(11) 98765-4321",
      planName: "Professional",
      seats: 15,
      pricePerSeat: 126.0,
      discountAmount: 0.0,
      monthlyPrice: 1890.0,
      dueDay: 10,
      status: "ACTIVE",
      createdAt: "23/08/2026",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formCnpj, setFormCnpj] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPlan, setFormPlan] = useState("Personalizado");
  const [formSeats, setFormSeats] = useState(10);
  const [formPricePerSeat, setFormPricePerSeat] = useState(120.0);
  const [formDiscount, setFormDiscount] = useState(0.0);
  const [formDueDay, setFormDueDay] = useState(10);

  // Cálculo Dinâmico do Preço Final
  const calculatedBase = formSeats * formPricePerSeat;
  const calculatedFinal = Math.max(0, calculatedBase - formDiscount);

  const resetForm = () => {
    setFormName("");
    setFormCnpj("");
    setFormEmail("");
    setFormPhone("");
    setFormPlan("Personalizado");
    setFormSeats(10);
    setFormPricePerSeat(120.0);
    setFormDiscount(0.0);
    setFormDueDay(10);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setFormName(tenant.name);
    setFormCnpj(tenant.cnpj);
    setFormEmail(tenant.adminEmail);
    setFormPhone(tenant.phone);
    setFormPlan(tenant.planName);
    setFormSeats(tenant.seats);
    setFormPricePerSeat(tenant.pricePerSeat);
    setFormDiscount(tenant.discountAmount);
    setFormDueDay(tenant.dueDay);
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: formName,
      cnpj: formCnpj || "00.000.000/0000-00",
      adminEmail: formEmail,
      phone: formPhone || "-",
      planName: formPlan,
      seats: Number(formSeats),
      pricePerSeat: Number(formPricePerSeat),
      discountAmount: Number(formDiscount),
      monthlyPrice: calculatedFinal,
      dueDay: Number(formDueDay),
      status: "ACTIVE",
      createdAt: "Hoje",
    };

    setTenants((prev) => [...prev, newTenant]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    setTenants((prev) =>
      prev.map((t) =>
        t.id === editingTenant.id
          ? {
              ...t,
              name: formName,
              cnpj: formCnpj,
              adminEmail: formEmail,
              phone: formPhone,
              planName: formPlan,
              seats: Number(formSeats),
              pricePerSeat: Number(formPricePerSeat),
              discountAmount: Number(formDiscount),
              monthlyPrice: calculatedFinal,
              dueDay: Number(formDueDay),
            }
          : t
      )
    );
    setEditingTenant(null);
    resetForm();
  };

  const handleToggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : t
      )
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingTenant) return;
    setTenants((prev) => prev.filter((t) => t.id !== deletingTenant.id));
    setDeletingTenant(null);
  };

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header Clean Light */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gestão de Clientes & Contratos
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Cadastre, edite planos, ajuste descontos ou gerencie o status das empresas parceiras.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
        >
          <Plus size={18} />
          <span>Cadastrar Novo Cliente</span>
        </button>
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, e-mail ou CNPJ..."
              className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            {filtered.length} cliente(s) listado(s)
          </span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Empresa / Cliente</th>
                <th className="p-4">Admin & Contato</th>
                <th className="p-4">Vendedores Contratados</th>
                <th className="p-4">Valor / Desconto</th>
                <th className="p-4">Mensalidade Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-extrabold text-indigo-700 text-sm shadow-xs">
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">{tenant.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {tenant.cnpj}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-600">
                    <div className="space-y-0.5">
                      <p className="font-medium text-xs text-slate-800 flex items-center gap-1">
                        <Mail size={12} className="text-slate-400" />
                        <span>{tenant.adminEmail}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{tenant.phone}</span>
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                      <Users size={16} className="text-indigo-600" />
                      <span>{tenant.seats} Vendedores</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      R$ {tenant.pricePerSeat.toFixed(2).replace(".", ",")}/vendedor
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="text-xs text-slate-600 block">
                      Base: R$ {(tenant.seats * tenant.pricePerSeat).toFixed(2).replace(".", ",")}
                    </span>
                    {tenant.discountAmount > 0 ? (
                      <span className="text-[11px] font-bold text-emerald-600 block">
                        - R$ {tenant.discountAmount.toFixed(2).replace(".", ",")} desc.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 block">Sem desconto</span>
                    )}
                  </td>

                  <td className="p-4">
                    <span className="font-black text-slate-900 text-base">
                      R$ {tenant.monthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Vencimento: Todo dia {tenant.dueDay}
                    </span>
                  </td>

                  <td className="p-4">
                    {tenant.status === "ACTIVE" ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Inativo
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right space-x-1.5">
                    {/* Botão Editar */}
                    <button
                      onClick={() => handleOpenEdit(tenant)}
                      className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 transition shadow-2xs"
                      title="Editar Cliente"
                    >
                      <Edit2 size={15} />
                    </button>

                    {/* Botão Inativar/Ativar */}
                    <button
                      onClick={() => handleToggleStatus(tenant.id)}
                      className={`p-2 rounded-lg border transition shadow-2xs ${
                        tenant.status === "ACTIVE"
                          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                      title={tenant.status === "ACTIVE" ? "Inativar Cliente" : "Ativar Cliente"}
                    >
                      {tenant.status === "ACTIVE" ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>

                    {/* Botão Excluir */}
                    <button
                      onClick={() => setDeletingTenant(tenant)}
                      className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition shadow-2xs"
                      title="Excluir Cliente"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRAR NOVO CLIENTE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Cadastrar Nova Empresa</h3>
                <p className="text-xs text-slate-500">
                  Preencha os dados contratuais e defina os valores por vendedor e descontos.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Distribuidora Alvorada Ltda"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    CNPJ / CPF
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Telefone de Contato
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@empresa.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bloco de Precificação Flexível */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>Precificação Flexível & Licenciamento</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nº Vendedores
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formSeats}
                      onChange={(e) => setFormSeats(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Preço / Vendedor (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formPricePerSeat}
                      onChange={(e) => setFormPricePerSeat(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Desconto Aplicado (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500">Dia de Vencimento:</span>
                    <select
                      value={formDueDay}
                      onChange={(e) => setFormDueDay(Number(e.target.value))}
                      className="ml-2 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800"
                    >
                      <option value={5}>Todo dia 05</option>
                      <option value={10}>Todo dia 10</option>
                      <option value={15}>Todo dia 15</option>
                      <option value={20}>Todo dia 20</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Mensalidade Final:</span>
                    <span className="text-lg font-black text-slate-900">
                      R$ {calculatedFinal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Salvar e Ativar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CLIENTE */}
      {editingTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">Editar Cliente</h3>
                <p className="text-xs text-slate-500">
                  Atualize os dados ou altere o plano e descontos de {editingTenant.name}.
                </p>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nome da Empresa
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    CNPJ / CPF
                  </label>
                  <input
                    type="text"
                    value={formCnpj}
                    onChange={(e) => setFormCnpj(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Bloco de Precificação Flexível */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>Ajuste de Licenças e Descontos</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Nº Vendedores
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formSeats}
                      onChange={(e) => setFormSeats(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Preço / Vendedor (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={formPricePerSeat}
                      onChange={(e) => setFormPricePerSeat(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Desconto (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formDiscount}
                      onChange={(e) => setFormDiscount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-xs text-slate-500">Dia de Vencimento:</span>
                    <select
                      value={formDueDay}
                      onChange={(e) => setFormDueDay(Number(e.target.value))}
                      className="ml-2 px-2 py-1 bg-white border border-slate-200 rounded-md text-xs font-bold text-slate-800"
                    >
                      <option value={5}>Todo dia 05</option>
                      <option value={10}>Todo dia 10</option>
                      <option value={15}>Todo dia 15</option>
                      <option value={20}>Todo dia 20</option>
                    </select>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Nova Mensalidade:</span>
                    <span className="text-lg font-black text-slate-900">
                      R$ {calculatedFinal.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Atualizar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {deletingTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-6 space-y-5 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Excluir Cliente</h3>
              <p className="text-xs text-slate-500">
                Tem certeza que deseja excluir <strong>{deletingTenant.name}</strong>? Esta ação removerá o registro cadastral da empresa do seu painel.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setDeletingTenant(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
