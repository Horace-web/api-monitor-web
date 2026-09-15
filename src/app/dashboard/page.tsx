'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, DashboardStats } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('/login'); return; }
      try { const value = await api.dashboard.stats(); if (mounted) setStats(value); }
      catch (err) { if (mounted) setError(err instanceof Error ? err.message : 'Impossible de charger le dashboard.'); }
      finally { if (mounted) setLoading(false); }
    }
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (!session) router.replace('/login'); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router]);

  if (loading) return <main className="flex min-h-screen items-center justify-center"><span className="data-mono text-xs text-white/35">CHARGEMENT…</span></main>;

  const cards = [
    ['Services', stats?.services ?? 0, 'text-[var(--electric)]'], ['Monitors', stats?.totalMonitors ?? 0, 'text-[var(--solar)]'], ['Actifs', stats?.activeMonitors ?? 0, 'text-[var(--volt)]'], ['En pause', stats?.pausedMonitors ?? 0, 'text-white'],
    ['Uptime', stats?.uptimePercentage == null ? '—' : `${stats.uptimePercentage.toFixed(1)}%`, 'text-[var(--volt)]'], ['Checks', stats?.totalChecks ?? 0, 'text-[var(--solar)]'], ['Échecs', stats?.failedChecks ?? 0, 'text-[var(--flare)]'], ['Réponse moy.', stats?.averageResponseTime == null ? '—' : `${stats.averageResponseTime}ms`, 'text-[var(--electric)]'],
  ];

  return <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <div className="mb-8"><p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Vue générale</h1><p className="mt-2 text-sm text-white/45">L'état de votre infrastructure en un coup d'œil.</p></div>
    {error && <div className="mb-5 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{cards.map(([label, value, tone]) => <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p><p className={`data-mono mt-3 text-2xl font-bold ${tone}`}>{value}</p></div>)}</div>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Monitoring</p><h2 className="mt-2 text-xl font-semibold">État global</h2></div><span className={`data-mono rounded-full px-3 py-1.5 text-xs ${stats?.failedChecks ? 'bg-[var(--flare)]/10 text-[var(--flare)]' : 'bg-[var(--volt)]/10 text-[var(--volt)]'}`}>{stats?.failedChecks ? `${stats.failedChecks} échec(s)` : 'Tout est stable'}</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[var(--volt)] transition-all" style={{ width: `${Math.min(100, stats?.uptimePercentage ?? 0)}%` }} /></div><div className="mt-3 flex justify-between text-xs text-white/30"><span>Disponibilité</span><span>{stats?.uptimePercentage == null ? 'Aucune donnée' : `${stats.uptimePercentage.toFixed(2)}%`}</span></div></section>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex items-center justify-between gap-4"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Navigation rapide</p><h2 className="mt-2 text-xl font-semibold">Gérer votre workspace</h2></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><QuickLink href="/dashboard/monitors" title="Monitors" description="Rechercher, filtrer et paginer vos endpoints." /><QuickLink href="/dashboard/services" title="Services" description="Organiser vos monitors par application." /><QuickLink href="/dashboard/alerts" title="Alertes" description="Consulter tous les checks en échec." /></div></section>
  </div>;
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) { return <button onClick={() => { window.location.href = href; }} className="rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4 text-left transition-all duration-[240ms] hover:-translate-y-0.5 hover:border-[var(--electric)]/25"><p className="font-semibold">{title} <span className="text-[var(--electric)]">→</span></p><p className="mt-2 text-xs leading-5 text-white/35">{description}</p></button>; }
