# Regras Padrões do Projeto Kliro-SALES

Sempre que atuar neste projeto (Kliro-SALES), você deve obedecer estritamente a estas regras de processo, versionamento e arquitetura:

---

### 1. Protocolo Obrigatório de Conclusão (Executar a cada Mudança, Melhoria ou Correção)
Toda e qualquer alteração realizada no projeto **DEVE** obrigatoriamente cumprir estas 3 ações antes de ser dada como concluída:

1. **Versionamento na Tela de Login e no Projeto**:
   - Incrementar a versão no `package.json` (ex: `1.2.0`, `1.2.1`, etc.).
   - Estampar a tag da versão (ex: `v1.2.0`) de forma visível e elegante no rodapé da tela de login principal (`src/app/page.tsx`).
   - Registrar as novidades e correções no [`CHANGELOG.md`](file:///c:/Nexa/Kliro-SALES/luke-saas-core/CHANGELOG.md).

2. **Cópia / Commit / Push para o Repositório Configurado (GitHub)**:
   - Realizar `git add .`, criar mensagem de commit semântica e executar `git push origin main`.
   - Repositório oficial: `https://github.com/techcostanet/Kliro-SALES` (Branch `main`).

3. **Deploy para a Página do Sistema (Firebase Hosting)**:
   - Executar o deploy no Firebase Hosting utilizando `npx --yes firebase-tools deploy --only hosting`.
   - URL de produção: `https://kliro-sales.web.app`.

---

### 2. Regras de Arquitetura e Identidade Visual

1. **100% Online e Google Cloud / Firebase Spark**:
   - Backend operando 100% no ecossistema Google Cloud / Firebase (Firestore, Firebase Auth, Firebase Hosting).
   - Manter a camada gratuita do Spark (zero custos desnecessários).

2. **Separação Rígida de Identidade Visual**:
   - **Plataforma SaaS / Super Admin (Tech Costa Systems)**:
     - **Clean Light Theme**: Tons claros institucionais (*Slate 50, White, Índigo corporativo, Emerald*).
     - Tela de login unificada em `/` sem botões de seleção de perfil (roteamento automático por role/e-mail).
   - **Ambiente do Cliente (LUKE Brasil)**:
     - **Dark Gold Theme**: Paleta oficial exclusiva da LUKE (*Preto `#12110F`*, *Grafite `#181A1E`*, *Dourado `#BB8334`*), restrita a `/luke` e `/luke/rua`.

3. **Segurança e Anti-Fraude (Firestore Security Rules)**:
   - Isolamento total por empresa via `/tenants/{tenantId}`.
   - Rotas finalizadas no Modo Rua são imutáveis e travadas contra exclusão ou alteração de transações passadas.
