'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, DashboardStats } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metric, setMetric] = useState<'checks' | 'response'>('checks');

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

  const chart = useMemo(() => {
    const points = stats?.trend ?? [];
    if (!points.length) return { line: '', max: 1, labels: [] as { x: number; text: string }[] };
    const values = points.map((point) => metric === 'checks' ? point.up : point.averageResponseTime ?? 0);
    const max = Math.max(...values, 1);
    const width = 900; const height = 250; const padX = 18; const padY = 20;
    const line = values.map((value, index) => { const x = padX + (index / Math.max(values.length - 1, 1)) * (width - padX * 2); const y = height - padY - (value / max) * (height - padY * 2); return `${x},${y}`; }).join(' ');
    const labels = points.filter((_, index) => index % 4 === 0).map((point, index) => ({ x: padX + ((index * 4) / Math.max(points.length - 1, 1)) * (width - padX * 2), text: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
    return { line, max, labels };
  }, [stats, metric]);

  if (loading) return <main className="flex h-[100svh] items-center justify-center overflow-hidden"><span className="data-mono text-xs text-white/35">CHARGEMENT…</span></main>;

  const cards = [
    ['Services', stats?.services ?? 0, 'text-[var(--electric)]'], ['Monitors', stats?.totalMonitors ?? 0, 'text-[var(--solar)]'], ['Actifs', stats?.activeMonitors ?? 0, 'text-[var(--volt)]'], ['En pause', stats?.pausedMonitors ?? 0, 'text-white'],
    ['Uptime', stats?.uptimePercentage == null ? '—' : `${stats.uptimePercentage.toFixed(1)}%`, 'text-[var(--volt)]'], ['Checks', stats?.totalChecks ?? 0, 'text-[var(--solar)]'], ['Échecs', stats?.failedChecks ?? 0, 'text-[var(--flare)]'], ['Réponse moy.', stats?.averageResponseTime == null ? '—' : `${stats.averageResponseTime}ms`, 'text-[var(--electric)]'],
  ];

  return <main><div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-7xl flex-col px-4 py-5 sm:px-6 sm:py-7 lg:px-8"><div className="shrink-0"><p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Vue générale</h1><p className="mt-1 text-xs text-white/40">Surveillance de votre infrastructure en temps réel.</p></div>{error && <div className="mt-3 shrink-0 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-2 text-xs text-[var(--flare)]">{error}</div>}
    <div className="mt-4 grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">{cards.map(([label, value, tone]) => <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="data-mono text-[9px] uppercase tracking-[0.13em] text-white/30">{label}</p><p className={`data-mono mt-2 text-xl font-bold ${tone}`}>{value}</p></div>)}</div>
    <section className="mt-4 min-h-0 flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="data-mono text-[10px] uppercase tracking-[0.15em] text-white/30">Tendance · 24 dernières heures</p><h2 className="mt-1 text-lg font-semibold">{metric === 'checks' ? 'Checks UP par heure' : 'Temps de réponse moyen'}</h2></div><div className="flex rounded-lg border border-white/[0.07] p-1"><button onClick={() => setMetric('checks')} className={`rounded-md px-3 py-1.5 text-[10px] ${metric === 'checks' ? 'bg-white/10 text-white' : 'text-white/35'}`}>Checks</button><button onClick={() => setMetric('response')} className={`rounded-md px-3 py-1.5 text-[10px] ${metric === 'response' ? 'bg-white/10 text-white' : 'text-white/35'}`}>Réponse</button></div></div><div className="mt-3 h-[calc(100%-58px)] min-h-[210px]"><svg viewBox="0 0 900 250" className="h-full w-full" preserveAspectRatio="none"><line x1="18" y1="20" x2="18" y2="230" stroke="rgba(255,255,255,.08)" /><line x1="18" y1="230" x2="882" y2="230" stroke="rgba(255,255,255,.08)" /><polyline fill="none" stroke="var(--electric)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={chart.line} />{chart.line && <><polyline fill="none" stroke="var(--volt)" strokeOpacity=".22" strokeWidth="1" points={chart.line} /></>}{chart.labels.map((label) => <text key={label.text} x={label.x} y="248" fill="rgba(255,255,255,.3)" fontSize="10" textAnchor="middle">{label.text}</text>)}</svg></div></section>
    <div className="mt-3 shrink-0 flex items-center justify-between text-[10px] text-white/30"><span>{stats?.trend?.reduce((sum, point) => sum + point.down, 0) ?? 0} DOWN sur les dernières 24 h</span><span>{metric === 'checks' ? 'UP / heure' : 'ms / heure'}</span></div>
  </div></main>;
}
