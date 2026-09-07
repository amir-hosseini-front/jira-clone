"use client";

import NewIssueModal from "./new-issue-modal";
type Issue = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignee: { name: string } | null;
};

type Project = {
  id: string;
  name: string;
  key: string;
  issues: Issue[];
};

const columns = [
  { status: "TODO", label: "در انتظار" },
  { status: "IN_PROGRESS", label: "در حال انجام" },
  { status: "DONE", label: "انجام‌شده" },
] as const;

const priorityLabel = {
  LOW: "پایین",
  MEDIUM: "متوسط",
  HIGH: "بالا",
};

export default function Board({ project }: { project: Project }) {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium">{project.name}</h1>
        <NewIssueModal projectId={project.id} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-8">
          <h1 className="text-xl font-medium mb-6">{project.name}</h1>

          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => {
              const issuesInColumn = project.issues.filter(
                (issue) => issue.status === col.status,
              );

              return (
                <div key={col.status}>
                  <div className="text-sm font-medium text-gray-600 mb-3">
                    {col.label} ({issuesInColumn.length})
                  </div>

                  <div className="bg-gray-100 rounded-xl p-2 min-h-[120px] flex flex-col gap-2">
                    {issuesInColumn.map((issue) => (
                      <div
                        key={issue.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="text-sm mb-2">{issue.title}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="px-2 py-0.5 rounded bg-gray-200">
                            {priorityLabel[issue.priority]}
                          </span>
                          {issue.assignee && (
                            <span className="text-gray-500">
                              {issue.assignee.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
