import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MainContent from './components/MainContent/MainContent';
import Home from './components/Home/Home';
import About from './components/About/About';
import ScenarioATEPanel from './components/scenario/ScenarioATEPanel';
import { subHeadingsData } from './data/subHeadings';
import { FilterProvider } from './context/FilterContext';
import { CurrentTopicProvider } from './context/CurrentTopicContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const AppContent: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const isDashboard =
      pathname.startsWith("/lifestyle") ||
      pathname.startsWith("/community") ||
      pathname.startsWith("/disruptions") ||
      pathname.startsWith("/transportation") ||
      pathname.startsWith("/sample-characteristics") ||
      pathname.startsWith("/dashboard");

    document.body.classList.toggle("is-dashboard", isDashboard);
    
    // Reset scroll position when switching to dashboard pages
    if (isDashboard) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <Routes>
          {/* Redirect root to Dashboard */}
          <Route path="/" element={<Navigate to="/lifestyle/preferences" replace />} />
          {/* Home route - shows only Navbar and Home content */}
          <Route path="/home" element={
            <>
              <Navbar />
              <Home />
            </>
          } />
          {/* About route - shows only Navbar and About content */}
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
            </>
          } />
          {/* Scenario Analysis route */}
          <Route path="/scenario" element={
            <>
              <Navbar />
              <ScenarioATEPanel />
            </>
          } />
          {/* Dashboard redirect route */}
          <Route path="/dashboard" element={<Navigate to="/lifestyle/preferences" replace />} />

          {/* Dashboard section routes - use original layout with all components */}
          <Route path="/lifestyle/:subHeadingName?" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                <main className="main-area">
                  <div className="main-content">
                    <MainContent subHeadings={subHeadingsData.lifestyle} />
                  </div>
                </main>
              </div>
            </div>
          } />
          <Route path="/community/:subHeadingName?" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                <main className="main-area">
                  <div className="main-content">
                    <MainContent subHeadings={subHeadingsData.community} />
                  </div>
                </main>
              </div>
            </div>
          } />
          <Route path="/disruptions/:subHeadingName?" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                <main className="main-area">
                  <div className="main-content">
                    <MainContent subHeadings={subHeadingsData.disruptions} />
                  </div>
                </main>
              </div>
            </div>
          } />
          <Route path="/transportation/:subHeadingName?" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                <main className="main-area">
                  <div className="main-content">
                    <MainContent subHeadings={subHeadingsData.transportation} />
                  </div>
                </main>
              </div>
            </div>
          } />
          <Route path="/sample-characteristics/:subHeadingName?" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                <main className="main-area">
                  <div className="main-content">
                    <MainContent subHeadings={subHeadingsData.sampleCharacteristics} />
                  </div>
                </main>
              </div>
            </div>
          } />
          {/* Fallback route for unmatched paths */}
          <Route path="*" element={<Navigate to="/lifestyle/preferences" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <FilterProvider>
      <CurrentTopicProvider>
        <Router>
          <AppContent />
        </Router>
      </CurrentTopicProvider>
    </FilterProvider>
  );
};

export default App;