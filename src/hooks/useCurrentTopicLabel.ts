import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentTopic } from '../context/CurrentTopicContext';

// Generate scoped key helper function (same as in MainContent)
const generateScopedKey = (section: string, subSection: string, topicLabel: string): string => {
  return `${section}-${subSection}-${topicLabel}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

// Helper function to extract topic from title
const extractTopicFromTitle = (title: string): string | null => {
  if (!title) return null;
  
  const titleLower = title.toLowerCase();
  
  // Common topic keywords and their mappings
  const topicKeywords: Record<string, string> = {
    'housing type': 'Housing Type',
    'what type of housing': 'Housing Type',
    'household income': 'Household Income',
    'income': 'Household Income',
    'household size': 'Household Size',
    'size distribution': 'Household Size',
    'number of children': 'Number of Children',
    'children': 'Number of Children',
    'number of adults': 'Number of Adults',
    'adults': 'Number of Adults',
    'older persons': 'Number of Older Persons (65+)',
    'elderly': 'Number of Older Persons (65+)',
    'home ownership': 'Home Ownership',
    'rent or own': 'Home Ownership',
    'do you rent or own': 'Home Ownership',
    'number of vehicles': 'Number of Vehicles',
    'vehicles': 'Number of Vehicles',
    'number of drivers': 'Number of Drivers',
    'drivers': 'Number of Drivers',
    'gender': 'Gender',
    'age': 'Age',
    'race': 'Race',
    'ethnicity': 'Ethnicity',
    'education': 'Education Level',
    'disability': 'Disability Status',
    'employment': 'Employment/Student Status',
    'work environment': 'Work Environment',
    'driver license': 'Driver\'s License',
    'license': 'Driver\'s License',
    'division': 'Division',
    'census region': 'Census Region + County',
    'region': 'Census Region + County'
  };
  
  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (titleLower.includes(keyword)) {
      return topic;
    }
  }
  
  return null;
};

// SCOPED_TOPIC_DATA mapping (copied from MainContent for consistency)
const SCOPED_TOPIC_DATA: Record<string, { text: string; component: any; section: string; subSection: string }> = {
  // Lifestyle section
  [generateScopedKey('lifestyle', 'preferences', 'Lifestyle Preferences')]: { 
    text: 'Lifestyle Preferences', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'preferences' 
  },
  [generateScopedKey('lifestyle', 'satisfaction', 'Overall Life Satisfaction')]: { 
    text: 'Overall Life Satisfaction', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'satisfaction' 
  },
  [generateScopedKey('lifestyle', 'satisfaction', 'Change in Satisfaction Since Pandemic')]: { 
    text: 'Change in Satisfaction Since Pandemic', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'satisfaction' 
  },
  [generateScopedKey('lifestyle', 'health', 'Strength of Social Connections')]: { 
    text: 'Strength of Social Connections', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Access to Quality Healthcare')]: { 
    text: 'Access to Quality Healthcare', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Perceived Financial Security')]: { 
    text: 'Perceived Financial Security', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  [generateScopedKey('lifestyle', 'health', 'Caregiving Responsibilities')]: { 
    text: 'Caregiving Responsibilities', 
    component: null, 
    section: 'lifestyle', 
    subSection: 'health' 
  },
  
  // Community section
  [generateScopedKey('community', 'resources', 'Community Support & Adaptation')]: { 
    text: 'Community Support & Adaptation', 
    component: null, 
    section: 'community', 
    subSection: 'resources' 
  },
  [generateScopedKey('community', 'awareness', 'Resource Awareness & Access')]: { 
    text: 'Resource Awareness & Access', 
    component: null, 
    section: 'community', 
    subSection: 'awareness' 
  },
  [generateScopedKey('community', 'improvement', 'Suggestions for Preparedness')]: { 
    text: 'Suggestions for Preparedness', 
    component: null, 
    section: 'community', 
    subSection: 'improvement' 
  },
  
  // Disruptions section
  [generateScopedKey('disruptions', 'exposure', 'Prior Experience')]: { 
    text: 'Prior Experience', 
    component: null, 
    section: 'disruptions', 
    subSection: 'exposure' 
  },
  [generateScopedKey('disruptions', 'heat', 'Impact on Daily Life')]: { 
    text: 'Impact on Daily Life', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Coping Ability')]: { 
    text: 'Coping Ability', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Chance of Future Event')]: { 
    text: 'Chance of Future Event', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Impact of Next Event')]: { 
    text: 'Impact of Next Event', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Anticipated Responses')]: { 
    text: 'Anticipated Responses', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Other Coping Strategies')]: { 
    text: 'Other Coping Strategies', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  [generateScopedKey('disruptions', 'heat', 'Changes in Daily Activities')]: { 
    text: 'Changes in Daily Activities', 
    component: null, 
    section: 'disruptions', 
    subSection: 'heat' 
  },
  
  // Sample Characteristics - Individual section
  [generateScopedKey('sample-characteristics', 'individual', 'Gender')]: {
    text: 'Gender',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Age')]: {
    text: 'Age',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Race')]: {
    text: 'Race',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Ethnicity')]: {
    text: 'Ethnicity',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Education Level')]: {
    text: 'Education Level',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Disability Status')]: {
    text: 'Disability Status',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Employment/Student Status')]: {
    text: 'Employment/Student Status',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Work Environment')]: {
    text: 'Work Environment',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  [generateScopedKey('sample-characteristics', 'individual', 'Driver\'s License')]: {
    text: 'Driver\'s License',
    component: null,
    section: 'sample-characteristics',
    subSection: 'individual'
  },
  
  // Sample Characteristics - Household section
  [generateScopedKey('sample-characteristics', 'household', 'Household Size')]: {
    text: 'Household Size',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Children')]: {
    text: 'Number of Children',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Adults')]: {
    text: 'Number of Adults',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Older Persons (65+)')]: {
    text: 'Number of Older Persons (65+)',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Household Income')]: {
    text: 'Household Income',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Housing Type')]: {
    text: 'Housing Type',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Home Ownership')]: {
    text: 'Home Ownership',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Vehicles')]: {
    text: 'Number of Vehicles',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Number of Drivers')]: {
    text: 'Number of Drivers',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Division')]: {
    text: 'Division',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
  [generateScopedKey('sample-characteristics', 'household', 'Census Region + County')]: {
    text: 'Census Region + County',
    component: null,
    section: 'sample-characteristics',
    subSection: 'household'
  },
};

export const useCurrentTopicLabel = (fallbackTitle?: string) => {
  const location = useLocation();
  const { currentTopicLabel, getCurrentTopicLabel } = useCurrentTopic();

  // Get current topic label from multiple sources with fallbacks
  const topicLabel = useMemo(() => {
    // 1. First try the context (most reliable)
    if (currentTopicLabel) {
      return currentTopicLabel;
    }

    // 2. Try to extract from title prop
    if (fallbackTitle) {
      const extractedTopic = extractTopicFromTitle(fallbackTitle);
      if (extractedTopic) {
        return extractedTopic;
      }
    }

    // 3. Try to derive from URL
    const pathParts = location.pathname.split('/');
    const section = pathParts[1] || 'lifestyle';
    const subSection = pathParts[2] || '';
    
    // Try to find the topic from the URL hash or path
    const hash = location.hash;
    if (hash) {
      // Extract topic from hash if possible
      const hashParts = hash.split('/');
      if (hashParts.length > 2) {
        const potentialTopic = hashParts[hashParts.length - 1];
        
        // For household section, try to match specific topics
        if (section === 'sample-characteristics' && subSection === 'household') {
          // Common household topics that might appear in URL
          const householdTopics = [
            'household-size', 'household-size-distribution', 'size',
            'number-of-children', 'children', 'kids',
            'number-of-adults', 'adults',
            'number-of-older-persons', 'older-persons', 'elderly',
            'household-income', 'income',
            'housing-type', 'housing', 'type',
            'home-ownership', 'ownership', 'rent-own',
            'number-of-vehicles', 'vehicles',
            'number-of-drivers', 'drivers',
            'division', 'census-region', 'region'
          ];
          
          for (const topic of householdTopics) {
            if (potentialTopic.toLowerCase().includes(topic.toLowerCase())) {
              // Map the URL topic to the actual topic name
              const topicMapping: Record<string, string> = {
                'household-size': 'Household Size',
                'household-size-distribution': 'Household Size',
                'size': 'Household Size',
                'number-of-children': 'Number of Children',
                'children': 'Number of Children',
                'kids': 'Number of Children',
                'number-of-adults': 'Number of Adults',
                'adults': 'Number of Adults',
                'number-of-older-persons': 'Number of Older Persons (65+)',
                'older-persons': 'Number of Older Persons (65+)',
                'elderly': 'Number of Older Persons (65+)',
                'household-income': 'Household Income',
                'income': 'Household Income',
                'housing-type': 'Housing Type',
                'housing': 'Housing Type',
                'type': 'Housing Type',
                'home-ownership': 'Home Ownership',
                'ownership': 'Home Ownership',
                'rent-own': 'Home Ownership',
                'number-of-vehicles': 'Number of Vehicles',
                'vehicles': 'Number of Vehicles',
                'number-of-drivers': 'Number of Drivers',
                'drivers': 'Number of Drivers',
                'division': 'Division',
                'census-region': 'Census Region + County',
                'region': 'Census Region + County'
              };
              
              return topicMapping[topic] || 'Household Size'; // Default fallback
            }
          }
        }
        
        // Try to find this topic in our data
        for (const [scopedKey, data] of Object.entries(SCOPED_TOPIC_DATA)) {
          if (data.section === section && data.subSection === subSection && 
              data.text.toLowerCase().includes(potentialTopic.toLowerCase())) {
            return data.text;
          }
        }
      }
    }

    // 4. Try to derive from section/subsection
    for (const [scopedKey, data] of Object.entries(SCOPED_TOPIC_DATA)) {
      if (data.section === section && data.subSection === subSection) {
        return data.text;
      }
    }

    // 5. Fallback to title prop
    if (fallbackTitle) {
      return fallbackTitle;
    }

    // 6. Final fallback
    return 'Chart';
  }, [currentTopicLabel, location.pathname, location.hash, fallbackTitle]);

  return topicLabel;
}; 