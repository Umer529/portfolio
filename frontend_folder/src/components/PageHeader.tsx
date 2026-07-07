// The one page-title pattern, used on every page — public and admin — so
// eyebrow style, heading scale, and lede treatment never drift between
// routes (CLAUDE.md Section 7.4: consistency and standards).

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-xs text-accent-teal">{eyebrow}</p>
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      {lede ? <p className="max-w-prose text-text-secondary">{lede}</p> : null}
    </div>
  );
}
