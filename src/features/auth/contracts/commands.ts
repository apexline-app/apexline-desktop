import type { AuthState } from '@/features/auth/contracts/auth-state';
import type { OkResponse } from '@/features/auth/contracts/ok-response';
import type {
  SignInInput,
  SignInResponse,
} from '@/features/auth/contracts/sign-in';
import type { SignUpInput } from '@/features/auth/contracts/sign-up';
import type { Verify2faInput } from '@/features/auth/contracts/verify-2fa';

export type AuthCommands = {
  'auth:sign-in': { request: SignInInput; response: SignInResponse };
  'auth:sign-up': { request: SignUpInput; response: OkResponse };
  'auth:verify-2fa': { request: Verify2faInput; response: OkResponse };
  'auth:start-google-login': { request: void; response: OkResponse };
  'auth:logout': { request: void; response: OkResponse };
  'auth:get-state': { request: void; response: AuthState };
  'auth:get-access-token': { request: void; response: string };
};

export type AuthEvents = {
  'auth:state-changed': AuthState;
};
