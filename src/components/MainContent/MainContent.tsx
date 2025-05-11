import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Q1Visualization, Q4Visualization, Q5Visualization } from '../Visualizations';
import './MainContent.scss';

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
  'preferences': 'Q1 – Lifestyle preferences',
  'satisfaction': 'Q5 – Life satisfaction compared to during the pandemic',
  'satisfaction-now': 'Q4 – Life satisfaction rating',
  'satisfaction-pandemic': 'Q5 – Life satisfaction compared to during the pandemic',
  
  // Community section
  'health': 'Q10 – Self-rated health status',
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

  useEffect(() => {
    // This function finds a default question based on URL
    const selectDefaultQuestion = () => {
      const pathSegments = location.pathname.split('/').filter(s => s);
      
      // Check if we're on a specific subsection
      const section = pathSegments[0]; // e.g. "lifestyle"
      const subsection = pathSegments.length > 1 ? pathSegments[1] : null; // e.g. "preferences"
      
      // Special handling for Q4 and Q5 subsections
      if (subsection === 'satisfaction-now') {
        // Look specifically for Q4 question in the subheadings
        for (const subHeading of subHeadings) {
          const q4Question = subHeading.questions.find(q => q.text.includes('Q4'));
          if (q4Question) {
            return q4Question.text;
          }
        }
      }
      
      if (subsection === 'satisfaction-pandemic') {
        // Look specifically for Q5 question in the subheadings
        for (const subHeading of subHeadings) {
          const q5Question = subHeading.questions.find(q => q.text.includes('Q5'));
          if (q5Question) {
            return q5Question.text;
          }
        }
      }
      
      // If we have a subsection with a defined default question
      if (subsection && DEFAULT_QUESTIONS[subsection]) {
        const defaultQuestionText = DEFAULT_QUESTIONS[subsection];
        
        // Find the matching question in all subheadings
        for (const subHeading of subHeadings) {
          const matchingQuestion = subHeading.questions.find(q => 
            q.text.includes(defaultQuestionText)
          );
          
          if (matchingQuestion) {
            return matchingQuestion.text;
          }
        }
      }
      
      // If we're on a main section but no subsection is specified
      // Use the default subsection for this main section
      if (section && MAIN_SECTION_DEFAULTS[section] && !subsection) {
        const defaultSubsection = MAIN_SECTION_DEFAULTS[section];
        if (DEFAULT_QUESTIONS[defaultSubsection]) {
          const defaultQuestionText = DEFAULT_QUESTIONS[defaultSubsection];
          
          // Find the matching question
          for (const subHeading of subHeadings) {
            const matchingQuestion = subHeading.questions.find(q => 
              q.text.includes(defaultQuestionText)
            );
            
            if (matchingQuestion) {
              return matchingQuestion.text;
            }
          }
        }
      }
      
      return null; // No default question found
    };
    
    const defaultQuestion = selectDefaultQuestion();
    setSelectedQuestion(defaultQuestion);
  }, [location.pathname, subHeadings]);

  // Extract the sub-heading slug from the URL path
  const pathSegments = location.pathname.split('/');
  const subHeadingSlug = pathSegments.length > 1 ? pathSegments[1] : null;

  // Find the sub-heading based on the slug in the URL
  const filteredSubHeading = subHeadingSlug && SLUG_TO_NAME_MAP[subHeadingSlug]
    ? subHeadings.find(subHeading => subHeading.name === SLUG_TO_NAME_MAP[subHeadingSlug])
    : null;

  // Handle question selection
  const handleQuestionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedQuestion = event.target.value;
    setSelectedQuestion(newSelectedQuestion);
    
    // Special handling for Q4 and Q5 questions which appear to be causing issues
    if (newSelectedQuestion.includes('Q4')) {
      // Directly navigate to the correct section/subsection for Q4
      navigate('/lifestyle/satisfaction-now');
      return;
    }
    
    if (newSelectedQuestion.includes('Q5')) {
      // Directly navigate to the correct section/subsection for Q5
      navigate('/lifestyle/satisfaction-pandemic');
      return;
    }
    
    // For all other questions, use the existing logic
    let matchingSubheading = null;
    
    // First, find the subheading that contains this question
    for (const subHeading of subHeadings) {
      const matchingQuestion = subHeading.questions.find(q => q.text === newSelectedQuestion);
      if (matchingQuestion) {
        matchingSubheading = subHeading;
        break;
      }
    }
    
    if (matchingSubheading) {
      // Find the subsection slug based on the subheading name
      let targetSubsection = null;
      for (const [slug, name] of Object.entries(SLUG_TO_NAME_MAP)) {
        if (name === matchingSubheading.name) {
          targetSubsection = slug;
          break;
        }
      }
      
      // Find the section slug for this subsection
      if (targetSubsection) {
        const subsectionToSection: Record<string, string> = {
          // Lifestyle section
          'preferences': 'lifestyle',
          'satisfaction': 'lifestyle',
          'satisfaction-now': 'lifestyle',
          'satisfaction-pandemic': 'lifestyle',
          
          // Community section
          'health': 'community',
          'awareness': 'community',
          'improvement': 'community',
          
          // Disasters section
          'exposure': 'disasters',
          'heat': 'disasters',
          'cold': 'disasters',
          'flooding': 'disasters',
          'earthquake': 'disasters',
          'power-outage': 'disasters',
          
          // Transportation section
          'employment': 'transportation',
          'commute': 'transportation',
          'distance': 'transportation',
          'choices': 'transportation',
          'delivery': 'transportation',
          'decisions': 'transportation',
          'dining': 'transportation',
          
          // Transit section
          'access': 'transit',
          'changes': 'transit',
          'reasons': 'transit',
          'recent-trip': 'transit',
          'licensing': 'transit',
          
          // Demographics section
          'housing': 'demographics',
          'resources': 'demographics',
          'household': 'demographics',
          'personal': 'demographics'
        };
        
        const targetSection = subsectionToSection[targetSubsection];
        
        if (targetSection) {
          navigate(`/${targetSection}/${targetSubsection}`);
        }
      }
    }
  };

  // Render question options for dropdown
  const renderQuestionOptions = () => {
    if (filteredSubHeading) {
      return filteredSubHeading.questions.map((question) => (
        <option key={question.id} value={question.text}>
          {question.text}
        </option>
      ));
    }

    return subHeadings.map((subHeading) => (
      <optgroup key={subHeading.name} label={subHeading.name}>
        {subHeading.questions.map((question) => (
          <option key={question.id} value={question.text}>
            {question.text}
          </option>
        ))}
      </optgroup>
    ));
  };

  // Determine which visualization to render based on selected question
  const renderVisualization = () => {
    if (!selectedQuestion) {
      return (
        <div className="visualization-placeholder">
          <p>Please select a question from the dropdown above to view its visualization.</p>
        </div>
      );
    }

    // Using includes() instead of exact matching
    if (selectedQuestion.includes('Q1')) {
      return <Q1Visualization />;
    }
    
    if (selectedQuestion.includes('Q4')) {
      return <Q4Visualization />;
    }
    
    if (selectedQuestion.includes('Q5')) {
      return <Q5Visualization />;
    }

    // If no matching visualization is found
    return (
      <div className="placeholder-visualization">
        <h3>{selectedQuestion}</h3>
        
        <div className="placeholder-content">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path fill="currentColor" d="M3,22V8H7V22H3M10,22V2H14V22H10M17,22V14H21V22H17Z" />
            </svg>
          </div>
          <div className="placeholder-info">
            <p>This visualization is coming soon!</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div className="dropdown-container">
        <label htmlFor="questions-dropdown">Question:</label>
        <select 
          id="questions-dropdown" 
          onChange={handleQuestionChange} 
          value={selectedQuestion || ""}
          className="question-dropdown"
        >
          {renderQuestionOptions()}
        </select>
      </div>

      <div className="visualization-container">
        {renderVisualization()}
      </div>
    </div>
  );
};

export default MainContent;