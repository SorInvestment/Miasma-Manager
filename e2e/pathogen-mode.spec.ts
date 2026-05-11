import { test, expect } from '@playwright/test';

test.describe('pathogen mode', () => {
  test('selects pathogen mode, starts game, sees day advance', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-pathogen').click();
    await page.getByTestId('pathogen-virus').click();
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('dna-points')).toBeVisible();
    await page.getByTestId('speed-10').click();

    await expect.poll(async () => {
      const txt = await page.getByTestId('day-counter').innerText();
      const m = txt.match(/Day\s+(\d+)/);
      return m ? Number(m[1]) : 0;
    }, { timeout: 15_000 }).toBeGreaterThan(5);
  });

  test('opens mutation tree and shows DNA balance', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-button').click();
    await page.getByTestId('open-mutations').click();
    await expect(page.getByTestId('mutation-tree-modal')).toBeVisible();
    await expect(page.getByTestId('dna-balance')).toBeVisible();
    await page.getByTestId('close-mutations').click();
    await expect(page.getByTestId('mutation-tree-modal')).not.toBeVisible();
  });

  test('opens charts modal', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-button').click();
    await page.getByTestId('open-charts').click();
    await expect(page.getByTestId('charts-modal')).toBeVisible();
    await page.getByTestId('close-charts').click();
    await expect(page.getByTestId('charts-modal')).not.toBeVisible();
  });
});
