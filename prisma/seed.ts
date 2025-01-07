import { PrismaClient } from "@prisma/client";
import { organisations } from "./organisations";

const prisma = new PrismaClient();

export type OrganisationDB = {
  name: string;
  email: string;
  slug: string;
  id?: number;
};

async function main() {
  const createdOrgs = [];

  for (const org of organisations) {
    const existingOrg = await prisma.organisation.findUnique({
      where: { slug: org.slug },
    });

    if (existingOrg) {
      console.log(`Organisation ${org.name} already exists:`, existingOrg);
      continue;
    }

    const createdOrg = await prisma.organisation.create({
      data: {
        name: org.name,
        email: org.email,
        slug: org.slug,
      },
    });
    createdOrgs.push(createdOrg);
  }

  console.log("Created organisations:", createdOrgs);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
