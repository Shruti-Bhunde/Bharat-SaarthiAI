import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AIChat from './pages/AIChat';
import ComplaintReporting from './pages/ComplaintReporting';
import ComplaintDashboard from './pages/ComplaintDashboard';
import GovernmentSchemes from './pages/GovernmentSchemes';
import { MessageSquare, AlertCircle, FileText, LayoutDashboard, Home } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        
        {/* Main Application Routes */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/complaint-reporting" element={<ComplaintReporting />} />
            <Route path="/dashboard" element={<ComplaintDashboard />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />
          </Routes>
        </div>

        {/* Global Footer (Sticky Bottom Navigation for mobile/accessibility) */}
        <footer className="bg-white border-t border-slate-100 py-3 px-4 shadow-md sticky bottom-0 z-40 md:relative">
          <div className="max-w-4xl mx-auto flex justify-around items-center">
            <Link to="/" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
            </Link>
            <Link to="/chat" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] font-medium">Companion</span>
            </Link>
            <Link to="/complaint-reporting" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <AlertCircle className="h-5 w-5" />
              <span className="text-[10px] font-medium">Report</span>
            </Link>
            <Link to="/dashboard" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </Link>
            <Link to="/schemes" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <FileText className="h-5 w-5" />
              <span className="text-[10px] font-medium">Schemes</span>
            </Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
