import { createFileRoute } from '@tanstack/react-router';

import { SignInForm } from '@/features/auth';

export const Route = createFileRoute('/sign-in')({
  component: SignInForm,
});
