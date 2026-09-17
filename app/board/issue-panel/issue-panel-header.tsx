"use client";

export function IssuePanelHeader({
  confirmingDelete,
  onConfirmDelete,
  onCancelDelete,
  onDelete,
  onClose,
}: {
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">مطمئنی؟</span>
          <button
            onClick={onDelete}
            className="text-xs px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition-colors"
          >
            حذف
          </button>
          <button
            onClick={onCancelDelete}
            className="text-xs px-2.5 py-1 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            انصراف
          </button>
        </div>
      ) : (
        <button
          onClick={onConfirmDelete}
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
  );
}
