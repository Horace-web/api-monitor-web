'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function completeSignIn() {
      const code = searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (active) setError(exchangeError.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/dashboard');
        router.refresh();
        return;
      }

      if (active) setError('La confirmation a réussi, mais aucune session n’a été trouvée.');
    }

    completeSignIn();
    return () => {
      active = false;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--ink)] px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-[var(--flare)]/20 bg-[var(--ink-card)] p-8 text-center shadow-2xl">
          <p className="data-mono text-xs uppercase tracking-[0.18em] text-[var(--flare)]">Confirmation</p>
          <h1 className="mt-3 text-2xl font-bold">Impossible de terminer la connexion</h1>
          <p className="mt-3 text-sm leading-6 text-white/50">{error}</p>
          <button onClick={() => router.replace('/login')} className="mt-6 rounded-xl bg-[var(--electric)] px-5 py-3 text-sm font-bold text-white transition-transform duration-[120ms] hover:-translate-y-0.5">Retour à la connexion</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--ink)] text-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[var(--electric)]" />
        <p className="data-mono mt-5 text-xs text-white/40">CONFIRMATION…</p>
      </div>
    </main>
  );
}
