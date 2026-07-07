import type { ProcessorDefinition } from "../types";

export const thumbnailProcessor: ProcessorDefinition = {
  id: "thumbnail",
  label: "Generate Thumbnails",
  description: "Auto-generate gallery/cover thumbnails from uploaded file.",
  fn: async (ctx) => {
    console.log(`[thumbnail] Generating thumbnails for asset version ${ctx.assetVersionId}`);
    return {
      success: true,
      output: {
        thumbnailUrl: null,
        format: "webp",
        sizes: ["256x256", "512x512", "1024x1024"],
      },
    };
  },
};
