"use client";

import { createComment } from "@/app/(app)/projects/[id]/actions";

export function IssuePanelCommentForm({ issueId }: { issueId: string }) {
  return (
    <form
      action={createComment}
      className="flex gap-2 items-center px-5 py-3 border-t border-gray-100"
    >
      <input type="hidden" name="issueId" value={issueId} />
      <input
        name="content"
        type="text"
        required
        placeholder="یه کامنت بنویس..."
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
      />
      <button
        type="submit"
        className="text-sm px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shrink-0"
      >
        ارسال
      </button>
    </form>
  );
}
