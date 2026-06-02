import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaFallback = {
  user: {
    findUnique: async () => null,
    create: async ({ data }: any) => ({ id: null, ...data }),
  },
  repoCache: {
    create: async () => null,
    findMany: async () => [],
  },
  userCache: {
    findUnique: async () => null,
    create: async () => null,
  },
  resume: {
    create: async () => null,
    findUnique: async () => null,
  },
  greenhouseJob: {
    count: async () => 0,
    findMany: async () => [],
    updateMany: async () => ({ count: 0 }),
    upsert: async () => null,
  },
};

let prismaClient: any = prismaFallback;
let prismaPersistenceEnabled = false;

if (process.env.ENABLE_PRISMA === "true") {
  try {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when ENABLE_PRISMA=true");
    }

    const adapter = new PrismaPg({ connectionString });
    prismaClient = new PrismaClient({ adapter });
    prismaPersistenceEnabled = true;
  } catch (error) {
    console.error("Prisma initialization failed, running without persistence:", error);
  }
}

export const prisma = prismaClient;

export function isPrismaPersistenceEnabled() {
  return prismaPersistenceEnabled;
}
