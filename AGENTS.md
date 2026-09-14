# Diretrizes e Regras do Projeto Kliro-SALES

Este repositório obedece a regras de arquitetura, versionamento, deploy contínuo e experiência do usuário (UX).

---

## 1. Protocolo Obrigatório de Conclusão (Para Toda Alteração, Correção ou Melhoria)
Antes de considerar qualquer tarefa finalizada, é **obrigatório** executar o seguinte fluxo completo:

1. **Validação do Build de Produção:**
   ```bash
   cd admin_web && npm run build
   ```
   Deve retornar código de saída `0` sem erros de TypeScript.

2. **Tríplice Versionamento:**
   - Incrementar versão no `admin_web/package.json`.
   - Atualizar a tag de versão estampada no rodapé de login (`admin_web/src/app/page.tsx`).
   - Documentar as novidades no [`CHANGELOG.md`](file:///c:/NexAi/Kliro-SALES/CHANGELOG.md).

3. **Cópia e Push para o Repositório Oficial (GitHub):**
   ```bash
   git add .
   git commit -m "feat/fix: descrição semântica da alteração"
   git push origin main
   ```
   Repositório: `https://github.com/techcostanet/Kliro-SALES` (Branch `main`).

4. **Deploy Automático para o Firebase Hosting:**
   ```bash
   npx --yes firebase-tools deploy --only hosting
   ```
   Ambiente de Produção: [https://kliro-sales.web.app](https://kliro-sales.web.app).

---

## 2. Varredura Contínua por Melhorias & Apresentação em Planos
- **Inspeção Ativa:** Em toda passagem pelo código, o assistente/desenvolvedor deve avaliar oportunidades de otimização em código, performance, segurança e usabilidade.
- **Destaque nos Planos:** Todas as melhorias identificadas devem ser posicionadas **obrigatoriamente ao final do plano de implementação**, sob o título em destaque:
  > ### 💡 Melhorias Encontradas no Sistema (Sugestão de Evolução)
- **Pilares de Avaliação:**
  - **SaaS Comercial Escalável:** Multi-tenant estrito (`/tenants/{tenantId}`).
  - **100% Online Sempre:** Cloud Google Cloud / Firebase Spark com sincronização silenciosa e feedback em tempo real.
  - **Experiência do Usuário (UX):** Telas fluidas, ausência de recargas de página, máscaras financeiras intuitivas (`CurrencyInput`), digitação sem setas verticais (`NumberInput`) e confirmação imediata de gravação na nuvem (`ToastFeedback`).

---

## 3. Identidades Visuais
- **SaaS Master / Admin:** Clean Light Theme (Slate, Branco, Índigo `#4f46e5`, Emerald).
- **Ambiente LUKE Brasil (`/luke`):** Dark Gold Theme exclusivo (Preto `#12110F`, Grafite `#181A1E`, Dourado `#BB8334`).
