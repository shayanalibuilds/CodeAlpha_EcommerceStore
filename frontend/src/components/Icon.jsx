/**
 * Material Symbols Outlined icon (name-based, ligature rendering).
 * Usage: <Icon name="shopping_bag" className="text-base" fill />
 */
export default function Icon({ name, className = 'text-xl', fill = false, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" } : undefined}
      {...rest}
    >
      {name}
    </span>
  );
}
