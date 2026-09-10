"use client";

import { useState } from "react";
import { updateIssue, deleteIssue, createComment } from "./actions";
import { Select, AssigneeSelect } from "./custom-select";

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
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assignee: { id: string; name: string } | null;
  comments: Comment[];
  activities: Activity[];
};

const statusLabel: Record<string, string> = {
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  DONE: "انجام‌شده",
};

const priorityLabelMap: Record<string, string> = {
  LOW: "پایین",
  MEDIUM: "متوسط",
  HIGH: "بالا",
};

function relativeTime(date: Date) {
  const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function activityText(activity: Activity) {
  switch (activity.type) {
    case "CREATED":
      return "این کار رو ساخت";
    case "STATUS_CHANGED":
      return `وضعیت رو از «${statusLabel[activity.fromValue ?? ""]}» به «${statusLabel[activity.toValue ?? ""]}» تغییر داد`;
    case "PRIORITY_CHANGED":
      return `اولویت رو از «${priorityLabelMap[activity.fromValue ?? ""]}» به «${priorityLabelMap[activity.toValue ?? ""]}» تغییر داد`;
    case "ASSIGNEE_CHANGED":
      return `مسئول رو از «${activity.fromValue}» به «${activity.toValue}» تغییر داد`;
    default:
      return "تغییری داد";
  }
}

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
  const [tab, setTab] = useState<"details" | "comments" | "activity">(
    "details",
  );

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
        <h2 className="text-lg font-semibold mb-4">ویرایش کار</h2>

        <div className="flex gap-4 border-b border-gray-100 mb-4 -mt-1">
          {[
            { key: "details", label: "جزئیات" },
            { key: "comments", label: `کامنت‌ها (${issue.comments.length})` },
            { key: "activity", label: "تاریخچه" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`text-xs pb-2.5 border-b-2 transition-colors ${
                tab === t.key
                  ? "border-gray-900 text-gray-900 font-medium"
                  : "border-transparent text-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "details" && (
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
                توضیحات
              </label>
              <textarea
                name="description"
                rows={3}
                defaultValue={issue.description ?? ""}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
                placeholder="توضیح بیشتر درباره این کار..."
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
                <Select
                  name="status"
                  defaultValue={issue.status}
                  options={[
                    { value: "TODO", label: "در انتظار" },
                    { value: "IN_PROGRESS", label: "در حال انجام" },
                    { value: "DONE", label: "انجام‌شده" },
                  ]}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  اولویت
                </label>
                <Select
                  name="priority"
                  defaultValue={issue.priority}
                  options={[
                    { value: "LOW", label: "پایین" },
                    { value: "MEDIUM", label: "متوسط" },
                    { value: "HIGH", label: "بالا" },
                  ]}
                />
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
        )}

        {tab === "comments" && (
          <div>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto mb-3">
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

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div>
            <div className="flex flex-col max-h-72 overflow-y-auto">
              {issue.activities.length === 0 ? (
                <p className="text-xs text-gray-400">هنوز رویدادی ثبت نشده.</p>
              ) : (
                issue.activities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      </div>
                      {index < issue.activities.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 min-h-[18px]" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium text-gray-800">
                          {activity.user.name}
                        </span>{" "}
                        {activityText(activity)}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {relativeTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
