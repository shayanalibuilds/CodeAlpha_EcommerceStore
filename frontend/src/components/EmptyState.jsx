export default function EmptyState({ icon = '🧺', title, children, action }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-3xl" aria-hidden="true">
        {icon}
      </p>
      <h2 className="mt-2 font-semibold text-brand-700">{title}</h2>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-brand-700/70">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
