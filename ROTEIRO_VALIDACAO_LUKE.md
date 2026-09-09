# 📋 Protocolo de Homologação & Validação Módulo a Módulo — LUKE Brasil
**Projeto:** Kliro-SALES (Módulo Distribuição LUKE)  
**Data da Validação:** 09/09/2026  
**Participantes:** Desenvolvedor / Nexa & Gestores LUKE (Lucas, Sabrina e Supervisão)  
**Objetivo:** Validar campo a campo, botão a botão, cálculos e regras de negócio para homologar a versão 1.7.0 e levantar ajustes finos.

---

## 🧭 Como Conduzir a Validação com o Cliente

> **Dica Prática:** Em cada tela, peça para o próprio cliente navegar enquanto você faz as perguntas do checklist. Se algo faltar ou estiver diferente do que ele espera, anote imediatamente no campo de **"Ajustes Solicitados"** de cada módulo.

---

## MÓDULO 1: 📊 Visão Geral & Dashboard Executivo
**URL:** `/luke`  
**Objetivo:** Apresentar a saúde do negócio, métricas do mês, faturamento e navegação corporativa.

### 1.1. Campos & Elementos Visuais
- [ ] **Identidade da Empresa:** Logomarca oficial da LUKE e Razão Social renderizadas no cabeçalho superior e lateral.
- [ ] **Data de Referência:** Mês ativo e período operacional visíveis.
- [ ] **Botão de Privacidade (Olho):** Alterna valores confidenciais para `R$ ***` com 1 clique (para reuniões ou locais públicos).

### 1.2. Cálculos & KPIs a Validar
- [ ] **Faturamento Total do Mês:** Somatório de todas as vendas e rotas concluídas.
- [ ] **Meta Mensal & % Atingido:** Barra de progresso da meta da distribuidora.
- [ ] **Clientes Atendidos vs. Carteira:** Total de visitas realizadas vs. total de clientes na carteira.
- [ ] **Ticket Médio por Atendimento:** Cálculo de `Faturamento / Clientes Positivados`.
- [ ] **Positividade da Carteira (%):** Proporção de clientes visitados que compraram.

### 1.3. Ações & Botões
- [ ] Clique nos cards de KPI: abrem o detalhamento correspondente (drill-down).
- [ ] Atalhos de navegação rápida para Rotas, Cargas e Modo Rua.

> **Perguntas-chave para o Cliente:**
> 1. *"Falta algum número ou indicador que você olha todo dia de manhã e que não está aqui?"*
> 2. *"A meta está no valor correto para este mês?"*

---

## MÓDULO 2: 🏪 Clientes & Carteira de Atendimento
**URL:** `/luke/clientes`  
**Objetivo:** Cadastro, manutenção, segmentação por rota e condições comerciais dos 559 clientes.

### 2.1. Campos Cadastrais a Validar
| Campo | Status no Sistema | Pergunta de Validação |
| :--- | :---: | :--- |
| **Código do Cliente** | Presente (ex: `R1C1`, `F2C5`) | *"O formato do código bate com a ficha de vocês?"* |
| **Nome Fantasia / Razão Social** | Presente | *"Usam mais o nome do estabelecimento ou a razão social?"* |
| **Rota Associada** | Presente (`R1` a `R12`, `F1` a `F12`) | *"A rota associada a este cliente está correta?"* |
| **Ordem de Atendimento (#)** | Presente (sequência de paradas) | *"A ordem reflete o trajeto geográfico do vendedor?"* |
| **Compradores / Contatos** | Até 5 contatos com WhatsApp | *"Falta cadastrar mais de um comprador por cliente?"* |
| **Endereço Completo** | Rua, Nº, Bairro, CEP, Referência | *"Os dados de localização estão completos para entrega?"* |
| **Condição Comercial** | Padrão, Compra Lâmina, Consignado, Prazo 30d | *"Essas condições cobrem 100% dos tipos de negociação?"* |
| **Aceita Prazo Aberto (P.A.)** | Checkbox booleano | *"Esse cliente pode comprar no prazo se tiver boleto em aberto?"* |
| **Limite de Crédito (R$)** | Presente | *"Qual é a política de limite de compras mensal?"* |

### 2.2. Botões, Filtros & Salvamento
- [ ] **Busca Instantânea:** Digitar nome, comprador ou código e verificar a velocidade do filtro.
- [ ] **Filtro por Rota:** Selecionar `R1`, `F1`, etc. e validar se lista apenas os clientes daquela rota.
- [ ] **Filtro por Condição Comercial:** Filtrar por *Consignado*, *Compra Lâmina*, *Prazo*, etc.
- [ ] **Botão WhatsApp:** Clicar no ícone de WhatsApp de um comprador e verificar se abre o chat com mensagem pronta.
- [ ] **Novo Cliente / Editar:** Preencher o modal de cliente, salvar e verificar se os dados persistem na lista.
- [ ] **Exclusão de Cliente:** Testar se há confirmação de segurança antes de excluir.

> **Perguntas-chave para o Cliente:**
> 1. *"Falta algum dado cadastral (ex: CPF do barbeiro, Instagram da barbearia, dia fixo da semana que prefere visita)?"*
> 2. *"Vocês costumam inativar clientes que não compram há mais de 60 dias?"*

---

## MÓDULO 3: 🗺️ Gestão de Rotas & Agenda Google Calendar
**URL:** `/luke/rotas`  
**Objetivo:** Planejamento diário, semanal e mensal das rotas, identificação por cor do vendedor e impressão da folha de campo.

### 3.1. Campos & Visualização
- [ ] **Modos de Visão:** Alternar entre **Mês**, **Semana**, **Dia** e **Lista**.
- [ ] **Cores por Vendedor:** 
  - Alisson: Verde (`#10b981`)
  - Alexandre: Azul (`#0ea5e9`)
  - Lucas: Roxo (`#8b5cf6`)
  - Sabrina: Laranja/Âmbar (`#f59e0b`)
- [ ] **Status da Rota:** Planejada (`SCHEDULED`), Em Andamento (`IN_PROGRESS`), Concluída (`COMPLETED`).
- [ ] **Eventos Especiais:** Datas comemorativas marcadas (ex: Aniversários, Feriados).

### 3.2. Ações & Botões Críticos
- [ ] **Botão "Montar Mês":** Clicar e verificar se a escala semanal recorrente é gerada para o mês sem duplicar datas.
- [ ] **Nova Rota / Editar Rota:** Alterar o vendedor de uma data específica (ex: passar Rota R1 de Alisson para Lucas) e checar se a cor da pílula muda imediatamente.
- [ ] **Botão "Imprimir" no Topo:** Abre o modal de impressão com seleção entre Roteiro de Campo e Agenda Geral.
- [ ] **Botão "Imprimir Rota" em Cada Card:** No card da rota do dia ou da semana, clicar e verificar se a folha A4 abre com os clientes da rota já preenchidos.
- [ ] **Pré-visualização & Impressão Real (Ctrl + P):** Checar se o papel sai limpo, fundo branco, com checkboxes para o vendedor marcar a caneta e campo para assinaturas.

### 3.3. Cálculos da Agenda
- [ ] **Total de Clientes do Dia:** Soma das metas das rotas escaladas no dia.
- [ ] **Faturamento Estimado vs. Realizado:** Comparação do previsto com os pedidos fechados.

> **Perguntas-chave para o Cliente:**
> 1. *"A escala semanal gerada pelo 'Montar Mês' bate 100% com a regra fixa da empresa?"*
> 2. *"A folha impressa tem todas as colunas que o vendedor precisa na rua (ordem, nome, contato, valor, obs)?"*

---

## MÓDULO 4: 🚚 Cargas & Expedição (Conferência de Veículos)
**URL:** `/luke/carregamento`  
**Objetivo:** Conferência do estoque que entra no carro/moto, ciclos semanais de carga e romaneio de saída.

### 4.1. Campos & Informações da Carga
- [ ] **Identificação:** Vendedor selecionado, data da carga, número do ciclo/semana.
- [ ] **Itens da Carga:** Código do produto, descrição, categoria, quantidade carregada.
- [ ] **Estoque em Trânsito:** Quantidade que saiu, quantidade vendida na rua, sobra que voltou.
- [ ] **Status de Aprovação:** Carga em Conferência vs. Carga Aprovada pela Expedição.

### 4.2. Ações & Botões
- [ ] **Seleção de Ciclos:** Alternar entre as abas de semanas/ciclos do mês.
- [ ] **Aprovação de Carga:** Botão de aprovar/desaprovar carga pelo supervisor.
- [ ] **Impressão do Romaneio de Carga:** Clicar em Imprimir e checar a lista de conferência física de estoque.

### 4.3. Cálculos de Estoque do Carro
- [ ] `Sobra Teórica = Quantidade Carregada - Quantidade Vendida`.
- [ ] `Diferença de Estoque = Sobra Física Contada - Sobra Teórica`.
- [ ] `Valor Total da Carga (R$) = Σ (Quantidade × Preço de Venda)`.

> **Perguntas-chave para o Cliente:**
> 1. *"Quem confere a carga: o próprio vendedor ou um expedidor no galpão?"*
> 2. *"Vocês trabalham com estoque consignado que fica no carro de uma semana para outra?"*

---

## MÓDULO 5: 📱 Modo Rua (Força de Vendas Mobile)
**URL:** `/luke/rua`  
**Objetivo:** Interface que o vendedor usa na rua pelo celular para registrar visitas e emitir pedidos.

### 5.1. Fluxo Operacional na Rua (Simulação Real)
- [ ] **Abertura da Rota:** Vendedor seleciona a sua rota do dia (ex: `R1`).
- [ ] **Lista Sequencial de Clientes:** Exibição clara em cards grandes com endereço e telefone.
- [ ] **Botão Ligar / WhatsApp:** Dispara ligação ou mensagem rápida direto do celular.
- [ ] **Localização / Mapa:** Botão de traçar rota no Waze / Google Maps para o endereço do cliente.

### 5.2. Simulação de Pedido / Venda
- [ ] **Carrinho de Compras:**
  - Adicionar itens ao pedido (ex: Pomada Modeladora, Lâminas, Óleo de Barba).
  - Alteração de quantidade com botões `+` e `-`.
  - Aplicação de desconto (se permitido).
- [ ] **Condição de Pagamento:**
  - [ ] À Vista (Dinheiro)
  - [ ] Pix (Exibe chave Pix da LUKE)
  - [ ] Cartão (Crédito / Débito)
  - [ ] Boleto a Prazo (30 dias)
  - [ ] Consignado (Deixado para acerto posterior)
- [ ] **Finalização do Pedido:**
  - Confirmação do pedido com tela de sucesso.
  - O status do cliente na lista muda para **"Atendido / Visitado"**.
  - O faturamento do dia sobe em tempo real.

### 5.3. Simulação de Visita sem Venda (Não Compra)
- [ ] Vendedor abre o cliente e clica em **"Registrar Não Compra"**.
- [ ] Seleção do motivo: *Cliente fechado, Estoque cheio, Comprador ausente, Sem limite de crédito*.
- [ ] Observação salva no histórico daquele cliente.

> **Perguntas-chave para o Cliente:**
> 1. *"O vendedor precisa cadastrar produtos novos direto pelo celular enquanto está na rua?"*
> 2. *"Ele precisa coletar assinatura do cliente na tela do celular ou enviar comprovante em PDF via WhatsApp?"*

---

## MÓDULO 6: 💳 Transações & Fechamento Financeiro
**URLs:** `/luke/transacoes` e `/luke/financeiro`  
**Objetivo:** Extrato de todas as operações de venda, conciliação do dinheiro recebido e contas a receber.

### 6.1. Campos da Transação
- [ ] Data e hora da venda.
- [ ] Nome do cliente e código.
- [ ] Vendedor responsável.
- [ ] Valor total bruto, descontos e valor líquido.
- [ ] Forma de pagamento utilizada.
- [ ] Status: Pago, Pendente de Pagamento, Em Cobrança.

### 6.2. Filtros & Ações
- [ ] Filtro por vendedor (ver apenas as vendas do Alisson ou do Alexandre).
- [ ] Filtro por período (hoje, esta semana, este mês).
- [ ] Filtro por forma de pagamento (ex: ver quanto entrou via Pix hoje).
- [ ] Visualização do detalhe da transação (itens do pedido).

### 6.3. Cálculos Financeiros
- [ ] **Total Recebido Hoje (Caixa Físico):** Soma de Dinheiro + Pix.
- [ ] **Total a Receber Futuro (Carteira):** Soma de Boletos / Prazos.
- [ ] **Cálculo de Comissão do Vendedor:** Percentual acordado sobre as vendas válidas.

> **Perguntas-chave para o Cliente:**
> 1. *"Como é feita a prestação de contas no fim do dia: o vendedor entrega o dinheiro em espécie ou faz um Pix único para a empresa?"*
> 2. *"Vocês precisam controlar comissão diferente para cada linha de produto?"*

---

## MÓDULO 7: 📦 Produtos & Tabela de Preços
**URL:** `/luke/produtos`  
**Objetivo:** Gerenciamento do catálogo, preços de venda, custos e estoque.

### 7.1. Campos a Validar
- [ ] Código / SKU do produto.
- [ ] Descrição comercial.
- [ ] Categoria (Linha Barba, Linha Cabelo, Acessórios, Descartáveis/Lâminas).
- [ ] Preço de Venda (R$).
- [ ] Preço de Custo (R$) e Margem de Lucro calculada.
- [ ] Quantidade em Estoque Atual e Estoque Mínimo de Alerta.

### 7.2. Ações & Botões
- [ ] Adicionar novo produto / editar produto existente.
- [ ] Ajuste rápido de preço ou quantidade de estoque.
- [ ] Busca por nome ou código.

> **Perguntas-chave para o Cliente:**
> 1. *"Os preços cadastrados aqui são os mesmos para todos os clientes ou existem tabelas diferenciadas (ex: atacado vs varejo)?"*

---

## MÓDULO 8: 👥 Equipe de Vendedores
**URL:** `/luke/vendedores`  
**Objetivo:** Cadastro dos consultores, metas mensais e cores no sistema.

### 8.1. Campos & Ações
- [ ] Nome do vendedor (Alisson, Alexandre, Lucas, Sabrina).
- [ ] Telefone / WhatsApp.
- [ ] Cor de identificação atribuída.
- [ ] Meta mensal individual de vendas (R$).
- [ ] Percentual de comissão padrão.
- [ ] Salvar alterações e refletir na agenda de rotas.

---

## MÓDULO 9: 🏢 Dados da Empresa & Parâmetros
**URL:** `/luke/empresa`  
**Objetivo:** Dados fiscais, bancários e identidade da LUKE Brasil.

### 9.1. Campos a Validar
- [ ] Razão Social: `LUKE Brasil Cosméticos & Distribuição Profissional LTDA`.
- [ ] Nome Fantasia: `LUKE Brasil`.
- [ ] CNPJ e Inscrição Estadual.
- [ ] Chave Pix oficial para recebimento dos clientes.
- [ ] Endereço e contatos da matriz.
- [ ] Upload da logomarca oficial (formato PNG/JPEG com fundo transparente).

---

## 📝 Tabela de Resumo & Levantamento de Ajustes

Utilize esta tabela ao final da reunião para consolidar o feedback com o cliente:

| Módulo | Status (Aprovado / Ajustes) | Descrição do Ajuste Solicitado | Prioridade (Alta/Média/Baixa) |
| :--- | :---: | :--- | :---: |
| **1. Dashboard** | `[  ]` | | |
| **2. Clientes** | `[  ]` | | |
| **3. Rotas & Agenda** | `[  ]` | | |
| **4. Cargas** | `[  ]` | | |
| **5. Modo Rua** | `[  ]` | | |
| **6. Financeiro** | `[  ]` | | |
| **7. Produtos** | `[  ]` | | |
| **8. Vendedores** | `[  ]` | | |
| **9. Empresa** | `[  ]` | | |

---
**Assinatura de Homologação / Validação Técnica:**  
Representante LUKE: _____________________________________ Data: ___/___/______  
Responsável Técnico: ___________________________________ Data: ___/___/______
