"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ActivityLogItem } from "@/lib/activityLogger";
import { formatDateTimeBR } from "@/lib/formatters";

export default function LukeLogsPage() {
  const tenantId = "tenant_luke_001";
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, `tenants/${tenantId}/activity_logs`),
        orderBy("timestamp", "desc"),
        limit(200)
      );
      const snap = await getDocs(q);
      const items: ActivityLogItem[] = [];
      snap.forEach((d) => {
        items.push({ id: d.id, ...d.data() } as ActivityLogItem);
      });
      setLogs(items);
    } catch (e: any) {
      console.warn("Logs fallback:", e?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        l.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.action?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEntity = entityFilter === "ALL" || l.entity === entityFilter;
      const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
      return matchesSearch && matchesEntity && matchesAction;
    });
  }, [logs, searchTerm, entityFilter, actionFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-gold/20 text-brand-gold rounded-xl border border-brand-gold/30">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-brand-offwhite tracking-tight">
                Logs de Atividades do Sistema
              </h2>
              <p className="text-brand-offwhite/60 text-xs mt-0.5">
                Auditoria completa e imutável de todas as ações executadas por todos os usuários do SaaS.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchLogs}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-graphite border border-brand-blue/40 text-brand-offwhite/80 hover:text-brand-gold rounded-xl text-xs font-bold transition shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Atualizar Logs</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-brand-graphite p-4 rounded-xl border border-brand-blue/30 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-brand-offwhite/40" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuário, e-mail, ação ou descrição da alteração..."
            className="w-full pl-9 pr-3 py-2 bg-brand-black border border-brand-blue/40 rounded-lg text-xs text-brand-offwhite focus:outline-none focus:border-brand-gold"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
          >
            <option value="ALL">Todas as Entidades</option>
            <option value="CLIENTE">Clientes</option>
            <option value="ROTA">Rotas</option>
            <option value="USUARIO">Usuários</option>
            <option value="CONDICAO_PAGTO">Condições Pagto</option>
            <option value="PRODUTO">Produtos</option>
            <option value="TRANSACAO">Transações</option>
            <option value="FINANCEIRO">Financeiro</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-brand-black border border-brand-blue/40 text-brand-offwhite text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-brand-gold"
          >
            <option value="ALL">Todas as Ações</option>
            <option value="CLIENTE_CRIADO">Cliente Criado</option>
            <option value="CLIENTE_EDITADO">Cliente Editado</option>
            <option value="CLIENTE_EXCLUIDO">Cliente Excluído</option>
            <option value="USUARIO_CRIADO">Usuário Criado</option>
            <option value="USUARIO_EDITADO">Usuário Editado</option>
            <option value="ROTA_CRIADA">Rota Criada</option>
            <option value="ROTA_EDITADA">Rota Editada</option>
            <option value="VENDA_REALIZADA">Venda Realizada</option>
          </select>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-brand-graphite rounded-xl border border-brand-blue/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-blue/20 border-b border-brand-blue/30 text-brand-offwhite/70 uppercase tracking-wider font-bold">
                <th className="p-3.5">Data & Horário</th>
                <th className="p-3.5">Responsável</th>
                <th className="p-3.5">Ação Executada</th>
                <th className="p-3.5">Módulo / Entidade</th>
                <th className="p-3.5">Detalhamento da Alteração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-blue/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-brand-offwhite/40 italic">
                    {loading ? "Carregando histórico de atividades..." : "Nenhuma atividade registrada encontrada."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id || Math.random().toString()} className="hover:bg-brand-blue/5 transition">
                    <td className="p-3.5 font-mono text-brand-offwhite/60 whitespace-nowrap">
                      {formatDateTimeBR(l.timestamp)}
                    </td>
                    <td className="p-3.5 font-bold text-brand-offwhite whitespace-nowrap">
                      <div>
                        <p>{l.userName}</p>
                        <p className="text-[10px] font-mono text-brand-offwhite/40 font-normal">{l.userEmail}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-brand-blue/20 text-brand-gold rounded font-mono font-bold text-[10px]">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-brand-black/60 rounded text-[10px] font-bold text-brand-offwhite/70 border border-brand-blue/30">
                        {l.entity}
                      </span>
                    </td>
                    <td className="p-3.5 text-brand-offwhite/90">
                      {l.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
