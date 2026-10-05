/**
 * Scenario ATE Panel Component
 * 
 * Main UI component for the Scenario Analysis page with new design.
 * Preserves all existing ATE calculation logic while updating the UI.
 */

import React, { useState } from 'react';
import { useScenarioATE, segmentResultKey, EVENT_CONFIG, EVENT_ACTIVITY_COVERAGE } from '../../hooks/useScenarioATE';
import { SEGMENT_GROUPS } from '../../lib/engine/segmentConfig';
import { hasVerifiedSampleMismatch, isSegmentComparisonRetained, isContinuousRetained } from '../../lib/engine/computeATE';
import { Sun, Snowflake, Droplets, Mountain, Zap, TrendingDown, Minus, TrendingUp, Info, ChevronDown, ChevronUp } from 'lucide-react';
import './ScenarioATEPanel.scss';

type ExpandedGroupsKey = 'attitudes' | 'socioDemo' | 'household' | 'community';

const GBU_NOTE = "This was a 5-level question from very unlikely to very likely. Do less corresponds to very or somewhat unlikely. About the same corresponds to neutral. Do more corresponds to very or somewhat likely.";

// Attitudes & Personality Traits (PR / CR / SE) use Jinghai's corrected treatment definition
// (2026-10-04, ATE_Calculation_10.4.ipynb): a one-unit increase on the construct's normalized
// scale from each respondent's current value, consistent with the paper. His workbook labels the
// row "1 Unit Increase*" (asterisk included). Note wording is a draft built from his own words.
const UNIT_INCREASE_LABEL = '1 Unit Increase*';
const UNIT_INCREASE_NOTE = "A one-unit increase on the construct's normalized scale, applied to each respondent's current value.";

const SAMPLE_MISMATCH_NOTE = "Verified data issue: Jinghai's reported fitting sample for this specific model is far smaller than what his own method reproduces from the data he sent (e.g. Power Outage → Go about business as usual: reported n=892 vs. 2,381 recomputed). Numbers below use the full, correctly-filtered sample - the statistically sound choice - but the underlying coefficients may need to be refit by Jinghai. Flagged for his review; not a display bug.";

const ANTICIPATED_CHANGE_INDEX: Record<string, number> = {
  'do_less': 0,
  'about_same': 1,
  'do_more': 2
};

// Population Segment Analysis's continuous attitude rows -> computeContinuousATE's variable key.
const CONTINUOUS_VARIABLE_KEY: Record<string, string> = {
  'Personal Resilience': 'PR',
  'Community Resilience': 'CR',
  'Social Engagement': 'SE'
};

/**
 * One ATE in both display formats. Per Jinghai's ATE workbook:
 *   Absolute ATE = P_comp - P_base
 *   Percent  ATE = (P_comp - P_base) / P_base   (relative change)
 * P_base is the engine's control probability for the selected response.
 * A result with no base probability (variable not in that model, ATE = 0 by
 * construction) reports 0 for both.
 */
interface Ate {
  abs: number; pct: number; inModel: boolean;
  /** true while the per-event numbers are still being computed */
  loading?: boolean;
  /** false = the selected activity's final model did not retain this variable, so Section 3 hides the row (Irfan, 2026-10-05) */
  retained?: boolean;
}

const toAte = (result: { ate: number[]; controlProbabilities: number[]; inModel?: boolean }, index: number): Ate => {
  const abs = result.ate[index] || 0;
  const base = result.controlProbabilities?.[index] ?? 0;
  return { abs, pct: base > 0 ? (abs / base) * 100 : 0, inModel: result.inModel !== false };
};

// Shown instead of a number when a variable was not retained in the fitted
// model for the selected activity: its effect is zero by construction, which
// must not read as a measured "0.0%".
const NOT_IN_MODEL_LABEL = 'Not in model';
const NOT_IN_MODEL_HELP = "Not in model: this variable was not retained in the fitted model for the selected activity (dropped during model selection), so it has no modeled effect on it.";

const ScenarioATEPanel: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  // Position of the "1 Unit Increase*" hover note. The Section 3 groups are overflow:hidden
  // cards, so an absolutely positioned note gets clipped on the last rows; this one is
  // position:fixed from the label's on-screen rect instead.
  const [unitTipPos, setUnitTipPos] = useState<{ left: number; top: number; above: boolean } | null>(null);
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
    continuousResults,
    segmentResults,
    segmentsReady,
    error,
    setSelectedEvent,
    setBaseSeverityLevel,
    setTreatmentSeverityLevel,
    setAnticipatedChange,
    getAvailableEvents,
    getSeverityLevels,
    getActivityCoefficients
  } = useScenarioATE();

  const availableEvents = getAvailableEvents();
  // Section 3 only offers activities this event actually has a model for
  // (e.g. flooding/earthquake have 5, power outage 7); if the chosen activity
  // isn't modeled for a newly selected event, fall back to the first one.
  const eventActivities = EVENT_ACTIVITY_COVERAGE[selectedEvent] ?? [];
  const effectiveActivity = eventActivities.includes(selectedActivity) ? selectedActivity : (eventActivities[0] ?? selectedActivity);
  const severityLevels = getSeverityLevels();
  // Final-model coefficients for the selected activity: decides which Section 3 rows exist.
  const activityCoefficients = getActivityCoefficients(effectiveActivity);

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

  // Activities mapping - real engine activity keys (model_coeffs_by_event.json).
  // Must match computeATE.ts's keys exactly - Section 3's continuous-variable
  // rows look up results by selectedActivity.
  const activities = [
    { value: 'use_car', label: 'Using a car for traveling' },
    { value: 'use_transit', label: 'Taking public transit' },
    { value: 'stay_home', label: 'Staying at home' },
    { value: 'delivery', label: 'Having food delivered' },
    { value: 'dine_in', label: 'Eating indoors at a restaurant' },
    { value: 'pick_up', label: 'Picking up takeout' },
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
  const currentCsvEvent = EVENT_CONFIG[selectedEvent]?.csvEvent ?? '';
  const currentBaseLevel = severityMap[baseSeverityLevel] || severityMap[1];
  const currentComparisonLevel = severityMap[treatmentSeverityLevel] || severityMap[5];
  const currentAnticipatedChange = mapAnticipatedChange(anticipatedChange);

  // Convert results to new format
  const convertResultsToATEData = () => {
    if (!results || results.length === 0) return [];
    
    // Map activity names - 9 activities max per event (see EVENT_ACTIVITY_COVERAGE).
    // Every activity - including go_business_as_usual, collapsed from its native
    // 5-point scale - now reports the same 3-category ["Do less","About the
    // same","Do more"] response scale (see computeATE.ts), so no per-activity
    // index branching is needed here any more.
    const activityLabelMap: Record<string, string> = {
      'use_transit': 'Taking public transit',
      'use_car': 'Using a car for traveling',
      'stay_home': 'Staying at home',
      'dine_in': 'Eating indoors at a restaurant',
      'pick_up': 'Picking up takeout',
      'delivery': 'Having food delivered',
      'work_from_home': 'Working from home',
      'work_from_office': 'Working from the office',
      'go_business_as_usual': 'Go about business as usual'
    };

    const getATEForChange = (result: any): Ate => {
      if (!result.ate || result.ate.length === 0) return { abs: 0, pct: 0, inModel: true };
      const ateIndex = ANTICIPATED_CHANGE_INDEX[anticipatedChange ?? 'do_more'] ?? 2;
      return toAte(result, ateIndex);
    };

    return results
      .filter(r => r.isValid)
      .map(result => ({
        activity: activityLabelMap[result.activity] || result.activity,
        activityKey: result.activity,
        ate: getATEForChange(result)
      }))
      // Sort from most positive to most negative of the value actually shown
      .sort((a, b) => (showAbsoluteATE ? b.ate.abs - a.ate.abs : b.ate.pct - a.ate.pct));
  };

  const ateData = convertResultsToATEData();

  // No compute trigger here: useScenarioATE recomputes severity ATEs when the
  // event / severity pair changes and the per-event (segment) ATEs once per
  // event. The response buttons only change which of the already-computed
  // Do less / About the same / Do more values is displayed.

  // Personal Resilience / Community Resilience / Social Engagement: real
  // ate_continuous results ("1 Unit Increase": +1.0 on the construct's own scale,
  // Jinghai 2026-10-04), for the currently selected activity. 0 both while continuousResults
  // hasn't loaded yet and when the variable isn't in that activity's model
  // (computeContinuousATE's inModel=false already returns [0,0,0]).
  const getContinuousAte = (variable: string): Ate => {
    const retained = activityCoefficients ? isContinuousRetained(activityCoefficients, CONTINUOUS_VARIABLE_KEY[variable]) : true;
    if (!segmentsReady) return { abs: 0, pct: 0, inModel: true, loading: true, retained }; // this event's numbers still being computed
    const list = continuousResults[CONTINUOUS_VARIABLE_KEY[variable]];
    const result = list?.find(r => r.activity === effectiveActivity);
    if (!result || !result.isValid) return { abs: 0, pct: 0, inModel: false, retained };
    const ateIndex = ANTICIPATED_CHANGE_INDEX[anticipatedChange ?? 'do_more'] ?? 2;
    return { ...toAte(result, ateIndex), retained };
  };

  // Gender / Age Group / Household Income / Housing Type / Transit Access:
  // real computeSegmentATEs results (each person's own observed severity and
  // every other variable held fixed; only the group's dummies forced to the
  // spec), for the currently selected activity. 0 both while segmentResults
  // hasn't loaded yet and when the group isn't in that activity's model
  // (computeSegmentATEs' inModel=false already returns [0,0,0]).
  const getSegmentAte = (groupKey: string, comparisonLabel: string): Ate => {
    const group = SEGMENT_GROUPS[groupKey];
    const comparison = group?.comparisons.find(c => c.label === comparisonLabel);
    const retained = activityCoefficients && group && comparison
      ? isSegmentComparisonRetained(activityCoefficients, group.baseSpec, comparison.spec)
      : true;
    if (!segmentsReady) return { abs: 0, pct: 0, inModel: true, loading: true, retained }; // this event's numbers still being computed
    const list = segmentResults[segmentResultKey(groupKey, comparisonLabel)];
    const result = list?.find(r => r.activity === effectiveActivity);
    if (!result || !result.isValid) return { abs: 0, pct: 0, inModel: false, retained };
    const ateIndex = ANTICIPATED_CHANGE_INDEX[anticipatedChange ?? 'do_more'] ?? 2;
    return { ...toAte(result, ateIndex), retained };
  };

  // Dummy data for Population Segment Analysis
  const demographicData = {
    attitudes: {
      title: 'Attitudes & Personality Traits',
      // Continuous standardized factor scores. Base = each person's own
      // current value; comparison = "1 Unit Increase*" (ate_continuous, shift=1).
      variables: [
        { variable: 'Personal Resilience', baseLevel: 'Current value', comparisons: [{ treatmentLevel: UNIT_INCREASE_LABEL, ate: getContinuousAte('Personal Resilience') }] },
        { variable: 'Community Resilience', baseLevel: 'Current value', comparisons: [{ treatmentLevel: UNIT_INCREASE_LABEL, ate: getContinuousAte('Community Resilience') }] },
        { variable: 'Social Engagement', baseLevel: 'Current value', comparisons: [{ treatmentLevel: UNIT_INCREASE_LABEL, ate: getContinuousAte('Social Engagement') }] }
      ]
    },
    socioDemo: {
      title: 'Socio-Demographics',
      variables: [
        { variable: SEGMENT_GROUPS.gender.label, baseLevel: SEGMENT_GROUPS.gender.baseLabel, comparisons: SEGMENT_GROUPS.gender.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('gender', c.label) })) },
        { variable: SEGMENT_GROUPS.age.label, baseLevel: SEGMENT_GROUPS.age.baseLabel, comparisons: SEGMENT_GROUPS.age.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('age', c.label) })) },
        { variable: SEGMENT_GROUPS.educationBachelors.label, baseLevel: SEGMENT_GROUPS.educationBachelors.baseLabel, comparisons: SEGMENT_GROUPS.educationBachelors.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('educationBachelors', c.label) })) },
        { variable: SEGMENT_GROUPS.educationBsOrHigher.label, baseLevel: SEGMENT_GROUPS.educationBsOrHigher.baseLabel, comparisons: SEGMENT_GROUPS.educationBsOrHigher.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('educationBsOrHigher', c.label) })) },
        { variable: SEGMENT_GROUPS.race.label, baseLevel: SEGMENT_GROUPS.race.baseLabel, comparisons: SEGMENT_GROUPS.race.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('race', c.label) })) },
        { variable: SEGMENT_GROUPS.ethnicityHispanic.label, baseLevel: SEGMENT_GROUPS.ethnicityHispanic.baseLabel, comparisons: SEGMENT_GROUPS.ethnicityHispanic.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('ethnicityHispanic', c.label) })) },
        { variable: SEGMENT_GROUPS.disability.label, baseLevel: SEGMENT_GROUPS.disability.baseLabel, comparisons: SEGMENT_GROUPS.disability.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('disability', c.label) })) },
        { variable: SEGMENT_GROUPS.employmentStatus.label, baseLevel: SEGMENT_GROUPS.employmentStatus.baseLabel, comparisons: SEGMENT_GROUPS.employmentStatus.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('employmentStatus', c.label) })) },
        { variable: SEGMENT_GROUPS.worksOutdoors.label, baseLevel: SEGMENT_GROUPS.worksOutdoors.baseLabel, comparisons: SEGMENT_GROUPS.worksOutdoors.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('worksOutdoors', c.label) })) },
        { variable: SEGMENT_GROUPS.doesNotTelecommute.label, baseLevel: SEGMENT_GROUPS.doesNotTelecommute.baseLabel, comparisons: SEGMENT_GROUPS.doesNotTelecommute.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('doesNotTelecommute', c.label) })) }
      ]
    },
    household: {
      title: 'Household Attributes',
      variables: [
        { variable: 'Household Income', baseLevel: 'Less than $50,000', comparisons: [
          { treatmentLevel: '$50,000 - $100,000', ate: getSegmentAte('householdIncome', '$50k-$100k') },
          { treatmentLevel: '$100,000 or higher', ate: getSegmentAte('householdIncome', '$100k or higher') }
        ]},
        { variable: SEGMENT_GROUPS.householdSize.label, baseLevel: SEGMENT_GROUPS.householdSize.baseLabel, comparisons: SEGMENT_GROUPS.householdSize.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('householdSize', c.label) })) },
        { variable: SEGMENT_GROUPS.childInHousehold.label, baseLevel: SEGMENT_GROUPS.childInHousehold.baseLabel, comparisons: SEGMENT_GROUPS.childInHousehold.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('childInHousehold', c.label) })) },
        { variable: SEGMENT_GROUPS.housingType.label, baseLevel: SEGMENT_GROUPS.housingType.baseLabel, comparisons: SEGMENT_GROUPS.housingType.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('housingType', c.label) })) },
        { variable: SEGMENT_GROUPS.zeroVehicleHousehold.label, baseLevel: SEGMENT_GROUPS.zeroVehicleHousehold.baseLabel, comparisons: SEGMENT_GROUPS.zeroVehicleHousehold.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('zeroVehicleHousehold', c.label) })) },
        { variable: SEGMENT_GROUPS.airConditioning.label, baseLevel: SEGMENT_GROUPS.airConditioning.baseLabel, comparisons: SEGMENT_GROUPS.airConditioning.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('airConditioning', c.label) })) }
      ]
    },
    community: {
      title: 'Community Resources',
      variables: [
        { variable: SEGMENT_GROUPS.rural.label, baseLevel: SEGMENT_GROUPS.rural.baseLabel, comparisons: SEGMENT_GROUPS.rural.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('rural', c.label) })) },
        { variable: SEGMENT_GROUPS.populationDensity.label, baseLevel: SEGMENT_GROUPS.populationDensity.baseLabel, comparisons: SEGMENT_GROUPS.populationDensity.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('populationDensity', c.label) })) },
        { variable: SEGMENT_GROUPS.employmentDensity.label, baseLevel: SEGMENT_GROUPS.employmentDensity.baseLabel, comparisons: SEGMENT_GROUPS.employmentDensity.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('employmentDensity', c.label) })) },
        { variable: SEGMENT_GROUPS.networkDensity.label, baseLevel: SEGMENT_GROUPS.networkDensity.baseLabel, comparisons: SEGMENT_GROUPS.networkDensity.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('networkDensity', c.label) })) },
        { variable: SEGMENT_GROUPS.landUseDiversity.label, baseLevel: SEGMENT_GROUPS.landUseDiversity.baseLabel, comparisons: SEGMENT_GROUPS.landUseDiversity.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('landUseDiversity', c.label) })) },
        { variable: SEGMENT_GROUPS.transitAccess.label, baseLevel: SEGMENT_GROUPS.transitAccess.baseLabel, comparisons: SEGMENT_GROUPS.transitAccess.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('transitAccess', c.label) })) },
        { variable: SEGMENT_GROUPS.walkabilityIndex.label, baseLevel: SEGMENT_GROUPS.walkabilityIndex.baseLabel, comparisons: SEGMENT_GROUPS.walkabilityIndex.comparisons.map(c => ({ treatmentLevel: c.label, ate: getSegmentAte('walkabilityIndex', c.label) })) }
      ]
    }
  };

  const tooltips: Record<string, string> = {
    eventType: "Select the type of extreme event to analyze.",
    severityAnalysis: "This analysis compares how people who experienced different severity levels of impact adjust their behavior.",
    ateDefinition: "Average Treatment Effect (ATE) measures the difference in probability of choosing a particular behavioral response when comparing two groups (e.g., those who experienced different severity levels). It quantifies how much more or less likely people are to engage in specific activities based on their prior experience.",
    ateResults: "Average Treatment Effects show probability changes.",
    populationSegments: "Shows how population characteristics affect behavioral responses. This table reports ATE estimates only for variables retained in the final model specification. Variables not retained are not displayed because no statistically significant effect was detected; their ATE values can therefore be interpreted as zero."
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

  const renderSparkline = (ate: number) => { // always driven by the absolute ATE (same visual scale in both formats)
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
      <div style={{
        background: '#c0392b',
        color: 'white',
        padding: '8px 20px',
        fontSize: '13px',
        fontWeight: 600,
        textAlign: 'center',
        letterSpacing: '0.01em',
      }}>
        ⚠ This section is under development — it will be available soon.
      </div>
      <div className="scenario-container">
        <div className="scenario-intro-card">
          <h2 className="scenario-intro-title">CARE Scenario Analysis Tool</h2>
          <p className="scenario-intro-text">
            This interactive dashboard explores how individuals adapt their activity-travel behavior in response to future extreme events. The tool leverages the Average Treatment Effects (ATE) concept. ATEs are computed from a series of econometric models estimated using CARE survey data.
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
            <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
              The design of this page is finalized; full functionality is still in progress.
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
                    <option key={l.value} value={l.value} disabled={l.value === currentComparisonLevel.value}>{l.label}</option>
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
                    <option key={l.value} value={l.value} disabled={l.value === currentBaseLevel.value}>{l.label}</option>
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
                  const shown = (d: { ate: Ate }) => (showAbsoluteATE ? d.ate.abs : d.ate.pct);
                  const maxAbs = ateData.length > 0 
                    ? Math.max(...ateData.map(d => Math.abs(shown(d)))) 
                    : 0;
                  
                  return ateData.map((item, i) => {
                    // Calculate bar width based on the actual ATE value
                    // Use the exact ATE value (not rounded) for width calculation to ensure precision
                    const absATE = Math.abs(shown(item));
                    const barWidth = maxAbs > 0 ? (absATE / maxAbs) * 100 : 0;
                    const isPos = shown(item) >= 0;
                    // Use 3 decimal places for absolute ATE to match existing chart precision
                    const val = showAbsoluteATE ? item.ate.abs.toFixed(3) : item.ate.pct.toFixed(1) + '%';
                    const isMismatched = hasVerifiedSampleMismatch(currentCsvEvent, item.activityKey);
                    const mismatchTooltipKey = `sampleMismatch-${item.activityKey}`;

                    return (
                      <div key={i} className="scenario-ate-item">
                        <div className="scenario-ate-activity">
                          {item.activityKey === 'go_business_as_usual' ? (
                            <span
                              className="scenario-tooltip-wrapper"
                              onMouseEnter={() => setShowTooltip('gbuNote')}
                              onMouseLeave={() => setShowTooltip(null)}
                            >
                              <em>{item.activity}*</em>
                              {showTooltip === 'gbuNote' && (
                                <div className="scenario-tooltip" style={{ textAlign: 'left', fontWeight: 400 }}>
                                  {GBU_NOTE}
                                  <div className="scenario-tooltip-arrow"></div>
                                </div>
                              )}
                            </span>
                          ) : item.activity}
                          {isMismatched && (
                            <span
                              className="scenario-tooltip-wrapper"
                              onMouseEnter={() => setShowTooltip(mismatchTooltipKey)}
                              onMouseLeave={() => setShowTooltip(null)}
                              style={{ color: '#c0392b', marginLeft: '4px', cursor: 'help' }}
                              title="Verified data issue - see note"
                            >
                              ⚠
                              {showTooltip === mismatchTooltipKey && (
                                <div className="scenario-tooltip" style={{ textAlign: 'left', fontWeight: 400 }}>
                                  {SAMPLE_MISMATCH_NOTE}
                                  <div className="scenario-tooltip-arrow"></div>
                                </div>
                              )}
                            </span>
                          )}
                        </div>
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
                          {shown(item) > 0 ? '+' : ''}{val}
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
                  value={effectiveActivity} 
                  onChange={(e) => setSelectedActivity(e.target.value)} 
                  className="scenario-select"
                >
                  {activities.filter(a => eventActivities.includes(a.value)).map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                <p className="scenario-config-help">Activity to analyze across population segments</p>
                {hasVerifiedSampleMismatch(currentCsvEvent, effectiveActivity) && (
                  <p className="scenario-config-help" style={{ color: '#c0392b', fontWeight: 600 }}>
                    ⚠ Verified data issue for this event/activity - see note under Section 2's matching result.
                  </p>
                )}
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
            {!activityCoefficients && (
              <p className="scenario-config-help" aria-label="Computing">Loading model…</p>
            )}
            {activityCoefficients && Object.entries(demographicData).map(([key, group]) => {
              const groupKey = key as ExpandedGroupsKey;
              // Irfan (2026-10-05): show only variables retained in the selected activity's final model.
              // A comparison is hidden when its model did not retain it; a variable with no retained
              // comparison disappears, and a group with no retained variable is not shown at all. The
              // variable / base labels sit on the first row that is shown.
              const visibleVariables = group.variables
                .map(v => ({ ...v, comparisons: v.comparisons.filter(c => c.ate.retained !== false) }))
                .filter(v => v.comparisons.length > 0);
              if (visibleVariables.length === 0) return null;
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
                        {visibleVariables.map((v, vi) => 
                          v.comparisons.map((c, ci) => (
                            <tr key={`${vi}-${ci}`} className="scenario-table-row">
                              <td className="scenario-table-cell scenario-table-cell-bold">{ci === 0 ? v.variable : ''}</td>
                              <td className="scenario-table-cell">{ci === 0 ? v.baseLevel : ''}</td>
                              <td className="scenario-table-cell">
                                {c.treatmentLevel === UNIT_INCREASE_LABEL ? (
                                  <span
                                    className="scenario-tooltip-wrapper"
                                    onMouseEnter={(e) => {
                                      const r = e.currentTarget.getBoundingClientRect();
                                      const above = r.top > 96;
                                      setUnitTipPos({
                                        left: Math.max(8, Math.min(r.left, window.innerWidth - 392)),
                                        top: above ? r.top - 8 : r.bottom + 8,
                                        above
                                      });
                                      setShowTooltip(`unitIncrease-${vi}`);
                                    }}
                                    onMouseLeave={() => setShowTooltip(null)}
                                    style={{ cursor: 'help' }}
                                  >
                                    {c.treatmentLevel}
                                    {showTooltip === `unitIncrease-${vi}` && unitTipPos && (
                                      <div
                                        className="scenario-tooltip"
                                        style={{
                                          position: 'fixed',
                                          left: unitTipPos.left,
                                          top: unitTipPos.top,
                                          transform: unitTipPos.above ? 'translateY(-100%)' : 'none',
                                          width: 'min(24rem, calc(100vw - 16px))',
                                          textAlign: 'left',
                                          fontWeight: 400
                                        }}
                                      >
                                        {UNIT_INCREASE_NOTE}
                                      </div>
                                    )}
                                  </span>
                                ) : c.treatmentLevel}
                              </td>
                              <td className="scenario-table-cell">
                                <div className="scenario-ate-display">
                                  {c.ate.loading ? (
                                    <span className="scenario-ate-display-value" aria-label="Computing" style={{ color: '#94a3b8' }}>…</span>
                                  ) : c.ate.inModel ? (
                                    <>
                                      {renderSparkline(c.ate.abs)}
                                      <span className="scenario-ate-display-value" style={{ color: c.ate.abs >= 0 ? '#6dafa0' : '#e25b61' }}>
                                        {(showDemoAbsoluteATE ? c.ate.abs : c.ate.pct) > 0 ? '+' : ''}{showDemoAbsoluteATE ? c.ate.abs.toFixed(2) : c.ate.pct.toFixed(1) + '%'}
                                      </span>
                                    </>
                                  ) : (
                                    <span
                                      className="scenario-ate-display-value scenario-ate-not-in-model"
                                      role="img"
                                      aria-label={NOT_IN_MODEL_LABEL}
                                      title={NOT_IN_MODEL_HELP}
                                      style={{ color: '#94a3b8', cursor: 'help' }}
                                    >
                                      —
                                    </span>
                                  )}
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
                <>An absolute ATE of say +0.10 means if we take a sample of 100 individuals from the base group (e.g., "Male") and replace them with a sample of 100 from the comparison group (e.g., "Female"), there would be 10 more people choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of {activities.find(a => a.value === effectiveActivity)?.label} during the next {currentEvent.name.toLowerCase()} event.</>
              ) : (
                <>A percent ATE of say +20% means if we take a sample of individuals from the base group (e.g., "Male") and replace them with a sample from the comparison group (e.g., "Female"), there would be a 20% increase in those choosing to "{currentAnticipatedChange === 'more' ? 'do more' : currentAnticipatedChange === 'less' ? 'do less' : 'maintain the same level'}" of {activities.find(a => a.value === effectiveActivity)?.label} during the next {currentEvent.name.toLowerCase()} event.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioATEPanel;
