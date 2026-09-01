import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Cpu,
  Database,
  Eye,
  FileCheck,
  History,
  Layers,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { navigate } from '../router';
import './settings.css';

const blueprintsData = [
  {
    id: 'ucp_fyp',
    title: 'UCP Final Year Project Report',
    subtitle: 'Standard FYP Phase-1 & Phase-2 template',
    badge: 'Academic',
    tags: ['H1–H4 Hierarchy', 'APA 7th Edition', '12 Chapters', 'WASM Strict'],
    stats: { pages: '40–70 pages', citations: 'Mandatory DOI', validation: 'Instant AST' },
    specs: {
      title: 'UCP Computer Science Capstone Blueprint',
      structure: [
        { id: '1', title: '1. Introduction', parts: ['1.1 Problem Statement', '1.2 Proposed Objectives', '1.3 Scope & Limitations'] },
        { id: '2', title: '2. Literature Review', warning: 'APA Citation Verification Active' },
        { id: '3', title: '3. System Architecture & Methodology', parts: ['3.1 Modular Decomposition', '3.2 Sequence & Data Flow'] },
        { id: '4', title: '4. Implementation & Edge Engine Specs' },
        { id: '5', title: '5. Empirical Testing & Evaluation' },
        { id: '6', title: '6. Conclusion & Future Directions' },
      ],
      remaining: 6,
    },
  },
  {
    id: 'ieee_conf',
    title: 'IEEE Conference Manuscript',
    subtitle: 'Double-column peer-reviewed schema',
    badge: 'Publication',
    tags: ['2-Column Grid', 'Numeric Citations', 'Max 6,000 words'],
    stats: { pages: '6–8 pages', citations: 'IEEE Numeric', validation: 'Strict Layout' },
    specs: {
      title: 'IEEE Two-Column Conference Standard',
      structure: [
        { id: 'I', title: 'I. Abstract & Index Terms' },
        { id: 'II', title: 'II. Introduction & Theoretical Framing' },
        { id: 'III', title: 'III. Proposed Algorithmic Pipeline', parts: ['Mathematical Bounds', 'Complexity Analysis'] },
        { id: 'IV', title: 'IV. Experimental Benchmark', warning: 'Double-blind Author Scrub Active' },
        { id: 'V', title: 'V. Conclusion' },
      ],
      remaining: 0,
    },
  },
  {
    id: 'legal_nda',
    title: 'Corporate Mutual NDA & IP Agreement',
    subtitle: 'Strict legal clause hierarchy and audit tags',
    badge: 'Legal',
    tags: ['Clauses & Covenants', 'Enforceability Tags', 'Signature Block'],
    stats: { pages: '3–5 pages', citations: 'Jurisdiction Ref', validation: 'Clause Check' },
    specs: {
      title: 'Mutual Non-Disclosure & IP Covenant',
      structure: [
        { id: '1', title: '1. Definitions & Confidential Data Scope' },
        { id: '2', title: '2. Permitted Use & Non-Disclosure Obligations', warning: 'Exclusion Clauses Monitored' },
        { id: '3', title: '3. Term, Return of Materials, & Remedies' },
        { id: '4', title: '4. Governing Law & Dispute Forum' },
      ],
      remaining: 2,
    },
  },
  {
    id: 'custom_free',
    title: 'Free-flow Research Manuscript',
    subtitle: 'Unconstrained canvas with active heuristics',
    badge: 'Flexible',
    tags: ['Free-form Prose', 'Continuous Contradiction Check', 'Edge AST'],
    stats: { pages: 'Unlimited', citations: 'Dynamic', validation: 'Realtime' },
    specs: {
      title: 'Unstructured Dynamic Workspace',
      structure: [
        { id: 'A', title: 'Custom Markdown & Document Trees' },
        { id: 'B', title: 'Background WebAssembly Semantic Checks' },
      ],
      remaining: 0,
    },
  },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState('');

  // WorkspaceChrome shell states
  const [activeNav, setActiveNav] = useState('Settings');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Default Light mode, toggle-able to dark
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState(null);

  // Profile Form States
  const [profile, setProfile] = useState({
    firstName: 'Mahnoor',
    lastName: 'Aslam',
    email: 'mahnooraslam@gmail.com',
    password: '•••••••••••••••••',
    lastLogin: 'Today, 10:42 AM',
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Template State
  const [selectedBpId, setSelectedBpId] = useState('ucp_fyp');
  const activeBlueprint = useMemo(
    () => blueprintsData.find((b) => b.id === selectedBpId) || blueprintsData[0],
    [selectedBpId]
  );

  // Diagnostics & Rules State
  const [rules, setRules] = useState({
    contradictionParsing: true,
    gapAnalysisContext: true,
    selfHealingRemediation: false,
    zeroKnowledgeDiskEncryption: true,
  });

  const notify = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  };

  const handleToggleRule = (key, label) => {
    setRules((prev) => {
      const next = !prev[key];
      notify(`${label}: ${next ? 'Enabled' : 'Disabled'}`);
      return { ...prev, [key]: next };
    });
  };

  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
    if (route && label !== 'Settings') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Features') return navigate('/features');

    setActiveNav(label);
    if (label !== 'Settings') notify(`${label} view selected`);
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
        onThemeToggle={() => {
          setDarkMode((prev) => !prev);
          notify(`Switched to ${!darkMode ? 'Dark Forest' : 'Light'} Mode`);
        }}
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

      <main className={`dash-main set-v2-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <div className="set-v2-ambient-glow set-v2-glow-1" aria-hidden="true" />
        <div className="set-v2-ambient-glow set-v2-glow-2" aria-hidden="true" />

        <div className="set-v2-wrapper">
          {/* Header Bar */}
          <header className="set-v2-hero">
            <div className="set-v2-hero-copy">
              <div className="set-v2-pill-tag">
                <Sliders size={13} className="set-v2-tag-icon" />
                <span>DocuMend Environment Control</span>
              </div>
              <h1>Settings & System Preferences</h1>
              <p>
                Configure local AST execution rules, authorship credentials, and document structure templates.
              </p>
            </div>

            <div className="set-v2-quick-action">
              <button
                type="button"
                className="set-v2-primary-btn"
                onClick={() => navigate('/editor')}
              >
                <Plus size={16} strokeWidth={2.6} />
                <span>New Document</span>
              </button>
            </div>
          </header>

          {/* Navigation Tab Bar */}
          <div className="set-v2-tabs-dock" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'account'}
              className={`set-v2-tab-item ${activeTab === 'account' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <User size={15} />
              <span>Account & Security</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'templates'}
              className={`set-v2-tab-item ${activeTab === 'templates' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('templates')}
            >
              <Layers size={15} />
              <span>Document Blueprints</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'diagnostics'}
              className={`set-v2-tab-item ${activeTab === 'diagnostics' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('diagnostics')}
            >
              <Cpu size={15} />
              <span>Diagnostics & WASM Rules</span>
            </button>
          </div>

          {/* ============================================================= */}
          {/* TAB 1: ACCOUNT & SECURITY                                    */}
          {/* ============================================================= */}
          {activeTab === 'account' && (
            <div className="set-v2-panel set-v2-fade-in">
              <div className="set-v2-card-glass">
                <div className="set-v2-profile-card">
                  <div className="set-v2-avatar-badge">
                    <span>MA</span>
                    <div className="set-v2-avatar-status" title="Local Identity Online" />
                  </div>
                  <div className="set-v2-profile-info">
                    <div className="set-v2-profile-title">
                      <h3>{profile.firstName} {profile.lastName}</h3>
                      <span className="set-v2-badge-verified">
                        <CheckCircle2 size={12} /> Local-first Account
                      </span>
                    </div>
                    <p>DocuMend Edge Workspace · University of Central Punjab</p>
                    <div className="set-v2-avatar-actions">
                      <button type="button" onClick={() => notify('Photo uploaded')}>Upload Photo</button>
                      <span className="set-v2-dot-divider" />
                      <button type="button" className="set-v2-btn-dim" onClick={() => notify('Photo reset')}>Remove</button>
                      <span className="set-v2-avatar-limits">PNG, JPEG, WebP under 5MB</span>
                    </div>
                  </div>
                </div>

                <form className="set-v2-form" onSubmit={(e) => { e.preventDefault(); notify('Profile changes saved'); }}>
                  <div className="set-v2-grid-2">
                    <div className="set-v2-input-field">
                      <label>First Name</label>
                      <div className="set-v2-input-shell">
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                          placeholder="First name"
                        />
                      </div>
                    </div>

                    <div className="set-v2-input-field">
                      <label>Last Name</label>
                      <div className="set-v2-input-shell">
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                          placeholder="Last name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="set-v2-input-field set-v2-mt-20">
                    <label>Email Address</label>
                    <div className="set-v2-input-shell set-v2-has-action">
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email address"
                      />
                      <button
                        type="button"
                        className="set-v2-input-icon-btn"
                        onClick={() => notify('Editing email address')}
                        title="Edit email"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="set-v2-input-field set-v2-mt-20">
                    <label>Master Passphrase / Encryption Key</label>
                    <div className="set-v2-input-shell set-v2-has-action">
                      <input
                        type={isEditingPassword ? 'text' : 'password'}
                        value={profile.password}
                        onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                        placeholder="Passphrase"
                      />
                      <button
                        type="button"
                        className="set-v2-input-icon-btn"
                        onClick={() => {
                          setIsEditingPassword((prev) => !prev);
                          notify(isEditingPassword ? 'Passphrase masked' : 'Passphrase visible');
                        }}
                        title="Toggle passphrase visibility"
                      >
                        {isEditingPassword ? <Eye size={15} /> : <Pencil size={15} />}
                      </button>
                    </div>
                  </div>

                  <div className="set-v2-form-submit">
                    <button type="submit" className="set-v2-save-btn">
                      <Save size={15} />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>

                <div className="set-v2-security-section">
                  <div className="set-v2-action-strip">
                    <div className="set-v2-strip-copy">
                      <div className="set-v2-strip-title">
                        <History size={16} className="set-v2-accent-icon" />
                        <strong>Login & Session Audit</strong>
                      </div>
                      <p>Last authenticated session: {profile.lastLogin} · Desktop Client (Lahore, PK)</p>
                    </div>
                    <button
                      type="button"
                      className="set-v2-secondary-btn"
                      onClick={() => notify('Session logs decrypted: 1 active device')}
                    >
                      View Activity Log
                    </button>
                  </div>

                  <div className="set-v2-action-strip set-v2-danger-strip">
                    <div className="set-v2-strip-copy">
                      <div className="set-v2-strip-title">
                        <ShieldAlert size={16} className="set-v2-danger-icon" />
                        <strong className="set-v2-danger-text">Purge Account & Local Vault</strong>
                      </div>
                      <p>Permanently removes cryptographic keys, IndexedDB snapshots, and custom configurations.</p>
                    </div>
                    <button
                      type="button"
                      className="set-v2-danger-btn"
                      onClick={() => setModal('logout')}
                    >
                      <Trash2 size={14} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 2: DOCUMENT BLUEPRINTS                                    */}
          {/* ============================================================= */}
          {activeTab === 'templates' && (
            <div className="set-v2-panel set-v2-fade-in">
              <div className="set-v2-template-layout">
                <div className="set-v2-blueprints-column">
                  <div className="set-v2-section-heading">
                    <h3>Available Academic & Legal Schemas</h3>
                    <p>Select a blueprint to calibrate real-time gap analysis and chapter enforcement.</p>
                  </div>

                  <div className="set-v2-bp-grid">
                    {blueprintsData.map((bp) => {
                      const isSelected = selectedBpId === bp.id;
                      return (
                        <div
                          key={bp.id}
                          className={`set-v2-bp-card ${isSelected ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedBpId(bp.id);
                            notify(`Selected ${bp.title}`);
                          }}
                        >
                          <div className="set-v2-bp-top">
                            <span className="set-v2-bp-badge">{bp.badge}</span>
                            {isSelected && (
                              <span className="set-v2-selected-indicator">
                                <Check size={12} strokeWidth={3} /> Active
                              </span>
                            )}
                          </div>

                          <h4>{bp.title}</h4>
                          <p>{bp.subtitle}</p>

                          <div className="set-v2-bp-tags">
                            {bp.tags.map((tag) => (
                              <span key={tag} className="set-v2-bp-tag-pill">{tag}</span>
                            ))}
                          </div>

                          <div className="set-v2-bp-stats-bar">
                            <span>{bp.stats.pages}</span>
                            <span>•</span>
                            <span>{bp.stats.citations}</span>
                          </div>

                          <button
                            type="button"
                            className={`set-v2-bp-use-btn ${isSelected ? 'is-active-btn' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBpId(bp.id);
                              notify(`Blueprint applied to next document draft`);
                            }}
                          >
                            <span>{isSelected ? 'Currently Calibrated' : 'Apply Blueprint'}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <aside className="set-v2-specs-aside">
                  <div className="set-v2-specs-card">
                    <div className="set-v2-specs-head">
                      <div className="set-v2-specs-kicker">
                        <FileCheck size={14} />
                        <span>Live AST Hierarchy</span>
                      </div>
                      <h4>{activeBlueprint.specs.title}</h4>
                    </div>

                    <div className="set-v2-specs-tree">
                      {activeBlueprint.specs.structure.map((item) => (
                        <div key={item.id} className="set-v2-tree-node">
                          <div className="set-v2-node-title">
                            <span className="set-v2-node-bullet" />
                            <strong>{item.title}</strong>
                          </div>

                          {item.parts && (
                            <div className="set-v2-node-sublist">
                              {item.parts.map((p) => (
                                <div key={p} className="set-v2-subnode">
                                  <span>↳</span> {p}
                                </div>
                              ))}
                            </div>
                          )}

                          {item.warning && (
                            <div className="set-v2-node-warning">
                              <AlertTriangle size={13} />
                              <span>{item.warning}</span>
                            </div>
                          )}
                        </div>
                      ))}

                      {activeBlueprint.specs.remaining > 0 && (
                        <div className="set-v2-tree-more">
                          + {activeBlueprint.specs.remaining} additional specialized sub-chapters
                        </div>
                      )}
                    </div>

                    <div className="set-v2-specs-footer-callout">
                      <Zap size={16} className="set-v2-accent-gold" />
                      <p>
                        WASM Gap Analysis continuously cross-references your draft against this tree to highlight missing sections in realtime.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* TAB 3: DIAGNOSTICS & WASM COMPUTE RULES                      */}
          {/* ============================================================= */}
          {activeTab === 'diagnostics' && (
            <div className="set-v2-panel set-v2-fade-in">
              <div className="set-v2-diag-layout">
                <div className="set-v2-card-glass set-v2-mb-24">
                  <div className="set-v2-diag-head">
                    <div className="set-v2-diag-title-wrap">
                      <Database size={18} className="set-v2-accent-icon" />
                      <div>
                        <h4>IndexedDB Sandbox Quota</h4>
                        <p>Encrypted local storage allocation managed directly inside your browser profile.</p>
                      </div>
                    </div>
                    <span className="set-v2-quota-pill">42 MB / 500 MB (8.4% used)</span>
                  </div>

                  <div className="set-v2-meter-box">
                    <div className="set-v2-meter-track">
                      <div className="set-v2-seg-snap" style={{ width: '18%' }} title="Snapshots: 18MB" />
                      <div className="set-v2-seg-ai" style={{ width: '42%' }} title="ODIE WASM Weights: 24MB" />
                    </div>

                    <div className="set-v2-meter-legend">
                      <div className="set-v2-legend-item">
                        <span className="set-v2-dot set-v2-dot-blue" />
                        <span>Document Snapshots & AST (18 MB)</span>
                      </div>
                      <div className="set-v2-legend-item">
                        <span className="set-v2-dot set-v2-dot-green" />
                        <span>Compiled Edge WASM Modules (24 MB)</span>
                      </div>
                      <div className="set-v2-legend-item">
                        <span className="set-v2-dot set-v2-dot-empty" />
                        <span>Available Buffer (458 MB)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="set-v2-card-glass">
                  <div className="set-v2-diag-head">
                    <div className="set-v2-diag-title-wrap">
                      <Cpu size={18} className="set-v2-accent-green" />
                      <div>
                        <h4>WASM Edge Compute Pipeline</h4>
                        <p>Execution parameters governing semantic contradiction heuristics and latency budgets.</p>
                      </div>
                    </div>
                    <span className="set-v2-badge-verified">
                      <CheckCircle2 size={12} /> ODIE Kernel v2.4.1 Active
                    </span>
                  </div>

                  <div className="set-v2-rules-list">
                    <div className="set-v2-rule-card">
                      <div className="set-v2-rule-info">
                        <div className="set-v2-rule-title">
                          <Zap size={15} className="set-v2-accent-gold" />
                          <strong>Contradiction Parsing Engine</strong>
                          {rules.contradictionParsing && <span className="set-v2-pill-on">Active</span>}
                        </div>
                        <p>Evaluates sentence-level claim compatibility across non-adjacent paragraphs in under 50ms.</p>
                      </div>
                      <label className="set-v2-switch">
                        <input
                          type="checkbox"
                          checked={rules.contradictionParsing}
                          onChange={() => handleToggleRule('contradictionParsing', 'Contradiction Parsing')}
                        />
                        <span className="set-v2-slider" />
                      </label>
                    </div>

                    <div className="set-v2-rule-card">
                      <div className="set-v2-rule-info">
                        <div className="set-v2-rule-title">
                          <Layers size={15} className="set-v2-accent-icon" />
                          <strong>Structural Gap Context Module</strong>
                          {rules.gapAnalysisContext && <span className="set-v2-pill-on">Active</span>}
                        </div>
                        <p>Identifies omissions in required methodology steps according to selected schema blueprints.</p>
                      </div>
                      <label className="set-v2-switch">
                        <input
                          type="checkbox"
                          checked={rules.gapAnalysisContext}
                          onChange={() => handleToggleRule('gapAnalysisContext', 'Gap Analysis')}
                        />
                        <span className="set-v2-slider" />
                      </label>
                    </div>

                    <div className="set-v2-rule-card">
                      <div className="set-v2-rule-info">
                        <div className="set-v2-rule-title">
                          <RefreshCw size={15} className="set-v2-accent-green" />
                          <strong>Self-Healing Semantic Remediation</strong>
                          {!rules.selfHealingRemediation && <span className="set-v2-pill-off">Standby</span>}
                        </div>
                        <p>Automatically proposes replacement syntaxes for detected logic flaws during draft review.</p>
                      </div>
                      <label className="set-v2-switch">
                        <input
                          type="checkbox"
                          checked={rules.selfHealingRemediation}
                          onChange={() => handleToggleRule('selfHealingRemediation', 'Self Healing Remediation')}
                        />
                        <span className="set-v2-slider" />
                      </label>
                    </div>

                    <div className="set-v2-rule-card">
                      <div className="set-v2-rule-info">
                        <div className="set-v2-rule-title">
                          <Lock size={15} className="set-v2-accent-icon" />
                          <strong>Zero-Knowledge Disk Encryption</strong>
                          {rules.zeroKnowledgeDiskEncryption && <span className="set-v2-pill-on">Active</span>}
                        </div>
                        <p>Payloads written to client IndexedDB storage are scrambled using WebCrypto AES-GCM-256.</p>
                      </div>
                      <label className="set-v2-switch">
                        <input
                          type="checkbox"
                          checked={rules.zeroKnowledgeDiskEncryption}
                          onChange={() => handleToggleRule('zeroKnowledgeDiskEncryption', 'Disk Encryption')}
                        />
                        <span className="set-v2-slider" />
                      </label>
                    </div>
                  </div>

                  <div className="set-v2-validation-banner">
                    <ShieldCheck size={16} />
                    <span>All computation strictly executed via local WebAssembly mathematical contract. No plaintext egress.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
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
        <div className="set-v2-toast" role="status" aria-live="polite">
          <Sparkles size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}