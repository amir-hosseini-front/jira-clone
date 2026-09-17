"use client";

import { useState } from "react";
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
import { arrayMove } from "@dnd-kit/sortable";
import { Column } from "./column";
import type { Issue, Status } from "@/lib/types";
import { reorderIssues } from "../(app)/projects/[id]/actions";

const columns = [
  { status: "TODO", label: "در انتظار" },
  { status: "IN_PROGRESS", label: "در حال انجام" },
  { status: "DONE", label: "انجام‌شده" },
] as const;

export function Board({
  issues,
  projectKey,
  setIssues,
  onCardClick,
  scope,
}: {
  issues: Issue[];
  projectKey: string;
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  onCardClick: (issue: Issue) => void;
  scope: (issue: Issue) => boolean;
}) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const boardIssues = issues.filter(scope);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const issue = boardIssues.find((i) => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveIssue(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeIssueItem = boardIssues.find((i) => i.id === activeId);
    if (!activeIssueItem) return;

    const overIssue = boardIssues.find((i) => i.id === overId);
    const targetStatus: Status = overIssue
      ? overIssue.status
      : (overId as Status);

    let newBoardIssues = [...boardIssues];
    const activeIndex = newBoardIssues.findIndex((i) => i.id === activeId);

    if (activeIssueItem.status === targetStatus && overIssue) {
      const overIndex = newBoardIssues.findIndex((i) => i.id === overId);
      newBoardIssues = arrayMove(newBoardIssues, activeIndex, overIndex);
    } else {
      newBoardIssues[activeIndex] = {
        ...activeIssueItem,
        status: targetStatus,
      };
      if (overIssue) {
        const overIndex = newBoardIssues.findIndex((i) => i.id === overId);
        newBoardIssues = arrayMove(newBoardIssues, activeIndex, overIndex);
      }
    }

    setIssues((prev) => {
      const outside = prev.filter((i) => !scope(i));
      return [...outside, ...newBoardIssues];
    });

    const affectedColumnIssues = newBoardIssues
      .filter((i) => i.status === targetStatus)
      .map((i, index) => ({ id: i.id, status: i.status, order: index }));

    reorderIssues(affectedColumnIssues);
  }

  return (
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
            projectKey={projectKey}
            status={col.status}
            label={col.label}
            issues={boardIssues
              .filter((i) => i.status === col.status)
              .sort((a, b) => a.order - b.order)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="bg-white border border-gray-300 rounded-xl p-3.5 shadow-lg rotate-2">
            <div className="text-sm mb-3 text-gray-800">
              {activeIssue.title}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
