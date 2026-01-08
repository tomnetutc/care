import React, { useState } from 'react';
import YouTubeModal from './YouTubeModal';
import careLogo from '../../images/HomePage/care_logo_new.svg';
import './HeroSection.scss';

export const HeroSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-logo-container">
          <img src={careLogo} alt="CARE Logo" className="home-hero-logo" />
        </div>
        <h2 className="home-hero-subtitle">Community Adaptation and Resilience to Extremes Dashboard</h2>
        <p className="home-hero-description">-- by Arizona State University and University of Washington</p>
        <a href="#demo" className="home-cta-button" onClick={(e) => { e.preventDefault(); openModal(); }}>
          WATCH DEMO
        </a>
      </section>
      <YouTubeModal
        isOpen={modalOpen}
        onClose={closeModal}
        videoId="oxMHGDbzhpE"
      />
    </>
  );
};

