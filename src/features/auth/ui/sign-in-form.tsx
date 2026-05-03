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

import { useSignIn } from '@/features/auth/api/use-sign-in';
import { useStartGoogleLogin } from '@/features/auth/api/use-start-google-login';
import { type SignInInput, SignInInputSchema } from '@/features/auth/contracts';

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

  const form = useForm<SignInInput>({
    resolver: zodResolver(SignInInputSchema),
    defaultValues: { email: '', password: '' },
  });

  const pending = signInPending || googlePending;
  const error = signInError?.message ?? googleError?.message ?? null;

  const onSubmit = ({ email, password }: SignInInput) => {
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
      <div className='flex w-80 flex-col gap-4 rounded-md border border-border-subtle bg-bg-secondary p-6'>
        <h2 className='font-display text-xl text-text-primary'>Sign in</h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='you@example.com'
                      disabled={pending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='••••••••'
                      disabled={pending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert tone='error'>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type='submit' disabled={pending} className='w-full'>
              {signInPending && <Spinner className='mr-2 h-4 w-4' />}
              {signInPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Form>

        <Button
          variant='secondary'
          disabled={pending}
          onClick={onGoogle}
          className='w-full'
        >
          {googlePending && <Spinner className='mr-2 h-4 w-4' />}
          {googlePending ? 'Opening browser…' : 'Sign in with Google'}
        </Button>

        <Button
          variant='ghost'
          className='w-full'
          onClick={() => void navigate({ to: '/sign-up' })}
        >
          Create account
        </Button>
      </div>
    </section>
  );
}
