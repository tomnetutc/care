// Extreme event module membership, used by the Survey Explorer "Extreme Event Module" filter.
//
// Every respondent was asked about up to two of the five extreme events. A respondent "responded to the
// module" for an event when ext_<event>_impact_wlb holds a real answer (1-5); -9 means the module was not
// asked / not answered. In df_dashboard.csv a respondent has answered 0, 1 or 2 modules.
//
// The chart hooks filter by plain equality on ONE field per row (values.includes(String(row[field]))), and a
// respondent can belong to two modules, so membership is stored as a single canonical key per row
// (EXT_MODULE_FIELD = e.g. 'heat+cold', or 'none'). Ticking an event in the filter palette then selects every
// key that contains that event (extModuleFilterValues), which the unchanged predicates match with OR.

export const EXT_MODULE_FIELD = 'ext_module';
export const EXT_MODULE_NONE = 'none';
const NOT_ANSWERED = '-9';

// Canonical order. Keys are always joined in this order, so each combination has exactly one spelling.
export const EXT_EVENTS = [
  { key: 'heat', label: 'Heat' },
  { key: 'cold', label: 'Cold' },
  { key: 'flooding', label: 'Flooding' },
  { key: 'earthquake', label: 'Earthquake' },
  { key: 'powerout', label: 'Power outage' },
] as const;

export const extImpactColumn = (eventKey: string): string => `ext_${eventKey}_impact_wlb`;

// True when the respondent gave a real answer for this event's module (anything other than -9 / blank).
export function answeredExtModule(row: Record<string, any>, eventKey: string): boolean {
  const raw = row[extImpactColumn(eventKey)];
  if (raw === undefined || raw === null) return false;
  const v = String(raw).trim();
  return v !== '' && v !== NOT_ANSWERED;
}

// Canonical membership key for one respondent: 'none', a single event ('heat'), or two or more joined in
// canonical order ('heat+cold', never 'cold+heat').
export function getExtModuleKey(row: Record<string, any>): string {
  const answered = EXT_EVENTS.filter(e => answeredExtModule(row, e.key)).map(e => e.key);
  return answered.length === 0 ? EXT_MODULE_NONE : answered.join('+');
}

// Every key a respondent can have that includes the given event: all non-empty combinations of the five
// events (in canonical order) that contain it. 16 keys per event.
export function extModuleFilterValues(eventKey: string): string[] {
  const keys = EXT_EVENTS.map(e => e.key as string);
  const out: string[] = [];
  for (let mask = 1; mask < 1 << keys.length; mask++) {
    const combo = keys.filter((_, i) => mask & (1 << i));
    if (combo.includes(eventKey)) out.push(combo.join('+'));
  }
  return out;
}
