import { test, expect } from '@playwright/test';

test('full pathogen mode playthrough: start → spread → mutate → end', async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto('/');
  await page.getByTestId('mode-pathogen').click();
  await page.getByTestId('pathogen-virus').click();
  await page.getByTestId('pathogen-name').fill('SmokeVirus');
  await page.getByTestId('start-button').click();

  await expect(page.getByTestId('world-map')).toBeVisible();
  await expect(page.getByTestId('day-counter')).toBeVisible();

  await page.getByTestId('speed-5').click();
  await expect.poll(async () => {
    const txt = await page.getByTestId('day-counter').innerText();
    return Number(txt.match(/(\d+)/)?.[1] ?? 0);
  }, { timeout: 20_000 }).toBeGreaterThan(20);

  await page.getByTestId('speed-0').click();

  await page.getByTestId('open-mutations').click();
  await expect(page.getByTestId('mutation-tree-modal')).toBeVisible();

  await page.getByTestId('close-mutations').click();
  await expect(page.getByTestId('mutation-tree-modal')).not.toBeVisible();

  await page.getByTestId('open-charts').click();
  await expect(page.getByTestId('charts-modal')).toBeVisible();
  await page.getByTestId('close-charts').click();

  expect(consoleErrors.filter((e) => !e.includes('ResizeObserver')), `console errors: ${JSON.stringify(consoleErrors)}`).toHaveLength(0);
});

test('defender mode: deploy intervention end-to-end', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.getByTestId('mode-defender').click();
  await page.getByTestId('start-button').click();

  await expect(page.getByTestId('budget')).toBeVisible();
  await page.getByTestId('speed-5').click();
  await page.waitForTimeout(2500);
  await page.getByTestId('speed-0').click();

  await page.getByTestId('open-interventions').click();
  await expect(page.getByTestId('intervention-modal')).toBeVisible();
  await page.getByTestId('intervention-public-info').click();
  await page.getByTestId('close-interventions').click();
});
