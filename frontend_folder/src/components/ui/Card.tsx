import Link from "next/link";
import { cn } from "@/lib/cn";

// Card — 8px radius, hairline border, flat at rest. Elevation (soft shadow +
// 2px lift) appears only on hover/focus of a linked card (Section 2.1);
// translateY only, never scale (Section 8).

const base = "block rounded-card border border-border-hairline bg-bg-surface p-6";

const interactive = cn(
  "transition-[transform,border-color,box-shadow] duration-150 ease-brand",
  "hover:-translate-y-0.5 hover:border-border-hairline-hover hover:shadow-lift",
  "focus-visible:-translate-y-0.5 focus-visible:shadow-lift",
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal",
);

export type CardProps = {
  /** When set, the whole card is a link and gets the hover/focus lift. */
  href?: string;
  className?: string;
  children: React.ReactNode;
};

export function Card({ href, className, children }: CardProps) {
  if (href !== undefined) {
    return (
      <Link href={href} className={cn(base, interactive, className)}>
        {children}
      </Link>
    );
  }
  return <div className={cn(base, className)}>{children}</div>;
}
