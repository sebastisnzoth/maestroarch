# MVP.md

## Objetivo del MVP

Demostrar que MaestroArch puede recibir una idea en lenguaje natural y convertirla autónomamente en un repositorio funcional y validado.

## Flujo MVP

1. Usuario describe una aplicación.
2. Product Agent genera alcance y criterios.
3. CTO Agent define arquitectura y stack.
4. Orchestrator genera tareas y prioridades.
5. Full Stack Agent implementa.
6. QA + Security valida.
7. Repo / DevOps registra cambios en GitHub.
8. El sistema informa estado, bloqueos reales y siguiente P0.

## Entradas

Texto libre con la necesidad del usuario.

Ejemplo:

> Necesito una web para administrar reservas de una peluquería con clientes, turnos y panel admin.

## Salida mínima

- `PRODUCT.md` actualizado para el proyecto generado;
- `MVP.md` específico del proyecto;
- arquitectura;
- backlog priorizado;
- aplicación ejecutable;
- README;
- `.env.example` si aplica;
- tests básicos;
- lint/typecheck/build funcionales cuando apliquen;
- commits trazables.

## Fuera del MVP inicial

- generación nativa automática Android/iOS;
- marketplace de agentes;
- facturación;
- multi-tenant empresarial;
- despliegues complejos multi-cloud;
- microservicios automáticos.

## Criterios de éxito

El MVP se considera validado cuando puede completar al menos un caso real de extremo a extremo:

**prompt de producto → repo funcional → build correcto → aplicación usable.**

## Prioridades P0

- autonomía sin preguntas rutinarias;
- orquestación reproducible;
- CTO y Product operativos;
- generación de aplicación web;
- validación automática;
- integración GitHub;
- trazabilidad de decisiones y commits.
