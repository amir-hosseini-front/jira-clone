import { prisma } from "@/lib/prisma";
import Board from "./board-client";

export default async function BoardPage() {
  const project = await prisma.project.findFirst({
    include: {
      issues: {
        include: { assignee: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    return (
      <div className="p-8">هیچ پروژه‌ای پیدا نشد. اول seed رو اجرا کن.</div>
    );
  }

  return <Board project={project} />;
}
