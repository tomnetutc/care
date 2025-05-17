import React, { useState, useEffect } from 'react';
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
  topics?: string[]; // Add this line
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
interface SidebarProps {
  selectedQuestion?: string | null;
  activeSubheading?: string | null;
  onTopicClick?: (questionText: string, subheadingSlug?: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedQuestion, activeSubheading, onTopicClick }) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  
  // Dashboard navigation sections with their sub-headings
  const sections: Section[] = [
    {
      title: 'Lifestyle & Wellbeing',
      path: '/lifestyle',
      subheadings: [
        { 
          name: 'Personal Preferences', 
          path: '/lifestyle/preferences',
          topics: ['Q1 – Lifestyle preferences'] // Add topic label(s)
        },
        { 
          name: 'Life Satisfaction', 
          path: '/lifestyle/satisfaction',
          topics: [
            'Q4 – Life satisfaction rating',
            'Q5 – Life satisfaction compared to during the pandemic'
          ]
        },
        { 
          name: 'Social & Health Status', 
          path: '/lifestyle/health',
          topics: ['Q6 – Social connections strength']
        },
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

  // Auto-expand section based on URL
  useEffect(() => {
    const currentPath = location.pathname;
    
    // First check if we're at the root path
    if (currentPath === '/' || currentPath === '') {
      // Default to expanding the first section (Lifestyle)
      setExpandedSection(0);
      return;
    }
    
    // Otherwise use existing logic to find matching section
    const sectionIndex = sections.findIndex(section => 
      currentPath.startsWith(section.path) || 
      section.subheadings.some(sub => currentPath.includes(sub.path))
    );
    
    if (sectionIndex !== -1) {
      setExpandedSection(sectionIndex);
    } else {
      // If no match is found, still default to the first section
      setExpandedSection(0);
    }
  }, [location.pathname]);
  
  const handleSectionClick = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };
  
  // Modified isSubheadingActive function to remove all subheading highlighting
  const isSubheadingActive = (subheading: SubHeading): boolean => {
    // Always return false to disable all subheading highlighting
    return false;
  };
  
  // Keep the topic highlighting logic as is - it's working correctly
  const isTopicActive = (topic: string): boolean => {
    if (!selectedQuestion) return false;
    
    // Exact match
    if (selectedQuestion === topic) {
      return true;
    }
    
    // Check for question number match (more precise)
    const topicNumber = topic.split('–')[0].trim(); // e.g., "Q6"
    const selectedNumber = selectedQuestion.split('–')[0].trim();
    
    return topicNumber === selectedNumber;
  };

  // Debug logging
  useEffect(() => {
    console.log("Current selected question:", selectedQuestion);
    console.log("Current active subheading:", activeSubheading);
  }, [selectedQuestion, activeSubheading]);

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
                {section.subheadings.map((subheading, subIndex) => {
                  const subheadingActive = isSubheadingActive(subheading);
                  const subheadingSlug = subheading.path.split('/').pop() || '';
                  
                  return (
                    <li key={subIndex} className="subheading-item">
                      <Link 
                        to={subheading.path} 
                        className={`subheading-link ${subheadingActive ? 'active' : ''}`}
                      >
                        {subheading.name}
                      </Link>
                      {subheading.topics && (
                        <ul className="topics-list">
                          {subheading.topics.map((topic, topicIdx) => {
                            const isActive = isTopicActive(topic);
                            
                            return (
                              <li
                                key={topicIdx}
                                className={`topic-label ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                  console.log(`Clicking topic: ${topic} in subheading: ${subheadingSlug}`);
                                  onTopicClick && onTopicClick(topic, subheadingSlug);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {topic}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;