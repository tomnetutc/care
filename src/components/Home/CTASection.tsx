import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.scss';

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="home-cta-section">
      <h2>Begin Your Journey into Community Resilience Research</h2>
      <p>Explore CARE Dashboard to Learn How Individuals Adapt and Respond to Extreme Events and Inform Research, Planning, and Policy Decisions</p>
      <div className="home-cta-buttons">
        <a 
          href="#survey-explorer" 
          className="home-btn-primary"
          onClick={(e) => {
            e.preventDefault();
            navigate('/lifestyle/preferences');
          }}
        >
          SURVEY EXPLORER
        </a>
        <a 
          href="#scenario-analysis" 
          className="home-btn-primary"
          onClick={(e) => {
            e.preventDefault();
            navigate('/scenario');
          }}
        >
          SCENARIO ANALYSIS
        </a>
      </div>
    </section>
  );
};

