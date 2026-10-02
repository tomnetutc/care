/* eslint-disable */
// This is a Playwright spec, not a CRA/Jest/Testing-Library test - it lives
// outside src/ and is never linted by react-scripts build/start/test. The
// disable above just silences false positives if someone runs a bare `eslint`
// across the whole repo, since package.json's eslintConfig (react-app/jest)
// otherwise misapplies Testing-Library/Jest rules to Playwright's page/expect API.
import { test, expect, Page, Locator } from '@playwright/test';

/**
 * What a Section 3 value cell means. A variable that is not in the activity's
 * fitted model renders as a muted "—" (aria-label "Not in model"); everything
 * else renders its number. Returns 'Not in model' for the former so tests
 * assert on meaning, not on the glyph.
 */
async function readCell(cell: Locator): Promise<string> {
  return cell.evaluate(el => (el.getAttribute('aria-label') === 'Not in model' ? 'Not in model' : (el.textContent || '').trim()));
}

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

  // Each PR/CR/SE row is either a real finite number or "Not in model" (the
  // variable wasn't retained in that activity's fitted model). Across heat's 9
  // activity models every one of the three is in-model somewhere, so each must
  // show at least one real, finite, computed value - and never NaN/TBD.
  const activitySelectForAttitudes = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');
  const activityValues = await activitySelectForAttitudes.locator('option').evaluateAll(o => o.map(x => (x as HTMLOptionElement).value));
  expect(activityValues.length).toBe(9);
  const finiteSeen: Record<string, boolean> = { 'Personal Resilience': false, 'Community Resilience': false, 'Social Engagement': false };
  for (const activity of activityValues) {
    await activitySelectForAttitudes.selectOption({ value: activity });
    await page.waitForTimeout(150);
    for (const v of Object.keys(finiteSeen)) {
      await expect(rowsFor(v)).toContainText('+1% of SD');
      await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
      const value = await readCell(rowsFor(v).locator('.scenario-ate-display-value').first());
      if (value === 'Not in model') continue;
      const parsed = parseFloat(value.replace('%', '').replace('+', ''));
      expect(Number.isFinite(parsed), `${v} / ${activity}: "${value}" is not a finite number`).toBe(true);
      finiteSeen[v] = true;
    }
  }
  for (const [v, seen] of Object.entries(finiteSeen)) {
    expect(seen, `${v} never showed a real computed value in any activity`).toBe(true);
  }
});

test('Population Segment table is reactive to Activity and Behavioral Response (regression guard)', async ({ page }) => {
  // This is the exact check that was missing when Gender/Age Group/Household
  // Income/Housing Type/Transit Access were hardcoded literals in
  // demographicData - the table rendered fine and looked plausible, but every
  // number stayed frozen no matter what was selected. Asserting the LABELS
  // are correct (as the previous test does) doesn't catch that; only
  // asserting the VALUES actually change does.
  //
  // Which activity has which variable depends on Jinghai's fitted models
  // (public/models/model_coeffs_by_event.json, heat, 2026-09-28 refit):
  //   female (Gender)          : go_business_as_usual only
  //   age_3150 (Age 31-50)     : use_transit, go_business_as_usual
  //   in50 ($50k-$100k income) : work_from_home, work_from_office
  // A variable that is NOT in an activity's model renders "Not in model", so
  // reactivity is asserted between two in-model activities where possible
  // (numbers must differ) and between in-model and not-in-model otherwise.
  await page.goto('/#/scenario');
  const section = page.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });

  const rowsFor = (variable: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) });
  const firstValue = async (variable: string) =>
    readCell(rowsFor(variable).locator('.scenario-ate-display-value').first());
  const isNumber = (v: string) => Number.isFinite(parseFloat(v.replace('%', '').replace('+', '')));

  const activitySelect = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');
  const pick = async (activity: string) => { await activitySelect.selectOption({ value: activity }); await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0); await page.waitForTimeout(150); };

  // --- Activity reactivity ---
  await pick('use_car');
  const useCar = { gender: await firstValue('Gender'), age: await firstValue('Age Group'), income: await firstValue('Household Income') };
  expect(useCar, 'Gender/Age/Income are all absent from heat use_car, so all must read "Not in model"')
    .toEqual({ gender: 'Not in model', age: 'Not in model', income: 'Not in model' });

  await pick('go_business_as_usual');
  const gbu = { gender: await firstValue('Gender'), age: await firstValue('Age Group') };
  expect(isNumber(gbu.gender) && isNumber(gbu.age), `GBU Gender/Age should be real numbers, got ${JSON.stringify(gbu)}`).toBe(true);

  await pick('use_transit');
  const transit = { age: await firstValue('Age Group') };
  expect(isNumber(transit.age), `Transit Age should be a real number, got ${transit.age}`).toBe(true);
  expect(transit.age, 'Age Group ATE did not change when Activity changed (go_business_as_usual -> use_transit)').not.toBe(gbu.age);

  await pick('work_from_home');
  const wfh = { income: await firstValue('Household Income') };
  await pick('work_from_office');
  const wfo = { income: await firstValue('Household Income') };
  expect(isNumber(wfh.income) && isNumber(wfo.income), `WFH/WFO Income should be real numbers, got ${JSON.stringify({ wfh, wfo })}`).toBe(true);
  expect(wfo.income, 'Household Income ATE did not change when Activity changed (work_from_home -> work_from_office)').not.toBe(wfh.income);
  console.log('Activity reactivity:', JSON.stringify({ useCar, gbu, transit, wfh, wfo }));

  // --- Behavioral Response reactivity (activity held fixed) ---
  const behaviorButtons = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('.scenario-behavior-button');

  await pick('go_business_as_usual');
  await behaviorButtons.filter({ hasText: 'Do Less' }).click();
  await page.waitForTimeout(300);
  const doLess = { gender: await firstValue('Gender'), age: await firstValue('Age Group') };
  await behaviorButtons.filter({ hasText: 'Do More' }).click();
  await page.waitForTimeout(300);
  const doMore = { gender: await firstValue('Gender'), age: await firstValue('Age Group') };

  await pick('work_from_home');
  await behaviorButtons.filter({ hasText: 'Do Less' }).click();
  await page.waitForTimeout(300);
  const doLessIncome = await firstValue('Household Income');
  await behaviorButtons.filter({ hasText: 'Do More' }).click();
  await page.waitForTimeout(300);
  const doMoreIncome = await firstValue('Household Income');

  console.log('Behavioral Response reactivity:', JSON.stringify({ doLess, doMore, doLessIncome, doMoreIncome }));
  expect(doMore.gender, 'Gender ATE did not change when Behavioral Response changed (go_business_as_usual)').not.toBe(doLess.gender);
  expect(doMore.age, 'Age Group ATE did not change when Behavioral Response changed (go_business_as_usual)').not.toBe(doLess.age);
  expect(doMoreIncome, 'Household Income ATE did not change when Behavioral Response changed (work_from_home)').not.toBe(doLessIncome);
});

test('Percent ATE is relative change and Absolute ATE is the probability difference (Jinghai ATE_severity_all_events.csv)', async ({ page }) => {
  // heat / Using a car / Not severe at all -> Extremely severe / Do more, from
  // data/jinghai_2026-09-30/ATE_severity_all_events.csv:
  //   ATE_abs = 0.04153...  ATE_pct = 27.8066...  (= ATE_abs / P_base, P_base = 0.14936)
  // The page used to show ATE_abs x 100 (= 4.2%) under the "Percent ATE" label.
  await page.goto('/#/scenario');
  const carRow = page.locator('.scenario-ate-item', { hasText: 'Using a car for traveling' });
  await expect(carRow).toBeVisible({ timeout: 15_000 });
  await expect(carRow.locator('.scenario-ate-value')).toHaveText('+27.8%');
  await page.locator('.scenario-ate-toggle').first().getByRole('button', { name: 'Absolute ATE' }).click();
  await expect(carRow.locator('.scenario-ate-value')).toHaveText('+0.042');
});

test('Section 3 only offers the activities the selected event has a model for, and flags variables not in the model', async ({ page }) => {
  await page.goto('/#/scenario');
  const segmentCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-demographic-groups') });
  const activitySelect = segmentCard.locator('select.scenario-select');
  await expect(segmentCard.locator('.scenario-demographic-groups')).toBeVisible({ timeout: 15_000 });
  for (const { buttonLabel, expectedActivityCount } of EVENT_CASES) {
    await page.getByText(buttonLabel, { exact: true }).click();
    await expect(activitySelect.locator('option')).toHaveCount(expectedActivityCount);
  }
  // Heat / use_car has no Gender term -> its cell must say so instead of "0.0%".
  await page.getByText('Extreme Heat', { exact: true }).click();
  await activitySelect.selectOption({ value: 'use_car' });
  await expect(segmentCard.locator('tr', { hasText: 'Gender' }).locator('.scenario-ate-display-value').first()).toHaveAttribute('aria-label', 'Not in model');
  await expect(segmentCard).toContainText('not a measured zero');
});

test('Interactions do not block the main thread (performance regression guard)', async ({ page }) => {
  // Every severity / response / event change used to recompute all ~35
  // population-segment comparisons from scratch (~1.1 s of frozen UI on
  // Extreme Heat, several seconds on a slower laptop). Segment numbers depend
  // only on the event, so they are now computed once per event and cached, and
  // severity / response changes touch only the cheap severity path. Measured
  // after the fix: longest task ~25-100 ms. The 1 s ceiling leaves ~10x
  // headroom for a slow CI runner yet still fails on the old behaviour.
  await page.addInitScript(() => {
    (window as any).__longTasks = [];
    try {
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) (window as any).__longTasks.push(Math.round(e.duration));
      }).observe({ entryTypes: ['longtask'] });
    } catch { /* longtask unsupported - nothing to assert on */ }
  });
  await page.goto('/#/scenario');
  await expect(page.locator('.scenario-ate-item').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('[aria-label="Computing"]')).toHaveCount(0, { timeout: 30_000 });
  await page.evaluate(() => { (window as any).__longTasks = []; });

  const settle = async () => {
    await page.waitForTimeout(300);
    await expect(page.locator('.scenario-computing')).toHaveCount(0);
    await expect(page.locator('[aria-label="Computing"]')).toHaveCount(0);
  };

  await page.locator('select.scenario-select').nth(1).selectOption('very');       // comparison severity
  await settle();
  await page.locator('.scenario-behavior-button', { hasText: 'Do Less' }).first().click();   // response
  await settle();
  await page.getByText('Power Outage', { exact: true }).click();                      // event (first visit: computes segments)
  await settle();
  await page.getByText('Extreme Heat', { exact: true }).click();                      // event (back: served from cache)
  await settle();

  const longTasks: number[] = await page.evaluate(() => (window as any).__longTasks);
  const worst = Math.max(0, ...longTasks);
  expect(worst, `longest main-thread block was ${worst} ms (all long tasks: ${JSON.stringify(longTasks)})`).toBeLessThan(1000);
});

test("Section 3 rows and values match Jinghai's ATE_segments_by_model.xlsx (Employment status, Race, per-comparison flag)", async ({ page }) => {
  // Expected values are read straight from heat_Delivery in his workbook (Do more column):
  //   Employment status Worker -> Non-worker : ATE_pct -29.0484, ATE_abs -0.0768
  //   Age Group 18-30 -> 65+                 : ATE_pct -20.0019, ATE_abs -0.0482
  //   Age Group 18-30 -> 31-50 / 51-65       : in_model FALSE (only age_65p is in this model)
  await page.goto('/#/scenario');
  const segmentCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-demographic-groups') });
  const section = segmentCard.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });
  await segmentCard.locator('select.scenario-select').selectOption({ value: 'delivery' });
  await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
  await page.waitForTimeout(200);

  const row = (variable: string, comparison: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) }).filter({ has: page.locator('td', { hasText: comparison }) });
  // Only the first row of a multi-row group carries the variable name, so rows are also
  // addressable by their (unique-within-the-group) Comparison column text alone.
  const byComparison = (comparison: string) =>
    section.locator('tr').filter({ has: page.locator('td:nth-child(3)', { hasText: new RegExp(`^${comparison.replace(/[+$]/g, '\\$&')}$`) }) });
  const cell = (variable: string, comparison: string) =>
    readCell((variable === 'Age Group' ? byComparison(comparison) : row(variable, comparison)).first().locator('.scenario-ate-display-value').first());

  // Employment status is a real row (it is in 14 of the 35 models and was missing before).
  await expect(row('Employment status', 'Non-worker')).toHaveCount(1);
  await expect(section.locator('tr', { hasText: 'Employment status' }).first()).toContainText('Worker');
  expect(await cell('Employment status', 'Non-worker')).toBe('-29.0%');
  // Race is one group with "Other race" as the base, not three independent toggles.
  await expect(section.locator('tr', { hasText: 'Race' }).first()).toContainText('Other race');
  await expect(section.locator('tr', { hasText: 'Not White' })).toHaveCount(0);
  // Land-use Diversity: Not high -> High (Medium is not a model term anywhere).
  await expect(section.locator('tr', { hasText: 'Land-use Diversity' }).first()).toContainText('Not high');

  // Per-comparison flag: only the 65+ dummy is in this model, so 31-50 and 51-65 read "Not in model".
  expect(await cell('Age Group', '31-50')).toBe('Not in model');
  expect(await cell('Age Group', '51-65')).toBe('Not in model');
  expect(await cell('Age Group', '65+')).toBe('-20.0%');

  // Absolute format
  await segmentCard.locator('.scenario-ate-toggle button', { hasText: 'Absolute ATE' }).click();
  await page.waitForTimeout(100);
  expect(await cell('Employment status', 'Non-worker')).toBe('-0.08');
  expect(await cell('Age Group', '65+')).toBe('-0.05');
});
