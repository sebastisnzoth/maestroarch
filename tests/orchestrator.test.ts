import test from "node:test";
import assert from "node:assert/strict";
import { ArchitectOrchestrator } from "../src/orchestrator.js";
import { compileDomain } from "../src/domain.js";
import { ModelRouter } from "../src/model-router.js";

test("orchestrator converts an idea into a secure domain-specific Vercel-ready MVP", async () => {
  const orchestrator = new ArchitectOrchestrator();
  const events: string[] = [];
  const result = await orchestrator.run("Una web para administrar reservas de una peluquería", (event) => {
    events.push(`${event.stage}:${event.status}`);
  });

  assert.equal(result.status, "completed");
  assert.ok(result.artifacts["PRODUCT.md"]);
  assert.ok(result.artifacts["MVP.md"]);
  assert.ok(result.artifacts["ARCHITECTURE.md"]);
  assert.ok(result.artifacts["IMPLEMENTATION_PLAN.md"]);
  assert.ok(result.artifacts["VALIDATION.md"]);
  assert.ok(result.artifacts["MODEL_ROUTING.json"]);
  assert.ok(result.artifacts["generated/package.json"]);
  assert.ok(result.artifacts["generated/app/page.tsx"]);
  assert.ok(result.artifacts["generated/app/layout.tsx"]);
  assert.ok(result.artifacts["generated/app/auth-panel.tsx"]);
  assert.ok(result.artifacts["generated/lib/auth.ts"]);
  assert.ok(result.artifacts["generated/AUTH.md"]);
  assert.ok(result.artifacts["generated/DOMAIN.json"]);
  assert.ok(result.artifacts["generated/DOMAIN_FLOW.json"]);
  assert.ok(result.artifacts["generated/DATA_MODEL.json"]);
  assert.ok(result.artifacts["generated/lib/persistence.ts"]);
  assert.ok(result.artifacts["generated/PERSISTENCE.md"]);
  assert.ok(result.artifacts["generated/supabase/schema.sql"]);
  assert.ok(result.artifacts["generated/vercel.json"]);
  assert.ok(result.artifacts["generated/DEPLOY.md"]);
  assert.ok(result.artifacts["generated/.env.example"]);
  assert.match(result.artifacts["generated/app/page.tsx"], /AuthPanel/);
  assert.match(result.artifacts["generated/app/page.tsx"], /createPersistenceAdapter/);
  assert.match(result.artifacts["generated/lib/persistence.ts"], /localStorage/);
  assert.match(result.artifacts["generated/lib/persistence.ts"], /supabase/);
  assert.match(result.artifacts["generated/lib/auth.ts"], /signIn/);
  assert.match(result.artifacts["generated/DOMAIN.json"], /booking/);
  assert.match(result.artifacts["generated/DOMAIN_FLOW.json"], /Nueva reserva/);
  assert.match(result.artifacts["MODEL_ROUTING.json"], /local-compiler/);

  const schema = result.artifacts["generated/supabase/schema.sql"];
  assert.match(schema, /owner_id/);
  assert.match(schema, /auth\.uid\(\) = owner_id/);
  assert.doesNotMatch(schema, /to anon/i);
  assert.doesNotMatch(schema, /using \(true\)/i);

  assert.ok(events.some((item) => item === "product-agent:running"));
  assert.ok(events.some((item) => item === "repo-devops-agent:completed"));
  assert.equal(result.nextP0?.id, "P0-012");
  assert.equal(result.firstCustomerBlocker, "Automatizar entrega repo + deploy desde control plane");
});

test("model router stays free and local when no remote provider is configured", async () => {
  const router = new ModelRouter({ endpoint: "", model: "" });
  const result = await router.compileDomain("marketplace para contratar músicos");
  assert.equal(result.route, "local");
  assert.equal(result.provider, "local-compiler");
  assert.equal(result.spec.kind, "marketplace");
});

test("domain compiler detects booking and marketplace products", () => {
  assert.equal(compileDomain("agenda de turnos para peluquería").kind, "booking");
  assert.equal(compileDomain("marketplace para contratar músicos").kind, "marketplace");
});

test("empty idea is rejected", async () => {
  const orchestrator = new ArchitectOrchestrator();
  await assert.rejects(() => orchestrator.run("   "), /no puede estar vacía/i);
});
