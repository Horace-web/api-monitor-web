'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api, PaginationMeta, Service } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const emptyMeta: PaginationMeta = { page: 1, limit: 10, total: 0, totalPages: 0 };

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [meta, setMeta] = useState(emptyMeta);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try { const result = await api.services.list({ page, limit: 10, search: search || undefined }); setItems(result.data); setMeta(result.meta); }
    catch (err) { setError(err instanceof Error ? err.message : 'Impossible de charger les services.'); }
  }
  useEffect(() => { supabase.auth.getUser().then(({ data }) => { if (!data.user) window.location.href = '/login'; else load(); }); }, [page, search]);

  async function create(event: FormEvent) {
    event.preventDefault(); if (!name.trim()) return; setBusy(true); setError('');
    try { await api.services.create({ name: name.trim(), description: description.trim() || undefined }); setName(''); setDescription(''); setPage(1); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Création impossible.'); } finally { setBusy(false); }
  }
  async function remove(item: Service) {
    if (!window.confirm(`Supprimer « ${item.name} » et ses monitors ?`)) return;
    try { await api.services.remove(item.id); await load(); } catch (err) { setError(err instanceof Error ? err.message : 'Suppression impossible.'); }
  }

  return <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
    <div className="mb-7"><p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Workspace / Services</p><h1 className="mt-2 text-3xl font-bold">Services</h1><p className="mt-2 text-sm text-white/45">Organisez vos monitors par application, API ou environnement.</p></div>
    {error && <div className="mb-5 rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</div>}
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Nouveau service</p><form onSubmit={create} className="mt-4 grid gap-3 md:grid-cols-[1fr_1.4fr_auto]"><input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du service" className="auth-input" /><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optionnelle)" className="auth-input" /><button disabled={busy} className="auth-button md:w-auto">{busy ? 'Création…' : 'Créer'}</button></form></section>
    <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="data-mono text-xs uppercase tracking-[0.15em] text-white/30">Catalogue</p><h2 className="mt-2 text-xl font-semibold">{meta.total} service(s)</h2></div><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Rechercher un service…" /></div><div className="mt-5 space-y-2">{items.map((item) => <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-white/[0.07] bg-[var(--ink)] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-white/35">{item.description || 'Aucune description'}</p></div><div className="flex items-center gap-3"><span className="data-mono text-xs text-[var(--electric)]">{item._count?.monitors ?? 0} monitor(s)</span><button onClick={() => remove(item)} className="rounded-lg border border-[var(--flare)]/15 px-3 py-2 text-xs text-[var(--flare)] hover:bg-[var(--flare)]/10">Supprimer</button></div></div>)}{!items.length && <p className="py-10 text-center text-sm text-white/30">Aucun service trouvé.</p>}</div><Pagination meta={meta} page={page} setPage={setPage} /></section>
  </div>;
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) { return <div className="relative w-full sm:max-w-sm"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" aria-hidden="true">⌕</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="auth-input pl-9" /></div>; }
function Pagination({ meta, page, setPage }: { meta: PaginationMeta; page: number; setPage: (page: number) => void }) { if (meta.totalPages <= 1) return null; return <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><span className="data-mono text-[10px] text-white/30">Page {page} / {meta.totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">←</button><button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-white/10 px-3 py-2 text-xs disabled:opacity-30">→</button></div></div>; }
