import { createFileRoute } from '@tanstack/react-router';

import { TwoFaChallengeForm } from '@/features/auth';

export const Route = createFileRoute('/2fa-challenge')({
  component: TwoFaChallengeForm,
});
