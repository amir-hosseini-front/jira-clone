import { prisma } from "@/lib/prisma";
import Board from "./board-client";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      issues: {
        include: { assignee: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return <Board project={project} />;
}
