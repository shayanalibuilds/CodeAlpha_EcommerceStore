export default function EmptyState({ icon = '🧺', title, children, action }) {
  return (
    <div className="card p-10 text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-3xl"
      >
        {icon}
      </span>
      <h2 className="mt-4 font-semibold text-brand-700">{title}</h2>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-brand-700/70">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
