import React, { useState, useEffect, JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart, 
  faUsers, 
  faExclamationCircle, 
  faBriefcase, 
  faTruck, 
  faBus, 
  faCar, 
  faUser,
  faChevronDown,
  faChevronUp 
} from '@fortawesome/free-solid-svg-icons';
import './Sidebar.scss';

/**
 * Interface for sub-heading items in the sidebar
 */
interface SubHeading {
  name: string;
  path: string;
}

/**
 * Interface for main section items in the sidebar
 */
interface Section {
  title: string;
  path: string;
  subheadings: SubHeading[];
  icon: JSX.Element;
}

/**
 * Sidebar component that displays navigation for the dashboard
 */
const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  
  // Dashboard navigation sections with their sub-headings
  const sections: Section[] = [
    {
      title: 'Lifestyle & Wellbeing',
      path: '/lifestyle',
      subheadings: [
        { name: 'Personal Preferences', path: '/lifestyle/preferences' },
        { name: 'Life Satisfaction', path: '/lifestyle/satisfaction' },
        { name: 'Social & Health Status', path: '/lifestyle/health' },
      ],
      icon: <FontAwesomeIcon icon={faHeart} />,
    },
    {
      title: 'Community Resources & Preparedness',
      path: '/community',
      subheadings: [
        { name: 'Community Awareness', path: '/community/awareness' },
        { name: 'Suggestions for Improvement', path: '/community/improvement' },
      ],
      icon: <FontAwesomeIcon icon={faUsers} />,
    },
    {
      title: 'Experiences with Disruptions & Resilience',
      path: '/disruptions',
      subheadings: [
        { name: 'General Exposure', path: '/disruptions/exposure' },
        { name: 'Extreme Heat', path: '/disruptions/heat' },
        { name: 'Extreme Cold', path: '/disruptions/cold' },
        { name: 'Flooding', path: '/disruptions/flooding' },
        { name: 'Earthquake', path: '/disruptions/earthquake' },
        { name: 'Power Outage', path: '/disruptions/power-outage' },
      ],
      icon: <FontAwesomeIcon icon={faExclamationCircle} />,
    },
    {
      title: 'Work, School & Commuting',
      path: '/work',
      subheadings: [
        { name: 'Employment & Student Status', path: '/work/employment' },
        { name: 'Commute Frequency', path: '/work/commute' },
        { name: 'Distance to Key Locations', path: '/work/distance' },
      ],
      icon: <FontAwesomeIcon icon={faBriefcase} />,
    },
    {
      title: 'Transportation Habits & Daily Activities',
      path: '/transportation',
      subheadings: [
        { name: 'Transportation Choices', path: '/transportation/choices' },
        { name: 'Delivery & Activity Frequency', path: '/transportation/delivery' },
        { name: 'Decision Making & Concerns', path: '/transportation/decisions' },
        { name: 'Dining Habits', path: '/transportation/dining' },
      ],
      icon: <FontAwesomeIcon icon={faTruck} />,
    },
    {
      title: 'Public Transit Access & Usage',
      path: '/transit',
      subheadings: [
        { name: 'Access & Usage', path: '/transit/access' },
        { name: 'Changes Over Time', path: '/transit/changes' },
        { name: 'Reasons for Change', path: '/transit/reasons' },
        { name: 'Recent Transit Trip', path: '/transit/recent-trip' },
      ],
      icon: <FontAwesomeIcon icon={faBus} />,
    },
    {
      title: 'Driving & Household Vehicle Access',
      path: '/driving',
      subheadings: [
        { name: 'Licensing & Work', path: '/driving/licensing' },
        { name: 'Housing & Ownership', path: '/driving/housing' },
        { name: 'Household Resources', path: '/driving/resources' },
      ],
      icon: <FontAwesomeIcon icon={faCar} />,
    },
    {
      title: 'Demographics',
      path: '/demographics',
      subheadings: [
        { name: 'Household Composition', path: '/demographics/household' },
        { name: 'Personal Info', path: '/demographics/personal' },
      ],
      icon: <FontAwesomeIcon icon={faUser} />,
    },
  ];

  // Find the active section based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const sectionIndex = sections.findIndex(section => 
      currentPath.startsWith(section.path) || 
      section.subheadings.some(sub => currentPath === sub.path)
    );
    
    if (sectionIndex !== -1) {
      setExpandedSection(sectionIndex);
    }
  }, [location.pathname]);
  
  const handleSectionClick = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };
  
  const isSubheadingActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sections-list">
          {sections.map((section, index) => (
            <li key={index} className="sidebar-section">
              <div 
                className={`section-header ${expandedSection === index ? 'active' : ''}`}
                onClick={() => handleSectionClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSectionClick(index);
                    e.preventDefault();
                  }
                }}
              >
                <span className="section-icon">{section.icon}</span>
                <span className="section-title">{section.title}</span>
                <span className="section-toggle">
                  <FontAwesomeIcon icon={expandedSection === index ? faChevronUp : faChevronDown} size="sm" />
                </span>
              </div>
              <ul className={`subheadings-list ${expandedSection === index ? 'expanded' : ''}`}>
                {section.subheadings.map((subheading, subIndex) => (
                  <li key={subIndex} className="subheading-item">
                    <Link 
                      to={subheading.path} 
                      className={`subheading-link ${isSubheadingActive(subheading.path) ? 'active' : ''}`}
                    >
                      {subheading.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;