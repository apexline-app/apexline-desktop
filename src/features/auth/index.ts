// Public API for the `auth` feature. Renderer-side imports must come
// through this barrel; main-side handler is registered explicitly via
// the `./main/handler` module from `src/main.ts` to avoid pulling
// renderer code (React UI) into the main-process bundle.

export { useAuthBootstrap, useAuthStore } from './model/use-auth-store';
export { SignInForm } from './ui/sign-in-form';
export { SignUpForm } from './ui/sign-up-form';
export { TwoFaChallengeForm } from './ui/two-fa-challenge-form';
export type { AuthCommands, AuthEvents, AuthState, User } from './contracts';
