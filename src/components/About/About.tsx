import React from 'react';
import { AboutSidebar } from './AboutSidebar';
import { AboutContent } from './AboutContent';
import { AboutFooter } from './AboutFooter';
import './About.scss';

const About: React.FC = () => {
  return (
    <div className="about-page-wrapper">
      <AboutSidebar />
      <AboutContent />
      <AboutFooter />
    </div>
  );
};

export default About;
