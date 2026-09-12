import type { Agent, AgentContext, AgentResult, TaskItem } from "./types.js";

function base(agent: string, summary: string, artifacts: Record<string, string> = {}): AgentResult {
  return { agent, summary, artifacts, risks: [], nextActions: [], blocked: false };
}

export class ProductAgent implements Agent {
  readonly name = "Product Agent";
  async run({ request }: AgentContext): Promise<AgentResult> {
    const product = `# PRODUCT\n\n## Idea\n${request.idea}\n\n## Usuario inicial\nPersona que necesita resolver este problema sin contratar un equipo técnico completo.\n\n## Propuesta de valor\nConvertir la necesidad en un producto web usable con mínima intervención humana.\n\n## Alcance MVP\n- flujo principal completo;\n- interfaz web responsive;\n- persistencia solo si aporta valor al caso;\n- validaciones y errores;\n- documentación y build reproducible.\n\n## Fuera de alcance inicial\n- funciones no necesarias para validar el uso real;\n- microservicios;\n- infraestructura paga no imprescindible.\n`;
    const mvp = `# MVP\n\n## Objetivo\nEntregar la versión mínima usable de: ${request.idea}\n\n## Criterios de aceptación\n1. Un usuario puede completar el flujo principal.\n2. El proyecto instala y compila.\n3. Los errores principales tienen manejo visible.\n4. README explica ejecución y variables.\n5. No hay secretos versionados.\n`;
    return base(this.name, "Problema, usuario, propuesta de valor y MVP definidos.", { "PRODUCT.md": product, "MVP.md": mvp });
  }
}

export class CTOAgent implements Agent {
  readonly name = "CTO Agent";
  async run({ request }: AgentContext): Promise<AgentResult> {
    const architecture = `# ARCHITECTURE\n\n## Decisión\nMonolito modular web, TypeScript y dependencias mínimas.\n\n## Stack por defecto\n- Next.js + React + TypeScript\n- API Routes/Server Actions antes de backend separado\n- Supabase/PostgreSQL solo si el dominio necesita persistencia remota\n- Vercel como destino futuro\n- GitHub como fuente de verdad\n\n## Principio\nLa arquitectura puede cambiar si el caso \"${request.idea}\" demuestra una necesidad concreta.\n\n## Límites\nUI -> casos de uso -> adaptadores externos. El dominio no debe depender directamente de proveedores.\n`;
    return base(this.name, "Arquitectura inicial seleccionada sin sobreingeniería.", { "ARCHITECTURE.md": architecture });
  }
}

export class FullStackAgent implements Agent {
  readonly name = "Full Stack Developer Agent";
  async run({ request }: AgentContext): Promise<AgentResult> {
    const plan = `# IMPLEMENTATION_PLAN\n\n## P0\n1. Crear shell web ejecutable.\n2. Implementar flujo principal de: ${request.idea}\n3. Añadir estados loading/empty/error.\n4. Añadir persistencia solo si es necesaria.\n5. Añadir smoke test del flujo principal.\n\n## Reglas\n- componentes pequeños;\n- contratos tipados;\n- cero secretos en código;\n- preferir dependencias estándar y gratuitas.\n`;
    return base(this.name, "Plan de implementación P0 generado.", { "IMPLEMENTATION_PLAN.md": plan });
  }
}

export class QASecurityAgent implements Agent {
  readonly name = "QA + Security Agent";
  async run(): Promise<AgentResult> {
    const checklist = `# VALIDATION\n\n## Gate obligatorio\n- [ ] typecheck\n- [ ] tests\n- [ ] build\n- [ ] flujo principal smoke-tested\n- [ ] inputs validados\n- [ ] ningún secreto versionado\n- [ ] variables documentadas\n- [ ] errores críticos = 0\n`;
    return base(this.name, "Gate de calidad y seguridad definido.", { "VALIDATION.md": checklist });
  }
}

export class RepoDevOpsAgent implements Agent {
  readonly name = "Repo / DevOps Agent";
  async run(): Promise<AgentResult> {
    const repo = `# DELIVERY\n\n## GitHub-first\n- commits pequeños y trazables;\n- main siempre recuperable;\n- CI ejecuta typecheck/test/build;\n- .env.example documenta configuración;\n- Vercel se habilita después de tener build verde.\n`;
    return base(this.name, "Política de entrega preparada.", { "DELIVERY.md": repo });
  }
}

export function buildTasks(): TaskItem[] {
  return [
    { id: "P0-001", priority: "P0", title: "Generar especificación ejecutable", owner: "Product + CTO", acceptance: ["PRODUCT/MVP/ARCHITECTURE generados"], blockedBy: [], status: "done" },
    { id: "P0-002", priority: "P0", title: "Generar workspace de implementación", owner: "Full Stack", acceptance: ["plan P0 presente", "estructura lista para código"], blockedBy: ["P0-001"], status: "done" },
    { id: "P0-003", priority: "P0", title: "Implementar generador web real", owner: "Full Stack", acceptance: ["crea app ejecutable desde el prompt"], blockedBy: ["P0-002"], status: "todo" },
    { id: "P0-004", priority: "P0", title: "Ejecutar autocorrección por validaciones", owner: "Orchestrator + QA", acceptance: ["reintenta fallos de typecheck/test/build"], blockedBy: ["P0-003"], status: "todo" },
    { id: "P0-005", priority: "P0", title: "Publicar proyecto generado en GitHub", owner: "Repo / DevOps", acceptance: ["repo objetivo recibe artefactos y commits"], blockedBy: ["P0-004"], status: "todo" }
  ];
}
