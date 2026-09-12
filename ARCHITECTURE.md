# ARCHITECTURE.md

## Estado

Arquitectura inicial del MVP de MaestroArch.

## Principios

- monolito modular primero;
- GitHub como fuente de verdad;
- costo cero o mínimo;
- proveedores sustituibles;
- evitar lock-in innecesario;
- automatización observable;
- decisiones reversibles por defecto.

## Componentes

### 1. Intake
Recibe la descripción del producto y normaliza intención, restricciones y objetivo.

### 2. Architect Orchestrator
Coordina el ciclo completo, mantiene estado y selecciona agentes.

### 3. Agent Runtime
Ejecuta capacidades especializadas:
- Product;
- CTO;
- Full Stack;
- QA/Security;
- Repo/DevOps.

### 4. Model Router
Abstrae proveedores/modelos de IA y permite fallback por disponibilidad, costo o límite.

### 5. Project Workspace
Mantiene artefactos, especificaciones, código generado y estado de tareas.

### 6. Validation Engine
Ejecuta checks como lint, typecheck, test y build; devuelve fallos al Orchestrator para autocorrección.

### 7. GitHub Adapter
Gestiona archivos, commits, ramas, PRs y estado del repositorio.

### 8. Deployment Adapter
Fase posterior. Primer destino: Vercel.

## Arquitectura lógica

```text
User Prompt
    ↓
Intake
    ↓
Orchestrator
    ├── Product Agent
    ├── CTO Agent
    ├── Full Stack Agent
    ├── QA/Security Agent
    └── Repo/DevOps Agent
            ↓
       Model Router
            ↓
      Project Workspace
            ↓
      Validation Engine
            ↓
       GitHub Adapter
            ↓
       Vercel Adapter
```

## Stack inicial de MaestroArch

- TypeScript;
- Next.js para interfaz/API inicial;
- Node.js runtime;
- almacenamiento local/JSON al comienzo o PostgreSQL/Supabase al requerir persistencia multiusuario;
- GitHub API para repositorios;
- Vercel posteriormente.

## Contrato de agente

Cada agente debe recibir:
- objetivo;
- contexto mínimo necesario;
- restricciones;
- criterios de aceptación;
- artefactos relevantes.

Y devolver:
- resultado estructurado;
- cambios propuestos/realizados;
- riesgos;
- validación;
- siguiente acción recomendada.

## Estado de ejecución

Estados sugeridos:

```text
queued
planning
executing
validating
fixing
blocked
completed
```

Un bloqueo solo debe escalar al usuario si cumple la definición de decisión crítica de `AGENTS.md`.

## Seguridad

- nunca persistir secretos en Git;
- secretos únicamente mediante variables de entorno;
- mínimo privilegio para integraciones;
- logs sin credenciales;
- validar inputs externos;
- auditar dependencias antes de release.

## Estrategia de evolución

### v0.1
Orquestación + specs + generación web + validación + GitHub.

### v0.2
Panel visual del estado de construcción.

### v0.3
Deploy automático Vercel.

### v0.4
Generación PWA / React Native / Expo según proyecto.

### v1
Sistema autónomo multi-proyecto con memoria de decisiones, recuperación de fallos y model routing robusto.
