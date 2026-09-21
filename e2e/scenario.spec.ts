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
