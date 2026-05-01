import { _electron as electron, expect, test } from '@playwright/test';

test('main window opens on sign-in route when unauthenticated', async () => {
  const app = await electron.launch({ args: ['.'] });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  await expect(window).toHaveTitle('Apexline');

  const banner = window.getByRole('banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Apexline');

  // Fresh launch without refresh token in safeStorage → router redirects
  // to /sign-in. Sidebar nav is hidden on public routes (sign-in / sign-up
  // / 2fa-challenge) — only banner + form are rendered.
  await expect(window.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await expect(window.getByLabel('Email')).toBeVisible();
  await expect(window.getByLabel('Password')).toBeVisible();
  await expect(
    window.getByRole('button', { name: 'Sign in', exact: true }),
  ).toBeVisible();
  await expect(
    window.getByRole('button', { name: 'Sign in with Google' }),
  ).toBeVisible();
  await expect(
    window.getByRole('button', { name: 'Create account' }),
  ).toBeVisible();

  // Authenticated-only sidebar should NOT be present pre-auth.
  await expect(window.getByRole('navigation', { name: 'Primary' })).toHaveCount(
    0,
  );

  await app.close();
});
