import fs from 'fs';
import path from 'path';
import {
  EXT_EVENTS,
  EXT_MODULE_NONE,
  extImpactColumn,
  extModuleFilterValues,
  getExtModuleKey,
} from './extremeEventModule';

const EVENT_KEYS = EXT_EVENTS.map(e => e.key as string);

// Same rule the chart hooks and the filter palette apply: OR within a field, matching String(row[field]).
const matches = (row: Record<string, any>, values: string[]) => values.includes(String(row.ext_module));

describe('getExtModuleKey', () => {
  const row = (answers: Record<string, string>) => {
    const r: Record<string, string> = {};
    EVENT_KEYS.forEach(k => { r[extImpactColumn(k)] = answers[k] ?? '-9'; });
    return r;
  };

  test('no module answered -> none', () => {
    expect(getExtModuleKey(row({}))).toBe(EXT_MODULE_NONE);
  });

  test('one module -> that event', () => {
    expect(getExtModuleKey(row({ flooding: '3' }))).toBe('flooding');
  });

  test('two modules -> canonical order regardless of column order', () => {
    expect(getExtModuleKey(row({ cold: '2', heat: '5' }))).toBe('heat+cold');
    expect(getExtModuleKey(row({ powerout: '1', earthquake: '4' }))).toBe('earthquake+powerout');
  });

  test('-9, blank and a missing column all mean "did not answer"; every answer 1-5 counts', () => {
    expect(getExtModuleKey({ ext_heat_impact_wlb: '', ext_cold_impact_wlb: '-9' })).toBe(EXT_MODULE_NONE);
    ['1', '2', '3', '4', '5'].forEach(v => expect(getExtModuleKey(row({ heat: v }))).toBe('heat'));
  });
});

describe('extModuleFilterValues', () => {
  test('16 keys per event, each containing the event, no repeats', () => {
    EVENT_KEYS.forEach(k => {
      const values = extModuleFilterValues(k);
      expect(values).toHaveLength(16);
      expect(new Set(values).size).toBe(16);
      values.forEach(v => expect(v.split('+')).toContain(k));
    });
  });

  test('a shared pair is reachable from both of its events, but not from a third', () => {
    expect(extModuleFilterValues('heat')).toContain('heat+cold');
    expect(extModuleFilterValues('cold')).toContain('heat+cold');
    expect(extModuleFilterValues('flooding')).not.toContain('heat+cold');
  });

  test('all five events together cover every non-empty combination (31) and never "none"', () => {
    const all = new Set(EVENT_KEYS.flatMap(extModuleFilterValues));
    expect(all.size).toBe(31);
    expect(all.has(EXT_MODULE_NONE)).toBe(false);
  });
});

// ── Against the real survey data ─────────────────────────────────────────────
// public/df_dashboard.csv (5,082 respondents). If the survey file is replaced these pinned totals are meant
// to fail, so the numbers shown in the Survey Explorer get re-checked.
function readCsv(file: string): Record<string, string>[] {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { cur.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      cur.push(field); field = '';
      if (cur.length > 1 || cur[0] !== '') rows.push(cur);
      cur = [];
    } else field += c;
  }
  if (field !== '' || cur.length) { cur.push(field); rows.push(cur); }
  const [header, ...body] = rows;
  return body.map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

describe('Extreme Event Module filter on df_dashboard.csv', () => {
  const data = readCsv(path.join(__dirname, '../../public/df_dashboard.csv'));
  data.forEach(r => { (r as any).ext_module = getExtModuleKey(r); });
  const answered = (r: Record<string, string>, k: string) => r[extImpactColumn(k)] !== '-9';
  const pick = (...keys: string[]) => Array.from(new Set(keys.flatMap(extModuleFilterValues)));

  test('dataset is the one these numbers were checked against', () => {
    expect(data).toHaveLength(5082);
    expect(data.filter(r => (r as any).ext_module === EXT_MODULE_NONE)).toHaveLength(304);
  });

  test.each([
    ['heat', 2650],
    ['cold', 2430],
    ['flooding', 1076],
    ['earthquake', 610],
    ['powerout', 2379],
  ])('ticking only %s keeps exactly the respondents whose ext_<event>_impact_wlb is not -9 (%i)', (k, expected) => {
    const kept = data.filter(r => matches(r, pick(k)));
    expect(kept).toHaveLength(expected);
    expect(kept.length).toBe(data.filter(r => answered(r, k)).length);
  });

  test('ticking two events keeps respondents who answered at least one of them (no double counting)', () => {
    const kept = data.filter(r => matches(r, pick('heat', 'cold')));
    expect(kept.length).toBe(data.filter(r => answered(r, 'heat') || answered(r, 'cold')).length);
    const both = data.filter(r => answered(r, 'heat') && answered(r, 'cold')).length;
    expect(kept.length).toBe(2650 + 2430 - both);
  });

  test('ticking all five is the same as no module filter except for respondents who answered none', () => {
    expect(data.filter(r => matches(r, pick(...EVENT_KEYS)))).toHaveLength(5082 - 304);
  });

  test('every respondent has exactly one key, and it is one the filter can produce or "none"', () => {
    const producible = new Set<string>([EXT_MODULE_NONE, ...EVENT_KEYS.flatMap(extModuleFilterValues)]);
    data.forEach(r => expect(producible.has((r as any).ext_module)).toBe(true));
  });
});
