import { _electron as electron, expect, test } from '@playwright/test';

test('main window opens with the Apexline app shell visible', async () => {
  const app = await electron.launch({ args: ['.'] });

  const window = await app.firstWindow();
  await window.waitForLoadState('domcontentloaded');

  await expect(window.getByRole('heading', { name: 'Apexline' })).toBeVisible();

  await app.close();
});
