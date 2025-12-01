import React from 'react';
import './HowItWorks.scss';

export const HowItWorks: React.FC = () => {
  return (
    <section className="home-how-it-works">
      <div className="home-steps-container">
        <h2 className="home-steps-title">How It Works</h2>
        <div className="home-steps-list">
          <div className="home-step-item">
            <div className="home-step-number">1</div>
            <div className="home-step-content">
              <strong>Select Your Analysis Tool</strong>
              <span>Choose Survey Data Explorer to interact with visualizations of the complete CARE dataset, or Scenario Analysis Tool to explore predictive models showing how people adapt to extreme events</span>
            </div>
            <div className="home-step-icon">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="12" width="18" height="26" rx="2" fill="#6dafa0" opacity="0.3"/>
                <rect x="24" y="12" width="18" height="26" rx="2" fill="#6dafa0"/>
              </svg>
            </div>
          </div>

          <div className="home-step-item">
            <div className="home-step-number">2</div>
            <div className="home-step-content">
              <strong>Customize Your Analysis</strong>
              <span>Filter by socio-demographic attributes, extreme event types, severity levels, and population segments. Download both individual chart data and the complete dataset for further analysis</span>
            </div>
            <div className="home-step-icon">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="25" cy="25" r="12" fill="none" stroke="#6dafa0" strokeWidth="2"/>
                <circle cx="25" cy="15" r="3" fill="#6dafa0"/>
                <circle cx="35" cy="25" r="3" fill="#6dafa0"/>
                <circle cx="25" cy="35" r="3" fill="#6dafa0"/>
                <circle cx="15" cy="25" r="3" fill="#6dafa0"/>
              </svg>
            </div>
          </div>

          <div className="home-step-item">
            <div className="home-step-number">3</div>
            <div className="home-step-content">
              <strong>Explore Dynamic Visualizations</strong>
              <span>View instant updates as you refine selections. Navigate through thoughtfully designed charts representing survey results with visual clarity and interpretability across all population segments</span>
            </div>
            <div className="home-step-icon">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="8" height="20" fill="#6dafa0" opacity="0.5"/>
                <rect x="21" y="15" width="8" height="25" fill="#6dafa0" opacity="0.7"/>
                <rect x="32" y="10" width="8" height="30" fill="#6dafa0"/>
              </svg>
            </div>
          </div>

          <div className="home-step-item">
            <div className="home-step-number">4</div>
            <div className="home-step-content">
              <strong>Generate Actionable Insights</strong>
              <span>Use comparative analysis to understand adaptation strategies across populations. Support research, planning, and policy applications with data-driven insights into community resilience and adaptive capacity</span>
            </div>
            <div className="home-step-icon">
              <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25 10L20 25L35 20L25 10Z" fill="#6dafa0"/>
                <circle cx="25" cy="35" r="8" fill="#6dafa0" opacity="0.5"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

