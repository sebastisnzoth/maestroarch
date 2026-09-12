import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

export async function writeWorkspace(root: string, slug: string, artifacts: Record<string, string>): Promise<string> {
  const dir = join(root, slug);
  await mkdir(dir, { recursive: true });
  await Promise.all(
    Object.entries(artifacts).map(async ([name, content]) => {
      const target = join(dir, name);
      await mkdir(join(target, ".."), { recursive: true });
      await writeFile(target, content, "utf8");
    })
  );
  return dir;
}

async function walkTextFiles(root: string, current: string, output: Record<string, string>): Promise<void> {
  const entries = await readdir(current, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
    const path = join(current, entry.name);
    if (entry.isDirectory()) {
      await walkTextFiles(root, path, output);
    } else if (entry.isFile()) {
      const name = relative(root, path).replace(/\\/g, "/");
      output[name] = await readFile(path, "utf8");
    }
  }
}

export async function readGeneratedArtifacts(workspaceDir: string): Promise<Record<string, string>> {
  const generatedDir = join(workspaceDir, "generated");
  const files: Record<string, string> = {};
  await walkTextFiles(generatedDir, generatedDir, files);
  return Object.fromEntries(Object.entries(files).map(([name, content]) => [`generated/${name}`, content]));
}
