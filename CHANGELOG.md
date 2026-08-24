# Changelog - Kliro-SALES

Todas as melhorias, novidades e correções notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]
### Added
- **Fase 9: Métodos de Pagamento, 2 Planos Editáveis (Basic/Premium) & Credenciais Master**:
  - **Rebranding Master**: Atualização da assinatura corporativa para **Tech Costa Systems**.
  - **Gestão de Métodos de Pagamento (`/saas-admin/pagamentos`)**:
    - Suporte a configuração de **Pix Instantâneo**, **Boleto Bancário** e **Cartão de Crédito**.
    - Configurações completas de gateways (Asaas, Mercado Pago, Efí, Stripe), chaves de API, webhooks, regras de juros/multa e limites de parcelamento.
  - **Planos Comerciais Clean & Editáveis (`/saas-admin/planos`)**:
    - Estruturação em 2 planos objetivos: **Basic** e **Premium**.
    - Modal de edição completo para alterar preços por vendedor, textos, selos e benefícios inclusos em cada plano.
    - Remoção do bloco de simulação de preços conforme especificação.
  - **Autenticação do Administrador Master**:
    - Criação e ativação da conta Master `contato@techcosta.net` com senha `T3chCost@10`.
    - Tela de login dedicada `/saas-admin/login` e redirecionamento inteligente no login principal.
- **Fase 8: Redesign Clean/Claro do Super Admin & CRUD Completo de Clientes**:
  - **Identidade Visual Clean & Clara**: Redesign completo do portal `/saas-admin`, `/saas-admin/clientes` e `/saas-admin/planos` utilizando paleta ultra-limpa (Slate/White/Indigo/Emerald).
  - **Isolamento de Acesso**: Remoção completa de atalhos e links para acesso ao sistema interno dos clientes a partir do painel do SaaS Master.
  - **CRUD Completo de Empresas/Clientes**:
    - Criação de novas empresas com dados cadastrais completos (Nome, CNPJ, E-mail Admin, Telefone).
    - Edição integral de contratos e licenças de clientes existentes.
    - Ativação e Inativação de clientes com 1 clique (alternância de status e bloqueio).
    - Exclusão de clientes com modal de confirmação e segurança.
  - **Precificação Flexível por Vendedor & Descontos**:
    - Cobrança modelada na quantidade de vendedores (seats), permitindo customização livre de valor unitário por vendedor e aplicação de descontos contratuais.
    - Simulador Comercial e Calculadora de Propostas interativa com cálculo em tempo real de mensalidade e ARR.
- **Fase 7: Roteamento Multi-Tenant Dedicado (`/luke` e `/luke/rua`)**:
  - Arquitetura de URLs dedicadas por empresa cliente (White-Label):
    - Cliente LUKE: `https://kliro-sales.web.app/luke` (Painel) e `https://kliro-sales.web.app/luke/rua` (Modo Rua).
    - Sub-rotas: `/luke/produtos`, `/luke/vendedores`, `/luke/rotas`, `/luke/transacoes`.
    - Portal SaaS Super Admin acessível em `https://kliro-sales.web.app/saas-admin`.
- **Fase 6: Portal Master de Gestão do SaaS (Super Admin)**:
  - Dashboard Executivo com indicadores de MRR, ARR, GMV transacionado e licenças ativas de vendedores.
  - Monitoramento em tempo real de cotas da camada gratuita do Firebase Spark.
- **Fase 4: Modo Rua Mobile (PWA & Flutter)**:
  - Interface otimizada para smartphones em `/rua` e `/luke/rua` com fluxo completo de visitas, catálogo com stepper, formas de pagamento (Pix, Dinheiro, A Prazo) e fechamento anti-fraude com hash de auditoria.
  - Código-fonte nativo Flutter estruturado em `mobile/` (`pubspec.yaml`, `main.dart`, `firestore_service.dart`, `modo_rua_screen.dart`).
- **Infraestrutura (100% Plano Spark Gratuito)**:
  - Segurança e anti-fraude integrados nativamente nas `firestore.rules` (bloqueio de transações e rotas fechadas sem custo de Cloud Functions).
  - Deploy de produção no Firebase Hosting e sincronização contínua com o GitHub.
