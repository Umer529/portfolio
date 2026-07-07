"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";
import { CommandMenu } from "@/components/CommandMenu";

// Client shell owning the command-menu state so the nav's ⌘K hint and the
// global keyboard shortcut open the same instance.

export function Chrome() {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Nav onOpenCommandMenu={() => setCmdOpen(true)} />
      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} />
    </>
  );
}
