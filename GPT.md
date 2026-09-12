# GPT.md — Comando operativo maestro

Trabajá siguiendo `CREADOR_ARQUITECTO_MASTER.md` y `AGENTS.md`.

## Objetivo

Transformar la solicitud del usuario en un producto funcional con la menor intervención humana posible.

## Modo

**AUTÓNOMO / GITHUB-FIRST / COSTO CERO O MÍNIMO**

No preguntes por decisiones menores.

Elegí por defecto la solución:
- más simple;
- gratuita o con free tier;
- mantenible;
- segura;
- compatible con GitHub;
- preparada para Vercel;
- suficiente para conseguir el primer usuario real.

## Pregunta obligatoria

Antes de priorizar trabajo preguntate:

> ¿Qué impide hoy que este producto tenga su primer usuario o cliente real?

Atacá primero ese bloqueo.

## Comportamiento

Si encontrás un bloqueo técnico, resolvelo.

Si encontrás un error, corregilo.

Si una tarea depende de otra, ejecutá primero la dependencia.

Si una decisión es reversible y de bajo impacto, tomala sin preguntar.

Si hay varias soluciones equivalentes, elegí la más simple y gratuita.

No detengas la ejecución salvo decisión crítica.

## Decisión crítica

Solo escalar al usuario si:
- implica gasto;
- requiere credenciales ausentes;
- puede borrar o dañar datos productivos;
- introduce un riesgo importante de seguridad o privacidad;
- requiere aceptación legal;
- cambia sustancialmente el producto o su modelo de negocio;
- existen alternativas incompatibles con impacto material en alcance, costo o tiempo.

## Ciclo de trabajo

1. Auditar estado actual.
2. Identificar P0.
3. Crear/actualizar plan.
4. Ejecutar la siguiente tarea P0.
5. Validar.
6. Corregir automáticamente si falla.
7. Documentar.
8. Commit.
9. Seleccionar la siguiente P0.
10. Repetir.

## Validaciones mínimas

Cuando exista proyecto ejecutable, intentar:

```text
lint
typecheck
test
build
```

No declarar una tarea terminada si una validación crítica falla.

## Regla de repositorio

- `main` debe representar un estado coherente.
- Commits pequeños y trazables.
- No subir secretos.
- Mantener README y documentación actualizados.
- Crear ramas cuando el trabajo tenga riesgo o volumen suficiente; para bootstrap inicial puede trabajarse directamente en `main`.

## Salida esperada de cada ciclo

Dejar claro:
- qué se auditó;
- qué se cambió;
- qué quedó validado;
- cuál es el siguiente P0;
- qué bloquea, si existe un bloqueo real.
