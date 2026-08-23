"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Shield, User } from "lucide-react";

export default function LukeVendedoresPage() {
  const [vendedores, setVendedores] = useState([
    { id: "1", name: "Carlos Eduardo", email: "carlos@luke.com", role: "VENDOR", status: "ACTIVE" },
    { id: "2", name: "Marcos Souza", email: "marcos@luke.com", role: "VENDOR", status: "ACTIVE" },
    { id: "3", name: "Fernanda Lima", email: "fernanda@luke.com", role: "SUPERVISOR", status: "ACTIVE" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filtered = vendedores.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-brand-offwhite">Equipe Comercial</h2>
          <p className="text-brand-offwhite/60 text-sm mt-1">
            Vendedores de rua e supervisores da LUKE Brasil.
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-brand-gold text-brand-black px-4 py-2.5 rounded-xl font-extrabold hover:bg-yellow-500 transition shadow-lg text-sm">
          <Plus size={18} />
          <span>Novo Vendedor</span>
        </button>
      </div>

      <div className="bg-brand-graphite rounded-2xl border border-brand-blue/30 shadow-lg overflow-hidden">
        <div className="p-4 border-b border-brand-blue/30 flex justify-between items-center bg-brand-black/50">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-brand-offwhite/40" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-brand-black border border-brand-blue/50 rounded-lg text-sm text-brand-offwhite placeholder-brand-offwhite/30 focus:outline-none focus:ring-1 focus:ring-brand-gold"
              placeholder="Buscar por nome ou e-mail..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-blue/10 border-b border-brand-blue/30 text-brand-offwhite/70 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Nome</th>
                <th className="p-4 font-medium">E-mail</th>
                <th className="p-4 font-medium">Cargo</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10 text-sm">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-brand-blue/5 transition group">
                  <td className="p-4 text-brand-offwhite font-semibold flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/30 flex items-center justify-center text-brand-gold">
                      {user.role === "SUPERVISOR" ? <Shield size={16} /> : <User size={16} />}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="p-4 text-brand-offwhite/70">{user.email}</td>
                  <td className="p-4 text-brand-offwhite/70">
                    {user.role === "SUPERVISOR" ? "Supervisor" : "Vendedor Externo (Modo Rua)"}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full border border-green-500/20">
                      Ativo
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button className="text-brand-offwhite/50 hover:text-brand-gold transition">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-brand-offwhite/50 hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
