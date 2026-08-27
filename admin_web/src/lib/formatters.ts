/**
 * Utilitários de Formatação para o Padrão Brasileiro (pt-BR)
 * Sistema Kliro-SALES
 */

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value.replace(/[^\d.-]/g, "")) || 0 : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
}

export function formatNumberBR(value: number | string | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || value === "") return "0";
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(isNaN(num) ? 0 : num);
}

export function formatDateBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--/--/----";
  try {
    if (typeof dateInput === "string") {
      // Se for formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
        const [year, month, day] = dateInput.split("T")[0].split("-");
        return `${day}/${month}/${year}`;
      }
      // Se já estiver em DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}/.test(dateInput)) {
        return dateInput.split(" ")[0];
      }
    }
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

export function formatDateTimeBR(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "--/--/---- --:--";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return String(dateInput);
  }
}

export function cleanPhoneDigits(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function formatPhoneBR(phone: string | null | undefined): string {
  const digits = cleanPhoneDigits(phone);
  if (!digits) return "";
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length > 11 && digits.startsWith("55")) {
    const sub = digits.slice(2);
    if (sub.length === 11) {
      return `+55 (${sub.slice(0, 2)}) ${sub.slice(2, 7)}-${sub.slice(7)}`;
    }
    if (sub.length === 10) {
      return `+55 (${sub.slice(0, 2)}) ${sub.slice(2, 6)}-${sub.slice(6)}`;
    }
  }
  return phone || "";
}

/**
 * Gera link oficial para o WhatsApp com DDI 55 garantido
 */
export function getWhatsAppLink(phone: string | null | undefined, message?: string): string {
  const digits = cleanPhoneDigits(phone);
  if (!digits) return "#";
  
  let fullNumber = digits;
  // Se tiver 10 ou 11 dígitos (DDD + número), prefixa com 55 (Brasil)
  if (digits.length === 10 || digits.length === 11) {
    fullNumber = `55${digits}`;
  } else if (digits.length === 8 || digits.length === 9) {
    // Caso raro de número sem DDD (assume padrão 31 de Minas Gerais ou apenas 55)
    fullNumber = `5531${digits}`;
  }
  
  const baseUrl = `https://wa.me/${fullNumber}`;
  if (message) {
    return `${baseUrl}?text=${encodeURIComponent(message)}`;
  }
  return baseUrl;
}
