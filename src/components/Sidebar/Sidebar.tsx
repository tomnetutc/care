import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import SidebarSearch from '../SidebarSearch/SidebarSearch';

// Generate scoped key helper function (same as in MainContent)
const generateScopedKey = (section: string, subSection: string, topicLabel: string): string => {
  return `${section}-${subSection}-${topicLabel}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
};

/**
 * Interface for sub-heading items in the sidebar
 */
interface SubHeading {
  name: string;
  path: string;
  topics?: string[];
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
  selectedQuestion?: string | null; // Now receives scoped key
  activeSubheading?: string | null;
  onTopicClick?: (topicLabel: string, subheadingSlug?: string) => void; // Still receives readable topic label
}

const Sidebar: React.FC<SidebarProps> = ({ selectedQuestion, activeSubheading, onTopicClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedSubheading, setExpandedSubheading] = useState<string | null>(null);
  
  // Dashboard navigation sections with their sub-headings
  const sections: Section[] = [
    {
      title: 'Lifestyle & Wellbeing',
      path: '/lifestyle',
      subheadings: [
        { 
          name: 'Lifestyle Preferences',
          path: '/lifestyle/preferences',
          topics: ['Lifestyle Preferences']
        },
        { 
          name: 'Life Satisfaction', 
          path: '/lifestyle/satisfaction',
          topics: [
            'Overall Life Satisfaction',
            'Change in Satisfaction Since Pandemic'
          ] 
        },
        { 
          name: 'Support Systems & Health Access',
          path: '/lifestyle/health',
          topics: ['Strength of Social Connections', 'Access to Quality Healthcare', 'Perceived Financial Security', 'Caregiving Responsibilities']
        },
      ],
      icon: <FontAwesomeIcon icon={faHeart} />,
    },
    {
      title: 'Community Resources & Preparedness',
      path: '/community',
      subheadings: [
        { 
          name: 'Community Support & Adaptation', 
          path: '/community/resources',
          topics: ['Community Support & Adaptation']
        },
        { 
          name: 'Resource Awareness & Access', 
          path: '/community/awareness',
          topics: ['Resource Awareness & Access']
        },
        { 
          name: 'Suggestions for Preparedness', 
          path: '/community/improvement',
          topics: ['Suggestions for Preparedness']
        },
      ],
      icon: <FontAwesomeIcon icon={faUsers} />,
    },
    {
      title: 'Experiences and Responses to Disruptions',
      path: '/disruptions',
      subheadings: [
        { 
          name: 'Prior Experience', 
          path: '/disruptions/exposure',
          topics: ['Prior Experience'] 
        },
        { 
          name: 'Extreme Heat', 
          path: '/disruptions/heat',
          topics: [
            'Impact on Daily Life',
            'Coping Ability',
            'Chance of Future Event',
            'Impact of Next Event',
            'Anticipated Responses',
            'Other Coping Strategies',
            'Changes in Daily Activities',
            'Air Conditioning at Home'
          ] 
        },
        { 
          name: 'Extreme Cold', 
          path: '/disruptions/cold',
          topics: [
            'Impact on Daily Life',
            'Coping Ability',
            'Chance of Future Event',
            'Impact of Next Event',
            'Anticipated Responses',
            'Other Coping Strategies',
            'Changes in Daily Activities'
          ] 
        },
        { 
          name: 'Flooding', 
          path: '/disruptions/flooding',
          topics: [
            'Impact on Daily Life',
            'Coping Ability',
            'Chance of Future Event',
            'Impact of Next Event',
            'Anticipated Responses',
            'Other Coping Strategies',
            'Changes in Daily Activities'
          ]
        },
        { 
          name: 'Earthquake', 
          path: '/disruptions/earthquake',
          topics: [
            'Impact on Daily Life',
            'Coping Ability',
            'Chance of Future Event',
            'Impact of Next Event',
            'Anticipated Responses',
            'Other Coping Strategies',
            'Changes in Daily Activities'
          ]
        },
        { 
          name: 'Power Outage', 
          path: '/disruptions/power-outage',
          topics: [
            'Impact on Daily Life',
            'Coping Ability',
            'Chance of Future Event',
            'Impact of Next Event',
            'Anticipated Responses',
            'Other Coping Strategies',
            'Changes in Daily Activities'
          ]
        }
      ],
      icon: <FontAwesomeIcon icon={faExclamationCircle} />,
    },
    {
      title: 'Activity Travel Patterns',
      path: '/transportation',
      subheadings: [
        { name: 'Travel Frequency for Work/School', path: '/transportation/commute', topics: ['Travel Frequency for Work/School'] },
        { name: 'Distance to Work or School', path: '/transportation/distance', topics: ['Distance to Work or School'] },
        { name: 'Transportation Choices', path: '/transportation/choices', topics: ['Transportation Choices']},
        { name: 'Delivery & Activity Frequency', path: '/transportation/delivery', topics: [
          'Delivery Frequency to Home',
          'Frequency of Other Activities',
          
        ] },
        { name: 'Decision Making & Concerns', path: '/transportation/decisions', topics: [
          'Factors influencing out-of-home activity',
          'Motivations for Leaving Home',
          'Concerns About Going Out',
        ] },
        { name: 'Dining Habits', path: '/transportation/dining' , topics: [
          'Dining Preferences',
          'Dining Changes During COVID-19',
          'Restaurant Adaptations During COVID-19',
        ] },
      ],
      icon: <FontAwesomeIcon icon={faTruck} />,
    },
    {
      title: 'Public Transit Access & Usage',
      path: '/transit',
      subheadings: [
        { name: 'Access & Usage', path: '/transit/access', topics: [
          'Available Public Transit',
          'Current Public Transit Use',
          'Regular Transit Modes',
        ] },
        { name: 'Changes Over Time', path: '/transit/changes', topics: [
          'Transit Use Before COVID-19',
          'Transit Use During COVID-19'
        ] },
        { name: 'Reasons for Change', path: '/transit/reasons', topics: [
          'Reasons for using transit less',
          'Reasons for using transit more'
        ] },
        { name: 'Recent Transit Trip', path: '/transit/recent-trip', topics: [
          'Trip purpose',
          'Alternate travel method if no transit'
        ] },
      ],
      icon: <FontAwesomeIcon icon={faBus} />,
    },
    {
      title: 'Driving & Household Vehicle Access',
      path: '/driving',
      subheadings: [
        { name: 'Licensing & Work', path: '/driving/licensing', topics: ["Driver’s license status", "Work environment"] },
        { name: 'Housing & Ownership', path: '/driving/housing', topics: ["Housing type", "Home ownership"] },
        { name: 'Household Resources', path: '/driving/resources' },
      ],
      icon: <FontAwesomeIcon icon={faCar} />,
    },
    {
      title: 'Demographics',
      path: '/demographics',
      subheadings: [
        { name: 'Household Composition', path: '/demographics/household' },
        { name: 'Personal Info', path: '/demographics/personal', topics: [
          'Employment & Student Status',
          'Gender',
          'Hispanic/Latino origin',
          'Race',
          'Education level',
          'Disability affecting travel',
          'Household income',
        ] },
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
      
      // Find and set the expanded subheading based on URL
      const subheadingSlug = currentPath.split('/').pop() || '';
      if (subheadingSlug) {
        setExpandedSubheading(subheadingSlug);
      }
    } else {
      // If no match is found, still default to the first section
      setExpandedSection(0);
    }
  }, [location.pathname]);
  
  const handleSectionClick = (index: number) => {
    // Always expand this section
    setExpandedSection(index);
    
    // Get the section and its first subheading
    const section = sections[index];
    const firstSubheading = section.subheadings[0];
    
    // Reset scroll position
    const mainArea = document.querySelector('.main-area');
    if (mainArea) {
      mainArea.scrollTop = 0;
    }
    
    // Navigate to the first subheading path instead of just the section
    navigate(firstSubheading.path);
    
    // Explicitly expand the first subheading
    const subheadingSlug = firstSubheading.path.split('/').pop() || '';
    setExpandedSubheading(subheadingSlug);
    
    // If we have topics for this subheading, trigger the first topic click
    if (firstSubheading.topics && firstSubheading.topics.length > 0 && onTopicClick) {
      onTopicClick(firstSubheading.topics[0], subheadingSlug);
    }
  };
  
  const handleSubheadingClick = (subheadingSlug: string, e?: React.MouseEvent) => {
    // Prevent default navigation behavior if event is provided
    if (e) {
      e.preventDefault();
    }
    
    // Keep existing toggle functionality
    setExpandedSubheading(expandedSubheading === subheadingSlug ? null : subheadingSlug);
    
    // Add new scroll-to-visualization functionality:
    // Find the subheading in the sections array
    let currentSubheading = null;
    for (const section of sections) {
      const subheading = section.subheadings.find(sub => {
        const slug = sub.path.split('/').pop() || '';
        return slug === subheadingSlug;
      });
      
      if (subheading) {
        currentSubheading = subheading;
        break;
      }
    }
    
    // If subheading has topics, trigger click on the first topic to scroll to visualization
    if (currentSubheading?.topics?.length && onTopicClick) {
      onTopicClick(currentSubheading.topics[0], subheadingSlug);
    }
  };
  
  // Helper to get section from the current path
  const getCurrentSection = () => {
    const pathParts = location.pathname.split('/');
    return pathParts[1] || 'lifestyle';
  };

  // Update isSubheadingActive to work with main section context
  const isSubheadingActive = (subheading: SubHeading): boolean => {
    // Check if any topic in this subheading is active
    if (selectedQuestion && subheading.topics) {
      const currentSection = getCurrentSection();
      const subheadingSlug = subheading.path.split('/').pop() || '';
      
      // Only check if we're in the same section
      const subheadingSection = subheading.path.split('/')[1];
      if (subheadingSection !== currentSection) {
        return false;
      }
      
      return subheading.topics.some(topic => {
        const scopedKey = generateScopedKey(currentSection, subheadingSlug, topic);
        return scopedKey === selectedQuestion;
      });
    }
    return false;
  };
  
  // Updated isTopicActive function to work with main section context
  const isTopicActive = (topic: string, subheadingSlug: string): boolean => {
    if (!selectedQuestion) return false;
    
    const currentSection = getCurrentSection();
    const scopedKey = generateScopedKey(currentSection, subheadingSlug, topic);
    
    return scopedKey === selectedQuestion;
  };

  // When selectedQuestion changes, expand ONLY the containing subheading in current section
  useEffect(() => {
    if (selectedQuestion) {
      const currentSection = getCurrentSection();
      let foundMatch = false;
      
      // Find which subheading contains this question in the current section
      sectionLoop: for (const sectionData of sections) {
        // Only check the current section
        if (sectionData.path !== `/${currentSection}`) continue;
        
        for (const subheading of sectionData.subheadings) {
          if (subheading.topics) {
            const subheadingSlug = subheading.path.split('/').pop() || '';
            
            // Check if any topic in this subheading matches the selected question
            if (subheading.topics.some((topic) => isTopicActive(topic, subheadingSlug))) {
              setExpandedSubheading(subheadingSlug);
              foundMatch = true;
              break sectionLoop;
            }
          }
        }
      }
    }
  }, [selectedQuestion, location.pathname]);

  return (
    <aside className="sidebar">
      <SidebarSearch sections={sections} onTopicClick={onTopicClick} />
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
                  const isSubheadingExpanded = expandedSubheading === subheadingSlug;
                  const hasSingleTopic = subheading.topics && subheading.topics.length === 1;
                  
                  return (
                    <li key={subIndex} className="subheading-item">
                      {hasSingleTopic ? (
                        // Single topic case - display the topic directly
                        <div 
                          className={`subheading-container ${subheadingActive ? 'active' : ''}`}
                          onClick={() => {
                            // Navigate directly to the topic visualization
                            onTopicClick && onTopicClick(subheading.topics![0], subheadingSlug);
                            setExpandedSubheading(subheadingSlug);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className={`subheading-link ${subheadingActive ? 'active' : ''}`}>
                            {subheading.name}
                          </div>
                        </div>
                      ) : (
                        // Multiple topics case - keep existing expandable behavior
                        <div 
                          className={`subheading-container ${subheadingActive ? 'active' : ''}`}
                        >
                          <Link 
                            to={subheading.path} 
                            className={`subheading-link ${subheadingActive ? 'active' : ''}`}
                            onClick={(e) => handleSubheadingClick(subheadingSlug, e)}
                          >
                            {subheading.name}
                          </Link>
                        </div>
                      )}
                      
                      {/* Only render topics list for multi-topic subsections */}
                      {!hasSingleTopic && subheading.topics && (
                        <ul className={`topics-list ${isSubheadingExpanded ? 'expanded' : ''}`}>
                          {subheading.topics.map((topic, topicIdx) => {
                            const isActive = isTopicActive(topic, subheadingSlug);
                            
                            return (
                              <li
                                key={topicIdx}
                                className={`topic-label ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                  onTopicClick && onTopicClick(topic, subheadingSlug);
                                  setExpandedSubheading(subheadingSlug);
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