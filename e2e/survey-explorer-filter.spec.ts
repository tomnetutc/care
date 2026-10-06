/* eslint-disable */
// Playwright spec (lives outside src/, see the note at the top of scenario.spec.ts).
import { test, expect, Page } from '@playwright/test';

/**
 * Survey Explorer -> "Extreme Event Module" filter (Irfan, 2026-10-02 meeting).
 *
 * A respondent "responded to the module" for an event when ext_<event>_impact_wlb is not -9. Numbers below
 * were recomputed straight from public/df_dashboard.csv (5,082 respondents; a respondent answers 0, 1 or 2
 * modules, so ticking two events is "answered at least one", not a sum: heat 2,650 + cold 2,430 - both
 * 1,056 = 4,024).
 */
const TOTAL = '5,082';
const HEAT = '2,650';
const HEAT_OR_COLD = '4,024';
const ANY_MODULE = '4,778'; // 5,082 minus the 304 who answered no module

async function openPalette(page: Page) {
  await page.goto('/#/sample-characteristics');
  const trigger = page.locator('.filter-trigger-btn');
  await expect(trigger).toBeVisible({ timeout: 30_000 });
  await trigger.click();
  const count = page.locator('.modal-respondent-count');
  await expect(count).toHaveText(`Showing ${TOTAL} respondents`, { timeout: 30_000 });
  const col = page.locator('.dim-column').filter({ hasText: 'Extreme Event Module' });
  await expect(col).toHaveCount(1);
  return { col, count };
}

test('Extreme Event Module lists the five events and starts with all of them ticked (no filter)', async ({ page }) => {
  const { col } = await openPalette(page);
  await expect(col.locator('.dim-option')).toHaveText(['Heat', 'Cold', 'Flooding', 'Earthquake', 'Power outage']);
  for (const box of await col.locator('input[type=checkbox]').all()) await expect(box).toBeChecked();
});

test('Ticking one event keeps only respondents who answered that module; the charts agree with the palette count', async ({ page }) => {
  const { col, count } = await openPalette(page);

  await col.getByRole('button', { name: 'None' }).click();
  await expect(count).toHaveText(`Filtered: 0 of ${TOTAL} respondents`);

  await col.locator('label.dim-option', { hasText: 'Heat' }).click();
  await expect(count).toHaveText(`Filtered: ${HEAT} of ${TOTAL} respondents`);

  // Two events = answered at least one of them (overlap is not double counted).
  await col.locator('label.dim-option', { hasText: 'Cold' }).click();
  await expect(count).toHaveText(`Filtered: ${HEAT_OR_COLD} of ${TOTAL} respondents`);
  await col.locator('label.dim-option', { hasText: 'Cold' }).click();
  await expect(count).toHaveText(`Filtered: ${HEAT} of ${TOTAL} respondents`);

  // The real chart hooks (separate copies of the predicate) report the same respondent count.
  await page.getByRole('button', { name: /Done/ }).click();
  await expect(page.getByText(`Number of respondents: ${HEAT}`).first()).toBeVisible();
  await expect(page.locator('.chip-strip')).toContainText('Extreme Event Module: 1 of 5 selected');
});

test('Ticking all five events is no filter at all; Reset brings every respondent back', async ({ page }) => {
  const { col, count } = await openPalette(page);

  await col.getByRole('button', { name: 'None' }).click();
  for (const name of ['Heat', 'Cold', 'Flooding', 'Earthquake', 'Power outage']) {
    await col.locator('label.dim-option', { hasText: name }).click();
  }
  // Back to "all ticked" is normalised to no filter, so the 304 respondents with no module come back too.
  await expect(count).toHaveText(`Showing ${TOTAL} respondents`);
  await expect(page.locator('.chip-strip')).toHaveCount(0);

  // Four of five ticked excludes those who answered none (and those who answered only the unticked event).
  await col.locator('label.dim-option', { hasText: 'Power outage' }).click();
  await expect(count).not.toHaveText(`Showing ${TOTAL} respondents`);

  await page.getByRole('button', { name: 'Reset all' }).click();
  await expect(count).toHaveText(`Showing ${TOTAL} respondents`);
  await expect(col.locator('input[type=checkbox]:not(:checked)')).toHaveCount(0);
});

test('Extreme Event Module combines with another segment (AND across dimensions)', async ({ page }) => {
  const { col, count } = await openPalette(page);
  await col.getByRole('button', { name: 'None' }).click();
  await col.locator('label.dim-option', { hasText: 'Heat' }).click();

  const gender = page.locator('.dim-column').filter({ hasText: 'Gender' }).first();
  await gender.locator('label.dim-option', { hasText: 'Female' }).click(); // untick Female -> Male + Other
  // Heat-module respondents who are Male (1,072) or Other / Prefer not to answer (7 + 2) = 1,081.
  await expect(count).toHaveText(`Filtered: 1,081 of ${TOTAL} respondents`);
});
