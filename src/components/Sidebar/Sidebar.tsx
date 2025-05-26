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
          name: 'Personal Preferences', 
          path: '/lifestyle/preferences',
          topics: ['Lifestyle preferences'] // Add topic label(s)
        },
        { 
          name: 'Life Satisfaction', 
          path: '/lifestyle/satisfaction',
          topics: [
            'Life satisfaction rating',
            'Life satisfaction compared to during the pandemic'
          ]
        },
        { 
          name: 'Social & Health Status', 
          path: '/lifestyle/health',
          topics: ['Social relationships', 'Access to healthcare', 'Financial security', 'Caregiving responsibilities']
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
    // Toggle section expansion as before
    setExpandedSection(expandedSection === index ? null : index);
    
    // Navigate to section path to show visualizations
    navigate(sections[index].path);
  };
  
  const handleSubheadingClick = (subheadingSlug: string) => {
    setExpandedSubheading(expandedSubheading === subheadingSlug ? null : subheadingSlug);
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
                  
                  return (
                    <li key={subIndex} className="subheading-item">
                      <div 
                        className={`subheading-container ${subheadingActive ? 'active' : ''}`}
                      >
                        <Link 
                          to={subheading.path} 
                          className={`subheading-link ${subheadingActive ? 'active' : ''}`}
                          onClick={() => handleSubheadingClick(subheadingSlug)}
                        >
                          {subheading.name}
                        </Link>
                      </div>
                      {subheading.topics && (
                        <ul className={`topics-list ${isSubheadingExpanded ? 'expanded' : ''}`}>
                          {subheading.topics.map((topic, topicIdx) => {
                            const isActive = isTopicActive(topic);
                            
                            return (
                              <li
                                key={topicIdx}
                                className={`topic-label ${isActive ? 'active' : ''}`}
                                onClick={() => {
                                  // Remove console.log to fix performance issues
                                  // console.log(`Clicking topic: ${topic} in subheading: ${subheadingSlug}`);
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