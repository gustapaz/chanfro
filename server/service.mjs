import { validateInput } from "./validator.mjs";
export const kits = {
  stool: [
    ["Assento", 300, 300, 1],
    ["Pé", 80, 450, 4],
    ["Travessa", 60, 240, 4],
  ],
  shelf: [
    ["Prateleira", 500, 220, 3],
    ["Lateral", 600, 220, 2],
    ["Reforço", 500, 70, 1],
  ],
  frame: [
    ["Longarina", 600, 70, 4],
    ["Travessa", 350, 70, 4],
  ],
};
export const meta = {
  slug: "chanfro",
  title: "CHANFRO",
  engine: "ts-rest-zod-guillotine",
  kits,
  default_input: {
    sheet_w: 1200,
    sheet_h: 800,
    kerf: 3,
    rotate: true,
    kit: "stool",
    copies: 1,
  },
  presets: [
    {
      name: "Um banco",
      input: {
        sheet_w: 1200,
        sheet_h: 800,
        kerf: 3,
        rotate: true,
        kit: "stool",
        copies: 1,
      },
    },
    {
      name: "Prateleiras",
      input: {
        sheet_w: 1500,
        sheet_h: 1000,
        kerf: 4,
        rotate: true,
        kit: "shelf",
        copies: 1,
      },
    },
    {
      name: "Molduras",
      input: {
        sheet_w: 1000,
        sheet_h: 700,
        kerf: 2,
        rotate: false,
        kit: "frame",
        copies: 2,
      },
    },
  ],
  note: "Peças e chapas de exemplo. Planejamento retangular simplificado, sem veio, fixação, defeitos, esforço estrutural ou instruções de operação de ferramentas. Heurística, não ótimo global.",
};
export const validate = validateInput;
export function pieces(p) {
  return Array.from({ length: p.copies }, (_, copy) =>
    kits[p.kit].flatMap(([label, w, h, n], type) =>
      Array.from({ length: n }, (_, i) => ({
        id: `P${copy + 1}-${type + 1}-${i + 1}`,
        label,
        w,
        h,
      })),
    ),
  ).flat();
}
function pack(parts, p, mode) {
  let free = [{ x: 0, y: 0, w: p.sheet_w, h: p.sheet_h }];
  const placements = [],
    unplaced = [];
  const order = [...parts].sort(
    (a, b) =>
      (mode === "area"
        ? b.w * b.h - a.w * a.h
        : Math.max(b.w, b.h) - Math.max(a.w, a.h)) || a.id.localeCompare(b.id),
  );
  for (const part of order) {
    const choices = [];
    free.forEach((f, i) => {
      for (const rotated of p.rotate && part.w !== part.h
        ? [false, true]
        : [false]) {
        const w = rotated ? part.h : part.w,
          h = rotated ? part.w : part.h;
        if (w <= f.w && h <= f.h)
          choices.push({ i, f, w, h, rotated, cost: f.w * f.h - w * h });
      }
    });
    choices.sort(
      (a, b) =>
        a.cost - b.cost ||
        a.f.y - b.f.y ||
        a.f.x - b.f.x ||
        Number(a.rotated) - Number(b.rotated),
    );
    if (!choices.length) {
      unplaced.push(part);
      continue;
    }
    const c = choices[0],
      f = c.f;
    free.splice(c.i, 1);
    placements.push({
      ...part,
      x: f.x,
      y: f.y,
      w: c.w,
      h: c.h,
      rotated: c.rotated,
    });
    if (f.w - c.w - p.kerf > 0)
      free.push({
        x: f.x + c.w + p.kerf,
        y: f.y,
        w: f.w - c.w - p.kerf,
        h: c.h,
      });
    if (f.h - c.h - p.kerf > 0)
      free.push({
        x: f.x,
        y: f.y + c.h + p.kerf,
        w: f.w,
        h: f.h - c.h - p.kerf,
      });
  }
  return {
    placements,
    unplaced,
    free,
    used_area: placements.reduce((s, p) => s + p.w * p.h, 0),
    method: mode,
  };
}
export function compute(raw) {
  const p = validate(raw),
    parts = pieces(p),
    candidates = ["area", "long-side"].map((mode) => pack(parts, p, mode));
  candidates.sort(
    (a, b) =>
      b.used_area - a.used_area || b.placements.length - a.placements.length,
  );
  const r = candidates[0];
  return {
    ...r,
    sheet_w: p.sheet_w,
    sheet_h: p.sheet_h,
    kerf: p.kerf,
    part_count: parts.length,
    waste_percent: 100 * (1 - r.used_area / (p.sheet_w * p.sheet_h)),
    complete: r.unplaced.length === 0,
    units: "mm / mm²",
    optimality: "best of two deterministic guillotine heuristics",
  };
}
export function exportResult(input) {
  const r = compute(input);
  return {
    type: "text/csv; charset=utf-8",
    extension: "csv",
    text:
      "piece,x_mm,y_mm,width_mm,height_mm,rotated,status\n" +
      r.placements
        .map((p) => [p.id, p.x, p.y, p.w, p.h, p.rotated, "placed"].join(","))
        .concat(
          r.unplaced.map((p) =>
            [p.id, "", "", p.w, p.h, false, "unplaced"].join(","),
          ),
        )
        .join("\n") +
      "\n",
  };
}
export const service = { meta, validate, compute, export: exportResult };
