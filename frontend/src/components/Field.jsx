export default function Field({ id, label, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-text-muted">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 font-label-md text-label-md uppercase tracking-wider text-error" role="alert">
          <span aria-hidden="true">▸</span> {error}
        </p>
      )}
    </div>
  );
}
