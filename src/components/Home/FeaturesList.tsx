import React from 'react';
import './FeaturesList.scss';

export const FeaturesList: React.FC = () => {
  return (
    <div className="home-features-list">
      <div className="home-feature-item">
        <div className="home-feature-icon home-feature-icon-yellow">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 10L30 20L40 22L32 30L34 40L25 35L16 40L18 30L10 22L20 20L25 10Z" fill="white"/>
          </svg>
        </div>
        <div className="home-feature-content">
          <h3>Nationwide CARE Survey Data</h3>
          <p>
            Built on comprehensive survey data from approximately 5,100 respondents across the United States, including oversamples from Seattle and Phoenix metropolitan areas. Captures real community experiences with multiple disruption types including extreme heat, extreme cold, flooding, earthquakes, hurricanes, wildfires, pandemics, and power outages.
          </p>
        </div>
      </div>

      <div className="home-feature-item">
        <div className="home-feature-icon home-feature-icon-blue">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="15" width="30" height="25" rx="3" fill="none" stroke="white" strokeWidth="2"/>
            <circle cx="15" cy="20" r="2" fill="white"/>
            <circle cx="20" cy="20" r="2" fill="white"/>
            <circle cx="25" cy="20" r="2" fill="white"/>
            <path d="M13 27L20 33L37 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="home-feature-content">
          <h3>Interactive Survey Data Explorer</h3>
          <p>
            Navigate through comprehensive survey sections including Lifestyle & Wellbeing, Community Resources & Preparedness, Experiences and Responses to Disruptions, Activity and Travel Behaviors, and Sample Characteristics. Search the complete codebook, view instant descriptive statistics, create customized comparisons, and download filtered data/results.
          </p>
        </div>
      </div>

      <div className="home-feature-item">
        <div className="home-feature-icon home-feature-icon-orange">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25 40 L25 25" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M25 25 L15 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="15" cy="15" r="3" fill="white"/>
            <path d="M25 25 L25 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="25" cy="10" r="3" fill="white"/>
            <path d="M25 25 L35 15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="35" cy="15" r="3" fill="white"/>
            <circle cx="25" cy="40" r="4" fill="white"/>
          </svg>
        </div>
        <div className="home-feature-content">
          <h3>Scenario-Based Predictions for Five Event Types</h3>
          <p>
            Explore how different populations might adjust their activity-travel behaviors during future extreme events. Model behavioral responses for five specific event types: Extreme Heat, Extreme Cold, Major Flooding, Major Earthquake, and Power Outage using econometric predictions based on prior experience, demographics, attitudes, and community resources for planning and policy applications.
          </p>
        </div>
      </div>
    </div>
  );
};

