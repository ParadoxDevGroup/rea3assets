import type { ProcessorFn, ProcessorDefinition } from "./types";
import { thumbnailProcessor } from "./processors/thumbnail";
import { validateFormatProcessor } from "./processors/validate-format";
import { optimizeMeshProcessor } from "./processors/optimize-mesh";
import { virusScanProcessor } from "./processors/virus-scan";
import { generateDescriptionProcessor } from "./processors/generate-description";
import { watermarkProcessor } from "./processors/watermark";

const processorDefinitions: ProcessorDefinition[] = [
  thumbnailProcessor,
  validateFormatProcessor,
  optimizeMeshProcessor,
  virusScanProcessor,
  generateDescriptionProcessor,
  watermarkProcessor,
];

const processorMap: Map<string, ProcessorFn> = new Map(
  processorDefinitions.map((def) => [def.id, def.fn]),
);

export function getProcessor(id: string): ProcessorFn | undefined {
  return processorMap.get(id);
}

export { processorDefinitions };
