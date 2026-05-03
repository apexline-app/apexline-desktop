import {
  Alert,
  AlertDescription,
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Spinner,
} from '@apexline-app/apr';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';

import { useVerify2fa } from '@/features/auth/api/use-verify-2fa';
import {
  type Verify2faInput,
  Verify2faInputSchema,
} from '@/features/auth/contracts';

export function TwoFaChallengeForm() {
  const navigate = useNavigate();
  const { mutate: verify2fa, isPending, error } = useVerify2fa();

  const form = useForm<Verify2faInput>({
    resolver: zodResolver(Verify2faInputSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = ({ otp }: Verify2faInput) => {
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
      <div className='flex w-80 flex-col gap-4 rounded-md border border-border-subtle bg-bg-secondary p-6'>
        <h2 className='font-display text-xl text-text-primary'>
          Two-factor verification
        </h2>
        <p className='text-sm text-text-tertiary'>
          Enter the code from your authenticator app or a backup code.
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='otp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      inputMode='numeric'
                      placeholder='123456'
                      disabled={isPending}
                      className='font-mono tracking-widest'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert tone='error'>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending && <Spinner className='mr-2 h-4 w-4' />}
              {isPending ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
