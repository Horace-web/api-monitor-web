'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[var(--ink)] px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full animate-page-in">
          <Link href="/" className="data-mono mb-8 block text-center text-sm text-white/45 transition-colors duration-[240ms] hover:text-white">
            API<span className="text-[var(--electric)]">/</span>MONITOR
          </Link>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-7 shadow-2xl shadow-black/20 sm:p-8">
            <div className="mb-8">
              <p className="data-mono mb-3 text-xs uppercase tracking-[0.18em] text-[var(--electric)]">Accès sécurisé</p>
              <h1 className="text-3xl font-bold tracking-tight">Connexion</h1>
              <p className="mt-2 text-sm leading-6 text-white/50">Accédez à vos services et monitors.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/75">Email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition-all duration-[240ms] placeholder:text-white/25 focus:border-[var(--electric)] focus:ring-2 focus:ring-[var(--electric)]/15" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/75">Mot de passe</label>
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none transition-all duration-[240ms] placeholder:text-white/25 focus:border-[var(--electric)] focus:ring-2 focus:ring-[var(--electric)]/15" />
              </div>

              {error && <p className="rounded-xl border border-[var(--flare)]/20 bg-[var(--flare)]/10 px-4 py-3 text-sm text-[var(--flare)]">{error}</p>}

              <button disabled={loading} type="submit" className="w-full rounded-xl bg-[var(--electric)] px-4 py-3 text-sm font-bold text-white transition-all duration-[120ms] hover:-translate-y-0.5 hover:bg-[#315ee0] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-white/45">
              Pas encore de compte ?{' '}
              <Link href="/register" className="font-semibold text-[var(--electric)] transition-colors duration-[240ms] hover:text-white">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
