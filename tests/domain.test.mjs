import { test } from "node:test";
import assert from "node:assert/strict";
import { service } from "../server/service.mjs";

test("every rectangle fits the sheet", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    for (const b of r.placements)
      assert.ok(
        b.x >= 0 &&
          b.y >= 0 &&
          b.x + b.w <= p.input.sheet_w &&
          b.y + b.h <= p.input.sheet_h,
      );
  }
});
test("independent pairwise oracle confirms nonoverlap and kerf separation", () => {
  for (const p of service.meta.presets) {
    const r = service.compute(p.input);
    for (let i = 0; i < r.placements.length; i++)
      for (let j = i + 1; j < r.placements.length; j++) {
        const a = r.placements[i],
          b = r.placements[j],
          k = p.input.kerf;
        assert.ok(
          a.x + a.w + k <= b.x ||
            b.x + b.w + k <= a.x ||
            a.y + a.h + k <= b.y ||
            b.y + b.h + k <= a.y,
        );
      }
  }
});
test("each requested piece appears exactly once in placed or remainder", () => {
  const r = service.compute(service.meta.default_input),
    all = [...r.placements, ...r.unplaced];
  assert.equal(new Set(all.map((p) => p.id)).size, r.part_count);
  assert.equal(all.length, r.part_count);
});
test("reported area and waste agree with independent arithmetic", () => {
  const p = service.meta.default_input,
    r = service.compute(p);
  assert.equal(
    r.used_area,
    r.placements.reduce((s, b) => s + b.w * b.h, 0),
  );
  assert.ok(
    Math.abs(
      r.waste_percent - (1 - r.used_area / (p.sheet_w * p.sheet_h)) * 100,
    ) < 1e-8,
  );
});
test("tiny sheet and many copies produce honest partial result", () => {
  const r = service.compute({
    ...service.meta.default_input,
    sheet_w: 600,
    sheet_h: 400,
    copies: 3,
  });
  assert.ok(!r.complete && r.unplaced.length);
  assert.equal(service.export(service.meta.default_input).extension, "csv");
});
test("rotation flag and input constraints enforced", () => {
  const p = { ...service.meta.default_input, rotate: false };
  assert.ok(service.compute(p).placements.every((x) => !x.rotated));
  for (const x of [{ kerf: -1 }, { copies: 4 }, { sheet_w: 0 }, { extra: 1 }])
    assert.throws(() => service.compute({ ...p, ...x }));
});
