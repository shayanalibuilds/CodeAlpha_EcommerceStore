export default function QtyStepper({
  qty,
  min = 1,
  max = 99,
  onDecrement,
  onIncrement,
  disabled = false,
}) {
  return (
    <div className="inline-flex items-stretch border border-border-grid bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="flex h-12 w-11 items-center justify-center text-lg font-medium text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-30"
        onClick={onDecrement}
        disabled={disabled || qty <= min}
      >
        −
      </button>
      <span
        className="flex w-11 items-center justify-center border-x border-border-grid font-headline-sm text-headline-sm font-semibold text-on-surface"
        aria-label={`Quantity: ${qty}`}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="flex h-12 w-11 items-center justify-center text-lg font-medium text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-30"
        onClick={onIncrement}
        disabled={disabled || qty >= max}
      >
        +
      </button>
    </div>
  );
}
