# CHANFRO

Otimizar cortes retangulares numa chapa, respeitando serra e rotação.

[Experimentar a demo gratuita](https://chanfro-gustapaz.starrylinen.chatgpt.site) · [API e modelo](https://chanfro-gustapaz.starrylinen.chatgpt.site/api-docs.html) · [Contrato integrado](docs/solution-contract.md)

## Experiência e stack

Prancha de oficina com réguas nas bordas, chapa em escala e cortes revelados em sequência. Layout e movimento próprios, controles nativos por teclado, pausa explícita e prefers-reduced-motion.

- Frontend: **Maquette**. Bundle independente em /experience/.
- Backend: **ts-rest Core + Fetch adapter + Zod**. Dois empacotamentos guilhotinados determinísticos; escolhe maior área aproveitada, depois quantidade. A folga da serra separa partições. Não é ótimo global ou instrução de uso de ferramentas.
- D1 persistente, SQL parametrizado, migrações Drizzle. Vinext/Worker para documento SSR e transporte, sem substituir a stack da interface. ClientBoot monta a experiência após a hidratação.

Cliente initClient do ts-rest e adaptador Fetch próprio usam o mesmo server/contract.mjs. Não usa @ts-rest/serverless ou adaptador Next.

## O que funciona de verdade

Alterar condições → calcular no backend → guardar no D1 → reler/editar por revisão → criar/encerrar link de leitura → exportar a revisão salva. Algoritmos, validação, autorização e persistência são reais. Catálogos, nomes, cenários e medidas são sintéticos. Não há fallback silencioso para mocks quando a API falha.

Peças e chapas de exemplo. Planejamento retangular simplificado, sem veio, fixação, defeitos, esforço estrutural ou instruções de operação de ferramentas. Heurística, não ótimo global.

## Executar

Node.js 24+.

```sh
npm ci
npm test
npm run typecheck
npm run check
npm run build
npm run db:migrate
npm start -- --port 59200
# Em outro terminal:
npm run smoke -- http://127.0.0.1:59200
```

Banco local em .wrangler/state, ignorado pelo Git. Testes usam Miniflare e migrações reais em diretórios isolados. Gere novas migrações com npm run db:generate; não altere as já aplicadas. Testes não fazem reset de visitantes. Smoke cria e remove apenas seu próprio registro.

## Gratuidade e dados

Sem cartão, faturamento ou trial. Sites oferece runtime Worker e D1 nesta conta, sujeitos a disponibilidade e cotas, sem promessa de SLA ou gratuidade ilimitada permanente. Retenção de sete dias, 12 criações/hora UTC por demo, até trinta revisões e JSON UTF-8 de 16 KiB.

Token aleatório de recurso de 256 bits, somente digest no banco. Acesso de edição guardado na sessão desta aba; até doze acessos. Links contêm UUID sem token e permitem leitura, nunca edição. Não há recuperação de acesso, conta, senhas, pagamentos ou envio externo. Use somente dados sintéticos e exporte antes de fechar.

## Qualidade e operação

[Arquitetura](docs/architecture.md) · [Segurança](docs/security.md) · [Design](docs/design.md) · [Validação](docs/validation.md)

CI instala pelo lockfile e executa testes, tipos, formatação e build. Capturas e verificações públicas são adicionadas após os testes da demo. Nenhum resultado Lighthouse é declarado sem medição.

## Licenças

Código original [MIT](LICENSE), Gustavo Paz. [Fotografia real licenciada](docs/assets-license.md), [inventário e hashes](docs/assets.json), [dependências e fontes](docs/dependency-licenses.md), textos preservados em docs/third-party/. Não há músicas, marcas, personagens ou imagens de terceiros sem licença.
