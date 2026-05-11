import { test, expect } from '@playwright/test';

test.describe('defender mode', () => {
  test('selects defender mode and sees budget', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-defender').click();
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('budget')).toBeVisible();
  });

  test('opens interventions modal', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-defender').click();
    await page.getByTestId('start-button').click();
    await page.getByTestId('open-interventions').click();
    await expect(page.getByTestId('intervention-modal')).toBeVisible();
    await expect(page.getByTestId('intervention-public-info')).toBeVisible();
    await page.getByTestId('close-interventions').click();
    await expect(page.getByTestId('intervention-modal')).not.toBeVisible();
  });

  test('budget grows over time at fast speeds', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('mode-defender').click();
    await page.getByTestId('start-button').click();
    const initial = await page.getByTestId('budget').innerText();
    await page.getByTestId('speed-10').click();
    await page.waitForTimeout(3000);
    await page.getByTestId('speed-0').click();
    const after = await page.getByTestId('budget').innerText();
    const initialVal = parseFloat(initial.replace(/[^0-9.]/g, ''));
    const afterVal = parseFloat(after.replace(/[^0-9.]/g, ''));
    expect(afterVal).toBeGreaterThan(initialVal);
  });
});
