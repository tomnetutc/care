/**
 * Independent check of Section 3 (Population Segment Analysis) against Jinghai's own answer key
 * (data/jinghai_2026-10-01/ATE_segments_by_model.xlsx, flattened to the .csv next to it):
 * all 5 events, all 35 models, 41 rows each (35 discrete comparisons + PR/CR/SE at "+1% of SD"
 * and "+1 SD") = 1,435 rows x 3 response categories. Every row's in-model flag, P_base, P_comp,
 * ATE_abs and ATE_pct must match. Tolerances reflect the precision of his file (his percentages
 * are stored to ~1e-4).
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  computeSegmentATEs,
  computeContinuousATE,
  ModelDataByEvent,
  SegmentATEResult
} from './computeATE';
import { EVENT_CONFIG } from './eventConfig';
import { SEGMENT_GROUPS } from './segmentConfig';

function parse(text: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = []; let f = ''; let q = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(f); f = ''; if (row.length > 1 || row[0] !== '') rows.push(row); row = []; }
    else f += c; }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  const h = rows[0]; return rows.slice(1).filter(r => r.length === h.length).map(r => { const o: any = {}; h.forEach((k, i) => o[k] = r[i]); return o; });
}

const ROOT = path.join(__dirname, '../../..');
const ACTIVITY: Record<string, string> = {
  'Using a car for traveling': 'use_car', 'Having food delivered': 'delivery', 'Eating indoors at a restaurant': 'dine_in',
  'Staying at home': 'stay_home', 'Picking up takeout': 'pick_up', 'Taking public transit': 'use_transit',
  'Go about business as usual': 'go_business_as_usual', 'Working from home': 'work_from_home', 'Working from the office': 'work_from_office'
};
const EVENT: Record<string, string> = { 'Extreme Heat': 'heat', 'Extreme Cold': 'cold', 'Power Outage': 'powerout', 'Earthquakes': 'earthquake', 'Flooding': 'flooding' };

// His (variable_group | comparison) -> our SEGMENT_GROUPS key + comparison label.
const DISCRETE: Record<string, [string, string]> = {
  'Gender|Female': ['gender', 'Female'],
  'Age Group|31-50': ['age', '31-50'], 'Age Group|51-65': ['age', '51-65'], 'Age Group|65+': ['age', '65+'],
  'Household Income|$50k-$100k': ['householdIncome', '$50k-$100k'], 'Household Income|$100k or higher': ['householdIncome', '$100k or higher'],
  'Household Size|1 person': ['householdSize', '1 person'], 'Household Size|2 persons': ['householdSize', '2 persons'],
  'Child in household|Has child': ['childInHousehold', 'Has child'],
  'Disability|Has disability': ['disability', 'Has disability'],
  'Works outdoors|Yes': ['worksOutdoors', 'Yes'],
  'Zero-vehicle HH|Zero vehicle': ['zeroVehicleHousehold', 'Zero vehicle'],
  'Stand-alone house|Stand-alone house': ['housingType', 'Stand-alone house'],
  'Rural|Rural': ['rural', 'Rural'],
  'Population Density|Medium': ['populationDensity', 'Medium'], 'Population Density|High': ['populationDensity', 'High'],
  'Transit Access|Medium': ['transitAccess', 'Medium'], 'Transit Access|High': ['transitAccess', 'High'],
  'Walkability Index|Low': ['walkabilityIndex', 'Low'], 'Walkability Index|High': ['walkabilityIndex', 'High'], 'Walkability Index|Very high': ['walkabilityIndex', 'Very high'],
  'Employment status|Non-worker': ['employmentStatus', 'Non-worker'],
  'Race|White': ['race', 'White'], 'Race|Black': ['race', 'Black'], 'Race|Asian': ['race', 'Asian'],
  'Hispanic|Hispanic': ['ethnicityHispanic', 'Hispanic'],
  'Education (edu_bs)|edu_bs = 1': ['educationBachelors', 'Has BS'],
  'Education (bs_grad)|bs_grad = 1': ['educationBsOrHigher', 'BS or higher'],
  'Telecommute (tcom_no)|tcom_no = 1': ['doesNotTelecommute', 'Does not telecommute'],
  'Air conditioning (ac_c)|ac_c = 1': ['airConditioning', 'Has A/C'],
  'Employment Density|Medium': ['employmentDensity', 'Medium'], 'Employment Density|High': ['employmentDensity', 'High'],
  'Land-use Diversity|High': ['landUseDiversity', 'High'],
  'Network Density|Medium': ['networkDensity', 'Medium'], 'Network Density|High': ['networkDensity', 'High']
};
const CONTINUOUS: Record<string, string> = { 'Personal Resilience': 'PR', 'Community Resilience': 'CR', 'Social Engagement': 'SE' };

describe("Section 3 vs Jinghai's ATE_segments_by_model.xlsx (1,435 rows x 3 responses)", () => {
  const md: ModelDataByEvent = JSON.parse(fs.readFileSync(path.join(ROOT, 'public/models/model_coeffs_by_event.json'), 'utf8'));
  const key = parse(fs.readFileSync(path.join(ROOT, 'data/jinghai_2026-10-01/ATE_segments_by_model.csv'), 'utf8'));
  const dataCache: Record<string, Record<string, string>[]> = {};
  const resultCache: Record<string, any[]> = {};

  const eventRows = (ev: string) => {
    const cfg: any = Object.values(EVENT_CONFIG).find((c: any) => c.csvEvent === ev);
    return (dataCache[ev] ??= parse(fs.readFileSync(path.join(ROOT, 'public/models/event_data', cfg.dataFile), 'utf8')));
  };
  const resultsFor = (ev: string, variable: string, comparison: string): any[] => {
    const id = `${ev}|${variable}|${comparison}`;
    if (resultCache[id]) return resultCache[id];
    if (CONTINUOUS[variable]) {
      const mult = comparison === '+1% of SD' ? 0.01 : 1;
      return (resultCache[id] = computeContinuousATE(md[ev], eventRows(ev), { event: ev, variable: CONTINUOUS[variable], mult }));
    }
    const [groupKey, label] = DISCRETE[`${variable}|${comparison}`];
    const g = SEGMENT_GROUPS[groupKey];
    const c = g.comparisons.find(x => x.label === label)!;
    return (resultCache[id] = computeSegmentATEs(md[ev], eventRows(ev), { event: ev, baseSpec: g.baseSpec, comparisonSpec: c.spec }));
  };

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('has the expected shape: 35 models x 41 rows, and every key row maps to a configured comparison', () => {
    expect(key.length).toBe(35 * 41);
    for (const r of key) {
      const id = `${r.variable_group}|${r.comparison}`;
      expect(CONTINUOUS[r.variable_group] !== undefined || DISCRETE[id] !== undefined).toBe(true);
    }
  });

  it('every configured discrete comparison appears in his file, and vice versa (page rows == his rows)', () => {
    const ours = new Set(Object.values(SEGMENT_GROUPS).flatMap(g => g.comparisons.map(c => `${g.label}|${c.label}`)));
    expect(ours.size).toBe(Object.keys(DISCRETE).length);
    const mapped = new Set(Object.values(DISCRETE).map(([k, l]) => `${SEGMENT_GROUPS[k].label}|${l}`));
    expect(Array.from(ours).sort()).toEqual(Array.from(mapped).sort());
  });

  it('every row: in-model flag, P_base, P_comp, ATE_abs and ATE_pct match for all 3 responses', () => {
    let maxP = 0, maxAbs = 0, maxPct = 0, flagMismatch = 0, nMismatch = 0, notInModelNonZero = 0;
    const bad: any[] = [];
    for (const r of key) {
      const ev = EVENT[r.event]; const act = ACTIVITY[r.activity];
      const res: SegmentATEResult | undefined = resultsFor(ev, r.variable_group, r.comparison).find((x: any) => x.activity === act);
      if (!res) { bad.push(['missing', r.sheet, r.variable_group, r.comparison]); continue; }
      const inModel = r.in_model === 'TRUE';
      if (res.inModel !== inModel) { flagMismatch++; bad.push(['flag', r.sheet, r.variable_group, r.comparison, inModel, res.inModel]); continue; }
      if (res.sampleSize !== +r.n) nMismatch++;
      const pBase = [r.P_base_less, r.P_base_same, r.P_base_more].map(Number);
      const pComp = [r.P_comp_less, r.P_comp_same, r.P_comp_more].map(Number);
      const abs = [r.ATE_abs_less, r.ATE_abs_same, r.ATE_abs_more].map(Number);
      const pct = [r.ATE_pct_less, r.ATE_pct_same, r.ATE_pct_more].map(Number);
      for (let i = 0; i < 3; i++) {
        if (!inModel) {
          // not in model: his ATE is exactly 0 and ours must be too
          if (res.ate[i] !== 0 || abs[i] !== 0) notInModelNonZero++;
          continue;
        }
        const ourPct = res.controlProbabilities[i] ? (res.ate[i] / res.controlProbabilities[i]) * 100 : 0;
        const dP = Math.max(Math.abs(res.controlProbabilities[i] - pBase[i]), Math.abs(res.treatmentProbabilities[i] - pComp[i]));
        const dA = Math.abs(res.ate[i] - abs[i]);
        const dPct = Math.abs(ourPct - pct[i]);
        maxP = Math.max(maxP, dP); maxAbs = Math.max(maxAbs, dA); maxPct = Math.max(maxPct, dPct);
        if (dP > 1e-6 || dA > 1e-6 || dPct > 1e-3) bad.push(['num', r.sheet, r.variable_group, r.comparison, i, dP, dA, dPct]);
      }
    }
    expect(bad).toEqual([]);
    expect(flagMismatch).toBe(0);
    expect(nMismatch).toBe(0);
    expect(notInModelNonZero).toBe(0);
    expect(maxP).toBeLessThan(1e-6);
    expect(maxAbs).toBeLessThan(1e-6);
    expect(maxPct).toBeLessThan(1e-3);
  });
});
