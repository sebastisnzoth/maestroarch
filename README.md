# MaestroArch — Creador Arquitecto

Sistema autónomo para transformar una idea en un producto digital funcional, priorizando **GitHub-first**, costo cero o mínimo y máxima autonomía.

## Objetivo

**Idea → Producto → Arquitectura → App funcional → QA/Seguridad → GitHub → Vercel**

Todo agente debe preguntarse:

> ¿Qué impide hoy que este producto tenga su primer usuario o cliente real?

## Autonomía

MaestroArch no pregunta por decisiones menores. Elige por defecto la alternativa más simple, gratuita, mantenible y reversible. Solo escala decisiones críticas como dinero, credenciales ausentes cuando realmente se necesita ejecutar una integración, riesgo de datos, seguridad relevante o cambios sustanciales del producto.

El backlog P0 ejecutable vive en `src/tasks.ts`. `AGENTS.md` define la política de autonomía y continuidad.

## Estado actual

El runtime incluye Orchestrator, Product, CTO, Full Stack, QA/Security y Repo/DevOps. Desde una idea puede:

- generar especificación de producto y arquitectura;
- detectar/enriquecer el dominio;
- construir una app Next.js interactiva;
- generar flujos específicos para reservas, marketplace, servicios y comercio;
- validar typecheck/tests/build y smoke-build de una aplicación generada real;
- aplicar fallback local gratuito si no hay IA remota;
- generar persistencia local-first y Supabase opcional;
- generar Auth y RLS por usuario para backend remoto;
- crear/publicar repositorios GitHub;
- preparar y ejecutar un deploy opcional a Vercel;
- mantener historial y recuperación de ejecuciones en el control plane local;
- usar un **control plane Vercel-native + GitHub Actions worker** para ejecutar builds largos sin mantener un servidor propio encendido.

La persistencia es **local-first**: sin cuentas ni credenciales funciona con `localStorage`. Si se configura Supabase, el proyecto generado incorpora Auth, `owner_id` y RLS ligada a `auth.uid()`.

## CLI

```bash
npm install
npm run dev -- "Quiero una web para administrar reservas de una peluquería"
```

Crear automáticamente un repo GitHub para la app generada:

```bash
GITHUB_TOKEN=... npm run dev -- "Tu idea" --create-repo=mi-producto
```

Publicar en un repo existente:

```bash
GITHUB_TOKEN=... npm run dev -- "Tu idea" --publish=owner/repositorio
```

Publicar/deployar opcionalmente en Vercel:

```bash
VERCEL_TOKEN=... npm run dev -- "Tu idea" --deploy-vercel
```

Para producción se puede agregar `--prod`. Los tokens se leen únicamente desde variables de entorno y nunca se generan dentro del proyecto.

## Control plane local

```bash
npm run serve
```

La interfaz local permite describir el producto, ver en vivo qué agente está trabajando, validar el build, elegir repo GitHub existente o crear uno nuevo y solicitar deploy opcional a Vercel. Su historial se persiste en `.maestroarch/state/` y una entrega bloqueada puede reanudarse sin reconstruir el producto.

## Control plane hosted — Vercel + GitHub Actions

El directorio `control-plane/` contiene una segunda interfaz Next.js diseñada específicamente para Vercel. Esta interfaz **no ejecuta el build largo dentro de una Function de Vercel**. En su lugar:

```text
Usuario
  ↓
control-plane/ en Vercel
  ↓
POST /api/build
  ↓
GitHub Actions: product-builder.yml
  ↓
MaestroArch CLI
  ↓
Generación + QA + build
  ↓
GitHub destino / Vercel opcional
```

El worker vive en `.github/workflows/product-builder.yml`. El control plane dispara ejecuciones mediante `workflow_dispatch` y consulta su estado desde `/api/runs`.

Para desplegar `control-plane/` en Vercel, usar esa carpeta como **Root Directory** y configurar solo del lado servidor:

```text
MAESTROARCH_CONTROL_GITHUB_TOKEN=
MAESTROARCH_CONTROL_REPOSITORY=sebastisnzoth/maestroarch
MAESTROARCH_CONTROL_BRANCH=main
```

El token nunca se entrega al navegador. Para que el worker pueda crear/publicar repositorios o hacer deploy externo, los secretos correspondientes deben vivir en GitHub Actions:

```text
MAESTROARCH_GITHUB_TOKEN=
VERCEL_TOKEN=
```

Sin esos dos secretos, el worker igualmente puede generar y validar productos; simplemente no realiza entrega externa.

Ver `control-plane/README.md` para el contrato de despliegue hosted.

## Model Router

La IA remota es opcional. Sin configuración, MaestroArch usa su compilador local gratuito. Para un endpoint compatible con OpenAI Chat Completions:

```text
MAESTROARCH_AI_ENDPOINT=
MAESTROARCH_AI_MODEL=
MAESTROARCH_AI_PROVIDER=
MAESTROARCH_AI_API_KEY=
```

Si el proveedor remoto falla o devuelve un contrato inválido, vuelve automáticamente al compilador local.

## Validación

```bash
npm run typecheck
npm test
npm run smoke:generated
```

La CI valida tres capas antes de quedar verde:

1. runtime y tests de MaestroArch;
2. generación + instalación + build de una aplicación real creada por MaestroArch;
3. instalación + build del control plane hosted de `control-plane/`.

## Configuración

Ver `.env.example` y `control-plane/.env.example`. Las integraciones externas son opcionales y el camino base continúa siendo de costo cero.

## Próximo P0

La fuente única del estado está en `src/tasks.ts`. El siguiente cuello de botella es **P0-016: desplegar el control plane hosted y conectar la credencial segura del worker**.

Todo lo que no requiere esa credencial debe resolverse antes de escalar el bloqueo, conforme a `AGENTS.md`.

## Regla de continuidad

Al terminar un P0, el Orchestrator toma automáticamente el siguiente P0 desbloqueado sin pedir confirmación rutinaria.

Ver también `GPT.md`, `MVP.md`, `ARCHITECTURE.md` y `CREADOR_ARQUITECTO_MASTER.md`.
