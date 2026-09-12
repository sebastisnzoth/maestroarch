import { createRepository, publishArtifacts } from "./adapters/github.js";
import { deployToVercel } from "./adapters/vercel-deploy.js";

export interface DeliveryOptions {
  artifacts: Record<string, string>;
  generatedDir: string;
  repository?: string;
  createRepositoryName?: string;
  deployVercel?: boolean;
  production?: boolean;
}

export interface DeliveryResult {
  repository?: string;
  repositoryUrl?: string;
  published: string[];
  deploymentUrl?: string;
  blockers: string[];
}

export async function deliverGeneratedProduct(options: DeliveryOptions): Promise<DeliveryResult> {
  const blockers: string[] = [];
  let repository = options.repository;
  let repositoryUrl: string | undefined;
  let published: string[] = [];
  let deploymentUrl: string | undefined;

  const githubToken = process.env.GITHUB_TOKEN;
  if (options.createRepositoryName) {
    if (!githubToken) {
      blockers.push("GITHUB_TOKEN requerido para crear el repositorio objetivo.");
    } else {
      const created = await createRepository({
        token: githubToken,
        name: options.createRepositoryName,
        description: "Product generated autonomously by MaestroArch"
      });
      repository = created.repository;
      repositoryUrl = created.url;
    }
  }

  if (repository) {
    if (!githubToken) {
      blockers.push("GITHUB_TOKEN requerido para publicar en GitHub.");
    } else {
      const result = await publishArtifacts(options.artifacts, { token: githubToken, repository });
      published = result.published;
      repositoryUrl ??= `https://github.com/${repository}`;
    }
  }

  if (options.deployVercel) {
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      blockers.push("VERCEL_TOKEN requerido para ejecutar el deploy opcional.");
    } else {
      const deployment = await deployToVercel({
        projectDir: options.generatedDir,
        token,
        production: options.production ?? false
      });
      deploymentUrl = deployment.url;
    }
  }

  return { repository, repositoryUrl, published, deploymentUrl, blockers };
}
