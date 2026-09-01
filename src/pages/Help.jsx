import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Command,
  Compass,
  Cpu,
  ExternalLink,
  FileCheck,
  FileQuestion,
  FileText,
  HardDrive,
  HelpCircle,
  Key,
  Keyboard,
  Layers,
  Lock,
  MessageSquare,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
  X,
  Zap,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';
import './help.css';

const helpSections = [
  {
    id: 'odie',
    title: 'ODIE Engine & AI Analysis',
    icon: Cpu,
    tone: 'mint',
    description: 'Learn how local WebAssembly heuristics detect contradictions and repair draft logic.',
    articles: [
      {
        id: 'contradiction-how',
        title: 'How does contradiction detection work?',
        time: '3 min read',
        tag: 'Core Heuristics',
        content:
          'The ODIE WebAssembly engine runs directly in your browser. It builds an Abstract Syntax Tree (AST) of all propositions across every section and compares logical assertions. If Section 1.2 claims a dataset of 5,000 samples and Section 3.2 mentions 3,200 samples, the engine flags a semantic conflict with < 50ms latency.',
      },
      {
        id: 'what-is-wasm-engine',
        title: 'What is the ODIE WASM engine?',
        time: '4 min read',
        tag: 'Architecture',
        content:
          'ODIE is a high-performance compiled WebAssembly module that executes purely on client hardware. It ensures that zero document tokens, sentences, or paragraphs are uploaded to third-party cloud servers during baseline editing and syntax repair.',
      },
      {
        id: 'self-healing-apply',
        title: 'How to apply a self-healing repair suggestion?',
        time: '2 min read',
        tag: 'Workflow',
        content:
          'When ODIE identifies broken phrasing, mismatched citations, or heading misalignments, a golden pill appears in the margin. Clicking "Accept Repair" atomically replaces the AST node without altering your formatting or cursor position.',
      },
      {
        id: 'gap-analysis-guide',
        title: 'Calibrating Structural Gap Analysis with University Templates',
        time: '4 min read',
        tag: 'Templates',
        content:
          'Under Workspace Settings > Templates, select your institution blueprint (such as UCP Final Year Project or IEEE Conference). The gap analysis engine will construct a live checklist in your editor margin and alert you if mandatory sections are missing.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy, Encryption & Offline Vault',
    icon: Lock,
    tone: 'gold',
    description: 'Understand zero-knowledge client encryption, local IndexedDB vaults, and offline air-gaps.',
    articles: [
      {
        id: 'local-encryption',
        title: 'How is my data encrypted locally on device?',
        time: '3 min read',
        tag: 'Security',
        content:
          'DocuMend uses the WebCrypto API with AES-GCM 256-bit encryption. Document snapshots are serialized and stored inside IndexedDB with your master browser key, preventing other applications or unauthorized scripts from reading drafts on disk.',
      },
      {
        id: 'zk-sync-explained',
        title: 'What is Zero-Knowledge sync?',
        time: '5 min read',
        tag: 'Cloud Sync',
        content:
          'When sync is enabled, your document payload is scrambled into blinded ciphertext on your device before transmission. The sync server stores blinded ciphertext without plaintext decryption keys—ensuring only you can decrypt your documents.',
      },
      {
        id: 'offline-only-toggle',
        title: 'How to enable strict air-gapped offline mode?',
        time: '2 min read',
        tag: 'Settings',
        content:
          'Open the Sidebar and toggle the Privacy Shield switch. Strict air-gap disables all external network telemetry and API lookups, ensuring 100% offline local WASM operation.',
      },
    ],
  },
  {
    id: 'citations',
    title: 'Citations, References & Style Presets',
    icon: BookOpen,
    tone: 'blue',
    description: 'Format citation standards, repair broken DOIs, and resolve reference numbering mismatches.',
    articles: [
      {
        id: 'crossref-validate',
        title: 'How to validate citations against CrossRef and Semantic Scholar?',
        time: '3 min read',
        tag: 'Online Helper',
        content:
          'Highlight any bibliographic citation or DOI and trigger "Validate Reference". DocuMend sends an anonymous DOI lookup query to CrossRef to verify author spelling, publication year, and journal title validity.',
      },
      {
        id: 'switch-citation-styles',
        title: 'Switching between APA 7th, MLA, Harvard, and IEEE formats',
        time: '2 min read',
        tag: 'Formatting',
        content:
          'Navigate to Settings > Editor Preferences > Default Citation Standard. Changing from APA to IEEE will automatically convert in-text author-date citations `(Aslam et al., 2026)` into numbered references `[1]` across the active document.',
      },
      {
        id: 'detect-missing-bib',
        title: 'Fixing in-text citations with missing bibliography entries',
        time: '3 min read',
        tag: 'Troubleshooting',
        content:
          'The AST parser cross-checks all in-text citation keys with the bibliography block. Orphaned citations are highlighted with a coral indicator and a one-click "Generate Entry" button.',
      },
    ],
  },
];

const keyboardShortcuts = [
  { keys: ['Ctrl', 'K'], label: 'Quick Command Palette' },
  { keys: ['Ctrl', 'S'], label: 'Create Instant Snapshot' },
  { keys: ['Ctrl', 'Shift', 'C'], label: 'Run Contradiction Heuristics' },
  { keys: ['Ctrl', 'Shift', 'G'], label: 'Toggle Structural Gap Checker' },
  { keys: ['Ctrl', 'E'], label: 'Open Focus Editor' },
  { keys: ['Ctrl', 'H'], label: 'Open Version History' },
  { keys: ['Alt', 'Z'], label: 'Toggle Zen Mode' },
  { keys: ['Ctrl', 'Shift', 'P'], label: 'Toggle Privacy Air-Gap' },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState({ odie: true, privacy: true, citations: true });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [toast, setToast] = useState('');

  // Global Shared Theme Context
  const { darkMode, toggleDarkMode } = useTheme();

  // Workspace Chrome Shell States
  const [activeNav, setActiveNav] = useState('Help and Guide');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return helpSections;

    return helpSections
      .map((sec) => {
        const matchingArticles = sec.articles.filter(
          (art) =>
            art.title.toLowerCase().includes(q) ||
            art.content.toLowerCase().includes(q) ||
            art.tag.toLowerCase().includes(q)
        );
        return {
          ...sec,
          articles: matchingArticles,
        };
      })
      .filter((sec) => sec.articles.length > 0 || sec.title.toLowerCase().includes(q));
  }, [searchQuery]);

  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
    if (route && label !== 'Help and Guide') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Features') return navigate('/features');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Storage') return navigate('/storage');
    if (label === 'Share Document') return navigate('/share');

    setActiveNav(label);
    if (label !== 'Help and Guide') notify(`${label} view selected`);
    setMobileSidebar(false);
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
          notify(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
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

      <main className={`dash-main help-main-area ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <div className="help-glow-orb help-orb-1" aria-hidden="true" />
        <div className="help-glow-orb help-orb-2" aria-hidden="true" />

        <div className="help-container">
          {/* Top Page Banner */}
          <header className="help-hero">
            <div className="help-hero-badge">
              <Compass size={13} />
              <span>DocuMend Knowledge Base</span>
            </div>
            <h1>Help, Guides & Technical Manual</h1>
            <p>
              Master the ODIE WASM engine, configure zero-knowledge vaults, and calibrate real-time gap analysis.
            </p>

            {/* Prominent Search Bar */}
            <div className="help-search-capsule">
              <Search size={18} className="help-search-icon" />
              <input
                type="text"
                placeholder="Search help articles, engine specs, shortcuts (e.g. contradiction, WASM, CrossRef)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="help-clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </header>

          {/* 3 Interactive Quick Start Cards */}
          <section className="help-quick-cards-grid" aria-label="Quick Start Guides">
            <div
              className="help-quick-card help-quick-card-mint"
              onClick={() => {
                setSelectedArticle(helpSections[0].articles[0]);
              }}
            >
              <div className="help-quick-card-icon">
                <Cpu size={22} />
              </div>
              <div className="help-quick-card-body">
                <span className="help-quick-tag">Core Engine</span>
                <h3>Understanding Contradiction Detection</h3>
                <p>Learn how local WASM scans semantic assertions with zero cloud latency.</p>
              </div>
              <span className="help-quick-arrow">
                Read Guide <ArrowRight size={13} />
              </span>
            </div>

            <div
              className="help-quick-card help-quick-card-gold"
              onClick={() => {
                setSelectedArticle(helpSections[1].articles[0]);
              }}
            >
              <div className="help-quick-card-icon">
                <Lock size={22} />
              </div>
              <div className="help-quick-card-body">
                <span className="help-quick-tag">Privacy First</span>
                <h3>Client-Side AES Encryption</h3>
                <p>How documents stay encrypted on disk and never train external models.</p>
              </div>
              <span className="help-quick-arrow">
                Read Guide <ArrowRight size={13} />
              </span>
            </div>

            <div
              className="help-quick-card help-quick-card-blue"
              onClick={() => {
                setSelectedArticle(helpSections[2].articles[0]);
              }}
            >
              <div className="help-quick-card-icon">
                <BookOpen size={22} />
              </div>
              <div className="help-quick-card-body">
                <span className="help-quick-tag">Academic Citations</span>
                <h3>CrossRef & Semantic Scholar</h3>
                <p>Automated DOI validation and instant APA to IEEE citation format conversion.</p>
              </div>
              <span className="help-quick-arrow">
                Read Guide <ArrowRight size={13} />
              </span>
            </div>
          </section>

          {/* Accordion Documentation Categories */}
          <section className="help-sections-wrap" aria-label="Help Categories">
            {filteredSections.map((sec) => {
              const IconComp = sec.icon;
              const isOpen = openSections[sec.id] ?? true;

              return (
                <div key={sec.id} className={`help-accordion-block help-tone-${sec.tone}`}>
                  <button
                    type="button"
                    className="help-accordion-header"
                    onClick={() => toggleSection(sec.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="help-accordion-title">
                      <div className="help-accordion-icon-badge">
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h3>{sec.title}</h3>
                        <p>{sec.description}</p>
                      </div>
                    </div>
                    <div className="help-accordion-right">
                      <span className="help-article-count-pill">{sec.articles.length} articles</span>
                      <ChevronDown
                        size={17}
                        className={`help-chevron-toggle ${isOpen ? 'is-expanded' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="help-articles-list">
                      {sec.articles.map((art) => (
                        <div
                          key={art.id}
                          className="help-article-row"
                          onClick={() => setSelectedArticle(art)}
                        >
                          <div className="help-article-info">
                            <span className="help-article-tag">{art.tag}</span>
                            <h4>{art.title}</h4>
                          </div>
                          <div className="help-article-actions">
                            <span className="help-read-time">{art.time}</span>
                            <div className="help-row-arrow-circle">
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* Keyboard Shortcuts Matrix Card */}
          <section className="help-shortcuts-matrix-card" aria-label="Keyboard Shortcuts">
            <div className="help-shortcuts-head">
              <div className="help-shortcuts-title">
                <div className="help-shortcuts-icon-badge">
                  <Keyboard size={18} />
                </div>
                <div>
                  <h3>Power User Keyboard Shortcuts</h3>
                  <p>Accelerate your research writing and engine execution with rapid key bindings.</p>
                </div>
              </div>
              <span className="help-shortcuts-counter">{keyboardShortcuts.length} Shortcuts Available</span>
            </div>

            <div className="help-shortcuts-grid">
              {keyboardShortcuts.map((item) => (
                <div key={item.label} className="help-shortcut-card">
                  <span className="help-shortcut-label">{item.label}</span>
                  <div className="help-shortcut-keys">
                    {item.keys.map((k) => (
                      <kbd key={k} className="help-kbd">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Contact Support Banner */}
          <footer className="help-support-banner">
            <div className="help-support-copy">
              <div className="help-support-icon">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4>Still need guidance on your manuscript?</h4>
                <p>DocuMend’s local-first community documentation and research guides are constantly updated.</p>
              </div>
            </div>
            <button
              type="button"
              className="help-support-btn"
              onClick={() => notify('Community forum & docs opening locally')}
            >
              <span>Explore Community Knowledge</span>
              <ExternalLink size={14} />
            </button>
          </footer>
        </div>
      </main>

      {/* Article Detail Drawer Modal */}
      {selectedArticle && (
        <div
          className="help-modal-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedArticle(null);
          }}
        >
          <article className="help-article-drawer" role="dialog" aria-modal="true">
            <div className="help-drawer-top">
              <div className="help-drawer-tags">
                <span className="help-drawer-tag-pill">{selectedArticle.tag}</span>
                <span className="help-drawer-time">{selectedArticle.time}</span>
              </div>
              <button
                type="button"
                className="help-drawer-close-btn"
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="help-drawer-title">{selectedArticle.title}</h2>

            <div className="help-drawer-body">
              <p>{selectedArticle.content}</p>
            </div>

            <div className="help-drawer-verified-box">
              <ShieldCheck size={16} />
              <span>Validated by DocuMend ODIE Local Specification v2.4</span>
            </div>

            <div className="help-drawer-footer">
              <button
                type="button"
                className="help-drawer-action-btn"
                onClick={() => {
                  setSelectedArticle(null);
                  navigate('/editor');
                }}
              >
                <FileText size={15} />
                <span>Try in Document Editor</span>
              </button>
            </div>
          </article>
        </div>
      )}

      {/* Workspace Dialog Modal */}
      <WorkspaceModal
        mode={modal}
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={() => {
          setModal(null);
          navigate('/');
        }}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="help-toast" role="status" aria-live="polite">
          <Sparkles size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}