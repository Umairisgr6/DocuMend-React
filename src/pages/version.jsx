import React, { useMemo, useState } from "react";
import "./version.css";
const versions = [
  {
    id: "v42",
    version: "v42",
    title: "Current version",
    kind: "auto",
    badge: "Live",
    tone: "lime",
    time: "Today, 09:42 AM",
    description: "Auto-saved after editing Section 3.2 Methodology",
    changes: ["+218 words", "-34 words"],
    author: "You",
    current: true,
  },
  {
    id: "v41",
    version: "v41",
    title: "Manual Snapshot",
    kind: "manual",
    badge: "Named",
    tone: "blue",
    time: "Today, 08:15 AM",
    description: "“Before supervisor feedback” — named by Mahnoor",
    changes: ["+512 words"],
    author: "Mahnoor",
  },
  {
    id: "v38",
    version: "v38",
    title: "Auto-saved",
    kind: "auto",
    badge: "Auto-save",
    tone: "green",
    time: "Yesterday, 11:30 PM",
    description: "Auto-saved after contradiction fix in §2.1",
    changes: ["+1,240 words"],
    author: "You",
  },
  {
    id: "v35",
    version: "v35",
    title: "Manual Snapshot",
    kind: "manual",
    badge: "Named",
    tone: "blue",
    time: "Yesterday, 06:22 PM",
    description: "Draft shared with the research supervisor",
    changes: ["+86 words", "-12 words"],
    author: "You",
  },
  {
    id: "v31",
    version: "v31",
    title: "Auto-saved",
    kind: "auto",
    badge: "Auto-save",
    tone: "green",
    time: "Aug 28, 04:10 PM",
    description: "Auto-saved after structure suggestions were applied",
    changes: ["+304 words"],
    author: "You",
  },
];
function Icon({ name, size = 17 }) {
  const icons = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    file: (
      <>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
      </>
    ),
    edit: (
      <>
        <path d="m4 16-.8 4.8L8 20l11.7-11.7a2.3 2.3 0 0 0-3.2-3.2z" />
        <path d="m14.5 6.5 3 3" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 4v5h5M12 7v5l3 2" />
      </>
    ),
    card: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="M3 10h18M7 15h4" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
    ),
    lock: (
      <>
        <rect height="10" rx="2" width="14" x="5" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2H15V5a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14H21a1.7 1.7 0 0 0-1.6 1z" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </>
    ),
    filter: (
      <>
        <path d="M4 6h16M7 12h10M10 18h4" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    restore: (
      <>
        <path d="M4 9a8 8 0 1 1 1.6 7.7" />
        <path d="M4 4v5h5M12 8v4l3 2" />
      </>
    ),
    compare: (
      <>
        <rect height="14" rx="2" width="8" x="3" y="5" />
        <rect height="14" rx="2" width="8" x="13" y="5" />
        <path d="M11 9h2M11 15h2" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      className="version-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {icons[name]}
    </svg>
  );
}
function Brand() {
  return (
    <div className="version-brand">
      <div className="version-brand-mark">
        <span />
      </div>
      <div>
        <strong>
          Docu<span>Mend</span>
        </strong>
        <small>Intelligent document workspace</small>
      </div>
    </div>
  );
}
function Sidebar({ activePage, onNavigate }) {
  const links = [
    ["Dashboard", "home"],
    ["My Documents", "file"],
    ["Editor", "edit"],
    ["Version History", "history"],
    ["Subscription", "card"],
    ["Features", "star"],
    ["Privacy Mode", "lock"],
    ["Settings", "settings"],
  ];
  return (
    <aside className="version-sidebar">
      <Brand />
      <nav className="version-navigation">
        {links.map(([label, icon]) => (
          <button
            className={activePage === label ? "active" : ""}
            key={label}
            onClick={() => onNavigate(label)}
            type="button"
          >
            <Icon name={icon} size={15} />
            <span>{label}</span>
            {label === "Version History" && <b>7</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button type="button">
          <Icon name="menu" size={14} />
          Help & Guide
        </button>
        <button type="button">
          <Icon name="logout" size={14} />
          Logout
        </button>
        <div className="sidebar-user">
          <span className="sidebar-avatar">LS</span>
          <div>
            <strong>Mahnoor</strong>
            <small>Private workspace</small>
          </div>
          <Icon name="more" size={14} />
        </div>
      </div>
    </aside>
  );
}
function VersionCard({
  version,
  selected,
  onSelect,
  onPreview,
  onRestore,
  onDownload,
  onCompare,
}) {
  return (
    <article className={`version-card ${version.current ? "current" : ""}`}>
      <div className={`timeline-node ${version.tone}`}>
        {version.current && <span />}
      </div>
      <div className="version-card-main">
        <div className="version-card-top">
          <div className="version-title">
            <span className="version-code">{version.version}</span>
            <h3>{version.title}</h3>
            <span className={`version-badge ${version.tone}`}>
              {version.badge}
            </span>
          </div>
          <time>{version.time}</time>
        </div>
        <p className="version-description">
          {version.description}
          <span className="version-author">by {version.author}</span>
        </p>
        <div className="version-card-bottom">
          <div className="change-pills">
            {version.changes.map((change) => (
              <span
                className={change.startsWith("-") ? "negative" : "positive"}
                key={change}
              >
                {change}
              </span>
            ))}
          </div>
          <div className="version-actions">
            {!version.current && (
              <label className="compare-check">
                <input
                  checked={selected}
                  onChange={() => onSelect(version.id)}
                  type="checkbox"
                />
                <span>Compare</span>
              </label>
            )}
            <button onClick={() => onRestore(version)} type="button">
              <Icon name="restore" size={14} />
              Restore
            </button>
            <button onClick={() => onPreview(version)} type="button">
              <Icon name="eye" size={14} />
              Preview
            </button>
            <button onClick={() => onDownload(version)} type="button">
              <Icon name="download" size={14} />
              Download
            </button>
            {version.current && (
              <button className="more-version" type="button">
                <Icon name="more" size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function PreviewModal({ version, onClose, onRestore }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        aria-modal="true"
        className="preview-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className="modal-kicker">VERSION PREVIEW</span>
            <h2>
              {version.version} · {version.title}
            </h2>
            <p>{version.time}</p>
          </div>
          <button onClick={onClose} type="button">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="preview-paper">
          <div className="preview-paper-label">FYP PHASE 2 / REPORT</div>
          <h1>Research methodology</h1>
          <div className="preview-line short" />
          <div className="preview-line" />
          <div className="preview-line" />
          <div className="preview-highlight">
            This version includes the latest methodology edits and source
            references.
          </div>
          <div className="preview-line" />
          <div className="preview-line medium" />
          <div className="preview-line" />
          <div className="preview-line short" />
        </div>
        <div className="modal-footer">
          <span>
            <Icon name="lock" size={13} /> Preview is read-only
          </span>
          <div>
            <button className="secondary-button" onClick={onClose} type="button">
              Close
            </button>
            <button
              className="primary-button"
              onClick={() => onRestore(version)}
              type="button"
            >
              Restore this version
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
export default function VersionHistory() {
  const [activePage, setActivePage] = useState("Version History");
  const [filter, setFilter] = useState("All versions");
  const [query, setQuery] = useState("");
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [previewVersion, setPreviewVersion] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const filteredVersions = useMemo(() => {
    return versions.filter((version) => {
      const matchesFilter =
        filter === "All versions" ||
        (filter === "Auto-saved" && version.kind === "auto") ||
        (filter === "Manual snapshots" && version.kind === "manual");
      const searchText =
        `${version.version} ${version.title} ${version.description}`.toLowerCase();
      return matchesFilter && searchText.includes(query.toLowerCase());
    });
  }, [filter, query]);
  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };
  const selectVersion = (id) => {
    setSelectedVersions((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }
      if (current.length >= 2) {
        notify("You can compare only two versions at a time");
        return current;
      }
      return [...current, id];
    });
  };
  const handleRestore = (version) => {
    setPreviewVersion(null);
    notify(`${version.version} restored successfully`);
  };
  const handleDownload = (version) => {
    notify(`${version.version} download prepared`);
  };
  const compareVersions = () => {
    if (selectedVersions.length !== 2) {
      notify("Select two versions to compare");
      return;
    }
    notify(`Comparing ${selectedVersions[0]} with ${selectedVersions[1]}`);
  };
  return (
    <main className="version-app">
      <div className="mobile-topbar">
        <button
          aria-label="Open navigation"
          className="mobile-menu-button"
          onClick={() => setMobileMenu(true)}
          type="button"
        >
          <Icon name="menu" />
        </button>
        <Brand />
        <span className="mobile-avatar">LS</span>
      </div>
      <div className={`version-layout ${mobileMenu ? "mobile-open" : ""}`}>
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        {mobileMenu && (
          <button
            aria-label="Close navigation"
            className="mobile-overlay"
            onClick={() => setMobileMenu(false)}
            type="button"
          />
        )}
        <section className="version-content">
          <header className="version-header">
            <div className="version-file">
              <span className="file-preview-icon">
                <Icon name="file" size={18} />
              </span>
              <div>
                <span>FYP / RESEARCH PAPER</span>
                <h1>FYP_Phase2_Report.docx</h1>
              </div>
            </div>
            <div className="header-actions">
              <button
                onClick={() => notify("Editor opened")}
                type="button"
              >
                Open editor
                <Icon name="edit" size={14} />
              </button>
              <button className="header-avatar" type="button">
                LS
              </button>
            </div>
          </header>
          <div className="version-inner">
            <div className="page-heading">
              <div>
                <div className="breadcrumb">
                  Workspace <span>/</span> Documents <span>/</span> History
                </div>
                <h2>Version history</h2>
                <p>
                  Follow every meaningful change and return to any point in
                  your document.
                </p>
              </div>
              <div className="heading-stats">
                <div>
                  <strong>21</strong>
                  <span>total versions</span>
                </div>
                <div>
                  <strong>02m</strong>
                  <span>last saved</span>
                </div>
                <div>
                  <strong>100%</strong>
                  <span>private</span>
                </div>
              </div>
            </div>
            <div className="history-toolbar">
              <div className="filter-tabs">
                {["All versions", "Auto-saved", "Manual snapshots"].map(
                  (item) => (
                    <button
                      className={filter === item ? "active" : ""}
                      key={item}
                      onClick={() => setFilter(item)}
                      type="button"
                    >
                      {item}
                      {item === "All versions" && <small>7</small>}
                    </button>
                  )
                )}
              </div>
              <div className="toolbar-right">
                <label className="search-box">
                  <Icon name="search" size={15} />
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search versions"
                    value={query}
                  />
                </label>
                <button
                  className="filter-button"
                  onClick={() => setFilter("All versions")}
                  type="button"
                >
                  <Icon name="filter" size={14} />
                  Filter
                </button>
                <button
                  className="compare-button"
                  disabled={selectedVersions.length !== 2}
                  onClick={compareVersions}
                  type="button"
                >
                  <Icon name="compare" size={14} />
                  Compare {selectedVersions.length > 0 && `(${selectedVersions.length}/2)`}
                </button>
              </div>
            </div>
            <section className="timeline-section">
              <div className="timeline-heading">
                <div>
                  <span className="section-eyebrow">DOCUMENT TIMELINE</span>
                  <h3>
                    FYP Phase 2 Report
                    <span>{filteredVersions.length} versions</span>
                  </h3>
                </div>
                <button
                  className="snapshot-button"
                  onClick={() => notify("Manual snapshot created")}
                  type="button"
                >
                  <Icon name="star" size={14} />
                  Create snapshot
                </button>
              </div>
              <div className="version-timeline">
                {filteredVersions.length === 0 ? (
                  <div className="empty-history">
                    <Icon name="search" size={22} />
                    <h3>No versions found</h3>
                    <p>Try another search or filter.</p>
                  </div>
                ) : (
                  filteredVersions.map((version) => (
                    <VersionCard
                      key={version.id}
                      onCompare={selectVersion}
                      onDownload={handleDownload}
                      onPreview={setPreviewVersion}
                      onRestore={handleRestore}
                      onSelect={selectVersion}
                      selected={selectedVersions.includes(version.id)}
                      version={version}
                    />
                  ))
                )}
              </div>
            </section>
            <footer className="privacy-note">
              <Icon name="lock" size={14} />
              <span>
                Version history is stored locally and protected by your
                private workspace.
              </span>
              <button type="button">Learn about privacy</button>
            </footer>
          </div>
        </section>
      </div>
      {previewVersion && (
        <PreviewModal
          onClose={() => setPreviewVersion(null)}
          onRestore={handleRestore}
          version={previewVersion}
        />
      )}
      {toast && (
        <div className="version-toast">
          <span>
            <Icon name="check" size={14} />
          </span>
          {toast}
        </div>
      )}
    </main>
  );
}