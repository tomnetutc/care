/**
 * Scenario ATE Panel Component
 * 
 * Main UI component for the Scenario Analysis page with new design.
 * Preserves all existing ATE calculation logic while updating the UI.
 */

import React, { useState, useEffect } from 'react';
import { useScenarioATE } from '../../hooks/useScenarioATE';
import { Sun, Snowflake, Droplets, Mountain, Zap, TrendingDown, Minus, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import './ScenarioATEPanel.scss';

type ExpandedGroupsKey = 'attitudes' | 'socioDemo' | 'household' | 'community';

const ScenarioATEPanel: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showAbsoluteATE, setShowAbsoluteATE] = useState(false);
  const [showDemoAbsoluteATE, setShowDemoAbsoluteATE] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('use_car');
  const [expandedGroups, setExpandedGroups] = useState<Record<ExpandedGroupsKey, boolean>>({
    attitudes: true,
    socioDemo: true,
    household: true,
    community: true
  });

  // Map existing hook to new design
  const {
    selectedEvent,
    baseSeverityLevel,
    treatmentSeverityLevel,
    anticipatedChange,
    isComputing,
    results,
    error,
    isReady,
    setSelectedEvent,
    setBaseSeverityLevel,
    setTreatmentSeverityLevel,
    setAnticipatedChange,
    computeATE,
    getAvailableEvents,
    getSeverityLevels
  } = useScenarioATE();

  const availableEvents = getAvailableEvents();
  const severityLevels = getSeverityLevels();

  // Map event IDs to new design
  const eventMap: Record<string, { id: string; name: string; icon: any }> = {
    'extreme_heat': { id: 'heat', name: 'Extreme Heat', icon: Sun },
    'extreme_cold': { id: 'cold', name: 'Extreme Cold', icon: Snowflake },
    'major_flooding': { id: 'flood', name: 'Major Flooding', icon: Droplets },
    'major_earthquake': { id: 'earthquake', name: 'Major Earthquake', icon: Mountain },
    'power_outage': { id: 'outage', name: 'Power Outage', icon: Zap },
  };

  // Map severity levels to new format
  const severityMap: Record<number, { value: string; label: string }> = {
    1: { value: 'not-severe', label: 'Not severe at all' },
    2: { value: 'slightly', label: 'Slightly severe' },
    3: { value: 'moderately', label: 'Moderately severe' },
    4: { value: 'very', label: 'Very severe' },
    5: { value: 'extremely-severe', label: 'Extremely severe' },
  };

  // Activities mapping - 8 activities matching the model
  const activities = [
    { value: 'use_car', label: 'Using a car for traveling' },
    { value: 'use_transit', label: 'Taking public transit' },
    { value: 'stay_home', label: 'Staying at home' },
    { value: 'get_meal_delivered', label: 'Having food delivered from a restaurant' },
    { value: 'dine_in_pickup', label: 'Dine in / Pick up' }, // Single activity in model
    { value: 'work_from_home', label: 'Working from home' },
    { value: 'work_from_office', label: 'Working from the office' },
    { value: 'go_business_as_usual', label: 'Go about business as usual' },
  ];

  // Map anticipated change
  const mapAnticipatedChange = (change: 'do_less' | 'about_same' | 'do_more' | null): string => {
    switch (change) {
      case 'do_less': return 'less';
      case 'about_same': return 'same';
      case 'do_more': return 'more';
      default: return 'more';
    }
  };

  const reverseMapAnticipatedChange = (change: string): 'do_less' | 'about_same' | 'do_more' => {
    switch (change) {
      case 'less': return 'do_less';
      case 'same': return 'about_same';
      case 'more': return 'do_more';
      default: return 'do_more';
    }
  };

  // Get current event info
  const currentEvent = eventMap[selectedEvent] || eventMap['extreme_heat'];
  const currentBaseLevel = severityMap[baseSeverityLevel] || severityMap[1];
  const currentComparisonLevel = severityMap[treatmentSeverityLevel] || severityMap[5];
  const currentAnticipatedChange = mapAnticipatedChange(anticipatedChange);

  // Convert results to new format
  const convertResultsToATEData = () => {
    if (!results || results.length === 0) return [];
    
    // Map activity names - using 8 activities from the model
    const activityLabelMap: Record<string, string> = {
      'use_transit': 'Taking public transit',
      'use_car': 'Using a car for traveling',
      'stay_home': 'Staying at home',
      'dine_in_pickup': 'Dine in / Pick up', // Single activity in model (combines both)
      'get_meal_delivered': 'Having food delivered from a restaurant',
      'work_from_home': 'Working from home',
      'work_from_office': 'Working from the office',
      'go_business_as_usual': 'Go about business as usual'
    };

    // Get the ATE value for the selected anticipated change
    // This matches the logic from ScenarioATEChart.tsx
    const getATEForChange = (result: any) => {
      if (!result.ate || result.ate.length === 0) return 0;
      
      const ate = result.ate;
      let ateIndex = 0;
      
      if (anticipatedChange === 'do_less') {
        ateIndex = 0;
      } else if (anticipatedChange === 'about_same') {
        // For 3-level models, index 1; for 5-level models, index 2 (Neutral); for 2-level, use 0
        if (ate.length === 2) {
          ateIndex = 0; // For GBU aggregated, "about same" maps to "Unlikely"
        } else if (ate.length === 3) {
          ateIndex = 1;
        } else if (ate.length === 5) {
          ateIndex = 2;
        } else {
          ateIndex = 1;
        }
      } else if (anticipatedChange === 'do_more') {
        // For 3-level models, index 2; for 5-level models, index 4; for 2-level, index 1
        if (ate.length === 2) {
          ateIndex = 1; // For GBU aggregated, "do more" maps to "Likely"
        } else if (ate.length === 3) {
          ateIndex = 2;
        } else if (ate.length === 5) {
          ateIndex = 4;
        } else {
          ateIndex = ate.length - 1;
        }
      }
      
      // Ensure index is valid
      if (ateIndex < 0 || ateIndex >= ate.length) {
        ateIndex = 0;
      }
      
      return ate[ateIndex] || 0;
    };

    return results
      .filter(r => r.isValid)
      .map(result => ({
        activity: activityLabelMap[result.activity] || result.activity,
        ate: getATEForChange(result)
      }))
      .sort((a, b) => b.ate - a.ate); // Sort from most positive to most negative
  };

  const ateData = convertResultsToATEData();

  // Auto-compute when ready or when configuration changes
  useEffect(() => {
    if (isReady && !isComputing) {
      // Always recompute when configuration changes (including anticipatedChange)
      computeATE();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, selectedEvent, baseSeverityLevel, treatmentSeverityLevel, anticipatedChange]);

  // Dummy data for Population Segment Analysis
  const demographicData = {
    attitudes: {
      title: 'Attitudes & Personality Traits',
      variables: [
        { variable: 'Personal Resilience', baseLevel: 'Low', comparisons: [{ treatmentLevel: 'High', ate: 0.00 }] },
        { variable: 'Risk Aversion', baseLevel: 'Low', comparisons: [{ treatmentLevel: 'High', ate: 0.22 }] }
      ]
    },
    socioDemo: {
      title: 'Socio-Demographics',
      variables: [
        { variable: 'Gender', baseLevel: 'Male', comparisons: [{ treatmentLevel: 'Female', ate: 0.05 }] },
        { variable: 'Age Group', baseLevel: '18-34', comparisons: [{ treatmentLevel: '35-54', ate: -0.03 }, { treatmentLevel: '55+', ate: 0.08 }] }
      ]
    },
    household: {
      title: 'Household Attributes',
      variables: [
        { variable: 'Household Income', baseLevel: 'Less than $25,000', comparisons: [
          { treatmentLevel: '$25,000 - $49,999', ate: 0.01 },
          { treatmentLevel: '$50,000 - $99,999', ate: 0.02 },
          { treatmentLevel: '$100,000 or higher', ate: -0.60 }
        ]},
        { variable: 'Housing Type', baseLevel: 'Stand-alone house', comparisons: [
          { treatmentLevel: 'Apartment', ate: 0.32 },
          { treatmentLevel: 'Mobile home', ate: 0.01 }
        ]}
      ]
    },
    community: {
      title: 'Community Resources',
      variables: [
        { variable: 'Transit Access', baseLevel: 'Low', comparisons: [{ treatmentLevel: 'High', ate: 0.25 }] }
      ]
    }
  };

  const tooltips: Record<string, string> = {
    eventType: "Select the type of extreme event to analyze.",
    severityAnalysis: "This analysis compares how people who experienced different severity levels of impact adjust their behavior.",
    ateDefinition: "Average Treatment Effect (ATE) measures the difference in probability of choosing a particular behavioral response when comparing two groups (e.g., those who experienced different severity levels). It quantifies how much more or less likely people are to engage in specific activities based on their prior experience.",
    ateResults: "Average Treatment Effects show probability changes.",
    populationSegments: "Shows how population characteristics affect behavioral responses."
  };

  const InfoButton = ({ tooltipKey }: { tooltipKey: string }) => {
    const tooltip = tooltips[tooltipKey];
    if (!tooltip) return null;
    
    return (
      <div className="scenario-tooltip-wrapper">
        <button
          onMouseEnter={() => setShowTooltip(tooltipKey)}
          onMouseLeave={() => setShowTooltip(null)}
          className="scenario-info-button"
          type="button"
        >
          <Info className="scenario-info-icon" />
        </button>
        {showTooltip === tooltipKey && (
          <div className="scenario-tooltip">
            {tooltip}
            <div className="scenario-tooltip-arrow"></div>
          </div>
        )}
      </div>
    );
  };

  const renderSparkline = (ate: number) => {
    const maxAte = 0.60;
    const width = Math.min(Math.abs(ate) / maxAte * 100, 100);
    const isPositive = ate >= 0;
    
    return (
      <div className="scenario-sparkline">
        <div className="scenario-sparkline-center"></div>
        <div className="scenario-sparkline-bar" style={{
          width: `${width / 2}%`,
          marginLeft: isPositive ? '0' : `-${width / 2}%`,
          backgroundColor: isPositive ? '#6dafa0' : '#e25b61'
        }}></div>
      </div>
    );
  };

  const behaviorButtons = [
    { id: 'less', label: 'Do Less', icon: TrendingDown, bgColor: '#fde8e9', borderColor: '#e25b61', textColor: '#e25b61' },
    { id: 'same', label: 'About the Same', icon: Minus, bgColor: '#fdf6e3', borderColor: '#ebc823', textColor: '#d4a817' },
    { id: 'more', label: 'Do More', icon: TrendingUp, bgColor: '#e8f4f2', borderColor: '#6dafa0', textColor: '#6dafa0' }
  ];

  const handleEventClick = (eventId: string) => {
    // Find the original event ID
    const originalEventId = Object.keys(eventMap).find(key => eventMap[key].id === eventId);
    if (originalEventId) {
      setSelectedEvent(originalEventId);
    }
  };

  const handleBaseLevelChange = (value: string) => {
    const level = Object.keys(severityMap).find(key => severityMap[parseInt(key)].value === value);
    if (level) {
      setBaseSeverityLevel(parseInt(level));
    }
  };

  const handleComparisonLevelChange = (value: string) => {
    const level = Object.keys(severityMap).find(key => severityMap[parseInt(key)].value === value);
    if (level) {
      setTreatmentSeverityLevel(parseInt(level));
    }
  };

  const handleAnticipatedChange = (change: string) => {
    setAnticipatedChange(reverseMapAnticipatedChange(change));
  };

  return (
    <div className="scenario-page-wrapper">
      <div className="scenario-container">
        <div className="scenario-intro-card">
          <h2 className="scenario-intro-title">CARE Scenario Analysis Tool</h2>
          <p className="scenario-intro-text">
            This interactive dashboard explores how individuals adapt their activity-travel behavior in response to future extreme events. The tool leverages the Average Treatment Effects (ATE) concept. ATEs are computed from a series of econometric models estimated using CARE survey data. Model details are available at <a href="#" className="scenario-link">this link</a>.
          </p>
          <div className="scenario-intro-grid">
            <div className="scenario-intro-box">
              <h3 className="scenario-intro-box-title">Severity-Based Analysis</h3>
              <p className="scenario-intro-box-text">
                Compare how people who experienced different severity levels of past events adjust their travel and activity choices when facing the same event type again.
              </p>
            </div>
            <div className="scenario-intro-box">
              <h3 className="scenario-intro-box-title">Population Segment Analysis</h3>
              <p className="scenario-intro-box-text">
                Explore how demographic characteristics, household attributes, community resources, and personal attitudes affect behavioral responses to extreme events.
              </p>
            </div>
          </div>
          <div className="scenario-get-started">
            <p className="scenario-get-started-text">
              <span className="scenario-get-started-bold">Get Started:</span> Choose one of five extreme event types below, then follow the steps to configure your scenario and view results.
            </p>
          </div>
        </div>

        <div className="scenario-section-card">
          <div className="scenario-section-header">
            <h2 className="scenario-section-title">1. Select Extreme Event Type</h2>
            <InfoButton tooltipKey="eventType" />
          </div>
          <div className="scenario-events-grid">
            {Object.entries(eventMap).map(([originalId, event]) => {
              const Icon = event.icon;
              const isSelected = selectedEvent === originalId;
              return (
                <button
                  key={event.id}
                  onClick={() => handleEventClick(event.id)}
                  className={`scenario-event-button ${isSelected ? 'scenario-event-button-active' : ''}`}
                  disabled={isComputing}
                >
                  <Icon className={`scenario-event-icon ${isSelected ? 'scenario-event-icon-active' : ''}`} />
                  <p className="scenario-event-name">{event.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="scenario-divider">
          <div className="scenario-divider-line"></div>
          <span className="scenario-divider-text">Severity-Based Analysis</span>
        </div>

        <div className="scenario-section-card">
          <div className="scenario-section-header">
            <h2 className="scenario-section-title">2. Effects by Last Time Impact Severity</h2>
            <InfoButton tooltipKey="severityAnalysis" />
          </div>
          <p className="scenario-section-description">
            Compare how past event severity (perceived impact on daily life) influences anticipated behavioral responses when facing the same type of {currentEvent.name.toLowerCase()} event in the future
          </p>
          
          <div className="scenario-config-box">
            <h3 className="scenario-config-title">Scenario Configuration</h3>
            
            <div className="scenario-config-grid">
              <div className="scenario-config-item">
                <label className="scenario-config-label">Base Level</label>
                <select 
                  value={currentBaseLevel.value} 
                  onChange={(e) => handleBaseLevelChange(e.target.value)} 
                  className="scenario-select"
                  disabled={isComputing}
                >
                  {Object.values(severityMap).map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="scenario-config-help">Perceived severity of impact on daily life from most recent event (reference category)</p>
              </div>
              <div className="scenario-config-item">
                <label className="scenario-config-label">Comparison Level</label>
                <select 
                  value={currentComparisonLevel.value} 
                  onChange={(e) => handleComparisonLevelChange(e.target.value)} 
                  className="scenario-select"
                  disabled={isComputing}
                >
                  {Object.values(severityMap).map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <p className="scenario-config-help">Different severity level to compare against the base level</p>
              </div>
            </div>

            <div className="scenario-config-item">
              <label className="scenario-config-label">Select Behavioral Response</label>
              <div className="scenario-behavior-buttons">
                {behaviorButtons.map(btn => {
                  const Icon = btn.icon;
                  const isSelected = currentAnticipatedChange === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => handleAnticipatedChange(btn.id)}
                      className={`scenario-behavior-button ${isSelected ? 'scenario-behavior-button-active' : ''}`}
                      disabled={isComputing}
                      style={isSelected ? {
                        backgroundColor: btn.bgColor,
                        borderColor: btn.borderColor,
                        color: btn.textColor,
                        boxShadow: `0 0 0 2px ${btn.borderColor}`
                      } : {}}
                    >
                      <Icon className="scenario-behavior-icon" />
                      <span className="scenario-behavior-label">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="scenario-config-help">Anticipated change in frequency if the event happens again (vs. other response categories)</p>
            </div>
          </div>

          {isComputing && (
            <div className="scenario-computing">
              <span className="scenario-spinner"></span>
              Computing ATEs...
            </div>
          )}

          {error && (
            <div className="scenario-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {ateData.length > 0 && (
            <div className="scenario-results">
              <div className="scenario-results-header">
                <div className="scenario-results-title-wrapper">
                  <h3 className="scenario-results-title">Average Treatment Effects (ATEs)</h3>
                  <InfoButton tooltipKey="ateDefinition" />
                </div>
                <div className="scenario-ate-toggle">
                  <button 
                    onClick={() => setShowAbsoluteATE(false)} 
                    className={`scenario-ate-toggle-button ${!showAbsoluteATE ? 'scenario-ate-toggle-active' : ''}`}
                  >
                    Percent ATE
                  </button>
                  <button 
                    onClick={() => setShowAbsoluteATE(true)} 
                    className={`scenario-ate-toggle-button ${showAbsoluteATE ? 'scenario-ate-toggle-active' : ''}`}
                  >
                    Absolute ATE
                  </button>
                </div>
              </div>
              
              <p className="scenario-results-description">
                {showAbsoluteATE ? "Absolute difference in probability" : "Percent change relative to base"}
              </p>

              <div className="scenario-ate-list">
                {(() => {
                  // Calculate max absolute value once, outside the map
                  const maxAbs = ateData.length > 0 
                    ? Math.max(...ateData.map(d => Math.abs(d.ate))) 
                    : 0;
                  
                  return ateData.map((item, i) => {
                    // Calculate bar width based on the actual ATE value
                    // Use the exact ATE value (not rounded) for width calculation to ensure precision
                    const absATE = Math.abs(item.ate);
                    const barWidth = maxAbs > 0 ? (absATE / maxAbs) * 100 : 0;
                    const isPos = item.ate >= 0;
                    // Use 3 decimal places for absolute ATE to match existing chart precision
                    const val = showAbsoluteATE ? item.ate.toFixed(3) : (item.ate * 100).toFixed(1) + '%';
                    
                    return (
                      <div key={i} className="scenario-ate-item">
                        <div className="scenario-ate-activity">{item.activity}</div>
                        <div className="scenario-ate-bar-container">
                          <div className="scenario-ate-bar-center"></div>
                          <div 
                            className="scenario-ate-bar"
                            style={{ 
                              width: `${barWidth/2}%`, 
                              marginLeft: isPos ? '0' : `-${barWidth/2}%`,
                              backgroundColor: isPos ? '#6dafa0' : '#e25b61'
                            }}
                          ></div>
                        </div>
                        <div className="scenario-ate-value" style={{ color: isPos ? '#6dafa0' : '#e25b61' }}>
                          {item.ate > 0 ? '+' : ''}{val}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="scenario-interpretation">
                <p className="scenario-interpretation-text">
                  <span className="scenario-interpretation-bold">How to interpret:</span> {showAbsoluteATE ? (
                    <>An absolute ATE of say +0.10 means if we take a sample of 100 individuals whose prior experience was "{currentBaseLevel.label}" and replace them with a sample of 100 whose prior experience was "{currentComparisonLevel.label}", there would be 10 more people choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of that activity during the next {currentEvent.name.toLowerCase()} event.</>
                  ) : (
                    <>A percent ATE of say +20% means if we take a sample of individuals whose prior experience was "{currentBaseLevel.label}" and replace them with a sample whose prior experience was "{currentComparisonLevel.label}", there would be a 20% increase in those choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of that activity during the next {currentEvent.name.toLowerCase()} event.</>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="scenario-divider">
          <div className="scenario-divider-line"></div>
          <span className="scenario-divider-text">Population Segment Analysis</span>
        </div>

        <div className="scenario-section-card">
          <div className="scenario-section-header">
            <h2 className="scenario-section-title">3. Effects Across Population Segments</h2>
            <InfoButton tooltipKey="populationSegments" />
          </div>
          <p className="scenario-section-description">
            Analyze how personal attitudes, socio-demographic characteristics, household attributes, and community resources shape activity-travel choices in future {currentEvent.name.toLowerCase()} events
          </p>
          
          <div className="scenario-config-box">
            <h3 className="scenario-config-title">Scenario Configuration</h3>
            
            <div className="scenario-config-grid">
              <div className="scenario-config-item">
                <label className="scenario-config-label">Select Activity/Travel Type</label>
                <select 
                  value={selectedActivity} 
                  onChange={(e) => setSelectedActivity(e.target.value)} 
                  className="scenario-select"
                >
                  {activities.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                <p className="scenario-config-help">Activity to analyze across population segments</p>
              </div>

              <div className="scenario-config-item">
                <label className="scenario-config-label">Display Format</label>
                <div className="scenario-ate-toggle">
                  <button 
                    onClick={() => setShowDemoAbsoluteATE(false)} 
                    className={`scenario-ate-toggle-button ${!showDemoAbsoluteATE ? 'scenario-ate-toggle-active' : ''}`}
                  >
                    Percent ATE
                  </button>
                  <button 
                    onClick={() => setShowDemoAbsoluteATE(true)} 
                    className={`scenario-ate-toggle-button ${showDemoAbsoluteATE ? 'scenario-ate-toggle-active' : ''}`}
                  >
                    Absolute ATE
                  </button>
                </div>
                <p className="scenario-config-help">Choose display format</p>
              </div>
            </div>

            <div className="scenario-config-item">
              <label className="scenario-config-label">Select Behavioral Response to Analyze</label>
              <div className="scenario-behavior-buttons">
                {behaviorButtons.map(btn => {
                  const Icon = btn.icon;
                  const isSelected = currentAnticipatedChange === btn.id;
                  return (
                    <button
                      key={btn.id}
                      onClick={() => handleAnticipatedChange(btn.id)}
                      className={`scenario-behavior-button ${isSelected ? 'scenario-behavior-button-active' : ''}`}
                      style={isSelected ? {
                        backgroundColor: btn.bgColor,
                        borderColor: btn.borderColor,
                        color: btn.textColor,
                        boxShadow: `0 0 0 2px ${btn.borderColor}`
                      } : {}}
                    >
                      <Icon className="scenario-behavior-icon" />
                      <span className="scenario-behavior-label">{btn.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="scenario-config-help">Anticipated change in frequency if the event happens again (vs. other response categories)</p>
            </div>
          </div>

          <div className="scenario-demographic-groups">
            {Object.entries(demographicData).map(([key, group]) => {
              const groupKey = key as ExpandedGroupsKey;
              return (
              <div key={key} className="scenario-demographic-group">
                <button 
                  onClick={() => setExpandedGroups(p => ({ ...p, [groupKey]: !p[groupKey] }))}
                  className="scenario-demographic-header"
                >
                  <h4 className="scenario-demographic-title">{group.title}</h4>
                  {expandedGroups[groupKey] ? <ChevronUp className="scenario-chevron" /> : <ChevronDown className="scenario-chevron" />}
                </button>
                
                {expandedGroups[groupKey] && (
                  <div className="scenario-demographic-table-wrapper">
                    <table className="scenario-demographic-table">
                      <colgroup>
                        <col style={{width: '25%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '20%'}} />
                        <col style={{width: '35%'}} />
                      </colgroup>
                      <thead className="scenario-table-head">
                        <tr>
                          <th className="scenario-table-header">Variable</th>
                          <th className="scenario-table-header">Base</th>
                          <th className="scenario-table-header">Comparison</th>
                          <th className="scenario-table-header">{showDemoAbsoluteATE ? 'Absolute ATE' : 'Percent ATE'}</th>
                        </tr>
                      </thead>
                      <tbody className="scenario-table-body">
                        {group.variables.map((v, vi) => 
                          v.comparisons.map((c, ci) => (
                            <tr key={`${vi}-${ci}`} className="scenario-table-row">
                              <td className="scenario-table-cell scenario-table-cell-bold">{ci === 0 ? v.variable : ''}</td>
                              <td className="scenario-table-cell">{ci === 0 ? v.baseLevel : ''}</td>
                              <td className="scenario-table-cell">{c.treatmentLevel}</td>
                              <td className="scenario-table-cell">
                                <div className="scenario-ate-display">
                                  {renderSparkline(c.ate)}
                                  <span className="scenario-ate-display-value" style={{ color: c.ate >= 0 ? '#6dafa0' : '#e25b61' }}>
                                    {c.ate > 0 ? '+' : ''}{showDemoAbsoluteATE ? c.ate.toFixed(2) : (c.ate * 100).toFixed(1) + '%'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
            })}
          </div>

          <div className="scenario-interpretation">
            <p className="scenario-interpretation-text">
              <span className="scenario-interpretation-bold">How to interpret:</span> {showDemoAbsoluteATE ? (
                <>An absolute ATE of say +0.10 means if we take a sample of 100 individuals from the base group (e.g., "Male") and replace them with a sample of 100 from the comparison group (e.g., "Female"), there would be 10 more people choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of {activities.find(a => a.value === selectedActivity)?.label} during the next {currentEvent.name.toLowerCase()} event.</>
              ) : (
                <>A percent ATE of say +20% means if we take a sample of individuals from the base group (e.g., "Male") and replace them with a sample from the comparison group (e.g., "Female"), there would be a 20% increase in those choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of {activities.find(a => a.value === selectedActivity)?.label} during the next {currentEvent.name.toLowerCase()} event.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioATEPanel;
