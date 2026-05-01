import { useMutation, useQueryClient } from '@tanstack/react-query';

const logout = () => window.api.invoke('auth:logout', undefined);

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => qc.clear(),
  });
};
