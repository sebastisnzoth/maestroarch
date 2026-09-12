import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

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
