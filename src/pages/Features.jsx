<<<<<<< Updated upstream
/**
 * Features — the workspace's capability switchboard, reached from the
 * "Features" item in the sidebar.
 *
 * Ported from a TanStack Router + Tailwind prototype into this project's
 * stack: plain JSX, the shared workspace chrome, and a page stylesheet. Two
 * deliberate departures from the prototype:
 *
 *   1. It had its own sidebar and its own search header. Both are dropped in
 *      favour of the shared components, so this page cannot drift away from
 *      the rest of the app the way Version history did.
 *   2. The prototype was dark-on-dark. Here the page uses the shared
 *      --dash-* tokens instead, so it follows the workspace's light theme and
 *      gets dark mode for free when .dash-dark is on the shell. An enabled
 *      card still takes the forest/gold treatment, which is what carried the
 *      on/off contrast in the original.
 *
 * Toggle state is in-memory only -- nothing here persists across a reload
 * yet.
 */
import { useMemo, useState } from 'react';
import './features.css';
import {
  BarChart3,
  BookOpen,
  Cloud,
  FileCheck2,
  FileText,
  History,
  LockKeyhole,
  Search,
  ShieldCheck,
  Sparkles,
  SquareDashed,
  WandSparkles,
=======
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Cloud,
  Copy,
  Cpu,
  Eye,
  FileCheck2,
  Filter,
  Layers,
  Lock,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Wand2,
  Zap,
>>>>>>> Stashed changes
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
<<<<<<< Updated upstream
import { Reveal } from '../components/Reveal';
import { workspaceRoutes } from '../components/workspace-nav';
import { navigate } from '../router';

/* ==========================================================================
   Data

   `tier` drives the badge and the filter. `note` overrides the footer text on
   a card -- "Always on" for the features that cannot meaningfully be paused,
   "Requires online mode" for the two that reach the network.
   ========================================================================== */

const featureData = [
  {
    id: 'contradiction-detection',
    title: 'Contradiction detection',
    description:
      'A local Wasm engine scans your draft for logical inconsistencies as you type, under 50ms.',
    tier: 'Core',
    note: 'Always on',
    icon: ShieldCheck,
  },
  {
    id: 'structural-gap-analysis',
    title: 'Structural gap analysis',
    description:
      'Finds the sections your template expects but your document is still missing (IEEE, APA, UC PP).',
    tier: 'Core',
    note: 'Always on',
    icon: SquareDashed,
  },
  {
    id: 'self-plagiarism-check',
    title: 'Self-plagiarism check',
    description:
      'Compares against your own local draft history. Fully offline, nothing ever leaves the device.',
    tier: 'Core',
    icon: FileCheck2,
  },
  {
    id: 'self-healing-repair',
    title: 'Self-healing repair',
    description:
      'One click semantic find-and-replace that resolves detected contradictions for you.',
    tier: 'Core',
    icon: WandSparkles,
  },
  {
    id: 'version-history',
    title: 'Version history',
    description:
      'A quiet record of every meaningful draft, ready whenever you need to look back.',
    tier: 'Core',
    note: 'Always on',
    icon: History,
  },
  {
    id: 'plain-text-export',
    title: 'Plain text export',
    description:
      'Take a clean, portable copy of your work with you at any stage of the edit.',
    tier: 'Core',
    icon: FileText,
  },
  {
    id: 'citation-validation',
    title: 'Citation validation',
    description:
      'Checks every reference against Crossref and Semantic Scholar before you submit.',
    tier: 'Premium',
    note: 'Requires online mode',
    icon: BookOpen,
  },
  {
    id: 'zero-knowledge-sync',
    title: 'Zero-knowledge cloud sync',
    description:
      'AES-256 encrypted blobs only. The server never sees plaintext, sync across every device.',
    tier: 'Premium',
    icon: Cloud,
  },
  {
    id: 'visual-intelligence',
    title: 'Visual intelligence',
    description:
      'Logic graphs, document heatmaps and structural analytics in one dashboard.',
    tier: 'Premium',
    icon: BarChart3,
  },
  {
    id: 'gemini-analysis',
    title: 'Advanced online analysis',
    description:
      "An online AI fallback that steps in when the local model's confidence runs low.",
    tier: 'Premium',
    note: 'Requires online mode',
    icon: Sparkles,
  },
];

const TIERS = ['All', 'Core', 'Premium'];

/* ==========================================================================
   Pieces
   ========================================================================== */

/**
 * The on/off control. role="switch" with aria-checked is what tells a screen
 * reader this is a toggle rather than an ordinary button; the visual is the
 * same shape as the sidebar's privacy switch.
 */
function FeatureSwitch({ active, label, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={`${label}: ${active ? 'enabled' : 'paused'}`}
      onClick={onToggle}
      className={`features-switch ${active ? 'is-on' : ''}`}
    />
  );
}

function FeatureCard({ feature, active, onToggle }) {
  const Icon = feature.icon;
  return (
    <article className={`features-card ${active ? 'is-active' : ''}`}>
      <div className="features-card-top">
        <span className="features-card-icon">
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <span className={`features-tier features-tier-${feature.tier.toLowerCase()}`}>
          {feature.tier}
        </span>
      </div>

      <h2 className="features-card-title">{feature.title}</h2>
      <p className="features-card-text">{feature.description}</p>

      <div className="features-card-foot">
        <span className="features-card-note">
          {feature.note ?? (active ? 'Enabled' : 'Paused')}
        </span>
        <FeatureSwitch active={active} label={feature.title} onToggle={onToggle} />
      </div>
    </article>
  );
}

/* ==========================================================================
   Page
   ========================================================================== */

export default function Features() {
  // Shared workspace chrome state, matching every other signed-in page.
  const [activeNav, setActiveNav] = useState('Features');
  const [darkMode, setDarkMode] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  // Page state. The first eight features start enabled, as in the prototype.
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(featureData.map((feature, index) => [feature.id, index < 8])),
  );
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState('All');

  const announce = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  // Labels with a real page route there; the rest highlight and say so.
  const selectNav = (label) => {
    const route = workspaceRoutes[label];
=======
import { workspaceRoutes } from '../components/workspace-nav';
import { navigate } from '../router';
import './features.css';

const initialFeatureList = [
  {
    id: 'contradiction',
    title: 'Contradiction detection',
    badge: 'Core Engine',
    latency: '< 50ms',
    tier: 'Core',
    category: 'Analysis',
    description:
      'ODIE WASM engine scans semantic and logical inconsistencies across sections in real-time with zero cloud dependency.',
    icon: ShieldAlert,
    enabled: true,
    tone: 'coral',
    tech: 'Local WASM',
  },
  {
    id: 'structural_gap',
    title: 'Structural gap analysis',
    badge: 'Template Sync',
    latency: 'Instant',
    tier: 'Core',
    category: 'Structure',
    description:
      'Detects missing mandatory chapters, methodologies, or abstract sections mapped directly to IEEE, APA, and university templates.',
    icon: Layers,
    enabled: true,
    tone: 'gold',
    tech: 'Rule Parser',
  },
  {
    id: 'self_plagiarism',
    title: 'Self-plagiarism check',
    badge: 'Offline DB',
    latency: '120ms',
    tier: 'Core',
    category: 'Privacy',
    description:
      'Cross-compares drafts against your local IndexedDB workspace memory without uploading document tokens anywhere.',
    icon: Copy,
    enabled: true,
    tone: 'mint',
    tech: 'IndexedDB',
  },
  {
    id: 'self_healing',
    title: 'Self-healing repair',
    badge: 'Auto-Patch',
    latency: 'Realtime',
    tier: 'Core',
    category: 'Repair',
    description:
      'One-click intelligent replacement that patches grammar fractures, broken cross-references, and citation order.',
    icon: Wand2,
    enabled: true,
    tone: 'mint',
    tech: 'Local AST',
  },
  {
    id: 'citation_val',
    title: 'Citation validation',
    badge: 'Cross-Ref',
    latency: 'Online Async',
    tier: 'Premium',
    category: 'Citations',
    description:
      'Validates reference DOIs, author hierarchies, and year discrepancies against CrossRef and Semantic Scholar APIs.',
    icon: BookOpen,
    enabled: true,
    tone: 'blue',
    tech: 'REST / SSL',
  },
  {
    id: 'zk_cloud_sync',
    title: 'Zero-Knowledge cloud sync',
    badge: 'E2EE AES-256',
    latency: 'Encrypted',
    tier: 'Premium',
    category: 'Privacy',
    description:
      'Client-side AES-GCM 256-bit encrypted blobs. The sync server stores blinded ciphertext without plaintext decryption keys.',
    icon: Lock,
    enabled: true,
    tone: 'gold',
    tech: 'WebCrypto',
  },
  {
    id: 'visual_intel',
    title: 'Visual intelligence & graphs',
    badge: 'Interactive',
    latency: 'GPU Accel',
    tier: 'Premium',
    category: 'Analysis',
    description:
      'Generates document argument tree graphs, semantic coherence heatmaps, and section weight balance meters.',
    icon: Eye,
    enabled: true,
    tone: 'coral',
    tech: 'Canvas 2D',
  },
  {
    id: 'ai_fallback',
    title: 'Hybrid AI Deep Reasoning',
    badge: 'Online Assist',
    latency: 'Streaming',
    tier: 'Premium',
    category: 'Analysis',
    description:
      'High-complexity semantic analysis fallback when local edge heuristics detect nuanced academic reasoning conflicts.',
    icon: Sparkles,
    enabled: true,
    tone: 'gold',
    tech: 'Cloud Inference',
  },
  {
    id: 'live_diff',
    title: 'Granular AST Version Diff',
    badge: 'Snapshot',
    latency: '< 10ms',
    tier: 'Core',
    category: 'Structure',
    description:
      'Tracks precise phrase deletions, sentence reordering, and modifier insertions at atomic document node levels.',
    icon: RotateCcw,
    enabled: false,
    tone: 'blue',
    tech: 'DOM Trees',
  },
  {
    id: 'perf_budget',
    title: '60 FPS Canvas Renderer',
    badge: 'Ultra Fast',
    latency: '16.6ms',
    tier: 'Core',
    category: 'Performance',
    description:
      'Virtualizes document scrolling and highlights with zero DOM lag on 100+ page long-form manuscripts.',
    icon: Zap,
    enabled: false,
    tone: 'mint',
    tech: 'Hardware Accel',
  },
];

export default function Features() {
  const [features, setFeatures] = useState(initialFeatureList);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState('');

  // Workspace Chrome shell states
  const [activeNav, setActiveNav] = useState('Features');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2700);
  };

  const toggleFeature = (id) => {
    setFeatures((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const newState = !f.enabled;
          notify(`${f.title} ${newState ? 'enabled' : 'disabled'}`);
          return { ...f, enabled: newState };
        }
        return f;
      })
    );
  };

  const activeCount = useMemo(() => features.filter((f) => f.enabled).length, [features]);

  const filteredFeatures = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return features.filter((f) => {
      const matchesCategory =
        selectedFilter === 'All' ||
        (selectedFilter === 'Core' && f.tier === 'Core') ||
        (selectedFilter === 'Premium' && f.tier === 'Premium') ||
        f.category === selectedFilter;

      const matchesSearch =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tech.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [features, selectedFilter, searchQuery]);

  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
>>>>>>> Stashed changes
    if (route && label !== 'Features') {
      navigate(route);
      return;
    }
<<<<<<< Updated upstream
    setActiveNav(label);
    if (label !== 'Features') announce(`${label} view selected`);
    setMobileSidebar(false);
  };

  const activeCount = useMemo(
    () => Object.values(enabled).filter(Boolean).length,
    [enabled],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return featureData.filter(
      (feature) =>
        (tier === 'All' || feature.tier === tier) &&
        (needle === '' ||
          feature.title.toLowerCase().includes(needle) ||
          feature.description.toLowerCase().includes(needle)),
    );
  }, [query, tier]);

  const toggle = (id) => {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
  };

  const setAll = (value) => {
    setEnabled(Object.fromEntries(featureData.map((feature) => [feature.id, value])));
    announce(value ? 'Every feature enabled' : 'Every feature paused');
  };

=======
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');

    setActiveNav(label);
    if (label !== 'Features') notify(`${label} view selected`);
    setMobileSidebar(false);
  };

>>>>>>> Stashed changes
  return (
    <div className={`dash-shell ${darkMode ? 'dash-dark' : ''}`}>
      <MobileTopbar
        onMenu={() => setMobileSidebar(true)}
<<<<<<< Updated upstream
        onThemeToggle={() => setDarkMode((current) => !current)}
=======
        onThemeToggle={() => setDarkMode((prev) => !prev)}
>>>>>>> Stashed changes
        darkMode={darkMode}
      />

      <Sidebar
        activeNav={activeNav}
        onNavigate={selectNav}
        privacyMode={privacyMode}
        onPrivacyToggle={() => {
<<<<<<< Updated upstream
          setPrivacyMode((current) => !current);
          announce(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
        }}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((current) => !current)}
        onLogout={() => setModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
=======
          setPrivacyMode((prev) => !prev);
          notify(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
        }}
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode((prev) => !prev)}
        onLogout={() => setModal('logout')}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
>>>>>>> Stashed changes
      />

      <MobileDrawer
        open={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        activeNav={activeNav}
        onNavigate={selectNav}
<<<<<<< Updated upstream
        onPrivacyToggle={() => setPrivacyMode((current) => !current)}
        onLogout={() => setModal('logout')}
      />

      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader
          search={workspaceSearch}
          onSearchChange={setWorkspaceSearch}
          onAnnounce={announce}
        />

        <section className="features-page">
          <Reveal>
            <span className="features-kicker">
              <span className="features-kicker-rule" />
              workspace controls
            </span>

            <div className="features-heading">
              <div>
                <h1>Every capability, under your control</h1>
                <p>
                  Turn features on or off per workspace. Core tools run fully
                  offline; premium tools ask before they reach the network.
                </p>
              </div>

              <div className="features-meter">
                <p className="features-meter-count">
                  {activeCount}
                  <span> / {featureData.length}</span>
                </p>
                <p className="features-meter-label">features active</p>
                <div className="features-meter-track">
                  <span
                    className="features-meter-fill"
                    style={{ width: `${(activeCount / featureData.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </Reveal>

          {/* Filters */}
          <div className="features-toolbar">
            <div className="features-tabs">
              {TIERS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTier(item)}
                  className={tier === item ? 'is-active' : ''}
                >
                  {item}
=======
        onPrivacyToggle={() => setPrivacyMode((prev) => !prev)}
        onLogout={() => setModal('logout')}
      />

      <main className={`dash-main feat-main-area ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onAnnounce={notify}
        />

        <div className="feat-container">
          {/* Ambient light glow backdrop */}
          <div className="feat-glow-orb feat-orb-1" aria-hidden="true" />
          <div className="feat-glow-orb feat-orb-2" aria-hidden="true" />

          {/* Top Hero Banner */}
          <header className="feat-hero-header">
            <div className="feat-hero-text">
              <div className="feat-kicker">
                <Cpu size={14} className="feat-kicker-icon" />
                <span>Engine & Pipeline Control</span>
              </div>
              <h1>Platform Features</h1>
              <p>
                Configure local WASM heuristics, neural checkers, and edge-privacy modules.
              </p>
            </div>

            {/* Quick Stats Pill Panel */}
            <div className="feat-meter-card">
              <div className="feat-meter-info">
                <span className="feat-meter-num">
                  {activeCount}
                  <small>/{features.length}</small>
                </span>
                <span className="feat-meter-label">Active Modules</span>
              </div>
              <div className="feat-progress-track">
                <div
                  className="feat-progress-bar"
                  style={{ width: `${(activeCount / features.length) * 100}%` }}
                />
              </div>
              <div className="feat-meter-footer">
                <span>
                  <Zap size={12} /> Local-first pipeline
                </span>
                <span className="feat-latency-live">● 42ms runtime</span>
              </div>
            </div>
          </header>

          {/* Filter Bar */}
          <div className="feat-filter-toolbar">
            <div className="feat-tabs" role="tablist">
              {['All', 'Core', 'Premium', 'Analysis', 'Privacy'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={selectedFilter === tab}
                  className={`feat-tab-btn ${selectedFilter === tab ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter(tab)}
                >
                  {tab}
>>>>>>> Stashed changes
                </button>
              ))}
            </div>

<<<<<<< Updated upstream
            <label className="features-search">
              <span className="dash-sr">Search features</span>
              <Search size={15} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search features"
              />
            </label>

            <div className="features-bulk">
              <button type="button" onClick={() => setAll(true)}>Enable all</button>
              <button type="button" onClick={() => setAll(false)}>Pause all</button>
            </div>
          </div>

          {/* Cards */}
          <div className="features-grid">
            {visible.map((feature, index) => (
              <Reveal key={feature.id} delay={index * 60}>
                <FeatureCard
                  feature={feature}
                  active={Boolean(enabled[feature.id])}
                  onToggle={() => toggle(feature.id)}
                />
              </Reveal>
            ))}
          </div>

          {visible.length === 0 && (
            <p className="features-empty">No features match “{query}”.</p>
          )}

          {/* Two read-only summaries, as in the prototype. */}
          <div className="features-notes">
            <article>
              <span className="features-note-kicker">Subscription</span>
              <strong>Private studio · core plan</strong>
              <p>All local features included, no seat limits.</p>
            </article>
            <article>
              <span className="features-note-kicker">Settings</span>
              <strong>Workspace defaults</strong>
              <p>Offline-first · quiet notifications · AES-256 at rest.</p>
            </article>
          </div>

          <footer className="features-foot">
            <span><LockKeyhole size={13} /> Changes stay local to this workspace.</span>
            <span><span className="features-foot-dot" /> All systems quiet</span>
          </footer>
        </section>
=======
            <div className="feat-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search engine modules or tech stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Dynamic Features Grid */}
          <section className="feat-grid" aria-label="Engine Capabilities">
            {filteredFeatures.map((item) => {
              const IconComponent = item.icon;
              return (
                <article
                  key={item.id}
                  className={`feat-card feat-tone-${item.tone} ${item.enabled ? 'is-enabled' : 'is-disabled'}`}
                >
                  {/* Card Topline */}
                  <div className="feat-card-top">
                    <div className={`feat-icon-bubble feat-bubble-${item.tone}`}>
                      <IconComponent size={20} strokeWidth={2.2} />
                    </div>
                    <div className="feat-badges-group">
                      <span className="feat-tech-tag">{item.tech}</span>
                      <span className={`feat-tier-pill feat-tier-${item.tier.toLowerCase()}`}>
                        {item.tier}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="feat-card-body">
                    <div className="feat-title-row">
                      <h3>{item.title}</h3>
                      <span className="feat-latency-pill">{item.latency}</span>
                    </div>
                    <p>{item.description}</p>
                  </div>

                  {/* Card Bottom / Toggle switch */}
                  <div className="feat-card-footer">
                    <span className="feat-status-caption">
                      {item.enabled ? (
                        <span className="feat-status-active">
                          <FileCheck2 size={13} /> Active on document
                        </span>
                      ) : (
                        <span className="feat-status-inactive">Inactive / Standby</span>
                      )}
                    </span>

                    <label
                      className="feat-switch"
                      aria-label={`Toggle ${item.title}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => toggleFeature(item.id)}
                      />
                      <span className="feat-slider" />
                    </label>
                  </div>
                </article>
              );
            })}
          </section>
        </div>
>>>>>>> Stashed changes
      </main>

      <WorkspaceModal
        mode={modal}
<<<<<<< Updated upstream
        initialValue=""
=======
>>>>>>> Stashed changes
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={() => {
          setModal(null);
<<<<<<< Updated upstream
          navigate('/login');
        }}
      />

      {toast && <div className="features-toast">{toast}</div>}
    </div>
  );
}
=======
          navigate('/');
        }}
      />

      {toast && (
        <div className="feat-toast" role="status" aria-live="polite">
          <Sparkles size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
>>>>>>> Stashed changes
