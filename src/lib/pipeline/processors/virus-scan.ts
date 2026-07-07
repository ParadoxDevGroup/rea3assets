import type { ProcessorDefinition } from "../types";

export const virusScanProcessor: ProcessorDefinition = {
  id: "virus-scan",
  label: "Virus Scan",
  description: "Scan uploaded file for malware.",
  fn: async (ctx) => {
    console.log(`[virus-scan] Scanning file for asset version ${ctx.assetVersionId}`);
    return {
      success: true,
      output: { clean: true, scanner: "stub", threatsFound: 0 },
    };
  },
};
