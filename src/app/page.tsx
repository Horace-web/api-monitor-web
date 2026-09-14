import Link from 'next/link';

const features = [
  { label: 'UPTIME', value: '99.9%', tone: 'text-[var(--volt)]' },
  { label: 'CHECKS', value: '60s', tone: 'text-[var(--electric)]' },
  { label: 'HTTP', value: 'GET', tone: 'text-[var(--solar)]' },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--ink)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-7 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/[0.08] pb-6">
          <Link href="/" className="data-mono text-sm font-bold tracking-tight">
            API<span className="text-[var(--electric)]">/</span>MONITOR
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 text-white/55 transition-colors duration-[240ms] hover:text-white">Connexion</Link>
            <Link href="/register" className="rounded-lg bg-[var(--electric)] px-4 py-2 font-semibold transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#315ee0] active:translate-y-0">Créer un compte</Link>
          </nav>
        </header>

        <section className="relative flex flex-1 flex-col justify-center py-20 sm:py-28">
          <div className="pointer-events-none absolute -right-48 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[var(--electric)]/10 blur-3xl" />
          <div className="relative max-w-4xl animate-page-in">
            <div className="data-mono mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--volt)]/20 bg-[var(--volt)]/5 px-3 py-1.5 text-xs text-[var(--volt)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" /> SYSTEM OPERATIONAL
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] sm:text-7xl">
              Know when your API
              <span className="block text-[var(--electric)]">goes down.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/50 sm:text-lg">
              Surveillez vos endpoints, mesurez leurs temps de réponse et construisez un historique fiable de leur disponibilité.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-xl bg-[var(--electric)] px-5 py-3.5 text-sm font-bold transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#315ee0] active:translate-y-0">Commencer gratuitement</Link>
              <Link href="/login" className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white/75 transition-all duration-[240ms] hover:border-white/20 hover:bg-white/[0.06] hover:text-white">Se connecter</Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.label} className="bg-[var(--ink)] px-6 py-5">
              <p className="data-mono text-[10px] tracking-[0.18em] text-white/30">{feature.label}</p>
              <p className={`data-mono mt-2 text-xl font-bold ${feature.tone}`}>{feature.value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
