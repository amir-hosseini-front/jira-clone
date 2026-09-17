"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Project = { id: string; name: string; key: string };

export function SidebarProjectLinks({ projects }: { projects: Project[] }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="text-[11px] text-gray-400 px-1.5 pb-2">پروژه‌ها</div>
      <div className="flex flex-col gap-0.5">
        {projects.map((project) => {
          const isActive = pathname.startsWith(`/projects/${project.id}`);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-blue-500" : "bg-gray-300"}`}
              />
              <span className="text-[12.5px] truncate">{project.name}</span>
            </Link>
          );
        })}

        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <span className="text-[12px]">+ پروژه جدید</span>
        </Link>
      </div>
    </div>
  );
}
