import { type SubmitEvent, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useSignIn } from '@/features/auth/api/use-sign-in';
import { useStartGoogleLogin } from '@/features/auth/api/use-start-google-login';

export function SignInForm() {
  const navigate = useNavigate();
  const {
    mutate: signIn,
    isPending: signInPending,
    error: signInError,
  } = useSignIn();
  const {
    mutate: startGoogleLogin,
    isPending: googlePending,
    error: googleError,
  } = useStartGoogleLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const pending = signInPending || googlePending;
  const error = signInError?.message ?? googleError?.message ?? null;

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    signIn(
      { email, password },
      {
        onSuccess: ({ requires2fa }) => {
          void navigate({ to: requires2fa ? '/2fa-challenge' : '/' });
        },
      },
    );
  };

  const onGoogle = () => {
    if (pending) return;
    startGoogleLogin(undefined, {
      onSuccess: () => void navigate({ to: '/' }),
    });
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
          {signInPending ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          type='button'
          onClick={onGoogle}
          disabled={pending}
          className='rounded-md border border-border-subtle px-3 py-2 text-sm disabled:opacity-50'
        >
          {googlePending ? 'Opening browser…' : 'Sign in with Google'}
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
