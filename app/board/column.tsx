"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IssueCard } from "./issue-card";
import type { Issue } from "@/lib/types";

const dotColor: Record<string, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-emerald-500",
};

export function Column({
  status,
  label,
  issues,
  projectKey,
  onCardClick,
}: {
  status: string;
  label: string;
  issues: Issue[];
  projectKey: string;
  onCardClick: (issue: Issue) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-1.5 px-1 pb-2.5">
        <span
          className={`w-[7px] h-[7px] rounded-full ${dotColor[status] ?? "bg-gray-400"}`}
        />
        <span className="text-[12.5px] font-medium text-gray-500">{label}</span>
        <span className="text-[11px] text-gray-400 bg-gray-100 rounded-full px-[7px] py-px">
          {issues.length}
        </span>
      </div>

      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`rounded-xl p-[7px] min-h-[140px] flex flex-col gap-[7px] flex-1 transition-colors ${
            isOver ? "bg-gray-100" : "bg-gray-50/70"
          }`}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              projectKey={projectKey}
              onClick={() => onCardClick(issue)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
