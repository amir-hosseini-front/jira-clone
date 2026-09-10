"use client";

import { useState } from "react";
import { updateIssue, deleteIssue, createComment } from "./actions";
import { Select, AssigneeSelect } from "./custom-select";
type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};
type Status = "TODO" | "IN_PROGRESS" | "DONE";
type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string };
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
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1.5">
              توضیحات (اختیاری)
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={issue.description ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
              placeholder="توضیح بیشتر درباره این کار..."
            />
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
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-3">
            کامنت‌ها ({issue.comments.length})
          </div>

          <div className="flex flex-col gap-3 max-h-48 overflow-y-auto mb-3">
            {issue.comments.length === 0 ? (
              <p className="text-xs text-gray-400">هنوز کامنتی نیست.</p>
            ) : (
              issue.comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
                    {comment.author.name.slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-gray-700">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "fa-IR",
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form action={createComment} className="flex gap-2">
            <input type="hidden" name="issueId" value={issue.id} />
            <input
              name="content"
              type="text"
              required
              placeholder="یه کامنت بنویس..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
            />
            <button
              type="submit"
              className="text-sm px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              ارسال
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
