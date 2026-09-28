const TONES = {
  error: 'bg-red-50 text-red-700 ring-red-200',
  info: 'bg-sky-50 text-sky-800 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export default function Alert({ tone = 'error', children, onRetry }) {
  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-md px-3 py-2 text-sm ring-1 ${TONES[tone] || TONES.error}`}
      role="alert"
    >
      <span>{children}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="shrink-0 font-semibold underline">
          Try again
        </button>
      )}
    </div>
  );
}
