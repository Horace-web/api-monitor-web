'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const items = [
  { href: '/dashboard', label: 'Vue générale', icon: '⌂' },
  { href: '/dashboard/monitors', label: 'Monitors', icon: '◉' },
  { href: '/dashboard/services', label: 'Services', icon: '▦' },
  { href: '/dashboard/alerts', label: 'Alertes', icon: '!' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter();
  async function logout() { await supabase.auth.signOut(); router.push('/'); router.refresh(); }
  return <div className="min-h-screen bg-[var(--ink)] text-white">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/[0.07] bg-[#0a0e18] lg:flex lg:flex-col"><div className="border-b border-white/[0.07] px-6 py-6"><Link href="/dashboard" className="data-mono text-sm font-bold tracking-tight">API<span className="text-[var(--electric)]">/</span>MONITOR</Link><p className="mt-2 text-xs text-white/30">Monitoring workspace</p></div><nav className="flex-1 space-y-1 p-4">{items.map((item) => { const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-[240ms] ${active ? 'bg-[var(--electric)]/12 text-white ring-1 ring-[var(--electric)]/20' : 'text-white/45 hover:bg-white/[0.04] hover:text-white'}`}><span className={`grid h-7 w-7 place-items-center rounded-md text-xs ${active ? 'bg-[var(--electric)]/15 text-[var(--electric)]' : 'bg-white/[0.04] text-white/40'}`}>{item.icon}</span>{item.label}</Link>; })}</nav><div className="border-t border-white/[0.07] p-4"><button onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-white/40 transition-colors hover:bg-[var(--flare)]/10 hover:text-[var(--flare)]">Déconnexion</button></div></aside>
    <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[var(--ink)]/95 px-4 py-3 backdrop-blur lg:hidden"><div className="flex items-center gap-3 overflow-x-auto"><Link href="/dashboard" className="data-mono shrink-0 text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</Link><div className="h-5 w-px shrink-0 bg-white/10" />{items.map((item) => { const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs ${active ? 'bg-[var(--electric)]/15 text-white' : 'text-white/45'}`}>{item.label}</Link>; })}</div></header>
    <main className="min-w-0 lg:ml-64">{children}</main>
  </div>;
}
