import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import {
  deleteNotification,
  getNotifications,
  getPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updatePreferences,
} from '../api/notificationsApi';
import { FILTERS, STATUS_FILTERS, TYPE_META } from '../constants/notificationMeta';
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

Toasts.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'NA';
}

export default function NotificationCenter({ currentUser = null }) {
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

  const currentUserId = currentUser?.id || null;
  const currentUserName = currentUser?.name || 'Guest User';
  const currentUserRole = currentUser?.role || 'Authentication required';
  const currentUserInitials = getInitials(currentUserName);

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

      if (!currentUserId) {
        setNotifications([]);
        setPreferences(emptyPreferences);
        setError('You need to sign in through the user-management flow before opening the notifications center.');
        setLoading(false);
        return;
      }

      try {
        const [notificationResponse, preferencesResponse] = await Promise.all([
          getNotifications(currentUserId, 50),
          getPreferences(currentUserId),
        ]);

        if (cancelled) {
          return;
        }

        setNotifications(notificationResponse.data.notifications || []);
        setPreferences(normalizePreferences(preferencesResponse.data));
      } catch {
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
  }, [currentUserId]);

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timer = globalThis.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 3000);

    return () => globalThis.clearTimeout(timer);
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
      if (!currentUserId) {
        return;
      }

      await markAllNotificationsRead(currentUserId);
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
      if (!currentUserId) {
        throw new Error('Authentication required');
      }

      const payload = {
        emailEnabled: preferences.emailEnabled,
        inAppEnabled: preferences.inAppEnabled,
        preferences: preferences.preferences,
      };
      const response = await updatePreferences(currentUserId, payload);
      setPreferences(normalizePreferences(response.data));
      pushToast('Preferences saved');
      setPrefsOpen(false);
    } catch {
      pushToast('Failed to save preferences', 'error');
    } finally {
      setSavingPrefs(false);
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleOverlayKeyDown(event) {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      closeSidebar();
    }
  }

  function renderNavItem(icon, label, isActive = false) {
    return (
      <button type="button" className={`nav-item ${isActive ? 'active' : ''}`}>
        <span className="material-icons-outlined" aria-hidden="true">{icon}</span>
        <span>{label}</span>
        {label === 'Notifications' ? <span className="nav-badge">{unreadCount}</span> : null}
      </button>
    );
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

      <button
        type="button"
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        onKeyDown={handleOverlayKeyDown}
        aria-label="Close menu"
      />

      <div className="app-layout">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="logo-icon">T</div>
              <div>
                <div className="logo-text">TaskMaster</div>
                <div className="sidebar-subtitle">Notifications Workspace</div>
              </div>
            </div>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-section-label">Main</div>
            {renderNavItem('dashboard', 'Dashboard')}
            {renderNavItem('check_circle', 'Task Board')}
            {renderNavItem('notifications', 'Notifications', true)}
            {renderNavItem('group', 'Team Space')}
            <div className="nav-section-label">Insights</div>
            {renderNavItem('analytics', 'Analytics')}
            {renderNavItem('settings', 'Settings')}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">{currentUserInitials}</div>
              <div className="user-info">
                <div className="user-name">{currentUserName}</div>
                <div className="user-role">{currentUserRole}</div>
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
                {' '}
                <span className="unread-badge">{unreadCount}</span>
              </h1>
              <div className="header-actions">
                <button className="btn btn-ghost" onClick={() => setPrefsOpen(true)}>
                  <span className="material-icons-outlined" aria-hidden="true">tune</span>
                  <span>Preferences</span>
                </button>
                <button className="btn btn-primary" onClick={handleMarkAllRead}>
                  <span className="material-icons-outlined" aria-hidden="true">done_all</span>
                  <span>Mark All Read</span>
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

NotificationCenter.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
};