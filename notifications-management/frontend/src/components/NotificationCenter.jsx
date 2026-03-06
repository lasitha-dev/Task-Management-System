import { useEffect, useMemo, useState } from 'react';
import {
  deleteNotification,
  getNotifications,
  getPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences,
} from '../api/notificationsApi';
import { DEV_USER_ID, FILTERS, STATUS_FILTERS, TYPE_META } from '../constants/notificationMeta';
import NotificationCard from './NotificationCard';
import PreferencesPanel from './PreferencesPanel';

const emptyPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  preferences: {},
};

function normalizePreferences(payload) {
  if (!payload) {
    return emptyPreferences;
  }

  const rawPreferences = payload.preferences || {};
  const entries = rawPreferences instanceof Map ? Array.from(rawPreferences.entries()) : Object.entries(rawPreferences);
  const normalizedTypePreferences = Object.fromEntries(entries);

  return {
    emailEnabled: payload.emailEnabled ?? true,
    inAppEnabled: payload.inAppEnabled ?? true,
    preferences: normalizedTypePreferences,
  };
}

function buildCounts(notifications) {
  const counts = { all: notifications.length, task: 0, system: 0, team: 0, comment: 0 };
  notifications.forEach((notification) => {
    const meta = TYPE_META[notification.type];
    if (meta && counts[meta.group] !== undefined) {
      counts[meta.group] += 1;
    }
  });
  return counts;
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((key) => (
        <div className="skeleton-card" key={key}>
          <div className="skeleton skeleton-icon" />
          <div className="skeleton-body">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text-short" />
          </div>
        </div>
      ))}
    </>
  );
}

function Toasts({ items }) {
  return (
    <div className="toast-container">
      {items.map((toast) => (
        <div className={`toast ${toast.type}`} key={toast.id}>
          <span className="material-icons-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [preferences, setPreferences] = useState(emptyPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [toasts, setToasts] = useState([]);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const counts = useMemo(() => buildCounts(notifications), [notifications]);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((notification) => {
        const meta = TYPE_META[notification.type];
        const matchesFilter = activeFilter === 'all' || (meta && meta.group === activeFilter);
        const matchesStatus =
          activeStatus === 'all' ||
          (activeStatus === 'unread' && !notification.isRead) ||
          (activeStatus === 'read' && notification.isRead);
        return matchesFilter && matchesStatus;
      }),
    [activeFilter, activeStatus, notifications]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      setLoading(true);
      setError('');

      try {
        const [notificationResponse, preferencesResponse] = await Promise.all([
          getNotifications(DEV_USER_ID, 50),
          getPreferences(DEV_USER_ID),
        ]);

        if (cancelled) {
          return;
        }

        setNotifications(notificationResponse.data.notifications || []);
        setPreferences(normalizePreferences(preferencesResponse.data));
      } catch (loadError) {
        if (!cancelled) {
          setError('Could not reach the notifications API. Make sure the notifications service and gateway are running.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [toasts]);

  function pushToast(message, type = 'success') {
    setToasts((current) => [...current, { id: `${Date.now()}-${Math.random()}`, message, type }]);
  }

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((current) => current.map((item) => (item._id === id ? { ...item, isRead: true } : item)));
      pushToast('Notification marked as read');
    } catch {
      pushToast('Failed to mark as read', 'error');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead(DEV_USER_ID);
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      pushToast('All notifications marked as read');
    } catch {
      pushToast('Failed to mark all as read', 'error');
    }
  }

  async function handleDelete(id) {
    try {
      await deleteNotification(id);
      setNotifications((current) => current.filter((item) => item._id !== id));
      pushToast('Notification deleted');
    } catch {
      pushToast('Failed to delete notification', 'error');
    }
  }

  function toggleGlobalPreference(key) {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }

  function toggleTypePreference(type) {
    setPreferences((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [type]: {
          enabled: !(current.preferences[type]?.enabled ?? true),
          email: current.preferences[type]?.email ?? true,
          inApp: current.preferences[type]?.inApp ?? true,
        },
      },
    }));
  }

  async function handleSavePreferences() {
    setSavingPrefs(true);
    try {
      const payload = {
        emailEnabled: preferences.emailEnabled,
        inAppEnabled: preferences.inAppEnabled,
        preferences: preferences.preferences,
      };
      const response = await updatePreferences(DEV_USER_ID, payload);
      setPreferences(normalizePreferences(response.data));
      pushToast('Preferences saved');
      setPrefsOpen(false);
    } catch {
      pushToast('Failed to save preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  }

  return (
    <>
      <div className="mobile-header" id="mobileHeader">
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <span className="material-icons-outlined">menu</span>
        </button>
        <span className="mobile-logo">TaskMaster</span>
        <div className="mobile-notif-badge">
          <span className="material-icons-outlined">notifications</span>
          {unreadCount > 0 ? <span className="badge-dot" /> : null}
        </div>
      </div>

      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <div className="app-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">T</div>
              <div>
                <div className="logo-text">TaskMaster</div>
                <div className="sidebar-subtitle">Admin Workspace</div>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Main</div>
            <a href="#" className="nav-item">
              <span className="material-icons-outlined">dashboard</span>
              Dashboard
            </a>
            <a href="#" className="nav-item">
              <span className="material-icons-outlined">check_circle</span>
              Task Board
            </a>
            <a href="#" className="nav-item active">
              <span className="material-icons-outlined">notifications</span>
              Notifications
              <span className="nav-badge">{unreadCount}</span>
            </a>
            <a href="#" className="nav-item">
              <span className="material-icons-outlined">group</span>
              Team Space
            </a>
            <div className="nav-section-label">Insights</div>
            <a href="#" className="nav-item">
              <span className="material-icons-outlined">analytics</span>
              Analytics
            </a>
            <a href="#" className="nav-item">
              <span className="material-icons-outlined">settings</span>
              Settings
            </a>
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">JD</div>
              <div className="user-info">
                <div className="user-name">Jane Doe</div>
                <div className="user-role">Pro Plan</div>
              </div>
              <span className="material-icons-outlined logout-icon">logout</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <header className="page-header">
            <div className="page-header-top">
              <h1 className="page-title">
                Notifications Center
                <span className="unread-badge">{unreadCount}</span>
              </h1>
              <div className="header-actions">
                <button className="btn btn-ghost" onClick={() => setPrefsOpen(true)}>
                  <span className="material-icons-outlined">tune</span>
                  Preferences
                </button>
                <button className="btn btn-primary" onClick={handleMarkAllRead}>
                  <span className="material-icons-outlined">done_all</span>
                  Mark All Read
                </button>
              </div>
            </div>
            <p className="page-description">
              View and manage recent alerts across your microservices architecture.
            </p>
          </header>

          <div className="filter-bar">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                className={`filter-tab ${activeFilter === filter.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.key)}
              >
                {filter.icon ? (
                  <span className="material-icons-outlined filter-tab-icon">{filter.icon}</span>
                ) : null}
                {filter.label}
                <span className="tab-count">({counts[filter.key] ?? 0})</span>
              </button>
            ))}
          </div>

          <div className="status-tabs">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status.key}
                className={`status-tab ${activeStatus === status.key ? 'active' : ''}`}
                onClick={() => setActiveStatus(status.key)}
              >
                {status.label}
              </button>
            ))}
          </div>

          <div className="notification-list">
            {loading ? <LoadingSkeleton /> : null}

            {!loading && error ? (
              <div className="empty-state">
                <span className="material-icons-outlined">cloud_off</span>
                <h3>Connection Error</h3>
                <p>{error}</p>
              </div>
            ) : null}

            {!loading && !error && filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <span className="material-icons-outlined">notifications_none</span>
                <h3>No notifications</h3>
                <p>You're all caught up! Check back later for new updates.</p>
              </div>
            ) : null}

            {!loading && !error
              ? filteredNotifications.map((notification) => (
                  <NotificationCard
                    key={notification._id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))
              : null}
          </div>
        </main>
      </div>

      <PreferencesPanel
        isOpen={prefsOpen}
        preferences={preferences}
        onClose={() => !savingPrefs && setPrefsOpen(false)}
        onSave={handleSavePreferences}
        onToggleGlobal={toggleGlobalPreference}
        onToggleType={toggleTypePreference}
      />

      <Toasts items={toasts} />
    </>
  );
}