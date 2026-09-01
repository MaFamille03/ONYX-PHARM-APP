"use client";

import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Fermer"
        className="absolute inset-0 bg-onyx-950/50"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-onyx-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-onyx-400 hover:bg-onyx-50"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
