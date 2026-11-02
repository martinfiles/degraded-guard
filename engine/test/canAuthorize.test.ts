import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { canAuthorize, trainAhead, type State } from "../src/canAuthorize";

const base = (): State => ({ n: 6, lzb: false, pos: { A: 1, I: 3 }, moving: { A: false, I: false } });

describe("canAuthorize", () => {
  it("bloquea marcha normal de A con I detenido por delante (patron 28-oct)", () => {
    const d = canAuthorize(base(), "A", "normal");
    expect(d.verdict).toBe("block");
    expect(d.reasons.join(" ")).toMatch(/por delante/);
  });
  it("permite marcha a la vista", () => expect(canAuthorize(base(), "A", "sight").verdict).toBe("allow"));
  it("permite marcha normal cuando no hay tren por delante", () => {
    const s = base(); s.pos.I = 7;
    expect(canAuthorize(s, "A", "normal").verdict).toBe("allow");
  });
  it("propiedad: marcha normal permitida => ningun tren por delante en el tramo", () =>
    fc.assert(fc.property(fc.integer({ min: 1, max: 7 }), fc.integer({ min: 1, max: 7 }), (a, i) => {
      const s: State = { n: 6, lzb: false, pos: { A: a, I: i }, moving: { A: false, I: false } };
      return canAuthorize(s, "A", "normal").verdict !== "allow" || trainAhead(s, "A").length === 0;
    })));
});
