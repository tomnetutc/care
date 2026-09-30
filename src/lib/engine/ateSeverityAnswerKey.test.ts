/**
 * Independent check of the severity engine against Jinghai's own answer key
 * (data/jinghai_2026-09-30/ATE_severity_all_events.csv): all 5 events, 35
 * models, every base/comparison severity pair, every response category
 * (2,100 rows). His CSV stores ~7 significant digits, hence the 1e-6 tolerance.
 */
import * as fs from 'fs';
import * as path from 'path';
import { computeSeverityATEs, ModelDataByEvent } from './computeATE';
import { EVENT_CONFIG } from './eventConfig';

function parse(text: string): Record<string,string>[] {
  const rows: string[][] = []; let row: string[] = []; let f = ''; let q = false;
  for (let i=0;i<text.length;i++){ const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false;} else f+=c; }
    else if(c==='"') q=true;
    else if(c===','){ row.push(f); f=''; }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(f); f=''; if(row.length>1||row[0]!=='') rows.push(row); row=[]; }
    else f+=c; }
  if(f.length||row.length){ row.push(f); rows.push(row); }
  const h=rows[0]; return rows.slice(1).filter(r=>r.length===h.length).map(r=>{const o:any={}; h.forEach((k,i)=>o[k]=r[i]); return o;});
}
const ROOT = path.join(__dirname, '../../..');
const MAP: Record<string,string> = {Car:'use_car',Transit:'use_transit',Home:'stay_home','Dine in':'dine_in','Pick up':'pick_up',Delivery:'delivery',WFH:'work_from_home',WFO:'work_from_office',Usual:'go_business_as_usual'};
const RESP = ['Do less','About the same','Do more'];

test('verify vs Jinghai ATE_severity_all_events.csv', () => {
  jest.spyOn(console,'log').mockImplementation(()=>{});
  jest.spyOn(console,'warn').mockImplementation(()=>{});
  const md: ModelDataByEvent = JSON.parse(fs.readFileSync(path.join(ROOT,'public/models/model_coeffs_by_event.json'),'utf8'));
  const key = parse(fs.readFileSync(path.join(ROOT,'data/jinghai_2026-09-30/ATE_severity_all_events.csv'),'utf8'));
  const cache: any = {}, res: any = {};
  let maxP=0, maxAbs=0, maxPct=0, nBad=0, missing=0; const worst: any[] = [];
  const perEvent: any = {};
  for (const r of key) {
    const ev = r.event;
    const cfg: any = Object.values(EVENT_CONFIG).find((c: any) => c.csvEvent === ev);
    cache[ev] ??= parse(fs.readFileSync(path.join(ROOT,'public/models/event_data',cfg.dataFile),'utf8'));
    const k = `${ev}|${r.base_level}|${r.comp_level}`;
    res[k] ??= computeSeverityATEs(md[ev], cache[ev], {event: ev, baseSeverityLevel: +r.base_level, treatmentSeverityLevel: +r.comp_level});
    const a = res[k].find((x: any) => x.activity === MAP[r.activity]);
    if (!a || !a.isValid) { missing++; continue; }
    const i = RESP.indexOf(r.response);
    const dP = Math.max(Math.abs(a.controlProbabilities[i]-+r.P_base), Math.abs(a.treatmentProbabilities[i]-+r.P_comp));
    const dA = Math.abs(a.ate[i]-+r.ATE_abs);
    const pct = a.controlProbabilities[i] ? a.ate[i]/a.controlProbabilities[i]*100 : 0;
    const dPct = Math.abs(pct-+r.ATE_pct);
    if (a.sampleSize !== +r.n) nBad++;
    maxP=Math.max(maxP,dP); maxAbs=Math.max(maxAbs,dA); maxPct=Math.max(maxPct,dPct);
    perEvent[ev] ??= {rows:0,maxAbs:0}; perEvent[ev].rows++; perEvent[ev].maxAbs=Math.max(perEvent[ev].maxAbs,dA);
    if (dA>1e-6) worst.push([r.event,r.activity,r.base_level,r.comp_level,r.response,dA]);
  }
  expect(key.length).toBe(2100);
  expect(missing).toBe(0);
  expect(nBad).toBe(0);
  expect(maxP).toBeLessThan(1e-6);
  expect(maxAbs).toBeLessThan(1e-6);
  expect(worst).toEqual([]);
});
