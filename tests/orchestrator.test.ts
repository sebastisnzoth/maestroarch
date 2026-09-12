import test from "node:test";
import assert from "node:assert/strict";
import { ArchitectOrchestrator } from "../src/orchestrator.js";
import { compileDomain } from "../src/domain.js";

test("orchestrator converts an idea into specs plus interactive domain MVP", async () => {
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
  assert.ok(result.artifacts["generated/DOMAIN.json"]);
  assert.match(result.artifacts["generated/app/page.tsx"], /use client/);
  assert.match(result.artifacts["generated/app/page.tsx"], /localStorage/);
  assert.match(result.artifacts["generated/DOMAIN.json"], /booking/);
  assert.equal(result.nextP0?.id, "P0-005");
  assert.equal(result.firstCustomerBlocker, "Publicar proyecto generado en GitHub");
});

test("domain compiler detects booking and marketplace products", () => {
  assert.equal(compileDomain("agenda de turnos para peluquería").kind, "booking");
  assert.equal(compileDomain("marketplace para contratar músicos").kind, "marketplace");
});

test("empty idea is rejected", async () => {
  const orchestrator = new ArchitectOrchestrator();
  await assert.rejects(() => orchestrator.run("   "), /no puede estar vacía/i);
});
