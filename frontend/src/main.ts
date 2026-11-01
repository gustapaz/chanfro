import { h, createProjector } from "maquette";
import { initClient } from "@ts-rest/core";
import { contract } from "../../server/contract.mjs";
import { model } from "./model";
import { canvasStage } from "./canvas";
import { motionToggle } from "./client";
const projector = createProjector(),
  client = initClient(contract, { baseUrl: location.origin, baseHeaders: {} });
let selected = "",
  first = 0,
  last: any;
const stage = canvasStage(
  document.querySelector<HTMLCanvasElement>("#sheet")!,
  (ctx, w, ht, t, r) => {
    ctx.clearRect(0, 0, w, ht);
    if (!r) return false;
    if (last !== r) {
      last = r;
      first = performance.now();
    }
    const scale = Math.min((w - 85) / r.sheet_w, (ht - 80) / r.sheet_h),
      x = (w - r.sheet_w * scale) / 2,
      y = (ht - r.sheet_h * scale) / 2,
      elapsed = t ? performance.now() - first : 0;
    ctx.fillStyle = "#e8e4d7";
    ctx.fillRect(x, y, r.sheet_w * scale, r.sheet_h * scale);
    ctx.strokeStyle = "#344e43";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, r.sheet_w * scale, r.sheet_h * scale);
    ctx.font = "9px monospace";
    ctx.fillStyle = "#344e43";
    ctx.textAlign = "center";
    for (let i = 0; i <= r.sheet_w; i += 100) {
      ctx.beginPath();
      ctx.moveTo(x + i * scale, y - 7);
      ctx.lineTo(x + i * scale, y - 13);
      ctx.stroke();
      ctx.fillText(String(i), x + i * scale, y - 23);
    }
    ctx.textAlign = "right";
    for (let i = 0; i <= r.sheet_h; i += 100) {
      ctx.beginPath();
      ctx.moveTo(x - 7, y + i * scale);
      ctx.lineTo(x - 13, y + i * scale);
      ctx.stroke();
      ctx.fillText(String(i), x - 18, y + i * scale + 3);
    }
    r.free.forEach((f: any) => {
      ctx.fillStyle = "#d1d4c222";
      ctx.fillRect(x + f.x * scale, y + f.y * scale, f.w * scale, f.h * scale);
    });
    r.placements.forEach((p: any, i: number) => {
      const progress = t
          ? Math.min(1, Math.max(0, (elapsed - i * 45) / 450))
          : 1,
        px = x + p.x * scale,
        py = y + p.y * scale,
        pw = p.w * scale,
        ph = p.h * scale;
      ctx.save();
      ctx.beginPath();
      ctx.rect(px, py, pw, ph * progress);
      ctx.clip();
      ctx.fillStyle =
        selected === p.id
          ? "#d75c32"
          : ["#b9c9b6", "#c5d0be", "#9eb79f", "#d0d4ba"][i % 4];
      ctx.fillRect(px, py, pw, ph);
      ctx.strokeStyle = "#324c3c";
      ctx.lineWidth = selected === p.id ? 3 : 1;
      ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      ctx.fillStyle = selected === p.id ? "#fff8e7" : "#273b30";
      ctx.textAlign = "center";
      ctx.font = `${Math.max(8, Math.min(13, pw * 0.15))}px monospace`;
      ctx.fillText(p.id, px + pw / 2, py + ph / 2 - 2);
      if (pw > 65 && ph > 35) {
        ctx.font = "8px monospace";
        ctx.fillText(p.w + " × " + p.h, px + pw / 2, py + ph / 2 + 13);
      }
      ctx.restore();
    });
    return elapsed < r.placements.length * 45 + 500;
  },
);
const a = model(
  "chanfro",
  () => projector.scheduleRender(),
  (r) => {
    selected = "";
    stage.set(r);
  },
);
const d = a.d;
a.api.compute = async (input) => {
  const r = await client.calculate({ body: input });
  if (r.status !== 200)
    throw new Error(
      (r.body as any).message ?? "O contrato não aceitou esta chapa.",
    );
  return r.body;
};
const button = (text: string, fn: any, disabled = false, cls = "") =>
  h(
    "button" + (cls ? "." + cls : ""),
    { key: text, onclick: fn, disabled: d.busy || disabled },
    [text],
  );
const ranges = [
  ["sheet_w", "Largura da chapa", 600, 1800, 50, "mm"],
  ["sheet_h", "Altura da chapa", 400, 1200, 50, "mm"],
  ["kerf", "Espessura da serra", 0, 8, 1, "mm"],
  ["copies", "Repetições do conjunto", 1, 3, 1, "×"],
];
function view() {
  return h("div.console", [
    h("div.title-row", [
      h("span", ["01 / DEFINIR A CHAPA"]),
      h("span", ["CONTRATO ts-rest"]),
    ]),
    d.catalog
      ? h("div.controls", [
          h("label", [
            "Conjunto de peças",
            h(
              "select",
              {
                key: "kit",
                "aria-label": "Conjunto de peças",
                value: d.input.kit,
                onchange: (e: Event) =>
                  a.change("kit", (e.target as HTMLSelectElement).value),
              },
              Object.keys(d.catalog.kits).map((id, i) =>
                h("option", { key: id, value: id }, [
                  ["Banco", "Prateleira", "Moldura"][i],
                ]),
              ),
            ),
          ]),
          ...ranges.map(([key, label, min, max, step, unit]) =>
            h("label", { key: key as string }, [
              h("span", [
                label as string,
                h("output", [String(d.input[key as string]) + " " + unit]),
              ]),
              h("input", {
                type: "range",
                "aria-label": label,
                min,
                max,
                step,
                value: d.input[key as string],
                disabled: d.busy,
                oninput: (e: Event) =>
                  a.change(
                    key as string,
                    +(e.target as HTMLInputElement).value,
                  ),
              }),
            ]),
          ),
          h("label.rotation", [
            h("input", {
              type: "checkbox",
              "aria-label": "Permitir rotação das peças",
              checked: d.input.rotate,
              onchange: (e: Event) =>
                a.change("rotate", (e.target as HTMLInputElement).checked),
            }),
            "Permitir rotação de 90°",
          ]),
          button(
            d.busy ? "Planejando…" : "Compor o corte ↗",
            () => a.run(),
            false,
            "compose",
          ),
        ])
      : button("Tentar abrir a bancada", () => a.init()),
    h("p.status", { role: "status" }, [d.error || d.status]),
    d.catalog
      ? h(
          "div.presets",
          d.catalog.presets.map((p: any) =>
            button(p.name + " ↗", () => a.preset(p)),
          ),
        )
      : null,
    d.result
      ? h("div.yield", [
          h("span", ["APROVEITAMENTO"]),
          h("strong", [
            (100 - d.result.waste_percent).toFixed(1),
            h("small", [" %"]),
          ]),
          h("p", [
            d.result.placements.length +
              " de " +
              d.result.part_count +
              " peças · " +
              d.result.unplaced.length +
              " fora do plano",
          ]),
        ])
      : null,
    d.result
      ? h("details.cutting-list", [
          h("summary", ["02 / LISTA DE CORTE"]),
          h("p", ["Selecione uma peça para localizá-la na chapa."]),
          ...d.result.placements.map((p: any) =>
            h(
              "button.piece-row",
              {
                key: p.id,
                "aria-pressed": String(selected === p.id),
                onclick: () => {
                  selected = selected === p.id ? "" : p.id;
                  stage.redraw();
                  projector.scheduleRender();
                },
              },
              [
                h("b", [p.id]),
                h("span", [p.label]),
                h("small", [p.w + " × " + p.h + " mm"]),
              ],
            ),
          ),
          ...d.result.unplaced.map((p: any) =>
            h("p.unplaced", { key: p.id }, [
              p.id + " · " + p.label + " · sem espaço",
            ]),
          ),
        ])
      : null,
    h("details.archive", [
      h("summary", ["03 / GUARDAR O PLANO"]),
      h("label", [
        "Nome do plano",
        h("input", {
          "aria-label": "Nome do plano",
          maxlength: 48,
          value: d.title,
          oninput: (e: Event) => a.title((e.target as HTMLInputElement).value),
        }),
      ]),
      button(
        d.current && d.owns ? "Salvar alterações ↗" : "Guardar plano ↗",
        () => a.save(),
        !d.result,
      ),
      d.current
        ? h("div.tools", [
            button("Reler do banco", () => a.open(d.current.id)),
            button("Exportar CSV ↓", () => a.download()),
            d.owns
              ? button(
                  d.current.published ? "Encerrar link" : "Criar link",
                  () => a.share(),
                )
              : null,
            button("Novo plano", () => a.fresh()),
          ])
        : null,
      d.link
        ? h("a", { href: d.link, target: "_blank", rel: "noreferrer" }, [
            "Abrir plano compartilhado ↗",
          ])
        : null,
      h("small", [
        "Registros sintéticos por 7 dias. Edição nesta aba. CSV da revisão salva.",
      ]),
      h("div.saved", [
        h("span", ["Planos desta aba (" + d.archive.length + ")"]),
        ...d.archive.map((x: any) =>
          button(x.title + " ↗", () => a.open(x.id)),
        ),
      ]),
    ]),
    h("p.model-note", [
      "Heurística guilhotinada. Não considera veio, fixação ou propriedades estruturais. Não é instrução de operação de ferramentas.",
    ]),
  ]);
}
const host = document.querySelector("#app-root")!;
host.replaceChildren();
projector.append(host, view);
motionToggle((v) => stage.pause(v));
void a.init();
if (new URL(location.href).searchParams.has("record"))
  document.querySelector("#parameters")?.scrollIntoView();
