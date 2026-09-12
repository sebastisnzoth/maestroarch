import { NextResponse } from "next/server";

interface WorkflowRun {
  id: number;
  name: string;
  display_title: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_number: number;
}

function config() {
  const token = process.env.MAESTROARCH_CONTROL_GITHUB_TOKEN;
  const repository = process.env.MAESTROARCH_CONTROL_REPOSITORY ?? "sebastisnzoth/maestroarch";
  if (!token) throw new Error("MAESTROARCH_CONTROL_GITHUB_TOKEN no está configurado.");
  return { token, repository };
}

export async function GET(request: Request) {
  try {
    const cfg = config();
    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId")?.trim();
    const response = await fetch(`https://api.github.com/repos/${cfg.repository}/actions/workflows/product-builder.yml/runs?per_page=30`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cfg.token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      },
      cache: "no-store"
    });

    if (!response.ok) return NextResponse.json({ error: `No se pudieron consultar las ejecuciones (${response.status}).` }, { status: 502 });
    const payload = await response.json() as { workflow_runs?: WorkflowRun[] };
    const all = payload.workflow_runs ?? [];
    const selected = jobId ? all.filter((run) => run.display_title.includes(jobId)) : all.slice(0, 12);
    const runs = selected.map((run) => ({
      id: run.id,
      jobId: run.display_title.replace(/^MaestroArch\s+/, ""),
      title: run.display_title,
      status: run.status,
      conclusion: run.conclusion,
      url: run.html_url,
      runNumber: run.run_number,
      createdAt: run.created_at,
      updatedAt: run.updated_at
    }));
    return NextResponse.json({ runs });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error interno" }, { status: 500 });
  }
}
