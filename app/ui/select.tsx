"use client";

import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string };

export function Select({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: Option[];
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5 text-sm hover:border-gray-300 transition-colors bg-white"
      >
        <span className="text-gray-800">{selected?.label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-10 mt-1.5 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setValue(o.value);
                setOpen(false);
              }}
              className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                o.value === value
                  ? "text-gray-900 font-medium"
                  : "text-gray-600"
              }`}
            >
              {o.label}
              {o.value === value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
