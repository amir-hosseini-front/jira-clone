import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NewProjectModal } from "./projects/new-project-modal";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mb-5">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="text-white"
        >
          <path d="M4 5h6v14H4zM14 5h6v9h-6z" fill="currentColor" />
        </svg>
      </div>
      <h1 className="text-lg font-semibold text-gray-900 mb-1.5">
        سلام {user.name} 👋
      </h1>
      <p className="text-sm text-gray-400 max-w-xs mb-5">
        یه پروژه رو از سایدبار انتخاب کن، یا یکی جدید بساز.
      </p>
      <NewProjectModal />
    </div>
  );
}
