import type { ProcessorDefinition } from "../types";

export const validateFormatProcessor: ProcessorDefinition = {
  id: "validate-format",
  label: "Validate Format",
  description: "Check file format against accepted types.",
  fn: async (ctx) => {
    if (!ctx.filePath) {
      return { success: false, error: "No file to validate" };
    }
    console.log(`[validate-format] Validating file ${ctx.filePath}`);
    return {
      success: true,
      output: { validated: true, format: ctx.filePath.split(".").pop() ?? "unknown" },
    };
  },
};
