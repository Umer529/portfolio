"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { inputClass } from "@/components/admin/Field";

// Tech-tag editor: chips with remove, Enter/comma adds. Chip styling matches
// the public Chip (4px radius, mono) with an added remove affordance.

export function TagInput({
  id,
  tags,
  onChange,
}: {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const value = draft.trim().replace(/,+$/, "");
    if (value && !tags.includes(value)) onChange([...tags, value]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-chip border border-border-hairline px-2.5 py-1 font-mono text-xs text-text-secondary"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="rounded-chip text-text-tertiary hover:text-text-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal"
              >
                <X aria-hidden size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <input
        id={id}
        type="text"
        value={draft}
        placeholder="Type a tag, press Enter"
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addDraft();
          } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={addDraft}
        className={inputClass}
      />
    </div>
  );
}
