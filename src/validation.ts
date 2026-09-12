import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";

export interface ValidationCheck {
  name: string;
  ok: boolean;
  output: string;
  repaired?: boolean;
}

function run(command: string, args: string[], cwd: string): Promise<ValidationCheck> {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd, shell: false, env: process.env });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk.toString(); });
    child.stderr.on("data", (chunk) => { output += chunk.toString(); });
    child.on("error", (error) => resolve({ name: `${command} ${args.join(" ")}`, ok: false, output: String(error) }));
    child.on("close", (code) => resolve({ name: `${command} ${args.join(" ")}`, ok: code === 0, output: output.slice(-12000) }));
  });
}

export async function validateGeneratedProject(cwd: string): Promise<ValidationCheck[]> {
  const checks: ValidationCheck[] = [];

  let install = await run("npm", ["install", "--no-audit", "--no-fund"], cwd);
  if (!install.ok) {
    const retry = await run("npm", ["install", "--legacy-peer-deps", "--no-audit", "--no-fund"], cwd);
    retry.repaired = retry.ok;
    install = retry;
  }
  checks.push(install);
  if (!install.ok) return checks;

  let build = await run("npm", ["run", "build"], cwd);
  if (!build.ok) {
    await rm(join(cwd, ".next"), { recursive: true, force: true });
    const retry = await run("npm", ["run", "build"], cwd);
    retry.repaired = retry.ok;
    build = retry;
  }
  checks.push(build);
  return checks;
}

export function validationPassed(checks: ValidationCheck[]): boolean {
  return checks.length > 0 && checks.every((check) => check.ok);
}
