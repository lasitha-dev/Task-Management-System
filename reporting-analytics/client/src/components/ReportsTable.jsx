import React, { useState } from 'react';
import { reportsApi } from '../services/analyticsApi';

const ReportsTable = ({ reports = [], loading, onRefresh }) => {
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id) => {
    setIsDeleting(true);
    const result = await reportsApi.deleteReport(id);
    if (result.success) {
      onRefresh();
      setIsDeleteConfirm(null);
    }
    setIsDeleting(false);
  };

  const handleDownload = (report) => {
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    const filename = report.title.replace(/\s+/g, '-').toLowerCase() + '.json';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="animate-spin mb-3">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto"></div>
            </div>
            <p className="text-slate-400">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Reports</h3>
        <a href="#view-all" className="text-blue-500 hover:text-blue-400 transition text-sm font-medium">
          View All 
        </a>
      </div>

      {reports && reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-4">Report Name</th>
                <th className="text-left py-3 px-4">Date Generated</th>
                <th className="text-left py-3 px-4">Author</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500"></span>
                      <span className="text-white font-medium">{report.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-300 text-sm">
                    <div>{formatDate(report.generatedAt)}</div>
                    <div className="text-xs text-slate-400">{formatTime(report.generatedAt)}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">
                        {report.authorName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm">{report.authorName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={
                      report.status === 'ready'
                        ? 'text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 bg-green-500/20 text-green-400'
                        : report.status === 'processing'
                        ? 'text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400'
                        : report.status === 'pending'
                        ? 'text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 bg-orange-500/20 text-orange-400'
                        : 'text-xs px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1 bg-slate-700 text-slate-300'
                    }>
                      {report.status === 'ready' ? ' Ready' : report.status === 'processing' ? ' Processing' : report.status === 'pending' ? ' Pending' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(report)}
                        className="text-slate-400 hover:text-blue-500 transition"
                        title="Download report"
                      >
                        
                      </button>
                      <button
                        onClick={() => setIsDeleteConfirm(report._id)}
                        className="text-slate-400 hover:text-red-500 transition"
                        title="Delete report"
                      >
                        
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-400">No reports yet. Generate your first report!</p>
        </div>
      )}

      {isDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-sm w-full">
            <h4 className="text-white text-lg font-semibold mb-2">Confirm Delete</h4>
            <p className="text-slate-400 mb-6">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirm(null)}
                className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(isDeleteConfirm)}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
