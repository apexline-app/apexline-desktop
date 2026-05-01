import { useMutation } from '@tanstack/react-query';

import type { SignUpInput } from '@/features/auth/contracts';

const signUp = (input: SignUpInput) => window.api.invoke('auth:sign-up', input);

export const useSignUp = () => useMutation({ mutationFn: signUp });
