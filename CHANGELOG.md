# Changelog - Kliro-SALES

Todas as melhorias, novidades e correções notáveis deste projeto serão documentadas neste arquivo.

## [Unreleased]

## [1.12.2] - 2026-09-15
### Fixed
- **Persistência e Sobrevivência ao F5 e Troca de Aba (`/luke/financeiro`)**:
  - **Regras de Segurança do Firestore (`firestore.rules`)**: Adicionadas permissões multi-tenant explícitas para a subcoleção `categories` (`/tenants/{tenantId}/categories`) e `loads` (`/tenants/{tenantId}/loads`). A ausência de permissão na subcoleção de categorias fazia o `Promise.all` falhar silenciosamente por `Missing or insufficient permissions`, zerando as despesas em memória ao recarregar a página.
  - **Sincronização em Tempo Real com `onSnapshot`**: Substituição de buscas estáticas `getDocs` por ouvintes em tempo real `onSnapshot` desacoplados para `payables`, `receivables` e `categories`. As despesas agora persistem no cache local (IndexedDB) e são refletidas instantaneamente sem qualquer perda de estado ao pressionar F5 ou navegar entre abas do sistema.
  - **Revalidação Pós-Autenticação (`onAuthStateChanged`)**: Adicionado ouvinte de estado de autenticação do Firebase para garantir que os dados financeiros sejam imediatamente recarregados assim que o token da sessão for restaurado após o refresh (F5).
  - **Tratamento Seguro de Filtros & Busca**: Inclusão de proteção contra valores nulos/indefinidos em `categoryName`, `supplier` e `description` no filtro de busca. Reset automático de `statusFilter` para `ALL` e limpeza de termos de busca ao cadastrar despesas, assegurando visibilidade imediata de despesas pagas e recorrentes.

## [1.12.1] - 2026-09-15
### Fixed
- **Correção no Salvamento de Despesas Pagas no Ato (`/luke/financeiro`)**:
  - Tratamento de serialização profunda no Firestore via `cleanFirestoreData` para impedir que campos `paymentDate` ou `paymentMethod` com valores `undefined` quebrem a chamada `setDoc`.
  - Atribuição automática de status `PAID`, data de liquidação e método de pagamento quando a opção "Esta despesa já foi paga / quitada no ato?" estiver marcada.
- **Correção e Gravação Atômica de Despesas Recorrentes (`/luke/financeiro`)**:
  - Substituição do loop sequencial por `writeBatch(db)` do Firestore, gravando simultaneamente todas as parcelas (2, 3, 6, 12, 24 ou 36 meses).
  - Algoritmo seguro de progressão mensal que evita o clássico problema de overflow do JavaScript `Date` em dias 29, 30 ou 31.
  - Parcela inicial marcada como `PAID` (caso o usuário marque como quitada no ato) e parcelas subsequentes programadas como `PENDING`, garantindo que todas as parcelas sejam salvas no Firestore.
- **Ajuste Dinâmico de Filtro Temporal & Competência**:
  - O seletor de mês e ano agora é inicializado dinamicamente com o mês e ano correntes reais, evitando ocultação de novos lançamentos em telas configuradas para meses anteriores.
  - Sincronização em tempo real entre o campo de Vencimento (`dueDate`) e a Competência (`competence`), garantindo consistência contábil.
  - Ao salvar uma nova despesa ou parcelas recorrentes, o filtro temporal da tela ajusta-se automaticamente para o mês de origem do lançamento, garantindo visualização imediata pelo gestor.

### Added
- **Notificação Visual Flutuante de Confirmação na Nuvem (`ToastFeedback`)**:
  - Integração do componente de toast flutuante com badge animado de sincronização do Firestore (`isCloud: true`, indicador verde pulsante) idêntico ao catálogo de produtos.
  - Alertas em tempo real para cadastro de despesas simples, parcelamento recorrente com resumo de competências, edição, exclusão, liquidação (baixa) e recebimento de títulos.

## [1.12.0] - 2026-09-15
### Added
- **Upload de Imagem de Produtos Direto do Computador (`/luke/produtos`)**:
  - Eliminação definitiva do campo de digitação de URL externa para foto do produto.
  - Adição de botão e área de clique para selecionar arquivos de imagem locais do PC (`.png`, `.jpg`, `.webp`).
  - Otimizador de imagem client-side em HTML5 Canvas que redimensiona para 600px e comprime para formato leve (< 50KB em Base64), garantindo salvamento ágil no Firestore sem exceder cotas.
  - Visualização prévia imediata da foto selecionada e botões para trocar ou remover imagem.
- **Edição e Exclusão Completa no Módulo Financeiro (`/luke/financeiro`)**:
  - **Contas a Pagar (Despesas)**: Botão de edição para atualizar descrição, fornecedor, valor, vencimento, competência e categoria; botão de exclusão direta do documento no Firestore (`tenants/{tenantId}/payables`) com confirmação de segurança.
  - **Contas a Receber (P.A. e Títulos)**: Botão de ação "+ Novo Título / Receber" no cabeçalho; modal completo para cadastrar ou editar cliente, comprador, rota, vendedor, valor com `CurrencyInput`, datas e status; botão de exclusão direta no Firestore (`tenants/{tenantId}/receivables`).
  - **Categorias Financeiras**: Persistência ativa no Firestore (`tenants/{tenantId}/categories`); botão "+ Nova Categoria" com definição de tipo (Despesa ou Receita); botões de editar e excluir categorias individuais nos cards, com atualização em tempo real no seletor de despesas.

### Fixed
- **Seletor de Categoria de Despesas Cross-Browser (Safari & Chrome)**:
  - Resolução da falha de renderização no Safari (macOS e iOS WebKit), onde o elemento `<select>` nativo com fundo escuro e opções filtradas dinamicamente apresentava opções invisíveis ou não abria.
  - Implementação de Dropdown Customizado Clicável em Dark Gold com badges visuais (Despesa / Receita), busca integrada e fechamento automático ao clicar fora.

## [1.11.1] - 2026-09-14
### Changed
- **Eliminação Total de Dados Mock nos Painéis e Cards da Visão Geral (`/luke`)**:
  - Remoção definitiva de todos os números fictícios residuais (R$ 58.420, R$ 347,70, R$ 5.430, 168/559 clientes, 18 cargas, alertas de estoque mock e cálculos de exemplo nos modais de drilldown).
  - Conexão analítica dinâmica e em tempo real da tela de Visão com as coleções oficiais do Firestore (`tenants/tenant_luke_001`):
    - **Faturamento Real**: R$ 0,00 (refletindo exatamente as transações do banco).
    - **Clientes Cadastrados**: 0 clientes (refletindo a base limpa).
    - **Contas a Receber e a Pagar**: R$ 0,00.
    - **Cargas Despachadas**: 0 cargas.
    - **Catálogo de Produtos em Destaque**: Exibição dos **46 produtos reais** cadastrados com fotos, nomes e preços de tabela diretamente na Visão.
    - **Equipe Comercial Ativa**: Listagem dinâmica de vendedores com 0 atendimentos e prontos para novas rotas.
    - **Modais de Detalhamento Limpos**: Todos os 9 modais explicativos (Faturamento, Ticket Médio, A Receber, A Pagar, Caixa, Clientes, Frotas, Positivação, Cargas) agora apresentam estado limpo, amigável e botões de ação para início de operação.
  - Tag visual atualizada para `v1.11.1`.
### Changed
- **Restauração Completa dos Módulos e Barra Lateral com Base Operacional 100% Limpa**:
  - Restauração de todos os 11 menus da barra lateral: **Visão, Clientes, Rotas, Cargas, Financeiro, Transações, Vendedores, Produtos, Empresa, Configurações, Logs** e atalho dedicado para o **Modo Rua**.
  - Logotipo e rota padrão de login apontam normalmente para `/luke`.
  - **Base de Operações 100% Zerada**: Telas de Visão (Dashboard), Transações, Financeiro (Contas a Pagar/Receber) e Rotas iniciam limpas (R$ 0,00 e sem dados falsos de demonstração), prontas para operação real.
  - **Preservação Integral do Catálogo de Produtos**: Todos os 46 produtos oficiais (`tenants/tenant_luke_001/products`) com imagens, códigos de barra, valores e estoque permanecem 100% disponíveis e operacionais.
- **Controle Rigoroso de Cache no Firebase Hosting (`firebase.json`)**:
  - Implementação de cabeçalhos HTTP `Cache-Control: no-cache, no-store, must-revalidate` para rotas de aplicação, prevenindo que o navegador exiba versões anteriores ou em cache de dados.
  - Versão oficial 11 estampada no rodapé de autenticação (`v1.11.0`).

## [1.10.0] - 2026-09-14
### Changed
- **Limpeza Operacional do Banco de Dados Firestore (`klirosales`)**:
  - Exclusão em lote segura e atômica de todas as coleções de movimentação operacional: `clients` (561 clientes de teste), `routes` (36 rotas), `route_schedules`, `route_executions`, `transactions`, `payables`, `receivables`, `payment_terms` e `activity_logs`.
  - **Preservação Integral do Cadastro de Produtos**: Todos os 46 produtos oficiais (`tenants/tenant_luke_001/products`) com fotos de alta qualidade, códigos de barras, preços de venda/custo e regras de estoque foram mantidos 100% intactos e funcionais.
  - Preservação das credenciais de autenticação em `tenants/tenant_luke_001/users` e da infraestrutura de branding da empresa.
- **Blindagem Contra Auto-Seeding Acidental de Dados (`/luke/clientes`, `/luke/rotas`, `/luke/configuracoes`)**:
  - Remoção de gatilhos em segundo plano que re-semeavam coleções automaticamente quando vazias.
  - Telas agora refletem estritamente o estado real do Firestore na nuvem, permitindo que a base permaneça limpa até novos cadastros operacionais.

## [1.9.1] - 2026-09-14
### Added
- **Ampliação da Logomarca na Barra Lateral (`/luke`)**:
  - Expansão do container da logomarca oficial para até 80px de altura (`h-16 sm:h-20`) e 210px de largura com proporção preservada (`object-contain object-left`), tornando o logotipo e a assinatura "DISTRIBUIDORA" destacados e perfeitamente legíveis.
- **Sincronização 100% Online em Tempo Real de Vendedores (`/luke/rotas` & `/luke/vendedores`)**:
  - Implementação de listeners ativos `onSnapshot` conectados diretamente ao Google Cloud Firestore em ambas as telas, garantindo que qualquer vendedor cadastrado ou modificado reflita instantaneamente sem necessidade de recarregar a página.
  - Revalidação instantânea no momento da autenticação (`onAuthStateChanged`) e reconsulta direta ao abrir o modal de agendamento de rotas.
  - Validação amigável de campos no cadastro de vendedores com feedback via Toast informativo.

## [1.9.0] - 2026-09-14
### Added
- **Carregamento Dinâmico de Vendedores na Gestão de Rotas (`/luke/rotas`)**:
  - Consulta em tempo real à coleção Firestore `tenants/${tenantId}/users`, garantindo que novos vendedores cadastrados apareçam instantaneamente no seletor do modal "Nova Rota" e nos filtros do calendário, com suas cores corporativas personalizadas.
- **Componentes de Entrada de Dados Sem Setas Verticais (`CurrencyInput` & `NumberInput`)**:
  - `CurrencyInput`: Máscara financeira em tempo real (`R$ 0,00`) com digitação fluida e conversão numérica transparente.
  - `NumberInput`: Entrada numérica simples com remoção global de setas verticais nativas (*spinbuttons*) para Chrome, Edge, Safari e Firefox via `globals.css`.
  - Aplicados em 10 telas críticas do sistema (Clientes, Vendedores, Produtos, Carregamento, Financeiro, Configurações e SaaS Admin).
- **Diretrizes e Regras do Projeto (`.agents/rules/project-rules.md` e `AGENTS.md`)**:
  - Padronização do protocolo de conclusão: validação de build, versionamento tríplice, commit/push para o GitHub e deploy contínuo para o Firebase Hosting.
  - Regra de busca ativa por melhorias nos planos de implementação (incluídas no final dos planos sob destaque) com visão de produto SaaS 100% online e UX de excelência.

### Removed
- **Eliminação de Botões Manuais de Sincronização (`/luke/produtos`, `/luke/vendedores`, `/luke/clientes`)**:
  - Removidos todos os botões visuais manuais de "Sincronizar" e barras de alerta redundantes.
  - Carga e validação inicial ocorrem de forma 100% silenciosa e em segundo plano caso as coleções estejam vazias no Firestore, mantendo a persistência atômica individual por ação com feedback visual imediato via Toast.

## [1.8.0] - 2026-09-12
### Added
- **Feedback Visual de Gravação na Nuvem em Tempo Real (Todo o Sistema)**:
  - Componente `ToastFeedback` flutuante via `createPortal` com badge luminoso verde esmeralda `☁️ NUVEM FIRESTORE SINCRONIZADA` e indicador pulsante.
  - Indicadores dinâmicos em todos os botões de salvar/confirmar com bloqueio automático contra múltiplos cliques, spinner animado e texto explícito *"Gravando na nuvem..."*.
  - Toasts e alertas com prevenção contra fechamento de modais caso a conexão com a nuvem falhe, evitando perda de dados preenchidos.
- **Catálogo Mestre Completo de 561 Clientes na Nuvem (`/luke/clientes`)**:
  - Módulo `clientsCatalog.ts` integrando a mesclagem automática (`mergeClientsWithCatalog`) entre banco de dados e fallback local.
  - Semeamento em lote permanente de todos os 561 clientes com códigos de rota no banco Firestore `klirosales`.
  - Botão no cabeçalho com indicador percentual para ressincronização em massa sob demanda.

### Fixed
- **Persistência de Edição de Clientes no Firestore (`klirosales`)**:
  - Correção da inicialização do Firebase Firestore para o banco de dados dedicado `"klirosales"`, eliminando o erro silencioso `5 NOT_FOUND` que descartava as gravações.
  - Ativação de `{ ignoreUndefinedProperties: true }` no SDK do Firestore, evitando falhas de gravação em campos opcionais.
  - Validação de persistência entre abas e recarregamentos de página comprovada por testes automatizados no navegador.

## [1.7.0] - 2026-08-27
### Added
- **Logomarca Dinâmica da Empresa na Barra Lateral (`/luke`)**:
  - A barra lateral agora busca a logomarca configurada no Firestore (`tenants/tenant_luke_001/settings/company`) e a exibe no cabeçalho superior no lugar do texto estático da empresa.
- **Cartões Interativos de KPI com Drill-Down Matemático e Operacional (`/luke`)**:
  - Todos os 9 indicadores da tela Visão (`Faturamento Total`, `Ticket Médio`, `A Receber`, `A Pagar`, `Caixa Líquido Previsto`, `Clientes`, `Frotas & Cargas`, `Positivação`, `Cargas`) agora são clicáveis.
  - Modal dinâmico detalha fórmulas matemáticas, composição numérica, impacto operacional e links de ação direta.
### Removed
- **Remoção de Upload de Imagem de Clientes em Rotas (`/luke/clientes`)**:
  - Formulário simplificado sem upload de foto, mantendo essa função exclusiva para o SaaS/Inquilinos. Tabela com insígnias por iniciais.
- **Remoção do Campo "Ordem de Visita" (`/luke/clientes`)**:
  - Exclusão do campo numérico e da coluna de ordem na tabela para ganho de espaço operacional útil.
- **Eliminação de Botões Manuais de Sincronização (`/luke/clientes` & `/luke/rotas`)**:
  - Removidos os botões de sincronização manual, pois todas as operações são salvas e lidas em tempo real diretamente no Firebase Firestore.
### Changed
- **Padronização Exclusiva para "Gestão de Rotas" (`/luke/rotas` & `/luke/vendedores`)**:
  - Título padronizado para "Gestão de Rotas" e botões renomeados de "Agendar Rota" / "Salvar na Agenda" para "Nova Rota" e "Salvar Rota".

## [1.6.0] - 2026-08-27
### Added
- **Upload de Imagens de Clientes (JPG/PNG/WebP) & Imagem Padrão LUKE (`/luke/clientes`)**:
  - Modal de clientes com botão de upload de foto local (JPG/PNG) com conversão instantânea para Base64 e pré-visualização.
  - Imagem e logo oficial da LUKE Brasil adicionados ao sistema (`/images/luke-logo.png`).
- **Limite de Compras Mensal do Cliente (`/luke/clientes`)**:
  - Renomeação do antigo "Limite P.A." para "Limite de Compras Mensal (R$)", com formatação brasileira e controle visual.
- **Cadastro de Compradores Livre de DDD & WhatsApp com DDI 55 Automático (`/luke/clientes` & `/luke/vendedores`)**:
  - Campo de telefone limpo para livre preenchimento pelo vendedor e geração de link `https://wa.me/55...` garantindo conformidade com o WhatsApp.
- **Campo "Aceita P.A. (Sim / Não)" (`/luke/clientes`)**:
  - Nova flag booleana `acceptsPA` no cadastro de clientes e badge destacada na tabela de listagem.
- **Recorrência Inteligente de Despesas com Seletor de Meses (`/luke/financeiro`)**:
  - Ao marcar despesa recorrente, o usuário seleciona a quantidade de meses (2 a 36 meses), gerando automaticamente todas as parcelas (`1/N`, `2/N`...) com seus devidos vencimentos no fluxo.
- **Busca Digital em Tempo Real para Categorias Financeiras (`/luke/financeiro`)**:
  - Combobox com filtro instantâneo por digitação para seleção ágil de categorias no lançamento de despesas e receitas.
- **Ampliação do Catálogo de Categorias Financeiras (`src/lib/financial_categories.json`)**:
  - Expansão para 33 categorias detalhadas (despesas operacionais, tributárias, bancárias, logísticas e receitas).
- **Lançamento de Despesa Já Paga / Baixada (`/luke/financeiro`)**:
  - Toggle no modal de despesa para permitir lançar uma despesa já liquidada no ato da criação (definindo status `PAID`, data real de pagamento e forma utilizada).
- **Estorno de Baixa com Auditoria e Restrição de Segurança (`/luke/financeiro`)**:
  - Modal de confirmação de estorno de pagamento exigindo preenchimento obrigatório de justificativa / observação.
  - Validação de segurança garantindo que apenas administradores autorizados (`admin@luke.com`) realizem estornos com registro em log de auditoria (`auditTrail`).
- **Destaque e Filtro de Contas Atrasadas / Vencidas (`/luke/financeiro`)**:
  - Identificação visual instantânea (badge vermelha e indicador "Atrasado") para contas a pagar vencidas antes da data de hoje, além de filtro dedicado.
- **Módulo Central de Formatação e Padronização Brasil (`src/lib/formatters.ts`)**:
  - Funções centralizadas para formatação monetária (Real `R$ 1.234,56`), datas (`DD/MM/AAAA` e `DD/MM/AAAA HH:mm`), números e telefones com DDI 55.
- **Seletores de Mês, Ano e Período em Cada Aba Financeira (`/luke/financeiro`)**:
  - Filtros completos de Mês (Jan-Dez), Ano (2025-2027) e Presets de Período (*Este Mês, Mês Passado, Próximo Mês, Todo o Ano, Todos*) em Contas a Pagar, Contas a Receber, Caixa e Categorias.
- **Cards de Métricas e KPIs de Contas a Receber por Forma de Pagamento (`/luke/financeiro`)**:
  - 6 novos cards estatísticos no topo da aba Receber: P.A. Agendado, Cartão de Crédito/Débito, Pix & Dinheiro, Total em Aberto, Total Já Recebido e Total Atrasado.
### Changed
- **Generalização Global de "Salão/Salões" para "Cliente/Clientes" (Preparação para SaaS)**:
  - Substituição global de termos e botões em todo o portal LUKE e rotas, permitindo que a plataforma opere de forma genérica como um SaaS multi-segmento.
- **Status de Rota: Substituição de "Agendada" por "Aguardando" (`/luke/rotas`)**:
  - Adequação da nomenclatura nos filtros, tabelas e modais de rotas.
- **Remoção da Seção e Aba de DRE (`/luke/financeiro`)**:
  - Foco total nas abas operacionais essenciais: Pagar, Receber, Caixa e Categorias.

### Added
- **Modo Privacidade / Ocultar Valores Ativo por Padrão (`PrivacyContext`)**:
  - Valores monetários agora são ocultados por padrão no sistema (`R$ ••••••`) para evitar visualização indevida durante atendimentos.
  - Botão de alternância rápida (*Eye / EyeOff*) na barra lateral e nos cabeçalhos dos módulos.
- **Configurações da Empresa & Logomarca (`/luke/empresa`)**:
  - Nova página dedicada para o cliente cadastrar e editar a logomarca da empresa com pré-visualização instantânea.
  - Dados fiscais completos (Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual, Responsáveis, WhatsApp e Telefones centrais).
  - Endereço central estruturado da distribuidora e cadastro de Chave Pix para recebimento das rotas.
- **Até 5 Compradores com Link Direto para WhatsApp (`/luke/clientes`)**:
  - Suporte ao cadastro dinâmico de até 5 compradores por salão / barbearia.
  - Botão de atalho que redireciona diretamente para o WhatsApp oficial de cada comprador (`https://wa.me/...`).
- **Endereço Completo Estruturado (`/luke/clientes`)**:
  - Campos separados de CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF e Ponto de Referência para relatórios e logística avançada.
- **Gestão Completa de Rotas (`/luke/rotas`)**:
  - Botão "Nova Rota" corrigido e operacional com modal completo para criação e edição de rotas, códigos (ex: R1, F1), vendedor responsável, dia da semana e sincronização com o Firestore.
### Changed
- **Padronização e Limpeza de Rótulos para Palavra Única**:
  - Simplificação de menus e cabeçalhos em todo o sistema (*Visão, Clientes, Rotas, Cargas, Financeiro, Transações, Vendedores, Produtos, Empresa, Rua*), tornando a interface mais limpa e direta.

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
