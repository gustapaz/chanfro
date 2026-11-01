export const inputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["sheet_w", "sheet_h", "kerf", "rotate", "kit", "copies"],
  properties: {
    sheet_w: { type: "integer", minimum: 600, maximum: 1800 },
    sheet_h: { type: "integer", minimum: 400, maximum: 1200 },
    kerf: { type: "integer", minimum: 0, maximum: 8 },
    rotate: { type: "boolean" },
    kit: { type: "string", enum: ["stool", "shelf", "frame"] },
    copies: { type: "integer", minimum: 1, maximum: 3 },
  },
};
