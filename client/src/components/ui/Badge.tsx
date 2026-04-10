

interface BadgeProps { text: string; variant?: 'gold' | 'crimson' | 'green' | 'blue' | 'gray'; }

const variantClasses: Record<string, string> = {
  gold:    'bg-amber-100 text-amber-700 border border-amber-200',
  crimson: 'bg-red-100 text-red-700 border border-red-200',
  green:   'bg-emerald-100 text-emerald-700 border border-emerald-200',
  blue:    'bg-sky-100 text-sky-700 border border-sky-200',
  gray:    'bg-gray-100 text-gray-600 border border-gray-200',
};

function getBadgeVariant(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('best') || t.includes('popular')) return 'gold';
  if (t.includes('new'))    return 'green';
  if (t.includes('limited') || t.includes('grade')) return 'crimson';
  if (t.includes('premium') || t.includes('raw') || t.includes('ayur')) return 'blue';
  return 'gray';
}

export function Badge({ text, variant }: BadgeProps) {
  const cls = variantClasses[variant ?? getBadgeVariant(text)] ?? variantClasses.gray;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {text}
    </span>
  );
}
