import { describe, it, expect } from "vitest";
import { initialSim, failLZB, authorize, tick } from "../src/sim";

const run = (guard: boolean) => {
  let s = failLZB(initialSim());
  const r = authorize(s, "A", "normal", guard); s = r.sim;
  for (let i = 0; i < 4; i++) s = tick(s);
  return { s, blocked: r.blocked };
};
describe("escenario 28-oct", () => {
  it("sin guarda: colision", () => expect(run(false).s.collision).toBe(true));
  it("con guarda: bloquea y no hay colision", () => { const r = run(true); expect(r.blocked.length).toBeGreaterThan(0); expect(r.s.collision).toBe(false); });
  it("a la vista no colisiona aunque la guarda este apagada", () => {
    let s = failLZB(initialSim()); s = authorize(s, "A", "sight", false).sim;
    for (let i = 0; i < 6; i++) s = tick(s);
    expect(s.collision).toBe(false);
  });
});
