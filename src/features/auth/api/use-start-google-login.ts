import { useMutation } from '@tanstack/react-query';

const startGoogleLogin = () =>
  window.api.invoke('auth:start-google-login', undefined);

export const useStartGoogleLogin = () =>
  useMutation({ mutationFn: startGoogleLogin });
