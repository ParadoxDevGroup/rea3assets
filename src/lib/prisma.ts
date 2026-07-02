import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionUrl =
  process.env.ASSET_DB_URL ??
  "postgresql://postgres:***@localhost:5432/rea3_assets?schema=public";

const adapter = new PrismaPg({ connectionString: connectionUrl });

/**
 * Singleton Prisma client to prevent multiple instances during hot reloads in development.
 *
 * Usage:
 *   import { prisma } from "@/lib/prisma";
 *   const types = await prisma.assetType.findMany();
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
