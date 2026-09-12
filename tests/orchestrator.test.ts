import test from "node:test";
import assert from "node:assert/strict";
import { ArchitectOrchestrator } from "../src/orchestrator.js";

test("orchestrator converts an idea into specs plus executable web scaffold", async () => {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run("Una web para administrar reservas de una peluquería");

  assert.equal(result.status, "completed");
  assert.ok(result.artifacts["PRODUCT.md"]);
  assert.ok(result.artifacts["MVP.md"]);
  assert.ok(result.artifacts["ARCHITECTURE.md"]);
  assert.ok(result.artifacts["IMPLEMENTATION_PLAN.md"]);
  assert.ok(result.artifacts["VALIDATION.md"]);
  assert.ok(result.artifacts["generated/package.json"]);
  assert.ok(result.artifacts["generated/app/page.tsx"]);
  assert.ok(result.artifacts["generated/app/layout.tsx"]);
  assert.equal(result.nextP0?.id, "P0-004");
  assert.equal(result.firstCustomerBlocker, "Ejecutar autocorrección por validaciones");
});

test("empty idea is rejected", async () => {
  const orchestrator = new ArchitectOrchestrator();
  await assert.rejects(() => orchestrator.run("   "), /no puede estar vacía/i);
});
