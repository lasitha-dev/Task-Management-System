import React, { useState, useEffect } from 'react';
import { analyticsApi, reportsApi } from './services/analyticsApi';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatCard from './components/StatCard';
import WeeklyChart from './components/WeeklyChart';
import StatusChart from './components/StatusChart';
import ReportsTable from './components/ReportsTable';
import GenerateReportModal from './components/GenerateReportModal';

function App() {
  const [period, setPeriod] = useState('week');
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [weeklyError, setWeeklyError] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setSummaryError(null);
    setWeeklyError(null);
    try {
      const [summaryRes, weeklyRes, statusRes, reportsRes] = await Promise.all([
        analyticsApi.fetchSummary(period),
        analyticsApi.fetchWeeklyData(),
        analyticsApi.fetchStatusBreakdown(),
        reportsApi.fetchReports()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      } else if (!summaryRes.success) {
        setSummaryError('Failed to load analytics data');
      }
      
      if (weeklyRes.success) {
        setWeeklyData(weeklyRes.data);
      } else {
        setWeeklyError(weeklyRes.error || 'Failed to load weekly data');
      }
      
      if (statusRes.success) setStatusData(statusRes.data);
      if (reportsRes.success) setReports(Array.isArray(reportsRes.data) ? reportsRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setSummaryError('Unable to connect to analytics service');
      setWeeklyError('Unable to connect to analytics service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleGenerateSuccess = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 lg:ml-60 flex flex-col">
        {/* Header */}
        <Header onGenerateReport={() => setShowGenerate(true)} />

        {/* Main scrollable content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb & Time Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="text-sm text-slate-400">
                Home <span className="mx-2">/</span> <span className="text-blue-500 font-medium">Analytics</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['week', 'month', 'custom'].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      period === p
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-500'
                    }`}
                  >
                    {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : '📅 Custom'}
                  </button>
                ))}
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Tasks"
                value={summary?.totalTasks}
                percentage={summary?.totalChange || 0}
                icon="📋"
                isLoading={loading}
                error={summaryError}
              />
              <StatCard
                title="Completed Tasks"
                value={summary?.completedTasks}
                percentage={summary?.completedChange || 0}
                icon="✓"
                isLoading={loading}
                error={summaryError}
              />
              <StatCard
                title="Productivity %"
                value={summary?.productivity ? `${Math.round(summary.productivity)}%` : '--'}
                percentage={summary?.productivityChange || 0}
                icon="⚡"
                isLoading={loading}
                error={summaryError}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <WeeklyChart data={weeklyData} loading={loading} error={weeklyError} />
              </div>
              <div className="lg:col-span-1">
                <StatusChart data={statusData} loading={loading} />
              </div>
            </div>

            {/* Reports Table */}
            <ReportsTable reports={reports} loading={loading} onRefresh={loadData} />
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}

export default App;
