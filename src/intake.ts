import type { ProductRequest } from "./types.js";

export function normalizeIdea(input: string): ProductRequest {
  const idea = input.trim().replace(/\s+/g, " ");
  if (!idea) throw new Error("La idea del producto no puede estar vacía.");

  return {
    idea,
    constraints: [
      "costo cero o mínimo",
      "GitHub-first",
      "compatible con Vercel",
      "no preguntar por decisiones técnicas rutinarias",
      "evitar sobreingeniería"
    ],
    target: "web MVP"
  };
}

export function slugFromIdea(idea: string): string {
  return idea
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "producto";
}
