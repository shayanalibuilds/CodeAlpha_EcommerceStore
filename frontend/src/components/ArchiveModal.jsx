import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { CATEGORY_LABELS } from './categories.js';

/**
 * Destructive-action confirmation modal — architectural port of the designer's
 * "De-list Artifact" dialog (05 / 13). Wired to the real archive/restore API:
 * the operator must type ARCHIVE-<SLUG> (or RESTORE-<SLUG>) to unlock the
 * commit button.
 */
export default function ArchiveModal({ product, mode = 'archive', busy, onConfirm, onClose }) {
  const [text, setText] = useState('');
  const [checked, setChecked] = useState(false);
  const inputRef = useRef(null);
  const archiving = mode === 'archive';
  const expected = `${archiving ? 'ARCHIVE' : 'RESTORE'}-${product.slug.toUpperCase()}`;
  const matches = text.trim().toUpperCase() === expected;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181b]/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex w-full max-w-[620px] flex-col border border-border-strong bg-surface-pure">
        {/* Error perimeter strip */}
        <div className={`h-1.5 w-full ${archiving ? 'bg-error' : 'bg-accent-pine'}`} aria-hidden="true" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-grid p-space-lg pb-space-md">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-label-sm font-semibold uppercase tracking-widest text-white ${
                  archiving ? 'bg-error' : 'bg-accent-pine'
                }`}
              >
                <span className="h-1.5 w-1.5 bg-white" aria-hidden="true" />
                {archiving ? 'Confirm catalog action' : 'Confirm restore'}
              </span>
            </div>
            <h2 id="archive-modal-title" className="mt-1 font-headline-md tracking-tight text-text-primary">
              {archiving ? 'De-list this artifact?' : 'Restore this artifact to the catalog?'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center border border-border-grid bg-surface-pure text-text-primary transition-colors hover:bg-surface-container"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-space-md p-space-lg">
          <p className="font-body-md leading-relaxed text-on-surface-variant">
            You are initiating{' '}
            <strong className="font-semibold text-text-primary">
              {archiving ? 'a catalog de-listing' : 'a catalog restoration'}
            </strong>{' '}
            of product record <strong className="font-semibold text-text-primary">Ref. {product.slug.toUpperCase()}</strong>{' '}
            (“{product.title}”). {archiving
              ? 'This will unpublish the SKU from the public catalog and hide it from customers. Order history stays intact.'
              : 'This will re-publish the SKU to the public catalog at its current stock level.'}
          </p>

          {/* Spec bay */}
          <div className="grid grid-cols-3 divide-x divide-border-grid border border-border-grid bg-surface-paper">
            <div className="flex flex-col p-space-sm">
              <span className="font-label-sm uppercase text-text-muted">Reference</span>
              <span className="mt-0.5 font-mono text-body-sm font-semibold text-text-primary">
                {product.slug.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col p-space-sm">
              <span className="font-label-sm uppercase text-text-muted">Category Node</span>
              <span className="mt-0.5 text-body-sm text-text-primary">
                {CATEGORY_LABELS[product.category] || product.category}
              </span>
            </div>
            <div className="flex flex-col p-space-sm">
              <span className="font-label-sm uppercase text-text-muted">Catalog Status</span>
              <span
                className={`mt-0.5 text-body-sm font-semibold ${
                  archiving ? 'text-error' : 'text-accent-pine'
                }`}
              >
                {archiving ? 'DECOMMISSION' : 'RECOMMISSION'}
              </span>
            </div>
          </div>

          {/* Stock warning */}
          <div className="flex items-start gap-3 border border-border-strong bg-surface-container-low p-space-md">
            <Icon name="warning" className="mt-0.5 shrink-0 text-[20px] text-error" />
            <div className="flex flex-col">
              <span className="font-label-lg uppercase tracking-wider text-text-primary">
                Inventory Allocation Notice
              </span>
              <p className="mt-1 font-body-sm leading-normal text-text-muted">
                <span className="font-mono font-semibold text-text-primary">{product.stock} units</span>{' '}
                currently remain in the digital depot.{' '}
                {archiving
                  ? 'Customers will no longer see or order this artifact.'
                  : 'Customers will see and order this artifact again.'}{' '}
                Stock levels are not modified by this action.
              </p>
            </div>
          </div>

          {/* Verification input */}
          <div className="flex flex-col gap-2 pt-space-xs">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="archive-verification" className="font-label-md uppercase tracking-wider text-text-primary">
                To verify, type <code className="bg-surface-container-high px-1.5 py-0.5 font-mono font-semibold text-error">{expected}</code> below:
              </label>
              <span className="shrink-0 font-mono font-label-sm uppercase text-text-muted">
                {text.length} / {expected.length} chars
              </span>
            </div>
            <div className="relative w-full">
              <input
                ref={inputRef}
                id="archive-verification"
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={expected}
                className={`h-11 w-full border px-space-md font-mono text-body-md text-text-primary outline-none transition-colors placeholder:text-text-muted/40 ${
                  matches ? 'border-accent-pine' : 'border-border-grid focus:border-error'
                }`}
              />
              {matches && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-accent-pine">
                  <Icon name="check_circle" className="text-[18px]" />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer action bar */}
        <div className="flex flex-col items-center justify-between gap-space-md border-t border-border-grid bg-surface-paper p-space-lg pt-space-md sm:flex-row">
          <label className="flex cursor-pointer select-none items-center gap-space-sm">
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <span
              className={`flex h-[18px] w-[18px] items-center justify-center border border-border-strong bg-surface-pure transition-colors ${
                checked ? 'bg-text-primary' : ''
              }`}
              aria-hidden="true"
            >
              {checked && <Icon name="check" className="text-[14px] text-white" />}
            </span>
            <span className={`font-label-md uppercase tracking-wide ${checked ? 'text-text-primary' : 'text-text-muted'}`}>
              I understand this changes catalog visibility
            </span>
          </label>
          <div className="flex w-full items-center gap-space-sm sm:w-auto">
            <button type="button" onClick={onClose} className="btn-outline flex-1 sm:flex-initial">
              Abort
            </button>
            <button
              type="button"
              disabled={!matches || !checked || busy}
              onClick={onConfirm}
              className={`flex-1 px-space-lg py-2.5 font-label-lg uppercase tracking-wider text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:flex-initial ${
                archiving ? 'border border-error bg-error hover:bg-[#93000a]' : 'border border-accent-pine bg-accent-pine hover:bg-accent-pine-hover'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Icon name={archiving ? 'inventory' : 'publish'} className="text-[16px]" />
                {busy ? 'Working…' : archiving ? 'Archive artifact' : 'Restore artifact'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


