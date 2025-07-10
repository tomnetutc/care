import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

const questionOrder = [
  'conc_personal_safety',
  'conc_traffic_safety',
  'conc_public_space_maintenance',
  'conc_disability_access',
  'conc_suff_info',
  'conc_overcrowding',
  'conc_connectivity',
  'conc_noise',
  'conc_pollution',
  'conc_weather_protection',
  'conc_social_comfort',
];

const questionLabels = {
  conc_personal_safety: 'Personal safety (e.g., crime, harassment)',
  conc_traffic_safety: 'Traffic safety (e.g., crossing streets, bike lanes)',
  conc_public_space_maintenance: 'Cleanliness and general maintenance of public spaces',
  conc_disability_access: 'Accessibility for individuals with disabilities',
  conc_suff_info: 'Insufficient information or signage',
  conc_overcrowding: 'Overcrowding or too many people in public areas',
  conc_connectivity: 'Connectivity to other areas/services (e.g., public transit options, bike paths)',
  conc_noise: 'Noise levels',
  conc_pollution: 'Environmental pollution (e.g., air quality)',
  conc_weather_protection: 'Protection against weather elements (e.g., inadequate shade, shelters)',
  conc_social_comfort: 'Social comfort (e.g., feeling welcome in spaces)',
};

const responseCategories = [
  'Not concerned at all',
  'Slightly concerned',
  'Moderately concerned',
  'Very concerned',
  'Extremely concerned',
];

// Reverse color order: green (not concerned) to red (extremely concerned)
const categoryColors = [
  '#2ba88c', // Not concerned at all - strong green
  '#93c4b9', // Slightly concerned - light green
  '#ead97c', // Moderately concerned - yellow
  '#f0b3ba', // Very concerned - light red
  '#e25b61', // Extremely concerned - red
];

const Q27Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q27"
      title="How concerned are you about each of the following when you participate in activities outside your home? Please select the most appropriate response."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q27Visualization; 