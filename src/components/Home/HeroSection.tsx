import React, { useState } from 'react';
import YouTubeModal from './YouTubeModal';
import './HeroSection.scss';

export const HeroSection: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <section className="home-hero">
        <h1 className="home-hero-title">CARE</h1>
        <h2 className="home-hero-subtitle">Community Adaptation and Resilience to Extremes Dashboard</h2>
        <p className="home-hero-description">by Arizona State University and University of Washington</p>
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

