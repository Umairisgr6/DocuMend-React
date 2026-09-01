import { useMemo, useRef, useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  GitCompareArrows,
  History,
  LockKeyhole,
  LogOut,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';
import "./version.css";

const availableDocs = [
  { id: 1, name: "FYP_Phase2_Report.docx", active: true },
  { id: 2, name: "Thesis_Chapter_3.docx", active: false },
  { id: 3, name: "Literature_Review_v1.docx", active: false },
  { id: 4, name: "Methodology_Final.docx", active: false },
];

const initialVersions = [
  {
    id: "v42",
    version: "v42",
    title: "Current version",
    type: "Auto-saved",
    detail: "Auto-saved after editing Section 3.2 Methodology",
    author: "You",
    date: "Today, 09:42 AM",
    words: "+218 words",
    secondary: "-34 words",
    tone: "coral",
    current: true,
  },
  {
    id: "v41",
    version: "v41",
    title: "Researcher feedback pass",
    type: "Manual snapshot",
    detail: "“Before supervisor feedback” — named by Mahnoor",
    author: "Mahnoor",
    date: "Today, 08:15 AM",
    words: "+512 words",
    secondary: "",
    tone: "gold",
  },
  {
    id: "v38",
    version: "v38",
    title: "Contradiction check",
    type: "Auto-saved",
    detail: "Auto-saved after resolving contradiction in §2.1",
    author: "You",
    date: "Yesterday, 11:39 PM",
    words: "-1,204 words",
    secondary: "",
    tone: "mint",
  },
  {
    id: "v35",
    version: "v35",
    title: "Shared draft",
    type: "Manual snapshot",
    detail: "Draft shared with research supervisor",
    author: "You",
    date: "Yesterday, 06:22 PM",
    words: "+88 words",
    secondary: "-12 words",
    tone: "blue",
  },
  {
    id: "v31",
    version: "v31",
    title: "Structure suggestions applied",
    type: "Auto-saved",
    detail: "Auto-saved after structure suggestions were applied",
    author: "You",
    date: "Aug 28, 04:10 PM",
    words: "-304 words",
    secondary: "",
    tone: "mint",
  },
];

const filters = [
  { id: "all", label: "All versions", count: "21" },
  { id: "auto", label: "Auto-saved", count: "16" },
  { id: "manual", label: "Manual snapshots", count: "05" },
];

function BrandMark() {
  return (
    <span className="history-brand-mark" aria-hidden="true">
      <FileText size={17} strokeWidth={2.4} />
    </span>
  );
}

function VersionBadge({ type }) {
  const isManual = type === "Manual snapshot";
  return (
    <span className={`history-type-badge ${isManual ? "history-type-manual" : "history-type-auto"}`}>
      {isManual ? <Star size={10} /> : <Sparkles size={10} />}
      {isManual ? "Manual snapshot" : "Auto-saved"}
    </span>
  );
}

function VersionCard({ version, compareSelected, onCompare, onPreview, onRestore, onDownload, onMore }) {
  return (
    <article className={`history-version-card history-version-card-${version.tone} ${version.current ? "history-version-card-current" : ""}`}>
      <div className="history-version-marker" aria-hidden="true">
        {version.current ? <Check size={13} strokeWidth={3} /> : <span />}
      </div>
      <div className="history-version-content">
        <div className="history-version-topline">
          <div className="history-version-titleline">
            <strong>{version.version}</strong>
            <h3>{version.title}</h3>
            {version.current && <span className="history-current-badge">Current</span>}
            <VersionBadge type={version.type} />
          </div>
          <time dateTime="2026-08-31">{version.date}</time>
        </div>
        <p className="history-version-detail">
          {version.detail} <span>· by {version.author}</span>
        </p>
        <div className="history-version-bottom">
          <div className="history-change-pills">
            <span className="history-change-pill history-change-positive">{version.words}</span>
            {version.secondary && <span className="history-change-pill history-change-negative">{version.secondary}</span>}
          </div>
          <div className="history-version-actions">
            {!version.current && (
              <label className={`history-compare-check ${compareSelected ? "history-compare-check-selected" : ""}`}>
                <input type="checkbox" checked={compareSelected} onChange={() => onCompare(version.id)} />
                <span>Compare</span>
              </label>
            )}
            <button type="button" onClick={() => onRestore(version)} title={`Restore ${version.version}`}>
              <RotateCcw size={12} />
              Restore
            </button>
            <button type="button" onClick={() => onPreview(version)} title={`Preview ${version.version}`}>
              <Eye size={12} />
              Preview
            </button>
            <button type="button" onClick={() => onDownload(version)} title={`Download ${version.version}`}>
              <Download size={12} />
              Download
            </button>
            <button className="history-more-button" type="button" onClick={() => onMore(version)} aria-label={`More options for ${version.version}`}>
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CompareModal({ versions, onClose, onRestore }) {
  const [before, after] = versions;

  return (
    <div className="history-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="history-compare-modal" role="dialog" aria-modal="true" aria-labelledby="compare-title">
        <div className="history-modal-header">
          <div>
            <span className="history-eyebrow"><GitCompareArrows size={12} /> Side-by-side review</span>
            <h2 id="compare-title">What changed between {before.version} and {after.version}?</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close comparison"><X size={17} /></button>
        </div>
        <div className="history-compare-columns">
          <div className="history-compare-column">
            <span className="history-compare-label">Earlier version</span>
            <strong>{before.version} · {before.title}</strong>
            <p>“The study examines how privacy-preserving systems can support student research practices across three faculties.”</p>
            <span className="history-removed">− removed 34 words</span>
          </div>
          <div className="history-compare-column history-compare-column-after">
            <span className="history-compare-label">Newer version</span>
            <strong>{after.version} · {after.title}</strong>
            <p>“This study examines how privacy-preserving artificial intelligence can support student research practices without turning personal archives into training material.”</p>
            <span className="history-added">+ added 218 words</span>
          </div>
        </div>
        <div className="history-modal-footer">
          <span><LockKeyhole size={13} /> Comparison stays on this device</span>
          <div>
            <button className="history-secondary-button" type="button" onClick={onClose}>Close</button>
            <button className="history-primary-button" type="button" onClick={() => onRestore(after)}>
              <RotateCcw size={13} />
              Restore {after.version}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VersionHistory() {
  const [versions, setVersions] = useState(initialVersions);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [compareIds, setCompareIds] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [snapshotOpen, setSnapshotOpen] = useState(false);
  const [snapshotName, setSnapshotName] = useState("");
  const [snapshotNote, setSnapshotNote] = useState("");
  const [previewVersion, setPreviewVersion] = useState(null);
  const [toast, setToast] = useState("");

  // Document and Profile Dropdown states
  const [selectedDoc, setSelectedDoc] = useState("FYP_Phase2_Report.docx");
  const [docDropdownOpen, setDocDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Global Shared Theme Context
  const { darkMode, toggleDarkMode } = useTheme();

  // Workspace Chrome Shell States
  const [activeNav, setActiveNav] = useState('Version history');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState(null);

  const docDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (docDropdownRef.current && !docDropdownRef.current.contains(event.target)) {
        setDocDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const visibleVersions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return versions.filter((version) => {
      const matchesFilter = activeFilter === "all"
        || (activeFilter === "auto" && version.type === "Auto-saved")
        || (activeFilter === "manual" && version.type === "Manual snapshot");
      const matchesSearch = !normalizedSearch
        || `${version.version} ${version.title} ${version.detail} ${version.author}`.toLowerCase().includes(normalizedSearch);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchTerm, versions]);

  const compareVersions = compareIds.map((id) => versions.find((version) => version.id === id)).filter(Boolean);

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 2) {
        notify("Choose up to two versions to compare.");
        return current;
      }
      return [...current, id];
    });
  };

  const handleRestore = (version) => {
    setVersions((current) => current.map((item) => ({ ...item, current: item.id === version.id })));
    setCompareIds([]);
    setCompareOpen(false);
    setPreviewVersion(null);
    notify(`${version.version} is now the current version.`);
  };

  const handleCreateSnapshot = (event) => {
    event.preventDefault();
    const name = snapshotName.trim() || "Untitled snapshot";
    const nextVersionNumber = Math.max(
      ...versions.map((version) => Number(version.version.replace("v", "")) || 0),
      42,
    ) + 1;
    const newVersion = {
      id: `snapshot-${Date.now()}`,
      version: `v${nextVersionNumber}`,
      title: name,
      type: "Manual snapshot",
      detail: snapshotNote.trim() || "A named checkpoint created from the editor",
      author: "You",
      date: "Just now",
      words: "+0 words",
      secondary: "",
      tone: "gold",
    };
    setVersions((current) => [newVersion, ...current]);
    setSnapshotName("");
    setSnapshotNote("");
    setSnapshotOpen(false);
    notify("Manual snapshot created.");
  };

  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
    if (route && label !== 'Version history') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Features') return navigate('/features');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Help and Guide') return navigate('/help');
    if (label === 'Storage') return navigate('/storage');
    if (label === 'Share Document') return navigate('/share');

    setActiveNav(label);
    if (label !== 'Version history') notify(`${label} view selected`);
    setMobileSidebar(false);
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

      <main className={`dash-main history-main-area ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <div className="history-shell">
          <div className="history-orbit history-orbit-one" aria-hidden="true" />
          <div className="history-orbit history-orbit-two" aria-hidden="true" />
          <section className="history-app">
            
            {/* Topbar */}
            <header className="history-topbar">
              <div className="history-topbar-left">
                <button className="history-back-button" type="button" onClick={() => navigate('/dashboard')} aria-label="Back to documents">
                  <ArrowLeft size={15} />
                </button>
                <BrandMark />
                <div className="history-brand-copy">
                  <strong>Docu<span>Mend</span></strong>
                  <span>PRIVATE DOCUMENT WORKSPACE</span>
                </div>
                <span className="history-topbar-divider" />

                {/* Document Selector Dropdown */}
                <div className="history-doc-dropdown-wrap" ref={docDropdownRef}>
                  <button 
                    type="button" 
                    className={`history-selected-file history-clickable-pill ${docDropdownOpen ? 'is-active' : ''}`}
                    onClick={() => setDocDropdownOpen((prev) => !prev)}
                  >
                    <FileText size={14} />
                    <span>{selectedDoc}</span>
                    <ChevronDown size={13} className={`history-chevron-icon ${docDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {docDropdownOpen && (
                    <div className="history-doc-dropdown-menu">
                      <div className="history-dropdown-header">Select Document</div>
                      {availableDocs.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          className={`history-doc-dropdown-item ${selectedDoc === doc.name ? 'is-selected' : ''}`}
                          onClick={() => {
                            setSelectedDoc(doc.name);
                            setDocDropdownOpen(false);
                            notify(`Loaded history for ${doc.name}`);
                          }}
                        >
                          <FileText size={13} />
                          <span>{doc.name}</span>
                          {selectedDoc === doc.name && <Check size={13} className="history-check-icon" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="history-topbar-right">
                <span className="history-local-status"><span /> All changes saved locally</span>
                <button className="history-open-editor" type="button" onClick={() => navigate('/editor')}>
                  Open editor
                  <ArrowLeft className="history-open-editor-arrow" size={14} />
                </button>

                {/* Profile Avatar Dropdown */}
                <div className="history-profile-dropdown-wrap" ref={profileDropdownRef}>
                  <button 
                    type="button" 
                    className="history-avatar history-avatar-btn"
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    aria-label="User Profile Menu"
                  >
                    MA
                  </button>

                  {profileDropdownOpen && (
                    <div className="history-profile-dropdown-menu">
                      <div className="history-profile-info">
                        <strong>Mahnoor</strong>
                        <small>mahnooraslam@gmail.com</small>
                      </div>
                      <div className="history-dropdown-divider" />
                      <button 
                        type="button" 
                        className="history-dropdown-item"
                        onClick={() => { setProfileDropdownOpen(false); navigate('/pricing'); }}
                      >
                        <Sparkles size={14} />
                        <span>Subscription / Plans</span>
                      </button>
                      <button 
                        type="button" 
                        className="history-dropdown-item"
                        onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                      >
                        <Settings size={14} />
                        <span>Workspace Settings</span>
                      </button>
                      <div className="history-dropdown-divider" />
                      <button 
                        type="button" 
                        className="history-dropdown-item history-logout-item"
                        onClick={() => { setProfileDropdownOpen(false); setModal('logout'); }}
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="history-content">
              <div className="history-breadcrumbs">
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Workspace</span>
                <ChevronDown size={11} />
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>Documents</span>
                <ChevronDown size={11} />
                <strong>Version history</strong>
              </div>

              <section className="history-hero">
                <div className="history-hero-copy">
                  <span className="history-eyebrow"><History size={12} /> Document memory</span>
                  <h1>Version<br /><em>history.</em></h1>
                  <p>Follow every meaningful change and return to any point in your document without losing the thread.</p>
                  <div className="history-document-chip">
                    <span className="history-document-chip-icon"><FileText size={15} /></span>
                    <span><strong>{selectedDoc.replace('.docx', '')}</strong><small>Last edited today · 42 pages</small></span>
                    <span className="history-document-chip-state"><CheckCircle2 size={13} /> Synced</span>
                  </div>
                </div>
                <div className="history-stat-grid">
                  <div className="history-stat-card history-stat-card-featured">
                    <span className="history-stat-icon"><History size={15} /></span>
                    <strong>21</strong>
                    <span>Total revisions</span>
                    <small>since Aug 14</small>
                  </div>
                  <div className="history-stat-card">
                    <span className="history-stat-icon"><Star size={15} /></span>
                    <strong>05</strong>
                    <span>Named snapshots</span>
                    <small>kept by you</small>
                  </div>
                  <div className="history-stat-card">
                    <span className="history-stat-icon"><ShieldCheck size={15} /></span>
                    <strong>100%</strong>
                    <span>Local history</span>
                    <small>nothing uploaded</small>
                  </div>
                </div>
              </section>

              <section className="history-toolbar-section">
                <div className="history-filter-tabs" role="tablist" aria-label="Version filters">
                  {filters.map((filter) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeFilter === filter.id}
                      className={activeFilter === filter.id ? "history-filter-tab-active" : ""}
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                      <span>{filter.count}</span>
                    </button>
                  ))}
                </div>
                <div className="history-toolbar-actions">
                  <label className="history-search">
                    <Search size={14} />
                    <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search versions" aria-label="Search versions" />
                  </label>
                  <div className="history-filter-wrap">
                    <button className={`history-tool-button ${filterOpen ? "history-tool-button-active" : ""}`} type="button" onClick={() => setFilterOpen((current) => !current)}>
                      <Filter size={13} />
                      Filter
                      <ChevronDown size={11} />
                    </button>
                    {filterOpen && (
                      <div className="history-filter-menu">
                        <span>Show revisions</span>
                        <button type="button" onClick={() => { setActiveFilter("all"); setFilterOpen(false); }}>All versions <Check size={12} /></button>
                        <button type="button" onClick={() => { setActiveFilter("auto"); setFilterOpen(false); }}>Auto-saved</button>
                        <button type="button" onClick={() => { setActiveFilter("manual"); setFilterOpen(false); }}>Manual snapshots</button>
                      </div>
                    )}
                  </div>
                  <button className={`history-compare-button ${compareIds.length ? "history-compare-button-ready" : ""}`} type="button" onClick={() => compareIds.length === 2 ? setCompareOpen(true) : notify("Select two versions to compare.")}>
                    <GitCompareArrows size={13} />
                    Compare
                    {compareIds.length > 0 && <span>{compareIds.length}</span>}
                  </button>
                </div>
              </section>

              <section className="history-timeline-section">
                <div className="history-section-heading">
                  <div>
                    <span className="history-eyebrow">Document timeline</span>
                    <h2>{selectedDoc.replace('.docx', '')} <small>{visibleVersions.length} moments shown</small></h2>
                  </div>
                  <button className="history-snapshot-button" type="button" onClick={() => setSnapshotOpen(true)}>
                    <Plus size={14} />
                    Create snapshot
                  </button>
                </div>

                {visibleVersions.length > 0 ? (
                  <div className="history-timeline">
                    <div className="history-timeline-line" aria-hidden="true" />
                    {visibleVersions.map((version) => (
                      <VersionCard
                        key={version.id}
                        version={version}
                        compareSelected={compareIds.includes(version.id)}
                        onCompare={toggleCompare}
                        onPreview={setPreviewVersion}
                        onRestore={handleRestore}
                        onDownload={(item) => notify(`${item.version} download prepared locally.`)}
                        onMore={(item) => notify(`More options for ${item.version} are coming next.`)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="history-empty-state">
                    <span><Search size={18} /></span>
                    <strong>No versions found</strong>
                    <p>Try a different search term or choose another version filter.</p>
                    <button type="button" onClick={() => { setSearchTerm(""); setActiveFilter("all"); }}>Clear filters</button>
                  </div>
                )}
              </section>

              <footer className="history-footer">
                <span><LockKeyhole size={13} /> Version history is stored locally and protected by your private workspace.</span>
                <button type="button" onClick={() => notify("Privacy details are available in your workspace settings.")}>Learn about privacy <ArrowLeft size={12} className="history-footer-arrow" /></button>
              </footer>
            </div>

            {compareIds.length > 0 && (
              <div className="history-compare-dock">
                <div className="history-compare-dock-copy">
                  <span className="history-dock-icon"><GitCompareArrows size={15} /></span>
                  <span><strong>{compareIds.length} version{compareIds.length > 1 ? "s" : ""} selected</strong><small>{compareIds.length === 2 ? "Ready for a side-by-side review" : "Select one more version to compare"}</small></span>
                </div>
                <div>
                  <button type="button" onClick={() => setCompareIds([])}>Clear</button>
                  <button type="button" disabled={compareIds.length !== 2} onClick={() => setCompareOpen(true)}>Compare changes <GitCompareArrows size={13} /></button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Snapshot Modal */}
      {snapshotOpen && (
        <div className="history-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSnapshotOpen(false)}>
          <form className="history-snapshot-modal" onSubmit={handleCreateSnapshot}>
            <div className="history-modal-header">
              <div>
                <span className="history-eyebrow"><Star size={12} /> Keep this moment</span>
                <h2>Name your snapshot.</h2>
              </div>
              <button type="button" onClick={() => setSnapshotOpen(false)} aria-label="Close snapshot form"><X size={17} /></button>
            </div>
            <label>Snapshot name<input autoFocus value={snapshotName} onChange={(event) => setSnapshotName(event.target.value)} placeholder="e.g. Before supervisor feedback" /></label>
            <label>Optional note<textarea value={snapshotNote} onChange={(event) => setSnapshotNote(event.target.value)} placeholder="What should you remember about this version?" rows={3} /></label>
            <div className="history-modal-footer">
              <span><LockKeyhole size={13} /> Saved to your private history</span>
              <div>
                <button className="history-secondary-button" type="button" onClick={() => setSnapshotOpen(false)}>Cancel</button>
                <button className="history-primary-button" type="submit"><Check size={13} /> Create snapshot</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Preview Modal */}
      {previewVersion && (
        <div className="history-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPreviewVersion(null)}>
          <section className="history-preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title">
            <div className="history-modal-header">
              <div>
                <span className="history-eyebrow"><Eye size={12} /> Read-only preview</span>
                <h2 id="preview-title">{previewVersion.version} · {previewVersion.title}</h2>
              </div>
              <button type="button" onClick={() => setPreviewVersion(null)} aria-label="Close preview"><X size={17} /></button>
            </div>
            <div className="history-preview-paper">
              <div className="history-preview-paper-topline"><span>{selectedDoc.toUpperCase()}</span><span>{previewVersion.version}</span></div>
              <div className="history-preview-rule" />
              <span className="history-preview-kicker">Research manuscript · read-only</span>
              <h3>Privacy-preserving AI in academic research</h3>
              <p>This snapshot preserves the document exactly as it was when <strong>{previewVersion.detail.toLowerCase()}</strong>. Review the language, structure, and editorial decisions before returning to your current draft.</p>
              <p>Every version stays available as a quiet checkpoint, so you can experiment without losing the shape of your original thinking.</p>
              <div className="history-preview-paper-footer"><span>Private workspace copy</span><span>01</span></div>
            </div>
            <div className="history-modal-footer">
              <span><LockKeyhole size={13} /> Preview cannot change your current draft</span>
              <div>
                <button className="history-secondary-button" type="button" onClick={() => setPreviewVersion(null)}>Close preview</button>
                <button className="history-primary-button" type="button" onClick={() => handleRestore(previewVersion)}><RotateCcw size={13} /> Restore this version</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Compare Modal */}
      {compareOpen && compareVersions.length === 2 && (
        <CompareModal versions={compareVersions} onClose={() => setCompareOpen(false)} onRestore={handleRestore} />
      )}

      {/* Logout / Workspace Dialog Modal */}
      <WorkspaceModal
        mode={modal}
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="history-toast" role="status" aria-live="polite">
          <span><Check size={13} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}