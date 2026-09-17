"use client";

import { useState } from "react";
import { IssuePanelHeader } from "./issue-panel-header";
import { IssuePanelDetails } from "./issue-panel-details";
import { IssuePanelFeed } from "./issue-panel-feed";
import { IssuePanelCommentForm } from "./issue-panel-comment-form";
import type { Issue, Member } from "@/lib/types";
import { deleteIssue, updateIssue } from "@/app/(app)/projects/[id]/actions";

export function IssuePanel({
  issue,
  members,
  onClose,
}: {
  issue: Issue;
  members: Member[];
  onClose: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleUpdate(formData: FormData) {
    await updateIssue(formData);
  }

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", issue.id);
    await deleteIssue(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      <div className="absolute top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl flex flex-col">
        <IssuePanelHeader
          confirmingDelete={confirmingDelete}
          onConfirmDelete={() => setConfirmingDelete(true)}
          onCancelDelete={() => setConfirmingDelete(false)}
          onDelete={handleDelete}
          onClose={onClose}
        />

        <div className="flex-1 overflow-y-auto">
          <form action={handleUpdate} id="issue-form">
            <input type="hidden" name="id" value={issue.id} />
            <IssuePanelDetails
              issue={issue}
              members={members}
              formId="issue-form"
            />
          </form>

          <IssuePanelFeed
            comments={issue.comments}
            activities={issue.activities}
          />
        </div>

        <IssuePanelCommentForm issueId={issue.id} />
      </div>
    </div>
  );
}
