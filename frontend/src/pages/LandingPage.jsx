import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, AlertCircle, FileText, ArrowRight, Shield, Award, Sparkles, LogIn, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function LandingPage({ user, onLoginSuccess }) {
  const navigate = useNavigate();

  const handleRestrictedAction = (e) => {
    if (!user) {
      e.preventDefault();
      alert('Access Restricted: Please sign in with Google to use this feature.');
    }
  };

  return (
    <div className="bg-gradient-to-b from-gov-blue-50/50 via-white to-gov-blue-50/20 min-h-[90vh]">
      {/* Main Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-gov-blue-100/60 border border-gov-blue-200 text-gov-blue-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 animate-pulse">
          <Sparkles className="h-4 w-4 text-gov-saffron-500" />
          Mera Bharat, Mera Saarthi (AI Powered Civic Assistant)
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gov-blue-900 tracking-tight leading-tight mb-6">
          Empowering Citizens with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gov-saffron-600 via-gov-blue-800 to-gov-green-700">
            AI-Driven Civic Assistance
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Skip the complicated portals. Describe your issue in plain language, upload complaints with automated vision analysis, check risk severity with machine learning, and discover personalized government schemes.
        </p>

        {/* Center Google Authentication on Landing Page when not logged in */}
        {!user ? (
          <div className="bg-white border border-slate-100 shadow-md p-6 rounded-2xl max-w-md w-full mb-10 flex flex-col items-center gap-4">
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 justify-center">
                <LogIn className="w-5 h-5 text-gov-blue-700" /> Sign In to Get Started
              </h3>
              <p className="text-xs text-slate-500 mt-1">Sign in with Google to file official complaints, see your dashboard status, and view eligibility details.</p>
            </div>
            <GoogleLogin
              onSuccess={onLoginSuccess}
              onError={() => console.log('Login Failed')}
              shape="pill"
              size="large"
              text="signup_with"
            />
          </div>
        ) : (
          <div className="bg-green-50/50 border border-green-100 px-4 py-2.5 rounded-full mb-10 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gov-green-600" />
            <span className="text-xs font-semibold text-slate-700">Logged in as {user.name}. You have access to all features.</span>
          </div>
        )}

        {/* Quick Navigation Cards — only when logged in */}
        {user && (
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Link to="/chat" className="btn-primary text-lg px-8 py-3.5">
              <MessageSquare className="h-5 w-5" />
              Talk to Civic Companion
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/complaint-reporting" className="btn-saffron text-lg px-8 py-3.5">
              <AlertCircle className="h-5 w-5" />
              Report Civic Complaint
            </Link>
            <Link to="/schemes" className="btn-green text-lg px-8 py-3.5">
              <FileText className="h-5 w-5" />
              Check Government Schemes
            </Link>
          </div>
        )}

        {/* Informative Grid of Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          <div className="glass-card p-8 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="bg-gov-blue-100 text-gov-blue-800 p-4 rounded-2xl w-fit mx-auto mb-6">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gov-blue-900 mb-3">AI Civic Companion</h3>
            <p className="text-slate-600">
              Get step-by-step personalized roadmaps for lost documents, passport queries, scholarship applications, and other public services in English, Hindi, or Marathi.
            </p>
          </div>

          <div className="glass-card p-8 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="bg-gov-saffron-50 text-gov-saffron-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gov-blue-900 mb-3">Smart Complaint Vision</h3>
            <p className="text-slate-600">
              Upload photos of potholes, garbage, or leaking water. Gemini Vision detects issue details, categorizes them, and identifies the correct municipal department.
            </p>
          </div>

          <div className="glass-card p-8 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="bg-gov-green-50 text-gov-green-600 p-4 rounded-2xl w-fit mx-auto mb-6">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gov-blue-900 mb-3">ML Intelligence Engine</h3>
            <p className="text-slate-600">
              Our Random Forest model analyzes traffic density, location types, and severity to generate a localized risk score, helping municipal authorities prioritize actions.
            </p>
          </div>
        </div>

        {/* Security / Verification Badges */}
        <div className="border-t border-slate-100 pt-12 mt-16 max-w-4xl mx-auto flex flex-wrap justify-around items-center gap-6 text-slate-500">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-gov-green-600" />
            <span className="font-semibold text-slate-700 text-sm">Safe & Private Data Processing</span>
          </div>
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-gov-blue-700" />
            <span className="font-semibold text-slate-700 text-sm">Powered by Gemini & Scikit-Learn</span>
          </div>
        </div>
      </div>
    </div>
  );
}
