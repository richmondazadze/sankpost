"use client";
import { X } from "lucide-react";

export default function RightPanel({ open, onClose, title, children }) {
  return (
    <div
      className={`fixed right-0 top-0 z-40 h-screen w-full max-w-md transform bg-gray-900/95 backdrop-blur-xl border-l border-gray-800/50 transition-transform duration-200 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <h3 className="text-sm font-semibold text-gray-200">{title}</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto h-[calc(100%-56px)]">{children}</div>
    </div>
  );
}

