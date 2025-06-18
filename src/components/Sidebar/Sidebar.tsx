import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
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
  const navigate = useNavigate(); // Add this hook
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [expandedSubheading, setExpandedSubheading] = useState<string | null>(null);
  
  // Dashboard navigation sections with their sub-headings
  const sections: Section[] = [
    {
      title: 'Lifestyle & Wellbeing',
      path: '/lifestyle',
      subheadings: [
        { 
          name: 'Lifestyle Preferences', // Changed from 'Personal Preferences'
          path: '/lifestyle/preferences',
          topics: ['Lifestyle Preferences'] // Add topic label(s)
        },
        { 
          name: 'Life Satisfaction', 
          path: '/lifestyle/satisfaction',
          topics: [
            'Overall Life Satisfaction', // Change from 'Life satisfaction rating'
            'Change in Satisfaction Since Pandemic' // Changed from 'Life satisfaction compared to during the pandemic'
          ] 
        },
        { 
          name: 'Support Systems & Health Access', // Changed from 'Social & Health Status'
          path: '/lifestyle/health',
          topics: ['Strength of Social Connections', 'Access to Quality Healthcare', 'Perceived Financial Security', 'Caregiving Responsibilities'] // Changed this line
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
            'Impact of Extreme Heat',
            'Coping with Extreme Heat',
            'Likelihood of Future Extreme Heat',
            'Expected Personal Impact of Future Extreme Heat',
            'Intended Actions During Next Extreme Heat',
            'Additional Strategies for Heat',
            'Activity Change During Heat Events',
            'Home Air Conditioning Status'
          ] 
        },
        { 
          name: 'Extreme Cold', 
          path: '/disruptions/cold',
          topics: [
            'Impact of Extreme Cold',
            'Coping with Extreme Cold',
            'Likelihood of Future Extreme Cold',
            'Expected Personal Impact of Future Extreme Cold',
            'Intended Actions During Next Extreme Cold',
            'Additional Strategies for Cold',
            'Activity Change During Cold Events'
          ] 
        },
        { 
          name: 'Flooding', 
          path: '/disruptions/flooding',
          topics: [
            'Impact of Flooding',
            'Coping with Flooding',
            'Likelihood of Future Flooding',
            'Expected Personal Impact of Future Flooding',
            'Intended Actions During Next Flood',
            'Additional Strategies for Flooding',
            'Activity Change During Flood Events'
          ]
        },
        { 
          name: 'Earthquake', 
          path: '/disruptions/earthquake',
          topics: [
            'Impact of Earthquake',
            'Coping with Earthquake',
            'Likelihood of Future Earthquake',
            'Expected Personal Impact of Future Earthquake',
            'Intended Actions During Next Earthquake',
            'Additional Strategies for Earthquake',
            'Activity Change During Earthquake Events'
          ]
        },
        { 
          name: 'Power Outage', 
          path: '/disruptions/power-outage',
          topics: [
            'Impact of Power Outage',
            'Coping with Power Outage',
            'Likelihood of Future Outage',
            'Expected Personal Impact of Future Outage',
            'Intended Actions During Next Outage',
            'Additional Strategies for Outages',
            'Activity Change During Outage Events'
          ]
        }
      ],
      icon: <FontAwesomeIcon icon={faExclamationCircle} />,
    },
    {
      title: 'Work, School & Commuting',
      path: '/work',
      subheadings: [
        { 
          name: 'Employment & Student Status', 
          path: '/work/employment',
          topics: ['Employment & Student Status']
        },
        { 
          name: 'Travel Frequency for Work/School', 
          path: '/work/commute',
          topics: ['Travel Frequency for Work/School']  // Changed to match the exact case
        },
        { 
          name: 'Distance to Key Locations', 
          path: '/work/distance',
          topics: [
            'Distance to Work',
            'Distance to School'
          ]
        },
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
  
  // Update isSubheadingActive to highlight when a topic within it is active
  const isSubheadingActive = (subheading: SubHeading): boolean => {
    // Check if any topic in this subheading is active
    if (selectedQuestion && subheading.topics) {
      return subheading.topics.some(topic => isTopicActive(topic));
    }
    return false;
  };
  
  // Simplified isTopicActive function
  const isTopicActive = (topic: string): boolean => {
    if (!selectedQuestion) return false;
    
    // Add console logging to debug the issue
    console.log(`Comparing: "${topic}" with "${selectedQuestion}"`);
    
    // Simple normalized comparison that focuses on key terms
    const topicLower = topic.toLowerCase();
    const selectedLower = selectedQuestion.toLowerCase();
    
    // Exact match
    if (topicLower === selectedLower) return true;
    
    // Check for satisfaction-specific matching (key terms approach)
    if (topicLower.includes('satisfaction') && selectedLower.includes('satisfaction')) {
      // For life satisfaction rating
      if (topicLower.includes('rating') && 
          (selectedLower.includes('rating') || selectedLower.includes('overall'))) {
        return true;
      }
      
      // For pandemic comparison
      if (topicLower.includes('pandemic') && selectedLower.includes('pandemic')) {
        return true;
      }
    }
    
    // Fall back to question number matching
    if (topic.includes('–') && selectedQuestion.includes('–')) {
      return topic.split('–')[0].trim() === selectedQuestion.split('–')[0].trim();
    }
    
    return false;
  };

  // When selectedQuestion changes, expand ONLY the containing subheading
  useEffect(() => {
    if (selectedQuestion) {
      let foundMatch = false;
      
      // Find which subheading contains this question
      // Use labeled loops so we can break out of both loops at once
      sectionLoop: for (const section of sections) {
        for (const subheading of section.subheadings) {
          if (subheading.topics && subheading.topics.some((topic) => isTopicActive(topic))) {
            const subheadingSlug = subheading.path.split('/').pop() || '';
            setExpandedSubheading(subheadingSlug);
            foundMatch = true;
            break sectionLoop; // Exit both loops once we find a match
          }
        }
      }
      
      // If no match found, we could optionally collapse all subheadings
      if (!foundMatch) {
        // Uncomment if you want to collapse when no match is found
        // setExpandedSubheading(null);
      }
    }
  }, [selectedQuestion]);

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
                            const isActive = isTopicActive(topic);
                            
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