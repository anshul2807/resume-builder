import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResumeProvider } from './context/ResumeContext';
import { StyleProvider } from './context/StyleContext';
import Builder from './pages/Builder';

import './index.css';

function App() {
  return (
    <ResumeProvider>
      <StyleProvider>
        <Router>
          <div className="antialiased text-slate-900 bg-gray-50">
            <Routes>
              <Route path="/" element={<Builder />} />
            </Routes>
          </div>
        </Router>
      </StyleProvider>
    </ResumeProvider>
  );
}

export default App;