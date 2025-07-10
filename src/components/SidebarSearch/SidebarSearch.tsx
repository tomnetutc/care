import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SidebarSearch.scss';

// Type definitions based on Sidebar structure
interface SubHeading {
  name: string;
  path: string;
  topics?: string[];
}

interface Section {
  title: string;
  path: string;
  subheadings: SubHeading[];
  icon: JSX.Element;
}

interface SearchResult {
  type: 'subheading' | 'topic';
  label: string;
  sectionTitle: string;
  sectionKey: string;
  subheadingName: string;
  subheadingSlug: string;
  topicLabel: string;
}

interface SidebarSearchProps {
  sections: Section[];
  onTopicClick?: (topicLabel: string, subheadingSlug?: string) => void;
}

const SidebarSearch: React.FC<SidebarSearchProps> = ({ sections, onTopicClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract slug from path
  const getSlugFromPath = (path: string): string => {
    return path.split('/').pop() || '';
  };
  
  // Extract section key from path
  const getSectionFromPath = (path: string): string => {
    const parts = path.split('/');
    return parts.length > 1 ? parts[1] : '';
  };

  // Get current section from URL
  const getCurrentSection = (): string => {
    const pathParts = location.pathname.split('/');
    return pathParts.length > 1 ? pathParts[1] : 'lifestyle';
  };

  // Search functionality
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    sections.forEach(section => {
      // Extract section key from path
      const sectionKey = getSectionFromPath(section.path);
      
      section.subheadings.forEach(subheading => {
        const subheadingSlug = getSlugFromPath(subheading.path);
        
        // If subheading matches query
        if (subheading.name.toLowerCase().includes(query)) {
          if (subheading.topics && subheading.topics.length > 0) {
            results.push({
              type: 'subheading',
              label: subheading.name,
              sectionTitle: section.title,
              sectionKey,
              subheadingName: subheading.name,
              subheadingSlug,
              topicLabel: subheading.topics[0]
            });
          }
        }

        // If any topic matches query
        if (subheading.topics) {
          subheading.topics.forEach(topic => {
            if (topic.toLowerCase().includes(query)) {
              results.push({
                type: 'topic',
                label: topic,
                sectionTitle: section.title,
                sectionKey,
                subheadingName: subheading.name,
                subheadingSlug,
                topicLabel: topic
              });
            }
          });
        }
      });
    });

    // After building results array
    // De-duplicate by topicLabel + subheadingSlug + sectionKey
    const uniqueResults = results.filter(
      (result, index, self) =>
        index === self.findIndex(
          (r) =>
            r.topicLabel === result.topicLabel &&
            r.subheadingSlug === result.subheadingSlug &&
            r.sectionKey === result.sectionKey
        )
    );
    setSearchResults(uniqueResults);
  }, [searchQuery, sections]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleResultClick(searchResults[highlightedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  // Handle result selection with proper section-aware navigation
  const handleResultClick = (result: SearchResult) => {
    if (!onTopicClick) return;
    
    // Clean up search UI state first
    setSearchQuery('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    
    // Get current section from URL
    const currentSection = getCurrentSection();
    
    // Check if navigating to a different section
    if (currentSection !== result.sectionKey) {
      // Need to navigate first, then call onTopicClick after a delay
      const targetPath = `/${result.sectionKey}/${result.subheadingSlug}`;
      
      // Log navigation plan
      console.log(`Navigating from ${currentSection} to ${result.sectionKey}`);
      console.log(`Target: ${result.topicLabel} in ${result.subheadingSlug}`);
      
      // Navigate to the new section
      navigate(targetPath);
      
      // Wait for navigation and DOM update before scrolling
      setTimeout(() => {
        console.log(`Now triggering scroll to ${result.topicLabel}`);
        onTopicClick(result.topicLabel, result.subheadingSlug);
      }, 150); // Adjust delay as needed
    } else {
      // Same section - call onTopicClick immediately
      console.log(`Staying in section ${currentSection}, scrolling to ${result.topicLabel}`);
      onTopicClick(result.topicLabel, result.subheadingSlug);
    }
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string): React.ReactNode => {
    if (!searchQuery.trim()) return text;
    
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchQuery.toLowerCase() 
            ? <span key={i} className="highlight">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <div className="sidebar-search">
      <div className="search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(!!e.target.value.trim());
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsDropdownOpen(!!searchQuery.trim())}
          onKeyDown={handleKeyDown}
          placeholder="Search topics..."
          className="search-input"
        />
        {searchQuery && (
          <button 
            className="clear-button"
            onClick={() => {
              setSearchQuery('');
              setIsDropdownOpen(false);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      
      {isDropdownOpen && searchResults.length > 0 && (
        <div ref={dropdownRef} className="search-results-dropdown">
          {searchResults.map((result, index) => (
            <div
              key={`${result.type}-${result.label}-${index}`}
              className={`search-result ${highlightedIndex === index ? 'highlighted' : ''}`}
              onClick={() => handleResultClick(result)}
            >
              <div className="result-label">{highlightMatch(result.label)}</div>
              <div className="result-path">
                {result.sectionTitle} &gt; {result.subheadingName}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isDropdownOpen && searchQuery.trim() && searchResults.length === 0 && (
        <div className="search-results-dropdown">
          <div className="no-results">No results found</div>
        </div>
      )}
    </div>
  );
};

export default SidebarSearch;