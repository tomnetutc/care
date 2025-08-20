import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import LikertChart from '../LikertChart/LikertChart';

interface DataItem {
  [key: string]: string | number;
}

interface ProcessedDataItem {
  question: string;
  values: {
    category: string;
    value: number;
    count: number;
  }[];
}

interface SummaryStatistic {
  question: string;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  variance: number;
  responses: number;
}

// Helper function to sanitize text for use as CSS class names
const sanitizeForCssSelector = (text: string): string => {
  return text
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace any non-alphanumeric character with dash
    .replace(/-+/g, '-')            // Replace multiple consecutive dashes with a single dash
    .replace(/^-|-$/g, '')          // Remove leading and trailing dashes
    .toLowerCase();                  // Convert to lowercase for consistency
};

// Order of questions for community resource availability
const questionOrder = [
  "avail_comm_resources",
  "avail_alert_systems",
  "avail_cooling_warming_centers",
  "avail_informal_centers",
  "avail_emergency_shelters",
  "avail_emergency_medical",
  "avail_transport_assist",
  "avail_evac_assist",
  "avail_food_water",
  "avail_charging_stations"
];

// Labels for community resource availability questions
const questionLabels: { [key: string]: string } = {
  avail_comm_resources: "Communication resources or information (e.g., community message boards, social media groups)",
  avail_alert_systems: "Emergency alert systems",
  avail_cooling_warming_centers: "Designated warming or cooling centers",
  avail_informal_centers: "Informal warming or cooling centers (e.g., malls, libraries)",
  avail_emergency_shelters: "Emergency shelters",
  avail_emergency_medical: "Emergency medical services or first aid",
  avail_transport_assist: "Transportation assistance (e.g., free or subsidized transit rides, paratransit services)",
  avail_evac_assist: "Evacuation assistance",
  avail_food_water: "Food and water distribution",
  avail_charging_stations: "Electronics charging stations"
};

// Response categories and their colors (updated to 4 categories)
const responseCategories = [
  "I'm not sure/I don't know",
  "Not available",
  "Available, but have not used",
  "Have used"
];

const categoryColors = [
  "#b6bebc", // Gray for "I'm not sure/I don't know"
  "#e25b61", // Red for "Not available"
  "#ead97c", // Yellow for "Available, but have not used"
  "#2ba88c"  // Green for "Have used"
];

const Q3Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q3"
      title="How aware are you of available community resources? Please rate your agreement with the following statements."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q3Visualization;