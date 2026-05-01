import { _electron as electron, expect, test } from '@playwright/test';

test('main window opens with the Apexline app shell visible', async () => {
  const app = await electron.launch({ args: ['.'] });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  await expect(window).toHaveTitle('Apexline');

  const banner = window.getByRole('banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Apexline');

  const nav = window.getByRole('navigation', { name: 'Primary' });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Onboarding' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Settings' })).toBeVisible();
  await expect(nav.getByRole('link', { name: "What's new" })).toBeVisible();

  const pitWall = nav.locator('[aria-disabled="true"]');
  await expect(pitWall).toBeVisible();
  await expect(pitWall).toContainText('Pit Wall');
  await expect(pitWall).toContainText('soon');

  await expect(
    window.getByRole('heading', { name: 'Dashboard' }),
  ).toBeVisible();

  await app.close();
});
