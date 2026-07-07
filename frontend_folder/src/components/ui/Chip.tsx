import { cn } from "@/lib/cn";

// Static label — never interactive, so no hover/focus states (Section 3 is
// buttons only). Radius is always 4px, no pill shapes (Section 1).
// The amber variant has exactly one sanctioned use: the "expected" date chip.

type ChipVariant = "default" | "amber";

const variants: Record<ChipVariant, string> = {
  default: "border-border-hairline text-text-secondary",
  amber: "border-accent-amber/35 text-accent-amber",
};

export type ChipProps = {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
};

export function Chip({ variant = "default", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-chip border px-2.5 py-1 font-mono text-xs",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
