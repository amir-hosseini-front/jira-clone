"use client";

import { AssigneeSelect } from "@/app/ui/assignee-select";
import { Select } from "@/app/ui/select";
import type { Issue, Member } from "@/lib/types";

export function IssuePanelDetails({
  issue,
  members,
  formId,
}: {
  issue: Issue;
  members: Member[];
  formId: string;
}) {
  return (
    <>
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
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">استوری پوینت</span>
          <input
            type="number"
            name="storyPoints"
            min={0}
            defaultValue={issue.storyPoints ?? ""}
            placeholder="—"
            className="w-36 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
          />
        </div>
      </div>

      <div className="px-5 py-2.5 border-b border-gray-100 flex justify-end">
        <button
          type="submit"
          form={formId}
          className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          ذخیره تغییرات
        </button>
      </div>
    </>
  );
}
