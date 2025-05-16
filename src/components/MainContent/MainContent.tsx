import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Q1Visualization, Q4Visualization, Q5Visualization, Q6Visualization, Q7Visualization } from '../Visualizations';
import './MainContent.scss';
import Sidebar from '../Sidebar/Sidebar';

// Type definitions
interface Question {
  id: number;
  text: string;
}

interface SubHeading {
  name: string;
  questions: Question[];
}

interface MainContentProps {
  subHeadings: SubHeading[];
}

// URL slug to sub-heading name mapping
const SLUG_TO_NAME_MAP: Record<string, string> = {
  'preferences': 'Personal Preferences',
  'satisfaction': 'Life Satisfaction',
  'satisfaction-now': 'Life Satisfaction Now',
  'satisfaction-pandemic': 'Life Satisfaction vs Pandemic',
  'health': 'Social & Health Status',
  'awareness': 'Community Awareness',
  'improvement': 'Suggestions for Improvement',
  'exposure': 'General Exposure',
  'heat': 'Extreme Heat',
  'cold': 'Extreme Cold',
  'flooding': 'Flooding',
  'earthquake': 'Earthquake',
  'power-outage': 'Power Outage',
  'employment': 'Employment & Student Status',
  'commute': 'Commute Frequency',
  'distance': 'Distance to Key Locations',
  'choices': 'Transportation Choices',
  'delivery': 'Delivery & Activity Frequency',
  'decisions': 'Decision Making & Concerns',
  'dining': 'Dining Habits',
  'access': 'Access & Usage',
  'changes': 'Changes Over Time',
  'reasons': 'Reasons for Change',
  'recent-trip': 'Recent Transit Trip',
  'licensing': 'Licensing & Work',
  'housing': 'Housing & Ownership',
  'resources': 'Household Resources',
  'household': 'Household Composition',
  'personal': 'Personal Info'
};

// Default questions for each section/subsection
const DEFAULT_QUESTIONS: Record<string, string> = {
  // Lifestyle section
  'preferences': 'Lifestyle preferences',
  'satisfaction': 'Q4 – Life satisfaction rating', // <-- Change this line to Q4
  'satisfaction-now': 'Q4 – Life satisfaction rating',
  'satisfaction-pandemic': 'Q5 – Life satisfaction compared to during the pandemic',
  'health': 'Q6 – Social connections strength', // Add this line for Q6
  
  // Community section
  //'health': 'Q10 – Self-rated health status',
  'awareness': 'Q12 – Community awareness rating',
  'improvement': 'Q15 – Suggestions for community improvement',
  
  // Disasters section
  'exposure': 'Q20 – Experience with natural disasters',
  'heat': 'Q22 – Experience with extreme heat events',
  'cold': 'Q25 – Experience with extreme cold events',
  'flooding': 'Q28 – Experience with flooding',
  'earthquake': 'Q30 – Experience with earthquakes',
  'power-outage': 'Q33 – Experience with power outages',
  
  // Transportation section
  'employment': 'Q40 – Current employment status',
  'commute': 'Q42 – Weekly commute frequency',
  'distance': 'Q45 – Distance to frequent destinations',
  'choices': 'Q48 – Transportation mode preferences',
  'delivery': 'Q50 – Food and goods delivery frequency',
  'decisions': 'Q53 – Transportation decision factors',
  'dining': 'Q55 – Dining out habits',
  
  // Transit section
  'access': 'Q60 – Public transit access',
  'changes': 'Q62 – Changes in transit usage',
  'reasons': 'Q65 – Reasons for transit usage patterns',
  'recent-trip': 'Q68 – Recent transit experience',
  'licensing': 'Q70 – Driver licensing status',
  
  // Demographics section
  'housing': 'Q80 – Housing situation',
  'resources': 'Q83 – Household resources',
  'household': 'Q85 – Household composition',
  'personal': 'Q90 – Demographic information'
};

// Default subsection for main sections
const MAIN_SECTION_DEFAULTS: Record<string, string> = {
  'lifestyle': 'preferences',
  'community': 'health',
  'disasters': 'exposure',
  'transportation': 'employment',
  'transit': 'access',
  'demographics': 'housing'
};

const MainContent: React.FC<MainContentProps> = ({ subHeadings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [activeSubheading, setActiveSubheading] = useState<string | null>(null);
  const [refsReady, setRefsReady] = useState(false);
  const visualizationRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Initialize refs array when subHeadings change
  useEffect(() => {
    const totalQuestions = subHeadings.reduce(
      (total, subHeading) => total + subHeading.questions.length, 
      0
    );
    visualizationRefs.current = Array(totalQuestions).fill(null);
    setRefsReady(true);
  }, [subHeadings]);
  
  // Set active subheading based on URL
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const currentSlug = pathParts[pathParts.length - 1];
    
    if (currentSlug && SLUG_TO_NAME_MAP[currentSlug]) {
      setActiveSubheading(currentSlug);
      
      // Set default question for this section
      if (DEFAULT_QUESTIONS[currentSlug]) {
        setSelectedQuestion(DEFAULT_QUESTIONS[currentSlug]);
      }
    }
  }, [location.pathname]);

  // Handle scroll position changes to update active question
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    let maxVisibility = 0;
    let mostVisibleQuestion = null;
    
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
        maxVisibility = entry.intersectionRatio;
        mostVisibleQuestion = entry.target.getAttribute('data-question');
      }
    });
    
    if (mostVisibleQuestion && mostVisibleQuestion !== selectedQuestion) {
      console.log("Changing active question to:", mostVisibleQuestion);
      setSelectedQuestion(mostVisibleQuestion);
    }
  }, [selectedQuestion]);
  
  // Setup intersection observer after refs are ready
  useEffect(() => {
    if (!refsReady) return;
    
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '-80px 0px -300px 0px', // Adjust these values as needed
      threshold: [0.1, 0.2, 0.3, 0.4, 0.5] // Multiple thresholds for better accuracy
    });
    
    visualizationRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });
    
    return () => {
      visualizationRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      observer.disconnect();
    };
  }, [handleIntersection, refsReady]);

  // Scroll to visualization implementation
  const scrollToVisualization = (questionText: string, subheadingSlug?: string) => {
    console.log(`Scrolling to: "${questionText}" in subheading: "${subheadingSlug}"`);
    
    // Update URL if needed
    if (subheadingSlug && subheadingSlug !== activeSubheading) {
      for (const sectionKey in MAIN_SECTION_DEFAULTS) {
        const path = `/${sectionKey}/${subheadingSlug}`;
        if (Object.keys(SLUG_TO_NAME_MAP).includes(subheadingSlug)) {
          console.log(`Navigating to: ${path}`);
          navigate(path);
          setActiveSubheading(subheadingSlug);
          break;
        }
      }
    }
    
    // Find the visualization to scroll to
    const allQuestions = subHeadings.flatMap(sh => sh.questions);
    const targetIndex = allQuestions.findIndex(q => q.text === questionText);
    
    console.log(`Target question index: ${targetIndex}`);
    
    if (targetIndex !== -1 && visualizationRefs.current[targetIndex]) {
      const element = visualizationRefs.current[targetIndex];
      if (!element) {
        console.error("Element reference is null");
        return;
      }
      
      // Calculate position
      const headerOffset = 80; // Adjust based on your layout
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = window.pageYOffset + elementPosition - headerOffset;
      
      console.log(`Scrolling to position: ${offsetPosition}`);
      
      // Perform scroll
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update selected question
      setSelectedQuestion(questionText);
    } else {
      console.error(`Could not find element for question: ${questionText}`);
    }
  };

  // Render visualizations as scrollable sections
  const renderVisualizations = () => {
    let refIndex = 0;
    return subHeadings.flatMap((subHeading) =>
      subHeading.questions.map((question) => {
        const VisualizationComponent = getVisualizationComponent(question.text);
        const currentIndex = refIndex++;
        
        return (
          <React.Fragment key={question.id}>
            <div
              ref={el => { visualizationRefs.current[currentIndex] = el; }}
              data-question={question.text}
              className="visualization-section"
            >
              <h3>{question.text}</h3>
              <div className="visualization-content">
                {VisualizationComponent ? <VisualizationComponent /> : <p>Visualization coming soon!</p>}
              </div>
            </div>
            <div className="section-divider" />
          </React.Fragment>
        );
      })
    );
  };

  // Helper function to map questions to visualization components
  const getVisualizationComponent = (questionText: string) => {
    if (questionText.includes('Q1')) return Q1Visualization;
    if (questionText.includes('Q4')) return Q4Visualization;
    if (questionText.includes('Q5')) return Q5Visualization;
    if (questionText.includes('Q6')) return Q6Visualization;
    // if (questionText.includes('Q7')) return Q7Visualization;
    return null;
  };

  return (
    <div className="main-content">
      <Sidebar
        selectedQuestion={selectedQuestion}
        activeSubheading={activeSubheading}
        onTopicClick={scrollToVisualization}
      />

      <div className="visualization-container">
        {renderVisualizations()}
      </div>
    </div>
  );
};

export default MainContent;