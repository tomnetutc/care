import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ToolsGrid.scss';

export const ToolsGrid: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-tools-grid">
      <div className="home-tool-card home-tool-card-blue">
        <div className="home-tool-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="20" width="70" height="55" rx="4" fill="white" stroke="#5ebce5" strokeWidth="2.5"/>
            <rect x="20" y="28" width="25" height="20" rx="2" fill="#d4eff5"/>
            <path d="M 22 43 L 27 38 L 32 40 L 37 35 L 42 37" stroke="#5ebce5" strokeWidth="2" fill="none"/>
            <rect x="50" y="28" width="30" height="4" rx="1" fill="#5ebce5"/>
            <rect x="50" y="35" width="25" height="4" rx="1" fill="#5ebce5"/>
            <rect x="50" y="42" width="28" height="4" rx="1" fill="#5ebce5"/>
            <circle cx="25" cy="60" r="5" fill="#4a9dc9"/>
            <circle cx="40" cy="60" r="5" fill="#4a9dc9"/>
            <circle cx="55" cy="60" r="5" fill="#4a9dc9"/>
            <path d="M 70 55 L 70 65 M 65 60 L 70 65 L 75 60" stroke="#4a9dc9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="65" y1="67" x2="75" y2="67" stroke="#4a9dc9" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="home-tool-title">Survey Data Explorer</h3>
        <p className="home-tool-description">
          Explore comprehensive survey data from 5,100+ U.S. respondents. Navigate through lifestyle, community resources, disruption experiences, and travel behaviors with interactive visualizations.
        </p>
        <a 
          href="#survey-explorer" 
          className="home-tool-button home-tool-button-blue"
          onClick={(e) => {
            e.preventDefault();
            navigate('/lifestyle/preferences');
          }}
        >
          Launch
        </a>
      </div>

      <div className="home-tool-card home-tool-card-orange">
        <div className="home-tool-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="20" y1="70" x2="80" y2="70" stroke="#f9a875" strokeWidth="3"/>
            <circle cx="30" cy="70" r="6" fill="#e89560"/>
            <path d="M 30 70 Q 40 60 50 30" stroke="#f9a875" strokeWidth="2.5" fill="none"/>
            <circle cx="50" cy="30" r="5" fill="#f9a875"/>
            <circle cx="48" cy="25" r="2" fill="#e89560"/>
            <circle cx="52" cy="25" r="2" fill="#e89560"/>
            <circle cx="50" cy="22" r="2" fill="#e89560"/>
            <path d="M 30 70 Q 45 65 60 45" stroke="#f9a875" strokeWidth="2.5" fill="none"/>
            <circle cx="60" cy="45" r="5" fill="#f9a875"/>
            <circle cx="58" cy="40" r="2" fill="#e89560"/>
            <circle cx="62" cy="40" r="2" fill="#e89560"/>
            <circle cx="60" cy="37" r="2" fill="#e89560"/>
            <path d="M 30 70 Q 50 68 70 50" stroke="#f9a875" strokeWidth="2.5" fill="none"/>
            <circle cx="70" cy="50" r="5" fill="#f9a875"/>
            <circle cx="68" cy="45" r="2" fill="#e89560"/>
            <circle cx="72" cy="45" r="2" fill="#e89560"/>
            <circle cx="70" cy="42" r="2" fill="#e89560"/>
            <line x1="30" y1="70" x2="30" y2="75" stroke="#e89560" strokeWidth="2"/>
            <line x1="50" y1="70" x2="50" y2="75" stroke="#f9a875" strokeWidth="2"/>
            <line x1="70" y1="70" x2="70" y2="75" stroke="#f9a875" strokeWidth="2"/>
          </svg>
        </div>
        <h3 className="home-tool-title">Scenario Analysis Tool</h3>
        <p className="home-tool-description">
          Model behavioral responses to five extreme event types using econometric predictions. Explore how different populations might adapt their activities and travel during future disruptions across distinct activity categories including dining in at restaurants and picking up takeout separately.
        </p>
        <a 
          href="#scenario-analysis" 
          className="home-tool-button home-tool-button-orange"
          onClick={(e) => {
            e.preventDefault();
            navigate('/scenario');
          }}
        >
          Launch
        </a>
      </div>
    </div>
  );
};

