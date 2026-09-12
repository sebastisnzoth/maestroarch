"use client";

import { FormEvent, useEffect, useState } from "react";

type Run = {
  id: number;
  jobId: string;
  title: string;
  status: string;
  conclusion: string | null;
  url: string;
  runNumber: number;
  createdAt: string;
  updatedAt: string;
};

export default function Home() {
  const [idea, setIdea] = useState("");
  const [repository, setRepository] = useState("");
  const [createRepositoryName, setCreateRepositoryName] = useState("");
  const [deployVercel, setDeployVercel] = useState(false);
  const [production, setProduction] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadRuns(currentJobId?: string | null) {
    const response = await fetch(`/api/runs${currentJobId ? `?jobId=${encodeURIComponent(currentJobId)}` : ""}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "No se pudo consultar el worker.");
    setRuns(payload.runs ?? []);
    return payload.runs?.[0] as Run | undefined;
  }

  useEffect(() => {
    loadRuns().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const run = await loadRuns(jobId);
        if (!cancelled && run && run.status === "completed") {
          clearInterval(timer);
          setBusy(false);
        }
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Error consultando ejecución");
      }
    }, 2500);
    return () => { cancelled = true; clearInterval(timer); };
  }, [jobId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!idea.trim() || busy) return;
    setBusy(true);
    setError("");
    setRuns([]);
    try {
      const response = await fetch("/api/build", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idea: idea.trim(), repository: repository.trim() || undefined, createRepositoryName: createRepositoryName.trim() || undefined, deployVercel, production })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No se pudo iniciar el worker.");
      setJobId(payload.jobId);
    } catch (cause) {
      setBusy(false);
      setError(cause instanceof Error ? cause.message : "Error iniciando ejecución");
    }
  }

  const current = runs[0];
  const statusText = !jobId ? "Listo para crear" : !current ? "Encolando worker…" : current.status === "completed" ? (current.conclusion === "success" ? "Producto construido" : `Finalizó: ${current.conclusion}`) : `Trabajando: ${current.status}`;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">MaestroArch · Creador Arquitecto</p>
        <h1>Describí el producto.<br />El sistema lo construye.</h1>
        <p className="lead">El control plane hospedado delega el trabajo pesado a GitHub Actions: Product, CTO, desarrollo, QA, seguridad, build y entrega sin mantener un servidor caro encendido.</p>
      </section>

      <section className="panel">
        <form onSubmit={submit}>
          <label>¿Qué querés crear?</label>
          <textarea value={idea} onChange={(event) => setIdea(event.target.value)} maxLength={12000} placeholder="Ej.: Una app para contratar músicos por hora, con perfiles, solicitudes, propuestas y contratos." />
          <div className="grid">
            <label>Repo GitHub existente (opcional)<input value={repository} onChange={(event) => setRepository(event.target.value)} placeholder="owner/repositorio" /></label>
            <label>Crear repo nuevo (opcional)<input value={createRepositoryName} onChange={(event) => setCreateRepositoryName(event.target.value)} placeholder="mi-producto" /></label>
          </div>
          <div className="checks">
            <label><input type="checkbox" checked={deployVercel} onChange={(event) => setDeployVercel(event.target.checked)} /> Deploy Vercel</label>
            <label><input type="checkbox" checked={production} onChange={(event) => setProduction(event.target.checked)} /> Producción</label>
          </div>
          <button disabled={busy || !idea.trim()}>{busy ? "Construyendo…" : "Construir producto"}</button>
        </form>
        <p className="hint">La generación y validación funcionan sin IA paga. GitHub/Vercel usan secretos del entorno únicamente cuando pedís entrega externa.</p>
      </section>

      <section className="statusCard">
        <div><p className="eyebrow">Estado</p><h2>{statusText}</h2></div>
        {current?.url && <a href={current.url} target="_blank" rel="noreferrer">Ver ejecución #{current.runNumber}</a>}
        {error && <p className="error">{error}</p>}
        {jobId && <p className="job">Job: {jobId}</p>}
      </section>

      <section className="history">
        <div className="historyHead"><div><p className="eyebrow">Worker</p><h2>{jobId ? "Ejecución actual" : "Ejecuciones recientes"}</h2></div>{!jobId && <button className="secondary" onClick={() => loadRuns().catch((cause) => setError(String(cause)))}>Actualizar</button>}</div>
        {runs.length === 0 ? <p className="empty">Todavía no hay datos del worker para mostrar.</p> : runs.map((run) => <article className="run" key={run.id}><div><strong>{run.title}</strong><span>{new Date(run.createdAt).toLocaleString()}</span></div><div className={`pill ${run.conclusion === "success" ? "success" : ""}`}>{run.conclusion ?? run.status}</div></article>)}
      </section>
    </main>
  );
}
