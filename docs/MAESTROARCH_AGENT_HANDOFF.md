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

- P0-016 sigue activo.
- Proyecto Vercel `control-plane` creado y vinculado al repo `sebastisnzoth/maestroarch`.
- `control-plane/vercel.json` mantiene Git deployments habilitados y fija install/build commands.
- El rate limit Hobby dejó de bloquear nuevos builds.
- El control plane ya está desplegado en producción y responde correctamente.
- Falta únicamente conectar la credencial server-side del worker en el proyecto Vercel correcto y revalidar el flujo remoto.

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
- `control-plane/vercel.json` con Git deployments habilitados.

## VALIDATED

- CI #84 para commit `357e7e5088b47cfc3ca448d9b4b972da10b40d8a` finalizó `success` y validó typecheck, tests, smoke de app generada y build del control plane.
- El commit `5e1f1dd51dc32776482a3317445ae56c824a5cef` disparó un deployment Vercel nuevo, demostrando que el rate limit temporal ya no bloquea builds.
- Deployment de producción `dpl_A4n4u8Z7ayZ1v8sjCXZ9EjFNRALg` terminó `READY`.
- Build Vercel completó correctamente: Next.js compiló, typecheck pasó, páginas estáticas y funciones `/api/build` y `/api/runs` fueron generadas.
- `https://control-plane-inky-sigma.vercel.app/` respondió HTTP 200 con la UI MaestroArch.
- `https://control-plane-inky-sigma.vercel.app/api/runs` respondió HTTP 500 con el error exacto `MAESTROARCH_CONTROL_GITHUB_TOKEN no está configurado.`, confirmando que la función server-side está alcanzable pero el secreto no existe en el runtime de producción actual.

## RELEASED

- Control plane web desplegado y verificado en producción: `https://control-plane-inky-sigma.vercel.app/`.
- P0-016 todavía NO está `done` porque falta la credencial server-side y, por lo tanto, no se puede validar todavía el disparo del worker remoto desde la web.

## BLOCKED

### B1 · Falta `MAESTROARCH_CONTROL_GITHUB_TOKEN` en runtime de producción

**Evidencia exacta:** `/api/runs` en la URL productiva responde HTTP 500 con `MAESTROARCH_CONTROL_GITHUB_TOKEN no está configurado.`

**Qué falta:** guardar el token fino de GitHub como variable de entorno del proyecto Vercel `control-plane` para Production; idealmente también Preview si se desea probar previews.

**Dónde:** Vercel → proyecto `control-plane` → Settings → Environment Variables.

**Nombre exacto:**

```text
MAESTROARCH_CONTROL_GITHUB_TOKEN
```

**Por qué bloquea:** `/api/build` y `/api/runs` leen esa variable exclusivamente del servidor para disparar y consultar `.github/workflows/product-builder.yml` sin exponer el secreto al navegador.

**Resultado esperado:** `/api/runs` deja de devolver 500 por ausencia de token y `/api/build` puede encolar el workflow remoto.

**Retomar después:** redeploy productivo → validar `/api/runs` → disparar idea de smoke test desde el control plane → verificar GitHub Actions → cerrar P0-016 si cumple aceptación.

**No hacer:** pegar el token en el repo, frontend, issue, README o chat.

## NEXT

1. Configurar `MAESTROARCH_CONTROL_GITHUB_TOKEN` en Production del proyecto Vercel `control-plane`.
2. Redeploy del control plane para que el runtime tome la variable.
3. Verificar `/api/runs` sin error de credencial.
4. Probar desde la web: idea → workflow remoto → ejecución verificable.
5. Si todo pasa, mover P0-016 a `done` en `src/tasks.ts` y elegir el siguiente cuello de botella real.

## COMMITS RELEVANTES

```text
09ce821  docs(codex): add autonomous execution protocol
882b31a  docs(handoff): add shared agent execution state
0adff9f  docs(agents): link Codex protocol and shared handoff
71b52b0  docs(handoff): record green CI and narrow P0-016 blocker
357e7e5  docs(release): add control plane hosted release runbook
c3dfb8e  docs(handoff): record Vercel project and trigger hosted deploy
4f3bb01  chore(vercel): enable git deployments for control plane
5e1f1dd  chore(deploy): retrigger control plane release
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
