/* eslint-disable */
// This is a Playwright spec, not a CRA/Jest/Testing-Library test - it lives
// outside src/ and is never linted by react-scripts build/start/test. The
// disable above just silences false positives if someone runs a bare `eslint`
// across the whole repo, since package.json's eslintConfig (react-app/jest)
// otherwise misapplies Testing-Library/Jest rules to Playwright's page/expect API.
import { test, expect, Page } from '@playwright/test';

/**
 * Smoke test for the live Scenario Analysis page (/#/scenario, HashRouter).
 * Exercises the real app against the real public/df_output.csv and
 * public/models/model_coeffs_by_event.json served by the dev server - no
 * mocked network responses. For each of the 5 events, selects two different
 * severity level pairs and checks:
 *   (a) no console errors
 *   (b) the number of rendered activity bars matches EVENT_ACTIVITY_COVERAGE
 *   (c) every rendered ATE value is a finite number
 * A screenshot is saved per event under e2e/screenshots/ as a reviewable
 * artifact, independent of the assertions.
 *
 * Screenshot scope: body/#root are set to `height: 100vh; overflow-y: auto`
 * (see src/App.css), so the page scrolls inside #root rather than the
 * document growing. Two consequences, both handled below:
 *  1. `page.screenshot({ fullPage: true })` only measures the document's
 *     scrollHeight and misses everything below the first viewport.
 *  2. Less obviously, `locator.screenshot()` on an element taller than the
 *     viewport does not reliably stitch/capture the part that lives inside a
 *     nested overflow:auto ancestor (#root) rather than genuine document
 *     overflow - the region beyond the current viewport comes back blank
 *     even though the returned image has the correct full element height.
 * The fix used here sidesteps both: since #root's height is `100vh`, growing
 * the actual browser viewport to fit the whole card makes #root tall enough
 * that nothing needs to scroll at all, so a single rendered frame already
 * contains everything and an element-scoped screenshot captures it correctly.
 */

interface EventCase {
  buttonLabel: string;
  expectedActivityCount: number;
}

// Mirrors src/lib/engine/eventConfig.ts's EVENT_ACTIVITY_COVERAGE counts.
// Dine in / Pick up / Delivery are three separate activities (confirmed by
// Jinghai), not one merged "dine_in_pickup" bar.
const EVENT_CASES: EventCase[] = [
  { buttonLabel: 'Extreme Heat', expectedActivityCount: 9 },
  { buttonLabel: 'Extreme Cold', expectedActivityCount: 9 },
  { buttonLabel: 'Power Outage', expectedActivityCount: 7 },
  { buttonLabel: 'Major Earthquake', expectedActivityCount: 5 },
  { buttonLabel: 'Major Flooding', expectedActivityCount: 5 }
];

const SEVERITY_PAIRS: Array<{ base: string; comparison: string }> = [
  { base: 'Not severe at all', comparison: 'Extremely severe' },
  { base: 'Slightly severe', comparison: 'Moderately severe' }
];

async function selectSeverityPair(page: Page, base: string, comparison: string) {
  const selects = page.locator('select.scenario-select');
  // DOM order (see ScenarioATEPanel.tsx): [0] Base Level, [1] Comparison Level,
  // [2] Population Segment's unrelated "Select Activity/Travel Type".
  await selects.nth(0).selectOption({ label: base });
  await selects.nth(1).selectOption({ label: comparison });
}

async function getRenderedAteValues(page: Page): Promise<string[]> {
  return page.locator('.scenario-ate-value').allTextContents();
}

function parseAteValue(text: string): number {
  // Values render as "+12.3%" (percent mode, default) or "+0.123" (absolute mode).
  const cleaned = text.replace('%', '').replace('+', '').trim();
  return parseFloat(cleaned);
}

test.describe('Scenario Analysis - severity ATE smoke test', () => {
  for (const { buttonLabel, expectedActivityCount } of EVENT_CASES) {
    test(`${buttonLabel}: renders ${expectedActivityCount} activities with finite ATEs across two severity pairs, no console errors`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => consoleErrors.push(err.message));

      await page.goto('/#/scenario');
      await expect(page.getByRole('heading', { name: 'CARE Scenario Analysis Tool' })).toBeVisible();

      await page.getByText(buttonLabel, { exact: true }).click();

      for (const { base, comparison } of SEVERITY_PAIRS) {
        await selectSeverityPair(page, base, comparison);

        const ateItems = page.locator('.scenario-ate-item');
        await expect(ateItems).toHaveCount(expectedActivityCount, { timeout: 15_000 });

        const values = await getRenderedAteValues(page);
        expect(values.length).toBe(expectedActivityCount);
        for (const raw of values) {
          const parsed = parseAteValue(raw);
          expect(Number.isFinite(parsed)).toBe(true);
        }
      }

      // The card containing the severity dropdowns AND the rendered ATE bars
      // (both live inside the same .scenario-section-card - see
      // ScenarioATEPanel.tsx). Filtering by "has .scenario-results" picks
      // this card out from the other two .scenario-section-card elements
      // on the page (event picker, population segment section).
      const severityCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-results') });

      // See the file header comment: grow the viewport to fit #root's full
      // (100vh-based) content height so nothing needs to scroll for the
      // screenshot. #root's scrollHeight already reflects the full content
      // height even while it's the smaller, viewport-capped size.
      const contentHeight = await page.evaluate(() => document.getElementById('root')?.scrollHeight ?? document.documentElement.scrollHeight);
      const originalViewport = page.viewportSize();
      await page.setViewportSize({ width: originalViewport?.width ?? 1280, height: contentHeight + 100 });

      await severityCard.screenshot({
        path: `e2e/screenshots/${buttonLabel.toLowerCase().replace(/\s+/g, '-')}.png`
      });

      if (originalViewport) await page.setViewportSize(originalViewport);

      expect(consoleErrors, `Console errors on ${buttonLabel}: ${consoleErrors.join(' | ')}`).toEqual([]);
    });
  }
});

test('severity dropdowns: a level chosen in one is disabled in the other', async ({ page }) => {
  await page.goto('/#/scenario');
  await expect(page.getByRole('heading', { name: 'CARE Scenario Analysis Tool' })).toBeVisible();

  const base = page.locator('select.scenario-select').nth(0);
  const comparison = page.locator('select.scenario-select').nth(1);

  // Defaults: Base = Not severe at all, Comparison = Extremely severe
  await expect(comparison.locator('option', { hasText: 'Not severe at all' })).toBeDisabled();
  await expect(base.locator('option', { hasText: 'Extremely severe' })).toBeDisabled();

  await base.selectOption({ label: 'Moderately severe' });
  await expect(comparison.locator('option', { hasText: 'Moderately severe' })).toBeDisabled();
  await expect(comparison.locator('option', { hasText: 'Not severe at all' })).toBeEnabled();

  await comparison.selectOption({ label: 'Slightly severe' });
  await expect(base.locator('option', { hasText: 'Slightly severe' })).toBeDisabled();
  await expect(base.locator('option', { hasText: 'Extremely severe' })).toBeEnabled();
});

test('GBU label is italic with an asterisk and shows Jinghai\'s note on hover', async ({ page }) => {
  await page.goto('/#/scenario');
  const label = page.locator('.scenario-ate-activity em', { hasText: 'Go about business as usual*' });
  await expect(label).toBeVisible({ timeout: 15_000 });
  expect(await label.evaluate(el => getComputedStyle(el).fontStyle)).toBe('italic');
  await label.hover();
  await expect(page.locator('.scenario-tooltip')).toHaveText(
    'This was a 5-level question from very unlikely to very likely. Do less corresponds to very or somewhat unlikely. About the same corresponds to neutral. Do more corresponds to very or somewhat likely.'
  );
});

test('Population Segment table: no Risk Aversion, 3-tier income, binary housing, real PR/CR/SE values', async ({ page }) => {
  await page.goto('/#/scenario');
  const section = page.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });
  await expect(section).not.toContainText('Risk Aversion');

  const rowsFor = (variable: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) });
  // Household Income: base <$50k, comparisons $50k-$100k and $100k+ only
  const incomeTable = section.locator('table', { hasText: 'Household Income' });
  await expect(incomeTable).toContainText('Less than $50,000');
  await expect(incomeTable).toContainText('$50,000 - $100,000');
  await expect(incomeTable).toContainText('$100,000 or higher');
  await expect(incomeTable).not.toContainText('$25,000');
  await expect(incomeTable).not.toContainText('Apartment');
  await expect(incomeTable).not.toContainText('Mobile home');
  await expect(incomeTable).toContainText('Not stand-alone');
  await expect(incomeTable).toContainText('Stand-alone house');

  // No more TBD placeholder anywhere - PR/CR/SE now show real computed values.
  await expect(section).not.toContainText('TBD');
  await expect(section.locator('.scenario-ate-placeholder')).toHaveCount(0);

  for (const v of ['Personal Resilience', 'Community Resilience', 'Social Engagement']) {
    await expect(rowsFor(v)).toContainText('+1% of SD');
    const value = await rowsFor(v).locator('.scenario-ate-display-value').innerText();
    expect(Number.isFinite(parseFloat(value.replace('%', '').replace('+', '')))).toBe(true);
  }
});

test('Population Segment table is reactive to Activity and Behavioral Response (regression guard)', async ({ page }) => {
  // This is the exact check that was missing when Gender/Age Group/Household
  // Income/Housing Type/Transit Access were hardcoded literals in
  // demographicData - the table rendered fine and looked plausible, but every
  // number stayed frozen no matter what was selected. Asserting the LABELS
  // are correct (as the previous test does) doesn't catch that; only
  // asserting the VALUES actually change does.
  await page.goto('/#/scenario');
  const section = page.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });

  const rowsFor = (variable: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) });
  const firstValue = async (variable: string) =>
    (await rowsFor(variable).locator('.scenario-ate-display-value').first().innerText()).trim();

  const activitySelect = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');

  // --- Activity reactivity ---
  // Household Income (in50/in50100) isn't a coefficient in either use_car or
  // go_business_as_usual for heat - 0% there is legitimately correct, not a
  // bug, so it needs its own pair where the variable is actually in-model
  // (dine_in has both income dummies).
  await activitySelect.selectOption({ value: 'use_car' });
  await page.waitForTimeout(300);
  const useCarValues = {
    gender: await firstValue('Gender'),
    ageGroup: await firstValue('Age Group'),
    householdIncome: await firstValue('Household Income')
  };

  await activitySelect.selectOption({ value: 'go_business_as_usual' });
  await page.waitForTimeout(300);
  const gbuValues = {
    gender: await firstValue('Gender'),
    ageGroup: await firstValue('Age Group')
  };

  await activitySelect.selectOption({ value: 'dine_in' });
  await page.waitForTimeout(300);
  const dineInValues = {
    householdIncome: await firstValue('Household Income')
  };

  console.log('Activity reactivity:', JSON.stringify({ useCarValues, gbuValues, dineInValues }));
  expect(gbuValues.gender, 'Gender ATE did not change when Activity changed (use_car -> go_business_as_usual)').not.toBe(useCarValues.gender);
  expect(gbuValues.ageGroup, 'Age Group ATE did not change when Activity changed (use_car -> go_business_as_usual)').not.toBe(useCarValues.ageGroup);
  expect(dineInValues.householdIncome, 'Household Income ATE did not change when Activity changed (use_car -> dine_in)').not.toBe(useCarValues.householdIncome);

  // --- Behavioral Response reactivity ---
  // Same reasoning as above: pick, per variable, an activity where that
  // variable is actually in the fitted model (go_business_as_usual for
  // Gender/Age Group, dine_in for Household Income), and hold the activity
  // fixed while only the response button changes.
  const behaviorButtons = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('.scenario-behavior-button');

  await activitySelect.selectOption({ value: 'go_business_as_usual' });
  await page.waitForTimeout(300);
  await behaviorButtons.filter({ hasText: 'Do Less' }).click();
  await page.waitForTimeout(300);
  const doLess = {
    gender: await firstValue('Gender'),
    ageGroup: await firstValue('Age Group')
  };
  await behaviorButtons.filter({ hasText: 'Do More' }).click();
  await page.waitForTimeout(300);
  const doMore = {
    gender: await firstValue('Gender'),
    ageGroup: await firstValue('Age Group')
  };

  await activitySelect.selectOption({ value: 'dine_in' });
  await page.waitForTimeout(300);
  await behaviorButtons.filter({ hasText: 'Do Less' }).click();
  await page.waitForTimeout(300);
  const doLessIncome = await firstValue('Household Income');
  await behaviorButtons.filter({ hasText: 'Do More' }).click();
  await page.waitForTimeout(300);
  const doMoreIncome = await firstValue('Household Income');

  console.log('Behavioral Response reactivity:', JSON.stringify({ doLess, doMore, doLessIncome, doMoreIncome }));
  expect(doMore.gender, 'Gender ATE did not change when Behavioral Response changed (go_business_as_usual)').not.toBe(doLess.gender);
  expect(doMore.ageGroup, 'Age Group ATE did not change when Behavioral Response changed (go_business_as_usual)').not.toBe(doLess.ageGroup);
  expect(doMoreIncome, 'Household Income ATE did not change when Behavioral Response changed (dine_in)').not.toBe(doLessIncome);
});
