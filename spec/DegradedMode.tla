------------------------------ MODULE DegradedMode ------------------------------
(***************************************************************************)
(* Modelo abstracto (NO operativo) del modo degradado tras la caida del    *)
(* LZB en una linea de alta velocidad. Dos trenes: "I" delante (detenido), *)
(* "A" detras. Las secciones son 1..N; N+1 significa "fuera del tramo".   *)
(*                                                                         *)
(* Constantes de escenario:                                                *)
(*   AllowDeviation: el controlador puede autorizar marcha NORMAL en       *)
(*                   degradado (desviacion respecto al procedimiento).     *)
(*   GuardOn:        la "guarda dura" bloquea la marcha normal si hay un   *)
(*                   tren por delante aun dentro del tramo.                *)
(*                                                                         *)
(* Suposiciones: ver docs/ASSUMPTIONS.md. Fuentes: docs/SOURCES.md.        *)
(***************************************************************************)
EXTENDS Naturals

CONSTANTS N, GuardOn, AllowDeviation
ASSUME N \in Nat /\ N >= 4
ASSUME GuardOn \in BOOLEAN /\ AllowDeviation \in BOOLEAN

Trains == {"A", "I"}
Out    == N + 1
Modes  == {"none", "sight", "normal"}

VARIABLES lzb,      \* TRUE si el LZB esta operativo
          pos,      \* posicion (seccion) de cada tren
          moving,   \* TRUE si el tren esta en marcha
          auth      \* modo con el que fue autorizado en degradado

vars == <<lzb, pos, moving, auth>>

TypeOK == /\ lzb \in BOOLEAN
          /\ pos \in [Trains -> 1..Out]
          /\ moving \in [Trains -> BOOLEAN]
          /\ auth \in [Trains -> Modes]

Init == /\ lzb = TRUE
        /\ pos = [t \in Trains |-> IF t = "A" THEN 1 ELSE 3]
        /\ moving = [t \in Trains |-> TRUE]
        /\ auth = [t \in Trains |-> "none"]

\* Seccion s (dentro del tramo) ocupada por un tren distinto de t.
Occupied(s, t) == s <= N /\ \E u \in Trains \ {t} : pos[u] = s

\* Hay otro tren por delante de t que aun no ha salido del tramo.
TrainAhead(t) == \E u \in Trains \ {t} : pos[u] > pos[t] /\ pos[u] <= N

(* Con LZB operativo la supervision continua mantiene la distancia. *)
MoveLZB(t) ==
    /\ lzb /\ moving[t] /\ pos[t] <= N
    /\ ~Occupied(pos[t] + 1, t)
    /\ pos' = [pos EXCEPT ![t] = pos[t] + 1]
    /\ UNCHANGED <<lzb, moving, auth>>

(* Fallo del LZB: todos los trenes se detienen automaticamente. *)
LZBFail ==
    /\ lzb
    /\ lzb' = FALSE
    /\ moving' = [t \in Trains |-> FALSE]
    /\ UNCHANGED <<pos, auth>>

(* El control autoriza a un tren detenido a reanudar la marcha. *)
Authorize(t, mode) ==
    /\ ~lzb /\ ~moving[t] /\ pos[t] <= N
    /\ mode \in {"sight", "normal"}
    /\ mode = "normal" => (AllowDeviation /\ (~GuardOn \/ ~TrainAhead(t)))
    /\ moving' = [moving EXCEPT ![t] = TRUE]
    /\ auth' = [auth EXCEPT ![t] = mode]
    /\ UNCHANGED <<lzb, pos>>

(* Marcha en degradado. A la vista: el maquinista se detiene ante un       *)
(* obstaculo. Normal: ASFA solo actua en balizas, no hay proteccion entre   *)
(* ellas, y el tren avanza aunque la seccion siguiente este ocupada.        *)
MoveDegraded(t) ==
    /\ ~lzb /\ moving[t] /\ pos[t] <= N
    /\ LET nxt == pos[t] + 1 IN
       IF auth[t] = "sight" /\ Occupied(nxt, t)
       THEN /\ moving' = [moving EXCEPT ![t] = FALSE]
            /\ auth' = [auth EXCEPT ![t] = "none"]
            /\ UNCHANGED <<lzb, pos>>
       ELSE /\ pos' = [pos EXCEPT ![t] = nxt]
            /\ moving' = [moving EXCEPT ![t] = (nxt <= N)]
            /\ auth' = [auth EXCEPT ![t] = IF nxt <= N THEN auth[t] ELSE "none"]
            /\ UNCHANGED lzb

Progress(t) == MoveLZB(t) \/ MoveDegraded(t) \/ Authorize(t, "sight")

Done == /\ \A t \in Trains : pos[t] = Out
        /\ UNCHANGED vars

Next == LZBFail
        \/ (\E t \in Trains : MoveLZB(t) \/ MoveDegraded(t)
                              \/ Authorize(t, "sight") \/ Authorize(t, "normal"))
        \/ Done

(* Equidad por tren: ninguno queda eternamente sin avanzar. *)
Spec == Init /\ [][Next]_vars /\ \A t \in Trains : WF_vars(Progress(t))

(* Seguridad: dos trenes nunca comparten seccion dentro del tramo. *)
NoCollision == \A t, u \in Trains : (t # u /\ pos[t] = pos[u]) => pos[t] = Out

(* Vivacidad: la guarda no bloquea el sistema; ambos trenes acaban saliendo. *)
AllOut == <>(\A t \in Trains : pos[t] = Out)
=============================================================================
