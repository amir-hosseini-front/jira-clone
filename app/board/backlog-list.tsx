"use client";
import {
  DndContext,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { priorityLabel, priorityStyle } from "@/lib/activity-helpers";
import type { Issue } from "@/lib/types";
import {
  reorderIssues,
  updateIssueStatus,
} from "../(app)/projects/[id]/actions";

function BacklogRow({
  issue,
  onClick,
  onMoveToBoard,
}: {
  issue: Issue;
  onClick: () => void;
  onMoveToBoard: () => void;
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-2 py-2.5 hover:bg-gray-50 transition-colors"
    >
      <button
        {...listeners}
        {...attributes}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
      </button>

      <button onClick={onClick} className="flex-1 text-right">
        <span className="text-sm text-gray-800">{issue.title}</span>
      </button>

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

      <button
        onClick={onMoveToBoard}
        className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors shrink-0"
      >
        به بورد
      </button>
    </div>
  );
}

export function BacklogList({
  issues,
  setIssues,
  projectId,
  onCardClick,
}: {
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  projectId: string;
  onCardClick: (issue: Issue) => void;
}) {
  const backlogIssues = issues
    .filter((i) => i.status === "BACKLOG")
    .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = backlogIssues.findIndex((i) => i.id === active.id);
    const newIndex = backlogIssues.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(backlogIssues, oldIndex, newIndex);

    setIssues((prev) => {
      const others = prev.filter((i) => i.status !== "BACKLOG");
      return [...others, ...reordered];
    });

    reorderIssues(
      reordered.map((i, index) => ({
        id: i.id,
        status: "BACKLOG" as const,
        order: index,
      })),
    );
  }

  function handleMoveToBoard(issueId: string) {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId ? { ...i, status: "TODO" as const } : i,
      ),
    );
    updateIssueStatus(issueId, "TODO");
  }

  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={backlogIssues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="px-2 py-1 divide-y divide-gray-50">
            {backlogIssues.length === 0 ? (
              <p className="text-sm text-gray-400 px-3 py-6 text-center">
                بک‌لاگ خالیه.
              </p>
            ) : (
              backlogIssues.map((issue) => (
                <BacklogRow
                  key={issue.id}
                  issue={issue}
                  onClick={() => onCardClick(issue)}
                  onMoveToBoard={() => handleMoveToBoard(issue.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <div className="border-t border-gray-100 px-3 py-3 text-center">
        <span className="text-xs text-gray-400">
          برای افزودن کار جدید، از دکمه‌ی «+ کار جدید» بالای صفحه استفاده کن
        </span>
      </div>
    </div>
  );
}
