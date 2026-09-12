export interface GitHubPublishOptions {
  token: string;
  repository: string;
  branch?: string;
  commitPrefix?: string;
}

interface GitHubContentResponse {
  sha?: string;
}

function encodeBase64(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

async function request(url: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {})
    }
  });
}

async function currentSha(repository: string, path: string, branch: string, token: string): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${repository}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(branch)}`;
  const response = await request(url, token);
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`GitHub read failed (${response.status}): ${await response.text()}`);
  const data = await response.json() as GitHubContentResponse;
  return data.sha;
}

export async function publishArtifacts(
  artifacts: Record<string, string>,
  options: GitHubPublishOptions
): Promise<{ published: string[] }> {
  const branch = options.branch ?? "main";
  const prefix = options.commitPrefix ?? "feat(maestroarch): publish generated project";
  const generated = Object.entries(artifacts).filter(([path]) => path.startsWith("generated/"));
  if (generated.length === 0) throw new Error("No generated project artifacts found to publish.");

  const published: string[] = [];
  for (const [artifactPath, content] of generated) {
    const path = artifactPath.replace(/^generated\//, "");
    const sha = await currentSha(options.repository, path, branch, options.token);
    const url = `https://api.github.com/repos/${options.repository}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`;
    const response = await request(url, options.token, {
      method: "PUT",
      body: JSON.stringify({
        message: `${prefix}: ${path}`,
        content: encodeBase64(content),
        branch,
        ...(sha ? { sha } : {})
      })
    });
    if (!response.ok) throw new Error(`GitHub publish failed for ${path} (${response.status}): ${await response.text()}`);
    published.push(path);
  }
  return { published };
}
