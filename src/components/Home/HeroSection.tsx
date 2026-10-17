import React from 'react';
import careLogo from '../../images/HomePage/care_logo_new.svg';
import './HeroSection.scss';

// No CARE demo video yet, so "Watch Demo" opens the TOMNET YouTube channel (Irfan 2026-10-17).
const DEMO_URL = 'https://www.youtube.com/channel/UClQbFMFD7RaPJ6rNBeA474w';

export const HeroSection: React.FC = () => (
  <section className="home-hero">
    <div className="home-hero-logo-container">
      <img src={careLogo} alt="CARE Logo" className="home-hero-logo" />
    </div>
    <h2 className="home-hero-subtitle">Community Adaptation and Resilience to Extremes Dashboard</h2>
    <p className="home-hero-description">-- by Arizona State University and University of Washington</p>
    <a href={DEMO_URL} className="home-cta-button" target="_blank" rel="noopener noreferrer">
      WATCH DEMO
    </a>
  </section>
);
