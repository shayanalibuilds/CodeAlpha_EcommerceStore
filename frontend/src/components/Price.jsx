const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

// Money is stored as integer cents and always displayed as USD.
export default function Price({ cents, className = '' }) {
  return <span className={className}>{usd.format((cents || 0) / 100)}</span>;
}
