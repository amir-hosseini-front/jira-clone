"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import NewIssueModal from "./new-issue-modal";
import IssueDetailModal from "./issue-detail-modal";
import { reorderIssues } from "./actions";
import MembersPanel from "./members-panel";

type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string };
};

type Activity = {
  id: string;
  type: string;
  fromValue: string | null;
  toValue: string | null;
  createdAt: Date;
  user: { name: string };
};

type Issue = {
  id: string;
  title: string;
  description: string | null;
  status: Status;
  priority: "LOW" | "MEDIUM" | "HIGH";
  order: number;
  assignee: { id: string; name: string } | null;
  comments: Comment[];
  activities: Activity[];
};

type Project = {
  id: string;
  name: string;
  key: string;
  issues: Issue[];
  members: Member[];
};

const columns = [
  { status: "TODO", label: "در انتظار" },
  { status: "IN_PROGRESS", label: "در حال انجام" },
  { status: "DONE", label: "انجام‌شده" },
] as const;

const priorityLabel = { LOW: "پایین", MEDIUM: "متوسط", HIGH: "بالا" };
const priorityStyle = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

function IssueCard({ issue, onClick }: { issue: Issue; onClick: () => void }) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-white border border-gray-200/80 rounded-xl p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="text-sm mb-3 text-gray-800">{issue.title}</div>
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] px-2 py-1 rounded-md font-medium ${priorityStyle[issue.priority]}`}
        >
          {priorityLabel[issue.priority]}
        </span>
        {issue.assignee ? (
          <div
            title={issue.assignee.name}
            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600"
          >
            {issue.assignee.name.slice(0, 2)}
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border border-dashed border-gray-300" />
        )}
      </div>
    </div>
  );
}

function Column({
  status,
  label,
  issues,
  onCardClick,
}: {
  status: string;
  label: string;
  issues: Issue[];
  onCardClick: (issue: Issue) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div>
      <div className="text-sm font-medium text-gray-500 mb-3 px-1">
        {label} <span className="text-gray-400">({issues.length})</span>
      </div>

      <SortableContext
        items={issues.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`rounded-2xl p-2.5 min-h-30 flex flex-col gap-2.5 transition-colors ${
            isOver ? "bg-gray-100" : "bg-gray-50/70"
          }`}
        >
          {issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onClick={() => onCardClick(issue)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function Board({ project }: { project: Project }) {
  const [issues, setIssues] = useState(project.issues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? null;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );
  useEffect(() => {
    setIssues(project.issues);
  }, [project.issues]);
  function handleDragStart(event: DragStartEvent) {
    const issue = issues.find((i) => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeIssue = issues.find((i) => i.id === activeId);
    if (!activeIssue) return;

    // آیا روی یه کارت دیگه رها شده، یا روی یه ستون خالی؟
    const overIssue = issues.find((i) => i.id === overId);
    const targetStatus: Status = overIssue
      ? overIssue.status
      : (overId as Status);

    let newIssues = [...issues];
    const activeIndex = newIssues.findIndex((i) => i.id === activeId);

    if (activeIssue.status === targetStatus && overIssue) {
      // جابجایی داخل همون ستون
      const overIndex = newIssues.findIndex((i) => i.id === overId);
      newIssues = arrayMove(newIssues, activeIndex, overIndex);
    } else {
      // انتقال به ستون دیگه
      newIssues[activeIndex] = { ...activeIssue, status: targetStatus };
      if (overIssue) {
        const overIndex = newIssues.findIndex((i) => i.id === overId);
        newIssues = arrayMove(newIssues, activeIndex, overIndex);
      }
    }

    setIssues(newIssues);

    // فقط issue های همون ستون مقصد رو با order جدید به سرور بفرست
    const affectedColumnIssues = newIssues
      .filter((i) => i.status === targetStatus)
      .map((i, index) => ({ id: i.id, status: i.status, order: index }));

    reorderIssues(affectedColumnIssues);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
        <MembersPanel projectId={project.id} members={project.members} />
        <NewIssueModal projectId={project.id} />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4">
          {columns.map((col) => (
            <Column
              key={col.status}
              status={col.status}
              label={col.label}
              issues={issues
                .filter((i) => i.status === col.status)
                .sort((a, b) => a.order - b.order)}
              onCardClick={(issue) => setSelectedIssueId(issue.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeIssue && (
            <div className="bg-white border border-gray-300 rounded-xl p-3.5 shadow-lg ">
              <div className="text-sm mb-3 text-gray-800">
                {activeIssue.title}
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          members={project.members}
          onClose={() => setSelectedIssueId(null)}
        />
      )}
    </div>
  );
}
