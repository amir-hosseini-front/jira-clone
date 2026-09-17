import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { SidebarProjectLinks } from "./sidebar-project-links";

export async function Sidebar() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, key: true },
  });

  return (
    <aside className="w-[190px] shrink-0 bg-gray-50/70 border-l border-gray-200/80 p-3.5 flex flex-col gap-5">
      <a href="/" className="flex items-center gap-2 px-1.5">
        <div className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
          >
            <path d="M4 5h6v14H4zM14 5h6v9h-6z" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[13px] font-medium text-gray-800">فضای کاری</span>
      </a>

      <SidebarProjectLinks projects={projects} />

      <div className="mt-auto flex items-center gap-2 pt-2.5 border-t border-gray-200/80">
        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-medium">
          {user.name.slice(0, 2)}
        </div>
        <span className="text-xs text-gray-500 truncate">{user.name}</span>
      </div>
    </aside>
  );
}
