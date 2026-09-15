'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api, CheckResult, Monitor, MonitorStats } from '@/lib/api';

export default function MonitorDetailPage() {
  const params = useParams<{ id: string }>();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [monitorData, statsData, checksData] = await Promise.all([api.monitors.get(params.id), api.checkResults.stats(params.id), api.checkResults.list(params.id, 50)]);
        setMonitor(monitorData); setStats(statsData); setChecks(checksData);
      } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de charger ce monitor.'); }
    }
    if (params.id) void load();
  }, [params.id]);

  if (error) return <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8"><p className="text-[var(--flare)]">{error}</p><Link href="/dashboard/monitors" className="mt-4 inline-block text-sm text-[var(--electric)]">← Retour aux monitors</Link></div>;
  if (!monitor || !stats) return <div className="flex min-h-[70vh] items-center justify-center"><span className="data-mono text-xs text-white/30">CHARGEMENT…</span></div>;

  const status = !monitor.isActive ? 'PAUSED' : monitor.latestCheck?.status ?? 'NO CHECK';
  const statusClass = status === 'DOWN' ? 'text-[var(--flare)] bg-[var(--flare)]/10' : status === 'PAUSED' ? 'text-[var(--solar)] bg-[var(--solar)]/10' : 'text-[var(--volt)] bg-[var(--volt)]/10';

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <Link href="/dashboard/monitors" className="text-sm text-white/40 hover:text-white">← Retour aux monitors</Link>
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${status === 'DOWN' ? 'bg-[var(--flare)]' : status === 'PAUSED' ? 'bg-[var(--solar)]' : 'bg-[var(--volt)]'}`} /><p className="data-mono text-xs uppercase tracking-[0.16em] text-white/35">{monitor.service?.name ?? 'Service'}</p></div><h1 className="mt-2 text-3xl font-bold">{monitor.name}</h1><p className="data-mono mt-2 break-all text-sm text-white/35">{monitor.url}</p></div><span className={`data-mono rounded-full px-3 py-2 text-xs font-bold ${statusClass}`}>{status}</span></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Checks" value={String(stats.totalChecks)} /><Stat label="Réussis" value={String(stats.successfulChecks)} tone="text-[var(--volt)]" /><Stat label="Échecs" value={String(stats.failedChecks)} tone="text-[var(--flare)]" /><Stat label="Uptime" value={stats.uptimePercentage == null ? '—' : `${stats.uptimePercentage.toFixed(2)}%`} tone="text-[var(--volt)]" /><Stat label="Réponse moy." value={stats.averageResponseTime == null ? '—' : `${stats.averageResponseTime}ms`} tone="text-[var(--electric)]" /></div>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Historique</p><h2 className="mt-2 text-xl font-semibold">Derniers checks</h2></div><span className="data-mono text-xs text-white/25">{checks.length} affichés</span></div><div className="mt-5 space-y-2">{checks.map((check) => <div key={check.id} className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[var(--ink)] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${check.status === 'DOWN' ? 'bg-[var(--flare)]' : 'bg-[var(--volt)]'}`} /><span className={`data-mono text-xs font-bold ${check.status === 'DOWN' ? 'text-[var(--flare)]' : 'text-[var(--volt)]'}`}>{check.status}</span><span className="data-mono text-xs text-white/35">HTTP {check.statusCode ?? '—'}</span></div><div className="flex gap-4 text-xs text-white/35"><span>{check.responseTime == null ? '—' : `${check.responseTime}ms`}</span><span>{new Date(check.checkedAt).toLocaleString()}</span></div></div>)}{!checks.length && <p className="py-10 text-center text-sm text-white/30">Aucun check enregistré pour le moment.</p>}</div></section>
    <section className="mt-6 grid gap-3 sm:grid-cols-3"><Info label="Méthode" value={monitor.method} /><Info label="Intervalle" value={`${monitor.interval}s`} /><Info label="Timeout" value={`${monitor.timeout}ms`} /><Info label="HTTP attendu" value={String(monitor.expectedStatus)} /><Info label="Créé le" value={new Date(monitor.createdAt).toLocaleString()} /><Info label="Dernière mise à jour" value={new Date(monitor.updatedAt).toLocaleString()} /></section>
  </div>;
}

function Stat({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) { return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{label}</p><p className={`data-mono mt-3 text-2xl font-bold ${tone}`}>{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{label}</p><p className="mt-2 text-sm text-white/65">{value}</p></div>; }
