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

const statusDotColor: Record<string, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-emerald-500",
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

// فید یکپارچه: کامنت‌ها و رویدادهای تاریخچه با هم، مرتب‌شده بر اساس زمان
type FeedItem =
  | { kind: "comment"; createdAt: Date; data: Comment }
  | { kind: "activity"; createdAt: Date; data: Activity };

function buildFeed(comments: Comment[], activities: Activity[]): FeedItem[] {
  const items: FeedItem[] = [
    ...comments.map((c) => ({
      kind: "comment" as const,
      createdAt: c.createdAt,
      data: c,
    })),
    ...activities.map((a) => ({
      kind: "activity" as const,
      createdAt: a.createdAt,
      data: a,
    })),
  ];
  return items.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
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

  async function handleUpdate(formData: FormData) {
    await updateIssue(formData);
  }

  async function handleDelete() {
    const formData = new FormData();
    formData.set("id", issue.id);
    await deleteIssue(formData);
    onClose();
  }

  const feed = buildFeed(issue.comments, issue.activities);

  return (
    <div className="fixed inset-0 z-50">
      {/* پس‌زمینه‌ی کم‌رنگ، نه یه Modal تمام‌صفحه */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* پنل کناری */}
      <div className="absolute top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl flex flex-col">
        {/* هدر */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">مطمئنی؟</span>
              <button
                onClick={handleDelete}
                className="text-xs px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setConfirmingDelete(false)}
                className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                انصراف
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingDelete(true)}
              className="text-gray-400 hover:text-rose-600 transition-colors"
              title="حذف کار"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* بدنه‌ی قابل‌اسکرول */}
        <div className="flex-1 overflow-y-auto">
          <form action={handleUpdate} id="issue-form">
            <input type="hidden" name="id" value={issue.id} />

            {/* عنوان و توضیحات به‌شکل هدینگ، نه فرم معمولی */}
            <div className="px-5 py-4 border-b border-gray-100">
              <textarea
                name="title"
                defaultValue={issue.title}
                rows={1}
                required
                className="w-full text-base font-semibold text-gray-900 resize-none border-none outline-none focus:ring-0 p-0 mb-2.5"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = el.scrollHeight + "px";
                }}
              />
              <textarea
                name="description"
                defaultValue={issue.description ?? ""}
                rows={2}
                placeholder="توضیح بیشتر درباره این کار..."
                className="w-full text-[13px] text-gray-500 resize-none border-none outline-none focus:ring-0 p-0 leading-relaxed"
              />
            </div>

            {/* ردیف‌های متادیتا */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">وضعیت</span>
                <div className="w-36">
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
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">اولویت</span>
                <div className="w-36">
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

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">مسئول</span>
                <div className="w-36">
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
              </div>
            </div>
          </form>

          {/* دکمه‌ی ذخیره تغییرات جزئیات */}
          <div className="px-5 py-2.5 border-b border-gray-100 flex justify-end">
            <button
              type="submit"
              form="issue-form"
              className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              ذخیره تغییرات
            </button>
          </div>

          {/* فید یکپارچه: کامنت‌ها + تاریخچه */}
          <div className="px-5 py-4 flex flex-col gap-3.5">
            {feed.length === 0 ? (
              <p className="text-xs text-gray-400">هنوز فعالیتی ثبت نشده.</p>
            ) : (
              feed.map((item) =>
                item.kind === "activity" ? (
                  <div
                    key={`a-${item.data.id}`}
                    className="flex items-start gap-2 text-xs text-gray-400"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                        statusDotColor[item.data.toValue ?? ""] ?? "bg-gray-300"
                      }`}
                    />
                    <span>
                      <span className="font-medium text-gray-600">
                        {item.data.user.name}
                      </span>{" "}
                      {activityText(item.data)} ·{" "}
                      {relativeTime(item.data.createdAt)}
                    </span>
                  </div>
                ) : (
                  <div key={`c-${item.data.id}`} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
                      {item.data.author.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-medium text-gray-700">
                          {item.data.author.name}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {relativeTime(item.data.createdAt)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-600 mt-0.5">
                        {item.data.content}
                      </p>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>

        {/* فرم کامنت، چسبیده به پایین پنل */}
        <form
          action={createComment}
          className="flex gap-2 items-center px-5 py-3 border-t border-gray-100"
        >
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
            className="text-sm px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium shrink-0"
          >
            ارسال
          </button>
        </form>
      </div>
    </div>
  );
}
