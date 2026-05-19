import { PrismaClient } from "@prisma/client";

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
  },
};

let prismaClient: any = prismaFallback;

if (process.env.ENABLE_PRISMA === "true") {
  try {
    prismaClient = new PrismaClient();
  } catch (error) {
    console.error("Prisma initialization failed, running without persistence:", error);
  }
}

export const prisma = prismaClient;
