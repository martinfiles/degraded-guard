"use client";
import { useState } from "react";
import { authorize, failLZB, initialSim, tick, type Sim } from "../../engine/src/sim";

const NAMES: Record<string, string> = { A: "AVE (Renfe)", I: "Iryo" };

export default function Simulator() {
  const [sim, setSim] = useState<Sim>(initialSim());
  const [guard, setGuard] = useState(true);
  const [blocked, setBlocked] = useState<string[]>([]);

  const act = (fn: (s: Sim) => Sim) => { setBlocked([]); setSim(fn); };
  const tryAuth = (t: string, mode: "sight" | "normal") => {
    const r = authorize(sim, t, mode, guard);
    setBlocked(r.blocked); setSim(r.sim);
  };
  const cells = Array.from({ length: sim.n }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div role="img" aria-label="Mapa de tramos" className="grid grid-cols-6 gap-1">
        {cells.map((c) => (
          <div key={c} className="min-h-20 rounded border border-[var(--line)] p-2 text-center text-sm">
            <div className="opacity-60">Tramo {c}</div>
            {Object.keys(sim.pos).filter((t) => sim.pos[t] === c).map((t) => (
              <div key={t} className={`mt-1 rounded px-1 py-0.5 text-xs font-semibold ${sim.collision ? "bg-red-600 text-white" : t === "A" ? "bg-sky-700 text-white" : "bg-amber-600 text-white"}`}>
                {NAMES[t]}{!sim.moving[t] ? " ■" : " ▶"}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-sm">Señalización LZB: <strong>{sim.lzb ? "operativa" : "CAÍDA (modo degradado)"}</strong>{sim.collision && <strong className="ml-3 text-red-600">COLISIÓN</strong>}</p>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={guard} onChange={(e) => { setGuard(e.target.checked); }} />
        Guarda dura activada (segundo par de ojos)
      </label>

      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={() => act(failLZB)} disabled={!sim.lzb}>1. Cae el LZB</button>
        <button className="btn" onClick={() => tryAuth("A", "normal")}>Autorizar AVE · marcha normal</button>
        <button className="btn" onClick={() => tryAuth("A", "sight")}>Autorizar AVE · a la vista</button>
        <button className="btn" onClick={() => tryAuth("I", "sight")}>Autorizar Iryo · a la vista</button>
        <button className="btn" onClick={() => act(tick)}>Avanzar un paso</button>
        <button className="btn" onClick={() => { setSim(initialSim()); setBlocked([]); }}>Reiniciar</button>
      </div>

      {blocked.length > 0 && (
        <div role="alert" className="rounded border border-amber-500 p-3 text-sm">
          <strong>Autorización bloqueada por la guarda:</strong>
          <ul className="list-disc pl-5">{blocked.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      )}
      <ol className="list-decimal pl-5 text-sm opacity-80">{sim.log.map((l, i) => <li key={i}>{l}</li>)}</ol>
    </div>
  );
}
