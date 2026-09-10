"use client";

import { useState } from "react";
import { addProjectMember } from "../../actions";

type Member = {
  id: string;
  user: { id: string; name: string; email: string };
};

export default function MembersPanel({
  projectId,
  members,
}: {
  projectId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    try {
      await addProjectMember(formData);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطایی پیش اومد");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2 space-x-reverse">
        {members.map((m) => (
          <div
            key={m.id}
            title={m.user.name}
            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
          >
            {m.user.name.slice(0, 2)}
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        + عضو
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold mb-5">اضافه کردن عضو</h2>

            <form action={handleSubmit} className="flex flex-col gap-4">
              <input type="hidden" name="projectId" value={projectId} />

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">
                  ایمیل کاربر
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
                  placeholder="user@example.com"
                />
              </div>

              {error && <p className="text-xs text-rose-600">{error}</p>}

              <div className="flex justify-end gap-2 mt-2">
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
                  اضافه کن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
