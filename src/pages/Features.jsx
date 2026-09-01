import { useMemo, useState } from 'react';
import {
  BookOpen,
  Copy,
  Cpu,
  Eye,
  FileCheck2,
  Layers,
  Lock,
  RotateCcw,
  Search,
  ShieldAlert,
  Sparkles,
  Wand2,
  Zap,
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
    if (route && label !== 'Features') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Help and Guide') return navigate('/help');
    if (label === 'Storage') return navigate('/storage');

    setActiveNav(label);
    if (label !== 'Features') notify(`${label} view selected`);
    setMobileSidebar(false);
  };

  return (
    <div className={`dash-shell ${darkMode ? 'dash-dark' : ''}`}>
      <MobileTopbar
        onMenu={() => setMobileSidebar(true)}
        onThemeToggle={() => setDarkMode((prev) => !prev)}
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
        onThemeToggle={() => setDarkMode((prev) => !prev)}
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

      <main className={`dash-main feat-main-area ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader
          search={searchQuery}
          onSearchChange={setSearchQuery}
          onAnnounce={notify}
        />

        <div className="feat-container">
          <div className="feat-glow-orb feat-orb-1" aria-hidden="true" />
          <div className="feat-glow-orb feat-orb-2" aria-hidden="true" />

          {/* Hero Banner */}
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

            {/* Status Meter */}
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
                </button>
              ))}
            </div>

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

          {/* Features Grid */}
          <section className="feat-grid" aria-label="Engine Capabilities">
            {filteredFeatures.map((item) => {
              const IconComponent = item.icon;
              return (
                <article
                  key={item.id}
                  className={`feat-card feat-tone-${item.tone} ${item.enabled ? 'is-enabled' : 'is-disabled'}`}
                >
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

                  <div className="feat-card-body">
                    <div className="feat-title-row">
                      <h3>{item.title}</h3>
                      <span className="feat-latency-pill">{item.latency}</span>
                    </div>
                    <p>{item.description}</p>
                  </div>

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
      </main>

      <WorkspaceModal
        mode={modal}
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={() => {
          setModal(null);
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