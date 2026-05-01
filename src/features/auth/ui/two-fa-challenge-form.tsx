import { type SubmitEvent, useState } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useVerify2fa } from '@/features/auth/api/use-verify-2fa';

export function TwoFaChallengeForm() {
  const navigate = useNavigate();
  const { mutate: verify2fa, isPending, error } = useVerify2fa();
  const [otp, setOtp] = useState('');

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    verify2fa(otp, {
      onSuccess: () => void navigate({ to: '/' }),
      onError: err => {
        if (err.message === 'challenge_expired') {
          void navigate({ to: '/sign-in' });
        }
      },
    });
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
        <label htmlFor='otp' className='text-xs text-text-secondary'>
          Verification code
        </label>
        <input
          id='otp'
          type='text'
          required
          autoFocus
          disabled={isPending}
          inputMode='numeric'
          pattern='[0-9a-zA-Z]*'
          placeholder='123456'
          value={otp}
          onChange={e => setOtp(e.target.value)}
          className='rounded-md border border-border-subtle bg-bg-primary px-3 py-2 font-mono text-sm tracking-widest'
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
          {isPending ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </section>
  );
}
