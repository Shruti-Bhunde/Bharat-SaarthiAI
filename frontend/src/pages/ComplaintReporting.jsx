import React, { useState } from 'react';
import { apiService } from '../services/api';
import { Upload, AlertCircle, Cpu, Save, FileImage, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function ComplaintReporting() {
  const navigate = useNavigate();
  
  // Phase 1: Upload and Vision
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  
  // Vision Results (Editable)
  const [title, setTitle] = useState('');
  const [detectedType, setDetectedType] = useState('');
  const [severity, setSeverity] = useState('');
  const [suggestedDept, setSuggestedDept] = useState('');
  const [uploadedPath, setUploadedPath] = useState('');
  
  // Phase 2: ML Features
  const [locationType, setLocationType] = useState('Residential');
  const [trafficDensity, setTrafficDensity] = useState(50);
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  
  // ML Results
  const [predicting, setPredicting] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [priority, setPriority] = useState('');
  const [reasoning, setReasoning] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
      // Reset subsequent steps
      setTitle('');
      setDetectedType('');
      setSeverity('');
      setSuggestedDept('');
      setRiskScore(null);
    }
  };

  const handleVisionAnalysis = async () => {
    if (!imageFile) {
      setErrorMsg('Please select an image file to analyze first.');
      return;
    }
    setAnalyzing(true);
    setErrorMsg('');
    try {
      const data = await apiService.analyzeImage(imageFile);
      setTitle(data.title);
      setDetectedType(data.detected_type);
      setSeverity(data.severity);
      setSuggestedDept(data.suggested_department);
      setUploadedPath(data.image_path);
      if (data.description) {
        setDescription(data.description);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to run Gemini Vision. Make sure your server is running and API keys are set.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePredictRisk = async () => {
    if (!detectedType || !severity) {
      setErrorMsg('Analyze the image or fill in issue details first.');
      return;
    }
    setPredicting(true);
    setErrorMsg('');
    try {
      const payload = {
        complaint_type: detectedType,
        severity: severity,
        location_type: locationType,
        traffic_density: parseInt(trafficDensity, 10),
        time_of_day: timeOfDay
      };
      const result = await apiService.predictRisk(payload);
      setRiskScore(result.risk_score);
      setPriority(result.priority);
      setReasoning(result.reason);
    } catch (error) {
      console.error(error);
      setErrorMsg('Error predicting risk score using machine learning model.');
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!title || !detectedType || !suggestedDept) {
      setErrorMsg('Please fill in all complaint details.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const payload = {
        title,
        description,
        detected_type: detectedType,
        suggested_department: suggestedDept,
        severity,
        image_path: uploadedPath,
        risk_score: riskScore,
        priority,
        reasoning
      };
      await apiService.submitComplaint(payload);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to submit complaint. Database error.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityBadgeColor = (p) => {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner - Tricolor accents */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gov-saffron-500 via-white to-gov-green-600"></div>

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3 shadow-sm">
        <Link to="/" className="text-slate-500 hover:text-gov-blue-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-2xl">🇮🇳</span>
        <div>
          <h1 className="text-lg font-bold text-gov-blue-900 leading-tight">Smart Complaint Portal</h1>
          <p className="text-xs text-slate-500">FastAPI, Gemini Vision, & Random Forest Integration</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 grid md:grid-cols-2 gap-8">
        {/* Left Column: Image Upload & Detail Inputs */}
        <div className="space-y-6">
          {/* Card 1: Upload Image */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold text-gov-blue-900 mb-4 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-gov-saffron-500" />
              1. Upload Complaint Image
            </h2>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50/50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                  <p className="text-xs text-slate-500">Click or drag another image to replace</p>
                </div>
              ) : (
                <div className="py-8 space-y-3">
                  <Upload className="h-10 w-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="text-sm font-semibold text-gov-blue-900">Select Issue Image</p>
                    <p className="text-xs text-slate-400">Supports JPG, PNG (Pothole, Waste, Leakage, etc.)</p>
                  </div>
                </div>
              )}
            </div>

            {imageFile && (
              <button
                type="button"
                onClick={handleVisionAnalysis}
                disabled={analyzing}
                className="btn-primary w-full mt-4"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analyzing Image with Gemini Vision...
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4" />
                    Run AI Vision Scan
                  </>
                )}
              </button>
            )}
          </div>

          {/* Card 2: AI Vision Scan Results */}
          {detectedType && (
            <div className="glass-card p-6 border-gov-blue-100">
              <h2 className="text-lg font-bold text-gov-blue-900 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-gov-blue-700" />
                2. AI Vision Scan Output (Review)
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Issue Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Detected Type</label>
                    <select
                      value={detectedType}
                      onChange={(e) => setDetectedType(e.target.value)}
                      className="glass-input w-full p-2.5 text-sm text-slate-800"
                    >
                      <option value="Pothole">Pothole</option>
                      <option value="Garbage">Garbage</option>
                      <option value="Water Leakage">Water Leakage</option>
                      <option value="Broken Streetlight">Broken Streetlight</option>
                      <option value="Broken Road">Broken Road</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="glass-input w-full p-2.5 text-sm text-slate-800"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Suggested Department</label>
                  <input
                    type="text"
                    value={suggestedDept}
                    onChange={(e) => setSuggestedDept(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Details/Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm text-slate-800 resize-none"
                    placeholder="Provide additional details..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: ML Risk Predictor & Submit */}
        <div className="space-y-6">
          {/* Card 3: ML Context Inputs */}
          {detectedType && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-gov-blue-900 mb-4 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-gov-green-600" />
                3. Risk Engine Context
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Location Zone Type</label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm text-slate-800"
                  >
                    <option value="Residential">Residential Area</option>
                    <option value="Commercial">Commercial/Market Area</option>
                    <option value="Highway">National/State Highway</option>
                    <option value="School Zone">School Zone (High Danger)</option>
                    <option value="Hospital Zone">Hospital Zone</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-500">Traffic Density</label>
                    <span className="text-xs font-bold text-gov-blue-900">{trafficDensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={trafficDensity}
                    onChange={(e) => setTrafficDensity(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gov-blue-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Time of Day</label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="glass-input w-full p-2.5 text-sm text-slate-800"
                  >
                    <option value="Morning">Morning (High traffic)</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening (Rush hour)</option>
                    <option value="Night">Night (Low visibility)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handlePredictRisk}
                  disabled={predicting}
                  className="btn-green w-full mt-2"
                >
                  {predicting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Assessing Risk...
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4" />
                      Evaluate Civic Risk Score
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Card 4: ML Prediction Outputs */}
          {riskScore !== null && (
            <div className="glass-card p-6 border-gov-green-100">
              <h2 className="text-lg font-bold text-gov-blue-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-gov-saffron-500" />
                4. Risk Evaluation Output
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">Predicted Risk Score</p>
                    <span className="text-3xl font-extrabold text-gov-blue-900">{riskScore}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-1 text-right">Priority Class</p>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getPriorityBadgeColor(priority)}`}>
                      {priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">AI Explanation (Gemini generated):</label>
                  <p className="text-sm text-slate-600 bg-gov-blue-50/40 p-3 rounded-xl border border-gov-blue-50 leading-relaxed italic">
                    "{reasoning}"
                  </p>
                </div>

                {errorMsg && (
                  <div className="flex gap-2 text-xs font-semibold text-red-600 bg-red-50 p-3 rounded-xl">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmitComplaint}
                  disabled={submitting}
                  className="btn-saffron w-full"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Submitting Complaint...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Submit & Register Complaint
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Placeholder when no image is loaded */}
          {!detectedType && (
            <div className="glass-card p-8 text-center text-slate-400 space-y-2">
              <Cpu className="h-10 w-10 mx-auto stroke-1" />
              <p className="text-sm font-semibold">Vision and ML options will unlock here once you choose and analyze an image on the left.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
