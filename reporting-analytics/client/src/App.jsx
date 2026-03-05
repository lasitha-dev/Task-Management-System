import React, { useState, useEffect } from 'react';
import { analyticsApi, reportsApi } from './services/analyticsApi';
import StatCard from './components/StatCard';
import WeeklyChart from './components/WeeklyChart';
import StatusChart from './components/StatusChart';
import ReportsTable from './components/ReportsTable';
import GenerateReportModal from './components/GenerateReportModal';

function App() {
  const [period, setPeriod] = useState('week');
  const [summary, setSummary] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, weeklyRes, statusRes, reportsRes] = await Promise.all([
        analyticsApi.fetchSummary(period),
        analyticsApi.fetchWeeklyData(),
        analyticsApi.fetchStatusBreakdown(),
        reportsApi.fetchReports()
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (weeklyRes.success) setWeeklyData(weeklyRes.data);
      if (statusRes.success) setStatusData(statusRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
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

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Top Navigation Bar */}
      <div className="bg-dark-surface border-b border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">📊 TaskMaster</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-primary hover:text-primary-light transition">🔔</button>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                AR
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="mt-4 text-sm text-dark-border">
            Home <span className="mx-2">/</span> <span className="text-primary">Analytics</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex gap-2 flex-wrap">
            {['week', 'month', 'custom'].map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  period === p
                    ? 'bg-primary text-white'
                    : 'bg-dark-surface border border-dark-border text-dark-border hover:border-primary'
                }`}
              >
                {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'Custom'}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowGenerate(true)}
            className="bg-primary hover:bg-primary-light text-white px-6 py-2 rounded-lg font-medium transition whitespace-nowrap"
          >
            + Generate Report
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={summary?.totalTasks || 0}
            percentage={summary?.totalChange || 0}
            color="primary"
          />
          <StatCard
            title="Completed Tasks"
            value={summary?.completedTasks || 0}
            percentage={summary?.completedChange || 0}
            color="primary"
          />
          <StatCard
            title="Productivity"
            value={`${summary?.productivity || 0}%`}
            percentage={summary?.productivityChange || 0}
            color="primary"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <WeeklyChart data={weeklyData} loading={loading} />
          <StatusChart data={statusData} loading={loading} />
        </div>

        {/* Reports Table */}
        <ReportsTable reports={reports} loading={loading} onRefresh={loadData} />
      </div>

      {/* Generate Report Modal */}
      <GenerateReportModal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        onSuccess={loadData}
      />
    </div>
  );
}

export default App;
