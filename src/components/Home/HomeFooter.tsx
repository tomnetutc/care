import React from "react";
import asuLogo from "../../images/logos/asu.png";
import tbdLogo from "../../images/logos/tbd.png";
import utAustinLogo from "../../images/logos/utaustin.png";
import usDotLogo from "../../images/logos/us-dot.png";
import tomnetLogo from "../../images/logos/tomnet.png";
import "./HomeFooter.scss";

export const HomeFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="home-footer">
      <div className="home-footer-content">
        <div className="home-footer-section">
          <h4>Have Questions or Feedback?</h4>
          <p>
            For any inquiries or feedback, please contact Dr. Irfan Batur at{" "}
            <a href="mailto:ibatur@asu.edu">ibatur@asu.edu</a>
          </p>
        </div>
        <div className="home-footer-section">
          <h4>Visitor Statistics</h4>
          <div className="home-visitor-stats">
            <span>
              Unique visitors: <strong>--</strong>
            </span>
            <span>
              Total visits: <strong>--</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="home-sponsors">
        <h3 className="home-sponsors-title">Our Sponsors</h3>
        <div className="home-sponsors-grid">
          <a href="https://www.transportation.gov/" target="_blank" rel="noreferrer">
            <img src={usDotLogo} alt="USDOT Logo" className="home-sponsor-logo" />
          </a>
          <a href="https://www.utexas.edu/" target="_blank" rel="noreferrer">
            <img src={utAustinLogo} alt="UT Austin Logo" className="home-sponsor-logo" />
          </a>
          <a href="https://tbd.ctr.utexas.edu/" target="_blank" rel="noreferrer">
            <img src={tbdLogo} alt="UT CTR Logo" className="home-sponsor-logo" />
          </a>
          <a href="https://tomnet-utc.engineering.asu.edu/" target="_blank" rel="noreferrer">
            <img src={tomnetLogo} alt="TOMNET Logo" className="home-sponsor-logo" />
          </a>
          <a href="https://www.asu.edu/" target="_blank" rel="noreferrer">
            <img src={asuLogo} alt="ASU Logo" className="home-sponsor-logo" />
          </a>
        </div>
      </div>

      <div className="home-copyright">
        © {currentYear} CARE Dashboard
      </div>
    </footer>
  );
};

