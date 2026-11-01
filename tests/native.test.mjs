import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../server/api.mjs";
import { service } from "../server/service.mjs";
const api = createApi({});
const request = (path, body) =>
  api(
    new Request("https://demo.local" + path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
import { initClient } from "@ts-rest/core";
import { contract } from "../server/contract.mjs";
const client = initClient(contract, {
  baseUrl: "https://demo.local",
  baseHeaders: {},
  api: async ({ path, method, headers, body }) => {
    const r = await api(new Request(path, { method, headers, body }));
    return { status: r.status, body: await r.json(), headers: r.headers };
  },
});
test("native ts-rest client and Fetch contract adapter agree", async () => {
  const r = await client.calculate({ body: service.meta.default_input });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body, service.compute(service.meta.default_input));
});
test("contract rejects an invalid request before persistence", async () => {
  assert.equal(
    (
      await client.calculate({
        body: { ...service.meta.default_input, kerf: -1 },
      })
    ).status,
    422,
  );
});
test(
  "oversized native requests terminate with 413, including cloned bodies",
  { timeout: 2000 },
  async () => {
    const r = await api(
      new Request("https://demo.local/api/compute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "x".repeat(17000),
      }),
    );
    assert.equal(r.status, 413);
  },
);
