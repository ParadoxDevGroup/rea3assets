import type { ProcessorDefinition } from "../types";
import { logger } from "@/lib/logger";

export const generateDescriptionProcessor: ProcessorDefinition = {
  id: "generate-description",
  label: "Generate Description",
  description: "AI-powered description and metadata enrichment.",
  fn: async (ctx) => {
    logger.info("generate_description_processor", { assetVersionId: ctx.assetVersionId });
    return {
      success: true,
      output: {
        description: "High-quality 3D model suitable for real-time rendering.",
        tags: [],
        confidence: 0,
      },
    };
  },
};
