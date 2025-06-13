import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Q1Visualization, Q2Visualization, Q3Visualization, Q4Visualization, Q5Visualization, Q6Visualization, Q7Visualization, Q8Visualization, Q9Visualization, Q10Visualization, Q11aVisualization, Q12aVisualization, Q13aVisualization, Q14aVisualization, Q15aVisualization, Q16aVisualization, Q17aVisualization, Q18aVisualization, Q11bVisualization, Q12bVisualization, Q13bVisualization, Q14bVisualization, Q15bVisualization, Q16bVisualization, Q17bVisualization, Q11cVisualization, Q12cVisualization, Q52Visualization, Q13cVisualization, Q14cVisualization, Q15cVisualization, Q16cVisualization, Q17cVisualization, Q11dVisualization, Q12dVisualization, Q13dVisualization, Q14dVisualization, Q15dVisualization, Q16dVisualization, Q17dVisualization, Q11eVisualization, Q12eVisualization, Q13eVisualization, Q14eVisualization, Q15eVisualization, Q17eVisualization, Q16eVisualization } from '../Visualizations';
import './MainContent.scss';
import Sidebar from '../Sidebar/Sidebar';
import TopMenu from '../TopMenu/TopMenu';

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
  'preferences': 'Lifestyle Preferences',
  'satisfaction': 'Life Satisfaction',
  'satisfaction-now': 'Life Satisfaction',
  'satisfaction-pandemic': 'Life Satisfaction vs Pandemic',
  'health': 'Support Systems & Health Access',
  
  // Updated community section mappings
  'resources': 'Community Support & Adaptation',
  'awareness': 'Resource Awareness & Access',
  'improvement': 'Suggestions for Preparedness',
  
  // Disruptions section
  'exposure': 'Experience with Disruptions',
  'heat': 'Impact of Extreme Heat',
  'cold': 'Impact of Extreme Cold',
  'flooding': 'Impact of Flooding',
  'earthquake': 'Impact of Earthquake',
  'power-outage': 'Impact of Power Outage',
  
  // Transportation section
  'employment': 'Employment & Student Status',
  'commute': 'Commute Frequency',
  'distance': 'Distance to Key Locations',
  'choices': 'Transportation Choices',
  'delivery': 'Delivery & Activity Frequency',
  'decisions': 'Decision Making & Concerns',
  'dining': 'Dining Habits',
  
  // Transit section
  'access': 'Q60 – Public transit access',
  'changes': 'Q62 – Changes in transit usage',
  'reasons': 'Q65 – Reasons for transit usage patterns',
  'recent-trip': 'Q68 – Recent transit experience',
  'licensing': 'Q70 – Driver licensing status',
  
  // Demographics section
  'housing': 'Q80 – Housing situation',
  'resources-household': 'Q83 – Household resources',
  'household': 'Q85 – Household composition',
  'personal': 'Q90 – Demographic information'
};

// Default questions for each section/subsection
const DEFAULT_QUESTIONS: Record<string, string> = {
  // Lifestyle section
  'preferences': 'Lifestyle Preferences', // Fixed case here
  'satisfaction': 'Overall Life Satisfaction',
  'satisfaction-now': 'Overall Life Satisfaction',
  'satisfaction-pandemic': 'Change in Satisfaction Since Pandemic',
  'health': 'Strength of Social Connections',
  
  // Community section 
  'resources': 'Community Support & Adaptation',
  'awareness': 'Resource Awareness & Access', // Fixed case here
  'improvement': 'Suggestions for Preparedness',
  
  // Disruptions section
  'exposure': 'Experience with Disruptions',
  'heat': 'Impact of Extreme Heat', // Fixed case here
  'cold': 'Impact of Extreme Cold', // Fixed case here
  'flooding': 'Impact of Flooding', // Fixed case here
  'earthquake': 'Impact of Earthquake', // Fixed case here
  'power-outage': 'Impact of Power Outage', // Fixed case here
  
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
  'resources-household': 'Q83 – Household resources',
  'household': 'Q85 – Household composition',
  'personal': 'Q90 – Demographic information'
};

// Default subsection for main sections
const MAIN_SECTION_DEFAULTS: Record<string, string> = {
  'lifestyle': 'preferences',
  'community': 'resources', // Changed from 'health' or 'awareness' to 'resources'
  'disruptions': 'exposure',
  'transportation': 'employment',
  'transit': 'access',
  'demographics': 'housing'
};

// Mapping of subheading slugs to section keys
const SUBHEADING_TO_SECTION: Record<string, string> = {
  'preferences': 'lifestyle',
  'satisfaction': 'lifestyle',
  'health': 'lifestyle',
  'resources': 'community',
  'awareness': 'community',
  'improvement': 'community',
  // Add more mappings for other subheadings
};

const MainContent: React.FC<MainContentProps> = ({ subHeadings }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [activeSubheading, setActiveSubheading] = useState<string | null>(null);
  const [refsReady, setRefsReady] = useState(false);
  const [isProgrammaticScrolling, setIsProgrammaticScrolling] = useState(false);
  const [manuallySelectedQuestion, setManuallySelectedQuestion] = useState<string | null>(null);
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
      
      // Only set default question if no manual selection exists
      if (DEFAULT_QUESTIONS[currentSlug] && !manuallySelectedQuestion) {
        setSelectedQuestion(DEFAULT_QUESTIONS[currentSlug]);
      }
    }
  }, [location.pathname, manuallySelectedQuestion]);

  // Handle scroll position changes to update active question
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Skip intersection updates during programmatic scrolling
    if (isProgrammaticScrolling) return;
    
    let maxVisibility = 0;
    let mostVisibleQuestion = null;
    
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
        maxVisibility = entry.intersectionRatio;
        mostVisibleQuestion = entry.target.getAttribute('data-question');
      }
    });
    
    if (mostVisibleQuestion && mostVisibleQuestion !== selectedQuestion) {
      setSelectedQuestion(mostVisibleQuestion);
    }
  }, [selectedQuestion, isProgrammaticScrolling]);
  
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
    
    // Set both the selected question and track it was manually selected
    setSelectedQuestion(questionText);
    setManuallySelectedQuestion(questionText);
    
    // Disable intersection updates during programmatic scrolling
    setIsProgrammaticScrolling(true);
    
    // Update URL if needed
    if (subheadingSlug && subheadingSlug !== activeSubheading) {
      const sectionKey = SUBHEADING_TO_SECTION[subheadingSlug];
      if (sectionKey) {
        const path = `/${sectionKey}/${subheadingSlug}`;
        console.log(`Navigating to: ${path}`);
        navigate(path);
        setActiveSubheading(subheadingSlug);
      }
      
      // Small delay to ensure navigation completes before scrolling
      setTimeout(() => performScroll(), 100);
    } else {
      performScroll();
    }
    
    function performScroll() {
      // Find the visualization to scroll to
      const allQuestions = subHeadings.flatMap(sh => sh.questions);
      const targetIndex = allQuestions.findIndex(q => q.text === questionText);
      
      if (targetIndex !== -1 && visualizationRefs.current[targetIndex]) {
        const element = visualizationRefs.current[targetIndex];
        if (!element) {
          console.error("Element reference is null");
          setIsProgrammaticScrolling(false);
          return;
        }

        const mainAreaContainer = document.querySelector('.main-area');
        if (!mainAreaContainer) {
          console.error("Main area container not found");
          setIsProgrammaticScrolling(false);
          return;
        }

        const topMenuHeight = 58;
        const additionalPadding = 20;
        const totalOffset = topMenuHeight + additionalPadding;
        
        const containerRect = mainAreaContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const relativePosition = elementRect.top - containerRect.top;
        
        mainAreaContainer.scrollTo({
          top: mainAreaContainer.scrollTop + relativePosition - totalOffset,
          behavior: 'smooth'
        });

        // Re-enable intersection observer after scrolling completes
        setTimeout(() => {
          setIsProgrammaticScrolling(false);
        }, 1000); // Adjust timing based on scroll duration
      } else {
        setIsProgrammaticScrolling(false);
      }
    }
  };

  // Render visualizations as scrollable sections
  const renderVisualizations = () => {
    let refIndex = 0;
    return subHeadings.flatMap((subHeading) =>
      subHeading.questions.map((question) => {
        const VisualizationComponent = getVisualizationComponent(question.text);
        const currentIndex = refIndex++;

        // Only show heading if NOT Q16a
        // const showHeading = question.text !== 'Q16a - Is there anything else you would do to cope with extreme heat?';

        return (
          <React.Fragment key={question.id}>
            <div
              ref={el => { visualizationRefs.current[currentIndex] = el; }}
              data-question={question.text}
              className="visualization-section"
            >
              { <h3>{question.text}</h3>}
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
    if (questionText === 'Lifestyle Preferences') return Q1Visualization; // Fixed case here
    if (questionText === 'Community Support & Adaptation') return Q2Visualization;
    if (questionText === 'Resource Awareness & Access') return Q3Visualization;
    if (questionText === 'Overall Life Satisfaction') return Q4Visualization;
    if (questionText === 'Change in Satisfaction Since Pandemic') return Q5Visualization;
    if (questionText === 'Strength of Social Connections') return Q6Visualization;
    if (questionText === 'Access to Quality Healthcare') return Q7Visualization;
    if (questionText === 'Perceived Financial Security') return Q8Visualization;
    if (questionText === 'Caregiving Responsibilities') return Q9Visualization;
    if (questionText === 'Experience with Disruptions') return Q10Visualization;
    if (questionText === 'Impact of Extreme Heat') return Q11aVisualization; // Fixed case here
    if (questionText === 'Coping with Extreme Heat') return Q12aVisualization; // Fixed case here
    if (questionText === 'Likelihood of Future Extreme Heat') return Q13aVisualization; // Fixed case here
    if (questionText === 'Expected Personal Impact of Future Extreme Heat') return Q14aVisualization; // Fixed case here
    if (questionText === 'Intended Actions During Next Extreme Heat') return Q15aVisualization;
    if (questionText === 'Additional Strategies for Heat') return Q16aVisualization; // Fixed case here
    if (questionText === 'Activity Change During Heat Events') return Q17aVisualization;
    if (questionText === 'Home Air Conditioning Status') return Q18aVisualization;
    if (questionText === 'Suggestions for Preparedness') return Q52Visualization;
    if (questionText === 'Impact of Extreme Cold') return Q11bVisualization;
    if (questionText === 'Coping with Extreme Cold') return Q12bVisualization;
    if (questionText === 'Likelihood of Future Extreme Cold') return Q13bVisualization;
    if (questionText === 'Expected Personal Impact of Future Extreme Cold') return Q14bVisualization;
    if (questionText === 'Intended Actions During Next Extreme Cold') return Q15bVisualization;
    if (questionText === 'Additional Strategies for Cold') return Q16bVisualization;
    if (questionText === 'Activity Change During Cold Events') return Q17bVisualization;
    if (questionText === 'Impact of Flooding') return Q11cVisualization;
    if (questionText === 'Coping with Flooding') return Q12cVisualization;
    if (questionText === 'Likelihood of Future Flooding') return Q13cVisualization;
    if (questionText === 'Expected Personal Impact of Future Flooding') return Q14cVisualization;
    if (questionText === 'Intended Actions During Next Flood') return Q15cVisualization;
    if (questionText === 'Activity Change During Flood Events') return Q17cVisualization;
    if (questionText === 'Additional Strategies for Flooding') return Q16cVisualization;
    if (questionText === 'Impact of Earthquake') return Q11dVisualization;
    if (questionText === 'Coping with Earthquake') return Q12dVisualization;
    if (questionText === 'Likelihood of Future Earthquake') return Q13dVisualization;
    if (questionText === 'Expected Personal Impact of Future Earthquake') return Q14dVisualization;
    if (questionText === 'Intended Actions During Next Earthquake') return Q15dVisualization;
    if (questionText === 'Activity Change During Earthquake Events') return Q17dVisualization;
    if (questionText === 'Additional Strategies for Earthquake') return Q16dVisualization;
    if (questionText === 'Impact of Power Outage') return Q11eVisualization;
    if (questionText === 'Coping with Power Outage') return Q12eVisualization;
    if (questionText === 'Likelihood of Future Outage') return Q13eVisualization;
    if (questionText === 'Expected Personal Impact of Future Outage') return Q14eVisualization;
    if (questionText === 'Intended Actions During Next Outage') return Q15eVisualization;
    if (questionText === 'Activity Change During Outage Events') return Q17eVisualization;
    if (questionText === 'Additional Strategies for Outages') return Q16eVisualization;

    return null;
  };

  return (
    <div className="main-content">
      <TopMenu />
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