import type { ProcessorDefinition } from "../types";

export const generateDescriptionProcessor: ProcessorDefinition = {
  id: "generate-description",
  label: "Generate Description",
  description: "AI-powered description and metadata enrichment.",
  fn: async (ctx) => {
    console.log(`[generate-description] Generating AI description for asset version ${ctx.assetVersionId}`);
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
