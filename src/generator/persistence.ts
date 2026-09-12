import type { DomainSpec } from "../domain.js";

export function generatePersistenceArtifacts(domain: DomainSpec): Record<string, string> {
  const table = `maestroarch_${domain.kind}_records`;
  const contract = {
    mode: "local-first",
    defaultAdapter: "localStorage",
    optionalAdapter: "supabase-rest",
    table,
    fields: [
      { name: "id", type: "uuid", required: true },
      { name: "name", type: "text", required: true },
      { name: "detail", type: "text", required: false },
      { name: "status", type: "text", required: true },
      { name: "created_at", type: "timestamptz", required: true }
    ]
  };

  return {
    "generated/DATA_MODEL.json": JSON.stringify(contract, null, 2) + "\n",
    "generated/lib/persistence.ts": `export type PersistedRecord = { id: string; name: string; detail: string; status: string };\n\nexport interface PersistenceAdapter {\n  mode: \"local\" | \"supabase\";\n  list(): Promise<PersistedRecord[]>;\n  create(item: PersistedRecord): Promise<void>;\n  update(item: PersistedRecord): Promise<void>;\n  remove(id: string): Promise<void>;\n}\n\nfunction localAdapter(storageKey: string): PersistenceAdapter {\n  const read = (): PersistedRecord[] => {\n    if (typeof window === \"undefined\") return [];\n    try { return JSON.parse(localStorage.getItem(storageKey) ?? \"[]\"); } catch { return []; }\n  };\n  const write = (records: PersistedRecord[]) => { if (typeof window !== \"undefined\") localStorage.setItem(storageKey, JSON.stringify(records)); };\n  return {\n    mode: \"local\",\n    async list() { return read(); },\n    async create(item) { write([item, ...read().filter((row) => row.id !== item.id)]); },\n    async update(item) { write(read().map((row) => row.id === item.id ? item : row)); },\n    async remove(id) { write(read().filter((row) => row.id !== id)); }\n  };\n}\n\nfunction supabaseAdapter(url: string, anonKey: string): PersistenceAdapter {\n  const endpoint = url.replace(/\\/$/, \"\") + \"/rest/v1/${table}\";\n  const headers = { apikey: anonKey, authorization: \"Bearer \" + anonKey, \"content-type\": \"application/json\" };\n  async function request(path = \"\", init: RequestInit = {}) {\n    const response = await fetch(endpoint + path, { ...init, headers: { ...headers, ...(init.headers ?? {}) } });\n    if (!response.ok) throw new Error(\"Supabase persistence error \" + response.status);\n    return response;\n  }\n  return {\n    mode: \"supabase\",\n    async list() { const response = await request(\"?select=id,name,detail,status&order=created_at.desc\"); return response.json(); },\n    async create(item) { await request(\"\", { method: \"POST\", headers: { Prefer: \"return=minimal\" }, body: JSON.stringify(item) }); },\n    async update(item) { await request(\"?id=eq.\" + encodeURIComponent(item.id), { method: \"PATCH\", body: JSON.stringify({ name: item.name, detail: item.detail, status: item.status }) }); },\n    async remove(id) { await request(\"?id=eq.\" + encodeURIComponent(id), { method: \"DELETE\" }); }\n  };\n}\n\nexport function createPersistenceAdapter(storageKey: string): PersistenceAdapter {\n  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;\n  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n  return url && anonKey ? supabaseAdapter(url, anonKey) : localAdapter(storageKey);\n}\n`,
    "generated/supabase/schema.sql": `create table if not exists public.${table} (\n  id uuid primary key,\n  name text not null,\n  detail text not null default '',\n  status text not null,\n  created_at timestamptz not null default now()\n);\n\nalter table public.${table} enable row level security;\n\n-- MVP demo policy. Antes de almacenar datos sensibles o lanzar producción,\n-- reemplazar estas policies por auth.uid()-scoped policies.\ncreate policy \"maestroarch demo read\" on public.${table} for select to anon using (true);\ncreate policy \"maestroarch demo insert\" on public.${table} for insert to anon with check (true);\ncreate policy \"maestroarch demo update\" on public.${table} for update to anon using (true) with check (true);\ncreate policy \"maestroarch demo delete\" on public.${table} for delete to anon using (true);\n`,
    "generated/PERSISTENCE.md": `# Persistencia\n\nMaestroArch usa un enfoque **local-first** para mantener costo cero y evitar pedir credenciales.\n\n## Modo por defecto\nSin variables de entorno, la app usa \`localStorage\`.\n\n## Modo Supabase opcional\n1. Crear un proyecto gratuito en Supabase.\n2. Ejecutar \`supabase/schema.sql\`.\n3. Configurar:\n   - \`NEXT_PUBLIC_SUPABASE_URL\`\n   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`\n4. Reiniciar/deployar la app. El adapter cambia automáticamente a Supabase REST.\n\n## Seguridad\nLas policies generadas son **solo para un MVP demo sin datos sensibles**. Antes de producción real, el Security Agent debe migrarlas a policies ligadas a usuarios autenticados y revisar qué datos se almacenan.\n`
  };
}
