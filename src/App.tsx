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
          
          {/* All dashboard routes - use original layout with all components */}
          <Route path="*" element={
            <div className="app">
              <Navbar />
              <div className="content-wrapper">
                {/* <Sidebar /> */}
                {/* TopMenu has been moved to MainContent */}
                <main className="main-area">
                  <div className="main-content">
                    <Routes>
                      <Route
                        path="/lifestyle/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.lifestyle} />}
                      />
                      <Route
                        path="/community/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.community} />}
                      />
                      <Route
                        path="/disruptions/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.disruptions} />}
                      />
                      <Route
                        path="/transportation/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.transportation} />}
                      />
                      <Route
                        path="/transit/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.transit} />}
                      />
                      <Route
                        path="/demographics/:subHeadingName?"
                        element={<MainContent subHeadings={subHeadingsData.demographics} />}
                      />
                      {/* Default redirect if needed */}
                      <Route path="/" element={<MainContent subHeadings={subHeadingsData.lifestyle} />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </FilterProvider>
  );
};

export default App;