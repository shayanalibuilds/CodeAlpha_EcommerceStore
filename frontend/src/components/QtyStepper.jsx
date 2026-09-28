export default function QtyStepper({
  qty,
  min = 1,
  max = 99,
  onDecrement,
  onIncrement,
  disabled = false,
}) {
  return (
    <div className="inline-flex items-center rounded-xl bg-white ring-1 ring-stone-300">
      <button
        type="button"
        aria-label="Decrease quantity"
        className="px-2.5 py-1.5 text-lg leading-none text-stone-700 hover:bg-stone-100 disabled:opacity-40"
        onClick={onDecrement}
        disabled={disabled || qty <= min}
      >
        −
      </button>
      <span
        className="min-w-[2.25rem] text-center text-sm font-semibold text-stone-900"
        aria-label={`Quantity: ${qty}`}
      >
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        className="px-2.5 py-1.5 text-lg leading-none text-stone-700 hover:bg-stone-100 disabled:opacity-40"
        onClick={onIncrement}
        disabled={disabled || qty >= max}
      >
        +
      </button>
    </div>
  );
}
