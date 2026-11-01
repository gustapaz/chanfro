import { routeTable, simpleDispatch } from "./routes.mjs";
import { service } from "./service.mjs";
import { guarded, errorResponse, readJson } from "./transport.mjs";
import { fail } from "./errors.mjs";
import { contract } from "./contract.mjs";
import { checkZodSchema } from "@ts-rest/core";
export function createApi(db, clock) {
  const table = routeTable(db, service, clock);
  return guarded(async (req) => {
    const url = new URL(req.url);
    if (url.search)
      fail("invalid_query", "Parâmetros de URL não são aceitos.", 400);
    for (const route of Object.values(contract)) {
      if (route.method !== req.method) continue;
      const match = url.pathname.match(
        new RegExp("^" + route.path.replace(":id", "([a-f0-9-]{36})") + "$"),
      );
      if (!match) continue;
      const params = { id: match[1] };
      if (route.pathParams && !checkZodSchema(params, route.pathParams).success)
        fail("not_found", "Registro não encontrado.", 404);
      if (route.body && route.method !== "DELETE") {
        const input = await readJson(req.clone());
        if (!checkZodSchema(input, route.body).success)
          fail("invalid_input", "Confira os campos e os limites do contrato.");
      }
      const handler = table.find(
        ([method, path]) => method === route.method && path === route.path,
      )?.[2];
      if (handler) return handler(req, params);
    }
    fail("not_found", "Endpoint não encontrado.", 404);
  });
}
