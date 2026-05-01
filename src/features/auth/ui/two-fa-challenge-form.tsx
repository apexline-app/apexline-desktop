import { type FormEvent, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useAuthStore } from '@/features/auth/model/use-auth-store';

export function TwoFaChallengeForm() {
  const navigate = useNavigate();
  const verify2fa = useAuthStore(s => s.verify2fa);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await verify2fa(otp);
      void navigate({ to: '/' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'verification failed';
      setError(msg);
      if (msg === 'challenge_expired') {
        void navigate({ to: '/sign-in' });
      }
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
        <h2 className='font-display text-xl text-text-primary'>
          Two-factor verification
        </h2>
        <p className='text-xs text-text-tertiary'>
          Enter the code from your authenticator app or a backup code.
        </p>
        <input
          type='text'
          required
          autoFocus
          inputMode='numeric'
          pattern='[0-9a-zA-Z]*'
          placeholder='123456'
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 font-mono text-sm tracking-widest'
        />
        {error && <p className='text-xs text-danger-text'>{error}</p>}
        <button
          type='submit'
          disabled={pending}
          className='rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-bg-primary disabled:opacity-50'
        >
          {pending ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </section>
  );
}
