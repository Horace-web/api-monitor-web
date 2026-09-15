'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const features = [
  { label: 'UPTIME', value: '99.9%', tone: 'text-[var(--volt)]' },
  { label: 'CHECKS', value: '60s', tone: 'text-[var(--electric)]' },
  { label: 'HTTP', value: 'GET', tone: 'text-[var(--solar)]' },
];

export default function Home() {
  const router = useRouter();
  useEffect(() => { supabase.auth.getSession().then(({ data }) => { if (data.session) router.replace('/dashboard'); }); }, [router]);

  return <main className="h-[100svh] overflow-hidden bg-[var(--ink)] text-white"><div className="mx-auto flex h-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-6">
    <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] pb-4 sm:pb-5"><Link href="/" className="data-mono text-sm font-bold tracking-tight">API<span className="text-[var(--electric)]">/</span>MONITOR</Link><nav className="flex items-center gap-1 text-sm sm:gap-3"><Link href="/login" className="rounded-lg px-3 py-2 text-white/55 hover:text-white">Connexion</Link><Link href="/register" className="rounded-lg bg-[var(--electric)] px-3 py-2 font-semibold hover:bg-[#315ee0] sm:px-4">Créer un compte</Link></nav></header>
    <section className="relative flex min-h-0 flex-1 items-center py-8 sm:py-10"><div className="pointer-events-none absolute -right-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[var(--electric)]/10 blur-3xl" /><div className="relative max-w-4xl animate-page-in"><div className="data-mono mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--volt)]/20 bg-[var(--volt)]/5 px-3 py-1.5 text-[10px] text-[var(--volt)] sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" /> SYSTEM OPERATIONAL</div><h1 className="max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Know when your API<span className="block text-[var(--electric)]">goes down.</span></h1><p className="mt-5 max-w-2xl text-sm leading-6 text-white/50 sm:mt-6 sm:text-lg sm:leading-7">Surveillez vos endpoints, mesurez leurs temps de réponse et construisez un historique fiable de leur disponibilité.</p><div className="mt-6 flex flex-wrap gap-3 sm:mt-8"><Link href="/register" className="rounded-xl bg-[var(--electric)] px-5 py-3 text-sm font-bold hover:-translate-y-0.5 hover:bg-[#315ee0]">Créer mon espace</Link><Link href="/login" className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white">Se connecter</Link></div></div></section>
    <section className="grid shrink-0 grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:rounded-2xl">{features.map((feature) => <div key={feature.label} className="bg-[var(--ink)] px-3 py-3 sm:px-6 sm:py-4"><p className="data-mono text-[9px] tracking-[0.16em] text-white/30 sm:text-[10px]">{feature.label}</p><p className={`data-mono mt-1 text-base font-bold sm:mt-2 sm:text-xl ${feature.tone}`}>{feature.value}</p></div>)}</section>
  </div></main>;
}
