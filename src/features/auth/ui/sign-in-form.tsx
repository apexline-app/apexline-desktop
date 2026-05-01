import { type FormEvent, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useAuthStore } from '@/features/auth/model/use-auth-store';

export function SignInForm() {
  const navigate = useNavigate();
  const signIn = useAuthStore(s => s.signIn);
  const startGoogleLogin = useAuthStore(s => s.startGoogleLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      const { requires2fa } = await signIn({ email, password });
      if (requires2fa) {
        void navigate({ to: '/2fa-challenge' });
      } else {
        void navigate({ to: '/' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'sign-in failed');
    } finally {
      setPending(false);
    }
  };

  const onGoogle = async () => {
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await startGoogleLogin();
      void navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'google login failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className='flex h-full items-center justify-center'>
      <form
        onSubmit={onSubmit}
        className='flex w-80 flex-col gap-4 rounded-md border border-border-subtle bg-bg-secondary p-6'
      >
        <h2 className='font-display text-xl text-text-primary'>Sign in</h2>
        <p className='text-xs text-text-tertiary'>
          Placeholder form — wired to IPC. apr 0.2.0 will replace these inputs.
        </p>
        <label htmlFor='sign-in-email' className='sr-only'>
          Email
        </label>
        <input
          id='sign-in-email'
          type='email'
          required
          disabled={pending}
          placeholder='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm'
        />
        <label htmlFor='sign-in-password' className='sr-only'>
          Password
        </label>
        <input
          id='sign-in-password'
          type='password'
          required
          disabled={pending}
          placeholder='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm'
        />
        {error && (
          <p role='alert' className='text-xs text-danger-text'>
            {error}
          </p>
        )}
        <button
          type='submit'
          disabled={pending}
          className='rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-bg-primary disabled:opacity-50'
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          type='button'
          onClick={onGoogle}
          disabled={pending}
          className='rounded-md border border-border-subtle px-3 py-2 text-sm disabled:opacity-50'
        >
          Sign in with Google
        </button>
        <a
          href='/sign-up'
          onClick={e => {
            e.preventDefault();
            void navigate({ to: '/sign-up' });
          }}
          className='text-center text-xs text-text-tertiary hover:text-text-secondary'
        >
          Create account
        </a>
      </form>
    </section>
  );
}
