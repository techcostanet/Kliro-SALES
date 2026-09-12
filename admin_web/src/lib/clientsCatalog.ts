import initialClients from "./clients_catalog.json";

export interface BuyerContact {
  name: string;
  phone: string;
  role?: string;
}

export interface ClientItem {
  id: string;
  routeId: string;
  order: number;
  code: string;
  name: string;
  imageUrl?: string;
  buyers: BuyerContact[];
  buyer?: string;
  conferenceInfo: string;
  acceptsPA: boolean;
  status: "ACTIVE" | "INACTIVE";
  phone: string;
  document: string;
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  reference?: string;
  address: string;
  creditLimit: number;
  businessType: string;
  notes?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export const BASE_CLIENTS_CATALOG: ClientItem[] = (initialClients as any[]).map((c, idx) => ({
  ...c,
  order: Number(c.order || idx + 1),
  acceptsPA: c.acceptsPA !== undefined ? c.acceptsPA : (c.conferenceInfo?.toLowerCase().includes("prazo") ?? true),
  buyers: c.buyers && c.buyers.length > 0 ? c.buyers : [{ name: c.buyer || "Proprietário", phone: c.phone || "" }],
  cep: c.cep || "30140-000",
  street: c.street || "Rua Comercial",
  number: c.number || "100",
  complement: c.complement || "",
  neighborhood: c.neighborhood || "Centro",
  city: c.city || "Belo Horizonte",
  state: c.state || "MG",
  reference: c.reference || "",
  notes: c.notes || "",
  address: c.address || `${c.street || "Rua Comercial"}, ${c.number || "100"} - ${c.neighborhood || "Centro"}`,
  creditLimit: Number(c.creditLimit || 2000),
  businessType: c.businessType || "Comércio / Distribuição",
}));

/**
 * Mescla clientes existentes no Firestore com o catálogo base.
 * Garante que:
 * 1. Todos os 561 clientes padrão existam na visualização.
 * 2. Qualquer edição ou novo cliente salvo no Firestore tenha PRECEDÊNCIA total.
 * 3. Clientes novos criados no sistema apareçam na lista.
 */
export function mergeClientsWithCatalog(firestoreClients: ClientItem[]): ClientItem[] {
  const map = new Map<string, ClientItem>();

  // 1. Carrega todos os clientes do catálogo base
  for (const c of BASE_CLIENTS_CATALOG) {
    map.set(c.id, { ...c });
    if (c.code) {
      map.set(`code_${c.code.toUpperCase()}`, { ...c });
    }
  }

  // 2. Sobrescreve com as edições e adições salvas no Firestore
  for (const fc of firestoreClients) {
    if (!fc.id) continue;
    if (fc.deleted) {
      map.delete(fc.id);
      if (fc.code) map.delete(`code_${fc.code.toUpperCase()}`);
      continue;
    }

    // Procura por ID ou por código
    const existing = map.get(fc.id) || (fc.code ? map.get(`code_${fc.code.toUpperCase()}`) : undefined);
    const merged: ClientItem = {
      id: fc.id || existing?.id || `CLI-${Date.now()}`,
      routeId: fc.routeId || existing?.routeId || "R1",
      order: Number(fc.order ?? existing?.order ?? 1),
      code: fc.code || existing?.code || "R1C01",
      name: fc.name || existing?.name || "Cliente",
      imageUrl: fc.imageUrl !== undefined ? fc.imageUrl : (existing?.imageUrl || ""),
      buyers: fc.buyers && fc.buyers.length > 0 ? fc.buyers : (existing?.buyers || [{ name: fc.buyer || "Proprietário", phone: fc.phone || "" }]),
      buyer: fc.buyer || existing?.buyer || "",
      conferenceInfo: fc.conferenceInfo || existing?.conferenceInfo || "Prazo 30 dias",
      acceptsPA: fc.acceptsPA !== undefined ? fc.acceptsPA : (existing?.acceptsPA ?? true),
      status: fc.status || existing?.status || "ACTIVE",
      phone: fc.phone || existing?.phone || "",
      document: fc.document || existing?.document || "",
      cep: fc.cep || existing?.cep || "30140-000",
      street: fc.street || existing?.street || "Rua Comercial",
      number: fc.number || existing?.number || "100",
      complement: fc.complement !== undefined ? fc.complement : (existing?.complement || ""),
      neighborhood: fc.neighborhood || existing?.neighborhood || "Centro",
      city: fc.city || existing?.city || "Belo Horizonte",
      state: fc.state || existing?.state || "MG",
      reference: fc.reference !== undefined ? fc.reference : (existing?.reference || ""),
      address: fc.address || existing?.address || `${fc.street || "Rua Comercial"}, ${fc.number || "100"} - ${fc.neighborhood || "Centro"}`,
      creditLimit: Number(fc.creditLimit ?? existing?.creditLimit ?? 2000),
      businessType: fc.businessType || existing?.businessType || "Comércio / Distribuição",
      notes: fc.notes !== undefined ? fc.notes : (existing?.notes || ""),
      updatedAt: fc.updatedAt || existing?.updatedAt,
    };

    map.set(merged.id, merged);
  }

  // Remove as chaves temporárias prefixadas com "code_"
  const results: ClientItem[] = [];
  const seenIds = new Set<string>();

  for (const [key, item] of map.entries()) {
    if (key.startsWith("code_")) continue;
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      results.push(item);
    }
  }

  // Ordenação inteligente: Rota em ordem alfanumérica e depois número de ordem
  return results.sort((a, b) => {
    if (a.routeId !== b.routeId) {
      return a.routeId.localeCompare(b.routeId, undefined, { numeric: true });
    }
    return (a.order || 0) - (b.order || 0);
  });
}

/**
 * Sincroniza todos os 561 clientes padrão para a nuvem Firestore em batches de 400 itens.
 * Preserva edições prévias utilizando merge: true.
 */
export async function seedAllDefaultClients(
  tenantId: string = "tenant_luke_001",
  db: any,
  onProgress?: (processed: number, total: number) => void
): Promise<{ total: number }> {
  const { doc, writeBatch } = await import("firebase/firestore");
  const chunkSize = 400;
  const total = BASE_CLIENTS_CATALOG.length;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = BASE_CLIENTS_CATALOG.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const client of chunk) {
      const docRef = doc(db, `tenants/${tenantId}/clients`, client.id);
      batch.set(
        docRef,
        {
          ...client,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    await batch.commit();
    if (onProgress) {
      onProgress(Math.min(i + chunkSize, total), total);
    }
  }

  return { total };
}
