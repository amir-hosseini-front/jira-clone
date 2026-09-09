import { hashPassword } from "@/lib/hash";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "کاربر تست",
      email: "test@example.com",
      password: hashPassword("1234"),
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "پروژه نمونه",
      key: "DEMO",
      ownerId: user.id,
    },
  });

  await prisma.issue.createMany({
    data: [
      {
        title: "طراحی صفحه لاگین",
        status: "TODO",
        priority: "HIGH",
        projectId: project.id,
        order: 0,
      },
      {
        title: "ساخت مدل دیتابیس",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        projectId: project.id,
        order: 0,
      },
      {
        title: "راه‌اندازی پروژه Next.js",
        status: "DONE",
        priority: "LOW",
        projectId: project.id,
        order: 0,
      },
    ],
  });
}

main()
  .then(() => console.log("Seed انجام شد"))
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
