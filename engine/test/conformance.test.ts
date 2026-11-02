import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { canAuthorize, type State, type Mode } from "../src/canAuthorize";

interface TS { step: number; action: string; pos: Record<string, number>; moving: Record<string, boolean>; auth: Record<string, string>; lzb: boolean }
const trace = JSON.parse(readFileSync(new URL("../../spec/traces/Deviation.json", import.meta.url), "utf-8")) as { n: number; states: TS[] };
const toState = (s: TS): State => ({ n: trace.n, lzb: s.lzb, pos: s.pos, moving: s.moving });

describe("conformidad con el contraejemplo TLC (config Deviation)", () => {
  it("el motor bloquea el paso de autorizacion que lleva a la colision", () => {
    let checked = 0;
    for (let i = 1; i < trace.states.length; i++) {
      const prev = trace.states[i - 1], cur = trace.states[i];
      if (cur.action !== "Authorize") continue;
      const t = Object.keys(cur.auth).find((k) => cur.auth[k] !== prev.auth[k])!;
      const mode = cur.auth[t] as Mode;
      const d = canAuthorize(toState(prev), t, mode);
      if (mode === "normal") expect(d.verdict).toBe("block");
      else expect(d.verdict).toBe("allow");
      checked++;
    }
    expect(checked).toBeGreaterThan(0);
  });
});
