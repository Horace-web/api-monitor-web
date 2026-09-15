'use client';

import { useEffect, useState } from 'react';
import { api, Alert, PaginationMeta } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const emptyMeta: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

export default function AlertsPage() {
  const [items, setItems] = useState<Alert[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try { const result = await api.alerts.list({ page, limit: 20 }); setItems(result.data); setMeta(result.meta); }
    catch (err) { setError(err instanceof Error ? err.message : 'Impossible de charger les alertes.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; else load(); }); }, [page]);

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <div className="mb-7"><p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--flare)]">Workspace / Alertes</p><h1 className="mt-2 text-3xl font-bold">Alertes</h1><p className="mt-2 text-sm text-white/45">Historique des checks ayant détecté une indisponibilité.</p></div>
    {error && <div className="mb-5 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}
    <section className="rounded-2xl border border-[var(--flare)]/10 bg-[var(--flare)]/[0.025] p-5 sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-[var(--flare)]/60">Incidents détectés</p><h2 className="mt-2 text-xl font-semibold">{meta.total} échec(s)</h2></div><span className="data-mono text-xs text-white/25">{loading ? 'SYNC…' : 'À jour'}</span></div><div className="mt-5 space-y-2">{items.map((item) => <article key={item.id} className="rounded-xl border border-[var(--flare)]/10 bg-[var(--ink)] p-4"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0"><div className="flex items-center gap-3"><span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--flare)]" /><div><p className="font-semibold">{item.monitor.name}</p><p className="mt-1 text-xs text-white/35">{item.monitor.service.name}</p></div></div><p className="data-mono mt-3 break-all text-xs text-white/30">{item.monitor.url}</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[360px]"><Metric label="HTTP" value={item.statusCode ? String(item.statusCode) : '—'} /><Metric label="Réponse" value={item.responseTime == null ? '—' : `${item.responseTime}ms`} /><Metric label="Date" value={new Date(item.checkedAt).toLocaleString()} /></div></div>{item.error && <p className="mt-3 rounded-lg bg-[var(--flare)]/[0.06] px-3 py-2 text-xs text-[var(--flare)]/80">{item.error}</p>}</article>)}{!items.length && !loading && <div className="py-12 text-center"><p className="text-lg font-semibold">Aucune alerte</p><p className="mt-2 text-sm text-white/30">Vos monitors n'ont détecté aucun nouvel échec.</p></div>}</div><Pagination meta={meta} page={page} setPage={setPage} /></section>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div><p className="data-mono text-[9px] uppercase tracking-[0.12em] text-white/25">{label}</p><p className="mt-1 truncate text-xs text-white/55">{value}</p></div>; }
function Pagination({ meta, page, setPage }: { meta: PaginationMeta; page: number; setPage: (page: number) => void }) { if (meta.totalPages <= 1) return null; return <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className="data-mono text-[10px] text-white/30">Page {page} / {meta.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">←</button><button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">→</button></div></div>; }
