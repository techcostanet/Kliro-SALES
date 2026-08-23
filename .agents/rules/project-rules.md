# Regras do Projeto Kliro-SALES

Sempre que atuar neste projeto (Kliro-SALES), você deve obedecer estritamente a estas regras de processo e arquitetura:

1. **Deploy e Versionamento (GitHub)**
   - Sempre faça commit e push para o GitHub após cada deploy ou mudança significativa.
   - O repositório remoto é: `https://github.com/techcostanet/Kliro-SALES`

2. **Histórico de Versionamento (Changelog)**
   - Mantenha o arquivo `CHANGELOG.md` na raiz do projeto atualizado com todas as melhorias, novidades e correções.
   - **IMPORTANTE:** Inserções de dados (seeds, migrações de dados de teste) **não** devem ser documentadas no Changelog. O Changelog serve apenas para evolução de código/produto.

3. **Arquitetura (100% Online e Google)**
   - **TUDO** deve ser feito online usando o ecossistema do Google Cloud / Firebase (Firestore, Cloud Functions, Firebase Hosting, Firebase Auth).
   - Não sugira tecnologias ou bancos de dados fora do ecossistema Google/Firebase (como PostgreSQL local, SQLite ou AWS) a menos que explicitamente solicitado.
   - O sistema é Multi-Tenant e todas as regras de dados devem respeitar o isolamento por empresa via `tenantId` nas subcoleções do Firestore e nas Regras de Segurança.
