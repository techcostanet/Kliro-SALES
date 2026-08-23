# Changelog - Kliro-SALES

Todas as melhorias, novidades e correções notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]
### Added
- **Fase 4: Modo Rua Mobile (PWA & Flutter)**:
  - Interface otimizada para smartphones em `/rua` com fluxo completo de visitas, pedidos com catálogo/carrinho, formas de pagamento (Pix, Dinheiro, A Prazo) e fechamento anti-fraude com hash de auditoria.
  - Código-fonte nativo Flutter estruturado em `mobile/` (`pubspec.yaml`, `main.dart`, `firestore_service.dart`, `modo_rua_screen.dart`).
- **Painel Admin**:
  - Tela de Gestão e Acompanhamento de Rotas em tempo real (`/dashboard/rotas`).
  - Tela de Transações Financeiras e Conciliações (`/dashboard/transacoes`).
  - Acesso direto ao Modo Rua no menu lateral do Dashboard.
- **Infraestrutura**:
  - Configuração do Firebase Hosting e deploy automático de produção.
  - Regras de segurança Multi-Tenant e modelo de dados NoSQL documentado.
