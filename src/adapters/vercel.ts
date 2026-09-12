export interface VercelReadinessResult {
  ready: boolean;
  checks: Array<{ name: string; ok: boolean; detail: string }>;
}

export function checkVercelReadiness(artifacts: Record<string, string>): VercelReadinessResult {
  const packageJson = artifacts["generated/package.json"] ?? "";
  const checks = [
    {
      name: "next-package",
      ok: packageJson.includes('"next"'),
      detail: "package.json declara Next.js"
    },
    {
      name: "app-router",
      ok: Boolean(artifacts["generated/app/page.tsx"] && artifacts["generated/app/layout.tsx"]),
      detail: "App Router tiene page y layout"
    },
    {
      name: "vercel-config",
      ok: Boolean(artifacts["generated/vercel.json"]),
      detail: "vercel.json generado"
    },
    {
      name: "deploy-docs",
      ok: Boolean(artifacts["generated/DEPLOY.md"]),
      detail: "instrucciones de deploy presentes"
    },
    {
      name: "env-template",
      ok: Boolean(artifacts["generated/.env.example"]),
      detail: "template de variables presente"
    }
  ];

  return { ready: checks.every((check) => check.ok), checks };
}
