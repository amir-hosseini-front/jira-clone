"use client";

import { useState } from "react";
import NewIssueModal from "./new-issue-modal";
import IssueDetailModal from "./issue-detail-modal";

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

const priorityStyle = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

export default function Board({ project }: { project: Project }) {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
        <NewIssueModal projectId={project.id} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => {
          const issuesInColumn = project.issues.filter(
            (issue) => issue.status === col.status,
          );

          return (
            <div key={col.status}>
              <div className="text-sm font-medium text-gray-500 mb-3 px-1">
                {col.label}{" "}
                <span className="text-gray-400">({issuesInColumn.length})</span>
              </div>

              <div className="bg-gray-50/70 rounded-2xl p-2.5 min-h-[120px] flex flex-col gap-2.5">
                {issuesInColumn.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className="bg-white border border-gray-200/80 rounded-xl p-3.5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all"
                  >
                    <div className="text-sm mb-3 text-gray-800">
                      {issue.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[11px] px-2 py-1 rounded-md font-medium ${priorityStyle[issue.priority]}`}
                      >
                        {priorityLabel[issue.priority]}
                      </span>
                      {issue.assignee && (
                        <span className="text-xs text-gray-400">
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

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
