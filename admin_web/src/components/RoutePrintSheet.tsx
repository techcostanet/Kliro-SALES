"use client";

import React, { useMemo } from "react";
import { ScheduledRouteEvent, MASTER_ROUTES_CATALOG } from "@/lib/routesCatalog";
import initialClients from "@/lib/clients_catalog.json";
import { formatCurrency } from "@/lib/formatters";

interface ClientCatalogItem {
  id: string;
  routeId: string;
  order: number;
  code: string;
  name: string;
  buyer?: string;
  phone?: string;
  address?: string;
  conferenceInfo?: string;
  notes?: string;
}

interface RoutePrintSheetProps {
  mode: "VENDOR_ROUTE" | "AGENDA_SCHEDULE";
  event?: ScheduledRouteEvent | null;
  eventsList?: ScheduledRouteEvent[];
  selectedDate?: string;
  periodLabel?: string;
  companyInfo?: {
    tradeName?: string;
    name?: string;
    cnpj?: string;
    phone?: string;
    address?: string;
    logoUrl?: string;
  };
}

export default function RoutePrintSheet({
  mode,
  event,
  eventsList = [],
  selectedDate,
  periodLabel,
  companyInfo,
}: RoutePrintSheetProps) {
  const company = {
    tradeName: companyInfo?.tradeName || "LUKE Brasil",
    name: companyInfo?.name || "LUKE Brasil Cosméticos & Distribuição Profissional LTDA",
    cnpj: companyInfo?.cnpj || "34.892.123/0001-90",
    phone: companyInfo?.phone || "(31) 3344-5566",
    address: companyInfo?.address || "Av. Afonso Pena, 1500 - Galpão 03 - Centro, Belo Horizonte - MG",
    logoUrl: companyInfo?.logoUrl || "/images/luke-logo.png",
  };

  // Buscar clientes associados à rota
  const routeClients = useMemo(() => {
    if (!event) return [];
    const code = event.routeCode.trim().toUpperCase();
    const subCodes = code.split("+").map((s) => s.trim());

    const catalog = initialClients as ClientCatalogItem[];
    const matched = catalog.filter((c) => {
      const rId = (c.routeId || "").trim().toUpperCase();
      return subCodes.includes(rId) || rId === code || subCodes.some((sc) => rId.startsWith(sc));
    });

    // Ordenar por ordem de visita
    matched.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Se a lista tiver menos de 10 clientes (ex: rotas novas, combinadas ou repasses),
    // preencher com linhas em branco para anotação a caneta na rua
    const minRows = Math.max(matched.length, event.totalClients || 15);
    const result: (ClientCatalogItem | null)[] = [...matched];
    while (result.length < minRows && result.length < 35) {
      result.push(null);
    }

    return result;
  }, [event]);

  // Formatar data DD/MM/AAAA
  const formatDateBR = (dStr?: string) => {
    if (!dStr) return "";
    const parts = dStr.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dStr;
  };

  // =========================================================================
  // MODO 1: FICHA DE ROTEIRO DO VENDEDOR (FOLHA DE CAMPO / ROMANEIO DE VISITAS)
  // =========================================================================
  if (mode === "VENDOR_ROUTE" && event) {
    const formattedDate = formatDateBR(event.date);

    return (
      <div className="bg-white text-black p-6 font-sans text-xs leading-normal max-w-4xl mx-auto printable-sheet">
        {/* Cabeçalho Corporativo com Logomarca */}
        <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.tradeName}
                className="h-10 max-w-[140px] object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : null}
            <div>
              <h1 className="text-base font-black uppercase tracking-tight text-black">
                {company.tradeName} &bull; Distribuição
              </h1>
              <p className="text-[10px] text-gray-700 leading-none">
                {company.name} | CNPJ: {company.cnpj}
              </p>
              <p className="text-[10px] text-gray-600 leading-none mt-0.5">
                {company.address} | Tel: {company.phone}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block bg-black text-white text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
              Roteiro de Campo do Vendedor
            </span>
            <p className="text-[10px] text-gray-600 mt-1 font-mono">
              Emissão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Informações da Rota e Vendedor (Box de Destaque) */}
        <div className="grid grid-cols-4 gap-2 border border-black bg-gray-50 p-3 rounded mb-4 text-[11px]">
          <div>
            <span className="block text-[9px] uppercase font-bold text-gray-600">Vendedor Responsável</span>
            <span className="font-black text-sm text-black">{event.vendorName}</span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-gray-600">Código da Rota</span>
            <span className="font-black text-sm text-black font-mono">
              {event.routeCode}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-gray-600">Data de Execução</span>
            <span className="font-black text-sm text-black font-mono">
              {formattedDate}
            </span>
          </div>
          <div>
            <span className="block text-[9px] uppercase font-bold text-gray-600">Meta de Atendimento</span>
            <span className="font-black text-sm text-black">
              {event.totalClients} clientes {event.totalSales ? `| Meta: ${formatCurrency(event.totalSales)}` : ""}
            </span>
          </div>
          <div className="col-span-3 pt-1 border-t border-gray-300">
            <span className="text-[10px] font-bold text-gray-700">Nome da Rota / Região: </span>
            <span className="font-semibold text-black">{event.routeName}</span>
          </div>
          <div className="col-span-1 pt-1 border-t border-gray-300 text-right">
            <span className="text-[10px] font-bold text-gray-700">Status: </span>
            <span className="font-bold text-black uppercase">
              {event.status === "COMPLETED" ? "Concluída" : event.status === "IN_PROGRESS" ? "Em Rota" : "Agendada"}
            </span>
          </div>

          {event.notes && (
            <div className="col-span-4 bg-yellow-50 border border-yellow-300 p-1.5 rounded mt-1 text-[10px]">
              <span className="font-bold text-amber-900">⚠️ Instrução / Observação Especial da Rota: </span>
              <span className="text-gray-900">{event.notes}</span>
            </div>
          )}
        </div>

        {/* Tabela de Roteiro de Clientes para Visita */}
        <div className="mb-4 overflow-hidden border border-black rounded">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-gray-200 border-b border-black text-black font-bold uppercase text-[9px]">
                <th className="p-1.5 border-r border-gray-400 w-7 text-center">#</th>
                <th className="p-1.5 border-r border-gray-400 w-12 text-center">Cód.</th>
                <th className="p-1.5 border-r border-gray-400 min-w-[130px]">Cliente / Razão Social</th>
                <th className="p-1.5 border-r border-gray-400 min-w-[90px]">Comprador / Contato</th>
                <th className="p-1.5 border-r border-gray-400 min-w-[150px]">Endereço / Bairro</th>
                <th className="p-1.5 border-r border-gray-400 w-24">Condição</th>
                <th className="p-1.5 border-r border-gray-400 w-10 text-center">Visita</th>
                <th className="p-1.5 border-r border-gray-400 w-24 text-right">Venda R$</th>
                <th className="p-1.5 min-w-[100px]">Anotações / Obs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {routeClients.map((client, index) => {
                const rowNum = index + 1;
                if (!client) {
                  // Linha em branco para preenchimento manual de novos clientes pelo vendedor
                  return (
                    <tr key={`blank-${index}`} className="h-7 hover:bg-gray-50 print-avoid-break">
                      <td className="p-1 border-r border-gray-300 text-center font-bold text-gray-500 font-mono">
                        {rowNum}
                      </td>
                      <td className="p-1 border-r border-gray-300 text-center text-gray-400 font-mono">
                        ---
                      </td>
                      <td className="p-1 border-r border-gray-300 text-gray-400 italic">
                        (Cliente adicional no campo)
                      </td>
                      <td className="p-1 border-r border-gray-300"></td>
                      <td className="p-1 border-r border-gray-300"></td>
                      <td className="p-1 border-r border-gray-300"></td>
                      <td className="p-1 border-r border-gray-300 text-center">
                        <span className="inline-block w-3.5 h-3.5 border border-black rounded-xs"></span>
                      </td>
                      <td className="p-1 border-r border-gray-300 text-right font-mono">R$ _______</td>
                      <td className="p-1"></td>
                    </tr>
                  );
                }

                return (
                  <tr key={client.id || index} className="h-6 hover:bg-gray-50 print-avoid-break">
                    <td className="p-1 border-r border-gray-300 text-center font-bold font-mono text-black">
                      {client.order || rowNum}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-center font-mono font-bold text-gray-800">
                      {client.code}
                    </td>
                    <td className="p-1 border-r border-gray-300 font-bold text-black truncate max-w-[150px]">
                      {client.name}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-gray-800">
                      <div className="font-semibold">{client.buyer || "---"}</div>
                      {client.phone && <div className="text-[8.5px] text-gray-600">{client.phone}</div>}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-gray-700 leading-tight">
                      {client.address || "---"}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-[8.5px] font-semibold text-gray-800">
                      {client.conferenceInfo || "Padrão"}
                    </td>
                    <td className="p-1 border-r border-gray-300 text-center">
                      <span className="inline-block w-3.5 h-3.5 border border-black rounded-xs"></span>
                    </td>
                    <td className="p-1 border-r border-gray-300 text-right font-mono text-gray-500">
                      R$ _______
                    </td>
                    <td className="p-1 text-gray-400 text-[8.5px]">
                      {client.notes ? client.notes : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Resumo e Fechamento Operacional da Rota */}
        <div className="border border-black bg-gray-50 p-3 rounded text-[10px] print-avoid-break">
          <div className="font-bold uppercase text-black border-b border-gray-300 pb-1 mb-2 flex justify-between items-center">
            <span>Fechamento da Rota de Campo</span>
            <span className="text-[9px] font-normal text-gray-600">
              Total de Paradas Previstas: <strong>{routeClients.length}</strong>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-3">
            <div className="border border-gray-300 bg-white p-2 rounded">
              <span className="block text-gray-600 text-[9px] uppercase font-bold">Clientes Atendidos</span>
              <span className="font-mono text-xs font-bold">[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ] clientes</span>
            </div>
            <div className="border border-gray-300 bg-white p-2 rounded">
              <span className="block text-gray-600 text-[9px] uppercase font-bold">Não Atendidos / Fechados</span>
              <span className="font-mono text-xs font-bold">[ &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ] clientes</span>
            </div>
            <div className="border border-gray-300 bg-white p-2 rounded">
              <span className="block text-gray-600 text-[9px] uppercase font-bold">Total Vendas em Pedidos</span>
              <span className="font-mono text-xs font-bold">R$ ____________________</span>
            </div>
            <div className="border border-gray-300 bg-white p-2 rounded">
              <span className="block text-gray-600 text-[9px] uppercase font-bold">Total Cobranças / Recebidos</span>
              <span className="font-mono text-xs font-bold">R$ ____________________</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-gray-300 mt-2">
            <div className="text-center">
              <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
              <span className="text-[9px] uppercase font-bold text-gray-800">
                Assinatura do Vendedor: {event.vendorName}
              </span>
            </div>
            <div className="text-center">
              <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
              <span className="text-[9px] uppercase font-bold text-gray-800">
                Visto da Supervisão / Expedição LUKE
              </span>
            </div>
          </div>
        </div>

        {/* Rodapé institucional */}
        <div className="text-center text-[8px] text-gray-500 mt-3">
          LUKE Brasil &bull; Sistema de Gestão de Vendas e Distribuição Kliro-SALES &bull; Página 1 de 1
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODO 2: IMPRESSÃO DA AGENDA / CRONOGRAMA DE ROTAS (MÊS / SEMANA / LISTA)
  // =========================================================================
  const sortedEvents = [...eventsList].sort((a, b) => a.date.localeCompare(b.date));
  const totalVisits = sortedEvents.reduce((acc, curr) => acc + (curr.totalClients || 0), 0);
  const totalSalesExpected = sortedEvents.reduce((acc, curr) => acc + (curr.totalSales || 0), 0);

  return (
    <div className="bg-white text-black p-6 font-sans text-xs leading-normal max-w-4xl mx-auto printable-sheet">
      {/* Cabeçalho */}
      <div className="border-b-2 border-black pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt={company.tradeName}
              className="h-10 max-w-[140px] object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          )}
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-black">
              {company.tradeName} &bull; Distribuição
            </h1>
            <p className="text-[10px] text-gray-700 leading-none">
              Cronograma & Agenda Operacional de Rotas
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block bg-black text-white text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
            {periodLabel || "Agenda de Rotas"}
          </span>
          <p className="text-[10px] text-gray-600 mt-1 font-mono">
            Emissão: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      {/* Métricas do Período */}
      <div className="grid grid-cols-4 gap-2 border border-black bg-gray-50 p-3 rounded mb-4 text-[11px]">
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600">Total de Rotas Escaladas</span>
          <span className="font-black text-sm text-black">{sortedEvents.length} rotas</span>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600">Total de Visitas Previstas</span>
          <span className="font-black text-sm text-black">{totalVisits} visitas</span>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600">Vendedores Escalados</span>
          <span className="font-black text-sm text-black">
            {Array.from(new Set(sortedEvents.map((e) => e.vendorName))).join(", ") || "---"}
          </span>
        </div>
        <div>
          <span className="block text-[9px] uppercase font-bold text-gray-600">Previsão Faturamento</span>
          <span className="font-black text-sm text-black">
            {totalSalesExpected > 0 ? formatCurrency(totalSalesExpected) : "---"}
          </span>
        </div>
      </div>

      {/* Tabela da Agenda */}
      <div className="mb-4 overflow-hidden border border-black rounded">
        <table className="w-full text-left border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-200 border-b border-black text-black font-bold uppercase text-[9px]">
              <th className="p-2 border-r border-gray-400 w-24">Data</th>
              <th className="p-2 border-r border-gray-400 w-16 text-center">Código</th>
              <th className="p-2 border-r border-gray-400 min-w-[160px]">Rota / Região</th>
              <th className="p-2 border-r border-gray-400 min-w-[100px]">Vendedor</th>
              <th className="p-2 border-r border-gray-400 w-20 text-center">Clientes</th>
              <th className="p-2 border-r border-gray-400 w-24 text-right">Faturamento</th>
              <th className="p-2 border-r border-gray-400 w-24 text-center">Status</th>
              <th className="p-2 min-w-[120px]">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {sortedEvents.map((ev) => (
              <tr key={ev.id} className="hover:bg-gray-50 print-avoid-break">
                <td className="p-1.5 border-r border-gray-300 font-mono font-bold text-black">
                  {formatDateBR(ev.date)}
                </td>
                <td className="p-1.5 border-r border-gray-300 font-mono font-black text-center">
                  {ev.routeCode}
                </td>
                <td className="p-1.5 border-r border-gray-300 font-bold text-black">
                  {ev.routeName}
                </td>
                <td className="p-1.5 border-r border-gray-300 font-bold text-gray-900">
                  {ev.vendorName}
                </td>
                <td className="p-1.5 border-r border-gray-300 text-center font-mono">
                  {ev.totalClients} cli
                </td>
                <td className="p-1.5 border-r border-gray-300 text-right font-mono font-bold">
                  {ev.totalSales && ev.totalSales > 0 ? formatCurrency(ev.totalSales) : "---"}
                </td>
                <td className="p-1.5 border-r border-gray-300 text-center font-bold text-[9px]">
                  {ev.status === "COMPLETED" ? "CONCLUÍDA" : ev.status === "IN_PROGRESS" ? "EM ROTA" : "AGENDADA"}
                </td>
                <td className="p-1.5 text-gray-600 text-[9px]">
                  {ev.notes || "---"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assinaturas de Conferência */}
      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray-400 mt-4 print-avoid-break">
        <div className="text-center">
          <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
          <span className="text-[9px] uppercase font-bold text-gray-800">
            Supervisor de Logística e Distribuição
          </span>
        </div>
        <div className="text-center">
          <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
          <span className="text-[9px] uppercase font-bold text-gray-800">
            Diretoria Comercial &bull; LUKE Brasil
          </span>
        </div>
      </div>

      <div className="text-center text-[8px] text-gray-500 mt-4">
        LUKE Brasil &bull; Sistema de Gestão de Vendas e Distribuição Kliro-SALES
      </div>
    </div>
  );
}
