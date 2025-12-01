/**
 * React Hook for Scenario Analysis ATE Computation
 * 
 * Manages state and provides ATE computation functionality for the Scenario Analysis component.
 * Integrates with FilterContext to get filtered data for mean calculations.
 */

import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import DataService from '../services/DataService';
import { computeATEs, ATEResult, ATEComputationOptions, ModelData, validateModelData } from '../lib/engine/computeATE';

export interface ScenarioState {
  selectedEvent: string;
  baseSeverityLevel: number;
  treatmentSeverityLevel: number;
  anticipatedChange: 'do_less' | 'about_same' | 'do_more' | null;
  isComputing: boolean;
  results: ATEResult[];
  error: string | null;
  modelData: ModelData | null;
  isValid: boolean;
}

export interface UseScenarioATEOptions {
  treatmentVariable: string;
  controlValue: number;
  treatmentValue: number;
}

const DEFAULT_OPTIONS: UseScenarioATEOptions = {
  treatmentVariable: 'impa345',
  controlValue: 0,
  treatmentValue: 1
};

export const useScenarioATE = (options: UseScenarioATEOptions = DEFAULT_OPTIONS) => {
  const [state, setState] = useState<ScenarioState>({
    selectedEvent: 'extreme_heat',
    baseSeverityLevel: 1, // Default to "Not severe at all"
    treatmentSeverityLevel: 5, // Default to "Extremely severe"
    anticipatedChange: 'do_more', // Default to "Do more"
    isComputing: false,
    results: [],
    error: null,
    modelData: null,
    isValid: false
  });

  const { filters, isDataLoading, dataError } = useFilters();

  // Load model data on mount
  useEffect(() => {
    const loadModelData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/models/model_coeffs_with_thresholds.json`);
        if (!response.ok) {
          throw new Error('Failed to load model data');
        }
        
        const modelData: ModelData = await response.json();
        
        // Validate model data
        const isValid = validateModelData(modelData);
        
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

  // Update selected event
  const setSelectedEvent = useCallback((event: string) => {
    setState(prev => ({
      ...prev,
      selectedEvent: event
    }));
  }, []);

  // Update base severity level
  const setBaseSeverityLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      baseSeverityLevel: level
    }));
  }, []);

  // Update treatment severity level
  const setTreatmentSeverityLevel = useCallback((level: number) => {
    setState(prev => ({
      ...prev,
      treatmentSeverityLevel: level
    }));
  }, []);

  // Update anticipated change
  const setAnticipatedChange = useCallback((change: 'do_less' | 'about_same' | 'do_more' | null) => {
    setState(prev => ({
      ...prev,
      anticipatedChange: change
    }));
  }, []);

  // Helper function to map severity level to treatment value
  // Levels 1-2: 0 (low severity), Levels 3-5: 1 (high severity)
  const mapSeverityToTreatmentValue = useCallback((severityLevel: number): number => {
    return severityLevel >= 3 ? 1 : 0;
  }, []);

  // Compute ATEs
  const computeATE = useCallback(async () => {
    if (!state.modelData || !state.isValid) {
      setState(prev => ({
        ...prev,
        error: 'Model data not loaded or invalid'
      }));
      return;
    }

    if (isDataLoading) {
      setState(prev => ({
        ...prev,
        error: 'Data is still loading'
      }));
      return;
    }

    if (dataError) {
      setState(prev => ({
        ...prev,
        error: dataError
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isComputing: true,
      error: null
    }));

    try {
      // Get scenario data from DataService (df_output.csv with all derived variables)
      // This contains pre-computed model variables like CR, PR, SE, hcity, urban, etc.
      // Dashboard visualizations continue using df_dashboard.csv via getData()
      const rawData = await DataService.getInstance().getScenarioData();
      
      // Apply filters to get filtered data (similar to how visualizations do it)
      let filteredData: any[] = rawData;
      
      if (filters.length > 0) {
        filteredData = rawData.filter(row => {
          // Group filters by field to handle multiple values for same field
          const filtersByField: Record<string, string[]> = {};
          filters.forEach(filter => {
            if (!filtersByField[filter.field]) {
              filtersByField[filter.field] = [];
            }
            
            // Special handling for disability filter
            if (filter.field === 'travel_disability') {
              if (filter.value === 'yes') {
                filtersByField[filter.field].push('2', '3', '4');
              } else if (filter.value === 'no') {
                filtersByField[filter.field].push('1');
              } else {
                filtersByField[filter.field].push(String(filter.value));
              }
            }
            // Special handling for gender filter - combine Other and Prefer not to answer
            else if (filter.field === 'gender' && filter.value === '4') {
              filtersByField[filter.field].push('3', '4');
            } else {
              filtersByField[filter.field].push(String(filter.value));
            }
          });
          
          // Check if row matches any of the filter combinations
          return Object.entries(filtersByField).every(([field, values]) => {
            const rowValue = String(row[field]);
            return values.includes(rowValue);
          });
        });
      }

      // ISSUE 3: Filter data by selected event (e.g., only use rows where ext_heat == 1 for heat analysis)
      // As per Jinghai: "You used heat csv calculate GBU is also not correct"
      // The R code shows: df_heat = df[df['ext_heat']==1] for heat analysis
      // We need to filter by the selected event before calculating means to ensure we only use
      // data from respondents who experienced that specific event.
      // This mapping matches the column names in df_output.csv and the Jupyter notebooks.
      const eventToFilterColumn: Record<string, string> = {
        'extreme_heat': 'ext_heat',
        'extreme_cold': 'ext_cold',
        'major_flooding': 'ext_flooding',  // Matches notebook: df_flood = df[df['ext_flooding']==1]
        'major_earthquake': 'ext_earthquake',  // Matches notebook: df_earth = df[df['ext_earthquake']==1]
        'power_outage': 'ext_powerout'  // Matches notebook: df_power = df[df['ext_powerout']==1]
      };
      
      const eventFilterColumn = eventToFilterColumn[state.selectedEvent];
      if (eventFilterColumn) {
        const beforeFilterCount = filteredData.length;
        
        // Debug: Check distribution of event values before filtering
        const eventValueCounts: Record<string, number> = {};
        filteredData.forEach(row => {
          const eventValue = String(row[eventFilterColumn] || 'missing');
          eventValueCounts[eventValue] = (eventValueCounts[eventValue] || 0) + 1;
        });
        console.log(`Event filtering debug for ${state.selectedEvent} (column: ${eventFilterColumn}):`, {
          beforeFilterCount,
          eventValueDistribution: eventValueCounts
        });
        
        filteredData = filteredData.filter(row => {
          const eventValue = parseFloat(String(row[eventFilterColumn] || '0'));
          return !isNaN(eventValue) && eventValue === 1; // Only include rows where the event was experienced
        });
        const afterFilterCount = filteredData.length;
        
        console.log(`Filtered data by event ${state.selectedEvent}: Reduced from ${beforeFilterCount} to ${afterFilterCount} rows (${((1 - afterFilterCount/beforeFilterCount) * 100).toFixed(1)}% reduction)`);
        
        if (afterFilterCount === 0) {
          console.warn(`No data found for event ${state.selectedEvent} (filter column: ${eventFilterColumn}). Before filter: ${beforeFilterCount} rows.`);
        }
      } else {
        console.warn(`No filter column mapping found for event: ${state.selectedEvent}`);
      }

      // Filter out invalid responses
      filteredData = filteredData.filter(row => {
        // Check if row has valid data for at least one model variable
        const allVariables = new Set<string>();
        Object.values(state.modelData!).forEach(config => {
          config.variables.forEach(variable => allVariables.add(variable));
        });
        
        return Array.from(allVariables).some(variable => {
          const val = String(row[variable]);
          return val !== "-8" && val !== "" && val != null;
        });
      });

      // Map selected event to correct treatment variable
      // Each event has its own impa345 variable (heat_impa345, cold_impa345, etc.)
      const eventToTreatmentVariable: Record<string, string> = {
        'extreme_heat': 'heat_impa345',
        'extreme_cold': 'cold_impa345',
        'major_flooding': 'flood_impa345',
        'major_earthquake': 'earth_impa345',
        'power_outage': 'power_impa345'
      };
      
      const treatmentVariable = eventToTreatmentVariable[state.selectedEvent] || 'heat_impa345';
      
      // Compute ATEs
      // Map 5-level severity scale to binary treatment variable:
      // Levels 1-2: Low severity (treatment = 0)
      // Levels 3-5: High severity (treatment = 1)
      const controlValue = mapSeverityToTreatmentValue(state.baseSeverityLevel);
      const treatmentValue = mapSeverityToTreatmentValue(state.treatmentSeverityLevel);
      
      const computationOptions: ATEComputationOptions = {
        treatmentVariable: treatmentVariable, // Use event-specific treatment variable
        controlValue: controlValue,
        treatmentValue: treatmentValue,
        variableNameMappings: {
          'less_hs': 'hs_less',
          'hs_less': 'less_hs'
        }
      };

      const results = computeATEs(state.modelData, filteredData, computationOptions);

      // Debug logging - expanded to show actual ATE values
      console.log('ATE Computation Debug:', {
        selectedEvent: state.selectedEvent,
        treatmentVariable: treatmentVariable,
        baseSeverityLevel: state.baseSeverityLevel,
        treatmentSeverityLevel: state.treatmentSeverityLevel,
        controlValue,
        treatmentValue,
        filteredDataLength: filteredData.length,
        results: results.map(r => ({
          activity: r.activity,
          ate: r.ate,
          ateFormatted: r.ate.map(v => v.toFixed(4)),
          ateLength: r.ate.length,
          isValid: r.isValid,
          conservationCheck: r.conservationCheck.toFixed(6),
          levelLabels: r.levelLabels,
          controlProbs: r.controlProbabilities.map(p => p.toFixed(4)),
          treatmentProbs: r.treatmentProbabilities.map(p => p.toFixed(4))
        }))
      });

      setState(prev => ({
        ...prev,
        results,
        isComputing: false,
        error: null
      }));

    } catch (error) {
      console.error('Error computing ATEs:', error);
      setState(prev => ({
        ...prev,
        isComputing: false,
        error: (error as Error).message
      }));
    }
  }, [state.modelData, state.isValid, state.baseSeverityLevel, state.treatmentSeverityLevel, isDataLoading, dataError, filters, options, mapSeverityToTreatmentValue]);

  // Check if computation is ready
  const isReady = state.modelData !== null && state.isValid && !isDataLoading && !dataError;
  
  // Auto-compute ATEs when options change and data is ready
  useEffect(() => {
    // Only auto-compute if we're ready and have valid settings
    if (isReady && state.selectedEvent && state.baseSeverityLevel > 0 && state.treatmentSeverityLevel > 0) {
      // Check if the selected event is enabled
      const availableEvents = [
        { id: 'extreme_heat', enabled: true },
        { id: 'extreme_cold', enabled: false },
        { id: 'major_flooding', enabled: false },
        { id: 'major_earthquake', enabled: false },
        { id: 'power_outage', enabled: false }
      ];
      const selectedEventData = availableEvents.find(e => e.id === state.selectedEvent);
      
      if (selectedEventData?.enabled) {
        // Use a small timeout to debounce rapid changes
        const timeoutId = setTimeout(() => {
          computeATE();
        }, 150);
        
        return () => clearTimeout(timeoutId);
      }
    }
    // Note: computeATE is intentionally excluded from deps to avoid unnecessary re-runs
    // The dependencies below cover all conditions that should trigger recomputation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, state.selectedEvent, state.baseSeverityLevel, state.treatmentSeverityLevel, state.modelData, state.isValid, isDataLoading, dataError, filters, options]);

  // Clear results
  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      error: null
    }));
  }, []);

  // Get available events
  const getAvailableEvents = useCallback(() => {
    return [
      { id: 'extreme_heat', name: 'Extreme Heat', enabled: true },
      { id: 'extreme_cold', name: 'Extreme Cold', enabled: false },
      { id: 'major_flooding', name: 'Major Flooding', enabled: false },
      { id: 'major_earthquake', name: 'Major Earthquake', enabled: false },
      { id: 'power_outage', name: 'Power Outage', enabled: false }
    ];
  }, []);

  // Get severity levels
  const getSeverityLevels = useCallback(() => {
    return [
      { value: 1, label: 'Not severe at all' },
      { value: 2, label: 'Slightly severe' },
      { value: 3, label: 'Moderately severe' },
      { value: 4, label: 'Very severe' },
      { value: 5, label: 'Extremely severe' }
    ];
  }, []);

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
    getSeverityLevels
  };
};
