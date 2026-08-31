/**
 * Dashboard — the signed-in workspace, served at the `/dashboard` route.
 *
 * Ported from the Replit prototype (TypeScript + Tailwind + shadcn). Three
 * things changed in the move, all for consistency with this project:
 *   - TypeScript annotations removed; this codebase is plain JSX.
 *   - wouter/react-query/Toaster dropped. The prototype wrapped the page in
 *     them but never used them: routing is handled by router.js, and the
 *     toast below is local state.
 *   - Tailwind utility classes replaced by the hand-written `dash-*` classes
 *     in dashboard.css, since this project vendors only the subset of
 *     Tailwind the landing page needed.
 *
 * Everything here is front-end only. Documents live in component state, so
 * edits and uploads vanish on reload — swap `startingDocuments` and the
 * handlers for real API calls when there is a backend.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import './dashboard.css';
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Cloud,
  CloudOff,
  FilePenLine,
  FileText,
  Files,
  FolderPlus,
  Grid2X2,
  History,
  House,
  Lightbulb,
  ListFilter,
  LockKeyhole,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  UsersRound,
  X,
} from 'lucide-react';
import { navigate } from '../router';

/* ==========================================================================
   Content data
   ========================================================================== */

const navPrimary = [
  { label: 'Dashboard', icon: House },
  { label: 'My documents', icon: Files },
  { label: 'Editor', icon: FilePenLine },
  { label: 'Version history', icon: History, badge: '3' },
  { label: 'Subscription', icon: Sparkles },
  { label: 'Features', icon: Grid2X2 },
];

// "Privacy mode" is handled specially below: it toggles a switch rather than
// navigating anywhere.
const navWorkspace = [
  { label: 'Privacy mode', icon: ShieldCheck },
  { label: 'Settings', icon: Settings },
  { label: 'Help and guide', icon: CircleHelp },
  { label: 'Storage', icon: Cloud },
  { label: 'Shared documents', icon: UsersRound },
];

// Seed data. `color` picks a file-chip tint (see .dash-glyph-* in the CSS).
const startingDocuments = [
  { id: 1, title: 'Thesis_Chapter_3', type: 'DOCX', edited: 'Today, 9:42 AM', pages: 20, status: 'In progress', color: 'saffron' },
  { id: 2, title: 'FYP_phase_01', type: 'PDF', edited: 'Yesterday, 4:18 PM', pages: 30, status: 'Done', color: 'sage' },
  { id: 3, title: 'Methodology_section', type: 'DOCX', edited: 'Jun 14, 2024', pages: 47, status: 'In progress', color: 'coral' },
  { id: 4, title: 'Annual_Report_2024', type: 'PDF', edited: 'Jun 11, 2024', pages: 50, status: 'Backlog', color: 'lavender' },
  { id: 5, title: 'Research_notes_final', type: 'DOCX', edited: 'Jun 05, 2024', pages: 12, status: 'Done', color: 'sky' },
  { id: 6, title: 'Opening_scene_v2', type: 'DOCX', edited: 'May 29, 2024', pages: 8, status: 'In progress', color: 'gold' },
];

const statusClass = {
  Done: 'dash-status-done',
  'In progress': 'dash-status-progress',
  Backlog: 'dash-status-backlog',
};

/* ==========================================================================
   Pieces
   ========================================================================== */

// Brand lockup. `compact` drops the wordmark for the collapsed sidebar.
function LogoMark({ compact = false }) {
  return (
    <div className="dash-logo">
      <span className="dash-logo-mark"><FileText size={19} strokeWidth={2.2} /></span>
      {!compact && (
        <span>
          <span className="dash-logo-word">Docu<em>Mend</em></span>
          <span className="dash-logo-tag">write with clarity</span>
        </span>
      )}
    </div>
  );
}

/**
 * One sidebar row. Renders either a badge or a caller-supplied `trailing`
 * element (the privacy switch) on the right — never both.
 */
function NavButton({ item, active, onClick, trailing, collapsed = false }) {
  const Icon = item.icon;
  const badge = item.badge ? <span className="dash-nav-badge">{item.badge}</span> : null;
  return (
    <button
      type="button"
      onClick={onClick}
      // When collapsed the label is gone, so it has to survive as a tooltip
      // and an accessible name.
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={`dash-nav-item ${active ? 'is-active' : ''}`}
    >
      <span><Icon size={15} strokeWidth={active ? 2.4 : 1.8} />{!collapsed && item.label}</span>
      {!collapsed && (trailing ?? badge)}
    </button>
  );
}

function Sidebar({
  activeNav,
  onNavigate,
  privacyMode,
  onPrivacyToggle,
  darkMode,
  onThemeToggle,
  onLogout,
  collapsed,
  onToggleCollapse,
}) {
  return (
    <aside className={`dash-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
      <div className="dash-sidebar-head">
        <LogoMark compact={collapsed} />
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="dash-collapse-btn"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="dash-nav" aria-label="Primary navigation">
        {!collapsed && <p className="dash-nav-label">Your workspace</p>}
        {navPrimary.map((item) => (
          <NavButton
            key={item.label}
            item={item}
            active={activeNav === item.label}
            onClick={() => onNavigate(item.label)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <nav className="dash-nav dash-nav-secondary" aria-label="Workspace settings">
        {navWorkspace.map((item) => {
          const isPrivacy = item.label === 'Privacy mode';
          return (
            <NavButton
              key={item.label}
              item={item}
              active={activeNav === item.label}
              onClick={() => (isPrivacy ? onPrivacyToggle() : onNavigate(item.label))}
              collapsed={collapsed}
              trailing={isPrivacy ? (
                <span
                  className={`dash-switch ${privacyMode ? 'is-on' : ''}`}
                  role="img"
                  aria-label={privacyMode ? 'Privacy mode on' : 'Privacy mode off'}
                />
              ) : undefined}
            />
          );
        })}
      </nav>

      <div className="dash-sidebar-foot">
        <button
          type="button"
          onClick={onThemeToggle}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={collapsed ? (darkMode ? 'Light mode' : 'Dark mode') : undefined}
          className="dash-theme-btn"
        >
          <span>{darkMode ? <Moon size={15} /> : <Sun size={15} />}{!collapsed && (darkMode ? 'Dark mode' : 'Light mode')}</span>
          {!collapsed && <span className={`dash-switch ${darkMode ? 'is-on' : ''}`} />}
        </button>
        <button type="button" onClick={onLogout} className="dash-logout" title={collapsed ? 'Log out' : undefined}>
          <LogOut size={14} /> {!collapsed && 'Log out'}
        </button>
        {!collapsed && <p className="dash-sidebar-note">Private by default. Your words stay yours.</p>}
      </div>
    </aside>
  );
}

// Shown in place of the sidebar below 768px.
function MobileTopbar({ onMenu, onThemeToggle, darkMode }) {
  return (
    <div className="dash-topbar">
      <button type="button" onClick={onMenu} aria-label="Open menu"><Menu size={20} /></button>
      <LogoMark />
      <button type="button" onClick={onThemeToggle} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
        {darkMode ? <Moon size={18} /> : <Sun size={18} />}
      </button>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  return (
    <label className="dash-search">
      <span className="dash-sr">Search documents</span>
      <Search size={16} />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search your workspace"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="dash-search-clear" aria-label="Clear search">
          <X size={14} />
        </button>
      )}
    </label>
  );
}

/**
 * One of the four coloured tiles. `onDrop` is only passed to the upload tile,
 * which doubles as a drop target — hence `onDragOver` preventing the default,
 * without which the browser would open the dropped file instead.
 */
function QuickAction({ icon: Icon, title, description, tone, onClick, onDrop }) {
  return (
    <button
      type="button"
      onClick={onClick}
      onDrop={onDrop}
      onDragOver={(event) => event.preventDefault()}
      className={`dash-quick dash-quick-${tone}`}
    >
      <span className="dash-quick-icon"><Icon size={17} strokeWidth={1.8} /></span>
      <span>
        <span className="dash-quick-title">{title}</span>
        <span className="dash-quick-desc">{description}</span>
      </span>
      <span className="dash-quick-go"><ArrowUpRight size={13} /></span>
    </button>
  );
}

/**
 * Donut showing overall completion. The ring is an SVG circle drawn with a
 * dash pattern: circumference is 2*pi*47 ~= 295, and leaving 85.5 undrawn
 * lands at about 71%. The figures are static placeholders.
 */
function ProjectSummary() {
  return (
    <section className="dash-summary">
      <div className="dash-summary-head">
        <div>
          <p className="dash-eyebrow">This month</p>
          <h2 className="dash-card-title dash-serif">Project completion</h2>
        </div>
        <button type="button" className="dash-ghost-btn" aria-label="Filter project summary"><MoreHorizontal size={17} /></button>
      </div>

      <div className="dash-summary-body">
        <div className="dash-ring">
          <svg viewBox="0 0 128 128" role="img" aria-label="Project completion: 71 percent overall">
            <circle className="dash-ring-track" cx="64" cy="64" r="47" fill="none" strokeWidth="12" />
            <circle className="dash-ring-fill" cx="64" cy="64" r="47" fill="none" strokeWidth="12" strokeLinecap="round" strokeDasharray="295" strokeDashoffset="85.5" />
          </svg>
          <div className="dash-ring-centre">
            <span className="dash-ring-value dash-serif">71%</span>
            <span className="dash-ring-label">overall</span>
          </div>
        </div>

        <div className="dash-legend">
          <div className="dash-legend-row"><span className="dash-swatch dash-swatch-done" />Project done<strong>08</strong></div>
          <div className="dash-legend-row"><span className="dash-swatch dash-swatch-progress" />In progress<strong>05</strong></div>
          <div className="dash-legend-row"><span className="dash-swatch dash-swatch-backlog" />Backlog<strong>02</strong></div>
        </div>
      </div>

      <p className="dash-summary-foot"><Lightbulb size={13} /> A steady 18% ahead of last month</p>
    </section>
  );
}

function DocumentRow({ doc, selected, onSelect, onOpen }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(); } }}
      className={`dash-row ${selected ? 'is-selected' : ''}`}
    >
      <div className="dash-row-main">
        <span className={`dash-glyph dash-glyph-${doc.color}`}><FileText size={17} strokeWidth={2} /></span>
        <div style={{ minWidth: 0 }}>
          <p className="dash-row-title">{doc.title}</p>
          <p className="dash-row-meta">Edited {doc.edited} · {doc.pages} pages</p>
        </div>
      </div>
      <div className="dash-row-side">
        <span className={`dash-status ${statusClass[doc.status]}`}>{doc.status}</span>
        {/* stopPropagation so opening doesn't also re-trigger row selection. */}
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); onOpen(); }}
          className="dash-row-open"
          aria-label={`Open ${doc.title}`}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>
    </div>
  );
}

/**
 * One dialog serving three jobs, chosen by `mode`: naming a document, naming
 * a folder, or confirming logout. Returns null when closed.
 */
function Modal({ mode, initialValue, onClose, onSubmit, onLogout }) {
  // Seeded once per mount. The caller gives this component a `key` derived
  // from the mode and the draft name, so reopening it for a different
  // document remounts it and re-seeds the field -- no syncing effect needed.
  const [value, setValue] = useState(initialValue);

  if (!mode) return null;

  const isLogout = mode === 'logout';
  const isFolder = mode === 'folder';
  const title = isLogout
    ? 'Take a quiet exit?'
    : isFolder
      ? 'Create a new folder'
      : initialValue ? 'Rename document' : 'Start a new document';

  const submit = (event) => {
    event.preventDefault();
    if (isLogout) onLogout();
    else if (value.trim()) onSubmit(value.trim());
  };

  return (
    // Closes on backdrop click only -- the guard stops a drag that ends
    // outside the panel from dismissing it.
    <div
      className="dash-modal-backdrop"
      onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}
    >
      <div className="dash-modal" role="dialog" aria-modal="true" aria-labelledby="dash-modal-title">
        <div className="dash-modal-head">
          <div>
            <p className="dash-modal-kicker">{isLogout ? 'Session' : 'Workspace'}</p>
            <h2 id="dash-modal-title" className="dash-modal-title dash-serif">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="dash-modal-close" aria-label="Close dialog"><X size={17} /></button>
        </div>

        {isLogout ? (
          <form onSubmit={submit}>
            <p className="dash-modal-text">Your drafts are safely tucked away. You can return whenever the next sentence finds you.</p>
            <div className="dash-modal-actions">
              <button type="button" onClick={onClose} className="dash-btn-quiet">Stay here</button>
              <button type="submit" className="dash-btn-dark">Log out</button>
            </div>
          </form>
        ) : (
          <form onSubmit={submit}>
            <label className="dash-modal-label" htmlFor="dash-modal-input">{isFolder ? 'Folder name' : 'Document name'}</label>
            <input
              id="dash-modal-input"
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={isFolder ? 'e.g. Research & references' : 'e.g. The shape of an idea'}
              className="dash-modal-input"
            />
            <div className="dash-modal-actions">
              <button type="button" onClick={onClose} className="dash-btn-quiet">Cancel</button>
              <button type="submit" className="dash-btn-primary">
                {initialValue ? 'Save changes' : isFolder ? 'Create folder' : 'Create document'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   The page
   ========================================================================== */
function Dashboard() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState(startingDocuments);
  const [selectedId, setSelectedId] = useState(1);
  const [modal, setModal] = useState(null);      // 'document' | 'folder' | 'logout' | null
  const [editingId, setEditingId] = useState(null);
  const [draftValue, setDraftValue] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  // Toasts clear themselves. The cleanup matters: without it, a new message
  // arriving mid-countdown would be wiped early by the previous timer.
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Collapsed to four rows until "View all" is pressed.
  const filteredDocuments = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    const matching = normalized
      ? documents.filter((doc) => `${doc.title} ${doc.type} ${doc.status}`.toLowerCase().includes(normalized))
      : documents;
    return showAll ? matching : matching.slice(0, 4);
  }, [documents, search, showAll]);

  const announce = (message) => setToast(message);

  // Sidebar navigation is cosmetic for now: it highlights the row and says so.
  // Point these at real routes as the pages are built.
  const selectNav = (label) => {
    setActiveNav(label);
    if (label !== 'Dashboard') announce(`${label} view selected`);
    setMobileSidebar(false);
  };

  const openNewDocument = () => {
    setEditingId(null);
    setDraftValue('');
    setModal('document');
  };

  const openEditDocument = (id) => {
    const targetId = id ?? selectedId ?? documents[0]?.id;
    const target = documents.find((doc) => doc.id === targetId);
    if (!target) return;
    setSelectedId(target.id);
    setEditingId(target.id);
    setDraftValue(target.title);
    setModal('document');
  };

  const submitModal = (value) => {
    if (modal === 'folder') {
      announce(`Folder "${value}" created`);
    } else if (editingId) {
      setDocuments((current) => current.map((doc) => (
        doc.id === editingId ? { ...doc, title: value, edited: 'Just now' } : doc
      )));
      announce('Document name updated');
    } else {
      const newDocument = { id: Date.now(), title: value, type: 'DOCX', edited: 'Just now', pages: 1, status: 'In progress', color: 'gold' };
      setDocuments((current) => [newDocument, ...current]);
      setSelectedId(newDocument.id);
      announce('New document created');
    }
    setModal(null);
  };

  // Shared by the file picker and the drop target.
  const handleFiles = (files) => {
    const file = files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.[^/.]+$/, '') || 'Untitled document';
    const newDocument = {
      id: Date.now(),
      title: name,
      type: file.name.split('.').pop()?.toUpperCase() ?? 'DOC',
      edited: 'Just now',
      pages: 1,
      status: 'In progress',
      color: 'sky',
    };
    setDocuments((current) => [newDocument, ...current]);
    setSelectedId(newDocument.id);
    announce(`${file.name} uploaded`);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const handleLogout = () => {
    setModal(null);
    navigate('/');
  };

  return (
    <div className={`dash-shell ${darkMode ? 'dash-dark' : ''}`}>
      <MobileTopbar
        onMenu={() => setMobileSidebar(true)}
        onThemeToggle={() => setDarkMode((current) => !current)}
        darkMode={darkMode}
      />

      <Sidebar
        activeNav={activeNav}
        onNavigate={selectNav}
        privacyMode={privacyMode}
        onPrivacyToggle={() => {
          setPrivacyMode((current) => !current);
          announce(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
        }}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((current) => !current)}
        onLogout={() => setModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      {/* Mobile drawer. The inner stopPropagation keeps clicks inside the
          panel from reaching the backdrop's close handler. */}
      {mobileSidebar && (
        <div className="dash-drawer" onMouseDown={() => setMobileSidebar(false)}>
          <div className="dash-drawer-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div className="dash-drawer-head">
              <LogoMark />
              <button type="button" onClick={() => setMobileSidebar(false)} aria-label="Close menu"><X size={18} /></button>
            </div>
            <nav className="dash-nav" aria-label="Mobile navigation">
              {[...navPrimary, ...navWorkspace].map((item) => (
                <NavButton
                  key={item.label}
                  item={item}
                  active={activeNav === item.label}
                  onClick={() => (item.label === 'Privacy mode'
                    ? setPrivacyMode((current) => !current)
                    : selectNav(item.label))}
                />
              ))}
            </nav>
            <button type="button" onClick={() => setModal('logout')} className="dash-logout">
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      )}

      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <header className="dash-header dash-soft">
          <div className="dash-saved"><span className="dash-dot" /> All changes saved</div>
          <SearchBar value={search} onChange={setSearch} />
          <div className="dash-header-actions">
            <button type="button" onClick={() => announce('You are all caught up')} className="dash-icon-btn" aria-label="Notifications">
              <Bell size={17} strokeWidth={1.8} /><span className="dash-pip" />
            </button>
            <span className="dash-divider" />
            <button type="button" onClick={() => announce('Profile menu is ready')} className="dash-profile">
              <span className="dash-avatar">MH</span>
              <span className="dash-profile-text">
                <span className="dash-profile-name">Mahnoor</span>
                <span className="dash-profile-role">Personal workspace</span>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="dash-body">
          {/* Greeting */}
          <div className="dash-greeting dash-rise dash-d1">
            <div>
              <p className="dash-date">Tuesday, June 18, 2024</p>
              <h1 className="dash-title dash-serif">Hello, Mahnoor<em>.</em></h1>
              <p className="dash-subtitle">Welcome back. Your ideas are safe here — ready when you are.</p>
            </div>
            <div className="dash-privacy-pill">
              <LockKeyhole size={13} className={privacyMode ? 'dash-privacy-on' : 'dash-privacy-off'} />
              {privacyMode ? 'Privacy mode is on' : 'Privacy mode is paused'}
            </div>
          </div>

          {/* Quick actions + completion donut */}
          <div className="dash-grid-top">
            <section className="dash-desk dash-rise dash-d2">
              <div className="dash-desk-head">
                <div>
                  <p className="dash-eyebrow">Your desk</p>
                  <h2 className="dash-card-title dash-serif">Make something good.</h2>
                </div>
                <button type="button" onClick={() => announce('Quick actions are ready')} className="dash-ghost-btn" aria-label="More quick actions">
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <div className="dash-quick-row">
                <QuickAction icon={Plus} title="Create document" description="Begin with a blank page" tone="gold" onClick={openNewDocument} />
                <QuickAction icon={Upload} title="Upload / drop" description="Bring in a document" tone="green" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} />
                <QuickAction icon={FolderPlus} title="Create folder" description="Keep thoughts together" tone="plum" onClick={() => { setDraftValue(''); setModal('folder'); }} />
                <QuickAction icon={Pencil} title="Edit document" description="Continue where you left off" tone="coral" onClick={() => openEditDocument()} />
              </div>

              {/* Hidden picker driven by the "Upload / drop" tile. */}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".doc,.docx,.pdf,.txt,.rtf"
                onChange={(event) => handleFiles(event.target.files)}
              />

              <div className="dash-desk-foot">
                <span><Cloud size={14} /> Synced just now</span>
                <span>2.4 GB of 10 GB used</span>
              </div>
            </section>

            <div className="dash-rise dash-d3"><ProjectSummary /></div>
          </div>

          {/* Recent uploads */}
          <section className="dash-card dash-uploads dash-rise dash-d4">
            <div className="dash-uploads-head">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 className="dash-card-title dash-serif">Recent uploads</h2>
                  <span className="dash-count">{documents.length}</span>
                </div>
                <p className="dash-uploads-sub">The pages you touched most recently.</p>
              </div>
              <div className="dash-uploads-tools">
                <button type="button" onClick={() => announce('Filters are available from search')} className="dash-tool-btn">
                  <ListFilter size={14} /> Filter
                </button>
                <button type="button" onClick={() => setShowAll((current) => !current)} className="dash-tool-btn dash-tool-accent">
                  {showAll ? 'Show less' : 'View all'}
                  <ChevronRight size={14} className={`dash-chevron ${showAll ? 'is-open' : ''}`} />
                </button>
              </div>
            </div>

            {filteredDocuments.length > 0 ? (
              <div className="dash-rows">
                {filteredDocuments.map((doc) => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    selected={selectedId === doc.id}
                    onSelect={() => setSelectedId(doc.id)}
                    onOpen={() => openEditDocument(doc.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <Search size={22} />
                <p>No pages match "{search}"</p>
                <button type="button" onClick={() => setSearch('')}>Clear search</button>
              </div>
            )}
          </section>

          {/* Writing nudge + storage */}
          <section className="dash-grid-bottom">
            <div className="dash-note dash-lift">
              <div className="dash-note-head">
                <div>
                  <p className="dash-eyebrow">A small nudge</p>
                  <h2 className="dash-card-title dash-serif">Leave room for the rough draft.</h2>
                </div>
                <BookOpen size={20} />
              </div>
              <p>Good writing rarely arrives polished. Give today&apos;s thought a place to land, then let tomorrow help you shape it.</p>
              <button type="button" onClick={openNewDocument} className="dash-link-btn">
                Open a blank page <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="dash-storage dash-lift">
              <div className="dash-storage-head">
                <p className="dash-eyebrow">Storage</p>
                <CloudOff size={17} />
              </div>
              <div className="dash-storage-figures">
                <span className="dash-storage-value dash-serif">24<span>%</span></span>
                <span className="dash-storage-used">2.4 / 10 GB</span>
              </div>
              {/* Keep this width in step with the percentage above. */}
              <div className="dash-meter"><span style={{ width: '24%' }} /></div>
              <button type="button" onClick={() => selectNav('Storage')} className="dash-link-btn">
                Manage storage <ChevronRight size={13} />
              </button>
            </div>
          </section>
        </div>
      </main>

      <Modal
        key={`${modal}-${draftValue}`}
        mode={modal}
        initialValue={draftValue}
        onClose={() => setModal(null)}
        onSubmit={submitModal}
        onLogout={handleLogout}
      />

      {toast && <div className="dash-toast" role="status">{toast}</div>}
    </div>
  );
}

export default Dashboard;
