import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import { StyleProvider } from './context/StyleContext';
import { AIProvider } from './context/AIContext';
import Builder from './pages/Builder';

import './index.css';

function App() {
  return (
    // AuthProvider must wrap ResumeProvider so ResumeContext can read the token
    <AuthProvider>
      <ResumeProvider>
        <StyleProvider>
          <AIProvider>
            <Router>
              <div className="antialiased text-slate-900 bg-gray-50">
                <Routes>
                  <Route path="/" element={<Builder />} />
                </Routes>
              </div>
            </Router>
          </AIProvider>
        </StyleProvider>
      </ResumeProvider>
    </AuthProvider>
  );
}

export default App;