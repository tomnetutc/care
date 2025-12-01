import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolsGrid } from './ToolsGrid';
import { FeaturesList } from './FeaturesList';
import './MainContent.scss';

export const MainContent: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-description-box">
        <p>
          The Community Adaptation and Resilience to Extremes (CARE) Dashboard is an open-source, interactive data visualization and analysis platform that makes findings from the nationwide CARE survey widely accessible. With data from approximately 5,100 respondents across the United States, including targeted oversamples from Seattle and Phoenix metropolitan areas, the dashboard reveals how individuals and communities adapt to disruptive events such as extreme weather, pandemics, and power outages.
        </p>
      </div>
      
      <p className="home-section-title">Explore How Communities Adapt to Extreme Events Using Nationwide CARE Survey Data</p>

      <ToolsGrid />

      <div className="home-features-badge-wrapper">
        <div className="home-features-badge">
          <div className="home-features-badge-icon">⭐</div>
          Key Features
        </div>
      </div>

      <FeaturesList />
    </div>
  );
};

