// ---------------------------------------------------------------------------
// Field Config Schemas
// ---------------------------------------------------------------------------
// Reserved for future use — per-field-type config validation.
// Each entry defines the Zod schema for a field_type's `config` JSON column.
// Wire into createFieldSchema when the field builder UI is built.
//
// Example usage:
//   const schema = fieldConfigSchemas[fieldType];
//   const result = schema.safeParse(config);
