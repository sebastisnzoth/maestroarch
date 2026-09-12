import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";

const idea = process.argv.slice(2).join(" ").trim();

if (!idea) {
  console.error('Uso: npm run dev -- "describí la aplicación que querés crear"');
  process.exitCode = 1;
} else {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run(idea);
  const dir = await writeWorkspace("runs", result.slug, result.artifacts);

  console.log(JSON.stringify({
    runId: result.runId,
    status: result.status,
    workspace: dir,
    firstCustomerBlocker: result.firstCustomerBlocker,
    nextP0: result.nextP0?.id ?? null,
    artifacts: Object.keys(result.artifacts)
  }, null, 2));
}
