# Borradores de posts (revisar con alguien del sector antes de publicar)

## Post 1 — El problema
El 28 de octubre murieron 69 personas cerca de Toledo. Antes que nada: mi respeto a las víctimas y a sus familias.
Según la información pública (provisional, falta el informe de AITAT), cayó la señalización LZB, el control pasó a un modo de respaldo y se autorizó la marcha de un tren sin confirmar que la vía delante estaba libre.
Me pregunté: ¿se puede demostrar formalmente dónde está el punto débil de ese protocolo y qué barrera lo cubriría? Esta serie cuenta lo que construí. #SeguridadFerroviaria #MétodosFormales

## Post 2 — El modelo
Modelé el modo degradado en TLA+ (dos trenes, seis tramos). Tres escenarios:
- Solo marcha a la vista: seguro.
- El control puede autorizar marcha normal: el verificador (TLC) encuentra la colisión en 5 pasos.
- Con una guarda que bloquea la marcha normal si hay un tren delante: seguro, y sin bloquear el servicio.
Matiz importante: si se cumple el procedimiento, el modelo ya es seguro. La guarda solo importa cuando alguien se desvía, y las personas, bajo estrés, se desvían.

## Post 3 — La herramienta
Convertí la guarda en un motor de reglas y lo validé contra la traza del contraejemplo del modelo: el motor bloquea exactamente el paso fatal. Hay una demo interactiva para ver el escenario con la guarda activada y desactivada. Código abierto.

## Post 4 — Limitaciones y llamada
Es un prototipo de investigación, no un sistema certificado (EN 50128/50129) ni representa el procedimiento real de Adif. Modelo simplificado, datos provisionales. Busco a profesionales de señalización y circulación que lo revisen y lo desmonten. ¿Quién se anima?
