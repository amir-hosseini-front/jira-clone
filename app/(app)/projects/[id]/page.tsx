import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { ProjectView } from "@/app/board/project-view";

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
        include: {
          assignee: true,
          comments: {
            include: { author: true },
            orderBy: { createdAt: "asc" },
          },
          activities: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      members: {
        include: { user: true },
      },
      sprints: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return <ProjectView project={project} />;
}
