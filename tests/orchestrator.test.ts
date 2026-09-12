import test from "node:test";
import assert from "node:assert/strict";
import { ArchitectOrchestrator } from "../src/orchestrator.js";

test("orchestrator converts an idea into required artifacts and next P0", async () => {
  const orchestrator = new ArchitectOrchestrator();
  const result = await orchestrator.run("Una web para administrar reservas de una peluquería");

  assert.equal(result.status, "completed");
  assert.ok(result.artifacts["PRODUCT.md"]);
  assert.ok(result.artifacts["MVP.md"]);
  assert.ok(result.artifacts["ARCHITECTURE.md"]);
  assert.ok(result.artifacts["IMPLEMENTATION_PLAN.md"]);
  assert.ok(result.artifacts["VALIDATION.md"]);
  assert.equal(result.nextP0?.id, "P0-003");
  assert.equal(result.firstCustomerBlocker, "Implementar generador web real");
});

test("empty idea is rejected", async () => {
  const orchestrator = new ArchitectOrchestrator();
  await assert.rejects(() => orchestrator.run("   "), /no puede estar vacía/i);
});
