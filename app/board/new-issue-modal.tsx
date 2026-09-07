"use client";

import { useState } from "react";
import { createIssue } from "./actions";

export default function NewIssueModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    await createIssue(formData);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50"
      >
        + کار جدید
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">ساخت کار جدید</h2>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="projectId" value={projectId} />

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  عنوان
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  autoFocus
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  placeholder="مثلا: طراحی صفحه پروفایل"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block mb-1">
                  اولویت
                </label>
                <select
                  name="priority"
                  defaultValue="MEDIUM"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="LOW">پایین</option>
                  <option value="MEDIUM">متوسط</option>
                  <option value="HIGH">بالا</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-1.5 border rounded-md"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 bg-black text-white rounded-md"
                >
                  ساخت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
