import type { Activity } from "./types";

export const statusLabel: Record<string, string> = {
  BACKLOG: "بک‌لاگ",
  TODO: "در انتظار",
  IN_PROGRESS: "در حال انجام",
  DONE: "انجام‌شده",
};

export const priorityLabel: Record<string, string> = {
  LOW: "پایین",
  MEDIUM: "متوسط",
  HIGH: "بالا",
};

export const priorityStyle: Record<string, string> = {
  LOW: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
};

export const statusDotColor: Record<string, string> = {
  BACKLOG: "bg-gray-300",
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  DONE: "bg-emerald-500",
};

export function relativeTime(date: Date) {
  const rtf = new Intl.RelativeTimeFormat("fa", { numeric: "auto" });
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

export function activityText(activity: Activity) {
  switch (activity.type) {
    case "CREATED":
      return "این کار رو ساخت";
    case "STATUS_CHANGED":
      return `وضعیت رو از «${statusLabel[activity.fromValue ?? ""]}» به «${statusLabel[activity.toValue ?? ""]}» تغییر داد`;
    case "PRIORITY_CHANGED":
      return `اولویت رو از «${priorityLabel[activity.fromValue ?? ""]}» به «${priorityLabel[activity.toValue ?? ""]}» تغییر داد`;
    case "ASSIGNEE_CHANGED":
      return `مسئول رو از «${activity.fromValue}» به «${activity.toValue}» تغییر داد`;
    default:
      return "تغییری داد";
  }
}
export function isOverdue(issue: { dueDate: Date | null; status: string }) {
  if (!issue.dueDate) return false;
  if (issue.status === "DONE") return false;
  return new Date(issue.dueDate).getTime() < Date.now();
}

export function dueDateLabel(dueDate: Date) {
  const date = new Date(dueDate);
  date.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "امروز";
  if (diffDays === 1) return "فردا";
  if (diffDays === -1) return "دیروز";
  if (diffDays < -1) return `${Math.abs(diffDays)} روز گذشته`;
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} روز مونده`;

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
  }).format(date);
}

export function dueDateBadgeStyle(issue: {
  dueDate: Date | null;
  status: string;
}) {
  if (!issue.dueDate) return "";
  if (isOverdue(issue)) return "bg-rose-50 text-rose-700";

  const date = new Date(issue.dueDate);
  date.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays <= 1) return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-500";
}
