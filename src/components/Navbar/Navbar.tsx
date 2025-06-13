  import React from "react";
import "./Navbar.scss";
import { Navbar as NavbarBs } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import timeTravelIcon from "../images/SVGLogo.svg";

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <NavbarBs fixed="top" className="dashboard-navbar shadow-sm">
      <div className="navbar-content">
        <div className="navbar-brand-section">
          <Link to="/" className="brand-link">
            <img
              src={timeTravelIcon}
              alt="Dashboard Logo"
              style={{ width: "80px", marginRight: "-8px" }}
            />
            <h1 className="fw-bold mb-0 text-dark" style={{ marginLeft: "-4px" }}>Community Adaptation and Resilience to Extremes (CARE) Dashboard</h1>
          </Link>
        </div>

        <div className="utility-links">
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          <Link to="/" className={`nav-link ${
  location.pathname === '/' || 
  location.pathname.includes('/lifestyle') ||
  location.pathname.includes('/community') ||
  location.pathname.includes('/disruptions') ||
  location.pathname.includes('/work') ||
  location.pathname.includes('/transportation') ||
  location.pathname.includes('/transit') ||
  location.pathname.includes('/driving') ||
  location.pathname.includes('/demographics')
  ? 'active' : ''
}`}>Dashboard</Link>
        </div>
      </div>
    </NavbarBs>
  );
};

export default Navbar;
