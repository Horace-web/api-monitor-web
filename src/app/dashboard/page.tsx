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
    <div className="mb-8"><p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Vue générale</h1><p className="mt-2 text-sm text-white/45">L&apos;état de votre infrastructure en un coup d&apos;œil.</p></div>
    {error && <div className="mb-5 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">{cards.map(([label, value, tone]) => <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p><p className={`data-mono mt-3 text-2xl font-bold ${tone}`}>{value}</p></div>)}</div>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Monitoring</p><h2 className="mt-2 text-xl font-semibold">État global</h2></div><span className={`data-mono rounded-full px-3 py-1.5 text-xs ${stats?.failedChecks ? 'bg-[var(--flare)]/10 text-[var(--flare)]' : 'bg-[var(--volt)]/10 text-[var(--volt)]'}`}>{stats?.failedChecks ? `${stats.failedChecks} échec(s)` : 'Tout est stable'}</span></div><div className="mt-6 h-3 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[var(--volt)] transition-all" style={{ width: `${Math.min(100, stats?.uptimePercentage ?? 0)}%` }} /></div><div className="mt-3 flex justify-between text-xs text-white/30"><span>Disponibilité</span><span>{stats?.uptimePercentage == null ? 'Aucune donnée' : `${stats.uptimePercentage.toFixed(2)}%`}</span></div></section>
    <section className="mt-6 grid gap-3 lg:grid-cols-2"><DashboardPanel title="Répartition des monitors"><div className="mt-5 grid grid-cols-3 gap-3"><Metric label="UP / actifs" value={String(stats?.activeMonitors ?? 0)} tone="text-[var(--volt)]" /><Metric label="En pause" value={String(stats?.pausedMonitors ?? 0)} tone="text-[var(--solar)]" /><Metric label="DOWN récents" value={String(stats?.recentDown?.length ?? 0)} tone="text-[var(--flare)]" /></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-[var(--volt)]" style={{ width: `${stats?.totalMonitors ? ((stats.activeMonitors / stats.totalMonitors) * 100) : 0}%` }} /></div></DashboardPanel><DashboardPanel title="Performance"><div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Temps moyen" value={stats?.averageResponseTime == null ? '—' : `${stats.averageResponseTime}ms`} tone="text-[var(--electric)]" /><Metric label="Checks réussis" value={String(stats?.successfulChecks ?? 0)} tone="text-[var(--volt)]" /><Metric label="Checks échoués" value={String(stats?.failedChecks ?? 0)} tone="text-[var(--flare)]" /><Metric label="Uptime" value={stats?.uptimePercentage == null ? '—' : `${stats.uptimePercentage.toFixed(2)}%`} tone="text-[var(--volt)]" /></div></DashboardPanel></section>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Derniers incidents</p><h2 className="mt-2 text-xl font-semibold">Checks DOWN récents</h2></div><div className="mt-5 space-y-2">{stats?.recentDown?.length ? stats.recentDown.map((item) => <div key={`${item.monitorId}-${item.checkedAt}`} className="flex flex-col gap-2 rounded-xl border border-[var(--flare)]/10 bg-[var(--ink)] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{item.monitor.name}</p><p className="mt-1 text-xs text-white/35">{item.monitor.service.name} · HTTP {item.statusCode ?? '—'}{item.error ? ` · ${item.error}` : ''}</p></div><span className="data-mono text-xs text-white/35">{new Date(item.checkedAt).toLocaleString()}</span></div>) : <p className="py-8 text-center text-sm text-white/30">Aucun check DOWN récent.</p>}</div></section>
  </div>;
}

function DashboardPanel({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Monitoring</p><h2 className="mt-2 text-xl font-semibold">{title}</h2>{children}</div>; }
function Metric({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-xl border border-white/[0.06] bg-[var(--ink)] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.12em] text-white/30">{label}</p><p className={`data-mono mt-2 text-xl font-bold ${tone}`}>{value}</p></div>; }
