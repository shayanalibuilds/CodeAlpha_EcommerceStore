import Icon from './Icon.jsx';

const TONES = {
  error: {
    frame: 'border-error bg-error-container/40 text-error',
    icon: 'error',
  },
  info: {
    frame: 'border-border-grid bg-surface-paper text-on-surface',
    icon: 'info',
  },
  success: {
    frame: 'border-accent-pine/40 bg-white text-tertiary',
    icon: 'check_circle',
  },
};

export default function Alert({ tone = 'error', children, onRetry }) {
  const t = TONES[tone] || TONES.error;
  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 border px-space-md py-2.5 font-body-sm text-body-sm ${t.frame}`}
      role="alert"
    >
      <span className="flex items-start gap-2">
        <Icon name={t.icon} className="mt-0.5 text-base" />
        <span>{children}</span>
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-label-md uppercase tracking-wider underline underline-offset-4"
        >
          Try again
        </button>
      )}
    </div>
  );
}
