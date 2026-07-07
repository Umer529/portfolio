// Route-style mono eyebrow + display heading, shared by every section so the
// hierarchy reads identically across the site (Section 7.4).

export function SectionHeading({
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
      <h2 className="font-display text-3xl font-semibold">{title}</h2>
      {lede ? (
        <p className="max-w-prose text-text-secondary">{lede}</p>
      ) : null}
    </div>
  );
}
