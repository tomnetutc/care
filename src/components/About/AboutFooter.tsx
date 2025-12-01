import React from "react";
import asuLogo from "../../images/logos/asu.png";
import tbdLogo from "../../images/logos/tbd.png";
import utAustinLogo from "../../images/logos/utaustin.png";
import usDotLogo from "../../images/logos/us-dot.png";
import tomnetLogo from "../../images/logos/tomnet.png";
import './AboutFooter.scss';

export const AboutFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="about-footer">
      <div className="about-footer-content">
        <div className="about-sponsors">
          <h3 className="about-sponsors-title">Our Sponsors</h3>
          <div className="about-sponsors-grid">
            <a href="https://www.transportation.gov/" target="_blank" rel="noreferrer">
              <img src={usDotLogo} alt="U.S. Department of Transportation" className="about-sponsor-logo" />
            </a>
            <a href="https://www.utexas.edu/" target="_blank" rel="noreferrer">
              <img src={utAustinLogo} alt="University of Texas at Austin" className="about-sponsor-logo" />
            </a>
            <a href="https://tbd.ctr.utexas.edu/" target="_blank" rel="noreferrer">
              <img src={tbdLogo} alt="TBD Travel Behavior and Demand Data Center" className="about-sponsor-logo" />
            </a>
            <a href="https://tomnet-utc.engineering.asu.edu/" target="_blank" rel="noreferrer">
              <img src={tomnetLogo} alt="TOMNET Transportation Center" className="about-sponsor-logo" />
            </a>
            <a href="https://www.asu.edu/" target="_blank" rel="noreferrer">
              <img src={asuLogo} alt="Arizona State University" className="about-sponsor-logo" />
            </a>
          </div>
        </div>

        <div className="about-copyright">
          © {currentYear} CARE Dashboard. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

