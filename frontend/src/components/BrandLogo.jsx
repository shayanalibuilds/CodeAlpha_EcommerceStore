// Inline version of /brand/logo-compact.svg (verbatim geometry).
// Inlined so the wordmark renders with the document's Inter webfont —
// SVG referenced via <img> cannot load external fonts.
export default function BrandLogo({ className = 'h-9 w-auto' }) {
  return (
    <svg className={className} viewBox="0 0 200 48" fill="none" role="img" aria-label="Northwind Market">
      <rect width="40" height="40" x="4" y="4" rx="10" fill="#047857" />
      <circle cx="24" cy="24" r="12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      <polygon points="24,15 27,24 24,22" fill="#ffffff" />
      <polygon points="24,33 21,24 24,26" fill="#A7F3D0" />
      <circle cx="24" cy="24" r="2.5" fill="#ffffff" />
      <text x="56" y="26" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="18" fill="#1c1917" letterSpacing="-0.02em">
        Northwind
      </text>
      <text x="56" y="38" fontFamily="'Inter', sans-serif" fontWeight="500" fontSize="12" fill="#047857" letterSpacing="0.05em">
        MARKET
      </text>
    </svg>
  );
}
