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
  const activitySelectFirst = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');
  const pickFirst = async (activity: string) => {
    await activitySelectFirst.selectOption({ value: activity });
    await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
    await page.waitForTimeout(150);
  };
  // Only retained variables are shown (Irfan, 2026-10-05), so each label check runs in a model that keeps it.
  // Household Income: base <$50k, comparisons $50k-$100k and $100k+ only (heat / work_from_home retains it).
  await pickFirst('work_from_home');
  const incomeTable = section.locator('table', { hasText: 'Household Income' });
  await expect(incomeTable).toContainText('Less than $50,000');
  await expect(incomeTable).toContainText('$50,000 - $100,000');
  await expect(incomeTable).toContainText('$100,000 or higher');
  await expect(incomeTable).not.toContainText('$25,000');
  // Housing type is binary: Not stand-alone -> Stand-alone house (heat / use_car retains it).
  await pickFirst('use_car');
  const housingTable = section.locator('table', { hasText: 'Stand-alone house' });
  await expect(housingTable).not.toContainText('Apartment');
  await expect(housingTable).not.toContainText('Mobile home');
  await expect(housingTable).toContainText('Not stand-alone');
  await expect(housingTable).toContainText('Stand-alone house');

  // No more TBD placeholder anywhere - PR/CR/SE now show real computed values.
  await expect(section).not.toContainText('TBD');
  await expect(section.locator('.scenario-ate-placeholder')).toHaveCount(0);

  // Each PR/CR/SE row is shown only in the activities whose final model retained it (Irfan,
  // 2026-10-05: not-retained variables are hidden, not shown as a dash). When shown it must be a
  // real finite number, never NaN/TBD. Which of heat's 9 activity models retain each construct is
  // read from Jinghai's 2026-10-04 ATE_segments_by_model.xlsx (in_model = TRUE):
  const RETAINED_IN_HEAT: Record<string, string[]> = {
    'Personal Resilience': ['use_car', 'delivery', 'pick_up', 'use_transit', 'go_business_as_usual'],
    'Community Resilience': ['delivery', 'stay_home', 'go_business_as_usual', 'work_from_home', 'work_from_office'],
    'Social Engagement': ['use_car', 'pick_up']
  };
  const activitySelectForAttitudes = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');
  const activityValues = await activitySelectForAttitudes.locator('option').evaluateAll(o => o.map(x => (x as HTMLOptionElement).value));
  expect(activityValues.length).toBe(9);
  const shownIn: Record<string, string[]> = { 'Personal Resilience': [], 'Community Resilience': [], 'Social Engagement': [] };
  for (const activity of activityValues) {
    await activitySelectForAttitudes.selectOption({ value: activity });
    await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
    await page.waitForTimeout(150);
    for (const v of Object.keys(shownIn)) {
      if ((await rowsFor(v).count()) === 0) continue; // not retained in this activity's model -> hidden
      await expect(rowsFor(v)).toContainText('1 Unit Increase');
      const value = await readCell(rowsFor(v).locator('.scenario-ate-display-value').first());
      const parsed = parseFloat(value.replace('%', '').replace('+', ''));
      expect(Number.isFinite(parsed), `${v} / ${activity}: "${value}" is not a finite number`).toBe(true);
      shownIn[v].push(activity);
    }
  }
  for (const [v, expected] of Object.entries(RETAINED_IN_HEAT)) {
    expect(shownIn[v].sort(), `${v} is shown in the wrong set of heat activities`).toEqual([...expected].sort());
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
  // A variable that is NOT in an activity's model has no row, so
  // reactivity is asserted between two in-model activities where possible
  // (numbers must differ) and between in-model and not-shown otherwise.
  await page.goto('/#/scenario');
  const section = page.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });

  const rowsFor = (variable: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) });
  // A variable whose final model did not retain it has no row at all ('Not shown').
  const firstValue = async (variable: string) =>
    (await rowsFor(variable).count()) === 0 ? 'Not shown' : readCell(rowsFor(variable).locator('.scenario-ate-display-value').first());
  const isNumber = (v: string) => Number.isFinite(parseFloat(v.replace('%', '').replace('+', '')));

  const activitySelect = page.locator('.scenario-section-card')
    .filter({ has: page.locator('.scenario-demographic-groups') })
    .locator('select.scenario-select');
  const pick = async (activity: string) => { await activitySelect.selectOption({ value: activity }); await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0); await page.waitForTimeout(150); };

  // --- Activity reactivity ---
  await pick('use_car');
  const useCar = { gender: await firstValue('Gender'), age: await firstValue('Age Group'), income: await firstValue('Household Income') };
  expect(useCar, 'Gender/Age/Income are all absent from heat use_car, so none of them may be shown')
    .toEqual({ gender: 'Not shown', age: 'Not shown', income: 'Not shown' });

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

test('Section 3 only offers the activities the selected event has a model for, and hides variables not retained in the model', async ({ page }) => {
  await page.goto('/#/scenario');
  const segmentCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-demographic-groups') });
  const activitySelect = segmentCard.locator('select.scenario-select');
  await expect(segmentCard.locator('.scenario-demographic-groups')).toBeVisible({ timeout: 15_000 });
  for (const { buttonLabel, expectedActivityCount } of EVENT_CASES) {
    await page.getByText(buttonLabel, { exact: true }).click();
    await expect(activitySelect.locator('option')).toHaveCount(expectedActivityCount);
  }
  // Heat / use_car has no Gender term -> there is no Gender row at all (and no "0.0%" or dash stand-in),
  // while a variable it does keep (Household Size) is there.
  await page.getByText('Extreme Heat', { exact: true }).click();
  await activitySelect.selectOption({ value: 'use_car' });
  await expect(segmentCard.locator('[aria-label="Computing"]')).toHaveCount(0);
  await expect(segmentCard.locator('tr', { hasText: 'Gender' })).toHaveCount(0);
  await expect(segmentCard.locator('tr', { hasText: 'Household Size' })).toHaveCount(1);
  await expect(segmentCard.locator('[aria-label="Not in model"]')).toHaveCount(0);
  // The old "— means not retained ... It is not a measured zero" legend is gone: it would contradict
  // Irfan's note (not-retained variables "can be interpreted as zero").
  await expect(segmentCard).not.toContainText('not a measured zero');
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

/** Shared Section 3 helpers for the "only retained variables are shown" tests below. */
async function openSection3(page: Page, event: string, activity: string) {
  await page.goto('/#/scenario');
  const segmentCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-demographic-groups') });
  const section = segmentCard.locator('.scenario-demographic-groups');
  await expect(section).toBeVisible({ timeout: 15_000 });
  if (event !== 'Extreme Heat') await page.getByText(event, { exact: true }).click();
  await segmentCard.locator('select.scenario-select').selectOption({ value: activity });
  await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
  await page.waitForTimeout(250);
  return { segmentCard, section };
}

test("Section 3 shows only the rows the model retained, and they match Jinghai's workbook (heat / having food delivered)", async ({ page }) => {
  // Irfan (2026-10-05): show ATE values only for variables retained in each final model. Expected rows and
  // values are read from heat_Delivery in Jinghai's 2026-10-04 ATE_segments_by_model.xlsx (in_model = TRUE,
  // Do more column):
  //   Age Group 18-30 -> 65+            ATE_pct -20.0019  ATE_abs -0.0482   (31-50 and 51-65: not retained -> no rows)
  //   Employment status -> Non-worker   ATE_pct -29.0484  ATE_abs -0.0768
  // 11 retained rows in all (9 discrete + Community Resilience + Personal Resilience), in all 4 groups.
  const { segmentCard, section } = await openSection3(page, 'Extreme Heat', 'delivery');

  await expect(section.locator('tbody tr')).toHaveCount(11);
  await expect(section.locator('.scenario-demographic-group')).toHaveCount(4);
  for (const hidden of ['Gender', 'Race', 'Land-use Diversity', 'Social Engagement', 'Education']) {
    await expect(section.locator('tr', { hasText: hidden }), `${hidden} is not retained in heat_Delivery and must not be shown`).toHaveCount(0);
  }
  // No dash / "Not in model" stand-ins anywhere.
  await expect(section.locator('[aria-label="Not in model"]')).toHaveCount(0);

  const row = (variable: string, comparison: string) =>
    section.locator('tr', { has: page.locator('td', { hasText: variable }) }).filter({ has: page.locator('td', { hasText: comparison }) });
  const ageRows = section.locator('tr').filter({ has: page.locator('td:nth-child(2)', { hasText: '18-30' }) });
  const cell = (r: Locator) => readCell(r.first().locator('.scenario-ate-display-value').first());

  // Per-comparison hiding: only the 65+ dummy is in this model. 31-50 / 51-65 have no row, and the
  // variable + base labels sit on the first row that IS shown (65+).
  await expect(section.locator('tr').filter({ has: page.locator('td:nth-child(3)', { hasText: /^31-50$/ }) })).toHaveCount(0);
  await expect(section.locator('tr').filter({ has: page.locator('td:nth-child(3)', { hasText: /^51-65$/ }) })).toHaveCount(0);
  await expect(ageRows).toHaveCount(1);
  await expect(ageRows.first()).toContainText('Age Group');
  await expect(ageRows.first()).toContainText('65+');
  expect(await cell(ageRows)).toBe('-20.0%');
  expect(await cell(row('Employment status', 'Non-worker'))).toBe('-29.0%');

  await segmentCard.locator('.scenario-ate-toggle button', { hasText: 'Absolute ATE' }).click();
  await page.waitForTimeout(100);
  expect(await cell(ageRows)).toBe('-0.05');
  expect(await cell(row('Employment status', 'Non-worker'))).toBe('-0.08');
});

test('Section 3: Race, Land-use Diversity and Education keep their base labels on the first row shown', async ({ page }) => {
  // heat / use_car (workbook in_model): Race White + Black retained, Asian not -> Race is one group with
  // "Other race" as the base, shown on the White row, with no Asian row.
  {
    const { section } = await openSection3(page, 'Extreme Heat', 'use_car');
    const raceRows = section.locator('tr').filter({ has: page.locator('td:nth-child(2)', { hasText: 'Other race' }) });
    await expect(raceRows).toHaveCount(1);
    await expect(raceRows.first()).toContainText('Race');
    await expect(raceRows.first()).toContainText('White');
    await expect(section.locator('tr').filter({ has: page.locator('td:nth-child(3)', { hasText: /^Black$/ }) })).toHaveCount(1);
    await expect(section.locator('tr').filter({ has: page.locator('td:nth-child(3)', { hasText: /^Asian$/ }) })).toHaveCount(0);
    await expect(section.locator('tr', { hasText: 'Not White' })).toHaveCount(0);
  }
  // heat / dine_in: Land-use Diversity "Not high" -> "High" (-18.5%) and Education (Bachelor's) retained;
  // the Attitudes group has nothing retained, so its card is not shown at all.
  {
    const { section } = await openSection3(page, 'Extreme Heat', 'dine_in');
    await expect(section.locator('tr', { hasText: 'Land-use Diversity' }).first()).toContainText('Not high');
    await expect(section.locator('tr', { hasText: "Education (Bachelor's)" }).first()).toContainText('No BS');
    await expect(section.locator('tbody tr')).toHaveCount(4);
    await expect(section.locator('.scenario-demographic-group')).toHaveCount(3);
    await expect(section.locator('.scenario-demographic-group', { hasText: 'Attitudes & Personality Traits' })).toHaveCount(0);
  }
});

test('Section 3: a model that retains a single variable shows just that one row (earthquake / working from home)', async ({ page }) => {
  // earthquake_WFH keeps only tcom_no ("Does not telecommute"): ATE_pct -44.6513, ATE_abs -0.1547.
  const { segmentCard, section } = await openSection3(page, 'Major Earthquake', 'work_from_home');
  await expect(section.locator('tbody tr')).toHaveCount(1);
  await expect(section.locator('.scenario-demographic-group')).toHaveCount(1);
  const only = section.locator('tbody tr').first();
  await expect(only).toContainText('Does not telecommute');
  await expect(only).toContainText('Telecommutes');
  expect(await readCell(only.locator('.scenario-ate-display-value').first())).toBe('-44.7%');
  await segmentCard.locator('.scenario-ate-toggle button', { hasText: 'Absolute ATE' }).click();
  await page.waitForTimeout(100);
  expect(await readCell(only.locator('.scenario-ate-display-value').first())).toBe('-0.15');
});

test("Section 3 info button carries Irfan's note about variables not retained in the final model", async ({ page }) => {
  await page.goto('/#/scenario');
  const segmentCard = page.locator('.scenario-section-card').filter({ has: page.locator('.scenario-demographic-groups') });
  await expect(segmentCard.locator('.scenario-demographic-groups')).toBeVisible({ timeout: 15_000 });
  await segmentCard.locator('.scenario-section-header .scenario-info-button').hover();
  await expect(page.locator('.scenario-tooltip')).toContainText(
    'This table reports ATE estimates only for variables retained in the final model specification. ' +
    'Variables not retained are not displayed because no statistically significant effect was detected; ' +
    'their ATE values can therefore be interpreted as zero.'
  );
});

test("Attitudes & Personality Traits use the corrected '1 Unit Increase*' definition, show only retained constructs, and match Jinghai's 2026-10-04 workbook", async ({ page }) => {
  // Expected values are read straight from his 2026-10-04 ATE_segments_by_model.xlsx (Do more column).
  // The withdrawn "+1% of SD" definition gave values ~100x smaller, so these pins fail loudly if it ever returns.
  //   heat_Car      : Personal Resilience +11.2239% / +0.0193 ; Social Engagement +11.4677% / +0.0198 ; Community Resilience not retained
  //   heat_Delivery : Community Resilience +8.8077% / +0.0201 ; Personal Resilience +9.1311% / +0.0208 ; Social Engagement not retained
  //   heat_Home     : Community Resilience +7.5537% / +0.0334 (the only construct retained)
  const { segmentCard, section } = await openSection3(page, 'Extreme Heat', 'use_car');
  const rowsFor = (variable: string) => section.locator('tr', { has: page.locator('td', { hasText: variable }) });
  const value = (variable: string) => readCell(rowsFor(variable).first().locator('.scenario-ate-display-value').first());
  const pick = async (activity: string) => {
    await segmentCard.locator('select.scenario-select').selectOption({ value: activity });
    await expect(section.locator('[aria-label="Computing"]')).toHaveCount(0);
    await page.waitForTimeout(200);
  };
  const checkTooltips = async (variables: string[]) => {
    // The hover note must be fully visible on EVERY row. The Section 3 cards are overflow:hidden, so a note
    // positioned inside them was cut off on the last row (found on the live page). pointer-events is
    // switched on only so elementFromPoint can see the tooltip.
    for (const v of variables) {
      await rowsFor(v).first().getByText('1 Unit Increase*').hover();
      const tip = section.locator('.scenario-tooltip').filter({ hasText: 'latent constructs are unitless' });
      await expect(tip).toBeVisible();
      const box = (await tip.boundingBox())!;
      const hits = await page.evaluate(({ x, y, w, h }) => {
        let ok = 0;
        for (const fx of [0.05, 0.5, 0.95]) for (const fy of [0.1, 0.5, 0.9]) {
          const el = document.elementFromPoint(x + w * fx, y + h * fy);
          if (el && el.closest('.scenario-tooltip')) ok++;
        }
        return ok;
      }, { x: box.x, y: box.y, w: box.width, h: box.height });
      expect(hits, `${v}: hover note is clipped or covered (${hits}/9 points visible)`).toBe(9);
    }
  };
  await page.addStyleTag({ content: '.scenario-tooltip{pointer-events:auto !important}' });

  // Default activity (use_car): PR and SE retained, CR not.
  await expect(rowsFor('Community Resilience')).toHaveCount(0);
  for (const v of ['Personal Resilience', 'Social Engagement']) {
    await expect(rowsFor(v).first()).toContainText('Current value');
    await expect(rowsFor(v).first()).toContainText('1 Unit Increase*');
    await expect(rowsFor(v).first()).not.toContainText('SD');
  }
  expect(await value('Personal Resilience')).toBe('+11.2%');
  expect(await value('Social Engagement')).toBe('+11.5%');
  await checkTooltips(['Personal Resilience', 'Social Engagement']);

  await pick('delivery');
  await expect(rowsFor('Social Engagement')).toHaveCount(0);
  expect(await value('Community Resilience')).toBe('+8.8%');
  expect(await value('Personal Resilience')).toBe('+9.1%');
  await checkTooltips(['Community Resilience', 'Personal Resilience']);

  await pick('stay_home');
  await expect(rowsFor('Personal Resilience')).toHaveCount(0);
  await expect(rowsFor('Social Engagement')).toHaveCount(0);
  expect(await value('Community Resilience')).toBe('+7.6%');

  // Absolute format
  await segmentCard.locator('.scenario-ate-toggle button', { hasText: 'Absolute ATE' }).click();
  await page.waitForTimeout(100);
  expect(await value('Community Resilience')).toBe('+0.03');
  await pick('delivery');
  expect(await value('Community Resilience')).toBe('+0.02');
  expect(await value('Personal Resilience')).toBe('+0.02');
});

// Jinghai (Slack, 2026-10-05): exact wording for the latent-construct "(*)" note, and a GBU note that
// reads Unlikely / Neutral / Likely.
const UNIT_INCREASE_NOTE_TEXT =
  'Note: (*) = Since the latent constructs are unitless, a “1 unit increase” refers to a change normalized ' +
  'to the scale of the error components, which is fixed to 1 for identification purposes';
const GBU_SEGMENT_NOTE_TEXT =
  'For “Go about business as usual” the three responses are likelihoods: ' +
  'Do less = Unlikely, About the same = Neutral, Do more = Likely.';

test("Jinghai's '(*)' note for the latent constructs is his exact wording, both as a footnote under the Attitudes table and on hover", async ({ page }) => {
  const { section } = await openSection3(page, 'Extreme Heat', 'use_car');
  const footnote = section.locator('.scenario-table-footnote');
  await expect(footnote).toHaveCount(1);
  await expect(footnote).toBeVisible();
  await expect(footnote).toHaveText(UNIT_INCREASE_NOTE_TEXT);

  await page.addStyleTag({ content: '.scenario-tooltip{pointer-events:auto !important}' });
  await section.locator('tr', { has: page.locator('td', { hasText: 'Personal Resilience' }) }).first().getByText('1 Unit Increase*').hover();
  await expect(section.locator('.scenario-tooltip')).toHaveText(UNIT_INCREASE_NOTE_TEXT);

  // No Attitudes card (nothing retained for heat / dine_in) -> no footnote either.
  const dine = await openSection3(page, 'Extreme Heat', 'dine_in');
  await expect(dine.section.locator('.scenario-demographic-group', { hasText: 'Attitudes & Personality Traits' })).toHaveCount(0);
  await expect(dine.section.locator('.scenario-table-footnote')).toHaveCount(0);
});

test("Jinghai's GBU note: Section 3 reads the responses as Unlikely / Neutral / Likely, only when 'Go about business as usual' is selected", async ({ page }) => {
  const { segmentCard } = await openSection3(page, 'Extreme Heat', 'go_business_as_usual');
  const note = segmentCard.locator('.scenario-gbu-note');
  await expect(note).toHaveCount(1);
  await expect(note).toBeVisible();
  await expect(note).toHaveText(GBU_SEGMENT_NOTE_TEXT);

  await segmentCard.locator('select.scenario-select').selectOption({ value: 'use_car' });
  await expect(note).toHaveCount(0);
});
