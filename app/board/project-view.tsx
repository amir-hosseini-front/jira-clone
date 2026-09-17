"use client";

import { useState, useEffect } from "react";
import { Board } from "./board";
import { BacklogList } from "./backlog-list";
import { SprintBacklog } from "./sprint-backlog";
import { NewIssueModal } from "./new-issue-modal";
import { MembersPanel } from "./members-panel";
import { IssuePanel } from "./issue-panel/issue-panel";
import { isOverdue } from "@/lib/activity-helpers";
import type { Project } from "@/lib/types";

export function ProjectView({ project }: { project: Project }) {
  const [tab, setTab] = useState<"board" | "backlog" | "sprints">("board");
  const [issues, setIssues] = useState(project.issues);
  const [sprints, setSprints] = useState(project.sprints);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    setIssues(project.issues);
  }, [project.issues]);

  useEffect(() => {
    setSprints(project.sprints);
  }, [project.sprints]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? null;
  const backlogCount = issues.filter((i) => i.status === "BACKLOG").length;
  const activeSprint = sprints.find((s) => s.status === "ACTIVE") ?? null;
  const isScrum = project.type === "SCRUM";

  const boardScope = isScrum
    ? (issue: (typeof issues)[number]) => issue.sprintId === activeSprint?.id
    : (issue: (typeof issues)[number]) => issue.status !== "BACKLOG";

  const scopedIssues = issues.filter(boardScope);
  const remainingPoints = scopedIssues
    .filter((i) => i.status !== "DONE")
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);
  const completionPercent =
    scopedIssues.length === 0
      ? 0
      : Math.round(
          (scopedIssues.filter((i) => i.status === "DONE").length /
            scopedIssues.length) *
            100,
        );
  const overdueCount = scopedIssues.filter((i) => isOverdue(i)).length;

  let sprintSubtitle = "";
  if (isScrum && activeSprint) {
    sprintSubtitle = activeSprint.name;
    if (activeSprint.endDate) {
      const daysLeft = Math.ceil(
        (new Date(activeSprint.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      );
      sprintSubtitle += ` · ${daysLeft > 0 ? `${daysLeft} روز باقی‌مانده` : "امروز تمام می‌شود"}`;
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-3.5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {project.name}
          </h1>
          {sprintSubtitle && (
            <div className="text-xs text-gray-400 mt-0.5">{sprintSubtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <MembersPanel projectId={project.id} members={project.members} />
          <NewIssueModal
            projectId={project.id}
            defaultStatus={
              tab === "backlog" || tab === "sprints" ? "BACKLOG" : "TODO"
            }
          />
        </div>
      </div>

      {tab === "board" && (isScrum ? !!activeSprint : true) && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-gray-50 rounded-lg px-3.5 py-2.5">
            <div className="text-[11.5px] text-gray-400">پوینت باقی‌مانده</div>
            <div className="text-xl font-medium mt-0.5">{remainingPoints}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3.5 py-2.5">
            <div className="text-[11.5px] text-gray-400">تکمیل‌شده</div>
            <div className="text-xl font-medium mt-0.5">
              {completionPercent}٪
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3.5 py-2.5">
            <div className="text-[11.5px] text-gray-400">عقب‌افتاده</div>
            <div
              className={`text-xl font-medium mt-0.5 ${overdueCount > 0 ? "text-rose-600" : ""}`}
            >
              {overdueCount}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-5 border-b border-gray-100 mb-6">
        {[
          { key: "board" as const, label: "بورد" },
          ...(isScrum
            ? [{ key: "sprints" as const, label: "اسپرینت‌ها" }]
            : [{ key: "backlog" as const, label: `بک‌لاگ (${backlogCount})` }]),
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm pb-2.5 border-b-2 transition-colors ${
              tab === t.key
                ? "border-gray-900 text-gray-900 font-medium"
                : "border-transparent text-gray-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "board" ? (
        isScrum && !activeSprint ? (
          <div className="text-sm text-gray-400 text-center py-16">
            هیچ اسپرینت فعالی وجود نداره. از تب «اسپرینت‌ها» یکی رو شروع کن.
          </div>
        ) : (
          <Board
            issues={issues}
            setIssues={setIssues}
            projectKey={project.key}
            onCardClick={(issue) => setSelectedIssueId(issue.id)}
            scope={boardScope}
          />
        )
      ) : tab === "backlog" ? (
        <BacklogList
          issues={issues}
          setIssues={setIssues}
          projectId={project.id}
          onCardClick={(issue) => setSelectedIssueId(issue.id)}
        />
      ) : (
        <SprintBacklog
          projectId={project.id}
          issues={issues}
          setIssues={setIssues}
          sprints={sprints}
          setSprints={setSprints}
          onCardClick={(issue) => setSelectedIssueId(issue.id)}
        />
      )}

      {selectedIssue && (
        <IssuePanel
          issue={selectedIssue}
          members={project.members}
          onClose={() => setSelectedIssueId(null)}
        />
      )}
    </div>
  );
}
