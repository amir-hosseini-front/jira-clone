import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const projects = await prisma.project.findMany({ select: { id: true } });

  for (const project of projects) {
    const issues = await prisma.issue.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "asc" },
    });

    for (let i = 0; i < issues.length; i++) {
      await prisma.issue.update({
        where: { id: issues[i].id },
        data: { number: i + 1 },
      });
    }
  }
}

main()
  .then(() => console.log("انجام شد"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
