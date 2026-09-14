'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Monitor, Service } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [monitorName, setMonitorName] = useState('');
  const [monitorUrl, setMonitorUrl] = useState('');
  const [selectedService, setSelectedService] = useState('');

  async function loadData() {
    const [serviceData, monitorData] = await Promise.all([api.services.list(), api.monitors.list()]);
    setServices(serviceData);
    setMonitors(monitorData);
    setSelectedService((current) => current || serviceData[0]?.id || '');
  }

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace('/login');
        return;
      }

      if (!mounted) return;
      setEmail(data.user.email ?? '');

      try {
        await loadData();
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Impossible de charger vos données.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/login');
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  async function handleCreateService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceName.trim()) return;
    setBusy(true);
    setError('');
    try {
      const service = await api.services.create({ name: serviceName.trim(), description: serviceDescription.trim() || undefined });
      setServices((current) => [...current, service]);
      setSelectedService(service.id);
      setServiceName('');
      setServiceDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création du service impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateMonitor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService || !monitorName.trim() || !monitorUrl.trim()) return;
    setBusy(true);
    setError('');
    try {
      const monitor = await api.monitors.create({
        serviceId: selectedService,
        name: monitorName.trim(),
        url: monitorUrl.trim(),
        interval: 60,
        timeout: 10000,
        expectedStatus: 200,
      });
      setMonitors((current) => [monitor, ...current]);
      setMonitorName('');
      setMonitorUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création du monitor impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleMonitor(monitor: Monitor) {
    try {
      const updated = monitor.isActive ? await api.monitors.deactivate(monitor.id) : await api.monitors.activate(monitor.id);
      setMonitors((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de modifier le monitor.');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[var(--ink)]"><span className="data-mono text-xs text-white/40">CHARGEMENT…</span></main>;
  }

  const activeMonitors = monitors.filter((monitor) => monitor.isActive).length;

  return (
    <main className="min-h-screen bg-[var(--ink)] text-white">
      <header className="border-b border-white/[0.08] bg-[var(--ink)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-8">
          <div className="data-mono text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</div>
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-white/40 sm:block">{email}</span>
            <button onClick={handleSignOut} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-all duration-[120ms] hover:border-white/20 hover:text-white active:scale-95">Déconnexion</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="mb-8">
          <p className="data-mono mb-2 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight">Votre monitoring</h1>
          <p className="mt-2 text-sm text-white/45">Créez un service, ajoutez une URL et laissez le backend effectuer les checks.</p>
        </div>

        {error && <div className="mb-6 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Services" value={String(services.length)} tone="text-[var(--electric)]" />
          <StatCard label="Monitors actifs" value={String(activeMonitors)} tone="text-[var(--volt)]" />
          <StatCard label="Monitors" value={String(monitors.length)} tone="text-[var(--solar)]" />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
            <p className="data-mono text-xs uppercase tracking-[0.15em] text-[var(--volt)]">01 / Service</p>
            <h2 className="mt-2 text-xl font-semibold">Créer un service</h2>
            <form onSubmit={handleCreateService} className="mt-5 space-y-4">
              <input required value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Ex. API Production" className="auth-input" />
              <input value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} placeholder="Description (optionnelle)" className="auth-input" />
              <button disabled={busy} className="auth-button">Créer le service</button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
            <p className="data-mono text-xs uppercase tracking-[0.15em] text-[var(--electric)]">02 / Monitor</p>
            <h2 className="mt-2 text-xl font-semibold">Ajouter un endpoint GET</h2>
            <form onSubmit={handleCreateMonitor} className="mt-5 space-y-4">
              <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} disabled={!services.length} className="auth-input">
                {!services.length && <option value="">Créez d’abord un service</option>}
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
              <input required value={monitorName} onChange={(e) => setMonitorName(e.target.value)} placeholder="Nom du monitor" className="auth-input" />
              <input required type="url" value={monitorUrl} onChange={(e) => setMonitorUrl(e.target.value)} placeholder="https://api.exemple.com/health" className="auth-input" />
              <button disabled={busy || !services.length} className="auth-button">Ajouter le monitor</button>
            </form>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">03 / Monitoring</p>
              <h2 className="mt-2 text-xl font-semibold">Monitors configurés</h2>
            </div>
            <span className="data-mono text-xs text-white/35">CHECK / 60s</span>
          </div>

          {monitors.length === 0 ? (
            <p className="mt-8 text-sm text-white/40">Aucun monitor pour le moment. Créez votre premier endpoint ci-dessus.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {monitors.map((monitor) => (
                <div key={monitor.id} className="flex flex-col gap-4 rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${monitor.isActive ? 'bg-[var(--volt)]' : 'bg-white/20'}`} />
                      <p className="font-semibold">{monitor.name}</p>
                    </div>
                    <p className="mt-1 truncate text-sm text-white/40">{monitor.url}</p>
                  </div>
                  <button onClick={() => toggleMonitor(monitor)} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/65 transition-colors duration-[240ms] hover:border-white/20 hover:text-white">
                    {monitor.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
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
