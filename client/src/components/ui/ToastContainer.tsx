
import type { Toast } from '../../hooks/useToast';

interface Props { toasts: Toast[]; dismiss: (id: number) => void; }

const icons: Record<Toast['type'], string> = {
  success: '✓', error: '✕', info: 'ℹ',
};
const styles: Record<Toast['type'], string> = {
  success: 'bg-emerald-600',
  error:   'bg-red-600',
  info:    'bg-gold-600',
};

export function ToastContainer({ toasts, dismiss }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-xs w-full" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg text-white animate-slide-in-right ${styles[t.type]}`}
          role="alert"
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
            {icons[t.type]}
          </span>
          <p className="flex-1 text-sm leading-snug">{t.message}</p>
          <button onClick={() => dismiss(t.id)} className="flex-shrink-0 opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  );
}
