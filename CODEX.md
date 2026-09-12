# MaestroArch — CODEX.md · Protocolo de ejecución para Codex

**Rama de verdad:** `main`  
**Autoridad superior:** `AGENTS.md`  
**Estado operativo compartido:** `docs/MAESTROARCH_AGENT_HANDOFF.md`

## Objetivo

Este archivo convierte al repositorio en el puente operativo entre el usuario, ChatGPT y Codex.

Codex debe poder entrar al repo, recuperar contexto, tomar el siguiente P0, trabajar de forma autónoma, validar, actualizar estado y commitear sin depender de prompts largos ni de un intermediario humano para decisiones rutinarias.

## Entrada obligatoria

Antes de modificar código, leer en este orden:

```text
AGENTS.md
→ CODEX.md
→ docs/MAESTROARCH_AGENT_HANDOFF.md
→ src/tasks.ts
→ README.md
→ arquitectura/documentación afectada
→ realidad actual de main
```

Pregunta obligatoria de priorización:

> **¿Qué impide hoy que MaestroArch tenga su primer usuario o cliente real?**

La respuesta gobierna qué P0 se toma primero.

## Modo autónomo

Una orden como:

```text
Seguí con los P0 de MaestroArch según AGENTS.md y CODEX.md.
```

autoriza a Codex a encadenar sin confirmaciones rutinarias:

```text
leer estado
→ auditar main
→ elegir siguiente P0 desbloqueado
→ marcarlo IN PROGRESS en el handoff
→ implementar
→ ejecutar validaciones aplicables
→ corregir automáticamente
→ revalidar
→ actualizar src/tasks.ts si cambió el estado real
→ actualizar handoff
→ commit
→ tomar el siguiente P0 desbloqueado
```

No pedir permiso por:
- archivos;
- estructura interna;
- refactors reversibles;
- dependencias gratuitas equivalentes;
- tests;
- fixes de typecheck/build;
- documentación;
- commits;
- orden de ejecución cuando el roadmap ya lo determina.

## Frenos reales

Detenerse únicamente cuando avanzar requiera uno de estos casos y no exista alternativa reversible segura:

- producción con consecuencia externa material;
- dinero real, compra, contratación o costo nuevo;
- credenciales, secretos o permisos externos no disponibles;
- operación destructiva o irreversible;
- exposición sensible de datos o seguridad;
- aceptación legal;
- contradicción material entre autoridades del proyecto;
- cambio sustancial del producto o del alcance.

Cuando exista un freno real, no limitarse a decir “bloqueado”. Registrar en `docs/MAESTROARCH_AGENT_HANDOFF.md`:

```text
BLOCKED
- qué falta
- por qué bloquea
- acción mínima exacta del usuario
- dónde hacerla
- resultado esperado
- qué retomar después
```

## Fuente de verdad del backlog

`src/tasks.ts` es la fuente de verdad del backlog P0 ejecutable.

Reglas:
- no crear una segunda lista divergente de tareas;
- un P0 pasa a `done` sólo cuando cumple aceptación y validación aplicable;
- si un P0 queda bloqueado por credenciales/costo/producción, mantenerlo activo y avanzar sólo en tareas que no escondan ese bloqueo;
- al cerrar un P0, crear o seleccionar el siguiente cuello de botella real si todavía no existe.

## Handoff operativo

`docs/MAESTROARCH_AGENT_HANDOFF.md` es el buzón compartido entre agentes.

Al comenzar:
1. leerlo;
2. contrastarlo con `main` y `src/tasks.ts`;
3. corregirlo si está desactualizado.

Al terminar un bloque significativo:
1. actualizar `CURRENT P0`;
2. mover el trabajo por estados `NEXT → IN PROGRESS → IMPLEMENTED → VALIDATED → RELEASED` según evidencia real;
3. registrar `BLOCKED` sólo si existe un bloqueo externo real;
4. registrar commits relevantes;
5. dejar `NEXT` accionable.

## Estados obligatorios

No mezclar madurez:

```text
NEXT        = próximo trabajo elegible
IN PROGRESS = trabajo activo
IMPLEMENTED = código integrado
VALIDATED   = pruebas/build/CI aplicables pasaron
RELEASED    = deploy o publicación externa verificada
BLOCKED     = no puede avanzar sin acción externa real
```

`IMPLEMENTED ≠ VALIDATED ≠ RELEASED`.

Nunca declarar CI verde, deploy correcto o integración funcionando sin evidencia de esa ejecución exacta.

## Validación

Usar los gates reales del repo según el cambio:

```bash
npm run typecheck
npm test
npm run smoke:generated
```

Si cambia el control plane hosted, validar además su build según la CI vigente.

Ante fallo:
1. identificar causa;
2. corregir;
3. repetir;
4. no marcar VALIDATED hasta verde.

## Git

- `main` es la rama de verdad salvo instrucción explícita distinta;
- no crear clones/rutas paralelas por rutina;
- commits pequeños, coherentes y descriptivos;
- no versionar secretos;
- no ejecutar operaciones destructivas de Git sin autorización.

## Regla de continuidad

Codex no debe detenerse al terminar una tarea si existe otro P0 desbloqueado.

Debe seguir automáticamente hasta que:
- no queden P0 ejecutables;
- aparezca uno de los frenos reales;
- el usuario cambie explícitamente el objetivo.

## Formato de salida

Al terminar una sesión o checkpoint, responder de forma compacta:

```text
IMPLEMENTED
- ...

VALIDATED
- ...

RELEASED
- ...

BLOCKED
- none | detalle exacto

NEXT
- siguiente P0 concreto

COMMITS
- <sha> <mensaje>
```

## Comando humano recomendado

Desde Terminal, dentro del repo:

```text
Seguí con los P0 de MaestroArch según AGENTS.md, CODEX.md y docs/MAESTROARCH_AGENT_HANDOFF.md. Trabajá sola y no me preguntes salvo decisión crítica.
```

Ese comando debe ser suficiente para retomar el proyecto.
