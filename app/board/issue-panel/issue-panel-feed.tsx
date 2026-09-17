import { activityText, relativeTime, statusDotColor } from "@/lib/activity-helpers";
import type { Comment, Activity } from "@/lib/types";

type FeedItem =
  | { kind: "comment"; createdAt: Date; data: Comment }
  | { kind: "activity"; createdAt: Date; data: Activity };

function buildFeed(comments: Comment[], activities: Activity[]): FeedItem[] {
  const items: FeedItem[] = [
    ...comments.map((c) => ({ kind: "comment" as const, createdAt: c.createdAt, data: c })),
    ...activities.map((a) => ({ kind: "activity" as const, createdAt: a.createdAt, data: a })),
  ];
  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function IssuePanelFeed({
  comments,
  activities,
}: {
  comments: Comment[];
  activities: Activity[];
}) {
  const feed = buildFeed(comments, activities);

  return (
    <div className="px-5 py-4 flex flex-col gap-3.5">
      {feed.length === 0 ? (
        <p className="text-xs text-gray-400">هنوز فعالیتی ثبت نشده.</p>
      ) : (
        feed.map((item) =>
          item.kind === "activity" ? (
            <div key={`a-${item.data.id}`} className="flex items-start gap-2 text-xs text-gray-400">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  statusDotColor[item.data.toValue ?? ""] ?? "bg-gray-300"
                }`}
              />
              <span>
                <span className="font-medium text-gray-600">{item.data.user.name}</span>{" "}
                {activityText(item.data)} · {relativeTime(item.data.createdAt)}
              </span>
            </div>
          ) : (
            <div key={`c-${item.data.id}`} className="flex gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 shrink-0">
                {item.data.author.name.slice(0, 2)}
              </div>
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-gray-700">{item.data.author.name}</span>
                  <span className="text-[10px] text-gray-400">{relativeTime(item.data.createdAt)}</span>
                </div>
                <p className="text-[13px] text-gray-600 mt-0.5">{item.data.content}</p>
              </div>
            </div>
          )
        )
      )}
    </div>
  );
}
