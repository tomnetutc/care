/**
 * Integration tests for the Scenario Analysis ATE engine.
 *
 * These run against the REAL data files - public/models/event_data/*.csv
 * (Jinghai's per-event estimation-sample files), public/models/
 * model_coeffs_by_event.json, and (for cross-checking N) data/jinghai_2026-09-10/
 * model_coefficients_all_events.csv - not mocks or synthetic fixtures. This
 * is the same production code path useScenarioATE.ts drives at runtime.
 *
 * NOTE ON THE CSV PARSER BELOW: this project already has a CSV parser (d3's
 * csvParse, used by DataService.ts), but d3 v7 ships ESM-only and Create
 * React App's default Jest config (react-scripts test, no ejected/overridden
 * transformIgnorePatterns) cannot transform it - `import * as d3 from 'd3'`
 * fails with "Cannot use import statement outside a module" in any test that
 * pulls it in, even transitively. That's why this file avoids importing
 * useScenarioATE.ts (it imports DataService.ts -> d3) and instead imports
 * the small dependency-free eventConfig.ts, plus parses the CSV fixtures with
 * a minimal RFC4180-compliant parser defined here.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  computeSeverityATEs,
  computeSegmentATEs,
  computeContinuousATE,
  getSeverityDummyVariables,
  getDvColumn,
  isWorkerOnlyActivity,
  validateModelData,
  ModelDataByEvent,
  EventModelData
} from './computeATE';
import { EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE } from './eventConfig';
import { SEGMENT_GROUPS } from './segmentConfig';

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const header = rows[0];
  return rows.slice(1)
    .filter(r => r.length === header.length && !(r.length === 1 && r[0] === ''))
    .map(r => {
      const obj: Record<string, string> = {};
      header.forEach((key, idx) => { obj[key] = r[idx]; });
      return obj;
    });
}

// computeATE.ts logs a console.log per activity for a few activities on every
// call (existing production debug logging) - silence it here so test output stays
// readable; this doesn't touch the engine's actual behavior.
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

const REPO_ROOT = path.join(__dirname, '../../..');

const modelData: ModelDataByEvent = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'public/models/model_coeffs_by_event.json'), 'utf8')
);

const eventRowsCache = new Map<string, Record<string, string>[]>();
function getEventRows(csvEvent: string): Record<string, string>[] {
  const cached = eventRowsCache.get(csvEvent);
  if (cached) return cached;
  const config = Object.values(EVENT_CONFIG).find(c => c.csvEvent === csvEvent);
  if (!config) throw new Error(`No EVENT_CONFIG entry for csvEvent ${csvEvent}`);
  const rows = parseCsv(fs.readFileSync(path.join(REPO_ROOT, 'public/models/event_data', config.dataFile), 'utf8'));
  eventRowsCache.set(csvEvent, rows);
  return rows;
}

// model_coefficients_all_events.csv's own reported sample size (n) per event/activity -
// this is the exact estimation-sample size Jinghai's models were fit on.
const COEFFICIENT_ACTIVITY_KEY_MAP: Record<string, string> = {
  'Car': 'use_car',
  'Transit': 'use_transit',
  'Home': 'stay_home',
  'Delivery': 'delivery',
  'Dine in': 'dine_in',
  'Pick up': 'pick_up',
  'WFH': 'work_from_home',
  'WFO': 'work_from_office',
  'Usual': 'go_business_as_usual'
};

const reportedN = new Map<string, number>();
for (const row of parseCsv(fs.readFileSync(path.join(REPO_ROOT, 'data/jinghai_2026-09-10/model_coefficients_all_events.csv'), 'utf8'))) {
  const activityKey = COEFFICIENT_ACTIVITY_KEY_MAP[row.activity];
  if (!activityKey) continue;
  const key = `${row.event}/${activityKey}`;
  if (!reportedN.has(key)) {
    reportedN.set(key, parseInt(row.n, 10));
  }
}

// Every (event, activity) combination the live model file actually has - 35 combos.
const ALL_COMBOS: Array<{ event: string; activity: string }> = [];
for (const event of Object.keys(modelData)) {
  for (const activity of Object.keys(modelData[event])) {
    ALL_COMBOS.push({ event, activity });
  }
}

describe('model_coeffs_by_event.json structure', () => {
  it('validates for every event', () => {
    for (const event of Object.keys(modelData)) {
      expect(validateModelData(modelData[event] as EventModelData)).toBe(true);
    }
  });

  it('has exactly 35 event/activity combinations (9+9+7+5+5, incl. 3 separate food activities)', () => {
    expect(ALL_COMBOS.length).toBe(35);
  });
});

describe('computeSeverityATEs - all 35 event/activity combinations', () => {
  it.each(ALL_COMBOS)('$event/$activity: valid probabilities and conservation', ({ event }) => {
    const eventRows = getEventRows(event);
    const results = computeSeverityATEs(modelData[event], eventRows, {
      event,
      baseSeverityLevel: 1,
      treatmentSeverityLevel: 5
    });

    for (const result of results) {
      const controlSum = result.controlProbabilities.reduce((a, b) => a + b, 0);
      const treatmentSum = result.treatmentProbabilities.reduce((a, b) => a + b, 0);

      expect(result.isValid).toBe(true);
      expect(result.sampleSize).toBeGreaterThan(0);
      expect(Math.abs(controlSum - 1)).toBeLessThan(1e-6);
      expect(Math.abs(treatmentSum - 1)).toBeLessThan(1e-6);
      expect(Math.abs(result.conservationCheck)).toBeLessThan(1e-6);
    }
  });
});

describe('every activity uses the same 3-category response scale', () => {
  it.each(ALL_COMBOS)('$event/$activity: exactly 3 levels labeled [Do less, About the same, Do more]', ({ event, activity }) => {
    const eventRows = getEventRows(event);
    const results = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 1, treatmentSeverityLevel: 5
    });
    const result = results.find(r => r.activity === activity)!;

    expect(result.ate.length).toBe(3);
    expect(result.controlProbabilities.length).toBe(3);
    expect(result.treatmentProbabilities.length).toBe(3);
    expect(result.levelLabels).toEqual(['Do less', 'About the same', 'Do more']);
  });
});

describe('go_business_as_usual (GBU) 5-level -> 3-category collapse', () => {
  const gbuEvents = Object.keys(modelData).filter(event => 'go_business_as_usual' in modelData[event]);

  it('covers every event that has a GBU model', () => {
    expect(gbuEvents.length).toBe(5);
  });

  it.each(gbuEvents)('%s: GBU collapse groups [VeryUnlikely+Unlikely, Neutral, Likely+VeryLikely] correctly', (event) => {
    const eventRows = getEventRows(event);
    const modelConfig = modelData[event]['go_business_as_usual'];
    expect(modelConfig.metadata.levels).toBe(5); // native scale is 5-level

    const results = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 1, treatmentSeverityLevel: 5
    });
    const gbu = results.find(r => r.activity === 'go_business_as_usual')!;

    expect(gbu.isValid).toBe(true);
    expect(gbu.ate.length).toBe(3);
    const probSum = gbu.controlProbabilities.reduce((a, b) => a + b, 0);
    expect(Math.abs(probSum - 1)).toBeLessThan(1e-6);
  });
});

describe('EVENT_ACTIVITY_COVERAGE matches the live model file exactly', () => {
  const expectedCounts: Record<string, number> = {
    'extreme_heat': 9,
    'extreme_cold': 9,
    'power_outage': 7,
    'major_earthquake': 5,
    'major_flooding': 5
  };

  it.each(Object.entries(EVENT_CONFIG))('%s: activity list has the documented count and matches model_coeffs_by_event.json', (internalEventId, config) => {
    const declared = EVENT_ACTIVITY_COVERAGE[internalEventId];
    const actual = Object.keys(modelData[config.csvEvent]);

    expect(declared.length).toBe(expectedCounts[internalEventId]);
    expect([...declared].sort()).toEqual([...actual].sort());
  });

  it('dine_in / pick_up / delivery are three separate activities, not one merged bar', () => {
    expect(EVENT_ACTIVITY_COVERAGE['extreme_heat']).toEqual(
      expect.arrayContaining(['dine_in', 'pick_up', 'delivery'])
    );
    expect(EVENT_ACTIVITY_COVERAGE['extreme_heat']).not.toContain('dine_in_pickup');
    expect(EVENT_ACTIVITY_COVERAGE['extreme_heat']).not.toContain('get_meal_delivered');
  });
});

describe('severity dummy variable naming', () => {
  const events = Object.keys(modelData);

  it.each(events)('%s: getSeverityDummyVariables returns the 4 coefficient-CSV-named dummies', (event) => {
    expect(getSeverityDummyVariables(event)).toEqual([2, 3, 4, 5].map(n => `${event}_imp_${n}`));
  });
});

describe('dependent-variable column mapping (getDvColumn)', () => {
  it('heat transit uses public_transit; every other event uses transit_use', () => {
    expect(getDvColumn('heat', 'use_transit')).toBe('ext_heat_public_transit');
    for (const event of ['cold', 'earthquake', 'flooding', 'powerout']) {
      expect(getDvColumn(event, 'use_transit')).toBe(`ext_${event}_transit_use`);
    }
  });

  it('maps every other activity to its ext_{event}_{suffix} column', () => {
    expect(getDvColumn('heat', 'go_business_as_usual')).toBe('ext_heat_lkly_normal_business');
    expect(getDvColumn('heat', 'stay_home')).toBe('ext_heat_stay_home');
    expect(getDvColumn('heat', 'use_car')).toBe('ext_heat_car_travel');
    expect(getDvColumn('heat', 'work_from_home')).toBe('ext_heat_wfh');
    expect(getDvColumn('heat', 'work_from_office')).toBe('ext_heat_commute');
    expect(getDvColumn('heat', 'dine_in')).toBe('ext_heat_indoor_restaurant');
    expect(getDvColumn('heat', 'pick_up')).toBe('ext_heat_takeout_pickup');
    expect(getDvColumn('heat', 'delivery')).toBe('ext_heat_food_delivery');
  });

  it('every DV column referenced actually exists in the per-event CSVs', () => {
    for (const { event, activity } of ALL_COMBOS) {
      const eventRows = getEventRows(event);
      const dvColumn = getDvColumn(event, activity);
      expect(dvColumn in eventRows[0]).toBe(true);
    }
  });
});

describe('regression guard: severity levels are not collapsed to a binary split', () => {
  const events = Object.keys(modelData);

  it.each(events)('%s: adjacent severity pairs are not collapsed to a null ATE', (event) => {
    const eventRows = getEventRows(event);
    const sameSidePairsUnderOldBug: Array<[number, number]> = [[1, 2], [3, 4]];

    for (const [base, treatment] of sameSidePairsUnderOldBug) {
      const results = computeSeverityATEs(modelData[event], eventRows, {
        event, baseSeverityLevel: base, treatmentSeverityLevel: treatment
      });

      const hasNonTrivialEffect = results.some(r =>
        r.isValid && r.ate.some(delta => Math.abs(delta) > 1e-4)
      );
      expect(hasNonTrivialEffect).toBe(true);
    }
  });

  it.each(events)('%s: two different severity level pairs produce different results for at least one activity', (event) => {
    const eventRows = getEventRows(event);

    const resultsA = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 1, treatmentSeverityLevel: 2
    });
    const resultsB = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 4, treatmentSeverityLevel: 5
    });

    const differsForAtLeastOneActivity = resultsA.some((resultA, index) => {
      const resultB = resultsB[index];
      if (!resultA.isValid || !resultB.isValid) return false;
      return resultA.ate.some((value, i) => Math.abs(value - resultB.ate[i]) > 1e-6);
    });

    expect(differsForAtLeastOneActivity).toBe(true);
  });
});

describe("complete-case sample size vs. model_coefficients_all_events.csv's own n", () => {
  // KNOWN, CONFIRMED DATA-VINTAGE GAP (not a bug in this engine): running
  // Jinghai's own get_model()/dropna() logic in Python directly against the
  // CURRENT public/models/event_data/*.csv files reproduces the exact same
  // sampleSize this engine computes - every coefficient variable AND the
  // activity's DV column have literally zero missing values in these files.
  // But model_coefficients_all_events.csv's reported n (and ATE_Heat.xlsx's
  // N) is smaller for every combo checked, so the coefficients/answer key
  // were fit on an earlier/stricter cut of the data than what's currently
  // shipped in event_data/. The gap is small (single-digit percent) for 33 of
  // 35 combos, and confirmed NOT to matter much: heat/go_business_as_usual's
  // full P_base/P_comp/ATE recomputed on the current 2653-row file (vs the
  // xlsx's fitted 2564) differs by <=0.2 percentage points (see the manual
  // validation against ATE_Heat.xlsx in the PR/commit notes). It's much
  // larger specifically for "go_business_as_usual" (e.g. powerout: 2381 vs
  // 892) - that activity's original estimation sample was apparently
  // restricted well beyond simple column completeness, and there's no
  // equivalent xlsx answer key for powerout to confirm the size of the
  // resulting drift. Flagged, not silently tightened or ignored.
  it.each(ALL_COMBOS)('$event/$activity: sampleSize vs. reported n', ({ event, activity }) => {
    const key = `${event}/${activity}`;
    const expectedN = reportedN.get(key);
    expect(expectedN).toBeDefined();

    const eventRows = getEventRows(event);
    const results = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 1, treatmentSeverityLevel: 5
    });
    const result = results.find(r => r.activity === activity)!;

    // Sanity bound only (not a precision check) - catches gross breakage
    // (e.g. reading the wrong file, DV/variable filtering not applied at
    // all) without asserting exact equality, which the data-vintage gap
    // above makes unreachable with the currently-shipped files.
    expect(result.sampleSize).toBeGreaterThanOrEqual((expectedN as number) * 0.3);
    expect(result.sampleSize).toBeLessThanOrEqual(eventRows.length);
  });
});

describe('worker-only filter (empsta<3) for WFH/WFO', () => {
  const eventsWithWorkFromHomeOrOffice = Object.keys(modelData).filter(event =>
    'work_from_home' in modelData[event] || 'work_from_office' in modelData[event]
  );

  it('covers every event that actually has a WFH/WFO model', () => {
    // heat, cold (both), earthquake, flooding (WFH only) = 4 events; powerout has neither.
    expect(eventsWithWorkFromHomeOrOffice.length).toBe(4);
    expect(eventsWithWorkFromHomeOrOffice).not.toContain('powerout');
  });

  it.each(eventsWithWorkFromHomeOrOffice)('%s: worker filter actually shrinks the sample vs. the unfiltered event population', (event) => {
    const eventRows = getEventRows(event);
    const workerRows = eventRows.filter(row => {
      const empsta = parseFloat(row['empsta'] ?? '');
      return !isNaN(empsta) && empsta < 3;
    });

    expect(workerRows.length).toBeGreaterThan(0);
    expect(workerRows.length).toBeLessThan(eventRows.length);

    const activity = 'work_from_home' in modelData[event] ? 'work_from_home' : 'work_from_office';
    expect(isWorkerOnlyActivity(activity)).toBe(true);

    const results = computeSeverityATEs(modelData[event], eventRows, {
      event, baseSeverityLevel: 1, treatmentSeverityLevel: 5
    });
    const result = results.find(r => r.activity === activity)!;

    expect(result.isValid).toBe(true);
    expect(result.sampleSize).toBeLessThanOrEqual(workerRows.length);
  });
});

describe('computeSegmentATEs - Gender / Age Group / Transit Access', () => {
  const groups = Object.values(SEGMENT_GROUPS);
  const events = Object.keys(modelData);
  const run = (event: string, label: string, comparisonLabel: string) => {
    const g = groups.find(x => x.label === label)!;
    const c = g.comparisons.find(x => x.label === comparisonLabel)!;
    return computeSegmentATEs(modelData[event], getEventRows(event), {
      event, baseSpec: g.baseSpec, comparisonSpec: c.spec
    });
  };

  it('every spec lists all siblings of its group (so siblings are zeroed, never left observed)', () => {
    for (const g of groups) {
      const vars = Object.keys(g.baseSpec);
      for (const c of g.comparisons) {
        expect(Object.keys(c.spec).sort()).toEqual([...vars].sort());
        // dummies within a group are mutually exclusive in a spec
        expect(Object.values(c.spec).reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(1);
      }
    }
  });

  const cases = events.flatMap(event =>
    groups.flatMap(g => g.comparisons.map(c => ({ event, group: g.label, comparison: c.label })))
  );
  it.each(cases)('$event / $group ($comparison): valid 3-level results; inModel=false implies ATE exactly 0', ({ event, group, comparison }) => {
    const results = run(event, group, comparison);
    expect(results.length).toBe(Object.keys(modelData[event]).length);
    for (const r of results) {
      expect(r.isValid).toBe(true);
      expect(r.sampleSize).toBeGreaterThan(0);
      expect(r.ate.length).toBe(3);
      expect(Math.abs(r.conservationCheck)).toBeLessThan(1e-6);
      expect(r.inModel || r.ate.every(a => a === 0)).toBe(true);
    }
  });

  it('inModel matches whether any of the group\'s variables is a coefficient of that activity\'s model', () => {
    for (const event of events) {
      for (const g of groups) {
        const results = run(event, g.label, g.comparisons[0].label);
        for (const r of results) {
          const expected = Object.keys(g.baseSpec).some(v => v in modelData[event][r.activity].coefficients);
          expect(r.inModel).toBe(expected);
        }
      }
    }
  });

  // Spot values from ATE_Heat.xlsx's Segment_ATE sheet (Extreme Heat). The
  // sheet's N is Jinghai's slightly smaller estimation sample (e.g. 2564 vs
  // 2653 here), so values agree to ~0.1-0.2pp, not exactly. GBU rows are the
  // sheet's 5-level rows summed into the 3-category collapse.
  const KEY: Array<{ group: string; comparison: string; activity: string; i: number; pb?: number; pc?: number; ate: number; inModel: boolean }> = [
    { group: 'Age Group', comparison: '31-50', activity: 'use_transit', i: 0, pb: 0.194888, pc: 0.235426, ate: 0.040538, inModel: true },
    { group: 'Age Group', comparison: '65+', activity: 'pick_up', i: 0, pb: 0.177867, pc: 0.249947, ate: 0.07208, inModel: true },
    { group: 'Transit Access', comparison: 'High', activity: 'dine_in', i: 0, pb: 0.216279, pc: 0.257795, ate: 0.041516, inModel: true },
    { group: 'Transit Access', comparison: 'Medium', activity: 'use_transit', i: 0, pb: 0.225104, pc: 0.225104, ate: 0, inModel: true },
    { group: 'Gender', comparison: 'Female', activity: 'go_business_as_usual', i: 2, pb: 0.60336, pc: 0.569415, ate: -0.033945, inModel: true },
    { group: 'Age Group', comparison: '65+', activity: 'go_business_as_usual', i: 0, pb: 0.213995, pc: 0.26866, ate: 0.054665, inModel: true },
    { group: 'Gender', comparison: 'Female', activity: 'use_car', i: 0, ate: 0, inModel: false }
  ];
  it.each(KEY)('heat $activity / $group ($comparison) matches ATE_Heat.xlsx Segment_ATE', (k) => {
    const r = run('heat', k.group, k.comparison).find(x => x.activity === k.activity)!;
    expect(r.inModel).toBe(k.inModel);
    expect(Math.abs(r.ate[k.i] - k.ate)).toBeLessThan(0.003);
    const pbDiff = k.pb === undefined ? 0 : Math.abs(r.controlProbabilities[k.i] - k.pb);
    const pcDiff = k.pc === undefined ? 0 : Math.abs(r.treatmentProbabilities[k.i] - k.pc);
    expect(Math.max(pbDiff, pcDiff)).toBeLessThan(0.003);
  });
});

describe('Household Income (3 tiers) and Housing Type (binary) group definitions', () => {
  it('income has exactly 3 tiers: <$50k base + 2 comparisons; housing is binary', () => {
    const income = SEGMENT_GROUPS.householdIncome;
    expect([income.baseLabel, ...income.comparisons.map(c => c.label)]).toEqual(['Less than $50k', '$50k-$100k', '$100k or higher']);
    expect(income.baseSpec).toEqual({ in50: 1, in50100: 0 });
    const housing = SEGMENT_GROUPS.housingType;
    expect([housing.baseLabel, ...housing.comparisons.map(c => c.label)]).toEqual(['Not stand-alone', 'Stand-alone house']);
    expect(housing.baseSpec).toEqual({ sa_home: 0 });
  });

  it('Risk Aversion is not a defined segment group', () => {
    expect(Object.values(SEGMENT_GROUPS).map(g => g.label).join('|').toLowerCase()).not.toContain('risk');
  });

  it.each(Object.keys(modelData))('%s: sa_home is strictly 0/1 and income dummies are exhaustive 0/1 with no nulls (housing collapse is a plain binary)', (event) => {
    const rows = getEventRows(event);
    for (const row of rows) {
      expect(['0', '1']).toContain(row['sa_home']);
      expect(['0', '1']).toContain(row['in50']);
      expect(['0', '1']).toContain(row['in50100']);
      expect(Number(row['in50']) + Number(row['in50100'])).toBeLessThanOrEqual(1);
    }
  });
});

describe('computeContinuousATE - PR / CR / SE (ate_continuous, mult=0.01 "+1% of SD")', () => {
  const events = Object.keys(modelData);
  const VARS = ['PR', 'CR', 'SE'];

  it.each(events.flatMap(event => VARS.map(variable => ({ event, variable }))))(
    '$event / $variable: valid 3-level results for every activity; inModel=false implies ATE exactly 0',
    ({ event, variable }) => {
      const results = computeContinuousATE(modelData[event], getEventRows(event), { event, variable, mult: 0.01 });
      expect(results.length).toBe(Object.keys(modelData[event]).length);
      for (const r of results) {
        expect(r.isValid).toBe(true);
        expect(r.sampleSize).toBeGreaterThan(0);
        expect(r.ate.length).toBe(3);
        expect(Math.abs(r.conservationCheck)).toBeLessThan(1e-6);
        expect(r.inModel || r.ate.every(a => a === 0)).toBe(true);
      }
    }
  );

  it('inModel matches whether the variable is a coefficient of that activity\'s model', () => {
    for (const event of events) {
      for (const variable of VARS) {
        const results = computeContinuousATE(modelData[event], getEventRows(event), { event, variable, mult: 0.01 });
        for (const r of results) {
          expect(r.inModel).toBe(variable in modelData[event][r.activity].coefficients);
        }
      }
    }
  });

  // Spot values from ATE_Heat.xlsx's Segment_ATE sheet ("+1% of SD" rows).
  // GBU rows there are still 5-level (Very unlikely..Very likely); collapsed
  // here into the same 3-category scale as everywhere else: [VeryUnlikely+
  // Unlikely, Neutral, Likely+VeryLikely]. The sheet's N (2564) is Jinghai's
  // slightly smaller estimation sample vs. the revised file's 2653, so values
  // agree to ~0.001, not exactly (same gap as the discrete groups).
  const KEY: Array<{ variable: string; activity: string; i: number; pb: number; pc: number; ate: number; inModel: boolean }> = [
    { variable: 'CR', activity: 'go_business_as_usual', i: 0, pb: 0.078984 + 0.143748, pc: 0.078894 + 0.143656, ate: -0.00009 - 0.000091, inModel: true },
    { variable: 'CR', activity: 'go_business_as_usual', i: 2, pb: 0.3479 + 0.235129, pc: 0.347952 + 0.235313, ate: 0.000052 + 0.000184, inModel: true },
    { variable: 'SE', activity: 'go_business_as_usual', i: 1, pb: 0.19424, pc: 0.194203, ate: -0.000037, inModel: true },
    { variable: 'PR', activity: 'go_business_as_usual', i: 2, pb: 0.3479 + 0.235129, pc: 0.348018 + 0.235551, ate: 0.000119 + 0.000422, inModel: true },
    { variable: 'CR', activity: 'use_car', i: 2, pb: 0, pc: 0, ate: 0, inModel: false }
  ];
  it.each(KEY)('heat $activity / $variable (+1% of SD) matches ATE_Heat.xlsx Segment_ATE', (k) => {
    const results = computeContinuousATE(modelData['heat'], getEventRows('heat'), { event: 'heat', variable: k.variable, mult: 0.01 });
    const r = results.find(x => x.activity === k.activity)!;
    expect(r.inModel).toBe(k.inModel);
    expect(Math.abs(r.ate[k.i] - k.ate)).toBeLessThan(0.003);
    const pbDiff = k.inModel ? Math.abs(r.controlProbabilities[k.i] - k.pb) : 0;
    const pcDiff = k.inModel ? Math.abs(r.treatmentProbabilities[k.i] - k.pc) : 0;
    expect(Math.max(pbDiff, pcDiff)).toBeLessThan(0.003);
  });
});

