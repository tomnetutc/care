import React from "react";
import "./Navbar.scss";
import { Navbar as NavbarBs } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { CareLogo } from "./CareLogo";

export const Navbar: React.FC = () => {
  const location = useLocation();
  
  // All pages now use the same compact navbar
  const isHomepage = location.pathname === '/home' || location.pathname === '/about' || location.pathname === '/scenario';
  
  return (
    <NavbarBs fixed="top" className="dashboard-navbar homepage-navbar shadow-sm">
      <div className="navbar-content">
        <div className="navbar-brand-section">
          <Link to="/" className="brand-link">
            <CareLogo size={40} />
            <span className="brand-title">CARE Dashboard</span>
          </Link>
        </div>

        <div className="utility-links">
          <Link to="/home" className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}>Home</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
          <Link to="/lifestyle/preferences" className={`nav-link ${
  location.pathname === '/lifestyle/preferences' || 
  location.pathname.includes('/lifestyle') ||
  location.pathname.includes('/community') ||
  location.pathname.includes('/disruptions') ||
  location.pathname.includes('/work') ||
  location.pathname.includes('/transportation') ||
  location.pathname.includes('/transit') ||
  location.pathname.includes('/driving') ||
  location.pathname.includes('/demographics')
  ? 'active' : ''
}`}>Survey Explorer</Link>
          <Link to="/scenario" className={`nav-link ${location.pathname === '/scenario' ? 'active' : ''}`}>Scenario Analysis</Link>
        </div>
      </div>
    </NavbarBs>
  );
};

export default Navbar;
