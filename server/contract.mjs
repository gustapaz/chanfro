import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { schema } from "./validator.mjs";
const c = initContract(),
  id = z.object({ id: z.string().uuid() }),
  title = z.string().trim().min(1).max(48),
  revision = z.number().int().min(1).max(30),
  responses = {
    200: z.unknown(),
    201: z.unknown(),
    400: z.unknown(),
    404: z.unknown(),
    409: z.unknown(),
    422: z.unknown(),
    429: z.unknown(),
  };
export const contract = c.router({
  health: { method: "GET", path: "/api/health", responses },
  catalog: { method: "GET", path: "/api/catalog", responses },
  spec: { method: "GET", path: "/api/openapi.json", responses },
  calculate: { method: "POST", path: "/api/compute", body: schema, responses },
  create: {
    method: "POST",
    path: "/api/records",
    body: z.object({ title, input: schema }).strict(),
    responses,
  },
  export: {
    method: "GET",
    path: "/api/records/:id/export",
    pathParams: id,
    responses,
  },
  read: { method: "GET", path: "/api/records/:id", pathParams: id, responses },
  update: {
    method: "PUT",
    path: "/api/records/:id",
    pathParams: id,
    body: z
      .object({ title, input: schema, expected_revision: revision })
      .strict(),
    responses,
  },
  publish: {
    method: "POST",
    path: "/api/records/:id/publish",
    pathParams: id,
    body: z
      .object({ expected_revision: revision, published: z.boolean() })
      .strict(),
    responses,
  },
  remove: {
    method: "DELETE",
    path: "/api/records/:id",
    pathParams: id,
    body: c.noBody(),
    responses,
  },
});
