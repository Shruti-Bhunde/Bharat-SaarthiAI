import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AIChat from './pages/AIChat';
import ComplaintReporting from './pages/ComplaintReporting';
import ComplaintDashboard from './pages/ComplaintDashboard';
import GovernmentSchemes from './pages/GovernmentSchemes';
import { MessageSquare, AlertCircle, FileText, LayoutDashboard, Home, LogOut, ArrowLeft, Languages } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { apiService } from './services/api';

// Separate inner component to use useLocation hook
function AppLayout({ user, setUser, handleLoginSuccess, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const isChat = location.pathname === '/chat';

  // Language state lifted for chat page
  const [language, setLanguage] = useState(() => sessionStorage.getItem('bs_chat_language') || 'English');

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    sessionStorage.setItem('bs_chat_language', newLang);
    // Dispatch a custom event so AIChat can react
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Single Unified Header */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        {/* India tricolor stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">

          {/* Left: Back button (non-home) + Brand */}
          <div className="flex items-center gap-3">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 text-slate-500 hover:text-gov-blue-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <Link to="/" className="flex items-center gap-1.5 select-none">
              <span className="font-extrabold text-xl tracking-tight">
                <span className="text-[#FF9933]">Bharat</span>
                <span className="text-[#138808]"> Saarthi</span>
                <span className="text-[#000080]">AI</span>
              </span>
            </Link>
          </div>

          {/* Right: Language selector (chat only) + User info / Login */}
          <div className="flex items-center gap-3">
            {isChat && (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700">
                <Languages className="h-4 w-4 text-gov-blue-700" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent border-none outline-none cursor-pointer text-slate-700 text-sm"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी</option>
                  <option value="Marathi">मराठी</option>
                </select>
              </div>
            )}

            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-full py-1 pl-1.5 pr-3">
                <img
                  src={user.picture || 'https://www.gravatar.com/avatar/?d=mp'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full shadow-sm"
                />
                <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate hidden sm:block">{user.name}</span>
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
          <Route path="/" element={<LandingPage user={user} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/chat" element={<AIChat globalLanguage={language} />} />
          <Route
            path="/complaint-reporting"
            element={user ? <ComplaintReporting /> : <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/dashboard"
            element={user ? <ComplaintDashboard /> : <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="/schemes"
            element={user ? <GovernmentSchemes /> : <LandingPage user={user} onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      </div>

      {/* Bottom Navigation — only when logged in */}
      {user && (
        <footer className="bg-white border-t border-slate-100 py-3 px-4 shadow-md sticky bottom-0 z-40">
          <div className="max-w-4xl mx-auto flex justify-around items-center">
            <Link to="/" className="flex flex-col items-center gap-0.5 text-slate-500 hover:text-gov-blue-700 transition-colors">
              <Home className="h-5 w-5" />
              <span className="text-[10px] font-medium">Home</span>
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
      )}

      {/* Floating Chat Icon — always visible, bottom right */}
      {!isChat && (
        <Link
          to="/chat"
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-gov-blue-700 to-gov-blue-900 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-200 hover:shadow-2xl"
          title="Chat with Bharat SaarthiAI"
          style={{ bottom: user ? '80px' : '24px' }}
        >
          <MessageSquare className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
}

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
      console.error('Authentication failed:', e);
      alert('Failed to authenticate with Google. Please try again.');
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
      <AppLayout
        user={user}
        setUser={setUser}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
