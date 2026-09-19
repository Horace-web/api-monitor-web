'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const items = [
  { href: '/dashboard', label: 'Vue générale', icon: '⌂' },
  { href: '/dashboard/monitors', label: 'Monitors', icon: '◉' },
  { href: '/dashboard/services', label: 'Services', icon: '▦' },
  { href: '/dashboard/alerts', label: 'Alertes', icon: '!' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMenuOpen(false), [pathname]);
  async function logout() { await supabase.auth.signOut(); router.push('/'); router.refresh(); }
  const isActive = (href: string) => href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[var(--ink)] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#0a0e18] lg:flex lg:flex-col">
        <div className="border-b border-white/[0.07] px-6 py-6">
          <Link href="/dashboard" className="data-mono text-sm font-bold tracking-tight">API<span className="text-[var(--electric)]">/</span>MONITOR</Link>
          <p className="mt-2 text-xs text-white/30">Monitoring workspace</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-[240ms] ${isActive(item.href) ? 'bg-[var(--electric)]/12 text-white ring-1 ring-[var(--electric)]/20' : 'text-white/45 hover:bg-white/[0.04] hover:text-white'}`}>
                <span className={`grid h-7 w-7 place-items-center rounded-md text-xs ${isActive(item.href) ? 'bg-[var(--electric)]/15 text-[var(--electric)]' : 'bg-white/[0.04] text-white/40'}`}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        <div className="border-t border-white/[0.07] p-4">
          <button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/40 transition-colors hover:bg-[var(--flare)]/10 hover:text-[var(--flare)]">Déconnexion</button>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[var(--ink)]/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <button type="button" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.025] text-white/70 transition hover:border-white/15 hover:text-white lg:hidden">
            {menuOpen ? <span className="text-xl leading-none">×</span> : <span className="space-y-1"><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /><span className="block h-px w-4 bg-current" /></span>}
          </button>
          <div className="ml-auto text-right">
            <Link href="/dashboard" className="data-mono text-sm font-bold tracking-tight">API<span className="text-[var(--electric)]">/</span>MONITOR</Link>
            <p className="hidden text-[9px] text-white/25 sm:block">Monitoring workspace</p>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <button aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-30 bg-black/45 lg:hidden" />
          <div className="fixed left-3 right-3 top-[4.25rem] z-40 rounded-2xl border border-white/[0.08] bg-[#0a0e18] p-2 shadow-2xl lg:hidden">
            <nav className="space-y-1">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive(item.href) ? 'bg-[var(--electric)]/12 text-white ring-1 ring-[var(--electric)]/20' : 'text-white/55 hover:bg-white/[0.04] hover:text-white'}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-lg text-xs ${isActive(item.href) ? 'bg-[var(--electric)]/15 text-[var(--electric)]' : 'bg-white/[0.04] text-white/40'}`}>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-2 border-t border-white/[0.07] pt-2">
              <button onClick={logout} className="w-full rounded-xl px-3 py-3 text-left text-sm text-white/45 hover:bg-[var(--flare)]/10 hover:text-[var(--flare)]">Déconnexion</button>
            </div>
          </div>
        </>
      )}

      <main className="min-w-0 lg:ml-64">{children}</main>
    </div>
  );
}
