import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

function config() {
  const token = process.env.MAESTROARCH_CONTROL_GITHUB_TOKEN;
  const repository = process.env.MAESTROARCH_CONTROL_REPOSITORY ?? "sebastisnzoth/maestroarch";
  const ref = process.env.MAESTROARCH_CONTROL_BRANCH ?? "main";
  if (!token) throw new Error("MAESTROARCH_CONTROL_GITHUB_TOKEN no está configurado en el control plane.");
  return { token, repository, ref };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idea = typeof body.idea === "string" ? body.idea.trim() : "";
    const repository = typeof body.repository === "string" ? body.repository.trim() : "";
    const createRepositoryName = typeof body.createRepositoryName === "string" ? body.createRepositoryName.trim() : "";
    if (!idea) return NextResponse.json({ error: "La idea es obligatoria." }, { status: 400 });
    if (idea.length > 12000) return NextResponse.json({ error: "La idea supera 12000 caracteres." }, { status: 400 });
    if (repository && createRepositoryName) return NextResponse.json({ error: "Elegí repo existente o repo nuevo, no ambos." }, { status: 400 });

    const cfg = config();
    const jobId = randomUUID();
    const response = await fetch(`https://api.github.com/repos/${cfg.repository}/actions/workflows/product-builder.yml/dispatches`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cfg.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ref: cfg.ref,
        inputs: {
          job_id: jobId,
          idea,
          repository,
          create_repository_name: createRepositoryName,
          deploy_vercel: body.deployVercel ? "true" : "false",
          production: body.production ? "true" : "false"
        }
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `GitHub worker no pudo iniciarse (${response.status}).`, detail }, { status: 502 });
    }

    return NextResponse.json({ jobId, status: "queued" }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
