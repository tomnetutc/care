/**
 * React Hook for Scenario Analysis ATE Computation
 *
 * Manages state and provides ATE computation functionality for the Scenario
 * Analysis component. Coefficients come from Jinghai's per-event models
 * (public/models/model_coeffs_by_event.json). Respondent data comes directly
 * from Jinghai's per-event files (public/models/event_data/{event}_data.csv,
 * via DataService.getEventScenarioData()) - NOT df_output.csv. Per Jinghai,
 * these are the ground-truth estimation-sample files for these models: each
 * is already restricted to that event's respondents (no ext_{event} filter
 * needed here), and carries the severity dummies under the same names the
 * coefficients use. This is a deliberate second, separate data source from
 * df_output.csv - Survey Explorer and every other dashboard feature still
 * read df_output.csv/df_dashboard.csv exclusively via DataService.getData()/
 * getScenarioData(), untouched by this.
 *
 * NOTE: the segmentation filters set via the Command Palette filter modal
 * (gender, age_category, race, travel_disability, household_income_category -
 * see TopMenu.tsx) are NOT applied here. Jinghai's per-event files use
 * different field names/encodings for these (female, age_3150/5165/65p
 * dummies, dis_yes, race_cat, income_cat - no age_category equivalent at
 * all), with no derived-field mapping to the filter modal's vocabulary.
 * Flagging rather than guessing at that mapping.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import DataService from '../services/DataService';
import {
  computeSeverityATEs,
  computeContinuousATE,
  computeSegmentATEs,
  ATEResult,
  ContinuousATEResult,
  SegmentATEResult,
  EventModelData,
  ModelDataByEvent,
  validateModelData
} from '../lib/engine/computeATE';
import { EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE } from '../lib/engine/eventConfig';
import { SEGMENT_GROUPS } from '../lib/engine/segmentConfig';

export { EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE };

// Population Segment Analysis's continuous attitude rows (Personal
// Resilience, Community Resilience, Social Engagement). Per Jinghai
// (2026-10-04, ATE_Calculation_10.4.ipynb) the treatment is "1 Unit Increase":
// +1.0 on the construct's own normalized scale from each respondent's current
// value, consistent with the paper. This replaces the earlier "+1% of SD"
// definition, which he withdrew as wrong (it produced near-zero effects).
const CONTINUOUS_VARIABLES = ['PR', 'CR', 'SE'];
const CONTINUOUS_SHIFT = 1;

/** Key used in segmentResults for one (group, comparison) pair - e.g. "age::65+". */
export function segmentResultKey(groupKey: string, comparisonLabel: string): string {
  return `${groupKey}::${comparisonLabel}`;
}

export interface ScenarioState {
  selectedEvent: string;
  baseSeverityLevel: number;
  treatmentSeverityLevel: number;
  anticipatedChange: 'do_less' | 'about_same' | 'do_more' | null;
  isComputing: boolean;
  results: ATEResult[];
  continuousResults: Record<string, ContinuousATEResult[]>;
  segmentResults: Record<string, SegmentATEResult[]>;
  /** Event the severity `results` were computed for (null until the first compute). */
  resultsEvent: string | null;
  /** Event the continuous/segment results belong to (null until the first compute). */
  segmentsEvent: string | null;
  error: string | null;
  modelData: ModelDataByEvent | null;
  isValid: boolean;
}

interface EventLevelResults {
  continuousResults: Record<string, ContinuousATEResult[]>;
  segmentResults: Record<string, SegmentATEResult[]>;
}

/**
 * Resolves after the browser has had a chance to paint. Used to put the fast
 * severity results on screen before the heavier per-event work starts. The
 * timeout fallback keeps it from hanging in a hidden tab, where
 * requestAnimationFrame is paused.
 */
const nextPaint = (): Promise<void> =>
  new Promise(resolve => {
    let done = false;
    const finish = () => { if (!done) { done = true; setTimeout(resolve, 0); } };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(finish);
    setTimeout(finish, 60);
  });

export const useScenarioATE = () => {
  const [state, setState] = useState<ScenarioState>({
    selectedEvent: 'extreme_heat',
    baseSeverityLevel: 1, // "Not severe at all"
    treatmentSeverityLevel: 5, // "Extremely severe"
    anticipatedChange: 'do_more',
    isComputing: false,
    results: [],
    continuousResults: {},
    segmentResults: {},
    resultsEvent: null,
    segmentsEvent: null,
    error: null,
    modelData: null,
    isValid: false
  });

  // Continuous + segment ATEs depend only on the event (not on the severity
  // pair or the response button), so each event's are computed once and kept.
  const eventLevelCache = useRef<Map<string, EventLevelResults>>(new Map());
  // Monotonic ids so a slow, superseded computation can never overwrite a newer one.
  const severityRequest = useRef(0);
  const eventLevelRequest = useRef(0);

  // Load the full per-event model data once on mount.
  useEffect(() => {
    const loadModelData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/models/model_coeffs_by_event.json`);
        if (!response.ok) {
          throw new Error('Failed to load model data');
        }

        const modelData: ModelDataByEvent = await response.json();

        const isValid = Object.values(modelData).every(eventModel => validateModelData(eventModel as EventModelData));

        setState(prev => ({
          ...prev,
          modelData,
          isValid,
          error: isValid ? null : 'Invalid model data structure'
        }));
      } catch (error) {
        console.error('Error loading model data:', error);
        setState(prev => ({
          ...prev,
          error: (error as Error).message,
          isValid: false
        }));
      }
    };

    loadModelData();
  }, []);

  const setSelectedEvent = useCallback((event: string) => {
    setState(prev => ({ ...prev, selectedEvent: event }));
  }, []);

  const setBaseSeverityLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, baseSeverityLevel: level }));
  }, []);

  const setTreatmentSeverityLevel = useCallback((level: number) => {
    setState(prev => ({ ...prev, treatmentSeverityLevel: level }));
  }, []);

  const setAnticipatedChange = useCallback((change: 'do_less' | 'about_same' | 'do_more' | null) => {
    setState(prev => ({ ...prev, anticipatedChange: change }));
  }, []);

  // Severity ATEs: depend on event + the base/comparison severity pair. Fast
  // (one pass over each activity's sample), so this runs on every such change.
  const computeSeverity = useCallback(async () => {
    if (!state.modelData || !state.isValid) {
      setState(prev => ({ ...prev, error: 'Model data not loaded or invalid' }));
      return;
    }

    const eventConfig = EVENT_CONFIG[state.selectedEvent];
    if (!eventConfig) {
      setState(prev => ({ ...prev, error: `Unknown event: ${state.selectedEvent}` }));
      return;
    }

    const requestId = ++severityRequest.current;
    setState(prev => ({ ...prev, isComputing: true, error: null }));

    try {
      // Already restricted to this event's respondents - no ext_{event}
      // filter needed, unlike the old df_output.csv path.
      const filteredData = await DataService.getInstance().getEventScenarioData(eventConfig.dataFile);

      const eventModelData = state.modelData[eventConfig.csvEvent];
      if (!eventModelData) {
        throw new Error(`No model data for event: ${eventConfig.csvEvent}`);
      }

      const results = computeSeverityATEs(eventModelData, filteredData, {
        event: eventConfig.csvEvent,
        baseSeverityLevel: state.baseSeverityLevel,
        treatmentSeverityLevel: state.treatmentSeverityLevel
      });

      if (requestId !== severityRequest.current) return; // superseded by a newer request

      if (process.env.NODE_ENV !== 'production') {
        console.debug('ATE severity computation:', {
          selectedEvent: state.selectedEvent,
          baseSeverityLevel: state.baseSeverityLevel,
          treatmentSeverityLevel: state.treatmentSeverityLevel,
          filteredDataLength: filteredData.length,
          results: results.map(r => ({ activity: r.activity, ate: r.ate.map(v => v.toFixed(4)), isValid: r.isValid, sampleSize: r.sampleSize }))
        });
      }

      setState(prev => ({ ...prev, results, resultsEvent: state.selectedEvent, isComputing: false, error: null }));
    } catch (error) {
      if (requestId !== severityRequest.current) return;
      console.error('Error computing ATEs:', error);
      setState(prev => ({
        ...prev,
        isComputing: false,
        error: (error as Error).message
      }));
    }
  }, [state.modelData, state.isValid, state.selectedEvent, state.baseSeverityLevel, state.treatmentSeverityLevel]);

  // Continuous (PR/CR/SE) + population-segment ATEs: depend only on the event.
  // Computed once per event, after the severity results have been painted, and
  // served from cache when the user comes back to an event.
  const computeEventLevel = useCallback(async () => {
    if (!state.modelData || !state.isValid) return;
    const eventId = state.selectedEvent;
    const eventConfig = EVENT_CONFIG[eventId];
    if (!eventConfig) return;

    const requestId = ++eventLevelRequest.current;

    try {
      const cached = eventLevelCache.current.get(eventId);
      if (cached) {
        setState(prev => ({ ...prev, ...cached, segmentsEvent: eventId }));
        return;
      }

      const filteredData = await DataService.getInstance().getEventScenarioData(eventConfig.dataFile);
      await nextPaint();
      if (requestId !== eventLevelRequest.current) return;

      const eventModelData = state.modelData[eventConfig.csvEvent];
      if (!eventModelData) {
        throw new Error(`No model data for event: ${eventConfig.csvEvent}`);
      }

      const continuousResults: Record<string, ContinuousATEResult[]> = {};
      for (const variable of CONTINUOUS_VARIABLES) {
        continuousResults[variable] = computeContinuousATE(eventModelData, filteredData, {
          event: eventConfig.csvEvent,
          variable,
          shift: CONTINUOUS_SHIFT
        });
      }

      const segmentResults: Record<string, SegmentATEResult[]> = {};
      for (const [groupKey, group] of Object.entries(SEGMENT_GROUPS)) {
        for (const comparison of group.comparisons) {
          segmentResults[segmentResultKey(groupKey, comparison.label)] = computeSegmentATEs(eventModelData, filteredData, {
            event: eventConfig.csvEvent,
            baseSpec: group.baseSpec,
            comparisonSpec: comparison.spec
          });
        }
      }

      eventLevelCache.current.set(eventId, { continuousResults, segmentResults });
      if (requestId !== eventLevelRequest.current) return;
      setState(prev => ({ ...prev, continuousResults, segmentResults, segmentsEvent: eventId }));
    } catch (error) {
      if (requestId !== eventLevelRequest.current) return;
      console.error('Error computing population-segment ATEs:', error);
      setState(prev => ({ ...prev, error: (error as Error).message }));
    }
  }, [state.modelData, state.isValid, state.selectedEvent]);

  // Recompute everything for the current configuration (kept for callers that
  // want an explicit refresh; the effects below do this automatically).
  const computeATE = useCallback(async () => {
    await computeSeverity();
    await computeEventLevel();
  }, [computeSeverity, computeEventLevel]);

  const isReady = state.modelData !== null && state.isValid;

  // Severity ATEs: when the event or the severity pair changes.
  useEffect(() => {
    if (isReady && state.selectedEvent && state.baseSeverityLevel > 0 && state.treatmentSeverityLevel > 0) {
      const timeoutId = setTimeout(() => { computeSeverity(); }, 0);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, state.selectedEvent, state.baseSeverityLevel, state.treatmentSeverityLevel]);

  // Population-segment + continuous ATEs: only when the event changes. Clicking
  // a response button or changing the severity pair does NOT come through here.
  useEffect(() => {
    if (isReady && state.selectedEvent) {
      computeEventLevel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, state.selectedEvent]);

  const clearResults = useCallback(() => {
    setState(prev => ({ ...prev, results: [], error: null }));
  }, []);

  // All 5 events are now backed by real per-event models.
  const getAvailableEvents = useCallback(() => {
    return [
      { id: 'extreme_heat', name: 'Extreme Heat', enabled: true },
      { id: 'extreme_cold', name: 'Extreme Cold', enabled: true },
      { id: 'major_flooding', name: 'Major Flooding', enabled: true },
      { id: 'major_earthquake', name: 'Major Earthquake', enabled: true },
      { id: 'power_outage', name: 'Power Outage', enabled: true }
    ];
  }, []);

  const getSeverityLevels = useCallback(() => {
    return [
      { value: 1, label: 'Not severe at all' },
      { value: 2, label: 'Slightly severe' },
      { value: 3, label: 'Moderately severe' },
      { value: 4, label: 'Very severe' },
      { value: 5, label: 'Extremely severe' }
    ];
  }, []);

  // Which activities have a real model for the currently selected event.
  const getAvailableActivities = useCallback(() => {
    return EVENT_ACTIVITY_COVERAGE[state.selectedEvent] || [];
  }, [state.selectedEvent]);

  return {
    // State
    selectedEvent: state.selectedEvent,
    baseSeverityLevel: state.baseSeverityLevel,
    treatmentSeverityLevel: state.treatmentSeverityLevel,
    anticipatedChange: state.anticipatedChange,
    isComputing: state.isComputing,
    // Never expose another event's numbers under the newly selected event's name.
    results: state.resultsEvent === state.selectedEvent ? state.results : [],
    continuousResults: state.segmentsEvent === state.selectedEvent ? state.continuousResults : {},
    segmentResults: state.segmentsEvent === state.selectedEvent ? state.segmentResults : {},
    segmentsReady: state.segmentsEvent === state.selectedEvent,
    error: state.error,
    isReady,

    // Actions
    setSelectedEvent,
    setBaseSeverityLevel,
    setTreatmentSeverityLevel,
    setAnticipatedChange,
    computeATE,
    clearResults,

    // Utilities
    getAvailableEvents,
    getSeverityLevels,
    getAvailableActivities
  };
};
