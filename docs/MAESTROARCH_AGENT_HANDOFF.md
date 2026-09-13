# MaestroArch — Agent Handoff

**Estado:** operativo  
**Rama:** `main`  
**Uso:** buzón compartido entre ChatGPT, Codex y otros agentes  
**Regla:** verificar siempre contra `main` y `src/tasks.ts` antes de confiar en este archivo.

## CURRENT P0

**P0-016 · Desplegar control plane hosted y conectar credencial segura del worker.**

### Criterio de cierre

- URL Vercel activa;
- token GitHub disponible sólo server-side;
- el control plane puede disparar el worker remoto desde la web;
- la ejecución remota queda verificable;
- no se expone ningún secreto al cliente;
- la CI/build aplicable permanece verde.

## IN PROGRESS

- P0-016 preparado técnicamente.
- Proyecto Vercel `control-plane` creado y vinculado al repo `sebastisnzoth/maestroarch`.
- Se fuerza un nuevo commit en `main` para disparar el deploy mediante la integración Git de Vercel.

## LAST COMPLETED

- P0-001 a P0-015 figuran `done` en `src/tasks.ts`.
- Ya existe runtime de agentes.
- Ya existe generación de app web específica por dominio.
- Ya existe Model Router con fallback local.
- Ya existe persistencia local-first y Supabase opcional.
- Ya existe auth + RLS generada para modo remoto.
- Ya existe publicación GitHub/deploy opcional desde control plane.
- Ya existe smoke-build de una app generada en CI.
- Ya existe control plane Vercel-native con GitHub Actions worker.
- `CODEX.md` y este handoff ya están integrados con `AGENTS.md`.

## IMPLEMENTED

- Orchestrator + Product + CTO + Full Stack + QA/Security + Repo/DevOps.
- `src/tasks.ts` como fuente de verdad del backlog P0.
- control plane hosted.
- worker vía GitHub Actions.
- generación Next.js interactiva.
- flujo específico por dominio.
- persistencia local y remota opcional.
- auth/RLS opcional.
- CI con typecheck, tests, smoke generated app y build del control plane.
- `CODEX.md` como protocolo de continuidad.
- `docs/MAESTROARCH_AGENT_HANDOFF.md` como handoff operativo.

## VALIDATED

- CI #84 para commit `357e7e5088b47cfc3ca448d9b4b972da10b40d8a` finalizó `success`.
- Esa ejecución validó typecheck, tests, smoke de app generada y build del control plane hosted.
- No declarar como validado ningún cambio posterior sin revisar su ejecución exacta.

## RELEASED

- Aún no declarar el control plane de MaestroArch como `RELEASED` hasta verificar una URL hosted funcional correspondiente al estado actual.

## BLOCKED

### B1 · Credencial server-side del worker

**Falta por verificar:** que `MAESTROARCH_CONTROL_GITHUB_TOKEN` esté guardado en el entorno hosted correcto y funcione en runtime.

**Dónde:** Vercel → proyecto `control-plane` → Settings → Environment Variables.

**Por qué bloquea:** el control plane necesita una credencial server-side para disparar de forma segura el workflow worker sin exponer el token al navegador.

**Resultado esperado:** la API server-side del control plane podrá disparar `.github/workflows/product-builder.yml` en `sebastisnzoth/maestroarch`.

**Retomar después:** deploy hosted → prueba idea → workflow remoto → app generada → validación → cerrar P0-016.

**No hacer:** pegar el token en el repo, frontend, issue, README o chat si puede evitarse.

## NEXT

1. Verificar que Vercel cree el deployment a partir de este commit en `main`.
2. Abrir la URL hosted y comprobar respuesta.
3. Probar desde la web: idea → workflow remoto → app generada → validación.
4. Si todo pasa, mover P0-016 a `done` en `src/tasks.ts`.
5. Crear el siguiente P0 preguntando: **¿qué impide ahora conseguir el primer usuario real?**

## COMMITS RELEVANTES

```text
09ce821  docs(codex): add autonomous execution protocol
882b31a  docs(handoff): add shared agent execution state
0adff9f  docs(agents): link Codex protocol and shared handoff
71b52b0  docs(handoff): record green CI and narrow P0-016 blocker
357e7e5  docs(release): add control plane hosted release runbook
```

## HANDOFF CONTRACT

El agente que inicia:
- lee `AGENTS.md`, `CODEX.md`, este archivo y `src/tasks.ts`;
- verifica estado real de `main`;
- corrige cualquier divergencia antes de seguir.

El agente que termina un bloque:
- actualiza este archivo;
- actualiza `src/tasks.ts` si cambió el estado real de P0;
- registra evidencia exacta;
- deja un `NEXT` concreto;
- no pide otro “seguí” si existe trabajo desbloqueado.
