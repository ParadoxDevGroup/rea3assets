import type { ProcessorDefinition } from "../types";

export const watermarkProcessor: ProcessorDefinition = {
  id: "watermark",
  label: "Apply Watermark",
  description: "Overlay preview watermark on marketplace assets.",
  fn: async (ctx) => {
    console.log(`[watermark] Applying watermark for asset version ${ctx.assetVersionId}`);
    return {
      success: true,
      output: { watermarked: true, position: "bottom-right", opacity: 0.3 },
    };
  },
};
