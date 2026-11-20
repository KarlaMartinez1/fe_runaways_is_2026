"use client";

import Link from "next/link";
import { bookingBoxMessages } from "@/lib/messages/properties";

type VerificationRequiredDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function VerificationRequiredDialog({ isOpen, onClose }: VerificationRequiredDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-required-title"
    >
      <button
        type="button"
        aria-label="Cerrar diálogo"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-800" aria-hidden="true">
          !
        </div>
        <h2 id="verification-required-title" className="mt-4 text-lg font-bold text-gray-950 sm:text-xl">
          {bookingBoxMessages.verificationDialogTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {bookingBoxMessages.verificationRequired}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            {bookingBoxMessages.dialogClose}
          </button>
          <Link
            href="/profile/verification"
            className="inline-flex items-center justify-center rounded-xl bg-[#1E4DB7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163c91]"
          >
            {bookingBoxMessages.verifyAccount}
          </Link>
        </div>
      </div>
    </div>
  );
}
