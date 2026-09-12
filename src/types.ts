export type Priority = "P0" | "P1" | "P2";
export type RunStatus = "queued" | "planning" | "executing" | "validating" | "fixing" | "blocked" | "completed";

export interface ProductRequest {
  idea: string;
  constraints: string[];
  target?: string;
}

export interface AgentContext {
  request: ProductRequest;
  runId: string;
  artifacts: Record<string, string>;
}

export interface AgentResult {
  agent: string;
  summary: string;
  artifacts?: Record<string, string>;
  risks: string[];
  nextActions: string[];
  blocked: boolean;
  blockReason?: string;
}

export interface TaskItem {
  id: string;
  priority: Priority;
  title: string;
  owner: string;
  acceptance: string[];
  blockedBy: string[];
  status: "todo" | "doing" | "done" | "blocked";
}

export interface OrchestrationResult {
  runId: string;
  slug: string;
  status: RunStatus;
  firstCustomerBlocker: string;
  artifacts: Record<string, string>;
  tasks: TaskItem[];
  agentResults: AgentResult[];
  nextP0?: TaskItem;
}

export interface Agent {
  readonly name: string;
  run(context: AgentContext): Promise<AgentResult>;
}
