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

- Preparación documental para operación autónoma entre usuario, Codex y ChatGPT.
- `CODEX.md` incorporado como protocolo de ejecución.
- Este handoff incorporado como estado compartido.

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

- CI previa ha validado typecheck, tests, smoke-build del proyecto generado y build del control plane en ejecuciones recientes.
- No asumir que un commit posterior está validado hasta verificar su ejecución exacta.

## RELEASED

- Aún no declarar el control plane de MaestroArch como `RELEASED` hasta verificar una URL hosted funcional correspondiente al estado actual.

## BLOCKED

### B1 · Credencial server-side del worker

**Falta:** configurar en el entorno hosted:

```text
MAESTROARCH_CONTROL_GITHUB_TOKEN
```

**Por qué bloquea:** el control plane necesita una credencial server-side para disparar de forma segura el workflow worker sin exponer el token al navegador.

**Acción mínima del usuario cuando sea estrictamente necesaria:** configurar esa variable segura en Vercel para el proyecto MaestroArch/control plane y confirmar que quedó disponible para el entorno correspondiente.

**No hacer:** pegar el token en el repo, frontend, issue, README o chat si puede evitarse.

## NEXT

1. Verificar que la CI más reciente correspondiente al estado actual esté verde.
2. Desplegar el control plane hosted.
3. Configurar/confirmar `MAESTROARCH_CONTROL_GITHUB_TOKEN` server-side.
4. Probar desde la web: idea → workflow remoto → app generada → validación.
5. Si todo pasa, mover P0-016 a `done` en `src/tasks.ts`.
6. Crear el siguiente P0 preguntando: **¿qué impide ahora conseguir el primer usuario real?**

## COMMITS RELEVANTES

```text
09ce821  docs(codex): add autonomous execution protocol
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
