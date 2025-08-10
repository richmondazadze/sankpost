"use client";
import { Toaster } from "sonner";

export default function GlobalToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme="dark"
      toastOptions={{ duration: 2500 }}
    />
  );
}

