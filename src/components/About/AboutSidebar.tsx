import React from 'react';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import './AboutSidebar.scss';

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: 'section1', label: 'About' },
  { id: 'section2', label: 'Dashboard Components' },
  { id: 'section3', label: 'Data Source' },
  { id: 'section4', label: 'Model Estimation' },
  { id: 'section5', label: 'Team' },
  { id: 'section6', label: 'Acknowledgments' },
  { id: 'section7', label: 'Citations' },
];

export function AboutSidebar(): JSX.Element {
  const sectionIds = sections.map((s) => s.id);
  
  // Use the scroll spy hook with proper offset
  // Navbar height: 57px + contenthead::before offset: 80px = 137px
  const [activeSection, setActiveSection] = useScrollSpy({
    sectionIds,
    offset: 137,
    threshold: 0.3,
    defaultActiveId: 'section1',
  });

  const scrollToSection = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    const section = document.getElementById(id);
    if (section) {
      // Use scrollIntoView - the contenthead::before handles the offset automatically
      section.scrollIntoView({ 
        behavior: "smooth",
        block: "start"
      });
      
      // Update active section immediately for better UX
      // The hook will handle allowing scroll to override after scroll completes
      setActiveSection(id);
    }
  };

  return (
    <aside className="about-sidebar">
      <nav className="about-sidebar-nav">
        <ul className="about-sidebar-list">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <li key={section.id} className="about-sidebar-item">
                <a
                  href={`#${section.id}`}
                  onClick={(e) => scrollToSection(e, section.id)}
                  className={`about-sidebar-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="about-sidebar-link-indicator"></span>
                  <span className="about-sidebar-link-text">{section.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
