/**
 * CreateDocument — the new-document setup screen, reached from the
 * dashboard's "Create document" quick action.
 *
 * Same flow as the folder screen: the dashboard still prompts for a name in
 * the shared modal, then hands it here through the query string
 * (`/create-document?name=...`). Arriving without one is fine -- the field
 * starts empty -- so the page also works opened directly or reloaded. The
 * name travels in the URL because this app's router cannot pass params
 * between pages, and the URL survives a refresh.
 *
 * Ported from a TanStack Router + Tailwind prototype. Two departures:
 *   1. Its own header, nav and footer are dropped for the shared workspace
 *      chrome.
 *   2. Its Tailwind utilities and oklch palette are rebuilt as real CSS on
 *      the shared --dash-* tokens. It deliberately reuses the folder
 *      screen's card language (gold hairline, corner bloom, etched grid) so
 *      the two setup screens read as a pair.
 *
 * Confirming sends the reader into the editor, which is where "Create
 * document" always landed before this screen existed.
 */
import { useMemo, useState } from 'react';
import './create-document.css';
import {
  Check,
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { navigate } from '../router';

const MAX_NAME = 64;

const TYPES = ['Thesis', 'Research paper', 'Legal', 'Report', 'Other'];

const FOLDERS = [
  { id: 'php', name: 'PHP Docs', meta: '4 files' },
  { id: 'legal', name: 'Legal drafts', meta: '2 files' },
  { id: 'research', name: 'Research', meta: '1 file' },
  { id: 'root', name: 'Root level', meta: 'Main directory' },
];

const ANALYSES = [
  { id: 'grammar', label: 'Grammar', hint: 'Style + syntax pass' },
  { id: 'contradiction', label: 'Contradiction', hint: 'Logic conflicts' },
  { id: 'plagiarism', label: 'Plagiarism', hint: 'Source overlap' },
  { id: 'bibliography', label: 'Bibliography', hint: 'Citation integrity' },
];

/** Reads the name the dashboard prompt passed through the query string. */
function nameFromUrl() {
  try {
    return (new URLSearchParams(window.location.search).get('name') ?? '').slice(0, MAX_NAME);
  } catch {
    return '';
  }
}

export default function CreateDocument() {
  // Shared workspace chrome state, matching every other signed-in page.
  const [activeNav, setActiveNav] = useState('My documents');
  const [darkMode, setDarkMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [chromeModal, setChromeModal] = useState(null);
  const [toast, setToast] = useState('');

  // Page state. The name is seeded once, from the URL.
  const [name, setName] = useState(nameFromUrl);
  const [type, setType] = useState('Thesis');
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('php');
  const [checks, setChecks] = useState(['grammar', 'contradiction']);

  const trimmedName = name.trim();
  const folderLabel = FOLDERS.find((item) => item.id === folder)?.name ?? 'Root level';

  const visibleFolders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FOLDERS.filter((item) => item.name.toLowerCase().includes(needle));
  }, [query]);

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  const selectNav = (label) => {
    const route = workspaceRoutes[label];
    if (route) {
      navigate(route);
      return;
    }
    setActiveNav(label);
    announce(`${label} view selected`);
    setMobileSidebar(false);
  };

  const toggleCheck = (id) => {
    setChecks((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  };

  // "Create document" always ended in the editor; this screen only adds the
  // setup step in front of it.
  const createDocument = () => {
    if (!trimmedName) return;
    navigate('/editor');
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
        onPrivacyToggle={() => setPrivacyMode((current) => !current)}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((current) => !current)}
        onLogout={() => setChromeModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
      />

      <MobileDrawer
        open={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        activeNav={activeNav}
        onNavigate={selectNav}
        onPrivacyToggle={() => setPrivacyMode((current) => !current)}
        onLogout={() => setChromeModal('logout')}
      />

      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader
          search={workspaceSearch}
          onSearchChange={setWorkspaceSearch}
          onAnnounce={announce}
        />

        <div className="newdoc-page">
          {/* The gradient hairline is a wrapper rather than a border so it can
              fade around the corners, as on the folder screen. */}
          <div className="newdoc-frame">
            <section className="newdoc-card">
              <span className="newdoc-bloom" aria-hidden="true" />

              <header className="newdoc-card-head">
                <span className="newdoc-head-icon"><FileText size={20} /></span>
                <div className="newdoc-head-copy">
                  <p className="newdoc-eyebrow">New document · Setup</p>
                  <h1>Customise your experience</h1>
                  <p className="newdoc-head-sub">
                    Set up your new document before opening the editor.
                  </p>
                </div>
                <button
                  type="button"
                  className="newdoc-close"
                  aria-label="Close and return to the dashboard"
                  onClick={() => navigate('/dashboard')}
                >
                  <X size={17} />
                </button>
              </header>

              <div className="newdoc-card-body">
                {/* Name */}
                <div className="newdoc-field">
                  <label className="newdoc-eyebrow" htmlFor="newdoc-name">Document name</label>
                  <div className="newdoc-input">
                    <FileText size={16} />
                    <input
                      id="newdoc-name"
                      value={name}
                      maxLength={MAX_NAME}
                      placeholder="e.g. Thesis Chapter A"
                      onChange={(event) => setName(event.target.value)}
                    />
                    <span className="newdoc-count">{name.length}/{MAX_NAME}</span>
                  </div>
                </div>

                {/* Type */}
                <div className="newdoc-field">
                  <span className="newdoc-eyebrow">Document type</span>
                  <div className="newdoc-types">
                    {TYPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={option === type}
                        onClick={() => setType(option)}
                        className={`newdoc-type ${option === type ? 'is-active' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destination folder */}
                <div className="newdoc-field">
                  <label className="newdoc-eyebrow" htmlFor="newdoc-folder-search">
                    Save to folder
                  </label>
                  <div className="newdoc-input">
                    <Search size={16} />
                    <input
                      id="newdoc-folder-search"
                      type="search"
                      value={query}
                      placeholder="Search or select a folder…"
                      onChange={(event) => setQuery(event.target.value)}
                    />
                  </div>

                  <div className="newdoc-folders">
                    {visibleFolders.length === 0 ? (
                      <p className="newdoc-empty">No folders match “{query.trim()}”.</p>
                    ) : (
                      visibleFolders.map((option) => {
                        const active = option.id === folder;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setFolder(option.id)}
                            className={`newdoc-folder ${active ? 'is-active' : ''}`}
                          >
                            <span className="newdoc-folder-dot" aria-hidden="true" />
                            <span className="newdoc-folder-copy">
                              <span className="newdoc-folder-name">{option.name}</span>
                              <span className="newdoc-folder-meta">{option.meta}</span>
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Analysis toggles */}
                <div className="newdoc-field">
                  <span className="newdoc-eyebrow">Run DDIE analysis on open</span>
                  <div className="newdoc-checks">
                    {ANALYSES.map((option) => {
                      const on = checks.includes(option.id);
                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="switch"
                          aria-checked={on}
                          onClick={() => toggleCheck(option.id)}
                          className={`newdoc-check ${on ? 'is-on' : ''}`}
                        >
                          <span className="newdoc-check-box">
                            {on && <Check size={13} strokeWidth={3.2} />}
                          </span>
                          <span className="newdoc-check-copy">
                            <span className="newdoc-check-label">{option.label}</span>
                            <span className="newdoc-check-hint">{option.hint}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live preview of what will be created */}
                <div className="newdoc-preview">
                  <span className="newdoc-preview-dot" aria-hidden="true" />
                  <p>
                    <span>Preview: </span>
                    {folderLabel} / {trimmedName || 'Untitled document'} · {type} ·{' '}
                    {checks.length} check{checks.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <footer className="newdoc-card-foot">
                <button
                  type="button"
                  className="newdoc-primary"
                  disabled={!trimmedName}
                  onClick={createDocument}
                >
                  <Plus size={15} strokeWidth={2.6} /> Create document
                </button>

                <button
                  type="button"
                  className="newdoc-quiet"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>

                <p className="newdoc-saved">
                  Saved locally <ShieldCheck size={15} />
                </p>
              </footer>
            </section>
          </div>

          <p className="newdoc-tip">
            <Sparkles size={14} />
            Tip: fewer checks on open means a faster first render of large drafts.
          </p>
        </div>
      </main>

      <WorkspaceModal
        mode={chromeModal}
        initialValue=""
        onClose={() => setChromeModal(null)}
        onSubmit={() => setChromeModal(null)}
        onLogout={() => {
          setChromeModal(null);
          navigate('/login');
        }}
      />

      {toast && <div className="newdoc-toast">{toast}</div>}
    </div>
  );
}
