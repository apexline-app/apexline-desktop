import { type SubmitEvent, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useSignUp } from '@/features/auth/api/use-sign-up';

export function SignUpForm() {
  const navigate = useNavigate();
  const { mutate: signUp, isPending, error } = useSignUp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    signUp(
      { email, password, nickname },
      {
        onSuccess: () => void navigate({ to: '/sign-in' }),
      },
    );
  };

  return (
    <section className='flex h-full items-center justify-center'>
      <form
        onSubmit={onSubmit}
        className='flex w-80 flex-col gap-4 rounded-md border border-border-subtle bg-bg-secondary p-6'
      >
        <h2 className='font-display text-xl text-text-primary'>
          Create account
        </h2>
        <p className='text-xs text-text-tertiary'>
          Placeholder form — wired to IPC. apr 0.2.0 will replace these inputs.
        </p>
        <label htmlFor='sign-up-nickname' className='sr-only'>
          Nickname
        </label>
        <input
          id='sign-up-nickname'
          type='text'
          required
          disabled={isPending}
          minLength={3}
          maxLength={30}
          placeholder='nickname'
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm'
        />
        <label htmlFor='sign-up-email' className='sr-only'>
          Email
        </label>
        <input
          id='sign-up-email'
          type='email'
          required
          disabled={isPending}
          placeholder='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm'
        />
        <label htmlFor='sign-up-password' className='sr-only'>
          Password
        </label>
        <input
          id='sign-up-password'
          type='password'
          required
          disabled={isPending}
          minLength={8}
          placeholder='password (min 8)'
          value={password}
          onChange={e => setPassword(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 text-sm'
        />
        {error && (
          <p role='alert' className='text-xs text-danger-text'>
            {error.message}
          </p>
        )}
        <button
          type='submit'
          disabled={isPending}
          className='rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-bg-primary disabled:opacity-50'
        >
          {isPending ? 'Creating…' : 'Create account'}
        </button>
        <a
          href='/sign-in'
          onClick={e => {
            e.preventDefault();
            void navigate({ to: '/sign-in' });
          }}
          className='text-center text-xs text-text-tertiary hover:text-text-secondary'
        >
          Already have an account? Sign in
        </a>
      </form>
    </section>
  );
}
