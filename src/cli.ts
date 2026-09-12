import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";

const args = process.argv.slice(2);
const skipValidation = args.includes("--skip-validation");
const idea = args.filter((arg) => arg !== "--skip-validation").join(" ").trim();

if (!idea) {
  console.error('Uso: npm run dev -- "describí la aplicación que querés crear" [--skip-validation]');
  process.exitCode = 1;
} else {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run(idea);
  const dir = await writeWorkspace("runs", result.slug, result.artifacts);

  const checks = skipValidation ? [] : await validateGeneratedProject(join(dir, "generated"));
  const buildOk = skipValidation ? null : validationPassed(checks);

  console.log(JSON.stringify({
    runId: result.runId,
    status: buildOk === false ? "fixing" : result.status,
    workspace: dir,
    generatedApp: join(dir, "generated"),
    buildOk,
    validation: checks.map(({ name, ok, repaired }) => ({ name, ok, repaired: repaired ?? false })),
    firstCustomerBlocker: buildOk === false ? "El build generado necesita corrección adicional" : result.firstCustomerBlocker,
    nextP0: result.nextP0?.id ?? null,
    artifacts: Object.keys(result.artifacts)
  }, null, 2));

  if (buildOk === false) process.exitCode = 2;
}
