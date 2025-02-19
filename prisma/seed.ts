// import { PrismaClient } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");


import { organisations } from "./organisations";

const prisma = new PrismaClient();

export type OrganisationDB = {
  name: string;
  email: string;
  slug: string;
};

async function main() {
  const results: OrganisationDB[] = [];

  for (const org of organisations) {
    const result = await prisma.organisation.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        email: org.email,
      },
      create: {
        name: org.name,
        email: org.email,
        slug: org.slug,
      },
    });
    results.push(result);
    console.log(`Upserted organisation ${org.name}:`, result);
  }

  console.log("Seed completed. Results:", results);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
