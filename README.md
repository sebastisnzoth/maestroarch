# MaestroArch — Creador Arquitecto

Sistema autónomo para transformar una idea en un producto digital funcional, priorizando **GitHub-first**, costo cero o mínimo y máxima autonomía.

## Objetivo

**Idea → Producto → Arquitectura → App funcional → QA/Seguridad → GitHub → Vercel**

Todo agente debe preguntarse:

> ¿Qué impide hoy que este producto tenga su primer usuario o cliente real?

## Autonomía

MaestroArch no pregunta por decisiones menores. Elige por defecto la alternativa más simple, gratuita, mantenible y reversible. Solo escala decisiones críticas como dinero, credenciales ausentes cuando realmente se necesita ejecutar una integración, riesgo de datos, seguridad relevante o cambios sustanciales del producto.

## Estado actual

El runtime ya incluye Orchestrator, Product, CTO, Full Stack, QA/Security y Repo/DevOps. Desde una idea puede generar especificación, detectar/enriquecer dominio, construir una app Next.js interactiva, crear flujos específicos para reservas/marketplace/servicios/comercio, validar el build, aplicar fallback local si no hay IA remota, preparar autenticación/persistencia segura opcional con Supabase, publicar en GitHub y preparar/ejecutar un deploy opcional a Vercel.

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

## Control plane web

```bash
npm run serve
```

La interfaz permite describir el producto, ver en vivo qué agente está trabajando, validar el build, elegir repo GitHub existente o crear uno nuevo y solicitar un deploy opcional a Vercel. Si faltan credenciales para una entrega externa, el producto queda construido y el sistema informa ese bloqueo sin perder el trabajo.

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

La CI no solo valida el código de MaestroArch: también genera una aplicación real de prueba, instala sus dependencias y exige que su build termine correctamente antes de quedar verde.

## Configuración

Ver `.env.example`. Las integraciones externas son opcionales y el camino base continúa siendo de costo cero.

## Regla de continuidad

La fuente de verdad operativa es `AGENTS.md`. Al terminar un P0, el Orchestrator debe tomar el siguiente P0 desbloqueado sin pedir confirmación rutinaria.

Ver también `GPT.md`, `MVP.md`, `ARCHITECTURE.md` y `CREADOR_ARQUITECTO_MASTER.md`.
