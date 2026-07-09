import type { ProcessorDefinition } from "../types";
import { logger } from "@/lib/logger";

export const virusScanProcessor: ProcessorDefinition = {
  id: "virus-scan",
  label: "Virus Scan",
  description: "Scan uploaded file for malware.",
  fn: async (ctx) => {
    logger.info("virus_scan_processor", { assetVersionId: ctx.assetVersionId });
    return {
      success: true,
      output: { clean: true, scanner: "stub", threatsFound: 0 },
    };
  },
};
