// Utilitários de cores e paletas para os Vendedores e Rotas da LUKE Brasil / Kliro-SALES

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  lightBgClass: string;
}

export const VENDOR_COLOR_PALETTE: ColorOption[] = [
  {
    id: "emerald",
    name: "Verde Esmeralda",
    hex: "#10b981",
    bgClass: "bg-emerald-600",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-500",
    lightBgClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "sky",
    name: "Azul Céu",
    hex: "#0ea5e9",
    bgClass: "bg-sky-500",
    textClass: "text-sky-700",
    borderClass: "border-sky-500",
    lightBgClass: "bg-sky-50 text-sky-800 border-sky-200",
  },
  {
    id: "indigo",
    name: "Índigo Real",
    hex: "#6366f1",
    bgClass: "bg-indigo-600",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-500",
    lightBgClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  {
    id: "amber",
    name: "Âmbar / Laranja",
    hex: "#f59e0b",
    bgClass: "bg-amber-500",
    textClass: "text-amber-700",
    borderClass: "border-amber-500",
    lightBgClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "rose",
    name: "Coral / Salmão",
    hex: "#f43f5e",
    bgClass: "bg-rose-500",
    textClass: "text-rose-700",
    borderClass: "border-rose-500",
    lightBgClass: "bg-rose-50 text-rose-800 border-rose-200",
  },
  {
    id: "violet",
    name: "Violeta / Roxo",
    hex: "#8b5cf6",
    bgClass: "bg-violet-600",
    textClass: "text-violet-700",
    borderClass: "border-violet-500",
    lightBgClass: "bg-violet-50 text-violet-800 border-violet-200",
  },
  {
    id: "teal",
    name: "Verde Petróleo",
    hex: "#14b8a6",
    bgClass: "bg-teal-600",
    textClass: "text-teal-700",
    borderClass: "border-teal-500",
    lightBgClass: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    id: "slate",
    name: "Cinza Ardósia",
    hex: "#64748b",
    bgClass: "bg-slate-600",
    textClass: "text-slate-700",
    borderClass: "border-slate-500",
    lightBgClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
];

// Mapa padrão de cores conhecidas para vendedores da LUKE
export const DEFAULT_VENDOR_COLORS: Record<string, string> = {
  "Alisson": "#10b981",    // Verde (rotas R)
  "Alexandre": "#0ea5e9",  // Azul (rotas F)
  "Lucas": "#8b5cf6",      // Roxo (rotas especiais/diretoria)
  "Sabrina": "#f59e0b",    // Âmbar (operações/administrativo)
  "Representante": "#64748b",
};

/**
 * Retorna a cor cadastrada para o vendedor ou gera uma consistente baseada no nome
 */
export function getVendorColor(vendorName?: string, customColor?: string): string {
  if (customColor && customColor.startsWith("#")) {
    return customColor;
  }
  if (vendorName && DEFAULT_VENDOR_COLORS[vendorName]) {
    return DEFAULT_VENDOR_COLORS[vendorName];
  }
  if (!vendorName) return "#64748b";

  // Fallback hash consistente
  let hash = 0;
  for (let i = 0; i < vendorName.length; i++) {
    hash = vendorName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % VENDOR_COLOR_PALETTE.length;
  return VENDOR_COLOR_PALETTE[index].hex;
}

/**
 * Retorna estilos CSS inline para exibição de chips e badges com contraste ideal
 */
export function getVendorColorStyles(colorHex: string) {
  return {
    backgroundColor: `${colorHex}15`, // ~8% opacity
    borderColor: `${colorHex}40`,
    color: colorHex,
  };
}

export function getVendorSolidBadgeStyles(colorHex: string) {
  return {
    backgroundColor: colorHex,
    color: "#ffffff",
  };
}
