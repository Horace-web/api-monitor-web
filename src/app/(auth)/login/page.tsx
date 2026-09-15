'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(''); setLoading(true); const { error: signInError } = await supabase.auth.signInWithPassword({ email, password }); if (signInError) { setError(signInError.message); setLoading(false); return; } router.push('/dashboard'); router.refresh(); }
  return <main className="auth-shell"><div className="auth-container"><div className="w-full animate-page-in"><Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white">← Retour à l'accueil</Link><Link href="/" className="data-mono mb-7 block text-center text-sm font-bold">API<span className="text-[var(--electric)]">/</span>MONITOR</Link><div className="auth-card"><div className="mb-8"><p className="data-mono mb-3 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Accès sécurisé</p><h1 className="text-3xl font-bold tracking-tight">Connexion</h1><p className="mt-2 text-sm leading-6 text-white/50">Accédez à vos services et monitors.</p></div><form onSubmit={handleSubmit} className="space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-white/75">Email</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="auth-input" /></div><div><label htmlFor="password" className="mb-2 block text-sm font-medium text-white/75">Mot de passe</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="auth-input" /></div>{error && <p className="auth-alert-error">{error}</p>}<button disabled={loading} type="submit" className="auth-button">{loading ? 'Connexion…' : 'Se connecter'}</button></form><p className="mt-7 text-center text-sm text-white/45">Pas encore de compte ? <Link href="/register" className="font-semibold text-[var(--electric)] hover:text-white">Créer un compte</Link></p></div></div></div></main>;
}
