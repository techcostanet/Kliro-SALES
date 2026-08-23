# Firestore Schema - LUKE Brasil SaaS (Multi-Tenant)

A modelagem no Firestore será orientada a leitura (Read-optimized), garantindo que os painéis web sejam muito rápidos e que o aplicativo móvel offline consuma apenas os dados do respectivo `tenant`.

## Coleção Raiz: `tenants`
Representa as empresas que assinaram o seu SaaS.
- **Path:** `/tenants/{tenantId}`
- **Campos:**
  - `name`: string
  - `cnpj`: string
  - `active`: boolean
  - `createdAt`: timestamp

---
*Todas as coleções abaixo são Sub-coleções dentro de um `tenant`, garantindo isolamento total por empresa.*

## Sub-Coleção: `users`
Usuários (Vendedores, Supervisores) que trabalham na empresa.
- **Path:** `/tenants/{tenantId}/users/{userId}` (O `userId` será o UID do Firebase Auth)
- **Campos:**
  - `name`: string
  - `role`: string (ADMIN, SUPERVISOR, VENDOR)
  - `email`: string
  - `active`: boolean

## Sub-Coleção: `products`
Catálogo de produtos da empresa.
- **Path:** `/tenants/{tenantId}/products/{productId}`
- **Campos:**
  - `name`: string
  - `price`: number (double)
  - `barcode`: string
  - `active`: boolean

## Sub-Coleção: `clients`
Clientes que os vendedores visitam nas rotas.
- **Path:** `/tenants/{tenantId}/clients/{clientId}`
- **Campos:**
  - `name`: string
  - `document`: string (CPF/CNPJ)
  - `address`: string
  - `location`: GeoPoint (Latitude/Longitude)

## Sub-Coleção: `routes`
As rotas de visitação configuradas pela empresa.
- **Path:** `/tenants/{tenantId}/routes/{routeId}`
- **Campos:**
  - `name`: string
  - `dayOfWeek`: number (0 a 6)
  - `vendorId`: string (referência ao documento do user)
  - `clientIds`: array of strings (Lista de clientes a visitar nesta rota)

## Sub-Coleção: `route_executions`
Abertura e fechamento de uma rota pelo vendedor no "Modo Rua".
- **Path:** `/tenants/{tenantId}/route_executions/{executionId}`
- **Campos:**
  - `routeId`: string
  - `vendorId`: string
  - `status`: string ('OPEN', 'CLOSED')
  - `openedAt`: timestamp
  - `closedAt`: timestamp (null se aberta)
  - `auditHash`: string (null se aberta - gerado pelo Cloud Function no fechamento)

## Sub-Coleção: `transactions`
Vendas, devoluções e recebimentos (Pix/Dinheiro) feitos dentro de uma rota.
- **Path:** `/tenants/{tenantId}/transactions/{transactionId}`
- **Campos:**
  - `executionId`: string (A qual ciclo de rota pertence)
  - `clientId`: string
  - `productId`: string (pode ser null se for apenas recebimento)
  - `type`: string ('SALE', 'RETURN', 'PAYMENT')
  - `paymentMethod`: string ('CASH', 'PIX', 'TICKET')
  - `amount`: number (double)
  - `quantity`: number (int)
  - `receiptUrl`: string (Link da foto no Storage)
  - `timestamp`: timestamp
