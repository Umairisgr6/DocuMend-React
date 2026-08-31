import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  CloudOff,
  Code2,
  FileText,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  LockKeyhole,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Quote,
  Redo2,
  Search,
  Sparkles,
  Strikethrough,
  Underline,
  Undo2,
  X,
} from "lucide-react";
import "./editor.css";

const issueSeed = [
  {
    id: "contradiction",
    category: "Contradiction",
    tab: "critical",
    label: "Needs a closer look",
    title: "Two different sample sizes",
    excerpt: "The abstract says 120 participants, while the methodology reports 96.",
    detail: "Which figure should DocuMend keep consistent across the document?",
    accent: "coral",
    icon: CircleAlert,
    location: "Abstract · line 04",
  },
  {
    id: "structure",
    category: "Structure",
    tab: "structure",
    label: "Suggested repair",
    title: "A heading is doing too much",
    excerpt: "“Findings and discussion” combines two sections with different jobs.",
    detail: "Splitting this into two headings will make the argument easier to scan.",
    accent: "mint",
    icon: ClipboardCheck,
    location: "Section 3 · line 18",
  },
  {
    id: "redundancy",
    category: "Redundancy",
    tab: "all",
    label: "Light touch",
    title: "This point appears twice",
    excerpt: "The privacy benefit is repeated in the following two sentences.",
    detail: "Keep the first mention and let the evidence carry the weight.",
    accent: "gold",
    icon: Sparkles,
    location: "Section 3 · line 24",
  },
  {
    id: "citation",
    category: "Citation",
    tab: "citations",
    label: "Reference check",
    title: "Citation style drifts here",
    excerpt: "This source uses an author-date format while the rest use numbered notes.",
    detail: "DocuMend found a matching entry in your reference list.",
    accent: "forest",
    icon: Link2,
    location: "Section 4 · line 08",
  },
];

const toolbarGroups = [
  [
    { label: "Undo", icon: Undo2 },
    { label: "Redo", icon: Redo2 },
  ],
  [
    { label: "Bold", icon: Bold },
    { label: "Italic", icon: Italic },
    { label: "Underline", icon: Underline },
    { label: "Strikethrough", icon: Strikethrough },
  ],
  [
    { label: "Align left", icon: AlignLeft },
    { label: "Align center", icon: AlignCenter },
    { label: "Align right", icon: AlignRight },
  ],
  [
    { label: "Bulleted list", icon: List },
    { label: "Numbered list", icon: ListOrdered },
    { label: "Insert link", icon: Link2 },
    { label: "Highlight", icon: Highlighter },
  ],
];

const tabOptions = [
  { id: "all", label: "All issues" },
  { id: "critical", label: "Needs attention" },
  { id: "structure", label: "Structure" },
  { id: "citations", label: "Citations" },
];

function Wordmark() {
  return (
    <div className="editor-wordmark" aria-label="DocuMend">
      <span className="editor-mark" aria-hidden="true">
        <FileText size={16} strokeWidth={2.5} />
      </span>
      <span>
        Docu<span>Mend</span>
      </span>
    </div>
  );
}

function ToolbarButton({ action, onAction }) {
  const Icon = action.icon;
  return (
    <button className="editor-tool-button" type="button" aria-label={action.label} title={action.label} onClick={() => onAction(action.label)}>
      <Icon size={15} strokeWidth={2} />
    </button>
  );
}

function IssueCard({ issue, selected, onSelect, onResolve, onDismiss }) {
  const Icon = issue.icon;
  return (
    <article className={`issue-card issue-card-${issue.accent} ${selected ? "issue-card-selected" : ""}`}>
      <button className="issue-card-main" type="button" onClick={() => onSelect(issue.id)} aria-pressed={selected}>
        <span className="issue-icon">
          <Icon size={15} strokeWidth={2.2} />
        </span>
        <span className="issue-card-copy">
          <span className="issue-card-meta">
            <span>{issue.category}</span>
            <span className="issue-location">{issue.location}</span>
          </span>
          <strong>{issue.title}</strong>
          <span className="issue-excerpt">{issue.excerpt}</span>
        </span>
        <ChevronRight className="issue-chevron" size={16} />
      </button>
      {selected && (
        <div className="issue-card-detail">
          <p>{issue.detail}</p>
          <div className="issue-actions">
            <button className="issue-resolve-button" type="button" onClick={() => onResolve(issue.id)}>
              <Check size={13} />
              Resolve
            </button>
            <button className="issue-dismiss-button" type="button" onClick={() => onDismiss(issue.id)}>
              <X size={13} />
              Dismiss
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function Editor() {
  const [title, setTitle] = useState("The role of privacy-preserving AI in academic research");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedIssueId, setSelectedIssueId] = useState("contradiction");
  const [issueStatuses, setIssueStatuses] = useState({});
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [toast, setToast] = useState("");
  const [saveState, setSaveState] = useState("Saved locally");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const activeIssues = useMemo(
    () => issueSeed.filter((issue) => !issueStatuses[issue.id] && (activeTab === "all" || issue.tab === activeTab || (activeTab === "critical" && issue.tab === "all"))),
    [activeTab, issueStatuses],
  );
  const openIssueCount = issueSeed.filter((issue) => !issueStatuses[issue.id]).length;
  const selectedIssue = issueSeed.find((issue) => issue.id === selectedIssueId);

  const resolveIssue = (id) => {
    setIssueStatuses((current) => ({ ...current, [id]: "resolved" }));
    setSelectedIssueId("");
    notify("Issue resolved — your draft is a little clearer.");
  };

  const dismissIssue = (id) => {
    setIssueStatuses((current) => ({ ...current, [id]: "dismissed" }));
    setSelectedIssueId("");
    notify("Suggestion dismissed. DocuMend will leave your wording alone.");
  };

  const handleTitleBlur = () => {
    setSaveState("Saved locally");
    notify("Document title saved locally.");
  };

  const handleToolbarAction = (label) => {
    setSaveState("Unsaved change");
    notify(`${label} applied to the selection.`);
  };

  return (
    <main className="editor-shell">
      <div className="editor-orbit editor-orbit-one" aria-hidden="true" />
      <div className="editor-orbit editor-orbit-two" aria-hidden="true" />
      <section className="editor-frame" aria-label="DocuMend document editor">
        <header className="editor-topbar">
          <div className="editor-topbar-left">
            <Wordmark />
            <span className="editor-divider" aria-hidden="true" />
            <button className="editor-breadcrumb" type="button" onClick={() => notify("Your document shelf is safely tucked away.")}>
              My documents
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="editor-topbar-right">
            <span className="offline-status">
              <span className="offline-dot" />
              <CloudOff size={14} />
              Offline · private
            </span>
            <button className="topbar-icon-button" type="button" aria-label="Search document" onClick={() => notify("Search is ready when you need it.")}>
              <Search size={17} />
            </button>
            <button className="avatar-button" type="button" aria-label="Open profile menu" onClick={() => notify("Profile menu is ready to open.")}>
              NC
            </button>
          </div>
        </header>

        <div className="editor-workspace">
          <section className={`document-area ${inspectorOpen ? "" : "document-area-wide"}`} aria-label="Document workspace">
            <div className="document-header">
              <div className="document-heading">
                <span className="document-type"><FileText size={12} /> FYP / Research paper</span>
                <input
                  className="document-title-input"
                  value={title}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    setSaveState("Unsaved change");
                  }}
                  onBlur={handleTitleBlur}
                  aria-label="Document title"
                />
                <div className="document-meta-row">
                  <span className="saved-state"><span className={`saved-state-dot ${saveState === "Unsaved change" ? "saved-state-dot-pending" : ""}`} />{saveState}</span>
                  <span>Edited just now</span>
                  <span>1,248 words</span>
                </div>
              </div>
              <div className="document-header-actions">
                <button className="quiet-action" type="button" onClick={() => notify("Version history is available offline.")}>
                  <ClipboardCheck size={14} />
                  History
                </button>
                <button className="quiet-action" type="button" onClick={() => notify("Export prepared — nothing leaves this device.")}>
                  Export
                  <ChevronDown size={13} />
                </button>
                <button className="more-button" type="button" aria-label="More document actions" onClick={() => notify("More document actions are coming into view.")}>
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="editor-toolbar" aria-label="Formatting toolbar">
              <div className="toolbar-select">
                <span>Body text</span>
                <ChevronDown size={13} />
              </div>
              <div className="toolbar-select toolbar-select-small">
                <span>11</span>
                <ChevronDown size={13} />
              </div>
              {toolbarGroups.map((group, index) => (
                <div className="toolbar-group" key={`group-${index}`}>
                  {group.map((action) => <ToolbarButton key={action.label} action={action} onAction={handleToolbarAction} />)}
                </div>
              ))}
              <button className="toolbar-tool-label" type="button" onClick={() => handleToolbarAction("Clear formatting")}>
                <Code2 size={14} />
                <span>Clear</span>
              </button>
            </div>

            <div className="paper-stage">
              <article className="document-paper" aria-label="Research paper content">
                <div className="paper-running-head">
                  <span>DOCUMEND / WORKING DRAFT</span>
                  <span>01 — 06</span>
                </div>
                <div className="paper-rule" />
                <header className="paper-title-block">
                  <span className="paper-kicker">Final year project · draft 04</span>
                  <h1>Privacy-preserving AI<br /><em>in academic research</em></h1>
                  <p className="paper-byline">Nadia Chen <span>·</span> School of Information &amp; Public Policy</p>
                </header>

                <section className="paper-section">
                  <h2>Abstract</h2>
                  <p>
                    This study examines how privacy-preserving artificial intelligence can support
                    <span className="inline-issue inline-issue-coral" role="button" tabIndex="0" onClick={() => setSelectedIssueId("contradiction")} onKeyDown={(event) => event.key === "Enter" && setSelectedIssueId("contradiction")}> student research practices</span>
                    without turning personal archives into training material. We interviewed
                    <span className="inline-issue inline-issue-coral" role="button" tabIndex="0" onClick={() => setSelectedIssueId("contradiction")} onKeyDown={(event) => event.key === "Enter" && setSelectedIssueId("contradiction")}> 120 participants</span>
                    across three faculties and found that local-first tools improved confidence in exploratory writing.
                  </p>
                </section>

                <section className="paper-section">
                  <h2>1. Introduction</h2>
                  <p>
                    Research software often asks authors to trade control for convenience. That trade becomes
                    especially visible when a draft contains sensitive interview notes, unpublished findings, or
                    a citation trail that is still in motion.
                  </p>
                  <p>
                    This paper asks a narrower question: can an intelligent editor catch structural drift
                    <span className="inline-issue inline-issue-mint" role="button" tabIndex="0" onClick={() => setSelectedIssueId("structure")} onKeyDown={(event) => event.key === "Enter" && setSelectedIssueId("structure")}> before it starts speaking for the author?</span>
                  </p>
                </section>

                <section className="paper-section">
                  <h2>2. Methodology</h2>
                  <p>
                    We conducted semi-structured interviews with <strong>96 postgraduate researchers</strong>,
                    recruited through faculty mailing lists. Sessions were transcribed locally and analysed using
                    a lightweight thematic coding process.
                  </p>
                  <div className="paper-callout">
                    <span className="paper-callout-mark"><Quote size={15} /></span>
                    <p>Privacy is not a feature added after the writing is finished; it is part of the writing environment.</p>
                  </div>
                </section>

                <section className="paper-section">
                  <h2 className="paper-heading-flag">3. Findings and discussion</h2>
                  <p>
                    Participants valued the quietness of a tool that could flag a missing reference without
                    rewriting the sentence. They also returned to the
                    <span className="inline-issue inline-issue-gold" role="button" tabIndex="0" onClick={() => setSelectedIssueId("redundancy")} onKeyDown={(event) => event.key === "Enter" && setSelectedIssueId("redundancy")}> privacy benefit of local processing</span>
                    several times, particularly when discussing collaborative review.
                  </p>
                  <p>
                    As one participant noted, “the suggestion should feel like a pencil mark, not a new author.”
                    This distinction shaped the final prototype.
                  </p>
                </section>

                <section className="paper-section paper-section-last">
                  <h2>4. Implications</h2>
                  <p>
                    A local editor can make structural care visible while leaving the writer’s voice intact.
                    Prior work supports this direction (Chen, 2024)
                    <span className="inline-issue inline-issue-forest" role="button" tabIndex="0" onClick={() => setSelectedIssueId("citation")} onKeyDown={(event) => event.key === "Enter" && setSelectedIssueId("citation")}> [14]</span>.
                  </p>
                </section>

                <footer className="paper-footer">
                  <span>Working draft · not for circulation</span>
                  <span>01</span>
                </footer>
              </article>
            </div>
          </section>

          <aside className={`inspector ${inspectorOpen ? "" : "inspector-collapsed"}`} aria-label="DocuMend issue inspector">
            {inspectorOpen ? (
              <>
                <div className="inspector-header">
                  <div>
                    <span className="inspector-kicker"><Sparkles size={12} /> Quiet review</span>
                    <h2>Make the draft sturdier.</h2>
                    <p>Small repairs, still your voice.</p>
                  </div>
                  <button className="inspector-collapse" type="button" aria-label="Collapse issue inspector" onClick={() => setInspectorOpen(false)}>
                    <PanelRightClose size={17} />
                  </button>
                </div>
                <div className="issue-summary">
                  <div className="issue-summary-score">
                    <strong>{openIssueCount}</strong>
                    <span>{openIssueCount === 1 ? "open issue" : "open issues"}</span>
                  </div>
                  <div className="issue-summary-copy">
                    <span className="summary-meter"><i style={{ width: `${((issueSeed.length - openIssueCount) / issueSeed.length) * 100}%` }} /></span>
                    <span>{openIssueCount === 0 ? "A clean page feels good." : "A few thoughtful checks before you share."}</span>
                  </div>
                </div>
                <div className="issue-tabs" role="tablist" aria-label="Filter document issues">
                  {tabOptions.map((tab) => (
                    <button
                      className={activeTab === tab.id ? "issue-tab-active" : ""}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="issue-list">
                  {activeIssues.length > 0 ? activeIssues.map((issue) => (
                    <IssueCard
                      issue={issue}
                      key={issue.id}
                      selected={selectedIssueId === issue.id}
                      onSelect={setSelectedIssueId}
                      onResolve={resolveIssue}
                      onDismiss={dismissIssue}
                    />
                  )) : (
                    <div className="issues-empty">
                      <span className="empty-check"><CheckCircle2 size={22} /></span>
                      <strong>{openIssueCount === 0 ? "All clear, for now." : "Nothing in this lane."}</strong>
                      <p>{openIssueCount === 0 ? "Every suggestion has been handled. Your words remain exactly where you left them." : "Try another filter to see DocuMend’s notes."}</p>
                      {openIssueCount === 0 && <button type="button" onClick={() => setIssueStatuses({})}>Restore suggestions</button>}
                    </div>
                  )}
                </div>
                <div className="inspector-footer">
                  <span><LockKeyhole size={13} /> Analysis stays on this device</span>
                  <button type="button" onClick={() => notify("Review settings are saved locally.")}>Settings</button>
                </div>
              </>
            ) : (
              <button className="inspector-rail-button" type="button" aria-label="Expand issue inspector" onClick={() => setInspectorOpen(true)}>
                <PanelRightOpen size={17} />
                <span>{openIssueCount}</span>
              </button>
            )}
          </aside>
        </div>
      </section>

      {selectedIssue && issueStatuses[selectedIssue.id] === undefined && (
        <div className={`editor-selection-note editor-selection-note-${selectedIssue.accent}`} role="status">
          <span className="selection-note-dot" />
          <strong>{selectedIssue.category}</strong>
          <span>Selected in your draft</span>
        </div>
      )}
      {toast && (
        <div className="editor-toast" role="status" aria-live="polite">
          <span><Check size={14} /></span>
          {toast}
        </div>
      )}
    </main>
  );
}