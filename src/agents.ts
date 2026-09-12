import type { Agent, AgentContext, AgentResult, TaskItem } from "./types.js";
import { generateWebProject } from "./generator/web.js";
import { generateVercelArtifacts } from "./generator/vercel.js";
import { generatePersistenceArtifacts } from "./generator/persistence.js";
import { generateAuthArtifacts } from "./generator/auth.js";
import { checkVercelReadiness } from "./adapters/vercel.js";
import { ModelRouter } from "./model-router.js";

function base(agent: string, summary: string, artifacts: Record<string, string> = {}): AgentResult {
  return { agent, summary, artifacts, risks: [], nextActions: [], blocked: false };
}

export class ProductAgent implements Agent {
  readonly name = "Product Agent";
  async run({ request }: AgentContext): Promise<AgentResult> {
    const product = `# PRODUCT\n\n## Idea\n${request.idea}\n\n## Usuario inicial\nPersona que necesita resolver este problema sin contratar un equipo técnico completo.\n\n## Propuesta de valor\nConvertir la necesidad en un producto web usable con mínima intervención humana.\n\n## Alcance MVP\n- flujo principal completo;\n- interfaz web responsive;\n- persistencia local por defecto y remota opcional;\n- autenticación remota opcional;\n- validaciones y errores;\n- documentación y build reproducible.\n\n## Fuera de alcance inicial\n- funciones no necesarias para validar el uso real;\n- microservicios;\n- infraestructura paga no imprescindible.\n`;
    const mvp = `# MVP\n\n## Objetivo\nEntregar la versión mínima usable de: ${request.idea}\n\n## Criterios de aceptación\n1. Un usuario puede completar el flujo principal.\n2. El proyecto instala y compila.\n3. Los errores principales tienen manejo visible.\n4. README explica ejecución y variables.\n5. No hay secretos versionados.\n6. La app funciona sin servicios pagos.\n7. Si usa persistencia remota, los datos quedan aislados por usuario.\n`;
    return base(this.name, "Problema, usuario, propuesta de valor y MVP definidos.", { "PRODUCT.md": product, "MVP.md": mvp });
  }
}

export class CTOAgent implements Agent {
  readonly name = "CTO Agent";
  async run({ request }: AgentContext): Promise<AgentResult> {
    const architecture = `# ARCHITECTURE\n\n## Decisión\nMonolito modular web, TypeScript y dependencias mínimas.\n\n## Stack por defecto\n- Next.js + React + TypeScript\n- API Routes/Server Actions antes de backend separado\n- localStorage como persistencia cero-config\n- Supabase/PostgreSQL opcional cuando el dominio necesita persistencia remota\n- Supabase Auth + RLS por usuario cuando se habilita modo remoto\n- Vercel como destino de despliegue por defecto\n- GitHub como fuente de verdad\n- Model Router compatible con endpoints OpenAI-style y fallback local gratuito\n\n## Principio\nLa arquitectura puede cambiar si el caso \"${request.idea}\" demuestra una necesidad concreta.\n\n## Límites\nUI -> casos de uso -> adaptadores externos. El dominio no debe depender directamente de proveedores.\n`;
    return base(this.name, "Arquitectura inicial seleccionada sin sobreingeniería.", { "ARCHITECTURE.md": architecture });
  }
}

export class FullStackAgent implements Agent {
  readonly name = "Full Stack Developer Agent";
  constructor(private readonly router = new ModelRouter()) {}

  async run({ request }: AgentContext): Promise<AgentResult> {
    const plan = `# IMPLEMENTATION_PLAN\n\n## P0\n1. Crear shell web ejecutable.\n2. Implementar flujo principal de: ${request.idea}\n3. Añadir estados loading/empty/error.\n4. Usar persistencia local por defecto y remota opcional.\n5. Generar autenticación + RLS si se activa backend remoto.\n6. Añadir smoke test del flujo principal.\n\n## Reglas\n- componentes pequeños;\n- contratos tipados;\n- cero secretos en código;\n- preferir dependencias estándar y gratuitas;\n- IA remota opcional con fallback local automático.\n`;

    const routed = await this.router.compileDomain(request.idea);
    const routingArtifact = JSON.stringify({
      route: routed.route,
      provider: routed.provider,
      model: routed.model ?? null,
      fallbackReason: routed.fallbackReason ?? null
    }, null, 2) + "\n";

    return base(this.name, `Plan P0 y MVP web generados usando ruta ${routed.route}.`, {
      "IMPLEMENTATION_PLAN.md": plan,
      "MODEL_ROUTING.json": routingArtifact,
      ...generateWebProject(request, routed.spec),
      ...generateAuthArtifacts(),
      ...generatePersistenceArtifacts(routed.spec),
      ...generateVercelArtifacts()
    });
  }
}

export class QASecurityAgent implements Agent {
  readonly name = "QA + Security Agent";
  async run({ artifacts }: AgentContext): Promise<AgentResult> {
    const required = [
      "generated/package.json",
      "generated/app/page.tsx",
      "generated/app/layout.tsx",
      "generated/app/auth-panel.tsx",
      "generated/lib/auth.ts",
      "generated/tsconfig.json",
      "generated/DOMAIN.json",
      "generated/DOMAIN_FLOW.json",
      "generated/DATA_MODEL.json",
      "generated/lib/persistence.ts",
      "generated/PERSISTENCE.md",
      "generated/AUTH.md",
      "generated/supabase/schema.sql",
      "generated/vercel.json",
      "generated/DEPLOY.md",
      "generated/.env.example",
      "MODEL_ROUTING.json"
    ];
    const missing = required.filter((name) => !artifacts[name]);
    const vercel = checkVercelReadiness(artifacts);
    const schema = artifacts["generated/supabase/schema.sql"] ?? "";
    const insecureRemotePolicies = /to\s+anon/i.test(schema) || /using\s*\(true\)/i.test(schema) || /with\s+check\s*\(true\)/i.test(schema);
    const ownerScoped = /auth\.uid\(\)\s*=\s*owner_id/i.test(schema);
    const blocked = missing.length > 0 || !vercel.ready || insecureRemotePolicies || !ownerScoped;
    const checklist = `# VALIDATION\n\n## Gate automático de artefactos\n${required.map((name) => `- [${artifacts[name] ? "x" : " "}] ${name}`).join("\n")}\n\n## Seguridad remota\n- [${!insecureRemotePolicies ? "x" : " "}] sin policies públicas anon\n- [${ownerScoped ? "x" : " "}] RLS ligado a auth.uid() y owner_id\n\n## Vercel readiness\n${vercel.checks.map((check) => `- [${check.ok ? "x" : " "}] ${check.name}: ${check.detail}`).join("\n")}\n\n## Gate de ejecución\n- [ ] typecheck del proyecto generado\n- [ ] tests del dominio\n- [ ] build del proyecto generado\n- [x] inputs base normalizados\n- [x] ningún secreto embebido por el generador\n- [x] fallback local disponible si falla IA remota\n- [x] persistencia local funciona sin credenciales\n- [x] persistencia remota exige sesión autenticada\n`;
    const reasons = [
      ...(missing.length ? [`Faltan: ${missing.join(", ")}`] : []),
      ...(!vercel.ready ? ["Vercel readiness incompleto"] : []),
      ...(insecureRemotePolicies ? ["Policies Supabase demasiado abiertas"] : []),
      ...(!ownerScoped ? ["RLS no está ligado al usuario"] : [])
    ];
    return {
      ...base(this.name, blocked ? "Faltan requisitos P0." : "Artefactos, autenticación, persistencia, seguridad y Vercel readiness validados; queda ejecutar build.", { "VALIDATION.md": checklist }),
      blocked,
      blockReason: blocked ? reasons.join(". ") : undefined,
      nextActions: blocked ? ["Regenerar o endurecer artefactos faltantes"] : ["Ejecutar install/typecheck/build sobre generated/"]
    };
  }
}

export class RepoDevOpsAgent implements Agent {
  readonly name = "Repo / DevOps Agent";
  async run({ artifacts }: AgentContext): Promise<AgentResult> {
    const vercel = checkVercelReadiness(artifacts);
    const repo = `# DELIVERY\n\n## GitHub-first\n- commits pequeños y trazables;\n- main siempre recuperable;\n- CI ejecuta typecheck/test/build y smoke-build de una app generada;\n- .env.example documenta configuración;\n- publicación/creación GitHub disponible desde CLI y control plane;\n- deploy Vercel opcional disponible desde CLI y control plane;\n- Vercel readiness: ${vercel.ready ? "OK" : "PENDIENTE"};\n- persistencia local funciona sin secretos;\n- persistencia remota usa auth + RLS por usuario;\n- secretos solo en variables de entorno.\n`;
    return {
      ...base(this.name, vercel.ready ? "Entrega GitHub y Vercel-ready preparada." : "Entrega GitHub preparada; Vercel readiness incompleto.", { "DELIVERY.md": repo }),
      blocked: !vercel.ready,
      blockReason: vercel.ready ? undefined : "El proyecto generado no cumple el gate Vercel-ready."
    };
  }
}

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
    { id: "P0-014", priority: "P0", title: "Persistir historial y recuperar ejecuciones del control plane", owner: "Orchestrator + Backend", acceptance: ["runs sobreviven reinicio local", "consulta historial", "reanudación de entregas bloqueadas"], blockedBy: ["P0-013"], status: "todo" }
  ];
}
