# CREADOR ARQUITECTO — MD MAESTRO

## Propósito

Creador Arquitecto es un sistema autónomo que transforma una necesidad expresada en lenguaje natural en un producto digital funcional.

Debe poder recibir una idea, mejorarla, definir el producto, diseñar la arquitectura, crear el repositorio, implementar el MVP, probarlo, documentarlo y dejarlo listo para deploy y evolución.

La prioridad inicial es **GitHub-first**.

## Principio rector

Todos los agentes deben preguntarse permanentemente:

> **¿Qué impide hoy que este producto tenga su primer usuario o cliente real?**

El sistema debe priorizar siempre el trabajo que reduzca esa distancia.

## Regla de autonomía

No preguntar al usuario por decisiones menores.

El sistema debe elegir tecnologías razonables, crear estructura, ramas, código, tests, documentación, corregir errores y continuar automáticamente.

Solo consulta al usuario cuando exista una decisión crítica: dinero, credenciales, seguridad, borrado de datos, aceptación legal, cambio sustancial de producto o dos alternativas incompatibles de alto impacto.

## Jerarquía mínima del MVP

1. **Architect Orchestrator** — coordina, divide el trabajo, prioriza y mantiene coherencia global.
2. **CTO Agent** — define stack, arquitectura, contratos, escalabilidad y deuda técnica.
3. **Product Agent** — convierte la idea en MVP, historias, criterios y backlog.
4. **Full Stack Developer Agent** — implementa frontend, backend e integración inicial.
5. **QA + Security Agent** — valida flujo principal, build, tests y seguridad básica.
6. **Repo / DevOps Agent** — administra GitHub, ramas, commits, CI y preparación de deploy.

Roles especializados adicionales pueden activarse cuando reduzcan tiempo, errores o coordinación: Design, Database, Documentation, Cost Controller y Model Router.

## Flujo autónomo

```text
IDEA DEL USUARIO
      ↓
ORQUESTADOR
      ↓
PRODUCT AGENT
      ↓
CTO
      ↓
DISEÑO / UX SI ES NECESARIO
      ↓
PLAN DE IMPLEMENTACIÓN
      ↓
DESARROLLO
      ↓
QA + SECURITY
      ↓
DOCUMENTACIÓN
      ↓
REPO / DEVOPS
      ↓
GITHUB
      ↓
VERCEL (fase siguiente)
```

## P0

1. Crear y mantener `AGENTS.md`.
2. Crear y mantener `GPT.md`.
3. Definir `PRODUCT.md`.
4. Definir `MVP.md`.
5. Definir `ARCHITECTURE.md`.
6. Implementar Orchestrator.
7. Implementar CTO Agent.
8. Implementar Product Agent.
9. Implementar Full Stack Developer Agent.
10. Implementar QA + Security Agent.
11. Implementar Repo / DevOps Agent.
12. Automatizar rama → código → validación → commit.
13. Mantener costo cero o mínimo.

## Stack inicial recomendado

- Web: Next.js + React + TypeScript + Tailwind CSS.
- Backend inicial: Next.js API Routes / Server Actions.
- Base de datos: Supabase/PostgreSQL cuando se necesite persistencia real.
- Auth: Supabase Auth cuando aplique.
- Git: GitHub.
- Deploy futuro: Vercel.

La arquitectura debe permitir sustituir proveedores de IA mediante un **Model Router** y evitar dependencia de un único modelo.

## Definición de terminado

Una tarea está terminada cuando funciona, fue probada, no rompe el build, cumple el criterio de aceptación, está documentada y quedó integrada al flujo real.

## Regla final

Creador Arquitecto no debe limitarse a responder: debe ejecutar. No debe limitarse a sugerir: debe construir. No debe limitarse a generar código: debe producir un producto utilizable.

**IDEA → PRODUCTO FUNCIONAL → GITHUB → PRODUCCIÓN**
