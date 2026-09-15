'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, CheckResult, Monitor, MonitorStats, Service } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [stats, setStats] = useState<Record<string, MonitorStats>>({});
  const [results, setResults] = useState<Record<string, CheckResult[]>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [monitorName, setMonitorName] = useState('');
  const [monitorUrl, setMonitorUrl] = useState('');
  const [selectedService, setSelectedService] = useState('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError('');
    try {
      const [serviceData, monitorData] = await Promise.all([api.services.list(), api.monitors.list()]);
      setServices(serviceData);
      setMonitors(monitorData);
      setSelectedService((current) => current && serviceData.some((s) => s.id === current) ? current : serviceData[0]?.id || '');

      const statEntries = await Promise.all(monitorData.map(async (monitor) => {
        try {
          const [monitorStats, monitorResults] = await Promise.all([api.checkResults.stats(monitor.id), api.checkResults.list(monitor.id, 10)]);
          return [monitor.id, monitorStats, monitorResults] as const;
        } catch {
          return [monitor.id, null, []] as const;
        }
      }));
      const nextStats: Record<string, MonitorStats> = {};
      const nextResults: Record<string, CheckResult[]> = {};
      statEntries.forEach(([id, monitorStats, monitorResults]) => {
        if (monitorStats) nextStats[id] = monitorStats;
        nextResults[id] = monitorResults;
      });
      setStats(nextStats);
      setResults(nextResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger vos données.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.replace('/login'); return; }
      if (!mounted) return;
      setEmail(data.user.email ?? '');
      await loadData();
    }
    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [router, loadData]);

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!serviceName.trim()) return;
    setBusy(true); setError('');
    try {
      const service = await api.services.create({ name: serviceName.trim(), description: serviceDescription.trim() || undefined });
      setServiceName(''); setServiceDescription('');
      setServices((current) => [...current, service]); setSelectedService(service.id);
    } catch (err) { setError(err instanceof Error ? err.message : 'Création du service impossible.'); }
    finally { setBusy(false); }
  }

  async function handleCreateMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selectedService || !monitorName.trim() || !monitorUrl.trim()) return;
    setBusy(true); setError('');
    try {
      const monitor = await api.monitors.create({ serviceId: selectedService, name: monitorName.trim(), url: monitorUrl.trim(), interval: 60, timeout: 10000, expectedStatus: 200 });
      setMonitorName(''); setMonitorUrl(''); setMonitors((current) => [monitor, ...current]);
    } catch (err) { setError(err instanceof Error ? err.message : 'Création du monitor impossible.'); }
    finally { setBusy(false); }
  }

  async function toggleMonitor(monitor: Monitor) {
    setError('');
    try {
      const updated = monitor.isActive ? await api.monitors.deactivate(monitor.id) : await api.monitors.activate(monitor.id);
      setMonitors((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de modifier le monitor.'); }
  }

  async function deleteMonitor(monitor: Monitor) {
    if (!window.confirm(`Supprimer « ${monitor.name} » ?`)) return;
    setError('');
    try { await api.monitors.remove(monitor.id); setMonitors((current) => current.filter((item) => item.id !== monitor.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Suppression impossible.'); }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Supprimer « ${service.name} » et ses données associées ?`)) return;
    setError('');
    try {
      await api.services.remove(service.id);
      setServices((current) => current.filter((item) => item.id !== service.id));
      setMonitors((current) => current.filter((item) => item.serviceId !== service.id));
    } catch (err) { setError(err instanceof Error ? err.message : 'Suppression impossible.'); }
  }

  async function handleSignOut() { await supabase.auth.signOut(); router.replace('/'); }

  const activeMonitors = monitors.filter((monitor) => monitor.isActive).length;
  const averageUptime = useMemo(() => {
    const values = Object.values(stats).map((item) => item.uptimePercentage);
    return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
  }, [stats]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[var(--ink)] text-white"><span className="data-mono text-xs text-white/40">CHARGEMENT…</span></main>;

  return (
    <main className="min-h-screen bg-[var(--ink)] text-white">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[var(--ink)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="data-mono text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</div>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <span className="hidden max-w-56 truncate text-xs text-white/40 md:block">{email}</span>
            <button onClick={() => loadData()} disabled={refreshing} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white disabled:opacity-40">{refreshing ? 'Actualisation…' : 'Actualiser'}</button>
            <button onClick={handleSignOut} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white active:scale-95">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7">
          <p className="data-mono mb-2 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Votre monitoring</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">Créez des services, surveillez vos endpoints et consultez leur santé.</p></div>
            <span className="data-mono text-xs text-white/30">{refreshing ? 'SYNC…' : 'LIVE'}</span>
          </div>
        </div>

        {error && <div className="mb-6 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Services" value={String(services.length)} tone="text-[var(--electric)]" />
          <StatCard label="Monitors actifs" value={String(activeMonitors)} tone="text-[var(--volt)]" />
          <StatCard label="Monitors" value={String(monitors.length)} tone="text-[var(--solar)]" />
          <StatCard label="Uptime moyen" value={averageUptime === null ? '—' : `${averageUptime.toFixed(1)}%`} tone="text-[var(--volt)]" />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <FormCard eyebrow="01 / Service" tone="var(--volt)" title="Créer un service">
            <form onSubmit={handleCreateService} className="space-y-3">
              <input required value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex. API Production" className="auth-input w-full" />
              <input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Description (optionnelle)" className="auth-input w-full" />
              <button disabled={busy} className="auth-button w-full">{busy ? 'Création…' : 'Créer le service'}</button>
            </form>
          </FormCard>
          <FormCard eyebrow="02 / Monitor" tone="var(--electric)" title="Ajouter un endpoint GET">
            <form onSubmit={handleCreateMonitor} className="space-y-3">
              <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} disabled={!services.length} className="auth-input w-full">
                {!services.length && <option value="">Créez d’abord un service</option>}
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              <input required value={monitorName} onChange={(e) => setMonitorName(e.target.value)} placeholder="Nom du monitor" className="auth-input w-full" />
              <input required type="url" value={monitorUrl} onChange={(e) => setMonitorUrl(e.target.value)} placeholder="https://api.exemple.com/health" className="auth-input w-full" />
              <button disabled={busy || !services.length} className="auth-button w-full">{busy ? 'Ajout…' : 'Ajouter le monitor'}</button>
            </form>
          </FormCard>
        </div>

        <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">03 / Monitoring</p><h2 className="mt-2 text-xl font-semibold">Monitors configurés</h2></div>
            <span className="data-mono text-xs text-white/35">CHECK / 60s</span>
          </div>

          {monitors.length === 0 ? <p className="mt-8 text-sm text-white/40">Aucun monitor pour le moment. Créez votre premier endpoint ci-dessus.</p> : (
            <div className="mt-5 space-y-3">
              {monitors.map((monitor) => {
                const monitorStats = stats[monitor.id];
                const lastResult = results[monitor.id]?.[0];
                const service = services.find((item) => item.id === monitor.serviceId);
                return (
                  <article key={monitor.id} className="rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-3">
                          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${lastResult?.status === 'DOWN' ? 'bg-[var(--flare)]' : monitor.isActive ? 'bg-[var(--volt)]' : 'bg-white/20'}`} />
                          <div className="min-w-0"><h3 className="font-semibold">{monitor.name}</h3><p className="data-mono mt-1 break-all text-xs text-white/40">{monitor.url}</p><p className="mt-1 text-xs text-white/25">{service?.name ?? 'Service'} · GET · {monitor.timeout}ms timeout</p></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-auto">
                        <MiniMetric label="Status" value={lastResult?.status ?? (monitor.isActive ? 'WAIT' : 'OFF')} tone={lastResult?.status === 'DOWN' ? 'text-[var(--flare)]' : 'text-[var(--volt)]'} />
                        <MiniMetric label="Uptime" value={monitorStats ? `${monitorStats.uptimePercentage.toFixed(1)}%` : '—'} tone="text-white" />
                        <MiniMetric label="Avg" value={monitorStats?.averageResponseTime ? `${Math.round(monitorStats.averageResponseTime)}ms` : '—'} tone="text-[var(--electric)]" />
                        <MiniMetric label="Checks" value={String(monitorStats?.totalChecks ?? 0)} tone="text-[var(--solar)]" />
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                      <button onClick={() => toggleMonitor(monitor)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white active:scale-95">{monitor.isActive ? 'Désactiver' : 'Activer'}</button>
                      <button onClick={() => loadData(true)} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white active:scale-95">Rafraîchir</button>
                      <button onClick={() => deleteMonitor(monitor)} className="rounded-lg border border-[var(--flare)]/20 px-3 py-2 text-xs font-semibold text-[var(--flare)] transition-all duration-[120ms] hover:bg-[var(--flare)]/10 active:scale-95">Supprimer</button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {services.length > 0 && <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-6">
          <div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">04 / Services</p><h2 className="mt-2 text-xl font-semibold">Services</h2></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => <div key={service.id} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4"><div className="min-w-0"><p className="truncate font-semibold">{service.name}</p><p className="mt-1 truncate text-xs text-white/35">{service.description || 'Sans description'}</p></div><button onClick={() => deleteService(service)} className="shrink-0 text-xs font-semibold text-[var(--flare)]/70 hover:text-[var(--flare)]">Supprimer</button></div>)}
          </div>
        </section>}
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"><p className="text-sm text-white/45">{label}</p><p className={`data-mono mt-3 text-3xl font-bold sm:text-4xl ${tone}`}>{value}</p></div>; }
function MiniMetric({ label, value, tone }: { label: string; value: string; tone: string }) { return <div className="min-w-0 rounded-lg bg-white/[0.025] px-3 py-2"><p className="data-mono text-[9px] uppercase tracking-wider text-white/25">{label}</p><p className={`data-mono mt-1 truncate text-xs font-bold ${tone}`}>{value}</p></div>; }
function FormCard({ eyebrow, tone, title, children }: { eyebrow: string; tone: string; title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em]" style={{ color: tone }}>{eyebrow}</p><h2 className="mt-2 mb-5 text-xl font-semibold">{title}</h2>{children}</section>; }
