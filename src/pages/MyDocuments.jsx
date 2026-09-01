/**
 * MyDocuments — the private library, served at the `/documents` route.
 *
 * Built from the design screenshot (my-document.png) rather than ported from
 * prototype source — unlike the dashboard, no TSX original exists for this
 * page. It follows the same conventions as Dashboard.jsx: plain JSX, the
 * shared shell from components/WorkspaceChrome.jsx, hand-written `docs-*`
 * classes in my-documents.css, and the project palette throughout.
 *
 * The page: an editor-style tab strip, the "My Documents" heading with a New
 * Document action, a library-wide search, category filter chips, four stat
 * tiles, and a card grid of documents (colour-tinted preview, title, meta,
 * tag chips).
 *
 * Front-end only: documents live in component state and reset on reload.
 * Swap `startingDocuments` and the handlers for API calls when a backend
 * exists.
 */
/**
 * MyDocuments — the private library, served at the `/documents` route.
 *
 * Integrated with the shared ThemeContext for synchronized Light/Dark mode switching.
 */
import { useEffect, useMemo, useState } from 'react';
import './my-documents.css';
import {
  FileText,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';

/* ==========================================================================
   Content data
   ========================================================================== */

const tabs = ['Home', 'Insert', 'References', 'AI Tools'];

const categories = ['All', 'Academic', 'Legal', 'Researcher', 'Corporate', 'Draft'];

const startingDocuments = [
  {
    id: 1, title: 'FYP Phase 1 Report', type: 'DOCX', modified: 'today, 9:42 am', pages: 20,
    tint: 'saffron', category: 'Academic',
    tags: [{ label: '2 contradictions', tone: 'issue' }, { label: '1 gap', tone: 'warn' }],
  },
  {
    id: 2, title: 'Research Proposal v3', type: 'PDF', modified: 'yesterday, 4:18 pm', pages: 30,
    tint: 'sage', category: 'Researcher',
    tags: [{ label: 'Clean', tone: 'good' }, { label: 'APA', tone: 'info' }],
  },
  {
    id: 3, title: 'NDA-DataRopes.ai', type: 'DOCX', modified: 'jun 14, 2024', pages: 47,
    tint: 'coral', category: 'Legal',
    tags: [{ label: 'Legal', tone: 'info' }, { label: 'Verified', tone: 'good' }],
  },
  {
    id: 4, title: 'Literature Review Draft', type: 'PDF', modified: 'jun 11, 2024', pages: 50,
    tint: 'lavender', category: 'Academic',
    tags: [{ label: 'Self plagiarism', tone: 'warn' }],
  },
  {
    id: 5, title: 'Research_notes_final', type: 'DOCX', modified: 'jun 05, 2024', pages: 12,
    tint: 'sky', category: 'Researcher',
    tags: [{ label: 'Done', tone: 'good' }],
  },
  {
    id: 6, title: 'Opening_scene_v2', type: 'DOCX', modified: 'may 29, 2024', pages: 8,
    tint: 'gold', category: 'Draft',
    tags: [{ label: 'In progress', tone: 'warn' }],
  },
];

const stats = [
  { icon: FileText, value: '12', label: 'Total Documents', tone: 'cream' },
  { icon: Pencil, value: '3', label: 'Drafts in progress', tone: 'lavender' },
  { icon: TriangleAlert, value: '7', label: 'Issues found', tone: 'peach' },
  { icon: LockKeyhole, value: 'AES-256', label: 'All docs encrypted', tone: 'sky' },
];

/* ==========================================================================
   Pieces
   ========================================================================== */

function DocumentCard({ doc, onOpen }) {
  return (
    <button type="button" onClick={onOpen} className="docs-card dash-lift">
      <span className={`docs-preview docs-preview-${doc.tint}`}>
        <span className="docs-preview-lines" aria-hidden="true">
          <span /><span /><span />
        </span>
        <span className="docs-preview-icon"><FileText size={22} strokeWidth={2} /></span>
        <span className="docs-preview-type">{doc.type}</span>
      </span>
      <span className="docs-card-body">
        <span className="docs-card-title dash-serif">{doc.title}</span>
        <span className="docs-card-meta">Modified {doc.modified} · {doc.pages} pages</span>
        <span className="docs-tags">
          {doc.tags.map((tag) => (
            <span key={tag.label} className={`docs-tag docs-tag-${tag.tone}`}>{tag.label}</span>
          ))}
        </span>
      </span>
    </button>
  );
}

/* ==========================================================================
   The page
   ========================================================================== */
function MyDocuments() {
  // Global Shared Theme Context
  const { darkMode, toggleDarkMode } = useTheme();

  const [activeNav, setActiveNav] = useState('My documents');
  const [activeTab, setActiveTab] = useState('Home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [search, setSearch] = useState('');
  const [documents, setDocuments] = useState(startingDocuments);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredDocuments = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return documents.filter((doc) => {
      if (activeCategory !== 'All' && doc.category !== activeCategory) return false;
      if (!normalized) return true;
      const haystack = `${doc.title} ${doc.type} ${doc.category} ${doc.tags.map((tag) => tag.label).join(' ')}`;
      return haystack.toLowerCase().includes(normalized);
    });
  }, [documents, search, activeCategory]);

  const announce = (message) => setToast(message);

  const selectNav = (label) => {
    const route = workspaceRoutes[label];
    if (route && label !== 'My documents') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Features') return navigate('/features');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Help and Guide') return navigate('/help');
    if (label === 'Storage') return navigate('/storage');
    if (label === 'Share Document') return navigate('/share');

    setActiveNav(label);
    if (label !== 'My documents') announce(`${label} view selected`);
    setMobileSidebar(false);
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab !== 'Home') announce(`${tab} view selected`);
  };

  const submitModal = (value) => {
    const newDocument = {
      id: Date.now(),
      title: value,
      type: 'DOCX',
      modified: 'just now',
      pages: 1,
      tint: 'gold',
      category: 'Draft',
      tags: [{ label: 'In progress', tone: 'warn' }],
    };
    setDocuments((current) => [newDocument, ...current]);
    setModal(null);
    announce('New document created');
  };

  const handleLogout = () => {
    setModal(null);
    navigate('/');
  };

  return (
    <div className={`dash-shell ${darkMode ? 'dash-dark' : ''}`}>
      <MobileTopbar
        onMenu={() => setMobileSidebar(true)}
        onThemeToggle={toggleDarkMode}
        darkMode={darkMode}
      />

      <Sidebar
        activeNav={activeNav}
        onNavigate={selectNav}
        privacyMode={privacyMode}
        onPrivacyToggle={() => {
          setPrivacyMode((prev) => !prev);
          announce(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
        }}
        darkMode={darkMode}
        onThemeToggle={toggleDarkMode}
        onLogout={() => setModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <MobileDrawer
        open={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        activeNav={activeNav}
        onNavigate={selectNav}
        onPrivacyToggle={() => setPrivacyMode((prev) => !prev)}
        onLogout={() => setModal('logout')}
      />

      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader search={search} onSearchChange={setSearch} onAnnounce={announce} />

        <div className="dash-body">
          {/* Editor-style tab strip */}
          <div className="docs-tabs-row dash-rise dash-d1">
            <div className="docs-tabs" role="tablist" aria-label="Document tools">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => selectTab(tab)}
                  className={`docs-tab ${activeTab === tab ? 'is-active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => announce('Profile menu is ready')}
              className="docs-tabs-avatar"
              aria-label="Your profile"
            >
              <UserRound size={17} strokeWidth={2.2} />
            </button>
          </div>

          {/* Heading + New Document */}
          <div className="docs-title-row dash-rise dash-d2">
            <div>
              <p className="docs-kicker">Your private library</p>
              <h1 className="docs-title dash-serif">My Documents</h1>
            </div>
            <button type="button" onClick={() => setModal('document')} className="docs-new-btn">
              <Plus size={15} strokeWidth={2.4} /> New Document
            </button>
          </div>

          {/* Library search */}
          <label className="docs-search dash-rise dash-d2">
            <span className="dash-sr">Search documents</span>
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documents by title, tag, or content"
            />
          </label>

          {/* Category chips */}
          <div className="docs-chips dash-rise dash-d3" role="group" aria-label="Filter by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`docs-chip ${activeCategory === category ? 'is-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Stat tiles */}
          <div className="docs-stats dash-rise dash-d3">
            {stats.map(({ icon: Icon, value, label, tone }) => (
              <div key={label} className={`docs-stat docs-stat-${tone}`}>
                <Icon size={17} strokeWidth={1.9} className="docs-stat-icon" />
                <strong className="docs-stat-value">{value}</strong>
                <span className="docs-stat-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Document card grid */}
          {filteredDocuments.length > 0 ? (
            <div className="docs-grid dash-rise dash-d4">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onOpen={() => navigate('/editor')}
                />
              ))}
            </div>
          ) : (
            <div className="docs-empty dash-rise dash-d4">
              <Search size={22} />
              <p>Nothing here matches{search ? ` "${search}"` : ' that filter'}</p>
              <button type="button" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                Clear search and filters
              </button>
            </div>
          )}
        </div>
      </main>

      <WorkspaceModal
        key={String(modal)}
        mode={modal}
        initialValue=""
        onClose={() => setModal(null)}
        onSubmit={submitModal}
        onLogout={handleLogout}
      />

      {toast && <div className="dash-toast" role="status">{toast}</div>}
    </div>
  );
}

export default MyDocuments;