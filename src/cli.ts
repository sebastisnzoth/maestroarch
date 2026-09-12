import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";
import { publishArtifacts } from "./adapters/github.js";

const args = process.argv.slice(2);
const skipValidation = args.includes("--skip-validation");
const publishArg = args.find((arg) => arg.startsWith("--publish="));
const publishRepository = publishArg?.slice("--publish=".length);
const idea = args
  .filter((arg) => arg !== "--skip-validation" && !arg.startsWith("--publish="))
  .join(" ")
  .trim();

if (!idea) {
  console.error('Uso: npm run dev -- "describí la aplicación" [--publish=owner/repo] [--skip-validation]');
  process.exitCode = 1;
} else {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run(idea);
  const dir = await writeWorkspace("runs", result.slug, result.artifacts);

  const checks = skipValidation ? [] : await validateGeneratedProject(join(dir, "generated"));
  const buildOk = skipValidation ? null : validationPassed(checks);

  let publication: { repository: string; published: string[] } | null = null;
  if (publishRepository && buildOk !== false) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("GITHUB_TOKEN es obligatorio para --publish. No se solicita por chat: configúralo como secreto/variable de entorno.");
    }
    const published = await publishArtifacts(result.artifacts, {
      token,
      repository: publishRepository
    });
    publication = { repository: publishRepository, published: published.published };
  }

  console.log(JSON.stringify({
    runId: result.runId,
    status: buildOk === false ? "fixing" : result.status,
    workspace: dir,
    generatedApp: join(dir, "generated"),
    buildOk,
    validation: checks.map(({ name, ok, repaired }) => ({ name, ok, repaired: repaired ?? false })),
    publication,
    firstCustomerBlocker: buildOk === false
      ? "El build generado necesita corrección adicional"
      : publishRepository && publication
        ? "Ninguno: scaffold validado y publicado"
        : result.firstCustomerBlocker,
    nextP0: result.nextP0?.id ?? null,
    artifacts: Object.keys(result.artifacts)
  }, null, 2));

  if (buildOk === false) process.exitCode = 2;
}
