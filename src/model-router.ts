import { compileDomain, isDomainSpec, type DomainSpec } from "./domain.js";

export interface ModelRouteResult {
  spec: DomainSpec;
  route: "remote" | "local";
  provider: string;
  model?: string;
  fallbackReason?: string;
}

export interface ModelRouterOptions {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  provider?: string;
  timeoutMs?: number;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error("El modelo no devolvió JSON válido");
  }
}

export class ModelRouter {
  private readonly endpoint?: string;
  private readonly apiKey?: string;
  private readonly model?: string;
  private readonly provider: string;
  private readonly timeoutMs: number;

  constructor(options: ModelRouterOptions = {}) {
    this.endpoint = options.endpoint ?? process.env.MAESTROARCH_AI_ENDPOINT;
    this.apiKey = options.apiKey ?? process.env.MAESTROARCH_AI_API_KEY;
    this.model = options.model ?? process.env.MAESTROARCH_AI_MODEL;
    this.provider = options.provider ?? process.env.MAESTROARCH_AI_PROVIDER ?? "openai-compatible";
    this.timeoutMs = options.timeoutMs ?? Number(process.env.MAESTROARCH_AI_TIMEOUT_MS ?? 20000);
  }

  async compileDomain(idea: string): Promise<ModelRouteResult> {
    if (!this.endpoint || !this.model) {
      return { spec: compileDomain(idea), route: "local", provider: "local-compiler" };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {})
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "Sos el Model Router de MaestroArch. Convertí una idea de producto en JSON estricto con: kind, title, entities, actions, sections. kind debe ser booking, marketplace, services, commerce o generic. entities/actions/sections deben ser arrays de strings breves. No agregues texto fuera del JSON."
            },
            { role: "user", content: idea }
          ]
        }),
        signal: controller.signal
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) throw new Error("Respuesta del modelo vacía");
      const parsed = extractJson(content);
      if (!isDomainSpec(parsed)) throw new Error("JSON del modelo no cumple el contrato DomainSpec");

      return { spec: parsed, route: "remote", provider: this.provider, model: this.model };
    } catch (error) {
      return {
        spec: compileDomain(idea),
        route: "local",
        provider: "local-compiler",
        model: this.model,
        fallbackReason: error instanceof Error ? error.message : "Fallo remoto desconocido"
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
