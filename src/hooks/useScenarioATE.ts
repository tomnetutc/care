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

import { useState, useEffect, useCallback } from 'react';
import DataService from '../services/DataService';
import {
  computeSeverityATEs,
  ATEResult,
  EventModelData,
  ModelDataByEvent,
  validateModelData
} from '../lib/engine/computeATE';
import { EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE } from '../lib/engine/eventConfig';

export { EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE };

export interface ScenarioState {
  selectedEvent: string;
  baseSeverityLevel: number;
  treatmentSeverityLevel: number;
  anticipatedChange: 'do_less' | 'about_same' | 'do_more' | null;
  isComputing: boolean;
  results: ATEResult[];
  error: string | null;
  modelData: ModelDataByEvent | null;
  isValid: boolean;
}

export const useScenarioATE = () => {
  const [state, setState] = useState<ScenarioState>({
    selectedEvent: 'extreme_heat',
    baseSeverityLevel: 1, // "Not severe at all"
    treatmentSeverityLevel: 5, // "Extremely severe"
    anticipatedChange: 'do_more',
    isComputing: false,
    results: [],
    error: null,
    modelData: null,
    isValid: false
  });

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

  // Compute ATEs
  const computeATE = useCallback(async () => {
    if (!state.modelData || !state.isValid) {
      setState(prev => ({ ...prev, error: 'Model data not loaded or invalid' }));
      return;
    }

    const eventConfig = EVENT_CONFIG[state.selectedEvent];
    if (!eventConfig) {
      setState(prev => ({ ...prev, error: `Unknown event: ${state.selectedEvent}` }));
      return;
    }

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

      console.log('ATE Computation Debug:', {
        selectedEvent: state.selectedEvent,
        csvEvent: eventConfig.csvEvent,
        dataFile: eventConfig.dataFile,
        baseSeverityLevel: state.baseSeverityLevel,
        treatmentSeverityLevel: state.treatmentSeverityLevel,
        filteredDataLength: filteredData.length,
        results: results.map(r => ({
          activity: r.activity,
          ate: r.ate.map(v => v.toFixed(4)),
          isValid: r.isValid,
          sampleSize: r.sampleSize,
          conservationCheck: r.conservationCheck.toFixed(6),
          levelLabels: r.levelLabels
        }))
      });

      setState(prev => ({ ...prev, results, isComputing: false, error: null }));
    } catch (error) {
      console.error('Error computing ATEs:', error);
      setState(prev => ({
        ...prev,
        isComputing: false,
        error: (error as Error).message
      }));
    }
  }, [state.modelData, state.isValid, state.selectedEvent, state.baseSeverityLevel, state.treatmentSeverityLevel]);

  const isReady = state.modelData !== null && state.isValid;

  // Auto-compute ATEs when configuration changes and data is ready.
  useEffect(() => {
    if (isReady && state.selectedEvent && state.baseSeverityLevel > 0 && state.treatmentSeverityLevel > 0) {
      const timeoutId = setTimeout(() => {
        computeATE();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, state.selectedEvent, state.baseSeverityLevel, state.treatmentSeverityLevel, state.modelData, state.isValid]);

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
    results: state.results,
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
