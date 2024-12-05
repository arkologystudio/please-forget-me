import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const existingOrg = await prisma.organisation.findUnique({
    where: { slug: "openai" },
  });

  if (existingOrg) {
    console.log("Organisation already exists:", existingOrg);
    return;
  }
  const openai = await prisma.organisation.create({
    data: {
      name: "OpenAI",
      email: "info@arkology.co.za", //TODO: Change this to a real email
      slug: "openai",
    },
  });
  console.log({ openai });
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
