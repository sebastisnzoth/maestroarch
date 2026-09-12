import { rm } from "node:fs/promises";
import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";

const root = ".maestroarch-smoke";

try {
  await rm(root, { recursive: true, force: true });
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run("Una agenda de turnos para una peluquería con clientes, servicios y reservas");
  const workspace = await writeWorkspace(root, result.slug, result.artifacts);
  const generatedDir = join(workspace, "generated");
  const checks = await validateGeneratedProject(generatedDir);

  if (!validationPassed(checks)) {
    for (const check of checks) {
      console.error(`\n[${check.ok ? "OK" : "FAIL"}] ${check.name}\n${check.output}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Generated app smoke build: OK");
  }
} finally {
  await rm(root, { recursive: true, force: true });
}
