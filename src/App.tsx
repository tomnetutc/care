import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MainContent from './components/MainContent/MainContent';
import Home from './components/Home/Home';
import About from './components/About/About';
import { subHeadingsData } from './data/subHeadings';
import { FilterProvider } from './context/FilterContext';
import './App.css';

const App: React.FC = () => {
  return (
    <FilterProvider>
      <Router>
        <Routes>
          {/* Redirect root to Dashboard */}
          <Route path="/" element={<Navigate to="/lifestyle/preferences" replace />} />
          {/* Home route - shows only Navbar and Home content */}
          <Route path="/home" element={
            <div className="app">
              <Navbar />
              <div className="simple-page-content">
                <Home />
              </div>
            </div>
          } />
          {/* About route - shows only Navbar and About content */}
          <Route path="/about" element={
            <div className="app">
              <Navbar />
              <div className="simple-page-content">
                <About />
              </div>
            </div>
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
      </Router>
    </FilterProvider>
  );
};

export default App;