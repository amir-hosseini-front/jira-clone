"use client";

import { useState } from "react";
import { createProject } from "./actions";

export default function NewProjectModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
      >
        + پروژه جدید
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-5">ساخت پروژه جدید</h2>

            <form action={createProject} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  نام پروژه
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                  placeholder="مثلا: اپ موبایل"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  کد پروژه (کوتاه، انگلیسی)
                </label>
                <input
                  name="key"
                  type="text"
                  required
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                  placeholder="مثلا: APP"
                />
              </div>

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="text-sm px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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
