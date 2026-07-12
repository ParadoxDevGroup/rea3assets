import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.ASSET_DB_URL ?? (() => { throw new Error("ASSET_DB_URL environment variable is required"); })(),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
