"use client";
import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (fn) => {
    fn();
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Global Command Palette"
        className="fixed left-1/2 top-24 z-[101] w-[90vw] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-gray-800 bg-gray-900/95 text-white shadow-2xl"
     >
        <Command.Input placeholder="Type a command or search..." className="w-full bg-transparent px-4 py-3 outline-none placeholder:text-gray-500" />
        <Command.List className="max-h-[50vh] overflow-y-auto">
          <Command.Empty className="px-4 py-3 text-sm text-gray-400">No results found.</Command.Empty>
          <Command.Group heading="Navigation" className="px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <Command.Item onSelect={() => run(() => router.push("/"))} className="px-4 py-2 text-sm aria-selected:bg-gray-800">
              Home
            </Command.Item>
            <Command.Item onSelect={() => run(() => router.push("/generate"))} className="px-4 py-2 text-sm aria-selected:bg-gray-800">
              Dashboard
            </Command.Item>
            <Command.Item onSelect={() => run(() => router.push("/pricing"))} className="px-4 py-2 text-sm aria-selected:bg-gray-800">
              Pricing
            </Command.Item>
          </Command.Group>
          <Command.Group heading="Actions" className="px-2 py-2 text-xs uppercase tracking-wide text-gray-500">
            <Command.Item onSelect={() => run(() => document.getElementById("prompt-input")?.focus())} className="px-4 py-2 text-sm aria-selected:bg-gray-800">
              Focus Prompt
            </Command.Item>
            <Command.Item onSelect={() => run(() => document.getElementById("generate-btn")?.click())} className="px-4 py-2 text-sm aria-selected:bg-gray-800">
              Generate Content
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}

