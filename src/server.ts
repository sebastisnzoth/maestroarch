import { createServer } from "node:http";
import { join } from "node:path";
import { ArchitectOrchestrator } from "./orchestrator.js";
import { writeWorkspace } from "./workspace.js";
import { validateGeneratedProject, validationPassed } from "./validation.js";

const port = Number(process.env.PORT ?? 3000);

const page = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaestroArch</title>
<style>*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;background:#07111f;color:#f7f9fc}.wrap{max-width:900px;margin:auto;padding:48px 20px}.badge{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.65}h1{font-size:clamp(42px,9vw,82px);line-height:.95;margin:14px 0 24px}.lead{font-size:19px;color:#b9c7db;max-width:720px}.panel{margin-top:32px;padding:22px;border:1px solid #263b58;background:#0e1a2d;border-radius:20px}textarea{width:100%;min-height:150px;resize:vertical;border-radius:14px;border:1px solid #304664;background:#07111f;color:#fff;padding:16px;font:inherit}button{margin-top:12px;padding:13px 18px;border:0;border-radius:12px;background:#fff;color:#07111f;font-weight:700;cursor:pointer}.status{margin-top:20px;white-space:pre-wrap;padding:16px;border-radius:14px;background:#07111f;border:1px solid #263b58;color:#cbd7e7}.ok{color:#99f6c4}.error{color:#ffb4b4}</style></head>
<body><main class="wrap"><p class="badge">Creador Arquitecto · control plane v0.1</p><h1>Decime qué querés crear.</h1><p class="lead">MaestroArch convierte la idea en producto, arquitectura, aplicación web, validación y workspace listo para GitHub.</p><section class="panel"><form id="form"><textarea id="idea" placeholder="Ej.: Quiero una app para contratar músicos por hora, con perfiles, solicitudes y contratos."></textarea><button id="submit">Construir MVP</button></form><div id="status" class="status">Esperando una idea.</div></section></main>
<script>
const form=document.getElementById('form'),idea=document.getElementById('idea'),status=document.getElementById('status'),submit=document.getElementById('submit');
form.addEventListener('submit',async(e)=>{e.preventDefault();const value=idea.value.trim();if(!value)return;submit.disabled=true;status.className='status';status.textContent='Orquestando producto…';try{const r=await fetch('/api/run',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({idea:value})});const data=await r.json();if(!r.ok)throw new Error(data.error||'Error');status.className='status ok';status.textContent='MVP generado\n\nDominio: '+data.domain+'\nBuild: '+(data.buildOk?'OK':'requiere corrección')+'\nWorkspace: '+data.workspace+'\nPróximo P0: '+(data.nextP0||'ninguno')+'\nBloqueo primer cliente: '+data.firstCustomerBlocker;}catch(err){status.className='status error';status.textContent=String(err.message||err)}finally{submit.disabled=false}});
</script></body></html>`;

function json(res: import("node:http").ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(page);
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    json(res, 200, { ok: true, service: "maestroarch" });
    return;
  }

  if (req.method === "POST" && req.url === "/api/run") {
    try {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      const parsed = JSON.parse(raw || "{}");
      const idea = typeof parsed.idea === "string" ? parsed.idea.trim() : "";
      if (!idea) return json(res, 400, { error: "La idea es obligatoria." });

      const orchestrator = new ArchitectOrchestrator();
      const result = await orchestrator.run(idea);
      const dir = await writeWorkspace("runs", result.slug, result.artifacts);
      const checks = await validateGeneratedProject(join(dir, "generated"));
      const buildOk = validationPassed(checks);
      const domain = JSON.parse(result.artifacts["generated/DOMAIN.json"] ?? "{}");

      json(res, buildOk ? 200 : 422, {
        runId: result.runId,
        status: buildOk ? result.status : "fixing",
        domain: domain.title ?? domain.kind ?? "generic",
        buildOk,
        workspace: dir,
        nextP0: result.nextP0?.id ?? null,
        firstCustomerBlocker: buildOk ? result.firstCustomerBlocker : "El build generado necesita corrección adicional",
        validation: checks.map(({ name, ok, repaired }) => ({ name, ok, repaired: repaired ?? false }))
      });
    } catch (error) {
      json(res, 500, { error: error instanceof Error ? error.message : "Error interno" });
    }
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(port, () => console.log(`MaestroArch web listo en http://localhost:${port}`));
