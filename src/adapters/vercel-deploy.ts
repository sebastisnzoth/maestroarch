import { spawn } from "node:child_process";

export interface VercelDeployOptions {
  projectDir: string;
  token: string;
  production?: boolean;
}

export interface VercelDeployResult {
  url?: string;
  output: string;
}

export async function deployToVercel(options: VercelDeployOptions): Promise<VercelDeployResult> {
  if (!options.token.trim()) throw new Error("VERCEL_TOKEN es obligatorio para ejecutar deploy.");

  const args = ["--yes", "vercel@latest", "deploy", "--yes"];
  if (options.production) args.push("--prod");

  return new Promise((resolve, reject) => {
    const child = spawn("npx", args, {
      cwd: options.projectDir,
      env: { ...process.env, VERCEL_TOKEN: options.token },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let output = "";
    let errorOutput = "";
    const limit = 100_000;

    child.stdout.on("data", (chunk) => { if (output.length < limit) output += String(chunk); });
    child.stderr.on("data", (chunk) => { if (errorOutput.length < limit) errorOutput += String(chunk); });
    child.on("error", reject);
    child.on("close", (code) => {
      const combined = `${output}\n${errorOutput}`.trim();
      if (code !== 0) return reject(new Error(`Vercel deploy failed (${code ?? "unknown"}): ${combined.slice(-4000)}`));
      const urls = combined.match(/https:\/\/[^\s]+/g) ?? [];
      resolve({ url: urls.at(-1), output: combined });
    });
  });
}
