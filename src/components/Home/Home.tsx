import React from 'react';
import { HeroSection } from './HeroSection';
import { MainContent } from './MainContent';
import { HowItWorks } from './HowItWorks';
import { CTASection } from './CTASection';
import { HomeFooter } from './HomeFooter';
import './Home.scss';

const Home: React.FC = () => {
  return (
    <div className="home-page-wrapper">
      <HeroSection />
      <MainContent />
      <HowItWorks />
      <CTASection />
      <HomeFooter />
    </div>
  );
};

export default Home;
