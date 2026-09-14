# Regras Padrões do Projeto Kliro-SALES

Sempre que atuar neste projeto (Kliro-SALES), você deve obedecer estritamente a estas regras de processo, versionamento, arquitetura e fluxo de trabalho:

---

### 1. Protocolo Obrigatório de Conclusão (Executar a cada Alteração, Mudança, Melhoria ou Correção)
Toda e qualquer alteração realizada no projeto **DEVE** obrigatoriamente cumprir este ciclo completo antes de ser dada como concluída:

1. **Validação de Compilação (Build)**:
   - Executar o build de produção no Next.js (`cmd.exe /c "npm run build"` dentro de `admin_web`).
   - Garantir 100% de conformidade com TypeScript (código de saída `0`).

2. **Versionamento Obrigatório Tríplice**:
   - Incrementar a versão no `admin_web/package.json` (ex: `1.8.0` ➔ `1.8.1` para correções ou `1.9.0` para melhorias).
   - Estampar a tag da versão (ex: `v1.8.1`) de forma visível e elegante no rodapé da tela de login principal (`src/app/page.tsx`).
   - Registrar detalhadamente as mudanças no [`CHANGELOG.md`](file:///c:/NexAi/Kliro-SALES/CHANGELOG.md) sob as seções `Added`, `Changed`, `Fixed` ou `Removed`.

3. **Cópia / Commit / Push para o Repositório Configurado (GitHub)**:
   - Executar `git add .`, criar mensagem de commit semântica e objetiva, e fazer `git push origin main`.
   - Repositório oficial: `https://github.com/techcostanet/Kliro-SALES` (Branch `main`).

4. **Deploy Automático para Produção (Firebase Hosting)**:
   - Executar o deploy no Firebase Hosting utilizando `npx --yes firebase-tools deploy --only hosting` (ou via Firebase CLI).
   - URL de produção: `https://kliro-sales.web.app`.

---

### 2. Procura Ativa por Melhorias & Regra de Inclusão nos Planos
- **Varredura Proativa:** Sempre que passar pelo sistema, navegar pelo código ou inspecionar telas e módulos, ativamente procurar por possíveis melhorias (código, performance, arquitetura, acessibilidade, usabilidade).
- **Posicionamento nos Planos:** Ao elaborar qualquer plano de ação para o usuário, **nunca** misturar essas sugestões no escopo principal. As melhorias identificadas devem ser incluídas **obrigatoriamente apenas no final do plano**, destacadas sob o bloco:
  > ### 💡 Melhorias Encontradas no Sistema (Sugestão de Evolução)
- **Diretriz de Pensamento para Melhorias:**
  - **Mentalidade SaaS Comercial:** O sistema é uma plataforma multi-empresa, escalável e robusta.
  - **100% Online Sempre:** Arquitetura orientada a dados em tempo real no Google Cloud/Firebase com tolerância a falhas e feedback visual transparente.
  - **Excelente Experiência do Usuário (UX de Alto Padrão):**
    - Interfaces rápidas, reativas e com respostas visuais instantâneas.
    - Zero recargas bruscas de página.
    - Campos com máscaras adequadas e digitação simples e intuitiva.
    - Toasts e indicadores de sincronização não intrusivos.

---

### 3. Regras de Arquitetura e Identidade Visual

1. **100% Online e Google Cloud / Firebase Spark**:
   - Backend operando 100% no ecossistema Google Cloud / Firebase (Firestore dedicado `"klirosales"`, Firebase Auth, Firebase Hosting).
   - Manter a camada gratuita do Spark (zero custos desnecessários com servidores).

2. **Separação Rígida de Identidade Visual**:
   - **Plataforma SaaS / Super Admin (Tech Costa Systems)**:
     - **Clean Light Theme**: Tons claros institucionais (*Slate 50, White, Índigo corporativo `#4f46e5`, Emerald*).
     - Tela de login unificada em `/` sem botões manuais de seleção de perfil (roteamento automático por credencial/empresa).
   - **Ambiente do Cliente (LUKE Brasil)**:
     - **Dark Gold Theme**: Paleta oficial exclusiva da LUKE (*Preto `#12110F`*, *Grafite `#181A1E`*, *Dourado `#BB8334`*), restrita a `/luke` e `/luke/rua`.

3. **Segurança e Anti-Fraude (Firestore Security Rules)**:
   - Isolamento total por empresa via `/tenants/{tenantId}`.
   - Rotas finalizadas no Modo Rua e logs de auditoria são imutáveis e travados contra exclusão ou alteração de transações passadas.
   - Sincronização em background: evitar botões manuais de sincronismo; cadastros e edições salvam imediatamente na nuvem com confirmação via Toast.
