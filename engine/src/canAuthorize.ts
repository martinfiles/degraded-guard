/** Motor de reglas espejo del modelo TLA+ `spec/DegradedMode.tla` (variante Guarded). Prototipo NO operativo. */
export type TrainId = string;
export type Mode = "sight" | "normal";
export interface State {
  /** Secciones 1..n; n+1 = fuera del tramo. */
  n: number;
  lzb: boolean;
  pos: Record<TrainId, number>;
  moving: Record<TrainId, boolean>;
}
export interface Decision { verdict: "allow" | "block"; reasons: string[] }

export function trainAhead(s: State, t: TrainId): TrainId[] {
  return Object.keys(s.pos).filter((u) => u !== t && s.pos[u] > s.pos[t] && s.pos[u] <= s.n);
}

/** Decide si el control puede autorizar `t` a reanudar la marcha con `mode`. */
export function canAuthorize(s: State, t: TrainId, mode: Mode): Decision {
  const reasons: string[] = [];
  if (s.lzb) reasons.push("LZB operativo: no se requiere autorizacion de modo degradado.");
  if (s.moving[t]) reasons.push(`El tren ${t} ya esta en marcha.`);
  if (s.pos[t] > s.n) reasons.push(`El tren ${t} ya salio del tramo.`);
  if (mode === "normal") {
    const ahead = trainAhead(s, t);
    if (ahead.length > 0)
      reasons.push(`Marcha normal bloqueada: tren(es) ${ahead.join(", ")} por delante dentro del tramo sin confirmar libre. Usar marcha a la vista (<=40 km/h).`);
  }
  return reasons.length ? { verdict: "block", reasons } : { verdict: "allow", reasons: [] };
}
