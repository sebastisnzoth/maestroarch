import { randomUUID } from "node:crypto";
import { normalizeIdea, slugFromIdea } from "./intake.js";
import { ProductAgent, CTOAgent, FullStackAgent, QASecurityAgent, RepoDevOpsAgent } from "./agents.js";
import { buildTasks } from "./tasks.js";
import type { Agent, AgentContext, OrchestrationEventHandler, OrchestrationResult, StageStatus } from "./types.js";

export class ArchitectOrchestrator {
  private readonly agents: Agent[];

  constructor(agents?: Agent[]) {
    this.agents = agents ?? [
      new ProductAgent(),
      new CTOAgent(),
      new FullStackAgent(),
      new QASecurityAgent(),
      new RepoDevOpsAgent()
    ];
  }

  async run(input: string, onEvent?: OrchestrationEventHandler): Promise<OrchestrationResult> {
    const request = normalizeIdea(input);
    const runId = randomUUID();
    const slug = slugFromIdea(request.idea);
    const artifacts: Record<string, string> = {};
    const agentResults = [];

    const emit = async (stage: string, status: StageStatus, message: string) => {
      await onEvent?.({ runId, stage, status, message, timestamp: new Date().toISOString() });
    };

    await emit("intake", "running", "Normalizando idea y restricciones.");
    await emit("intake", "completed", `Idea normalizada: ${request.idea}`);

    for (const agent of this.agents) {
      const stage = agent.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      await emit(stage, "running", `${agent.name} ejecutando.`);
      const context: AgentContext = { request, runId, artifacts: { ...artifacts } };

      try {
        const result = await agent.run(context);
        agentResults.push(result);
        Object.assign(artifacts, result.artifacts ?? {});

        if (result.blocked) {
          await emit(stage, "blocked", result.blockReason ?? `${agent.name} bloqueó la ejecución.`);
          return {
            runId,
            slug,
            status: "blocked",
            firstCustomerBlocker: result.blockReason ?? "Bloqueo crítico sin detalle.",
            artifacts,
            tasks: buildTasks(),
            agentResults
          };
        }

        await emit(stage, "completed", result.summary);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        await emit(stage, "failed", message);
        throw error;
      }
    }

    const tasks = buildTasks();
    const nextP0 = tasks.find((task) => task.priority === "P0" && task.status === "todo" && task.blockedBy.every((id) => tasks.find((t) => t.id === id)?.status === "done"));
    await emit("orchestrator", "completed", nextP0 ? `Siguiente ${nextP0.id}: ${nextP0.title}` : "No quedan P0 desbloqueados.");

    return {
      runId,
      slug,
      status: "completed",
      firstCustomerBlocker: nextP0?.title ?? "Ninguno: listo para entrega.",
      artifacts,
      tasks,
      agentResults,
      nextP0
    };
  }
}
