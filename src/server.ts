import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { readGeneratedArtifacts, writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";
import { deliverGeneratedProduct } from "./delivery.js";
import { JsonRunStore } from "./run-store.js";
import type { OrchestrationEvent } from "./types.js";

const port = Number(process.env.PORT ?? 3000);

type WebRunStatus = "queued" | "running" | "validating" | "delivering" | "completed" | "failed" | "blocked";
interface DeliveryRequest {
  repository?: string;
  createRepositoryName?: string;
  deployVercel?: boolean;
  production?: boolean;
}
interface WebRunState {
  jobId: string;
  idea: string;
  createdAt: string;
  updatedAt: string;
  delivery: DeliveryRequest;
  status: WebRunStatus;
  events: OrchestrationEvent[];
  result?: {
    runId: string;
    domain: string;
    buildOk: boolean;
    workspace: string;
    nextP0: string | null;
    firstCustomerBlocker: string;
    modelRoute: string;
    repository?: string;
    repositoryUrl?: string;
    deploymentUrl?: string;
    deliveryBlockers: string[];
    validation: Array<{ name: string; ok: boolean; repaired: boolean }>;
  };
  error?: string;
}

const store = new JsonRunStore<WebRunState>();
const restored = await store.loadAll();
const runs = new Map<string, WebRunState>();
for (const state of restored) {
  if (["queued", "running", "validating", "delivering"].includes(state.status)) {
    state.status = "blocked";
    state.error = "Ejecución interrumpida por reinicio. El workspace y estado fueron recuperados.";
    state.updatedAt = new Date().toISOString();
  }
  runs.set(state.jobId, state);
}

let persistQueue = Promise.resolve();
function persistRuns(): Promise<void> {
  persistQueue = persistQueue.then(() => store.saveAll(runs.values())).catch((error) => {
    console.error("No se pudo persistir el historial de runs", error);
  });
  return persistQueue;
}
await persistRuns();

function touch(state: WebRunState) {
  state.updatedAt = new Date().toISOString();
  void persistRuns();
}

const page = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroArch</title>
<style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#07111f;color:#f7f9fc}.wrap{max-width:980px;margin:auto;padding:48px 20px}.badge{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.65}h1{font-size:clamp(42px,9vw,82px);line-height:.95;margin:14px 0 24px}.lead{font-size:19px;color:#b9c7db;max-width:760px}.panel{margin-top:32px;padding:22px;border:1px solid #263b58;background:#0e1a2d;border-radius:20px}textarea,input[type=text]{width:100%;border-radius:14px;border:1px solid #304664;background:#07111f;color:#fff;padding:14px 16px;font:inherit}textarea{min-height:150px;resize:vertical}.delivery{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}.options{display:flex;flex-wrap:wrap;gap:18px;margin-top:14px;color:#cbd7e7;font-size:14px}.options label{display:flex;align-items:center;gap:7px}button{margin-top:12px;padding:13px 18px;border:0;border-radius:12px;background:#fff;color:#07111f;font-weight:700;cursor:pointer}button:disabled{opacity:.55;cursor:wait}.hint{font-size:12px;color:#8294ad;margin-top:8px}.status,.history{margin-top:20px;padding:16px;border-radius:14px;background:#07111f;border:1px solid #263b58;color:#cbd7e7}.ok{color:#99f6c4}.error{color:#ffb4b4}.timeline{display:grid;gap:9px;margin-top:14px}.event{display:grid;grid-template-columns:140px 100px 1fr;gap:12px;padding:10px 12px;border:1px solid #223650;border-radius:10px;color:#cbd7e7}.event b{color:#fff}.event .completed{color:#99f6c4}.event .running{color:#fde68a}.event .failed,.event .blocked{color:#ffb4b4}.result{white-space:pre-wrap;margin-top:16px;padding-top:16px;border-top:1px solid #263b58}.historyList{display:grid;gap:8px;margin-top:10px}.historyItem{display:flex;justify-content:space-between;gap:12px;padding:10px;border:1px solid #223650;border-radius:10px}.historyItem button{margin:0;padding:7px 10px;font-size:12px}@media(max-width:700px){.event,.delivery{grid-template-columns:1fr}.historyItem{flex-direction:column}.wrap{padding-top:30px}}</style></head>
<body><main class="wrap"><p class="badge">Creador Arquitecto · control plane v0.4</p><h1>Decime qué querés crear.</h1><p class="lead">Idea → producto → arquitectura → app funcional → QA → GitHub → Vercel. El historial sobrevive reinicios locales y una entrega bloqueada por credenciales se puede reanudar sin reconstruir el producto.</p><section class="panel"><form id="form"><textarea id="idea" maxlength="12000" placeholder="Ej.: Quiero una app para contratar músicos por hora, con perfiles, solicitudes y contratos."></textarea><div class="delivery"><input id="repository" type="text" placeholder="GitHub existente: owner/repo (opcional)"><input id="createRepo" type="text" placeholder="Crear repo nuevo: nombre (opcional)"></div><div class="options"><label><input id="deploy" type="checkbox"> Deploy Vercel</label><label><input id="prod" type="checkbox"> Producción</label></div><p class="hint">Las integraciones externas solo se ejecutan si sus credenciales existen como variables de entorno. Los secretos nunca se guardan en el historial.</p><button id="submit">Construir MVP</button></form><div id="status" class="status">Esperando una idea.</div><div class="history"><b>Historial reciente</b><div id="history" class="historyList">Cargando…</div></div></section></main>
<script>
const form=document.getElementById('form'),idea=document.getElementById('idea'),status=document.getElementById('status'),submit=document.getElementById('submit'),repository=document.getElementById('repository'),createRepo=document.getElementById('createRepo'),deploy=document.getElementById('deploy'),prod=document.getElementById('prod'),history=document.getElementById('history');
const esc=(v)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(data){const events=(data.events||[]).map((e)=>'<div class="event"><b>'+esc(e.stage)+'</b><span class="'+esc(e.status)+'">'+esc(e.status)+'</span><span>'+esc(e.message)+'</span></div>').join('');let result='';if(data.result){const repo=data.result.repositoryUrl?'\nGitHub: '+esc(data.result.repositoryUrl):'';const deployUrl=data.result.deploymentUrl?'\nVercel: '+esc(data.result.deploymentUrl):'';const blockers=(data.result.deliveryBlockers||[]).length?'\nEntrega bloqueada: '+esc(data.result.deliveryBlockers.join(' ')):'';result='<div class="result"><b>MVP generado</b>\nDominio: '+esc(data.result.domain)+'\nModel Router: '+esc(data.result.modelRoute)+'\nBuild: '+(data.result.buildOk?'OK':'requiere corrección')+'\nWorkspace: '+esc(data.result.workspace)+repo+deployUrl+'\nPróximo P0: '+esc(data.result.nextP0||'ninguno')+'\nBloqueo primer cliente: '+esc(data.result.firstCustomerBlocker)+blockers+'</div>'}status.className='status '+(data.status==='completed'?'ok':(data.status==='failed'||data.status==='blocked')?'error':'');status.innerHTML='<b>Estado: '+esc(data.status)+'</b><div class="timeline">'+events+'</div>'+result+(data.error?'<div class="result">'+esc(data.error)+'</div>':'')}
async function poll(jobId){for(;;){const r=await fetch('/api/run/'+encodeURIComponent(jobId));const data=await r.json();render(data);if(['completed','failed','blocked'].includes(data.status)){await loadHistory();return}await new Promise((resolve)=>setTimeout(resolve,650));}}
async function loadHistory(){const r=await fetch('/api/runs');const data=await r.json();history.innerHTML=(data.runs||[]).map((run)=>'<div class="historyItem"><span><b>'+esc(run.status)+'</b> · '+esc(run.idea.slice(0,90))+'</span><span><button data-open="'+esc(run.jobId)+'">Ver</button>'+(run.canResumeDelivery?' <button data-resume="'+esc(run.jobId)+'">Reanudar entrega</button>':'')+'</span></div>').join('')||'Sin ejecuciones todavía.';history.querySelectorAll('[data-open]').forEach((btn)=>btn.onclick=async()=>{const r=await fetch('/api/run/'+encodeURIComponent(btn.dataset.open));render(await r.json())});history.querySelectorAll('[data-resume]').forEach((btn)=>btn.onclick=async()=>{await fetch('/api/run/'+encodeURIComponent(btn.dataset.resume)+'/resume-delivery',{method:'POST'});await poll(btn.dataset.resume)});}
form.addEventListener('submit',async(e)=>{e.preventDefault();const value=idea.value.trim();if(!value)return;submit.disabled=true;status.className='status';status.textContent='Creando ejecución…';try{const r=await fetch('/api/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:value,repository:repository.value.trim()||undefined,createRepositoryName:createRepo.value.trim()||undefined,deployVercel:deploy.checked,production:prod.checked})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Error');await poll(data.jobId)}catch(err){status.className='status error';status.textContent=String(err.message||err)}finally{submit.disabled=false}});loadHistory();
</script></body></html>`;

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(JSON.stringify(body));
}

function event(runId: string, stage: string, status: OrchestrationEvent["status"], message: string): OrchestrationEvent {
  return { runId, stage, status, message, timestamp: new Date().toISOString() };
}

async function executeRun(state: WebRunState) {
  state.status = "running";
  touch(state);
  try {
    const orchestrator = new ArchitectOrchestrator();
    const result = await orchestrator.run(state.idea, async (item) => { state.events.push(item); state.updatedAt = new Date().toISOString(); await persistRuns(); });
    const dir = await writeWorkspace("runs", result.slug, result.artifacts);

    state.status = "validating";
    state.events.push(event(result.runId, "validation-engine", "running", "Ejecutando install/build y autocorrección del proyecto generado."));
    touch(state);
    const checks = await validateGeneratedProject(join(dir, "generated"));
    const buildOk = validationPassed(checks);
    state.events.push(event(result.runId, "validation-engine", buildOk ? "completed" : "failed", buildOk ? "Build validado correctamente." : "El build requiere corrección adicional."));

    let deliveryResult = { published: [] as string[], blockers: [] as string[], repository: undefined as string | undefined, repositoryUrl: undefined as string | undefined, deploymentUrl: undefined as string | undefined };
    const wantsDelivery = Boolean(state.delivery.repository || state.delivery.createRepositoryName || state.delivery.deployVercel);
    if (buildOk && wantsDelivery) {
      state.status = "delivering";
      state.events.push(event(result.runId, "delivery", "running", "Entregando producto según destino solicitado."));
      touch(state);
      deliveryResult = await deliverGeneratedProduct({
        artifacts: result.artifacts,
        generatedDir: join(dir, "generated"),
        repository: state.delivery.repository,
        createRepositoryName: state.delivery.createRepositoryName,
        deployVercel: state.delivery.deployVercel,
        production: state.delivery.production
      });
      state.events.push(event(result.runId, "delivery", deliveryResult.blockers.length ? "blocked" : "completed", deliveryResult.blockers.length ? deliveryResult.blockers.join(" ") : "Entrega completada."));
    }

    const domain = JSON.parse(result.artifacts["generated/DOMAIN.json"] ?? "{}");
    const routing = JSON.parse(result.artifacts["MODEL_ROUTING.json"] ?? "{}");
    const blocker = !buildOk ? "El build generado necesita corrección adicional" : deliveryResult.blockers.length ? deliveryResult.blockers.join(" ") : result.firstCustomerBlocker;

    state.result = {
      runId: result.runId,
      domain: domain.title ?? domain.kind ?? "generic",
      buildOk,
      workspace: dir,
      nextP0: result.nextP0?.id ?? null,
      firstCustomerBlocker: blocker,
      modelRoute: `${routing.route ?? "local"}:${routing.provider ?? "local-compiler"}`,
      repository: deliveryResult.repository,
      repositoryUrl: deliveryResult.repositoryUrl,
      deploymentUrl: deliveryResult.deploymentUrl,
      deliveryBlockers: deliveryResult.blockers,
      validation: checks.map(({ name, ok, repaired }) => ({ name, ok, repaired: repaired ?? false }))
    };
    state.status = !buildOk ? "failed" : deliveryResult.blockers.length ? "blocked" : "completed";
    touch(state);
  } catch (error) {
    state.status = "failed";
    state.error = error instanceof Error ? error.message : "Error interno";
    touch(state);
  }
}

async function resumeDelivery(state: WebRunState) {
  if (!state.result?.buildOk) throw new Error("No existe un build validado para reanudar.");
  if (!state.delivery.repository && !state.delivery.createRepositoryName && !state.delivery.deployVercel) throw new Error("La ejecución no tiene un destino de entrega pendiente.");

  state.status = "delivering";
  state.error = undefined;
  state.events.push(event(state.result.runId, "delivery-resume", "running", "Reintentando entrega desde el workspace recuperado."));
  touch(state);

  try {
    const artifacts = await readGeneratedArtifacts(state.result.workspace);
    const delivered = await deliverGeneratedProduct({
      artifacts,
      generatedDir: join(state.result.workspace, "generated"),
      repository: state.result.repository ?? state.delivery.repository,
      createRepositoryName: state.result.repository ? undefined : state.delivery.createRepositoryName,
      deployVercel: state.delivery.deployVercel,
      production: state.delivery.production
    });
    state.result.repository = delivered.repository;
    state.result.repositoryUrl = delivered.repositoryUrl;
    state.result.deploymentUrl = delivered.deploymentUrl;
    state.result.deliveryBlockers = delivered.blockers;
    state.result.firstCustomerBlocker = delivered.blockers.length ? delivered.blockers.join(" ") : "Ninguno: build y entrega completados";
    state.status = delivered.blockers.length ? "blocked" : "completed";
    state.events.push(event(state.result.runId, "delivery-resume", delivered.blockers.length ? "blocked" : "completed", delivered.blockers.length ? delivered.blockers.join(" ") : "Entrega reanudada correctamente."));
  } catch (error) {
    state.status = "blocked";
    state.error = error instanceof Error ? error.message : "No se pudo reanudar la entrega";
    state.events.push(event(state.result.runId, "delivery-resume", "failed", state.error));
  }
  touch(state);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page);
    return;
  }

  if (req.method === "GET" && url.pathname === "/health") {
    json(res, 200, {
      ok: true,
      service: "maestroarch",
      githubDeliveryConfigured: Boolean(process.env.GITHUB_TOKEN),
      vercelDeliveryConfigured: Boolean(process.env.VERCEL_TOKEN),
      persistedRuns: runs.size,
      activeRuns: [...runs.values()].filter((run) => !["completed", "failed", "blocked"].includes(run.status)).length
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/runs") {
    const history = [...runs.values()]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 50)
      .map((state) => ({
        jobId: state.jobId,
        idea: state.idea,
        status: state.status,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
        domain: state.result?.domain,
        repositoryUrl: state.result?.repositoryUrl,
        deploymentUrl: state.result?.deploymentUrl,
        canResumeDelivery: state.status === "blocked" && Boolean(state.result?.buildOk && (state.delivery.repository || state.delivery.createRepositoryName || state.delivery.deployVercel))
      }));
    json(res, 200, { runs: history });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/run") {
    try {
      let raw = "";
      for await (const chunk of req) {
        raw += chunk;
        if (raw.length > 50_000) throw new Error("Payload demasiado grande.");
      }
      const parsed = JSON.parse(raw || "{}");
      const idea = typeof parsed.idea === "string" ? parsed.idea.trim() : "";
      const repository = typeof parsed.repository === "string" ? parsed.repository.trim() : "";
      const createRepositoryName = typeof parsed.createRepositoryName === "string" ? parsed.createRepositoryName.trim() : "";
      if (!idea) return json(res, 400, { error: "La idea es obligatoria." });
      if (idea.length > 12_000) return json(res, 400, { error: "La idea supera el máximo de 12000 caracteres." });
      if (repository && createRepositoryName) return json(res, 400, { error: "Usá un repo existente o creá uno nuevo, no ambos." });

      const now = new Date().toISOString();
      const jobId = randomUUID();
      const state: WebRunState = {
        jobId,
        idea,
        createdAt: now,
        updatedAt: now,
        status: "queued",
        events: [],
        delivery: {
          repository: repository || process.env.MAESTROARCH_GITHUB_REPOSITORY || undefined,
          createRepositoryName: createRepositoryName || undefined,
          deployVercel: Boolean(parsed.deployVercel),
          production: Boolean(parsed.production)
        }
      };
      runs.set(jobId, state);
      await persistRuns();
      void executeRun(state);
      json(res, 202, { jobId, status: state.status });
    } catch (error) {
      json(res, 400, { error: error instanceof Error ? error.message : "Solicitud inválida" });
    }
    return;
  }

  const resumeMatch = url.pathname.match(/^\/api\/run\/([^/]+)\/resume-delivery$/);
  if (req.method === "POST" && resumeMatch) {
    const state = runs.get(decodeURIComponent(resumeMatch[1]));
    if (!state) return json(res, 404, { error: "Ejecución no encontrada." });
    if (state.status === "delivering") return json(res, 409, { error: "La entrega ya está en ejecución." });
    void resumeDelivery(state);
    json(res, 202, { jobId: state.jobId, status: "delivering" });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/run/")) {
    const jobId = decodeURIComponent(url.pathname.slice("/api/run/".length));
    const state = runs.get(jobId);
    if (!state) return json(res, 404, { error: "Ejecución no encontrada." });
    json(res, 200, state);
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(port, () => console.log(`MaestroArch web listo en http://localhost:${port}`));
