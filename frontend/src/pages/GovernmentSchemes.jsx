import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Search, Sparkles, AlertCircle, FileText, RefreshCw, Landmark, Gift } from 'lucide-react';


export default function GovernmentSchemes() {
  const [age, setAge] = useState('');
  const [occupation, setOccupation] = useState('Student');
  const [income, setIncome] = useState('');
  const [gender, setGender] = useState('Male');
  const [education, setEducation] = useState('Student');

  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState([]);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const occupationsList = [
    'Student',
    'Farmer',
    'Laborer',
    'Street Vendor',
    'Unemployed',
    'Driver',
    'Artisan',
    'Business Owner',
    'Entrepreneur',
    'Self Employed',
    'Homemaker',
    'Other'
  ];

  const educationsList = [
    'Student',
    'Secondary',
    'Graduate',
    'Postgraduate',
    'Other'
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!age || !income) {
      setErrorMsg('Please fill in age and annual income.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setSchemes([]);

    try {
      const payload = {
        age: parseInt(age, 10),
        occupation,
        income: parseFloat(income),
        gender,
        education
      };
      
      const response = await apiService.recommendSchemes(payload);
      setSchemes(response.schemes);
    } catch (error) {
      console.error(error);
      setErrorMsg('Error connecting to backend schemes matching engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid md:grid-cols-3 gap-8">
        
        {/* Left Side: Profile Input Form */}
        <div className="md:col-span-1">
          <div className="glass-card p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gov-blue-900 mb-4 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-gov-blue-700" />
              Enter Profile Details
            </h2>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="glass-input w-full p-2.5 text-sm text-slate-800"
                  placeholder="e.g. 24"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 text-xs font-semibold border rounded-xl transition-all ${
                        gender === g 
                          ? 'bg-gov-blue-800 text-white border-gov-blue-800' 
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="glass-input w-full p-2.5 text-sm text-slate-800"
                >
                  {occupationsList.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="glass-input w-full p-2.5 text-sm text-slate-800"
                  placeholder="e.g. 180000"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Highest Education Level</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="glass-input w-full p-2.5 text-sm text-slate-800"
                >
                  {educationsList.map(edu => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
              </div>

              {errorMsg && (
                <div className="flex gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Finding Schemes...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Recommend Schemes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Recommendations View */}
        <div className="md:col-span-2 space-y-6">
          {!searched && (
            <div className="glass-card p-12 text-center text-slate-400 space-y-3">
              <Landmark className="h-14 w-14 mx-auto stroke-1 text-gov-blue-700/50" />
              <div>
                <h3 className="font-bold text-slate-700 text-lg">Personalized Scheme Recommendations</h3>
                <p className="text-sm max-w-md mx-auto mt-1">Submit your profile on the left to see which central and state government schemes you are eligible for, along with AI-generated feedback.</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-20">
              <RefreshCw className="h-10 w-10 text-gov-blue-700 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Matching profile details against government databases...</p>
            </div>
          )}

          {searched && !loading && schemes.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-400 space-y-3">
              <AlertCircle className="h-12 w-12 mx-auto stroke-1" />
              <div>
                <h3 className="font-bold text-slate-700 text-lg">No Matching Schemes Found</h3>
                <p className="text-sm max-w-md mx-auto mt-1">Try modifying your income threshold or occupational settings to view other general schemes.</p>
              </div>
            </div>
          )}

          {searched && !loading && schemes.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gov-green-700 bg-gov-green-50 px-2.5 py-1 rounded-full border border-gov-green-200">
                  {schemes.length} Eligible Schemes Found
                </span>
              </div>

              <div className="grid gap-6">
                {schemes.map((s) => (
                  <div key={s.id} className="glass-card p-6 border-l-4 border-l-gov-blue-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-gov-blue-50/50 rounded-bl-full flex items-center justify-center text-gov-blue-700 font-bold text-xs pl-4 pb-4">
                      #{s.id}
                    </div>

                    <h3 className="text-md font-bold text-gov-blue-900 pr-10">{s.name}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
                    
                    <div className="mt-4 flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Gift className="h-4 w-4 text-gov-green-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Scheme Benefits</span>
                        <p className="text-xs text-slate-600 font-medium leading-normal mt-0.5">{s.benefits}</p>
                      </div>
                    </div>

                    {s.why_eligible && (
                      <div className="mt-3 flex gap-2 items-start bg-gov-blue-50/30 p-3 rounded-xl border border-gov-blue-50">
                        <Sparkles className="h-4 w-4 text-gov-saffron-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-gov-blue-800 uppercase">AI Eligibility Explanation</span>
                          <p className="text-xs text-slate-600 italic leading-relaxed mt-0.5">"{s.why_eligible}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
