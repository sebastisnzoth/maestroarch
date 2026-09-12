import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export class JsonRunStore<T extends { jobId: string }> {
  constructor(private readonly path = ".maestroarch/state/runs.json") {}

  async loadAll(): Promise<T[]> {
    try {
      const raw = await readFile(this.path, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }

  async saveAll(items: Iterable<T>): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const tmp = `${this.path}.tmp`;
    await writeFile(tmp, JSON.stringify([...items], null, 2) + "\n", "utf8");
    await rename(tmp, this.path);
  }
}
