import { canAuthorize, type Mode, type State, type TrainId } from "./canAuthorize";

export interface Sim extends State { auth: Record<TrainId, Mode | "none">; collision: boolean; log: string[] }

export const initialSim = (): Sim => ({
  n: 6, lzb: true, pos: { A: 1, I: 3 }, moving: { A: true, I: true }, auth: { A: "none", I: "none" }, collision: false, log: [],
});

const occupied = (s: Sim, cell: number, t: TrainId) => cell <= s.n && Object.keys(s.pos).some((u) => u !== t && s.pos[u] === cell);

/** Un paso de tiempo: espejo de MoveLZB / MoveDegraded del modelo TLA+. */
export function tick(s: Sim): Sim {
  if (s.collision) return s;
  const next: Sim = structuredClone(s);
  for (const t of Object.keys(s.pos)) {
    if (!next.moving[t] || next.pos[t] > next.n) continue;
    const nxt = next.pos[t] + 1;
    if (next.lzb || next.auth[t] === "sight") {
      if (occupied(next, nxt, t)) { next.moving[t] = false; next.auth[t] = "none"; next.log.push(`${t} se detiene ante el tren de delante.`); continue; }
    }
    next.pos[t] = nxt;
    if (nxt > next.n) { next.moving[t] = false; next.auth[t] = "none"; }
    if (occupied(next, nxt, t)) { next.collision = true; next.log.push(`COLISION: ${t} entra en la seccion ${nxt} ocupada.`); }
  }
  return next;
}

export function failLZB(s: Sim): Sim {
  const next = structuredClone(s);
  next.lzb = false;
  for (const t of Object.keys(next.moving)) next.moving[t] = false;
  next.log.push("Cae el LZB: todos los trenes se detienen.");
  return next;
}

/** Intenta autorizar. Con guarda ON consulta canAuthorize; con guarda OFF solo aplica precondiciones fisicas. */
export function authorize(s: Sim, t: TrainId, mode: Mode, guardOn: boolean): { sim: Sim; blocked: string[] } {
  const verdict = canAuthorize(s, t, mode);
  const physical = s.lzb || s.moving[t] || s.pos[t] > s.n;
  if (physical) return { sim: s, blocked: verdict.reasons };
  if (guardOn && verdict.verdict === "block") return { sim: s, blocked: verdict.reasons };
  const next = structuredClone(s);
  next.moving[t] = true; next.auth[t] = mode;
  next.log.push(`Control autoriza a ${t} en marcha ${mode === "sight" ? "a la vista (<=40 km/h)" : "NORMAL"}.`);
  return { sim: next, blocked: [] };
}
