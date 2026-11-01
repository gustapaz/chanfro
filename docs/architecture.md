# Arquitetura

Modo integrado, conforme solution-contract.md. Maquette consome ts-rest Core + Fetch adapter + Zod na mesma origem. SSR contém conteúdo, metadados e navegação; o bundle próprio monta depois da hidratação.

Dois empacotamentos guilhotinados determinísticos; escolhe maior área aproveitada, depois quantidade. A folga da serra separa partições. Não é ótimo global ou instrução de uso de ferramentas.

Cliente initClient do ts-rest e adaptador Fetch próprio usam o mesmo server/contract.mjs. Não usa @ts-rest/serverless ou adaptador Next.

service.mjs: domínio e exportação. input-schema.mjs: restrições canônicas. validator.mjs: validação da stack. api.mjs: protocolo/router. store.mjs: D1, tokens, CAS, TTL e cotas. transport.mjs: bytes/UTF-8, origem, erros mascarados e cabeçalhos.

