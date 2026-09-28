// Shared shell for /login and /register: emerald brand panel on lg screens,
// centered form column on all sizes. Panel content is the locked design spec.
export default function AuthLayout({ children }) {
  return (
    <main className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-14">
      <section
        className="relative hidden overflow-hidden rounded-2xl bg-brand-700 px-10 py-12 text-white lg:block"
        aria-hidden="true"
      >
        <span className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <span className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-white/10" />

        <div className="relative">
          <img src="/brand/favicon-emerald.svg" alt="" className="h-12 w-12 rounded-xl shadow-md" />
          <h2 className="mt-4 text-2xl font-bold">Northwind Market</h2>
          <p className="mt-1 max-w-xs text-sm text-white/80">
            Everyday goods, thoughtfully sourced.
          </p>
        </div>

        <div className="relative mt-10 flex items-end gap-4">
          <span className="inline-block -rotate-6 rounded-2xl bg-white p-3 shadow-lg">
            <img
              src="/images/products/my-first-world-atlas-illustrated.svg"
              alt=""
              className="h-24 w-24 rounded-lg object-cover"
            />
          </span>
          <span className="inline-block rotate-2 rounded-2xl bg-white p-3 shadow-lg">
            <img
              src="/images/products/sprout-everyday-backpack-fern-green.svg"
              alt=""
              className="h-24 w-24 rounded-lg object-cover"
            />
          </span>
          <span className="inline-block rotate-6 rounded-2xl bg-white p-3 shadow-lg">
            <img
              src="/images/products/glow-study-desk-lamp-warm-white.svg"
              alt=""
              className="h-24 w-24 rounded-lg object-cover"
            />
          </span>
        </div>

        <p className="relative mt-10 text-xs text-white/70">
          Demo store — payments are mocked, no real card is charged.
        </p>
      </section>

      <section className="mx-auto w-full max-w-md">{children}</section>
    </main>
  );
}
