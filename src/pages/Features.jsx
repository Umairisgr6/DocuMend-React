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
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
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
    if (route && label !== 'Features') {
      navigate(route);
      return;
    }
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

      <MobileDrawer
        open={mobileSidebar}
        onClose={() => setMobileSidebar(false)}
        activeNav={activeNav}
        onNavigate={selectNav}
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
                </button>
              ))}
            </div>

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
      </main>

      <WorkspaceModal
        mode={modal}
        initialValue=""
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={() => {
          setModal(null);
          navigate('/login');
        }}
      />

      {toast && <div className="features-toast">{toast}</div>}
    </div>
  );
}
