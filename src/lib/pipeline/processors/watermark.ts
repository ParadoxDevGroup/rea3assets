import type { ProcessorDefinition } from "../types";
import { logger } from "@/lib/logger";

export const watermarkProcessor: ProcessorDefinition = {
  id: "watermark",
  label: "Apply Watermark",
  description: "Overlay preview watermark on marketplace assets.",
  fn: async (ctx) => {
    logger.info("watermark_processor", { assetVersionId: ctx.assetVersionId });
    return {
      success: true,
      output: { watermarked: true, position: "bottom-right", opacity: 0.3 },
    };
  },
};
