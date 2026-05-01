import { useMutation } from '@tanstack/react-query';

const verify2fa = (otp: string) =>
  window.api.invoke('auth:verify-2fa', { otp });

export const useVerify2fa = () => useMutation({ mutationFn: verify2fa });
