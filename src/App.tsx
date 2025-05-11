import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import TopMenu from './components/TopMenu/TopMenu';
import MainContent from './components/MainContent/MainContent';
import { subHeadingsData } from './data/subHeadings';
import { FilterProvider } from './context/FilterContext';
import './App.css';

const App: React.FC = () => {
  return (
    <FilterProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="content-wrapper">
            <Sidebar />
            <TopMenu />
            <main className="main-area">
              <div className="main-content">
                <Routes>
                  <Route
                    path="/lifestyle/:subHeadingName?"
                    element={<MainContent subHeadings={subHeadingsData.lifestyle} />}
                  />
                  {/* ...other routes... */}
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </FilterProvider>
  );
};

export default App;