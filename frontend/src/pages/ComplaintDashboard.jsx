import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FileText, Eye, CheckCircle2, ShieldAlert, Clock, Info, RefreshCw, X, Filter } from 'lucide-react';


export default function ComplaintDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await apiService.getComplaints();
      setComplaints(data);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await apiService.updateComplaintStatus(complaintId, newStatus);
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, status: newStatus } : c));
      setSelectedComplaint(prev => prev && prev.id === complaintId ? { ...prev, status: newStatus } : prev);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Resolved': return <CheckCircle2 className="h-4 w-4 text-gov-green-600" />;
      case 'Assigned': return <Clock className="h-4 w-4 text-gov-blue-600" />;
      case 'Under Review': return <Clock className="h-4 w-4 text-gov-saffron-500" />;
      default: return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-gov-green-50 text-gov-green-800 border-gov-green-200';
      case 'Assigned': return 'bg-gov-blue-50 text-gov-blue-800 border-gov-blue-200';
      case 'Under Review': return 'bg-gov-saffron-50 text-gov-saffron-800 border-gov-saffron-200';
      default: return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  // Filtered Complaints
  const filteredComplaints = complaints.filter(c => 
    statusFilter === 'All' ? true : c.status === statusFilter
  );

  // Stats calculation
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' || c.priority === 'High').length;
  const avgRisk = totalCount > 0 
    ? Math.round(complaints.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / totalCount) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400">Total Submitted</p>
            <p className="text-2xl font-extrabold text-gov-blue-900 mt-1">{totalCount}</p>
          </div>
          <div className="glass-card p-5 border-gov-green-100">
            <p className="text-xs font-semibold text-gov-green-800">Resolved Complaints</p>
            <p className="text-2xl font-extrabold text-gov-green-700 mt-1">{resolvedCount}</p>
          </div>
          <div className="glass-card p-5 border-orange-100">
            <p className="text-xs font-semibold text-gov-saffron-700">High / Critical Risk</p>
            <p className="text-2xl font-extrabold text-gov-saffron-600 mt-1">{criticalCount}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400">Avg. Risk Index</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-1">{avgRisk}<span className="text-sm font-normal text-slate-400">/100</span></p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filter status:</span>
          <div className="flex flex-wrap gap-2">
            {['All', 'Submitted', 'Under Review', 'Assigned', 'Resolved'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === filter 
                    ? 'bg-gov-blue-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid/List */}
        {loading ? (
          <div className="text-center py-20">
            <RefreshCw className="h-10 w-10 text-gov-blue-700 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Loading registered complaints database...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 space-y-4">
            <FileText className="h-12 w-12 mx-auto stroke-1" />
            <div>
              <p className="font-bold text-slate-700">No complaints registered</p>
              <p className="text-sm">There are no complaints matching the selected filter status.</p>
            </div>
            <Link to="/complaint-reporting" className="btn-primary w-fit mx-auto mt-2 text-xs">
              File a Complaint
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Complaint Title</th>
                    <th className="px-6 py-4">Suggested Department</th>
                    <th className="px-6 py-4">Severity</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Risk Score</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredComplaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gov-blue-900">#{c.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{c.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{c.suggested_department}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs">{c.severity}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${getStatusColor(c.status)}`}>
                          {getStatusIcon(c.status)}
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800">{c.risk_score !== null ? c.risk_score : '--'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {c.priority ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(c.priority)}`}>
                            {c.priority}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Unassessed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="p-2 text-gov-blue-700 hover:bg-gov-blue-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Details View Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-100 flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">Complaint details</span>
                <h3 className="text-lg font-bold text-gov-blue-900">Complaint #{selectedComplaint.id}</h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              
              {/* Layout: Image on top, text details below */}
              {selectedComplaint.image_path && (
                <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm max-h-60 bg-slate-50 flex items-center justify-center">
                  <img
                    src={`http://localhost:8000${selectedComplaint.image_path}`}
                    alt="Complaint Proof"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Fallback if image fails to load (eg if server port differs)
                      e.target.src = selectedComplaint.image_path;
                    }}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-bold text-gov-blue-900">{selectedComplaint.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Submitted on {new Date(selectedComplaint.created_at).toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Assigned Department</span>
                    <span className="text-sm font-semibold text-slate-700">{selectedComplaint.suggested_department}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Status Update (Admin Mode)</span>
                    <select
                      value={selectedComplaint.status}
                      onChange={(e) => handleStatusChange(selectedComplaint.id, e.target.value)}
                      className="bg-transparent border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg p-1.5 focus:border-gov-blue-600 focus:outline-none w-full mt-1"
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Assigned">Assigned</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-slate-400 uppercase">Description</h5>
                  <p className="text-sm text-slate-600 leading-relaxed mt-1 whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>

                {selectedComplaint.risk_score !== null && (
                  <div className="bg-gov-blue-50/50 p-4 rounded-xl border border-gov-blue-100 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gov-blue-900 uppercase">Civic Intelligence Risk Scan</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(selectedComplaint.priority)}`}>
                        {selectedComplaint.priority} Priority ({selectedComplaint.risk_score}/100)
                      </span>
                    </div>
                    {selectedComplaint.reasoning && (
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{selectedComplaint.reasoning}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="btn-outline text-xs px-4 py-2"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
