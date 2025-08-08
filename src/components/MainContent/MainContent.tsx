import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Q1Visualization, Q2Visualization, Q3Visualization, Q4Visualization, Q5Visualization, Q6Visualization, Q7Visualization, Q8Visualization, Q9Visualization, Q10Visualization, Q11aVisualization, Q12aVisualization, Q13aVisualization, Q14aVisualization, Q15aVisualization, Q16aVisualization, Q17aVisualization, Q18aVisualization, Q11bVisualization, Q12bVisualization, Q13bVisualization, Q14bVisualization, Q15bVisualization, Q16bVisualization, Q17bVisualization, Q11cVisualization, Q12cVisualization, Q52Visualization, Q13cVisualization, Q14cVisualization, Q15cVisualization, Q16cVisualization, Q17cVisualization, Q11dVisualization, Q12dVisualization, Q13dVisualization, Q14dVisualization, Q15dVisualization, Q16dVisualization, Q17dVisualization, Q11eVisualization, Q12eVisualization, Q13eVisualization, Q14eVisualization, Q15eVisualization, Q17eVisualization, Q16eVisualization, Q19Visualization, Q20Visualization, Q21CombinedVisualization, Q22Visualization, Q23Visualization, Q24Visualization, Q25Visualization, Q26Visualization, Q27Visualization, Q28Visualization, Q29Visualization, Q30Visualization, Q31Visualization, Q32Visualization, Q33Visualization, Q34Visualization, Q35Visualization, Q36aVisualization, Q36bVisualization, Q37aVisualization, Q37bVisualization, Q38Visualization, Q39Visualization, Q40Visualization, Q41Visualization, Q46Visualization, Q47Visualization, Q48Visualization, Q49Visualization, Q50Visualization, Q51Visualization, Q42Visualization, Q42aVisualization, Q42bVisualization, Q42cVisualization, DivisionVisualization, CensusRegionCountyVisualization, Q43Visualization, Q44Visualization, Q45Visualization } from '../Visualizations';
import './MainContent.scss';
import Sidebar from '../Sidebar/Sidebar';
import TopMenu from '../TopMenu/TopMenu';
import { subHeadingsData } from '../../data/subHeadings';
import { useCurrentTopic } from '../../context/CurrentTopicContext';

// Generate unique scoped key for topic identification
const generateScopedKey = (section: string, subSection: string, topicLabel: string): string => {
  return `${section}-${subSection}-${topicLabel}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

// Create a mapping with scoped keys to handle repeated topic labels across sub-sections
const SCOPED_TOPIC_DATA: Record<string, { text: string; component: React.ComponentType<any> | null; section: string; subSection: string }> = {
  // Lifestyle section
  [generateScopedKey('lifestyle', 'preferences', 'Lifestyle Preferences')]: { 
    text: 'Lifestyle Preferences', 
    component: Q1Visualization, 
    section: 'lifestyle', 
    subSection: 'preferences' 
  },
  [generateScopedKey('lifestyle', 'satisfaction', 'Overall Life Satisfaction')]: { 
    text: 'Overall Life Satisfaction', 
    component: Q4Visualization, 
    section: 'lifestyle', 
    subSection: 'satisfaction' 
  },
  [generateScopedKey('lifestyle', 'satisfaction', 'Change in Satisfaction Since Pandemic')]: { 
    text: 'Change in Satisfaction Since Pandemic', 
    component: Q5Visualization, 
    section: 'lifestyle', 
    subSection: 'satisfaction' 
  },
  [generateScopedKey('lifestyle', 'health', 'Strength of Social Connections')]: { 
    text: 'Strength of Social Connections', 
    component: Q6Visualization, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Access to Quality Healthcare')]: { 
    text: 'Access to Quality Healthcare', 
    component: Q7Visualization, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Perceived Financial Security')]: { 
    text: 'Perceived Financial Security', 
    component: Q8Visualization, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Caregiving Responsibilities')]: { 
    text: 'Caregiving Responsibilities', 
    component: Q9Visualization, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  
  // Community section
  [generateScopedKey('community', 'resources', 'Community Support & Adaptation')]: { 
    text: 'Community Support & Adaptation', 
    component: Q2Visualization, 
    section: 'community', 
    subSection: 'resources' 
  },
  [generateScopedKey('community', 'awareness', 'Resource Awareness & Access')]: { 
    text: 'Resource Awareness & Access', 
    component: Q3Visualization, 
    section: 'community', 
    subSection: 'awareness' 
  },
  [generateScopedKey('community', 'improvement', 'Suggestions for Preparedness')]: { 
    text: 'Suggestions for Preparedness', 
    component: Q52Visualization, 
    section: 'community', 
    subSection: 'improvement' 
  },
  
  // Disruptions section
  [generateScopedKey('disruptions', 'exposure', 'Prior Experience')]: { 
    text: 'Prior Experience', 
    component: Q10Visualization, 
    section: 'disruptions', 
    subSection: 'exposure' 
  },
  
  // Extreme Heat
  [generateScopedKey('disruptions', 'heat', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: Q11aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: Q12aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: Q13aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: Q14aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: Q15aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: Q16aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: Q17aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Air Conditioning at Home')]: { 
    text: 'Air Conditioning at Home', 
    component: Q18aVisualization, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  
  // Extreme Cold
  [generateScopedKey('disruptions', 'cold', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: Q11bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: Q12bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: Q13bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: Q14bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: Q15bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: Q16bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  [generateScopedKey('disruptions', 'cold', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: Q17bVisualization, 
    section: 'disruptions', 
    subSection: 'cold' 
  },
  
  // Flooding
  [generateScopedKey('disruptions', 'flooding', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: Q11cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: Q12cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: Q13cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: Q14cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: Q15cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: Q16cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  [generateScopedKey('disruptions', 'flooding', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: Q17cVisualization, 
    section: 'disruptions', 
    subSection: 'flooding' 
  },
  
  // Earthquake
  [generateScopedKey('disruptions', 'earthquake', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: Q11dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: Q12dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: Q13dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: Q14dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: Q15dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: Q16dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  [generateScopedKey('disruptions', 'earthquake', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: Q17dVisualization, 
    section: 'disruptions', 
    subSection: 'earthquake' 
  },
  
  // Power Outage
  [generateScopedKey('disruptions', 'power-outage', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: Q11eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: Q12eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: Q13eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: Q14eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: Q15eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: Q16eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  [generateScopedKey('disruptions', 'power-outage', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: Q17eVisualization, 
    section: 'disruptions', 
    subSection: 'power-outage' 
  },
  
  // Activity and Travel Behaviors and Choices
  [generateScopedKey('transportation', 'commute', 'Frequency of Commuting')]: {
    text: 'Frequency of Commuting',
    component: Q20Visualization,
    section: 'transportation',
    subSection: 'commute'
  },
  [generateScopedKey('transportation', 'commute', 'Distance to Work/School')]: {
    text: 'Distance to Work/School',
    component: Q21CombinedVisualization,
    section: 'transportation',
    subSection: 'commute'
  },
  [generateScopedKey('transportation', 'choices', 'Modes of Transportation')]: {
    text: 'Modes of Transportation',
    component: Q22Visualization,
    section: 'transportation',
    subSection: 'choices'
  },
  [generateScopedKey('transportation', 'deliveries', 'Deliveries and Services')]: {
    text: 'Deliveries and Services',
    component: Q23Visualization,
    section: 'transportation',
    subSection: 'deliveries'
  },
  [generateScopedKey('transportation', 'leisure', 'Leisure and Outdoor Activities')]: {
    text: 'Leisure and Outdoor Activities',
    component: Q24Visualization,
    section: 'transportation',
    subSection: 'leisure'
  },
  [generateScopedKey('transportation', 'decisions', 'Importance of Factors for Participation')]: {
    text: 'Importance of Factors for Participation',
    component: Q25Visualization,
    section: 'transportation',
    subSection: 'decisions'
  },
  [generateScopedKey('transportation', 'decisions', 'Motivations for Leaving Home')]: {
    text: 'Motivations for Leaving Home',
    component: Q26Visualization,
    section: 'transportation',
    subSection: 'decisions'
  },
  [generateScopedKey('transportation', 'decisions', 'Concerns About Out-of-Home Activities')]: {
    text: 'Concerns About Out-of-Home Activities',
    component: Q27Visualization,
    section: 'transportation',
    subSection: 'decisions'
  },
  [generateScopedKey('transportation', 'dining', 'Dining Preferences')]: {
    text: 'Dining Preferences',
    component: Q28Visualization,
    section: 'transportation',
    subSection: 'dining'
  },
  [generateScopedKey('transportation', 'dining', 'Changes in Dining Behavior')]: {
    text: 'Changes in Dining Behavior',
    component: Q29Visualization,
    section: 'transportation',
    subSection: 'dining'
  },
  [generateScopedKey('transportation', 'dining', 'Restaurant Adaptations')]: {
    text: 'Restaurant Adaptations',
    component: Q30Visualization,
    section: 'transportation',
    subSection: 'dining'
  },
  [generateScopedKey('transportation', 'transit', 'Transit Availability')]: {
    text: 'Transit Availability',
    component: Q31Visualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Current Frequency of Use')]: {
    text: 'Current Frequency of Use',
    component: Q32Visualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Mode-Specific Transit Use')]: {
    text: 'Mode-Specific Transit Use',
    component: Q33Visualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Pre-Pandemic Transit Use')]: {
    text: 'Pre-Pandemic Transit Use',
    component: Q34Visualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Transit Use During Pandemic')]: {
    text: 'Transit Use During Pandemic',
    component: Q35Visualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Reasons for Reduced Use Post-Pandemic')]: {
    text: 'Reasons for Reduced Use Post-Pandemic',
    component: Q36aVisualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Reasons for Increased Use Post-Pandemic')]: {
    text: 'Reasons for Increased Use Post-Pandemic',
    component: Q36bVisualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Purpose of Last Transit Trip')]: {
    text: 'Purpose of Last Transit Trip',
    component: Q37aVisualization,
    section: 'transportation',
    subSection: 'transit'
  },
  [generateScopedKey('transportation', 'transit', 'Alternative Mode If Transit Unavailable')]: {
    text: 'Alternative Mode If Transit Unavailable',
    component: Q37bVisualization,
    section: 'transportation',
    subSection: 'transit'
  },
  // Sample Characteristics section
  [generateScopedKey('sample-characteristics', 'individual', 'Gender')]: {
    text: 'Gender',
    component: Q46Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Age')]: {
    text: 'Age',
    component: Q45Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Race')]: {
    text: 'Race',
    component: Q48Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Ethnicity')]: {
    text: 'Ethnicity',
    component: Q47Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Education Level')]: {
    text: 'Education Level',
    component: Q49Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Disability Status')]: {
    text: 'Disability Status',
    component: Q50Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Employment/Student Status')]: {
    text: 'Employment/Student Status',
    component: Q19Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Work Environment')]: {
    text: 'Work Environment',
    component: Q39Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Driver\'s License')]: {
    text: 'Driver\'s License',
    component: Q38Visualization,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Household Size')]: {
    text: 'Household Size',
    component: Q42Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Children')]: {
    text: 'Number of Children',
    component: Q42aVisualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Adults')]: {
    text: 'Number of Adults',
    component: Q42bVisualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Older Persons (65+)')]: {
    text: 'Number of Older Persons (65+)',
    component: Q42cVisualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Household Income')]: {
    text: 'Household Income',
    component: Q51Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Housing Type')]: {
    text: 'Housing Type',
    component: Q40Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Home Ownership')]: {
    text: 'Home Ownership',
    component: Q41Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Vehicles')]: {
    text: 'Number of Vehicles',
    component: Q44Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Drivers')]: {
    text: 'Number of Drivers',
    component: Q43Visualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Division')]: {
    text: 'Division',
    component: DivisionVisualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Census Region + County')]: {
    text: 'Census Region + County',
    component: CensusRegionCountyVisualization,
    section: 'sample-characteristics',
    subSection: 'household'
  },
};

// Default scoped keys for each URL slug
const DEFAULT_SCOPED_KEYS: Record<string, string> = {
  'preferences': generateScopedKey('lifestyle', 'preferences', 'Lifestyle Preferences'),
  'satisfaction': generateScopedKey('lifestyle', 'satisfaction', 'Overall Life Satisfaction'),
  'health': generateScopedKey('lifestyle', 'health', 'Strength of Social Connections'),
  'resources': generateScopedKey('community', 'resources', 'Community Support & Adaptation'),
  'awareness': generateScopedKey('community', 'awareness', 'Resource Awareness & Access'),
  'improvement': generateScopedKey('community', 'improvement', 'Suggestions for Preparedness'),
  'exposure': generateScopedKey('disruptions', 'exposure', 'Prior Experience'),
  'heat': generateScopedKey('disruptions', 'heat', 'Impact on Daily Life'),
  'cold': generateScopedKey('disruptions', 'cold', 'Impact on Daily Life'),
  'flooding': generateScopedKey('disruptions', 'flooding', 'Impact on Daily Life'),
  'earthquake': generateScopedKey('disruptions', 'earthquake', 'Impact on Daily Life'),
  'power-outage': generateScopedKey('disruptions', 'power-outage', 'Impact on Daily Life'),
  'employment': generateScopedKey('transportation', 'commute', 'Frequency of Commuting'),
  'commute': generateScopedKey('transportation', 'commute', 'Frequency of Commuting'),
  'distance': generateScopedKey('transportation', 'commute', 'Distance to Work/School'),
  'choices': generateScopedKey('transportation', 'choices', 'Modes of Transportation'),
  'delivery': generateScopedKey('transportation', 'deliveries', 'Deliveries and Services'),
  'decisions': generateScopedKey('transportation', 'decisions', 'Importance of Factors for Participation'),
  'dining': generateScopedKey('transportation', 'dining', 'Dining Preferences'),
  'transit': generateScopedKey('transportation', 'transit', 'Transit Availability'),
  'transit-frequency': generateScopedKey('transportation', 'transit', 'Current Frequency of Use'),
  'transit-modes': generateScopedKey('transportation', 'transit', 'Mode-Specific Transit Use'),
  'transit-pre-pandemic': generateScopedKey('transportation', 'transit', 'Pre-Pandemic Transit Use'),
  'transit-pandemic': generateScopedKey('transportation', 'transit', 'Transit Use During Pandemic'),
  'transit-reasons-reduced': generateScopedKey('transportation', 'transit', 'Reasons for Reduced Use Post-Pandemic'),
  'transit-reasons-increased': generateScopedKey('transportation', 'transit', 'Reasons for Increased Use Post-Pandemic'),
  'transit-last-trip': generateScopedKey('transportation', 'transit', 'Purpose of Last Transit Trip'),
  'transit-alternative': generateScopedKey('transportation', 'transit', 'Alternative Mode If Transit Unavailable'),
  'licensing': generateScopedKey('sample-characteristics', 'individual', 'Driver\'s License'),
  'housing': generateScopedKey('sample-characteristics', 'household', 'Housing Type'),
  'household': generateScopedKey('sample-characteristics', 'household', 'Household Size'),
  'personal': generateScopedKey('sample-characteristics', 'individual', 'Employment/Student Status'),
  'individual': generateScopedKey('sample-characteristics', 'individual', 'Age'),
};

// Type definitions
interface Question {
  id: number;
  text: string;
}

interface SubHeading {
  name: string;
  questions: Question[];
}

interface MainContentProps {
  subHeadings: SubHeading[];
}

// URL slug to sub-heading name mapping - keep existing
const SLUG_TO_NAME_MAP: Record<string, string> = {
  'preferences': 'Lifestyle Preferences',
  'satisfaction': 'Life Satisfaction',
  'satisfaction-now': 'Life Satisfaction',
  'satisfaction-pandemic': 'Life Satisfaction vs Pandemic',
  'health': 'Support Systems & Health Access',
  'resources': 'Community Support & Adaptation',
  'awareness': 'Resource Awareness & Access',
  'improvement': 'Suggestions for Preparedness',
  'exposure': 'Prior Experience',
  'heat': 'Impact on Daily Life',
  'cold': 'Impact on Daily Life',
  'flooding': 'Impact of Flooding',
  'earthquake': 'Impact of Earthquake',
  'power-outage': 'Impact of Power Outage',
  'employment': 'Employment & Student Status',
  'commute': 'Travel Frequency for Work/School',
  'distance': 'Distance to Work or School',
  'choices': 'Transportation Choices',
  'delivery': 'Delivery & Activity Frequency',
  'decisions': 'Motivations and Concerns for Activity Participation',
  'dining': 'Dining Preferences and COVID-19 Impact',
  'transit': 'Transit Use and COVID-19 Impact',
  'transit-frequency': 'Current Frequency of Use',
  'transit-modes': 'Mode-Specific Transit Use',
  'transit-pre-pandemic': 'Pre-Pandemic Transit Use',
  'transit-pandemic': 'Transit Use During Pandemic',
  'transit-reasons-reduced': 'Reasons for Reduced Use Post-Pandemic',
  'transit-reasons-increased': 'Reasons for Increased Use Post-Pandemic',
  'transit-last-trip': 'Purpose of Last Transit Trip',
  'transit-alternative': 'Alternative Mode If Transit Unavailable',
  'licensing': 'Q70 – Driver licensing status',
  'housing': 'Q80 – Housing situation',
  'resources-household': 'Q83 – Household resources',
  'household': 'Q85 – Household composition',
  'personal': 'Q90 – Demographic information',
  'individual': 'Individual Attributes'
};

// Mapping of subheading slugs to section keys
const SUBHEADING_TO_SECTION: Record<string, string> = {
  'preferences': 'lifestyle',
  'satisfaction': 'lifestyle',
  'health': 'lifestyle',
  'resources': 'community',
  'awareness': 'community',
  'improvement': 'community',
  'exposure': 'disruptions',
  'heat': 'disruptions',
  'cold': 'disruptions',
  'flooding': 'disruptions',
  'earthquake': 'disruptions',
  'power-outage': 'disruptions',
  'employment': 'transportation',
  'commute': 'transportation',
  'distance': 'transportation',
  'choices': 'transportation',
  'delivery': 'transportation',
  'decisions': 'transportation',
  'dining': 'transportation',
  'transit': 'transportation',
  'transit-frequency': 'transportation',
  'transit-modes': 'transportation',
  'transit-pre-pandemic': 'transportation',
  'transit-pandemic': 'transportation',
  'transit-reasons-reduced': 'transportation',
  'transit-reasons-increased': 'transportation',
  'transit-last-trip': 'transportation',
  'transit-alternative': 'transportation',
  'licensing': 'sample-characteristics',
  'housing': 'sample-characteristics',
  'household': 'sample-characteristics',
  'personal': 'sample-characteristics',
  'individual': 'sample-characteristics',
};

const MainContent: React.FC<MainContentProps> = ({ subHeadings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null); // Now stores scoped key
  const [activeSubheading, setActiveSubheading] = useState<string | null>(null);
  const [refsReady, setRefsReady] = useState(false);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);
  const [manuallySelectedQuestion, setManuallySelectedQuestion] = useState<string | null>(null);
  const visualizationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { setCurrentTopicLabel, setCurrentTopicLabelSync } = useCurrentTopic();
  
  // Get current section from URL
  const getCurrentSection = () => {
    const pathParts = location.pathname.split('/');
    return pathParts[1] || 'lifestyle';
  };

  // Filter questions based on current MAIN SECTION only (not subsection)
  const getCurrentQuestions = () => {
    const section = getCurrentSection();
    if (section === 'sample-characteristics') {
      // Use subHeadingsData.sampleCharacteristics order
      const questions: { id: number; text: string; scopedKey: string; section: string; subSection: string }[] = [];
      subHeadingsData.sampleCharacteristics.forEach((sub: any) => {
        const subSectionSlug = sub.name === 'Individual Attributes' ? 'individual' : 'household';
        sub.questions.forEach((q: any) => {
          const scopedKey = generateScopedKey('sample-characteristics', subSectionSlug, q.text);
          const topicData = SCOPED_TOPIC_DATA[scopedKey];
          if (topicData) {
            questions.push({
              id: q.id,
              text: q.text,
              scopedKey,
              section: 'sample-characteristics',
              subSection: subSectionSlug
            });
          }
        });
      });
      return questions;
    }
    // Default for other sections
    return Object.entries(SCOPED_TOPIC_DATA)
      .filter(([scopedKey, data]) => {
        return data.section === section;
      })
      .map(([scopedKey, data], index) => ({
        id: index + 1,
        text: data.text,
        scopedKey: scopedKey,
        section: data.section,
        subSection: data.subSection
      }));
  };

  const currentQuestions = getCurrentQuestions();

  // Initialize refs array when questions change
  useEffect(() => {
    visualizationRefs.current = Array(currentQuestions.length).fill(null);
    setRefsReady(true);
  }, [currentQuestions.length]);
  
  // Set active subheading based on URL and default topic
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const currentSlug = pathParts[pathParts.length - 1];
    
    if (currentSlug && SLUG_TO_NAME_MAP[currentSlug]) {
      setActiveSubheading(currentSlug);
      
      if (DEFAULT_SCOPED_KEYS[currentSlug] && !manuallySelectedQuestion) {
        const scopedKey = DEFAULT_SCOPED_KEYS[currentSlug];
        setSelectedQuestion(scopedKey);
        
        // Set current topic label for the default question
        const topicData = SCOPED_TOPIC_DATA[scopedKey];
        if (topicData) {
          setCurrentTopicLabelSync(topicData.text);
        }
      }
    }
    }, [location.pathname, manuallySelectedQuestion, setCurrentTopicLabel]);

  // Update current topic label when selectedQuestion changes
  useEffect(() => {
    if (selectedQuestion) {
      const topicData = SCOPED_TOPIC_DATA[selectedQuestion];
      if (topicData) {
        setCurrentTopicLabelSync(topicData.text);
      }
    }
  }, [selectedQuestion, setCurrentTopicLabelSync]);
  
  // Handle scroll position changes to update active question
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (isProgrammaticScrolling) return;
    
    let maxVisibility = 0;
    let mostVisibleScopedKey = null;
    
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
        maxVisibility = entry.intersectionRatio;
        mostVisibleScopedKey = entry.target.getAttribute('data-scoped-key');
      }
    });
    
    if (mostVisibleScopedKey && mostVisibleScopedKey !== selectedQuestion) {
      setSelectedQuestion(mostVisibleScopedKey);
      
      // Update current topic label
      const topicData = SCOPED_TOPIC_DATA[mostVisibleScopedKey];
      if (topicData) {
        setCurrentTopicLabelSync(topicData.text);
      }
    }
  }, [selectedQuestion, isProgrammaticScrolling, setCurrentTopicLabelSync]);
  
  // Setup intersection observer
  useEffect(() => {
    if (!refsReady) return;
    
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '-80px 0px -300px 0px',
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5]
    });
    
    visualizationRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      visualizationRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, [handleIntersection, refsReady]);

  // Updated scroll function to use scoped keys
  const scrollToVisualization = (topicLabel: string, subheadingSlug?: string) => {
    // Always use the correct section for the subheadingSlug
    const targetSection = SUBHEADING_TO_SECTION[subheadingSlug || ''] || getCurrentSection();
    const scopedKey = generateScopedKey(targetSection, subheadingSlug || '', topicLabel);

    console.log('scrollToVisualization called:', { topicLabel, subheadingSlug, targetSection, scopedKey });

    // Always set highlight and expanded subheading state
    setSelectedQuestion(scopedKey);
    setManuallySelectedQuestion(scopedKey);
    setActiveSubheading(subheadingSlug || '');
    setCurrentTopicLabelSync(topicLabel);
    setIsProgrammaticScrolling(true);

    // Check if we need to navigate to a different section/subheading
    const pathParts = location.pathname.split('/');
    const currentSection = pathParts[1] || 'lifestyle';
    const currentSubheading = pathParts[2] || '';
    const needsNavigation = targetSection !== currentSection || subheadingSlug !== currentSubheading;

    if (needsNavigation) {
      // Navigate to the new path
      const path = `/${targetSection}/${subheadingSlug}`;
      navigate(path);
      
      // Wait for navigation and DOM update, then scroll to the target
      setTimeout(() => {
        const updatedQuestions = Object.entries(SCOPED_TOPIC_DATA)
          .filter(([_, data]) => data.section === targetSection)
          .map(([scopedKey, data], index) => ({
            id: index + 1,
            text: data.text,
            scopedKey: scopedKey,
            section: data.section,
            subSection: data.subSection
          }));
        const targetIndex = updatedQuestions.findIndex(q => q.scopedKey === scopedKey);
        if (targetIndex !== -1) {
          setTimeout(() => {
            const element = document.getElementById(scopedKey);
            if (element) {
              const mainAreaContainer = document.querySelector('.main-area');
              if (mainAreaContainer) {
                const topMenuHeight = 58;
                const additionalPadding = 20;
                const totalOffset = topMenuHeight + additionalPadding;
                mainAreaContainer.scrollTo({
                  top: element.offsetTop - totalOffset,
                  behavior: 'smooth'
                });
                setTimeout(() => {
                  setIsProgrammaticScrolling(false);
                }, 1000);
              }
            } else {
              setIsProgrammaticScrolling(false);
            }
          }, 100);
        } else {
          setIsProgrammaticScrolling(false);
        }
      }, 300);
    } else {
      // Same section, use existing logic
      const targetIndex = currentQuestions.findIndex(q => q.scopedKey === scopedKey);
      if (targetIndex !== -1 && visualizationRefs.current[targetIndex]) {
        const element = visualizationRefs.current[targetIndex];
        if (!element) {
          setIsProgrammaticScrolling(false);
          return;
        }
        const mainAreaContainer = document.querySelector('.main-area');
        if (!mainAreaContainer) {
          setIsProgrammaticScrolling(false);
          return;
        }
        const topMenuHeight = 58;
        const additionalPadding = 20;
        const totalOffset = topMenuHeight + additionalPadding;
        const containerRect = mainAreaContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativePosition = elementRect.top - containerRect.top;
        mainAreaContainer.scrollTo({
          top: mainAreaContainer.scrollTop + relativePosition - totalOffset,
          behavior: 'smooth'
        });
        setTimeout(() => {
          setIsProgrammaticScrolling(false);
        }, 1000);
      } else {
        setIsProgrammaticScrolling(false);
      }
    }
  };

  // Render visualizations using the scoped topic mapping - only for current MAIN SECTION
  const renderVisualizations = () => {
    return currentQuestions.map((question, index) => {
      const topicData = SCOPED_TOPIC_DATA[question.scopedKey];
      const VisualizationComponent = topicData?.component;

      return (
        <React.Fragment key={question.scopedKey}>
          <div
            ref={el => { visualizationRefs.current[index] = el; }}
            data-scoped-key={question.scopedKey}
            className="visualization-section"
            id={question.scopedKey}
          >
            <h3>{question.text}</h3>
            <div className="visualization-content">
              {VisualizationComponent ? <VisualizationComponent /> : <p>Visualization coming soon!</p>}
            </div>
          </div>
          <div className="section-divider" />
        </React.Fragment>
      );
    });
  };

  return (
    <div className="main-content">
      <TopMenu />
      <Sidebar
        selectedQuestion={selectedQuestion}
        activeSubheading={activeSubheading}
        onTopicClick={scrollToVisualization}
      />

      <div className="visualization-container">
        {renderVisualizations()}
      </div>
    </div>
  );
};

export default MainContent;