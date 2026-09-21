/**
 * Static event metadata for the severity ATE engine - which per-event data
 * file (public/models/event_data/{event}_data.csv) backs each event, and
 * which activities have a real model for each event (from
 * model_coefficients_all_events.csv: heat/cold have all 9 activities;
 * powerout has 7 (no WFH/WFO); earthquake/flooding have 5 (Usual, Home, Car,
 * Transit, WFH only - no Dine in/Pick up/Delivery, no WFO)).
 *
 * Deliberately has zero dependencies (no react, no DataService/d3) so it can
 * be imported by both the React hook and by Jest integration tests without
 * pulling in d3 (ESM-only, not transformable under the current CRA Jest
 * config) or react-router-dom.
 */

// Internal event id -> {csv event key (model_coeffs_by_event.json), per-event data file}
export const EVENT_CONFIG: Record<string, { csvEvent: string; dataFile: string }> = {
  'extreme_heat': { csvEvent: 'heat', dataFile: 'heat_data.csv' },
  'extreme_cold': { csvEvent: 'cold', dataFile: 'cold_data.csv' },
  'major_flooding': { csvEvent: 'flooding', dataFile: 'flooding_data.csv' },
  'major_earthquake': { csvEvent: 'earthquake', dataFile: 'earthquake_data.csv' },
  'power_outage': { csvEvent: 'powerout', dataFile: 'powerout_data.csv' }
};

export const EVENT_ACTIVITY_COVERAGE: Record<string, string[]> = {
  'extreme_heat': ['use_car', 'use_transit', 'stay_home', 'dine_in', 'pick_up', 'delivery', 'work_from_home', 'work_from_office', 'go_business_as_usual'],
  'extreme_cold': ['use_car', 'use_transit', 'stay_home', 'dine_in', 'pick_up', 'delivery', 'work_from_home', 'work_from_office', 'go_business_as_usual'],
  'power_outage': ['use_car', 'use_transit', 'stay_home', 'dine_in', 'pick_up', 'delivery', 'go_business_as_usual'],
  'major_earthquake': ['use_car', 'use_transit', 'stay_home', 'work_from_home', 'go_business_as_usual'],
  'major_flooding': ['use_car', 'use_transit', 'stay_home', 'work_from_home', 'go_business_as_usual']
};
