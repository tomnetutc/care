import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MainContent from './components/MainContent/MainContent';
import Home from './components/Home/Home';
import About from './components/About/About';
import ScenarioATEPanel from './components/scenario/ScenarioATEPanel';
import ScrollToTop from './components/ScrollToTop';
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
  }, [pathname]);

  return (
    <Routes>
          <Route path="/" element={<Navigate to="/lifestyle/preferences" replace />} />
          <Route path="/home" element={
            <>
              <Navbar />
              <Home />
            </>
          } />
          <Route path="/about" element={
            <>
              <Navbar />
              <About />
            </>
          } />
          <Route path="/scenario" element={
            <>
              <Navbar />
              <ScenarioATEPanel />
            </>
          } />
          <Route path="/dashboard" element={<Navigate to="/lifestyle/preferences" replace />} />
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
          <Route path="*" element={<Navigate to="/lifestyle/preferences" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <FilterProvider>
      <CurrentTopicProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </CurrentTopicProvider>
    </FilterProvider>
  );
};

export default App;
