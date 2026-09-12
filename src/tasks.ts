import type { TaskItem } from "./types.js";

export function buildTasks(): TaskItem[] {
  return [
    { id: "P0-001", priority: "P0", title: "Generar especificación ejecutable", owner: "Product + CTO", acceptance: ["PRODUCT/MVP/ARCHITECTURE generados"], blockedBy: [], status: "done" },
    { id: "P0-002", priority: "P0", title: "Generar workspace de implementación", owner: "Full Stack", acceptance: ["plan P0 presente", "estructura lista para código"], blockedBy: ["P0-001"], status: "done" },
    { id: "P0-003", priority: "P0", title: "Implementar generador web real", owner: "Full Stack", acceptance: ["crea app ejecutable e interactiva desde el prompt"], blockedBy: ["P0-002"], status: "done" },
    { id: "P0-004", priority: "P0", title: "Ejecutar autocorrección por validaciones", owner: "Orchestrator + QA", acceptance: ["reintenta fallos de install/build automáticamente"], blockedBy: ["P0-003"], status: "done" },
    { id: "P0-005", priority: "P0", title: "Publicar proyecto generado en GitHub", owner: "Repo / DevOps", acceptance: ["adapter GitHub y comando --publish disponibles"], blockedBy: ["P0-004"], status: "done" },
    { id: "P0-006", priority: "P0", title: "Agregar Model Router con fallback gratuito", owner: "CTO + Full Stack", acceptance: ["proveedor remoto opcional", "fallback local automático", "sin secretos versionados"], blockedBy: ["P0-005"], status: "done" },
    { id: "P0-007", priority: "P0", title: "Enriquecer generación de flujos según dominio", owner: "Product + Full Stack", acceptance: ["pantallas y acciones específicas por dominio", "no solo CRUD genérico"], blockedBy: ["P0-006"], status: "done" },
    { id: "P0-008", priority: "P0", title: "Mostrar progreso real de agentes en control plane", owner: "Orchestrator + Full Stack", acceptance: ["estado por etapa visible", "errores y retries visibles"], blockedBy: ["P0-007"], status: "done" },
    { id: "P0-009", priority: "P0", title: "Preparar entrega Vercel-ready", owner: "Repo / DevOps + CTO", acceptance: ["proyecto generado compatible con Vercel", "configuración de deploy documentada", "sin secretos en repo"], blockedBy: ["P0-008"], status: "done" },
    { id: "P0-010", priority: "P0", title: "Persistencia real opcional sin romper costo cero", owner: "CTO + Database + Full Stack", acceptance: ["modo local por defecto", "adapter Supabase/Postgres opcional", "contrato de datos generado"], blockedBy: ["P0-009"], status: "done" },
    { id: "P0-011", priority: "P0", title: "Aislar datos y autenticación antes de producción remota", owner: "Security + Backend + Product", acceptance: ["auth opcional generada", "RLS por usuario", "sin policies públicas en producción"], blockedBy: ["P0-010"], status: "done" },
    { id: "P0-012", priority: "P0", title: "Automatizar entrega repo + deploy desde control plane", owner: "Repo / DevOps + Orchestrator", acceptance: ["destino GitHub configurable", "deploy opcional Vercel", "credenciales solo por entorno"], blockedBy: ["P0-011"], status: "done" },
    { id: "P0-013", priority: "P0", title: "Smoke-build de una app generada dentro de CI", owner: "QA + Repo / DevOps", acceptance: ["CI genera una app real", "instala dependencias", "build debe pasar para CI verde"], blockedBy: ["P0-012"], status: "done" },
    { id: "P0-014", priority: "P0", title: "Persistir historial y recuperar ejecuciones del control plane", owner: "Orchestrator + Backend", acceptance: ["runs sobreviven reinicio local", "consulta historial", "reanudación de entregas bloqueadas"], blockedBy: ["P0-013"], status: "done" },
    { id: "P0-015", priority: "P0", title: "Crear control plane Vercel-native con GitHub Actions worker", owner: "CTO + Repo / DevOps + Full Stack", acceptance: ["frontend Next.js serverless", "worker workflow_dispatch", "CI valida build del control plane"], blockedBy: ["P0-014"], status: "done" },
    { id: "P0-016", priority: "P0", title: "Desplegar control plane hosted y conectar credencial segura del worker", owner: "Repo / DevOps + Security", acceptance: ["URL Vercel activa", "token GitHub solo server-side", "build remoto disparable desde la web"], blockedBy: ["P0-015"], status: "todo" }
  ];
}
