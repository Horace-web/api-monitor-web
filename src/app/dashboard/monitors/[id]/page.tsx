'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { api, CheckResult, Monitor, MonitorStats, PaginationMeta } from '@/lib/api';

const emptyMeta: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };
type Period = 'ALL' | '24H' | '7D' | '30D';
type StatusFilter = 'ALL' | 'UP' | 'DOWN';

export default function MonitorDetailPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [stats, setStats] = useState<MonitorStats | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<Period>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const hours = period === '24H' ? 24 : period === '7D' ? 24 * 7 : period === '30D' ? 24 * 30 : 0;
      const from = hours ? new Date(Date.now() - hours * 60 * 60 * 1000).toISOString() : undefined;
      const [monitorData, statsData, checksData, latestCheck] = await Promise.all([
        api.monitors.get(id),
        api.checkResults.stats(id),
        api.checkResults.list(id, { page, limit: 20, from, status: statusFilter === 'ALL' ? undefined : statusFilter }),
        api.checkResults.latest(id),
      ]);
      setMonitor({ ...monitorData, latestCheck: latestCheck ?? monitorData.latestCheck ?? null });
      setStats(statsData);
      setChecks(checksData.data);
      setMeta(checksData.meta);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger ce monitor.');
    }
  }, [id, page, period, statusFilter]);

  useEffect(() => { void load(); }, [load]);

  if (error) return <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8"><p className="text-[var(--flare)]">{error}</p><Link href="/dashboard/monitors" className="mt-4 inline-block text-sm text-[var(--electric)]">← Retour aux monitors</Link></div>;
  if (!monitor || !stats) return <div className="flex min-h-[70vh] items-center justify-center"><span className="data-mono text-xs text-white/30">CHARGEMENT…</span></div>;

  const status = !monitor.isActive ? 'PAUSED' : monitor.latestCheck?.status ?? 'NO CHECK';
  const statusClass = status === 'DOWN' ? 'text-[var(--flare)] bg-[var(--flare)]/10' : status === 'PAUSED' ? 'text-[var(--solar)] bg-[var(--solar)]/10' : status === 'NO CHECK' ? 'text-white/50 bg-white/[0.05]' : 'text-[var(--volt)] bg-[var(--volt)]/10';
  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.totalPages;

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <Link href="/dashboard/monitors" className="text-sm text-white/40 hover:text-white">← Retour aux monitors</Link>
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><span className={`h-3 w-3 rounded-full ${status === 'DOWN' ? 'bg-[var(--flare)]' : status === 'PAUSED' ? 'bg-[var(--solar)]' : status === 'NO CHECK' ? 'bg-white/25' : 'bg-[var(--volt)]'}`} /><p className="data-mono text-xs uppercase tracking-[0.16em] text-white/35">{monitor.service?.name ?? 'Service'}</p></div><h1 className="mt-2 text-3xl font-bold">{monitor.name}</h1><p className="data-mono mt-2 break-all text-sm text-white/35">{monitor.url}</p></div><span className={`data-mono rounded-full px-3 py-2 text-xs font-bold ${statusClass}`}>{status}</span></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Stat label="Checks" value={String(stats.totalChecks)} /><Stat label="Réussis" value={String(stats.successfulChecks)} tone="text-[var(--volt)]" /><Stat label="Échecs" value={String(stats.failedChecks)} tone="text-[var(--flare)]" /><Stat label="Uptime" value={stats.uptimePercentage == null ? '—' : `${stats.uptimePercentage.toFixed(2)}%`} tone="text-[var(--volt)]" /><Stat label="Réponse moy." value={stats.averageResponseTime == null ? '—' : `${stats.averageResponseTime}ms`} tone="text-[var(--electric)]" /></div>
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Historique</p><h2 className="mt-2 text-xl font-semibold">Checks</h2><p className="mt-1 text-xs text-white/30">{meta.total} check(s) correspondant aux filtres</p></div><div className="flex flex-wrap gap-2"><select value={period} onChange={(e) => { setPeriod(e.target.value as Period); setPage(1); }} className="auth-input w-auto"><option value="ALL">Toute la période</option><option value="24H">Dernières 24 h</option><option value="7D">7 derniers jours</option><option value="30D">30 derniers jours</option></select><select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }} className="auth-input w-auto"><option value="ALL">Tous</option><option value="UP">UP</option><option value="DOWN">DOWN</option></select></div></div><div className="mt-5 space-y-2">{checks.map((check) => <div key={check.id} className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[var(--ink)] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${check.status === 'DOWN' ? 'bg-[var(--flare)]' : 'bg-[var(--volt)]'}`} /><span className={`data-mono text-xs font-bold ${check.status === 'DOWN' ? 'text-[var(--flare)]' : 'text-[var(--volt)]'}`}>{check.status}</span><span className="data-mono text-xs text-white/35">HTTP {check.statusCode ?? '—'}</span></div><div className="flex gap-4 text-xs text-white/35"><span>{check.responseTime == null ? '—' : `${check.responseTime}ms`}</span><span>{new Date(check.checkedAt).toLocaleString()}</span></div></div>)}{!checks.length && <p className="py-10 text-center text-sm text-white/30">Aucun check pour ces filtres.</p>}</div><div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className="data-mono text-[10px] text-white/30">{meta.total} checks · Page {meta.page} / {Math.max(meta.totalPages, 1)}</span><div className="flex items-center gap-2">{hasPrevious && <button onClick={() => setPage(page - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-white/20">← Précédents</button>}{hasNext && <button onClick={() => setPage(page + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-white/20">Suivants →</button>}</div></div></section>
    <section className="mt-6 grid gap-3 sm:grid-cols-3"><Info label="Méthode" value={monitor.method} /><Info label="Intervalle" value={`${monitor.interval}s`} /><Info label="Timeout" value={`${monitor.timeout}ms`} /><Info label="HTTP attendu" value={String(monitor.expectedStatus)} /><Info label="Créé le" value={new Date(monitor.createdAt).toLocaleString()} /><Info label="Dernière mise à jour" value={new Date(monitor.updatedAt).toLocaleString()} /></section>
  </div>;
}
function Stat({ label, value, tone = 'text-white' }: { label: string; value: string; tone?: string }) { return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{label}</p><p className={`data-mono mt-3 text-2xl font-bold ${tone}`}>{value}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"><p className="data-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{label}</p><p className="mt-2 text-sm text-white/65">{value}</p></div>; }
