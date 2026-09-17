"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  priorityLabel,
  priorityStyle,
  dueDateLabel,
  isOverdue,
} from "@/lib/activity-helpers";
import type { Issue } from "@/lib/types";

export function IssueCard({
  issue,
  projectKey,
  onClick,
}: {
  issue: Issue;
  projectKey: string;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const overdue = isOverdue(issue);
  const isDone = issue.status === "DONE";
  const isInProgress = issue.status === "IN_PROGRESS";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all border ${
        isInProgress
          ? "border-blue-200"
          : "border-gray-200/80 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {isDone && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="text-emerald-500"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M8 12l3 3 5-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="text-[10.5px] text-gray-400">
          {projectKey}-{issue.number}
        </span>
        {issue.dueDate && !isDone && (
          <>
            <span className="w-[3px] h-[3px] rounded-full bg-gray-300" />
            <span
              className={`text-[10.5px] ${overdue ? "text-rose-600" : "text-amber-600"}`}
            >
              {dueDateLabel(issue.dueDate)}
            </span>
          </>
        )}
      </div>

      <div
        className={`text-[12.5px] leading-relaxed mb-2.5 ${isDone ? "text-gray-500" : "text-gray-800"}`}
      >
        {issue.title}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10.5px] px-1.5 py-0.5 rounded font-medium ${priorityStyle[issue.priority]}`}
          >
            {priorityLabel[issue.priority]}
          </span>

          {issue.storyPoints != null && (
            <span className="text-[10.5px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
              {issue.storyPoints}
            </span>
          )}

          {issue.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10.5px] text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 12a8 8 0 01-11.5 7.2L3 21l1.8-6.5A8 8 0 1121 12z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              {issue.comments.length}
            </span>
          )}
        </div>

        {issue.assignee ? (
          <div
            title={issue.assignee.name}
            className="w-[21px] h-[21px] rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[9.5px] font-medium"
          >
            {issue.assignee.name.slice(0, 2)}
          </div>
        ) : (
          <div className="w-[21px] h-[21px] rounded-full border border-dashed border-gray-300" />
        )}
      </div>
    </div>
  );
}
