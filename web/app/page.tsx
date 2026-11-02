import Simulator from "@/components/Simulator";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="text-3xl font-bold">Degraded-Mode Guard</h1>
      <p className="text-sm opacity-80">
        Prototipo de investigación, <strong>no operativo ni certificado</strong>. Reconstrucción simplificada a partir de fuentes públicas
        (provisionales) del accidente del 28-oct-2026 en Toledo. Respeto y recuerdo para las víctimas.
      </p>
      <p>
        Prueba el escenario: cae el LZB, el control autoriza al AVE en marcha normal con el Iryo detenido por delante.
        Con la guarda desactivada, el modelo reproduce la colisión; con ella activa, la autorización se bloquea y se exige marcha a la vista.
        El modelo formal (TLA+) y el motor de reglas que usa esta página están en el repositorio.
      </p>
      <Simulator />
    </main>
  );
}
