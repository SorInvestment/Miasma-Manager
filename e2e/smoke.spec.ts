import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('app loads at /', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('MIASMA MANAGER')).toBeVisible();
  });

  test('start screen shows both modes and pathogen options', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('mode-pathogen')).toBeVisible();
    await expect(page.getByTestId('mode-defender')).toBeVisible();
    await expect(page.getByTestId('pathogen-virus')).toBeVisible();
    await expect(page.getByTestId('pathogen-bacteria')).toBeVisible();
    await expect(page.getByTestId('pathogen-fungus')).toBeVisible();
  });

  test('clicking start enters the game and shows the top bar', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('game-title')).toBeVisible();
    await expect(page.getByTestId('day-counter')).toBeVisible();
    await expect(page.getByTestId('world-map')).toBeVisible();
  });
});
