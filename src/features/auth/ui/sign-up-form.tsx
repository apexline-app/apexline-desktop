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

import { useSignUp } from '@/features/auth/api/use-sign-up';
import { type SignUpInput, SignUpInputSchema } from '@/features/auth/contracts';

export function SignUpForm() {
  const navigate = useNavigate();
  const { mutate: signUp, isPending, error } = useSignUp();

  const form = useForm<SignUpInput>({
    resolver: zodResolver(SignUpInputSchema),
    defaultValues: { email: '', password: '', nickname: '' },
  });

  const onSubmit = (input: SignUpInput) => {
    if (isPending) return;
    signUp(input, {
      onSuccess: () => void navigate({ to: '/sign-in' }),
    });
  };

  return (
    <section className='flex h-full items-center justify-center'>
      <div className='flex w-80 flex-col gap-4 rounded-md border border-border-subtle bg-bg-secondary p-6'>
        <h2 className='font-display text-xl text-text-primary'>
          Create account
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-4'
          >
            <FormField
              control={form.control}
              name='nickname'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='racer42'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={isPending}
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
                      placeholder='min 8 characters'
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant='destructive'>
                <AlertDescription>{error.message}</AlertDescription>
              </Alert>
            )}

            <Button
              variant='default'
              type='submit'
              disabled={isPending}
              className='w-full'
            >
              {isPending && <Spinner className='mr-2 h-4 w-4' />}
              {isPending ? 'Creating…' : 'Create account'}
            </Button>
          </form>
        </Form>

        <Button
          variant='link'
          className='w-full'
          onClick={() => void navigate({ to: '/sign-in' })}
        >
          Already have an account? Sign in
        </Button>
      </div>
    </section>
  );
}
