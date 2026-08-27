// Catálogo Mestre de Rotas Fixas e Estruturas Operacionais da LUKE Brasil

export interface RouteMaster {
  id: string;
  code: string;
  name: string;
  prefix: "R" | "F" | "G" | "Y" | "ESPECIAL" | "OUTROS";
  defaultVendorName?: string;
  targetClientsCount: number;
  estimatedRevenue: number;
  region: string;
  active: boolean;
}

export const MASTER_ROUTES_CATALOG: RouteMaster[] = [
  // Rotas Prefixo R (Principalmente Alisson / Regiões R)
  { id: "r1", code: "R1", name: "Rota R1 - Centro & Região", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 24, estimatedRevenue: 4800, region: "Centro / Hipercentro", active: true },
  { id: "r2", code: "R2", name: "Rota R2 - Zona Sul", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 22, estimatedRevenue: 5100, region: "Zona Sul BH", active: true },
  { id: "r3", code: "R3", name: "Rota R3 - Barreiro & Contorno", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 26, estimatedRevenue: 6200, region: "Barreiro / Betim", active: true },
  { id: "r4", code: "R4", name: "Rota R4 - Contagem & Eldorado", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 25, estimatedRevenue: 4900, region: "Contagem", active: true },
  { id: "r5", code: "R5", name: "Rota R5 - Noroeste & Padre Eustáquio", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 23, estimatedRevenue: 4600, region: "Noroeste BH", active: true },
  { id: "r6", code: "R6", name: "Rota R6 - Oeste & Buritis", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 20, estimatedRevenue: 5300, region: "Oeste BH", active: true },
  { id: "r7", code: "R7", name: "Rota R7 - Nova Lima & Alphaville", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 18, estimatedRevenue: 5800, region: "Nova Lima", active: true },
  { id: "r8", code: "R8", name: "Rota R8 - Santa Efigênia & Área Hospitalar", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 24, estimatedRevenue: 4700, region: "Leste Central", active: true },
  { id: "r9", code: "R9", name: "Rota R9 - Vale do Jatobá & Ibirité", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 25, estimatedRevenue: 4400, region: "Ibirité / Sul", active: true },
  { id: "r10", code: "R10", name: "Rota R10 - Ribeirão das Neves", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 22, estimatedRevenue: 4100, region: "Neves", active: true },
  { id: "r11", code: "R11", name: "Rota R11 - Sabará & Caeté", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 19, estimatedRevenue: 3900, region: "Metropolitana Leste", active: true },
  { id: "r12", code: "R12", name: "Rota R12 - Santa Luzia & Região", prefix: "R", defaultVendorName: "Alisson", targetClientsCount: 21, estimatedRevenue: 4300, region: "Santa Luzia", active: true },

  // Rotas Prefixo F (Principalmente Alexandre / Regiões F)
  { id: "f1", code: "F1", name: "Rota F1 - Leste & Savassi", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 20, estimatedRevenue: 4500, region: "Savassi / Leste", active: true },
  { id: "f2", code: "F2", name: "Rota F2 - Pampulha & Norte", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 23, estimatedRevenue: 4200, region: "Pampulha BH", active: true },
  { id: "f3", code: "F3", name: "Rota F3 - Venda Nova & Região", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 25, estimatedRevenue: 4700, region: "Venda Nova", active: true },
  { id: "f4", code: "F4", name: "Rota F4 - Alípio de Melo & Castelo", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 22, estimatedRevenue: 4300, region: "Noroeste", active: true },
  { id: "f5", code: "F5", name: "Rota F5 - São Gabriel & Nordeste", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 21, estimatedRevenue: 3900, region: "Nordeste BH", active: true },
  { id: "f6", code: "F6", name: "Rota F6 - Cidade Nova & União", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 24, estimatedRevenue: 4600, region: "Nordeste Central", active: true },
  { id: "f7", code: "F7", name: "Rota F7 - Pedro II & Carlos Prates", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 20, estimatedRevenue: 4100, region: "Noroeste", active: true },
  { id: "f8", code: "F8", name: "Rota F8 - Gutierrez & Prado", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 22, estimatedRevenue: 5000, region: "Oeste", active: true },
  { id: "f9", code: "F9", name: "Rota F9 - Justinópolis & Norte", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 24, estimatedRevenue: 3800, region: "Norte Grande", active: true },
  { id: "f10", code: "F10", name: "Rota F10 - Lagoa Santa & Confins", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 17, estimatedRevenue: 4900, region: "Vetor Norte", active: true },
  { id: "f11", code: "F11", name: "Rota F11 - Pedro Leopoldo & Matozinhos", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 18, estimatedRevenue: 4600, region: "Vetor Norte", active: true },
  { id: "f12", code: "F12", name: "Rota F12 - Vespasiano & Centro", prefix: "F", defaultVendorName: "Alexandre", targetClientsCount: 22, estimatedRevenue: 4400, region: "Vetor Norte", active: true },

  // Rotas Prefixo G & Y (Rotas Combinadas / Suporte)
  { id: "g1", code: "G1", name: "Rota G1 - Grande BH Expansão 1", prefix: "G", defaultVendorName: "Alexandre", targetClientsCount: 15, estimatedRevenue: 3200, region: "Metropolitana", active: true },
  { id: "g2", code: "G2", name: "Rota G2 - Grande BH Expansão 2", prefix: "G", defaultVendorName: "Alexandre", targetClientsCount: 16, estimatedRevenue: 3400, region: "Metropolitana", active: true },
  { id: "g3", code: "G3", name: "Rota G3 - Grande BH Expansão 3", prefix: "G", defaultVendorName: "Alexandre", targetClientsCount: 15, estimatedRevenue: 3100, region: "Metropolitana", active: true },
  { id: "g4", code: "G4", name: "Rota G4 - Grande BH Expansão 4", prefix: "G", defaultVendorName: "Alexandre", targetClientsCount: 14, estimatedRevenue: 3000, region: "Metropolitana", active: true },
  { id: "y3", code: "Y3", name: "Rota Y3 - Atendimento Especial Norte", prefix: "Y", defaultVendorName: "Alisson", targetClientsCount: 16, estimatedRevenue: 3600, region: "Setor Y", active: true },
  { id: "y4", code: "Y4", name: "Rota Y4 - Atendimento Especial Sul", prefix: "Y", defaultVendorName: "Alisson", targetClientsCount: 15, estimatedRevenue: 3500, region: "Setor Y", active: true },

  // Rotas Especiais e Repasses
  { id: "centro", code: "CENTRO", name: "Rota Especial Hipercentro", prefix: "ESPECIAL", defaultVendorName: "Alisson", targetClientsCount: 28, estimatedRevenue: 6500, region: "Centro BH", active: true },
  { id: "repasse-s", code: "Repasse S", name: "Repasse & Cobrança Setor Sul", prefix: "ESPECIAL", defaultVendorName: "Alisson", targetClientsCount: 18, estimatedRevenue: 2800, region: "Sul", active: true },
  { id: "repasse-c", code: "Repasse C", name: "Repasse & Cobrança Setor Centro", prefix: "ESPECIAL", defaultVendorName: "Alexandre", targetClientsCount: 19, estimatedRevenue: 2900, region: "Centro", active: true },
  { id: "rep-esp", code: "REP", name: "Rota Representação Especial", prefix: "ESPECIAL", defaultVendorName: "Lucas", targetClientsCount: 12, estimatedRevenue: 7500, region: "Contas Chave", active: true },
];

export interface ScheduledRouteEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  routeCode: string;
  routeName: string;
  vendorName: string;
  vendorColor: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  totalClients: number;
  completedVisits?: number;
  totalSales?: number;
  notes?: string;
}
