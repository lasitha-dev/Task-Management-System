/* eslint-disable react/prop-types */

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ');
}

export function AppSidebarShell({ children, footer, className = '' }) {
  return (
    <aside className={joinClassNames('tm-sidebar-shell', className)}>
      <div>{children}</div>
      {footer ? <div className="tm-sidebar-footer">{footer}</div> : null}
    </aside>
  );
}

export function AppSidebarBrand({ title = 'TaskMaster', subtitle = '' }) {
  return (
    <div className="tm-sidebar-brand">
      <div className="tm-sidebar-brand-content">
        <div className="tm-sidebar-logo">
          <span className="material-symbols-outlined">task_alt</span>
        </div>
        <div>
          <div className="tm-sidebar-brand-title">{title}</div>
          {subtitle ? <div className="tm-sidebar-brand-subtitle">{subtitle}</div> : null}
        </div>
      </div>
    </div>
  );
}

export function AppSidebarBody({ children, className = '' }) {
  return <div className={joinClassNames('tm-sidebar-body', className)}>{children}</div>;
}

export function AppSidebarProfile({ name, subtitle, avatarText, avatarName }) {
  const style = avatarName
    ? {
        backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}&background=144bb8&color=fff")`,
      }
    : undefined;

  return (
    <div className="tm-profile-card">
      <div className="tm-profile-avatar" style={style}>{avatarText}</div>
      <div className="tm-profile-content">
        <div className="tm-profile-title">{name}</div>
        <div className="tm-profile-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}

export function AppSidebarSectionLabel({ children }) {
  return <div className="tm-sidebar-section-label">{children}</div>;
}

export function AppSidebarDivider() {
  return <div className="tm-sidebar-divider" />;
}

export function AppPageHeader({ title, subtitle, actions, badge }) {
  return (
    <div className="tm-page-header">
      <div className="tm-page-header-copy">
        <div className="tm-page-title">
          <span>{title}</span>
          {badge ?? null}
        </div>
        {subtitle ? <p className="tm-page-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="tm-page-header-actions">{actions}</div> : null}
    </div>
  );
}