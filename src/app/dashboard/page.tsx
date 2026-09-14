'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setEmail(data.user.email ?? '');
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--ink)]"><span className="data-mono text-xs text-white/40">CHARGEMENT…</span></main>;
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] text-white">
      <header className="border-b border-white/[0.08] bg-[var(--ink)]/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
          <div className="data-mono text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/40 sm:block">{email}</span>
            <button onClick={handleSignOut} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white active:scale-95">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="mb-10">
          <p className="data-mono mb-2 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Overview</p>
          <h1 className="text-3xl font-bold tracking-tight">Votre monitoring</h1>
          <p className="mt-2 text-sm text-white/45">Les métriques réelles arriveront ici dès que vos premiers monitors seront configurés.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Services" value="0" tone="text-[var(--electric)]" />
          <StatCard label="Monitors actifs" value="0" tone="text-[var(--volt)]" />
          <StatCard label="Incidents" value="0" tone="text-[var(--flare)]" />
        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <p className="data-mono text-xs text-white/30">NO MONITORS</p>
          <h2 className="mt-3 text-xl font-semibold">Votre espace est prêt.</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">Créez un service puis ajoutez un endpoint GET à surveiller. Le moteur vérifiera automatiquement son état chaque minute.</p>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors duration-[240ms] hover:border-white/[0.15]">
      <p className="text-sm text-white/45">{label}</p>
      <p className={`data-mono mt-3 text-4xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
