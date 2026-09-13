import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030405] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            API Monitor
          </Link>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link href="/login" className="transition hover:text-white">
              Connexion
            </Link>
            <Link href="/register" className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-black transition hover:bg-cyan-300">
              Créer un compte
            </Link>
          </nav>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
            Monitoring simple et fiable
          </p>
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Surveillez vos APIs et services en temps réel.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Créez vos monitors, vérifiez automatiquement la disponibilité de vos endpoints et consultez leur historique depuis un tableau de bord unique.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register" className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300">
              Commencer
            </Link>
            <Link href="/login" className="rounded-lg border border-white/15 px-5 py-3 font-medium text-white transition hover:bg-white/5">
              Se connecter
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
