import Link from "next/link";
import { cn } from "@/lib/cn";

// Three-tier button system — CLAUDE.md Section 3. Every tier implements the
// full state set: rest / hover / active / focus-visible / disabled.
// Exactly one Primary per view.

type ButtonVariant = "primary" | "secondary" | "ghost";

const base = cn(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-card",
  "font-medium text-base",
  "transition-[background-color,border-color,color,transform,box-shadow,opacity] duration-150 ease-brand",
  "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent-teal",
);

const rest: Record<ButtonVariant, string> = {
  primary: "bg-accent-teal px-6 py-3 text-bg-base",
  secondary: "border border-border-hairline px-6 py-3 text-text-primary",
  ghost: "px-2 py-2 text-text-secondary",
};

// Hover/active classes are attached only when enabled, so a disabled button
// never lifts or changes fill regardless of element type.
const interactive: Record<ButtonVariant, string> = {
  primary: cn(
    "hover:-translate-y-0.5 hover:bg-accent-teal-hover hover:shadow-teal-glow",
    "active:translate-y-0 active:bg-accent-teal-active active:shadow-none",
  ),
  secondary: cn(
    "hover:border-border-hairline-hover hover:bg-bg-surface-raised",
    "active:bg-bg-surface",
  ),
  ghost: cn("hover:text-text-primary", "active:opacity-80"),
};

// Ghost hover: underline draws left-to-right in 150ms (Section 3) — a solid
// ::after bar widening from 0, because gradients are banned outright.
const ghostUnderline = cn(
  "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0",
  "after:bg-current after:transition-[width] after:duration-150 after:ease-brand",
  "group-hover:after:w-full",
);

type CommonProps = {
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  const disabled = props.href === undefined && Boolean(props.disabled);

  const classes = cn(
    "group",
    base,
    rest[variant],
    !disabled && interactive[variant],
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  const content =
    variant === "ghost" ? (
      <span
        className={cn(
          "relative inline-flex items-center gap-2",
          !disabled && ghostUnderline,
        )}
      >
        {children}
      </span>
    ) : (
      children
    );

  if (props.href !== undefined) {
    const { href, ...linkProps } = props;
    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} className={classes} {...props}>
      {content}
    </button>
  );
}
