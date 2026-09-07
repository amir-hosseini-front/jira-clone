"use client";

import { useState } from "react";
import { updateIssue, deleteIssue } from "./actions";

type Issue = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
};

export default function IssueDetailModal({
  issue,
  onClose,
}: {
  issue: Issue;
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-medium mb-4">ویرایش کار</h2>

        <form action={handleUpdate} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={issue.id} />

          <div>
            <label className="text-sm text-gray-600 block mb-1">عنوان</label>
            <input
              name="title"
              type="text"
              required
              defaultValue={issue.title}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 block mb-1">وضعیت</label>
              <select
                name="status"
                defaultValue={issue.status}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="TODO">در انتظار</option>
                <option value="IN_PROGRESS">در حال انجام</option>
                <option value="DONE">انجام‌شده</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">اولویت</label>
              <select
                name="priority"
                defaultValue={issue.priority}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="LOW">پایین</option>
                <option value="MEDIUM">متوسط</option>
                <option value="HIGH">بالا</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">مطمئنی؟</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-md"
                >
                  بله، حذف کن
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-sm px-3 py-1.5 border rounded-md"
                >
                  انصراف
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-sm text-red-600"
              >
                حذف
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-3 py-1.5 border rounded-md"
              >
                بستن
              </button>
              <button
                type="submit"
                className="text-sm px-3 py-1.5 bg-black text-white rounded-md"
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
