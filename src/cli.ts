import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";
import { deliverGeneratedProduct } from "./delivery.js";

const args = process.argv.slice(2);
const skipValidation = args.includes("--skip-validation");
const deployVercel = args.includes("--deploy-vercel");
const production = args.includes("--prod");
const publishArg = args.find((arg) => arg.startsWith("--publish="));
const createRepoArg = args.find((arg) => arg.startsWith("--create-repo="));
const publishRepository = publishArg?.slice("--publish=".length);
const createRepositoryName = createRepoArg?.slice("--create-repo=".length);
const flags = new Set(["--skip-validation", "--deploy-vercel", "--prod"]);
const idea = args
  .filter((arg) => !flags.has(arg) && !arg.startsWith("--publish=") && !arg.startsWith("--create-repo="))
  .join(" ")
  .trim();

if (!idea) {
  console.error('Uso: npm run dev -- "describí la aplicación" [--publish=owner/repo|--create-repo=nombre] [--deploy-vercel] [--prod] [--skip-validation]');
  process.exitCode = 1;
} else {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run(idea);
  const dir = await writeWorkspace("runs", result.slug, result.artifacts);
  const generatedDir = join(dir, "generated");

  const checks = skipValidation ? [] : await validateGeneratedProject(generatedDir);
  const buildOk = skipValidation ? null : validationPassed(checks);

  let delivery = null;
  if (buildOk !== false && (publishRepository || createRepositoryName || deployVercel)) {
    delivery = await deliverGeneratedProduct({
      artifacts: result.artifacts,
      generatedDir,
      repository: publishRepository,
      createRepositoryName,
      deployVercel,
      production
    });
  }

  console.log(JSON.stringify({
    runId: result.runId,
    status: buildOk === false ? "fixing" : delivery?.blockers.length ? "blocked" : result.status,
    workspace: dir,
    generatedApp: generatedDir,
    buildOk,
    validation: checks.map(({ name, ok, repaired }) => ({ name, ok, repaired: repaired ?? false })),
    delivery,
    firstCustomerBlocker: buildOk === false
      ? "El build generado necesita corrección adicional"
      : delivery?.blockers.length
        ? delivery.blockers.join(" ")
        : result.firstCustomerBlocker,
    nextP0: result.nextP0?.id ?? null,
    artifacts: Object.keys(result.artifacts)
  }, null, 2));

  if (buildOk === false || delivery?.blockers.length) process.exitCode = 2;
}
