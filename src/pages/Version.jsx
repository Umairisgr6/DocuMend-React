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
import { BrandMark } from '../components/BrandMark';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';
import { useLiveQuery } from 'dexie-react-hooks';
import { listDocuments } from '../storage/documents';
import { createVersion, listVersions, restoreVersion } from '../storage/versions';
import { formatModified, pageLabel, pagesFor } from '../storage/format';
import { downloadText, paragraphsOf, sanitizeHtml } from '../storage/html';
import "./version.css";

/** "Today, 9:42 am" */
function when(ms) {
  const text = formatModified(ms);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function wordChange(delta) {
  return {
    words: delta >= 0 ? `+${delta.toLocaleString()} words` : '',
    secondary: delta < 0 ? `−${(-delta).toLocaleString()} words` : '',
  };
}

/** A stored version, shaped for VersionCard. `older` is the version saved just before it. */
function toCard(version, older) {
  const manual = version.kind === 'manual';
  return {
    id: version.id,
    raw: version,
    version: `v${version.number}`,
    title: version.label || (manual ? 'Named snapshot' : 'Auto-saved checkpoint'),
    type: manual ? 'Manual snapshot' : 'Auto-saved',
    detail: version.note || (manual ? 'A snapshot you created' : 'Saved automatically while you were writing'),
    author: 'You',
    date: when(version.createdAt),
    createdAt: version.createdAt,
    content: version.content,
    wordCount: version.wordCount ?? 0,
    tone: manual ? 'gold' : 'mint',
    ...wordChange((version.wordCount ?? 0) - (older?.wordCount ?? 0)),
  };
}

/** The document as it is now, shown at the top of the timeline. */
function currentCard(doc, latest) {
  return {
    id: 'current',
    version: 'Now',
    title: 'Current version',
    type: 'Auto-saved',
    detail: 'What the editor shows right now',
    author: 'You',
    date: when(doc.updatedAt),
    createdAt: doc.updatedAt,
    content: doc.content ?? '',
    wordCount: doc.wordCount ?? 0,
    tone: 'coral',
    current: true,
    ...wordChange((doc.wordCount ?? 0) - (latest?.wordCount ?? 0)),
  };
}

/** The ?doc=<id> the page was opened with, if any. */
function docIdFromUrl() {
  try {
    return new URLSearchParams(window.location.search).get('doc');
  } catch {
    return null;
  }
}

// The local mark is gone; the logo comes from components/BrandMark.jsx.

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
          <time dateTime={new Date(version.createdAt).toISOString()}>{version.date}</time>
        </div>
        <p className="history-version-detail">
          {version.detail} <span>· by {version.author}</span>
        </p>
        <div className="history-version-bottom">
          <div className="history-change-pills">
            {version.words && <span className="history-change-pill history-change-positive">{version.words}</span>}
            {version.secondary && <span className="history-change-pill history-change-negative">{version.secondary}</span>}
          </div>
          <div className="history-version-actions">
            {!version.current && (
              <label className={`history-compare-check ${compareSelected ? "history-compare-check-selected" : ""}`}>
                <input type="checkbox" checked={compareSelected} onChange={() => onCompare(version.id)} />
                <span>Compare</span>
              </label>
            )}
            {!version.current && (
              <button type="button" onClick={() => onRestore(version)} title={`Restore ${version.version}`}>
                <RotateCcw size={12} />
                Restore
              </button>
            )}
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
  // Older version on the left, newer on the right.
  const [before, after] = [...versions].sort((a, b) => a.createdAt - b.createdAt);
  const beforeParas = paragraphsOf(before.content);
  const afterParas = paragraphsOf(after.content);
  const afterSet = new Set(afterParas);
  const beforeSet = new Set(beforeParas);
  const removedCount = beforeParas.filter((p) => !afterSet.has(p)).length;
  const addedCount = afterParas.filter((p) => !beforeSet.has(p)).length;
  const wordDelta = after.wordCount - before.wordCount;

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
            <div className="history-diff-list">
              {beforeParas.length === 0 && <p className="history-diff-empty">This version was empty.</p>}
              {beforeParas.map((para, index) => (
                <p key={index} className={afterSet.has(para) ? '' : 'history-diff-removed'}>{para}</p>
              ))}
            </div>
            <span className="history-removed">− {removedCount} {removedCount === 1 ? 'paragraph' : 'paragraphs'} removed or changed</span>
          </div>
          <div className="history-compare-column history-compare-column-after">
            <span className="history-compare-label">Newer version</span>
            <strong>{after.version} · {after.title}</strong>
            <div className="history-diff-list">
              {afterParas.length === 0 && <p className="history-diff-empty">This version was empty.</p>}
              {afterParas.map((para, index) => (
                <p key={index} className={beforeSet.has(para) ? '' : 'history-diff-added'}>{para}</p>
              ))}
            </div>
            <span className="history-added">+ {addedCount} {addedCount === 1 ? 'paragraph' : 'paragraphs'} added or changed · {wordDelta >= 0 ? '+' : '−'}{Math.abs(wordDelta).toLocaleString()} words</span>
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
  // Real documents and their saved versions, from IndexedDB.
  const storedDocuments = useLiveQuery(listDocuments, []);
  const [selectedDocId, setSelectedDocId] = useState(docIdFromUrl);
  const doc = storedDocuments?.find((item) => item.id === selectedDocId) ?? null;
  const storedVersions = useLiveQuery(() => listVersions(selectedDocId), [selectedDocId]) ?? [];
  const versions = useMemo(() => {
    const cards = storedVersions.map((version, index) => toCard(version, storedVersions[index + 1]));
    return doc ? [currentCard(doc, storedVersions[0]), ...cards] : cards;
  }, [doc, storedVersions]);
  const manualCount = storedVersions.filter((version) => version.kind === 'manual').length;
  const filters = [
    { id: "all", label: "All versions", count: String(storedVersions.length) },
    { id: "auto", label: "Auto-saved", count: String(storedVersions.length - manualCount) },
    { id: "manual", label: "Manual snapshots", count: String(manualCount) },
  ];
  const selectedDocTitle = doc?.title ?? (storedDocuments?.length === 0 ? 'No documents yet' : 'Choose a document');
  const oldestVersion = storedVersions[storedVersions.length - 1];
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

  // Opened without ?doc= (or with a deleted one): show the most recent document.
  useEffect(() => {
    if (!storedDocuments?.length) return;
    if (!selectedDocId || !storedDocuments.some((item) => item.id === selectedDocId)) {
      setSelectedDocId(storedDocuments[0].id);
    }
  }, [storedDocuments, selectedDocId]);

  const chooseDocument = (id) => {
    setSelectedDocId(id);
    setCompareIds([]);
    window.history.replaceState({}, '', `/version?doc=${id}`);
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

  const handleRestore = async (version) => {
    if (version.current) {
      notify("This is already the current version.");
      return;
    }
    try {
      await restoreVersion(version.raw);
      setCompareIds([]);
      setCompareOpen(false);
      setPreviewVersion(null);
      notify(`${version.version} restored. The text it replaced was kept as a version.`);
    } catch (error) {
      console.error(error);
      notify("That version could not be restored. Try again.");
    }
  };

  const handleCreateSnapshot = async (event) => {
    event.preventDefault();
    if (!doc) {
      notify("Create a document first, then take a snapshot of it.");
      return;
    }
    try {
      await createVersion(doc.id, {
        kind: 'manual',
        label: snapshotName.trim() || "Untitled snapshot",
        note: snapshotNote,
      });
      setSnapshotName("");
      setSnapshotNote("");
      setSnapshotOpen(false);
      notify("Snapshot created.");
    } catch (error) {
      console.error(error);
      notify("The snapshot could not be saved. Check that your browser allows site storage.");
    }
  };

  const handleDownload = (version) => {
    downloadText(`${selectedDocTitle} ${version.version}.txt`, paragraphsOf(version.content).join('\n\n'));
    notify(`${version.version} downloaded as a text file.`);
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
                <BrandMark size={31} tagline="Private document workspace" />
                <span className="history-topbar-divider" />

                {/* Document Selector Dropdown */}
                <div className="history-doc-dropdown-wrap" ref={docDropdownRef}>
                  <button 
                    type="button" 
                    className={`history-selected-file history-clickable-pill ${docDropdownOpen ? 'is-active' : ''}`}
                    onClick={() => setDocDropdownOpen((prev) => !prev)}
                  >
                    <FileText size={14} />
                    <span>{selectedDocTitle}</span>
                    <ChevronDown size={13} className={`history-chevron-icon ${docDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {docDropdownOpen && (
                    <div className="history-doc-dropdown-menu">
                      <div className="history-dropdown-header">Select Document</div>
                      {(storedDocuments ?? []).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={`history-doc-dropdown-item ${selectedDocId === item.id ? 'is-selected' : ''}`}
                          onClick={() => {
                            chooseDocument(item.id);
                            setDocDropdownOpen(false);
                          }}
                        >
                          <FileText size={13} />
                          <span>{item.title}</span>
                          {selectedDocId === item.id && <Check size={13} className="history-check-icon" />}
                        </button>
                      ))}
                      {storedDocuments?.length === 0 && <div className="history-dropdown-header">No documents yet</div>}
                    </div>
                  )}
                </div>
              </div>

              <div className="history-topbar-right">
                <span className="history-local-status"><span /> All changes saved locally</span>
                <button className="history-open-editor" type="button" onClick={() => navigate(selectedDocId ? `/editor?doc=${selectedDocId}` : '/editor')}>
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
                    <span><strong>{selectedDocTitle}</strong><small>{doc ? `Last edited ${formatModified(doc.updatedAt)} · ${pageLabel(pagesFor(doc.wordCount))}` : 'Nothing to show yet'}</small></span>
                    <span className="history-document-chip-state"><CheckCircle2 size={13} /> Saved locally</span>
                  </div>
                </div>
                <div className="history-stat-grid">
                  <div className="history-stat-card history-stat-card-featured">
                    <span className="history-stat-icon"><History size={15} /></span>
                    <strong>{storedVersions.length}</strong>
                    <span>Total revisions</span>
                    <small>{oldestVersion ? `since ${formatModified(oldestVersion.createdAt)}` : 'none saved yet'}</small>
                  </div>
                  <div className="history-stat-card">
                    <span className="history-stat-icon"><Star size={15} /></span>
                    <strong>{manualCount}</strong>
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
                    <h2>{selectedDocTitle} <small>{visibleVersions.length} moments shown</small></h2>
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
                        onDownload={handleDownload}
                        onMore={(item) => notify(`More options for ${item.version} are coming next.`)}
                      />
                    ))}
                    {storedVersions.length === 0 && doc && (
                      <p className="history-no-versions">
                        No saved versions yet. DocuMend keeps one automatically every 10 minutes while you write, or you can create a snapshot now.
                      </p>
                    )}
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
              <div className="history-preview-paper-topline"><span>{selectedDocTitle.toUpperCase()}</span><span>{previewVersion.version}</span></div>
              <div className="history-preview-rule" />
              <span className="history-preview-kicker">{previewVersion.date} · read-only</span>
              <h3>{selectedDocTitle}</h3>
              {previewVersion.content
                ? <div className="history-preview-body" dangerouslySetInnerHTML={{ __html: sanitizeHtml(previewVersion.content) }} />
                : <p>This version is empty.</p>}
              <div className="history-preview-paper-footer"><span>Private workspace copy</span><span>{previewVersion.wordCount.toLocaleString()} words</span></div>
            </div>
            <div className="history-modal-footer">
              <span><LockKeyhole size={13} /> Preview cannot change your current draft</span>
              <div>
                <button className="history-secondary-button" type="button" onClick={() => setPreviewVersion(null)}>Close preview</button>
                {!previewVersion.current && <button className="history-primary-button" type="button" onClick={() => handleRestore(previewVersion)}><RotateCcw size={13} /> Restore this version</button>}
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