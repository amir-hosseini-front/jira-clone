"use client";

import { useState } from "react";
import { createProject } from "@/app/actions";

export function NewProjectModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"KANBAN" | "SCRUM">("KANBAN");
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
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  نوع پروژه
                </label>
                <input type="hidden" name="type" value={type} />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("KANBAN")}
                    className={`text-right border rounded-lg p-3 transition-colors ${
                      type === "KANBAN"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">
                      کانبان
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      بورد ساده، بدون Sprint
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType("SCRUM")}
                    className={`text-right border rounded-lg p-3 transition-colors ${
                      type === "SCRUM"
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800">
                      اسکرام
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      با Sprint و Story Point
                    </div>
                  </button>
                </div>
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
