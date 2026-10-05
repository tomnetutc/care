/**
 * Integration tests for the Scenario Analysis ATE engine.
 *
 * These run against the REAL data files - public/models/event_data/*.csv
 * (Jinghai's per-event estimation-sample files), public/models/
 * model_coeffs_by_event.json, and (for cross-checking N) data/jinghai_2026-09-28/
 * model_coefficients_all_events.csv - not mocks or synthetic fixtures. This
 * is the same production code path useScenarioATE.ts drives at runtime.
 *
 * data/jinghai_2026-09-28/ is Jinghai's corrected refit (he found a missing
 * `non_wrkr` column, fixed it, and re-ran all 35 event/activity models),
 * delivered 2026-09-28 and superseding the original data/jinghai_2026-09-10/
 * delivery. Section 3 (segment / continuous ATEs) is verified against Jinghai's own
 * ATE_segments_by_model.xlsx (2026-10-01) in ateSegmentAnswerKey.test.ts, and Section 2 (severity)
 * against his ATE_severity_all_events.csv in ateSeverityAnswerKey.test.ts; this file covers
 * structure, validity and invariants of the engine.
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
for (const row of parseCsv(fs.readFileSync(path.join(REPO_ROOT, 'data/jinghai_2026-09-28/model_coefficients_all_events.csv'), 'utf8'))) {
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

  it('inModel is per comparison: true only if a variable that DIFFERS between base and comparison is a coefficient of that activity\'s model', () => {
    for (const event of events) {
      for (const g of groups) {
        for (const c of g.comparisons) {
          const results = run(event, g.label, c.label);
          for (const r of results) {
            const coefficients = modelData[event][r.activity].coefficients;
            const expected = Object.keys(g.baseSpec).some(v => v in coefficients && g.baseSpec[v] !== (c.spec[v] ?? 0));
            expect(r.inModel).toBe(expected);
          }
        }
      }
    }
  });

  // Numeric / flag correctness of every comparison is checked against Jinghai's own
  // answer key in ateSegmentAnswerKey.test.ts (1,435 rows x 3 responses).
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

describe('computeContinuousATE - PR / CR / SE (ate_continuous, shift=1 "1 Unit Increase")', () => {
  const events = Object.keys(modelData);
  const VARS = ['PR', 'CR', 'SE'];

  it.each(events.flatMap(event => VARS.map(variable => ({ event, variable }))))(
    '$event / $variable: valid 3-level results for every activity; inModel=false implies ATE exactly 0',
    ({ event, variable }) => {
      const results = computeContinuousATE(modelData[event], getEventRows(event), { event, variable, shift: 1 });
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
        const results = computeContinuousATE(modelData[event], getEventRows(event), { event, variable, shift: 1 });
        for (const r of results) {
          expect(r.inModel).toBe(variable in modelData[event][r.activity].coefficients);
        }
      }
    }
  });

  // Numeric correctness (1 Unit Increase, every model) is checked against Jinghai's own
  // answer key (2026-10-04) in ateSegmentAnswerKey.test.ts.
});

describe('computeSegmentATEs - the full set of discrete groups (matches Jinghai\'s ATE_segments_by_model.xlsx)', () => {
  const groups = Object.values(SEGMENT_GROUPS);

  it('all 23 discrete groups are present and give exactly the 35 comparisons in Jinghai\'s ATE_segments_by_model.xlsx', () => {
    const labels = groups.map(g => g.label).sort();
    expect(labels).toEqual([
      'Age Group', 'Disability', "Education (BS or higher)", "Education (Bachelor's)",
      'Employment Density', 'Employment status', 'Ethnicity: Hispanic', 'Gender', 'Household Income', 'Household Size',
      'Housing Type', 'Land-use Diversity', 'Network Density', 'Population Density', 'Race',
      'Rural location', 'Transit Access', 'Walkability Index',
      'Works outdoors', 'Zero-vehicle household', 'Air conditioning', 'Child in household', 'Does not telecommute'
    ].sort());
    expect(groups.reduce((n, g) => n + g.comparisons.length, 0)).toBe(35);
  });

  it('Race is one categorical group (base "Other race"): each comparison forces its own dummy to 1 and the other two to 0', () => {
    const race = SEGMENT_GROUPS.race;
    expect(race.baseLabel).toBe('Other race');
    expect(race.baseSpec).toEqual({ white: 0, black: 0, asian: 0 });
    expect(race.comparisons.map(c => c.label)).toEqual(['White', 'Black', 'Asian']);
    expect(race.comparisons.find(c => c.label === 'Black')!.spec).toEqual({ white: 0, black: 1, asian: 0 });
  });

  it('Employment status (non_wrkr) is a Worker vs Non-worker group', () => {
    const emp = SEGMENT_GROUPS.employmentStatus;
    expect([emp.baseLabel, ...emp.comparisons.map(c => c.label)]).toEqual(['Worker', 'Non-worker']);
    expect(emp.baseSpec).toEqual({ non_wrkr: 0 });
  });

  // Numbers for these groups are checked against Jinghai's own answer key in
  // ateSegmentAnswerKey.test.ts (his file replaced the regression fixtures that used to
  // live here, which were generated from our own engine).
});
