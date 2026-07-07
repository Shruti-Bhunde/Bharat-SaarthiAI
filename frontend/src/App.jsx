import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AIChat from './pages/AIChat';
import ComplaintReporting from './pages/ComplaintReporting';
import ComplaintDashboard from './pages/ComplaintDashboard';
import GovernmentSchemes from './pages/GovernmentSchemes';
import { MessageSquare, AlertCircle, FileText, LayoutDashboard, Home, LogOut, User, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from './services/api';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('bs_user_profile');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bs_user_profile');
      }
    }
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const result = await apiService.googleAuth(credentialResponse.credential);
      if (result?.user) {
        setUser(result.user);
      }
    } catch (e) {
      console.error("Authentication failed:", e);
      alert("Failed to authenticate with Google. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bs_user_token');
    localStorage.removeItem('bs_user_profile');
    setUser(null);
    window.location.reload();
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        
        {/* Tricolor Header */}
        <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
          <div className="h-1.5 w-full bg-gradient-to-r from-gov-saffron-500 via-white to-gov-green-600"></div>
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gov-saffron-600 via-gov-blue-800 to-gov-green-700">
                Bharat Saarthi AI
              </span>
            </Link>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full py-1 pl-1.5 pr-3">
                  <img 
                    src={user.picture || 'https://www.gravatar.com/avatar/?d=mp'} 
                    alt={user.name} 
                    className="w-7 h-7 rounded-full shadow-sm"
                  />
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">{user.name}</span>
                  <button 
                    onClick={handleLogout} 
                    title="Logout" 
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="scale-90 origin-right">
                  <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => console.log('Login Failed')}
                    shape="pill"
                    size="medium"
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Application Routes */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={<AIChat />} />
            <Route 
              path="/complaint-reporting" 
              element={user ? <ComplaintReporting /> : <LandingPage />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <ComplaintDashboard /> : <LandingPage />} 
            />
            <Route 
              path="/schemes" 
              element={user ? <GovernmentSchemes /> : <LandingPage />} 
            />
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
            <Link 
              to={user ? "/complaint-reporting" : "/"} 
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  alert("Access Restricted: Please sign in with Google to use the Report feature.");
                }
              }}
              className={`flex flex-col items-center gap-0.5 transition-colors ${user ? 'text-slate-500 hover:text-gov-blue-700' : 'text-slate-300 cursor-not-allowed'}`}
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-[10px] font-medium">Report</span>
            </Link>
            <Link 
              to={user ? "/dashboard" : "/"} 
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  alert("Access Restricted: Please sign in with Google to view your Dashboard.");
                }
              }}
              className={`flex flex-col items-center gap-0.5 transition-colors ${user ? 'text-slate-500 hover:text-gov-blue-700' : 'text-slate-300 cursor-not-allowed'}`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </Link>
            <Link 
              to={user ? "/schemes" : "/"} 
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  alert("Access Restricted: Please sign in with Google to check eligibility Schemes.");
                }
              }}
              className={`flex flex-col items-center gap-0.5 transition-colors ${user ? 'text-slate-500 hover:text-gov-blue-700' : 'text-slate-300 cursor-not-allowed'}`}
            >
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
