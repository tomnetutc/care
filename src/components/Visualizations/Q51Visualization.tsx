import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q51Visualization: React.FC = () => {
  const categoryOrder = [
    'Less than $9,999',
    '$10,000 - $24,999',
    '$25,000 - $34,999',
    '$35,000 - $49,999',
    '$50,000 - $74,999',
    '$75,000 - $99,999',
    '$100,000 - $149,999',
    '$150,000 - $199,999',
    '$200,000 - $249,999',
    '$250,000 or higher',
    'Prefer not to answer',
  ];

  const categoryLabels: { [key: string]: string } = {
    'Less than $9,999': 'Less than $9,999',
    '$10,000 - $24,999': '$10,000 - $24,999',
    '$25,000 - $34,999': '$25,000 - $34,999',
    '$35,000 - $49,999': '$35,000 - $49,999',
    '$50,000 - $74,999': '$50,000 - $74,999',
    '$75,000 - $99,999': '$75,000 - $99,999',
    '$100,000 - $149,999': '$100,000 - $149,999',
    '$150,000 - $199,999': '$150,000 - $199,999',
    '$200,000 - $249,999': '$200,000 - $249,999',
    '$250,000 or higher': '$250,000 or higher',
    'Prefer not to answer': 'Prefer not to answer',
  };

  const valueMap: { [key: string]: string } = {
    '1': 'Less than $9,999',
    '2': '$10,000 - $24,999',
    '3': '$25,000 - $34,999',
    '4': '$35,000 - $49,999',
    '5': '$50,000 - $74,999',
    '6': '$75,000 - $99,999',
    '7': '$100,000 - $149,999',
    '8': '$150,000 - $199,999',
    '9': '$200,000 - $249,999',
    '10': '$250,000 or higher',
    '11': 'Prefer not to answer',
  };

  const categoryColors: { [key: string]: string } = {
    'Less than $9,999': '#507dbc',
    '$10,000 - $24,999': '#507dbc',
    '$25,000 - $34,999': '#507dbc',
    '$35,000 - $49,999': '#507dbc',
    '$50,000 - $74,999': '#507dbc',
    '$75,000 - $99,999': '#507dbc',
    '$100,000 - $149,999': '#507dbc',
    '$150,000 - $199,999': '#507dbc',
    '$200,000 - $249,999': '#507dbc',
    '$250,000 or higher': '#507dbc',
    'Prefer not to answer': '#507dbc',
  };

  return (
    <HorizontalBarChart
      questionId="Q51"
      title="What is your annual household income? Please include the income of all members of the household before taxes. By 'household', we mean people who live together and share at least some financial resources. Please do not include unrelated housemates or roommates."
      dataField="hh_income"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={['q51', 'household_income']}
      tooltipCountLabel="Responses"
      
    />
  );
};

export default Q51Visualization; 