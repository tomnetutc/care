import React, { useMemo } from 'react';
import LikertChart from '../LikertChart/LikertChart';
import { ProcessedDataItem } from '../../types/Helpers';

// Order of questions for travel frequency
const questionOrder = [
  "freq_work",
  "freq_school", 
  "freq_wfh"
];

// Labels for travel frequency questions
const questionLabels = {
  freq_work: "Working at a workplace outside your home",
  freq_school: "Attending school in-person",
  freq_wfh: "Working from home"
};

// Original categories representing days (0-7)
const sourceCategories = ["0", "1", "2", "3", "4", "5", "6", "7"];

// Dynamic category mapping definition
const dynamicCategoryMappings = [
  { id: "0", label: "0", color: "#E2E2DC", originalValues: ["0"] },
  { id: "1-2 days", label: "1–2 days", color: "#F4E9AA", originalValues: ["1", "2"] },
  { id: "3-4 days", label: "3–4 days", color: "#E4C75B", originalValues: ["3", "4"] },
  { id: "5 or more days ", label: "5 or more days", color: "#B19D45", originalValues: ["5", "6", "7"] }
];

// Function to map original value to corresponding dynamic category
const getDynamicCategory = (originalValue: string) => {
  for (const category of dynamicCategoryMappings) {
    if (category.originalValues.includes(originalValue)) {
      return category.id;
    }
  }
  return originalValue; // Fallback to original value if no mapping found
};

// Custom data processor for visualization data only
// This doesn't affect the underlying raw data used for statistics
const processData = (rawData: ProcessedDataItem[]): ProcessedDataItem[] => {
  if (!rawData || rawData.length === 0) return [];

  return rawData.map(questionData => {
    // Initialize consolidated values object with zeroed entries
    const consolidatedValues: Record<string, { value: number, count: number }> = {};
    dynamicCategoryMappings.forEach(category => {
      consolidatedValues[category.id] = { value: 0, count: 0 };
    });

    // Aggregate values from original categories into consolidated categories
    questionData.values.forEach(originalItem => {
      const dynamicCategoryId = getDynamicCategory(originalItem.category);
      consolidatedValues[dynamicCategoryId].value += originalItem.value;
      consolidatedValues[dynamicCategoryId].count += originalItem.count;
    });

    // Convert consolidated map back to array format expected by LikertChart
    const consolidatedArray = Object.entries(consolidatedValues).map(([category, data]) => ({
      category,
      value: data.value,
      count: data.count
    }));

    return {
      question: questionData.question,
      values: consolidatedArray
    };
  });
};

const Q20Visualization: React.FC = () => {
  // Extract response categories and colors from our dynamic mapping
  const categories = useMemo(() => dynamicCategoryMappings.map(m => m.id), []);
  const colors = useMemo(() => dynamicCategoryMappings.map(m => m.color), []);
  const labels = useMemo(() => dynamicCategoryMappings.map(m => m.label), []);

  return (
    <LikertChart
      questionId="Q20"
      title="In the last week, how many days did you....."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={categories}
      categoryColors={colors}
      categoryLabels={labels}
      showSummaryTable={false}
      dataProcessor={processData}
      sourceCategories={sourceCategories}
    />
  );
};

export default Q20Visualization;