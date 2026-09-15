'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, CheckResult, DashboardStats, Monitor, MonitorStats, PaginationMeta, Service } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const emptyMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };
type StatusFilter = 'ALL' | 'UP' | 'DOWN' | 'PAUSED';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [serviceMeta, setServiceMeta] = useState(emptyMeta);
  const [servicePage, setServicePage] = useState(1);
  const [serviceSearch, setServiceSearch] = useState('');
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [monitorMeta, setMonitorMeta] = useState(emptyMeta);
  const [monitorPage, setMonitorPage] = useState(1);
  const [monitorSearch, setMonitorSearch] = useState('');
  const [monitorStatus, setMonitorStatus] = useState<StatusFilter>('ALL');
  const [monitorService, setMonitorService] = useState('');
  const [stats, setStats] = useState<Record<string, MonitorStats>>({});
  const [results, setResults] = useState<Record<string, CheckResult[]>>({});
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [monitorName, setMonitorName] = useState('');
  const [monitorUrl, setMonitorUrl] = useState('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError('');
    try {
      const [serviceData, optionData, monitorData, globalStats] = await Promise.all([
        api.services.list({ page: servicePage, limit: 10, search: serviceSearch }),
        api.services.list({ page: 1, limit: 50 }),
        api.monitors.list({ page: monitorPage, limit: 10, search: monitorSearch, serviceId: monitorService || undefined, status: monitorStatus === 'ALL' ? undefined : monitorStatus }),
        api.dashboard.stats(),
      ]);
      setServices(serviceData.data); setServiceMeta(serviceData.meta); setServiceOptions(optionData.data);
      setMonitors(monitorData.data); setMonitorMeta(monitorData.meta); setDashboardStats(globalStats);
      setSelectedService((current) => current && optionData.data.some((s) => s.id === current) ? current : optionData.data[0]?.id || '');

      const entries = await Promise.all(monitorData.data.map(async (monitor) => {
        try { const [s, r] = await Promise.all([api.checkResults.stats(monitor.id), api.checkResults.list(monitor.id, 10)]); return [monitor.id, s, r] as const; }
        catch { return [monitor.id, null, [] as CheckResult[]] as const; }
      }));
      const nextStats: Record<string, MonitorStats> = {}; const nextResults: Record<string, CheckResult[]> = {};
      entries.forEach(([id, s, r]) => { if (s) nextStats[id] = s; nextResults[id] = r; });
      setStats(nextStats); setResults(nextResults);
    } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de charger vos données.'); }
    finally { setRefreshing(false); setLoading(false); }
  }, [monitorPage, monitorSearch, monitorService, monitorStatus, servicePage, serviceSearch]);

  useEffect(() => {
    let mounted = true;
    async function init() { const { data } = await supabase.auth.getUser(); if (!data.user) { router.replace('/login'); return; } if (!mounted) return; setEmail(data.user.email ?? ''); await loadData(); }
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (!session) router.replace('/login'); });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router, loadData]);

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!serviceName.trim()) return; setBusy(true); setError('');
    try { const service = await api.services.create({ name: serviceName.trim(), description: serviceDescription.trim() || undefined }); setServiceName(''); setServiceDescription(''); setSelectedService(service.id); setServicePage(1); await loadData(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Création du service impossible.'); } finally { setBusy(false); }
  }
  async function handleCreateMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedService || !monitorName.trim() || !monitorUrl.trim()) return; setBusy(true); setError('');
    try { await api.monitors.create({ serviceId: selectedService, name: monitorName.trim(), url: monitorUrl.trim(), interval: 60, timeout: 10000, expectedStatus: 200 }); setMonitorName(''); setMonitorUrl(''); setMonitorPage(1); await loadData(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'Création du monitor impossible.'); } finally { setBusy(false); }
  }
  async function toggleMonitor(monitor: Monitor) { try { if (monitor.isActive) await api.monitors.deactivate(monitor.id); else await api.monitors.activate(monitor.id); await loadData(true); } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de modifier le monitor.'); } }
  async function deleteMonitor(monitor: Monitor) { if (!window.confirm(`Supprimer « ${monitor.name} » ?`)) return; try { await api.monitors.remove(monitor.id); await loadData(true); } catch (err) { setError(err instanceof Error ? err.message : 'Suppression impossible.'); } }
  async function deleteService(service: Service) { if (!window.confirm(`Supprimer « ${service.name} » et ses données associées ?`)) return; try { await api.services.remove(service.id); setServicePage(1); setMonitorPage(1); await loadData(true); } catch (err) { setError(err instanceof Error ? err.message : 'Suppression impossible.'); } }
  async function handleSignOut() { await supabase.auth.signOut(); router.replace('/'); }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[var(--ink)] text-white"><span className="data-mono text-xs text-white/40">CHARGEMENT…</span></main>;

  return <main className="min-h-screen bg-[var(--ink)] text-white">
    <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[var(--ink)]/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8"><div className="data-mono text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</div><div className="flex items-center gap-2 sm:gap-4"><span className="hidden max-w-56 truncate text-xs text-white/40 md:block">{email}</span><button onClick={() => loadData()} disabled={refreshing} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 hover:border-white/20 hover:text-white disabled:opacity-40">{refreshing ? 'Actualisation…' : 'Actualiser'}</button><button onClick={handleSignOut} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 hover:border-white/20 hover:text-white">Déconnexion</button></div></div></header>
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7"><p className="data-mono mb-2 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Votre monitoring</h1><p className="mt-2 text-sm leading-6 text-white/45">Vue globale de la santé de vos services et endpoints.</p></div><span className="data-mono text-xs text-white/30">{refreshing ? 'SYNC…' : 'LIVE'}</span></div></div>
      {error && <div className="mb-6 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8"><StatCard label="Services" value={String(dashboardStats?.services ?? 0)} tone="text-[var(--electric)]" /><StatCard label="Monitors" value={String(dashboardStats?.totalMonitors ?? 0)} tone="text-[var(--solar)]" /><StatCard label="Actifs" value={String(dashboardStats?.activeMonitors ?? 0)} tone="text-[var(--volt)]" /><StatCard label="En pause" value={String(dashboardStats?.pausedMonitors ?? 0)} tone="text-white" /><StatCard label="Uptime" value={dashboardStats?.uptimePercentage == null ? '—' : `${dashboardStats.uptimePercentage.toFixed(1)}%`} tone="text-[var(--volt)]" /><StatCard label="Checks" value={String(dashboardStats?.totalChecks ?? 0)} tone="text-[var(--solar)]" /><StatCard label="Échecs" value={String(dashboardStats?.failedChecks ?? 0)} tone="text-[var(--flare)]" /><StatCard label="Réponse moy." value={dashboardStats?.averageResponseTime == null ? '—' : `${dashboardStats.averageResponseTime}ms`} tone="text-[var(--electric)]" /></div>
      {dashboardStats?.recentDown.length ? <section className="mt-5 rounded-2xl border border-[var(--flare)]/15 bg-[var(--flare)]/[0.04] p-4 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em] text-[var(--flare)]/70">Alertes récentes</p><h2 className="mt-2 text-xl font-semibold">Derniers checks en échec</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{dashboardStats.recentDown.map((item, index) => <div key={`${item.monitorId}-${item.checkedAt}-${index}`} className="rounded-xl border border-[var(--flare)]/10 p-3"><p className="font-semibold text-sm">{item.monitor.name}</p><p className="text-xs text-white/35">{item.monitor.service.name} · {item.statusCode ?? 'Erreur réseau'}</p><p className="data-mono mt-2 text-[10px] text-white/25">{new Date(item.checkedAt).toLocaleString()}</p></div>)}</div></section> : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-2"><FormCard eyebrow="01 / Service" title="Créer un service"><form onSubmit={handleCreateService} className="space-y-3"><input required value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex. API Production" className="auth-input w-full" /><input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Description (optionnelle)" className="auth-input w-full" /><button disabled={busy} className="auth-button w-full">{busy ? 'Création…' : 'Créer le service'}</button></form></FormCard><FormCard eyebrow="02 / Monitor" title="Ajouter un endpoint GET"><form onSubmit={handleCreateMonitor} className="space-y-3"><select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} disabled={!serviceOptions.length} className="auth-input w-full"><option value="">{serviceOptions.length ? 'Choisir un service' : 'Créez d’abord un service'}</option>{serviceOptions.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select><input required value={monitorName} onChange={(e) => setMonitorName(e.target.value)} placeholder="Nom du monitor" className="auth-input w-full" /><input required type="url" value={monitorUrl} onChange={(e) => setMonitorUrl(e.target.value)} placeholder="https://api.exemple.com/health" className="auth-input w-full" /><button disabled={busy || !selectedService} className="auth-button w-full">{busy ? 'Ajout…' : 'Ajouter le monitor'}</button></form></FormCard></div>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">03 / Monitoring</p><h2 className="mt-2 text-xl font-semibold">Monitors</h2><div className="mt-5 grid gap-2 md:grid-cols-[1fr_180px_180px]"><input value={monitorSearch} onChange={(e) => { setMonitorSearch(e.target.value); setMonitorPage(1); }} placeholder="Rechercher nom ou URL…" className="auth-input w-full" /><select value={monitorService} onChange={(e) => { setMonitorService(e.target.value); setMonitorPage(1); }} className="auth-input w-full"><option value="">Tous les services</option>{serviceOptions.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select><select value={monitorStatus} onChange={(e) => { setMonitorStatus(e.target.value as StatusFilter); setMonitorPage(1); }} className="auth-input w-full"><option value="ALL">Tous les statuts</option><option value="UP">UP</option><option value="DOWN">DOWN</option><option value="PAUSED">En pause</option></select></div>
        {monitors.length ? <div className="mt-5 space-y-3">{monitors.map((monitor) => { const s = stats[monitor.id]; const last = results[monitor.id]?.[0]; const service = serviceOptions.find((x) => x.id === monitor.serviceId); return <article key={monitor.id} className="rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4 sm:p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div className="min-w-0 flex-1"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${last?.status === 'DOWN' ? 'bg-[var(--flare)]' : monitor.isActive ? 'bg-[var(--volt)]' : 'bg-white/20'}`} /><div className="min-w-0"><h3 className="font-semibold">{monitor.name}</h3><p className="data-mono mt-1 break-all text-xs text-white/40">{monitor.url}</p><p className="mt-1 text-xs text-white/25">{service?.name ?? 'Service'} · GET · {monitor.timeout}ms timeout</p></div></div></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-auto"><MiniMetric label="Status" value={last?.status ?? (monitor.isActive ? 'WAIT' : 'OFF')} tone={last?.status === 'DOWN' ? 'text-[var(--flare)]' : 'text-[var(--volt)]'} /><MiniMetric label="Uptime" value={s?.uptimePercentage == null ? '—' : `${s.uptimePercentage.toFixed(1)}%`} tone="text-white" /><MiniMetric label="Avg" value={s?.averageResponseTime == null ? '—' : `${s.averageResponseTime}ms`} tone="text-[var(--electric)]" /><MiniMetric label="Checks" value={String(s?.totalChecks ?? 0)} tone="text-[var(--solar)]" /></div></div><div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4"><button onClick={() => toggleMonitor(monitor)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 hover:border-white/20 hover:text-white">{monitor.isActive ? 'Désactiver' : 'Activer'}</button><button onClick={() => deleteMonitor(monitor)} className="rounded-lg border border-[var(--flare)]/20 px-3 py-2 text-xs font-semibold text-[var(--flare)] hover:bg-[var(--flare)]/10">Supprimer</button></div></article>; })}</div> : <p className="mt-8 text-sm text-white/40">Aucun monitor ne correspond aux filtres.</p>}
        <Pagination meta={monitorMeta} onChange={setMonitorPage} />
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">04 / Services</p><h2 className="mt-2 text-xl font-semibold">Services</h2></div><input value={serviceSearch} onChange={(e) => { setServiceSearch(e.target.value); setServicePage(1); }} placeholder="Rechercher un service…" className="auth-input w-full sm:max-w-xs" /></div>{services.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <div key={service.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4"><div className="min-w-0"><p className="truncate font-semibold">{service.name}</p><p className="mt-1 truncate text-xs text-white/35">{service._count?.monitors ?? 0} monitor(s) · {service.description || 'Sans description'}</p></div><button onClick={() => deleteService(service)} className="shrink-0 text-xs font-semibold text-[var(--flare)]/70 hover:text-[var(--flare)]">Supprimer</button></div>)}</div> : <p className="mt-8 text-sm text-white/40">Aucun service ne correspond à la recherche.</p>}<Pagination meta={serviceMeta} onChange={setServicePage} /></section>
    </div>
  </main>;
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"><p className="text-xs text-white/45">{label}</p><p className={`data-mono mt-2 text-2xl font-bold ${tone}`}>{value}</p></div>; }
function MiniMetric({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5"><p className="text-[10px] uppercase tracking-wider text-white/30">{label}</p><p className={`data-mono mt-1 truncate text-sm font-bold ${tone}`}>{value}</p></div>; }
function FormCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">{eyebrow}</p><h2 className="mt-2 mb-5 text-xl font-semibold">{title}</h2>{children}</section>; }
function Pagination({ meta, onChange }: { meta: PaginationMeta; onChange: (page: number) => void }) { if (meta.totalPages <= 1) return <p className="mt-5 text-xs text-white/25">{meta.total} élément(s)</p>; return <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className="text-xs text-white/30">Page {meta.page} / {meta.totalPages} · {meta.total} total</span><div className="flex gap-2"><button disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-30">Précédent</button><button disabled={meta.page >= meta.totalPages} onClick={() => onChange(meta.page + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-30">Suivant</button></div></div>; }
