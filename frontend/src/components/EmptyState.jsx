import Icon from './Icon.jsx';

/**
 * Architectural empty state: bordered frame, square icon well, uppercase title.
 * `icon` is a Material Symbols name (falls back gracefully for legacy emoji).
 */
export default function EmptyState({ icon = 'inventory_2', title, children, action }) {
  const isEmoji = !/^[a-z_0-9]+$/i.test(icon || '');
  return (
    <div className="flex flex-col items-center justify-center border border-border-grid bg-white px-6 py-space-xl text-center">
      <div className="mb-space-md flex h-14 w-14 items-center justify-center border border-border-grid bg-surface-container-low text-text-muted">
        {isEmoji ? (
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
        ) : (
          <Icon name={icon} className="text-2xl" />
        )}
      </div>
      <h2 className="font-headline-sm font-semibold uppercase tracking-tight text-on-surface">{title}</h2>
      {children && (
        <p className="mt-space-xs max-w-md font-body-sm text-body-sm leading-relaxed text-text-muted">
          {children}
        </p>
      )}
      {action && <div className="mt-space-lg">{action}</div>}
    </div>
  );
}
