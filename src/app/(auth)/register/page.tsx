'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push('/dashboard');
      router.refresh();
      return;
    }

    setMessage('Compte créé. Un lien de confirmation vient d’être envoyé à votre adresse email.');
    setLoading(false);
  }

  return (
    <main className="auth-shell">
      <div className="auth-container">
        <div className="w-full animate-page-in">
          <Link href="/" className="data-mono mb-8 block text-center text-sm text-white/45 transition-colors duration-[240ms] hover:text-white">
            API<span className="text-[var(--electric)]">/</span>MONITOR
          </Link>
          <div className="auth-card">
            <div className="mb-8">
              <p className="data-mono mb-3 text-xs uppercase tracking-[0.18em] text-[var(--volt)]">Nouveau workspace</p>
              <h1 className="text-3xl font-bold tracking-tight">Créer un compte</h1>
              <p className="mt-2 text-sm leading-6 text-white/50">Commencez à surveiller vos APIs en quelques secondes.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/75">Email</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className="auth-input" />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/75">Mot de passe</label>
                <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="6 caractères minimum" className="auth-input" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-white/75">Confirmer le mot de passe</label>
                <input id="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="auth-input" />
              </div>

              {error && <p className="auth-alert-error">{error}</p>}
              {message && <p className="auth-alert-success">{message}</p>}

              <button disabled={loading} type="submit" className="auth-button">
                {loading ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-white/45">
              Déjà inscrit ?{' '}
              <Link href="/login" className="font-semibold text-[var(--electric)] transition-colors duration-[240ms] hover:text-white">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
