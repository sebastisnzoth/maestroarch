import { randomUUID } from "node:crypto";
import { normalizeIdea, slugFromIdea } from "./intake.js";
import { ProductAgent, CTOAgent, FullStackAgent, QASecurityAgent, RepoDevOpsAgent, buildTasks } from "./agents.js";
import type { Agent, AgentContext, OrchestrationResult } from "./types.js";

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

  async run(input: string): Promise<OrchestrationResult> {
    const request = normalizeIdea(input);
    const runId = randomUUID();
    const slug = slugFromIdea(request.idea);
    const artifacts: Record<string, string> = {};
    const agentResults = [];

    for (const agent of this.agents) {
      const context: AgentContext = { request, runId, artifacts: { ...artifacts } };
      const result = await agent.run(context);
      agentResults.push(result);
      Object.assign(artifacts, result.artifacts ?? {});
      if (result.blocked) {
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
    }

    const tasks = buildTasks();
    const nextP0 = tasks.find((task) => task.priority === "P0" && task.status === "todo" && task.blockedBy.every((id) => tasks.find((t) => t.id === id)?.status === "done"));

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
