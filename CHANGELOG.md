# Changelog - Kliro-SALES

Todas as melhorias, novidades e correções notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]

## [1.4.0] - 2026-08-26
### Added
- **Multi-Marcas & Gestão de Imagens no Catálogo de Produtos (`/luke/produtos`)**:
  - Suporte completo a **múltiplas marcas** parceiras (ex: *LUKE Brasil, Alfa Look's, FOX For Men, QOD Barber Shop, Prohall, Wilkinson / Derby*).
  - Suporte a **fotos e imagens de produtos** (`imageUrl`), com pré-visualização em miniatura (*thumbnail*) na listagem e campo de URL com preview dinâmico no modal de cadastro.
  - Filtro exclusivo por Marca no topo do catálogo de produtos.
  - Integração das fotos e badges de marcas no seletor de pedidos do **Modo Rua** (`/luke/rua`).
- **Dashboard Executivo com Novos KPIs de Gestão (`/luke`)**:
  - **KPIs Financeiros:** Faturamento Bruto (R$ 58.420,00), Ticket Médio por Salão (R$ 347,70), Contas a Receber P.A. (R$ 5.430,00), Contas a Pagar (R$ 3.745,00) e Saldo Líquido Positivo no Caixa (R$ 54.675,00).
  - **Cobertura Operacional:** Salões Atendidos (168 / 559 salões no ciclo), Veículos em Campo (3 frotas ativas) e Taxa de Positivação (91,2%).
  - **Ranking de Vendedores:** Metas individuais, faturamento de rota e comissões de Alisson, Alexandre e Lucas com barra de progresso.
  - **Top 5 Produtos Mais Vendidos:** Giro de unidades e faturamento por produto cosmético com imagens.
  - **Alerta de Ruptura de Estoque:** Monitoramento de produtos abaixo do estoque mínimo.

## [1.3.1] - 2026-08-26
### Fixed
- **Estabilidade da Página de Vendedores (`/luke/vendedores`)**:
  - Limpeza e reconstrução do componente eliminando duplicatas de bloco que causavam instabilidade de renderização no navegador.
  - Correção do redirecionamento do botão de logout no layout da LUKE para a página inicial `/`.

## [1.3.0] - 2026-08-26
### Added
- **Módulo Completo de Salões & Clientes de Rota (`/luke/clientes`)**:
  - Carga inicial com a base real completa de **559 salões de beleza e barbearias** extraídos da planilha operacional da LUKE Brasil (`clients_catalog.json`).
  - Campos cadastrais completos: Nome da Barbearia/Salão, Comprador Responsável, CNPJ/CPF, Telefone/WhatsApp, Rota associada (R1-R12, F1-F12), Ordem de Visitação na rota, Condição Comercial (*Prazo 30 Dias, Consignado, Compra Lâmina, Intermitente, À Vista*), Limite de Crédito P.A., Endereço Completo e Status.
  - Filtros interativos por Rota, Condição Comercial, Status e busca em tempo real.
  - Modal completo de criação, edição e inativação de salões com sincronização no Firestore (`/tenants/tenant_luke_001/clients`).
- **Gestão Completa de Vendedores & Correção do Botão (`/luke/vendedores`)**:
  - Correção e ativação funcional do botão "Novo Vendedor" com abertura de modal interativo e salvamento em tempo real.
  - Cadastro da equipe oficial da LUKE: Lucas (Admin/Vendedor), Sabrina (Admin Financeiro/Operacional), Alexandre (Vendedor Rota F), Alisson (Vendedor Rota R).
  - Campos de Perfil de Acesso, Telefone/WhatsApp, Veículo de Entrega & Placa, Percentual de Comissão (%), Rotas Atribuídas e Meta Mensal de Faturamento (R$).
  - Sincronização automática com Firestore (`/tenants/tenant_luke_001/users`).
- **Módulo Financeiro Completo & DRE Operacional (`/luke/financeiro`)**:
  - **Aba Contas a Pagar**: Lançamento de despesas operacionais da distribuidora (Alimentação Rota, Salários/Comissões, Fornecedores/Fábrica, Combustível, Aluguel Galpão, Pró-Labore), vencimento, recorrência mensal e ação de **Dar Baixa (Registrar Pagamento)**.
  - **Aba Contas a Receber & P.A. (Pagamentos Agendados de Barbearias)**: Controle de vendas a prazo e boletos emitidos em campo. Ação **"Receber P.A. (Baixar)"** que alimenta automaticamente o Caixa diário na data real e na forma recebida (Pix, Dinheiro, Cartão), mantendo a atribuição da comissão ao vendedor de origem.
  - **Aba DRE & Fluxo Operacional**: Demonstrativo financeiro simplificado (Entradas de Vendas na Rota + P.A.s Liquidados vs Despesas Pagas), saldo operacional líquido e alinhamento com o ciclo semanal da LUKE (*Terça-feira ➔ Segunda-feira*).
  - **Aba Categorias Financeiras**: Gestão das 20 categorias do plano de contas da distribuidora.
- **Navegação Expandida (`/luke/layout.tsx`)**:
  - Adição dos novos links "Salões & Clientes" e "Financeiro & DRE" na barra de navegação da LUKE.

  - **Identidade Visual Clean Light na Entrada (`/`)**:
    - Aplicação de estética em tons claros institucionais (Slate 50, White, Índigo corporativo) com card suave e moderno.
    - O isolamento de identidade da marca LUKE (paleta escura e dourada) permanece exclusivo dentro do portal `/luke` e `/luke/rua`.
  - **Eliminação Completa do Seletor de Perfis**:
    - Remoção dos botões de alternância "SaaS Master" / "Cliente LUKE", unificando o formulário para um padrão profissional global.
  - **Roteamento Inteligente Automático (Role-Based Routing)**:
    - O sistema identifica automaticamente o perfil do usuário logado:
      - Administrador Master (`contato@techcosta.net` ou `@techcosta.net`) $\rightarrow$ redirecionado diretamente para `/saas-admin`.
      - Usuários e gestores de clientes parceiros (ex: `admin@luke.com`, `alisson@luke.com`) $\rightarrow$ redirecionados diretamente para o painel da empresa (`/luke`).
      - Suporte dinâmico para novos tenants através de `user_mappings` no Firestore.
  - **Mapeamento & Normalização de Produtos (`src/lib/products_catalog.json`)**:
    - Leitura, extração e normalização integral dos **46 produtos** oficiais da LUKE Brasil a partir da planilha `Backup Carregamento Alisson.xlsx`.
    - Organização em 8 categorias comerciais (Pomadas & Ceras, Barba & Barbearia, Géis Fixadores, Finalizadores & Tratamentos, Lavatório & Cuidados, Perfumaria, Alisamentos & Química, Kits de Tratamento e Acessórios).
    - Definição completa de campos: ID (`PROD-001` a `PROD-046`), Nome, Categoria, Unidade/Apresentação, Preço de Tabela, Preço de Custo, Código de Barras EAN-13, Estoque Mínimo, Estoque Físico, Reservado, Disponível e Flag de Bloqueio de Carga.
  - **Catálogo Interativo de Produtos (`/luke/produtos` & `/dashboard/produtos`)**:
    - Listagem completa dos 46 produtos com filtros rápidos por categoria, busca textual em tempo real e controle de status.
    - Sincronização em lote em 1 clique com o Firestore (`/tenants/tenant_luke_001/products`).
    - Modal de cadastro e edição de produtos com todos os campos cadastrais e operacionais.
  - **Novo Módulo Digital de Carregamento (`/luke/carregamento`)**:
    - Substituição completa das 20 abas manuais do Excel por interface dinâmica e responsiva.
    - Controle por Ciclo de Carregamento (1 a 20) com seleção do Vendedor Responsável (Alisson, Alexandre, Lucas), Data e Status de Aprovação.
    - Tabela de 46 itens com campos de Aprovação individual, Quantidade Solicitada, Quantidade de Carregamento e Devolução.
    - Cálculo automático em tempo real de **Distribuído Líquido** (`Carregado - Devolvido`) e Faturamento Estimado da carga.
    - Aba **Resumo Consolidado do Mês** totalizando automaticamente todas as 20 cargas do período.
  - **Integração com Modo Rua (`/luke/rua` & `/rua`)**:
    - Seletor de produtos com busca instantânea e catálogo completo dos 46 itens para pedidos durante os atendimentos nas barbearias.
  - **Carga Inicial Automatizada (`/seed`)**:
    - Gravação em lote de todos os 46 produtos no Firestore durante o setup inicial.
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
