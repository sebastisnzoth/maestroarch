# MaestroArch — Creador Arquitecto

Sistema autónomo para transformar una idea en un producto digital funcional, priorizando **GitHub-first**, costo cero o mínimo y máxima autonomía.

## Objetivo

Convertir una solicitud en lenguaje natural en:

**Idea → Producto → Arquitectura → Código → QA/Seguridad → GitHub → Deploy**

## Regla operativa

Todo agente debe hacerse esta pregunta:

> ¿Qué impide hoy que este producto tenga su primer usuario o cliente real?

## Modo de trabajo

- No preguntar por decisiones menores.
- Elegir por defecto la opción más simple, gratuita, mantenible y compatible con GitHub/Vercel.
- Resolver bloqueos técnicos de forma autónoma.
- Pedir intervención solo para decisiones críticas: dinero, credenciales, seguridad, borrado de datos, cambios sustanciales de producto o aceptación legal.

## Estado actual v0.1

Ya existe un runtime ejecutable con:

- Architect Orchestrator;
- Product Agent;
- CTO Agent;
- Full Stack Agent;
- QA + Security Agent;
- Repo / DevOps Agent;
- generador de scaffold Next.js;
- workspace por ejecución;
- validación automática `npm install` + `npm run build` con retry básico;
- adaptador de publicación a GitHub;
- CI para typecheck y tests.

## Ejecutar

```bash
npm install
npm run dev -- "Quiero una web para administrar reservas de una peluquería"
```

El resultado se genera dentro de:

```text
runs/<slug>/
```

La aplicación web queda en:

```text
runs/<slug>/generated/
```

## Publicar un proyecto generado en GitHub

Configurar `GITHUB_TOKEN` como variable de entorno y ejecutar:

```bash
npm run dev -- "Tu idea" --publish=owner/repositorio
```

El sistema no debe pedir el token por chat ni guardarlo en el repositorio.

## Validación

```bash
npm run typecheck
npm test
```

La CI de GitHub ejecuta estas validaciones automáticamente.

## Próximo cuello de botella

El siguiente salto de producto es pasar del scaffold genérico a un **generador de dominio asistido por modelo**, capaz de convertir la especificación en pantallas, entidades, acciones y flujo funcional específico sin intervención rutinaria.

Ver `GPT.md`, `AGENTS.md`, `ROADMAP.md` y `CREADOR_ARQUITECTO_MASTER.md`.
