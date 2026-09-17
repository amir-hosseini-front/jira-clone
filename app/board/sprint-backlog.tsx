"use client";

import { useState } from "react";
import { priorityLabel, priorityStyle } from "@/lib/activity-helpers";
import type { Issue, Sprint } from "@/lib/types";
import {
  completeSprint,
  createSprint,
  moveIssueToSprint,
  startSprint,
} from "../(app)/projects/[id]/actions";

function sumPoints(issues: Issue[]) {
  return issues.reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);
}

function IssueRow({
  issue,
  sprints,
  onClick,
  onAssignSprint,
}: {
  issue: Issue;
  sprints: Sprint[];
  onClick: () => void;
  onAssignSprint?: (sprintId: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 hover:bg-gray-50 transition-colors">
      <button onClick={onClick} className="flex-1 text-right">
        <div className="text-sm text-gray-800">{issue.title}</div>
        {issue.description && (
          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
            {issue.description}
          </div>
        )}
      </button>

      {issue.storyPoints != null && (
        <span className="text-[11px] px-1.5 py-1 rounded-md bg-gray-100 text-gray-500 font-medium shrink-0">
          {issue.storyPoints} pt
        </span>
      )}

      <span
        className={`text-[11px] px-2 py-1 rounded-md font-medium shrink-0 ${priorityStyle[issue.priority]}`}
      >
        {priorityLabel[issue.priority]}
      </span>

      {issue.assignee ? (
        <div
          title={issue.assignee.name}
          className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0"
        >
          {issue.assignee.name.slice(0, 2)}
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 shrink-0" />
      )}

      {onAssignSprint && (
        <select
          value=""
          onChange={(e) => {
            const value = e.target.value;
            onAssignSprint(value === "" ? null : value);
          }}
          className="text-xs border border-gray-200 rounded-md px-1.5 py-1 focus:outline-none shrink-0"
        >
          <option value="">افزودن به...</option>
          {sprints.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function SprintBacklog({
  projectId,
  issues,
  setIssues,
  sprints,
  setSprints,
  onCardClick,
}: {
  projectId: string;
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  sprints: Sprint[];
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>;
  onCardClick: (issue: Issue) => void;
}) {
  const [creating, setCreating] = useState(false);

  const activeSprint = sprints.find((s) => s.status === "ACTIVE") ?? null;
  const plannedSprints = sprints.filter((s) => s.status === "PLANNED");
  const backlogIssues = issues.filter(
    (i) => i.status === "BACKLOG" && !i.sprintId,
  );

  const assignableSprints = [
    ...(activeSprint ? [activeSprint] : []),
    ...plannedSprints,
  ];

  function issuesFor(sprintId: string) {
    return issues.filter((i) => i.sprintId === sprintId);
  }

  async function handleCreateSprint() {
    setCreating(true);
    await createSprint(projectId);
    setCreating(false);
  }

  function handleStartSprint(sprintId: string) {
    setSprints((prev) =>
      prev.map((s) =>
        s.id === sprintId ? { ...s, status: "ACTIVE" as const } : s,
      ),
    );
    startSprint(sprintId);
  }

  function handleCompleteSprint(sprintId: string) {
    setSprints((prev) =>
      prev.map((s) =>
        s.id === sprintId ? { ...s, status: "COMPLETED" as const } : s,
      ),
    );
    setIssues((prev) =>
      prev.map((i) =>
        i.sprintId === sprintId && i.status !== "DONE"
          ? { ...i, sprintId: null, status: "BACKLOG" as const }
          : i,
      ),
    );
    completeSprint(sprintId);
  }

  function handleAssignSprint(issueId: string, sprintId: string | null) {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              sprintId,
              status: sprintId
                ? i.status === "BACKLOG"
                  ? "TODO"
                  : i.status
                : "BACKLOG",
            }
          : i,
      ),
    );
    moveIssueToSprint(issueId, sprintId);
  }

  return (
    <div className="flex flex-col gap-5">
      {activeSprint && (
        <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50/50 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-sm font-medium text-gray-800">
                {activeSprint.name}
              </span>
              <span className="text-xs text-gray-400">
                {issuesFor(activeSprint.id).length} کار ·{" "}
                {sumPoints(issuesFor(activeSprint.id))} پوینت
              </span>
            </div>
            <button
              onClick={() => handleCompleteSprint(activeSprint.id)}
              className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              تکمیل اسپرینت
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {issuesFor(activeSprint.id).length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-5 text-center">
                هنوز کاری اضافه نشده.
              </p>
            ) : (
              issuesFor(activeSprint.id).map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  sprints={[]}
                  onClick={() => onCardClick(issue)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {plannedSprints.map((sprint) => (
        <div
          key={sprint.id}
          className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-sm font-medium text-gray-800">
                {sprint.name}
              </span>
              <span className="text-xs text-gray-400">
                {issuesFor(sprint.id).length} کار ·{" "}
                {sumPoints(issuesFor(sprint.id))} پوینت
              </span>
            </div>
            <button
              onClick={() => handleStartSprint(sprint.id)}
              disabled={!!activeSprint}
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={activeSprint ? "اول اسپرینت فعال فعلی رو تکمیل کن" : ""}
            >
              شروع اسپرینت
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {issuesFor(sprint.id).length === 0 ? (
              <p className="text-sm text-gray-400 px-4 py-5 text-center">
                هنوز کاری اضافه نشده.
              </p>
            ) : (
              issuesFor(sprint.id).map((issue) => (
                <IssueRow
                  key={issue.id}
                  issue={issue}
                  sprints={[]}
                  onClick={() => onCardClick(issue)}
                />
              ))
            )}
          </div>
        </div>
      ))}

      <button
        onClick={handleCreateSprint}
        disabled={creating}
        className="text-sm text-gray-500 hover:text-gray-800 transition-colors self-start disabled:opacity-50"
      >
        + اسپرینت جدید
      </button>

      <div className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-800">بک‌لاگ</span>
          <span className="text-xs text-gray-400">
            {backlogIssues.length} کار · {sumPoints(backlogIssues)} پوینت
          </span>
        </div>
        <div className="divide-y divide-gray-50">
          {backlogIssues.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-5 text-center">
              بک‌لاگ خالیه.
            </p>
          ) : (
            backlogIssues.map((issue) => (
              <IssueRow
                key={issue.id}
                issue={issue}
                sprints={assignableSprints}
                onClick={() => onCardClick(issue)}
                onAssignSprint={(sprintId) =>
                  handleAssignSprint(issue.id, sprintId)
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
