/**
 * CreateFolder — the folder setup screen, reached from the dashboard's
 * "Create folder" quick action.
 *
 * The flow deliberately keeps the existing prompt: the dashboard still asks
 * for a name in the shared modal, then hands it here through the query
 * string (`/create-folder?name=...`). Arriving without a name is fine too --
 * the field simply starts empty -- so the page also works if it is opened
 * directly or reloaded.
 *
 * The name travels in the URL rather than in component state because this
 * app's router has no way to pass params between pages, and the URL survives
 * a refresh.
 *
 * Ported from a TanStack Router + Tailwind prototype. Two departures:
 *   1. Its own header, nav and footer are dropped for the shared workspace
 *      chrome.
 *   2. The prototype invented six new swatch colours. This uses the six
 *      document tints the app already has (see .dash-glyph-* in
 *      workspace-chrome.css), so a folder tag and a document chip of the
 *      same colour actually match.
 */
import { useMemo, useState } from 'react';
import './create-folder.css';
import {
  ArrowRight,
  Check,
  FolderOpen,
  FolderPlus,
  Info,
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

const MAX_NAME = 48;

// The same six tints the dashboard uses for document chips.
const COLORS = [
  { id: 'saffron', label: 'Saffron' },
  { id: 'sage', label: 'Sage' },
  { id: 'coral', label: 'Coral' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'sky', label: 'Sky' },
  { id: 'gold', label: 'Gold' },
];

const PARENTS = [
  { id: 'root', name: 'Root level', meta: 'Main directory' },
  { id: 'php', name: 'PHP Docs', meta: '4 files' },
  { id: 'legal', name: 'Legal drafts', meta: '2 files' },
  { id: 'research', name: 'Research', meta: '1 file' },
];

/** Reads the name the dashboard prompt passed through the query string. */
function nameFromUrl() {
  try {
    return (new URLSearchParams(window.location.search).get('name') ?? '').slice(0, MAX_NAME);
  } catch {
    return '';
  }
}

export default function CreateFolder() {
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
  const [color, setColor] = useState('gold');
  const [parent, setParent] = useState('root');
  const [created, setCreated] = useState(false);

  const swatch = useMemo(() => COLORS.find((c) => c.id === color) ?? COLORS[0], [color]);
  const parentLabel = PARENTS.find((p) => p.id === parent)?.name ?? 'Root level';
  const trimmedName = name.trim();

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

  const createFolder = () => {
    if (!trimmedName) return;
    setCreated(true);
    announce(`Folder "${trimmedName}" created`);
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

        <div className="folder-page">
          {/* The gradient hairline is a wrapper rather than a border so it
              can fade around the corners of the card. */}
          <div className="folder-frame">
            <section className="folder-card">
              <span className="folder-bloom" aria-hidden="true" />

              <header className="folder-card-head">
                <span className="folder-head-icon"><FolderPlus size={20} /></span>
                <div className="folder-head-copy">
                  <p className="folder-eyebrow">Workspace · Step 1 of 1</p>
                  <h1>Create folder</h1>
                  <p className="folder-head-sub">
                    Organise your documents by creating a new folder.
                  </p>
                </div>
                <button
                  type="button"
                  className="folder-close"
                  aria-label="Close and return to the dashboard"
                  onClick={() => navigate('/dashboard')}
                >
                  <X size={17} />
                </button>
              </header>

              <div className="folder-card-body">
                {/* Name */}
                <div className="folder-field">
                  <label className="folder-eyebrow" htmlFor="folder-name">Folder name</label>
                  <div className="folder-input">
                    <span className={`folder-dot dash-glyph-${color}`} aria-hidden="true" />
                    <input
                      id="folder-name"
                      value={name}
                      maxLength={MAX_NAME}
                      placeholder="e.g. PHP Research"
                      onChange={(event) => {
                        setName(event.target.value);
                        setCreated(false);
                      }}
                    />
                    <span className="folder-count">{name.length}/{MAX_NAME}</span>
                  </div>
                </div>

                {/* Colour tag */}
                <div className="folder-field">
                  <span className="folder-eyebrow">Colour tag</span>
                  <div className="folder-swatches">
                    {COLORS.map((option) => {
                      const active = option.id === color;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={option.label}
                          aria-pressed={active}
                          onClick={() => setColor(option.id)}
                          className={`folder-swatch dash-glyph-${option.id} ${active ? 'is-active' : ''}`}
                        >
                          {active && <Check size={15} strokeWidth={3} />}
                        </button>
                      );
                    })}
                    <span className="folder-swatch-name">{swatch.label}</span>
                  </div>
                </div>

                {/* Parent */}
                <div className="folder-field">
                  <span className="folder-eyebrow">Nest inside existing folder (optional)</span>
                  <div className="folder-parents">
                    {PARENTS.map((option) => {
                      const active = option.id === parent;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setParent(option.id)}
                          className={`folder-parent ${active ? 'is-active' : ''}`}
                        >
                          <FolderOpen size={19} />
                          <span className="folder-parent-name">{option.name}</span>
                          <span className="folder-parent-meta">{option.meta}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live preview of where the folder will land */}
                <div className="folder-preview">
                  <span className={`folder-dot dash-glyph-${color}`} aria-hidden="true" />
                  <p>
                    <span>Preview: </span>
                    {parentLabel} / {trimmedName || 'Untitled folder'}
                  </p>
                  <Info size={15} />
                </div>
              </div>

              <footer className="folder-card-foot">
                {created ? (
                  <button type="button" className="folder-primary" onClick={() => navigate('/documents')}>
                    <Check size={15} /> Folder created — open documents <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="folder-primary"
                    disabled={!trimmedName}
                    onClick={createFolder}
                  >
                    <FolderPlus size={15} /> Create folder
                  </button>
                )}

                <button
                  type="button"
                  className="folder-quiet"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </button>

                <p className="folder-saved">
                  Saved locally <ShieldCheck size={15} />
                </p>
              </footer>
            </section>
          </div>

          <p className="folder-tip">
            <Sparkles size={14} />
            Tip: colour tags make folders instantly scannable in your workspace.
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

      {toast && <div className="folder-toast">{toast}</div>}
    </div>
  );
}
