# Changelog - Kliro-SALES

Todas as melhorias, novidades e correções notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]
### Added
- **Fase 4: Modo Rua Mobile (PWA & Flutter)**:
  - Interface otimizada para smartphones em `/rua` com fluxo completo de visitas, pedidos com catálogo/carrinho, formas de pagamento (Pix, Dinheiro, A Prazo) e fechamento anti-fraude com hash de auditoria.
  - Código-fonte nativo Flutter estruturado em `mobile/` (`pubspec.yaml`, `main.dart`, `firestore_service.dart`, `modo_rua_screen.dart`).
- **Fase 7: Roteamento Dinâmico Multi-Tenant (`/[tenant]` e `/[tenant]/rua`)**:
  - Arquitetura de URLs personalizadas por empresa cliente (White-Label):
    - Cliente LUKE: `https://kliro-sales.web.app/luke` (Painel) e `https://kliro-sales.web.app/luke/rua` (Modo Rua).
    - Sub-rotas dinâmicas: `/luke/produtos`, `/luke/vendedores`, `/luke/rotas`, `/luke/transacoes`.
    - Portal SaaS Super Admin acessível em `https://kliro-sales.web.app/saas-admin`.
- **Fase 6: Portal Master de Gestão do SaaS (Super Admin)**:
  - Portal de Administração Central em `/saas-admin` com identidade visual clean e moderna (Slate/Indigo/Emerald), totalmente independente das cores dos clientes.
  - Dashboard Executivo com indicadores de MRR, ARR, GMV transacionado e licenças ativas de vendedores.
  - Gestão de Clientes Multi-Tenant em `/saas-admin/clientes` com a LUKE Brasil como cliente 01 e modal de provisionamento de novas empresas com 1 clique.
  - Gestão de Planos & Preços e Simulador Comercial em `/saas-admin/planos`.
- **Painel Admin do Cliente (LUKE)**:
  - Tela de Gestão e Acompanhamento de Rotas em tempo real (`/dashboard/rotas`).
  - Tela de Transações Financeiras e Conciliações (`/dashboard/transacoes`).
  - Acesso direto ao Modo Rua no menu lateral do Dashboard.
- **Infraestrutura (100% Plano Spark Gratuito)**:
  - Migração completa para o plano gratuito Spark sem necessidade de cartão de crédito.
  - Segurança e anti-fraude integrados nativamente nas `firestore.rules` (bloqueio de transações e rotas fechadas sem custo de Cloud Functions).
  - Deploy de produção no Firebase Hosting e sincronização contínua com o GitHub.
