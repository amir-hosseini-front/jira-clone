"use client";

import { useState } from "react";
import { updateIssue, deleteIssue } from "./actions";
import { Select, AssigneeSelect } from "./custom-select";
type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};

type Issue = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignee: { id: string; name: string } | null;
};

export default function IssueDetailModal({
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
    onClose();
  }

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", issue.id);
    await deleteIssue(formData);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-lg font-semibold mb-5">ویرایش کار</h2>

        <form action={handleUpdate} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={issue.id} />

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              عنوان
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={issue.title}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              مسئول
            </label>
            <AssigneeSelect
              name="assigneeId"
              defaultValue={issue.assignee?.id ?? ""}
              options={[
                { value: "", label: "بدون مسئول" },
                ...members.map((m) => ({
                  value: m.user.id,
                  label: m.user.name,
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                وضعیت
              </label>
              <select
                name="status"
                defaultValue={issue.status}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
              >
                <option value="TODO">در انتظار</option>
                <option value="IN_PROGRESS">در حال انجام</option>
                <option value="DONE">انجام‌شده</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                اولویت
              </label>
              <select
                name="priority"
                defaultValue={issue.priority}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
              >
                <option value="LOW">پایین</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">بالا</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">مطمئنی؟</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  بله، حذف کن
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium"
              >
                حذف
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بستن
              </button>
              <button
                type="submit"
                className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                ذخیره
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
