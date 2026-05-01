import { z } from '@/shared/ipc/validation';

export const UserSchema = z.object({
  pid: z.string(),
  email: z.email(),
  nickname: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const AuthStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('unauthenticated') }),
  z.object({ status: z.literal('awaiting-2fa') }),
  z.object({ status: z.literal('authenticated'), user: UserSchema }),
]);
export type AuthState = z.infer<typeof AuthStateSchema>;

export const SignInInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const SignUpInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  nickname: z.string().min(3).max(30),
});

export const Verify2faInputSchema = z.object({
  otp: z.string().min(6).max(20),
});

export const SignInResponseSchema = z.object({
  ok: z.literal(true),
  requires2fa: z.boolean(),
});

export const OkResponseSchema = z.object({
  ok: z.literal(true),
});

export type AuthCommands = {
  'auth:sign-in': {
    request: z.infer<typeof SignInInputSchema>;
    response: z.infer<typeof SignInResponseSchema>;
  };
  'auth:sign-up': {
    request: z.infer<typeof SignUpInputSchema>;
    response: z.infer<typeof OkResponseSchema>;
  };
  'auth:verify-2fa': {
    request: z.infer<typeof Verify2faInputSchema>;
    response: z.infer<typeof OkResponseSchema>;
  };
  'auth:start-google-login': {
    request: void;
    response: z.infer<typeof OkResponseSchema>;
  };
  'auth:logout': {
    request: void;
    response: z.infer<typeof OkResponseSchema>;
  };
  'auth:get-state': {
    request: void;
    response: AuthState;
  };
  'auth:get-access-token': {
    request: void;
    response: string;
  };
};

export type AuthEvents = {
  'auth:state-changed': AuthState;
};
