"use client";

import { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  Users,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MoreVertical,
  KeyRound,
  Calendar,
  Lock,
  Unlock,
} from "lucide-react";
import Link from "next/link";

interface Tenant {
  id: string;
  name: string;
  cnpj: string;
  adminEmail: string;
  plan: "Starter" | "Professional" | "Enterprise";
  seats: number;
  monthlyPrice: number;
  status: "ACTIVE" | "SUSPENDED" | "TRIAL";
  renewalDate: string;
  createdAt: string;
}

export default function SaasAdminClientesPage() {
  const [tenants, setTenants] = useState<Tenant[]>([
    {
      id: "tenant_luke_001",
      name: "LUKE Brasil Alimentos",
      cnpj: "00.000.000/0001-00",
      adminEmail: "admin@luke.com",
      plan: "Enterprise",
      seats: 15,
      monthlyPrice: 1890.0,
      status: "ACTIVE",
      renewalDate: "23/09/2026",
      createdAt: "23/08/2026",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State para Novo Tenant
  const [newName, setNewName] = useState("");
  const [newCnpj, setNewCnpj] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState<"Starter" | "Professional" | "Enterprise">("Professional");
  const [newSeats, setNewSeats] = useState(10);
  const [newPrice, setNewPrice] = useState(1290.0);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: newName,
      cnpj: newCnpj || "00.000.000/0000-00",
      adminEmail: newEmail,
      plan: newPlan,
      seats: Number(newSeats),
      monthlyPrice: Number(newPrice),
      status: "ACTIVE",
      renewalDate: "30 dias",
      createdAt: "Hoje",
    };

    setTenants((prev) => [...prev, newTenant]);
    setIsModalOpen(false);
    setNewName("");
    setNewCnpj("");
    setNewEmail("");
  };

  const handleToggleStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" }
          : t
      )
    );
  };

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Clientes Corporativos (Tenants)
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie todas as empresas que possuem licença do sistema Kliro-SALES.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold transition shadow-lg shadow-indigo-600/30 text-sm"
        >
          <Plus size={18} />
          <span>Cadastrar Nova Empresa</span>
        </button>
      </div>

      {/* Tabela de Tenants */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
        {/* Barra de Busca */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, e-mail ou CNPJ..."
              className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:block">
            {filtered.length} empresa(s) cadastrada(s)
          </span>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Empresa / Tenant</th>
                <th className="p-4">Admin Responsável</th>
                <th className="p-4">Plano</th>
                <th className="p-4">Licenças</th>
                <th className="p-4">Mensalidade</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filtered.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 text-sm">
                        {tenant.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white leading-tight">{tenant.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {tenant.cnpj}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-300">
                    <p className="font-medium text-xs text-slate-200">{tenant.adminEmail}</p>
                    <p className="text-[11px] text-slate-400">Criado em: {tenant.createdAt}</p>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {tenant.plan}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center space-x-1.5 font-bold text-slate-200">
                      <Users size={16} className="text-slate-400" />
                      <span>{tenant.seats} Vendedores</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-black text-emerald-400">
                      R$ {tenant.monthlyPrice.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] text-slate-400 block">/mês</span>
                  </td>

                  <td className="p-4">
                    {tenant.status === "ACTIVE" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                        Suspenso
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-right space-x-2">
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700"
                      title="Entrar no Painel do Cliente"
                    >
                      <span>Entrar</span>
                      <ExternalLink size={12} />
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(tenant.id)}
                      className={`p-1.5 rounded-lg border text-xs transition ${
                        tenant.status === "ACTIVE"
                          ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                      }`}
                      title={tenant.status === "ACTIVE" ? "Suspender Acesso" : "Reativar Acesso"}
                    >
                      {tenant.status === "ACTIVE" ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRAR NOVO TENANT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-700 p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-white">Cadastrar Nova Empresa (Tenant)</h3>
                <p className="text-xs text-slate-400">
                  Provisione o ambiente Multi-Tenant e crie a conta de acesso da empresa.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Distribuidora Alvorada Ltda"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    CNPJ
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={newCnpj}
                    onChange={(e) => setNewCnpj(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    E-mail do Administrador
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@empresa.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Plano
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e: any) => setNewPlan(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Licenças (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newSeats}
                    onChange={(e) => setNewSeats(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/30"
                >
                  Criar e Ativar Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
