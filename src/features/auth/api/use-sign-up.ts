import { useMutation } from '@tanstack/react-query';

import type { SignUpInput } from '@/features/auth/contracts';

const signUp = (input: SignUpInput) => window.api.invoke('auth:sign-up', input);

/**
 * Devise registerable. After success the user must sign in separately
 * (no auto-login — Devise confirmable may require email confirmation).
 */
export const useSignUp = () => useMutation({ mutationFn: signUp });
