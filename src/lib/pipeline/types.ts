// ---------------------------------------------------------------------------
// Pipeline Processor Types
// ---------------------------------------------------------------------------

export interface ProcessorContext {
  assetVersionId: string;
  filePath: string | null;
  pipelineRunId: string;
  pipelineStepId: string;
  config: Record<string, unknown> | null;
}

export interface ProcessorResult {
  success: boolean;
  output?: Record<string, unknown>;
  error?: string;
}

export type ProcessorFn = (ctx: ProcessorContext) => Promise<ProcessorResult>;

export interface ProcessorDefinition {
  id: string;
  label: string;
  description: string;
  fn: ProcessorFn;
}
