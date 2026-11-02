# Degraded-Mode Guard
Verificación formal (TLA+/TLC) y asistente de decisión para el modo degradado ferroviario, inspirado en el accidente del 28-oct-2026 (Toledo). **Prototipo de investigación, no operativo.** Ver `docs/`.

## Reproducir
```
# Modelo formal (Java 17+, tools/tla2tools.jar)
cd spec
java -cp ../tools/tla2tools.jar tlc2.TLC -config Protocol.cfg  -deadlock DegradedMode.tla   # seguro
java -cp ../tools/tla2tools.jar tlc2.TLC -config Deviation.cfg -deadlock DegradedMode.tla   # contraejemplo (colision)
java -cp ../tools/tla2tools.jar tlc2.TLC -config Guarded.cfg   -deadlock DegradedMode.tla   # seguro con guarda
python ../scripts/export_trace.py Deviation        # traza -> spec/traces/Deviation.json
# Motor + conformidad
cd ../engine && npm install && npm test
# Web
cd ../web && npm install && npm run dev
```
