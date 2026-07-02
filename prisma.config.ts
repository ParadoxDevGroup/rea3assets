import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.ASSET_DB_URL ?? "postgresql://postgres:***@localhost:5432/rea3_assets?schema=public",
  },
});
