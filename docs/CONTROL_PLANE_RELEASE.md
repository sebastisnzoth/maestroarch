# MaestroArch — Control Plane Hosted Release Runbook

## Objetivo

Cerrar P0-016 sin exponer secretos y con evidencia reproducible.

## Precondiciones

- `main` con CI verde.
- `control-plane/` compila.
- workflow `.github/workflows/product-builder.yml` presente.
- `MAESTROARCH_CONTROL_GITHUB_TOKEN` configurado sólo server-side en Vercel.

## Variable crítica

```text
MAESTROARCH_CONTROL_GITHUB_TOKEN
```

Configurar en:

```text
Vercel
→ proyecto MaestroArch/control plane
→ Settings
→ Environment Variables
```

No colocar el valor en:
- repo;
- `.env.example` con valor real;
- frontend;
- logs;
- issues;
- documentación;
- chat.

## Permiso mínimo esperado

La credencial debe permitir disparar el workflow del repositorio `sebastisnzoth/maestroarch` y consultar su estado. Evitar permisos más amplios que los necesarios.

## Secuencia de release

1. Confirmar CI verde del commit a desplegar.
2. Desplegar el control plane.
3. Abrir la URL hosted.
4. Enviar una idea de prueba de bajo riesgo.
5. Verificar que el control plane dispare `product-builder.yml`.
6. Verificar que GitHub Actions reciba la ejecución.
7. Verificar generación del producto.
8. Verificar build/validación del producto generado.
9. Confirmar que el navegador nunca recibe el token.
10. Registrar URL, workflow/run y commit en `docs/MAESTROARCH_AGENT_HANDOFF.md`.
11. Marcar P0-016 `done` en `src/tasks.ts` sólo después de evidencia completa.

## Smoke de referencia

Idea sugerida:

```text
Crear una web simple para administrar turnos de una peluquería con clientes, horarios y estado de reserva.
```

Esperado:

```text
idea
→ API server-side del control plane
→ workflow_dispatch
→ GitHub Actions worker
→ MaestroArch Orchestrator
→ app generada
→ validación/build
→ resultado visible
```

## Criterio RELEASED

No usar `RELEASED` hasta que exista:

- URL hosted accesible;
- ejecución real disparada desde esa URL;
- workflow remoto ejecutado;
- resultado verificable;
- CI/build aplicable verde;
- ninguna exposición del secreto.

## Fallos

### 401/403 al disparar GitHub

Revisar:
- variable presente en el entorno correcto;
- permisos mínimos del token;
- owner/repo objetivo;
- workflow y branch.

No copiar el token a logs para diagnosticar.

### Workflow no encontrado

Confirmar:

```text
.github/workflows/product-builder.yml
```

y que el control plane use el repositorio/branch correctos.

### Build falla

Tratar como bug normal:

```text
leer logs → corregir → validar → redeploy
```

No marcar P0 cerrado.

## Handoff

Después del smoke, actualizar:

```text
VALIDATED
RELEASED
BLOCKED
NEXT
COMMITS
```

en `docs/MAESTROARCH_AGENT_HANDOFF.md`.
