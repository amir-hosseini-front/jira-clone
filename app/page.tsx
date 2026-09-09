import { prisma } from "@/lib/prisma";
import Link from "next/link";
import NewProjectModal from "./new-project-modal";

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    include: { issues: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">پروژه‌ها</h1>
        <NewProjectModal />
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-400">هنوز پروژه‌ای نساختی.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="flex items-center justify-between border border-gray-200/80 rounded-xl p-4 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {project.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {project.key} · {project.issues.length} کار
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
