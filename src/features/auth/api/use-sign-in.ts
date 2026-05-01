import { useMutation } from '@tanstack/react-query';

import type { SignInInput } from '@/features/auth/contracts';

const signIn = async (input: SignInInput) => {
  const result = await window.api.invoke('auth:sign-in', input);
  return { requires2fa: result.requires2fa };
};

export const useSignIn = () => useMutation({ mutationFn: signIn });
