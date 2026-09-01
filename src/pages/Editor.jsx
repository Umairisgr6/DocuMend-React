/**
 * Editor — the writing surface, served at the `/editor` route.
 *
 * Ported from the Replit prototype, where it was the `EditorPage` component
 * inside a single 1490-line App.tsx. Changes made in the move:
 *   - TypeScript annotations removed; this codebase is plain JSX.
 *   - The prototype rendered this inside its own Home component and passed
 *     documents/selection/navigation down as props. Here the page is a route
 *     of its own, so it owns that state and uses the shared shell from
 *     components/WorkspaceChrome.jsx, like Dashboard and MyDocuments.
 *   - Tailwind utility classes on the wrapper replaced with `editor-*`
 *     classes; this project vendors only the utilities the landing page uses.
 *
 * The document surface is a plain `contentEditable` article driven by
 * `document.execCommand`. That API is formally deprecated but is still what
 * every browser implements for rich-text editing, and it keeps the page free
 * of an editor dependency. If this ever needs collaborative editing or a
 * reliable undo stack, that is the point to reach for a real editor engine.
 *
 * Front-end only: the document list, issues, and word counts are fixtures,
 * and edits are not persisted. Autosave is simulated by a timer.
 */
/**
 * Editor — the writing surface, served at the `/editor` route.
 *
 * Integrated with the shared ThemeContext for synchronized Light/Dark mode switching.
 */
import { useEffect, useRef, useState } from 'react';
import './editor.css';
import {
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowUpRight,
  AtSign,
  Bold,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Copy,
  Eraser,
  FileCheck2,
  FilePlus2,
  Files,
  FileText,
  FolderOpen,
  Highlighter,
  History,
  ImagePlus,
  IndentDecrease,
  IndentIncrease,
  Italic,
  KeyRound,
  LayoutPanelTop,
  Link2,
  List,
  ListChecks,
  ListFilter,
  ListOrdered,
  LockKeyhole,
  Maximize2,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Printer,
  Quote,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  SpellCheck2,
  Strikethrough,
  Subscript,
  Superscript,
  Table2,
  Type,
  Underline,
  Undo2,
  WandSparkles,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceHeader,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';

/* ==========================================================================
   Content data
   ========================================================================== */

const startingDocuments = [
  { id: 1, title: 'FYP Phase 1 Report', type: 'DOCX', pages: 20, color: 'saffron' },
  { id: 2, title: 'Research Proposal v3', type: 'PDF', pages: 30, color: 'sage' },
  { id: 3, title: 'NDA-DataRopes.ai', type: 'DOCX', pages: 47, color: 'coral' },
  { id: 4, title: 'Literature Review Draft', type: 'PDF', pages: 50, color: 'lavender' },
  { id: 5, title: 'Research_notes_final', type: 'DOCX', pages: 12, color: 'sky' },
];

const initialContent = `
    <p class="editor-eyebrow">FYP Phase 1 — DocuMend</p>
    <p class="editor-subtitle">A focused workspace for better writing, clearer thinking, and confident citations.</p>
    <h2>1. Introduction</h2>
    <p>The rapid growth of digital documentation in academic and legal environments has created a growing need for intelligent, non-invasive editing tools that respect the writer's voice. DocuMend combines contextual review with a calm writing surface, helping authors discover <span class="editor-heatmap-mark heatmap-contradiction" title="Possible contradiction detected">contradictions</span>, <span class="editor-heatmap-mark heatmap-structure" title="Structure gap detected">structural gaps</span>, and citation issues before they become difficult to untangle.</p>
    <p>Rather than interrupting the writing process, the system keeps suggestions close at hand. Each recommendation is grounded in the document itself, so the author can decide what to change and what to keep.</p>
    <h2>2. Literature Review</h2>
    <p>Prior work in automated document analysis has largely relied on cloud-based language models. The project budget is listed as <span class="editor-heatmap-mark heatmap-contradiction" title="Contradiction: budget is listed differently in another paragraph">PKR 45,000</span> here, while the implementation estimate records <span class="editor-heatmap-mark heatmap-contradiction" title="Contradiction: budget is listed differently in another paragraph">PKR 32,000</span>. Tools such as Grammarly and Whiteful provide grammar and style suggestions but require continued connectivity. This creates a practical challenge for researchers working with sensitive material.</p>
    <p>Research in trust and authorship focuses on explaining decisions rather than replacing the writer. A useful editor should reveal patterns, preserve context, and make the final decision feel deliberate.</p>
    <h2>3. Methodology</h2>
    <p>DocuMend's architecture is divided into three primary modules: the Document Parser, the Analysis Engine, and the Suggestion Interface. The parser extracts structure and content, while the analysis engine identifies patterns across the document. The <span class="editor-heatmap-mark heatmap-citation" title="Citation needed for this technical claim">WASM proxy</span> keeps sensitive text local, although the <span class="editor-heatmap-mark heatmap-redundancy" title="Redundant phrase: already used in the abstract">60 fps editing</span> claim should be cross-referenced.</p>
  `;

const modeTabs = ['Home', 'Insert', 'Layout', 'References', 'Review', 'View', 'AI Tools'];

const reviewItems = [
  { kind: 'Contradiction', tone: 'coral', icon: AlertTriangle, detail: 'Budget conflict — PKR 45,000 in §2 para 1 vs PKR 32,000 in §2 para 2', location: '§2.1 · line 3', action: 'Auto-fix' },
  { kind: 'Structure Gap', tone: 'amber', icon: AlertTriangle, detail: 'Claim "zero external transmission" lacks sub-section on WASM proxy architecture.', location: '§3.1 · line 2', action: 'Auto-fix' },
  { kind: 'Redundancy', tone: 'plum', icon: RotateCcw, detail: '"60 fps editing" already used in Abstract §3 — suggest cross reference.', location: '§3.1 · line 5', action: 'Replace' },
];

/* ==========================================================================
   Pieces
   ========================================================================== */

function ToolbarButton({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`editor-tool-button ${active ? 'is-active' : ''}`}
    >
      <Icon size={15} strokeWidth={active ? 2.4 : 1.8} />
    </button>
  );
}

/* ==========================================================================
   The page
   ========================================================================== */
function Editor() {
  // Global Shared Theme Context
  const { darkMode, toggleDarkMode } = useTheme();

  // --- shell state ---
  const [activeNav, setActiveNav] = useState('Editor');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  // --- editor state ---
  const [documents, setDocuments] = useState(startingDocuments);
  const [selectedId, setSelectedId] = useState(1);
  const [reviewTab, setReviewTab] = useState('Issues');
  const [isSaved, setIsSaved] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState('Home');
  const [showFind, setShowFind] = useState(false);
  const [findQuery, setFindQuery] = useState('');
  const [trackedChanges, setTrackedChanges] = useState(false);
  const [commentCount, setCommentCount] = useState(2);
  const [showReviewPanel, setShowReviewPanel] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [pageLayout, setPageLayout] = useState('standard');
  const [issueStates, setIssueStates] = useState({});
  const [documentSearch, setDocumentSearch] = useState('');
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [documentPanelExpanded, setDocumentPanelExpanded] = useState(true);
  const [findMatches, setFindMatches] = useState(0);

  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const currentDocument = documents.find((doc) => doc.id === selectedId) ?? documents[0];

  const announce = (message) => setToast(message);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.dataset.ready) {
      editorRef.current.innerHTML = initialContent;
      editorRef.current.dataset.ready = 'true';
    }
  }, []);

  useEffect(() => () => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
  }, []);

  useEffect(() => {
    const handleShortcut = (event) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === 's') {
        event.preventDefault();
        setIsSaved(true);
        announce('Document saved');
      }
      if (key === 'f') {
        event.preventDefault();
        setShowFind(true);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!showFileMenu) return;
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      setShowFileMenu(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', close);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', close);
    };
  }, [showFileMenu]);

  const markUnsaved = () => {
    setIsSaved(false);
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => setIsSaved(true), 1000);
  };

  const runCommand = (command, value) => {
    editorRef.current?.focus();
    window.document.execCommand(command, false, value);
    markUnsaved();
  };

  const insertHtml = (html, message) => {
    editorRef.current?.focus();
    window.document.execCommand('insertHTML', false, html);
    markUnsaved();
    announce(message);
  };

  const updateFind = (query) => {
    setFindQuery(query);
    if (!query) {
      setFindMatches(0);
      return;
    }
    const text = editorRef.current?.innerText.toLowerCase() ?? '';
    setFindMatches(text.split(query.toLowerCase()).length - 1);
  };

  const addComment = () => {
    setCommentCount((count) => count + 1);
    announce('Comment added to the document');
  };

  const handleOpenFile = (files) => {
    const file = files?.[0];
    if (!file) return;
    announce(`${file.name} opened in the editor`);
  };

  const handleOpenFolder = (files) => {
    const file = files?.[0];
    if (!file) return;
    const folderName = file.webkitRelativePath?.split('/')[0] || 'folder';
    announce(`${folderName} opened with ${files.length} files`);
  };

  const resolveIssue = (kind, resolution) => {
    setIssueStates((current) => ({ ...current, [kind]: resolution }));
    announce(resolution === 'fixed' ? `${kind} fixed` : `${kind} ignored`);
  };

  const changeDocument = (id) => {
    setSelectedId(id);
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
      editorRef.current.dataset.ready = 'true';
    }
    setIsSaved(true);
    announce('Document loaded in editor');
  };

  const createDocument = (title) => {
    const newDocument = { id: Date.now(), title, type: 'DOCX', pages: 1, color: 'gold' };
    setDocuments((current) => [newDocument, ...current]);
    setSelectedId(newDocument.id);
    setModal(null);
    announce('New document created');
  };

  const selectNav = (label) => {
    const route = workspaceRoutes[label];
    if (route && label !== 'Editor') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Features') return navigate('/features');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Help and Guide') return navigate('/help');
    if (label === 'Storage') return navigate('/storage');
    if (label === 'Share Document') return navigate('/share');

    setActiveNav(label);
    if (label !== 'Editor') announce(`${label} view selected`);
    setMobileSidebar(false);
  };

  const openReviewItems = reviewItems.filter((item) => !issueStates[item.kind]);
  const sourceResolved = Boolean(issueStates['Unresolved source']);
  const issueCount = openReviewItems.length + (sourceResolved ? 0 : 1);
  const visibleDocuments = documents
    .filter((doc) => doc.title.toLowerCase().includes(documentSearch.toLowerCase()))
    .slice(0, 5);

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
          announce(`Privacy mode ${privacyMode ? 'paused' : 'enabled'}`);
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

      <main className={`dash-main ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <WorkspaceHeader search={workspaceSearch} onSearchChange={setWorkspaceSearch} onAnnounce={announce} />

        <div className="editor-page">
          <div className={`editor-workspace ${focusMode ? 'is-focus-mode' : ''} ${showReviewPanel ? '' : 'review-hidden'}`}>

            {/* Topbar: identity, quick actions, save state */}
            <div className="editor-topbar">
              <div className="editor-topbar-identity">
                <button type="button" onClick={() => navigate('/documents')} className="editor-back-button" aria-label="Back to documents">
                  <ArrowUpRight size={16} className="editor-back-icon" />
                </button>
                <span className="editor-file-icon"><FileText size={17} /></span>
                <div className="editor-topbar-titles">
                  <p className="editor-brandline">DocuMend <span>· private writing studio</span></p>
                  <label className="editor-document-select">
                    <span className="dash-sr">Choose document</span>
                    <select value={currentDocument?.id ?? ''} onChange={(event) => changeDocument(Number(event.target.value))}>
                      {documents.map((doc) => <option key={doc.id} value={doc.id}>{doc.title}</option>)}
                    </select>
                    <ChevronDown size={13} />
                  </label>
                </div>
              </div>

              <div className="editor-topbar-quick-actions" aria-label="Quick access">
                <button type="button" className="editor-top-icon-action" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('undo')} aria-label="Undo" title="Undo"><Undo2 size={14} /></button>
                <button type="button" className="editor-top-icon-action" onMouseDown={(event) => event.preventDefault()} onClick={() => runCommand('redo')} aria-label="Redo" title="Redo"><Redo2 size={14} /></button>
                <span className="editor-topbar-divider" />
                <button type="button" className="editor-top-icon-action" onClick={addComment} aria-label="Add comment" title="Add comment"><MessageSquare size={14} /></button>
                <button type="button" className="editor-top-icon-action" onClick={() => navigate('/version')} aria-label="Open version history" title="Version history"><History size={14} /></button>
              </div>

              <div className={`editor-save-state ${isSaved ? 'is-saved' : 'is-saving'}`}>
                <span />{isSaved ? 'All changes saved' : 'Saving changes…'}
              </div>

              <div className="editor-topbar-actions">
                <button type="button" className="editor-top-action" onClick={() => announce('Document exported as DOCX')}><Printer size={15} /><span className="editor-hide-sm">Export</span></button>
                <button type="button" className="editor-top-action editor-share-action" onClick={() => navigate('/share')}><Share2 size={14} /><span className="editor-hide-sm">Share</span></button>
                <button type="button" className="editor-save-button" onClick={() => { setIsSaved(true); announce('Document saved'); }}><Check size={15} /> Save</button>
                <span className="editor-avatar">MA</span>
              </div>
            </div>

            {/* Ribbon tabs and the File menu */}
            <div className="editor-navigation">
              <div className="editor-mode-tabs">
                <div className="editor-file-menu-wrap" onPointerDown={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setShowFileMenu((value) => !value)}
                    className={`editor-mode-tab editor-file-tab ${showFileMenu ? 'is-active' : ''}`}
                    aria-expanded={showFileMenu}
                    aria-haspopup="menu"
                  >
                    File <ChevronDown size={12} />
                  </button>
                  {showFileMenu && (
                    <div className="editor-file-menu" role="menu">
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); setModal('document'); }}><FilePlus2 size={14} /><span>New document</span><kbd>Ctrl N</kbd></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); fileInputRef.current?.click(); }}><FileText size={14} /><span>Open file…</span><kbd>Ctrl O</kbd></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); folderInputRef.current?.click(); }}><FolderOpen size={14} /><span>Open folder…</span></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); navigate('/documents'); }}><Files size={14} /><span>Open recent</span></button>
                      <div className="editor-file-menu-divider" />
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); setIsSaved(true); announce('Document saved'); }}><Save size={14} /><span>Save</span><kbd>Ctrl S</kbd></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); setIsSaved(true); announce('Document saved as a new copy'); }}><Copy size={14} /><span>Save as…</span><kbd>Ctrl Shift S</kbd></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); announce('A copy of this document is ready'); }}><FilePlus2 size={14} /><span>Make a copy</span></button>
                      <div className="editor-file-menu-divider" />
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); announce('Document exported as PDF'); }}><Printer size={14} /><span>Export as PDF</span></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); announce('Document exported as DOCX'); }}><FileText size={14} /><span>Export as DOCX</span></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); window.print(); }}><Printer size={14} /><span>Print</span><kbd>Ctrl P</kbd></button>
                      <div className="editor-file-menu-divider" />
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); navigate('/version'); }}><History size={14} /><span>Version history</span></button>
                      <button type="button" role="menuitem" onClick={() => { setShowFileMenu(false); navigate('/documents'); }} className="editor-file-menu-danger"><X size={14} /><span>Close editor</span><kbd>Esc</kbd></button>
                    </div>
                  )}
                </div>
                {modeTabs.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { setActiveTool(item); announce(`${item} tools selected`); }}
                    className={`editor-mode-tab ${activeTool === item ? 'is-active' : ''}`}
                  >
                    {item === 'AI Tools' ? <Sparkles size={13} /> : item === 'Review' ? <CheckCircle2 size={13} /> : null}{item}
                  </button>
                ))}
              </div>
              <div className="editor-utility-tabs">
                <span className="editor-privacy-pill">
                  <KeyRound size={12} /> Private mode
                  <span className="editor-comment-count"><MessageSquare size={11} /> {commentCount}</span>
                </span>
                <button type="button" className="editor-icon-action" aria-label="More editor options" onClick={() => announce('More editor options opened')}><MoreHorizontal size={16} /></button>
              </div>
            </div>

            <input ref={fileInputRef} type="file" hidden accept=".doc,.docx,.pdf,.txt,.rtf,.md" onChange={(event) => handleOpenFile(event.target.files)} />
            <input ref={folderInputRef} type="file" hidden multiple webkitdirectory="" directory="" onChange={(event) => handleOpenFolder(event.target.files)} />

            {/* The ribbon itself */}
            <div className="editor-toolkit" aria-label={`${activeTool} ribbon`}>
              {activeTool === 'Home' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Clipboard</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Undo2} label="Undo" onClick={() => runCommand('undo')} />
                      <ToolbarButton icon={Redo2} label="Redo" onClick={() => runCommand('redo')} />
                      <ToolbarButton icon={Copy} label="Copy selection" onClick={() => { runCommand('copy'); announce('Selection copied'); }} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Font</span>
                    <div className="editor-tool-group editor-font-group">
                      <label className="editor-select-wrap">
                        <span className="dash-sr">Font</span>
                        <select defaultValue="Georgia" onChange={(event) => runCommand('fontName', event.target.value)}>
                          <option>Georgia</option><option>DM Sans</option><option>Arial</option>
                        </select>
                        <ChevronDown size={13} />
                      </label>
                      <label className="editor-size-wrap">
                        <span className="dash-sr">Font size</span>
                        <select defaultValue="4" onChange={(event) => runCommand('fontSize', event.target.value)}>
                          <option value="3">11</option><option value="4">12</option><option value="5">14</option><option value="6">16</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Styles</span>
                    <div className="editor-tool-group">
                      <label className="editor-style-wrap">
                        <span className="dash-sr">Text style</span>
                        <select defaultValue="p" onChange={(event) => runCommand('formatBlock', event.target.value)}>
                          <option value="p">Normal text</option>
                          <option value="h1">Title</option>
                          <option value="h2">Heading 1</option>
                          <option value="h3">Heading 2</option>
                          <option value="blockquote">Quote</option>
                        </select>
                        <ChevronDown size={13} />
                      </label>
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Format</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Bold} label="Bold" onClick={() => runCommand('bold')} />
                      <ToolbarButton icon={Italic} label="Italic" onClick={() => runCommand('italic')} />
                      <ToolbarButton icon={Underline} label="Underline" onClick={() => runCommand('underline')} />
                      <ToolbarButton icon={Strikethrough} label="Strikethrough" onClick={() => runCommand('strikeThrough')} />
                      <ToolbarButton icon={Highlighter} label="Highlight" onClick={() => runCommand('backColor', '#f4d995')} />
                      <ToolbarButton icon={Superscript} label="Superscript" onClick={() => runCommand('superscript')} />
                      <ToolbarButton icon={Subscript} label="Subscript" onClick={() => runCommand('subscript')} />
                      <ToolbarButton icon={Eraser} label="Clear formatting" onClick={() => runCommand('removeFormat')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Text color</span>
                    <div className="editor-tool-group editor-color-tools">
                      {[
                        { color: '#21483b', label: 'Forest ink' },
                        { color: '#b85d45', label: 'Terracotta ink' },
                        { color: '#75558c', label: 'Plum ink' },
                        { color: '#bd7935', label: 'Amber ink' },
                      ].map((swatch) => (
                        <button
                          key={swatch.color}
                          type="button"
                          className="editor-color-swatch"
                          title={swatch.label}
                          aria-label={swatch.label}
                          style={{ color: swatch.color }}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => runCommand('foreColor', swatch.color)}
                        >A</button>
                      ))}
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Paragraph</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={AlignLeft} label="Align left" onClick={() => runCommand('justifyLeft')} active />
                      <ToolbarButton icon={AlignCenter} label="Align center" onClick={() => runCommand('justifyCenter')} />
                      <ToolbarButton icon={AlignRight} label="Align right" onClick={() => runCommand('justifyRight')} />
                      <ToolbarButton icon={AlignJustify} label="Justify" onClick={() => runCommand('justifyFull')} />
                      <ToolbarButton icon={List} label="Bulleted list" onClick={() => runCommand('insertUnorderedList')} />
                      <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => runCommand('insertOrderedList')} />
                      <ToolbarButton icon={ListChecks} label="Checklist" onClick={() => insertHtml('<ul><li><input type="checkbox" /> Add a checklist item</li></ul>', 'Checklist inserted')} />
                      <ToolbarButton icon={IndentDecrease} label="Decrease indent" onClick={() => runCommand('outdent')} />
                      <ToolbarButton icon={IndentIncrease} label="Increase indent" onClick={() => runCommand('indent')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Writing</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={SpellCheck2} label="Run spelling check" onClick={() => announce('Spelling check complete — no new errors')} />
                      <ToolbarButton icon={MessageSquare} label="Add comment" onClick={addComment} />
                      <ToolbarButton icon={Link2} label="Insert link" onClick={() => insertHtml('<a href="https://example.com">Add a source link</a>', 'Link inserted')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section editor-ribbon-section-end">
                    <span className="editor-ribbon-label">Editing</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Search} label="Find in document" onClick={() => setShowFind(true)} />
                      <ToolbarButton icon={LayoutPanelTop} label="Heading style" onClick={() => runCommand('formatBlock', 'h2')} />
                      <ToolbarButton icon={Type} label="Normal text" onClick={() => runCommand('formatBlock', 'p')} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'Insert' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Pages</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={FilePlus2} label="Insert page break" onClick={() => insertHtml('<div class="editor-page-break"><span>Page break</span></div><p><br></p>', 'Page break inserted')} />
                      <ToolbarButton icon={Quote} label="Insert quote" onClick={() => insertHtml('<blockquote>Write the sentence you want your reader to remember.</blockquote>', 'Quote block inserted')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Media</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={ImagePlus} label="Add image placeholder" onClick={() => insertHtml('<div class="editor-image-placeholder"><span>Image placeholder</span></div><p><br></p>', 'Image placeholder inserted')} />
                      <ToolbarButton icon={Link2} label="Insert link" onClick={() => insertHtml('<a href="https://example.com">Add a source link</a>', 'Link inserted')} />
                      <ToolbarButton icon={Table2} label="Insert 2 by 2 table" onClick={() => insertHtml('<table><tbody><tr><td>Finding</td><td>Evidence</td></tr><tr><td>Write here</td><td>Write here</td></tr></tbody></table>', 'Table inserted')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Annotations</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={MessageSquare} label="Add comment" onClick={addComment} />
                      <ToolbarButton icon={Bookmark} label="Add bookmark" onClick={() => announce('Bookmark added at cursor')} />
                      <ToolbarButton icon={AtSign} label="Mention collaborator" onClick={() => insertHtml('<span class="editor-mention">@collaborator</span>&nbsp;', 'Mention inserted')} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'Layout' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Page setup</span>
                    <div className="editor-tool-group">
                      <button type="button" className={`editor-ribbon-choice ${pageLayout === 'standard' ? 'is-active' : ''}`} onClick={() => setPageLayout('standard')}><LayoutPanelTop size={14} /> Standard</button>
                      <button type="button" className={`editor-ribbon-choice ${pageLayout === 'wide' ? 'is-active' : ''}`} onClick={() => setPageLayout('wide')}><Maximize2 size={14} /> Wide</button>
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Document rhythm</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Type} label="Increase paragraph spacing" onClick={() => insertHtml('<p><br></p>', 'Paragraph spacing increased')} />
                      <ToolbarButton icon={AlignJustify} label="Set readable line spacing" onClick={() => announce('Readable line spacing enabled')} active />
                      <ToolbarButton icon={ListFilter} label="Show layout guides" onClick={() => announce('Layout guides enabled')} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'References' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Citations</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Bookmark} label="Insert citation" onClick={() => insertHtml('<span class="editor-citation">[Add citation]</span>&nbsp;', 'Citation placeholder inserted')} />
                      <ToolbarButton icon={AtSign} label="Manage sources" onClick={() => announce('Source manager opened')} />
                      <ToolbarButton icon={BookOpen} label="Bibliography" onClick={() => insertHtml('<h2>References</h2><p class="editor-reference-placeholder">Add your references here.</p>', 'References section inserted')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Navigation</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={ListOrdered} label="Table of contents" onClick={() => announce('Table of contents refreshed')} />
                      <ToolbarButton icon={FileCheck2} label="Cross-reference" onClick={() => announce('Cross-reference picker opened')} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'Review' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Changes</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={CheckCircle2} label="Track changes" onClick={() => { setTrackedChanges((value) => !value); announce(`Track changes ${trackedChanges ? 'off' : 'on'}`); }} active={trackedChanges} />
                      <ToolbarButton icon={Check} label="Accept all changes" onClick={() => announce('All suggested changes accepted')} />
                      <ToolbarButton icon={RotateCcw} label="Reject all changes" onClick={() => announce('All suggested changes rejected')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Comments</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={MessageSquare} label="New comment" onClick={addComment} />
                      <ToolbarButton icon={ListFilter} label="Show comments" onClick={() => setReviewTab('Issues')} />
                      <ToolbarButton icon={WandSparkles} label="Resolve with AI" onClick={() => announce('AI prepared a review summary')} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'View' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Zoom</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={ZoomOut} label="Zoom out" onClick={() => setZoom((value) => Math.max(85, value - 5))} />
                      <span className="editor-zoom-label">{zoom}%</span>
                      <ToolbarButton icon={ZoomIn} label="Zoom in" onClick={() => setZoom((value) => Math.min(115, value + 5))} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Window</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={Maximize2} label="Focus mode" onClick={() => setFocusMode((value) => !value)} active={focusMode} />
                      <ToolbarButton icon={LayoutPanelTop} label="Toggle review panel" onClick={() => setShowReviewPanel((value) => !value)} active={showReviewPanel} />
                    </div>
                  </div>
                </>
              )}

              {activeTool === 'AI Tools' && (
                <>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Writing assistant</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={WandSparkles} label="Improve clarity" onClick={() => announce('Clarity suggestions ready')} />
                      <ToolbarButton icon={Sparkles} label="Continue writing" onClick={() => insertHtml('<p class="editor-ai-suggestion">A clearer next step could begin here…</p>', 'Draft suggestion inserted')} />
                      <ToolbarButton icon={CheckCircle2} label="Check tone" onClick={() => announce('Tone check: measured and academic')} />
                    </div>
                  </div>
                  <div className="editor-ribbon-section">
                    <span className="editor-ribbon-label">Document intelligence</span>
                    <div className="editor-tool-group">
                      <ToolbarButton icon={ShieldCheck} label="Run privacy scan" onClick={() => setReviewTab('Privacy')} />
                      <ToolbarButton icon={ListFilter} label="Find structure gaps" onClick={() => setReviewTab('Structure')} />
                      <ToolbarButton icon={Search} label="Find contradictions" onClick={() => setReviewTab('Issues')} />
                    </div>
                  </div>
                </>
              )}
            </div>

            {showFind && (
              <div className="editor-findbar">
                <Search size={15} />
                <input autoFocus value={findQuery} onChange={(event) => updateFind(event.target.value)} placeholder="Find in document" aria-label="Find in document" />
                <span>{findQuery ? `${findMatches} matches` : 'Type to search'}</span>
                <button type="button" onClick={() => { updateFind(''); setShowFind(false); }} aria-label="Close find bar"><X size={14} /></button>
              </div>
            )}

            {/* Whole-document commands */}
            <div className="editor-command-bar">
              <div className="editor-command-group">
                <button type="button" className="editor-command-button command-scan" onClick={() => announce('Document scan complete')}><ShieldCheck size={14} /> Scan doc</button>
                <button type="button" className="editor-command-button command-fix" onClick={() => announce('Safe fixes are ready')}><CheckCircle2 size={14} /> Fix all</button>
                <button type="button" className="editor-command-button command-suggest" onClick={() => announce('Suggestions generated')}><Sparkles size={14} /> Suggest</button>
                <button type="button" className="editor-command-button command-more" onClick={() => setModal('document')}><Plus size={14} /> New document</button>
              </div>
              <span className="editor-page-count">{currentDocument?.pages ?? 1} pages · {currentDocument?.type ?? 'DOCX'}</span>
            </div>

            {/* Navigator | canvas | review */}
            <div className={`editor-main-grid ${documentPanelExpanded ? 'documents-expanded' : 'documents-collapsed'}`}>

              <aside className="editor-document-panel" aria-label="Editor document navigator">
                <div className="editor-panel-heading">
                  <div className="editor-panel-heading-copy">
                    <p className="editor-panel-kicker">Workspace</p>
                    <h2>My documents</h2>
                  </div>
                  <div className="editor-panel-actions">
                    <button
                      type="button"
                      className="editor-panel-toggle"
                      onClick={() => setDocumentPanelExpanded((value) => !value)}
                      aria-expanded={documentPanelExpanded}
                      aria-label={documentPanelExpanded ? 'Hide document navigator' : 'Show document navigator'}
                      title={documentPanelExpanded ? 'Hide navigator' : 'Show navigator'}
                    >
                      {documentPanelExpanded ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                      <span className="editor-panel-toggle-text">{documentPanelExpanded ? 'Hide' : 'Show'}</span>
                    </button>
                    <button type="button" className="editor-panel-add" onClick={() => setModal('document')} aria-label="Create a new document"><Plus size={15} /></button>
                  </div>
                </div>
                <label className="editor-document-search">
                  <Search size={13} />
                  <input value={documentSearch} onChange={(event) => setDocumentSearch(event.target.value)} placeholder="Find a document" aria-label="Find a document" />
                </label>
                <div className="editor-document-list">
                  {visibleDocuments.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      title={doc.title}
                      className={`editor-document-item ${doc.id === currentDocument?.id ? 'is-active' : ''}`}
                      onClick={() => changeDocument(doc.id)}
                    >
                      <span className={`editor-document-thumb thumb-${doc.color}`}><FileText size={14} /></span>
                      <span className="editor-document-item-copy"><strong>{doc.title}</strong><small>{doc.type} · {doc.pages} pages</small></span>
                      {doc.id === currentDocument?.id && <span className="editor-document-live" />}
                    </button>
                  ))}
                  {visibleDocuments.length === 0 && <p className="editor-document-empty">No documents found.</p>}
                </div>
                <div className="editor-collection-block">
                  <div className="editor-collection-heading">
                    <span>Collections</span>
                    <button type="button" onClick={() => announce('Collection creation opened')} aria-label="Add collection"><Plus size={13} /></button>
                  </div>
                  <button type="button" className="editor-collection-item is-selected"><span className="collection-dot dot-sage" />Research Papers <em>{documents.length}</em></button>
                  <button type="button" className="editor-collection-item"><span className="collection-dot dot-amber" />Client work <em>4</em></button>
                  <button type="button" className="editor-collection-item"><span className="collection-dot dot-plum" />Shared with me <em>3</em></button>
                </div>
                <div className="editor-weekly-card">
                  <Sparkles size={15} />
                  <span><strong>12 decisions made</strong><small>This week in your workspace</small></span>
                  <ArrowUpRight size={13} />
                </div>
              </aside>

              <section className="editor-canvas-shell">
                <div className="editor-canvas-toolbar">
                  <span className="editor-canvas-label"><FileCheck2 size={14} /> Editing <strong>{currentDocument?.title}</strong></span>
                  <div className="editor-heatmap-bar">
                    <span className="editor-heatmap-title"><AlertTriangle size={12} /> Heatmap</span>
                    <span className="editor-heatmap-legend">
                      <i className="heatmap-dot dot-contradiction" /> Contradiction
                      <i className="heatmap-dot dot-structure" /> Structure
                      <i className="heatmap-dot dot-redundancy" /> Redundancy
                      <i className="heatmap-dot dot-citation" /> Citation
                    </span>
                    <button type="button" className={`editor-heatmap-toggle ${heatmapEnabled ? 'is-on' : ''}`} onClick={() => setHeatmapEnabled((value) => !value)} aria-pressed={heatmapEnabled}>
                      <span /> {heatmapEnabled ? 'On' : 'Off'}
                    </button>
                  </div>
                  <div className="editor-canvas-actions">
                    <span className="editor-canvas-status"><span /> Cursor synced</span>
                    <button
                      type="button"
                      className="editor-review-toggle"
                      onClick={() => setShowReviewPanel((value) => !value)}
                      aria-pressed={showReviewPanel}
                      title={showReviewPanel ? 'Collapse review panel' : 'Open review panel'}
                    >
                      {showReviewPanel ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
                      <span>{showReviewPanel ? 'Hide review' : 'Show review'}</span>
                    </button>
                  </div>
                </div>

                <div className="editor-paper-wrap">
                  <article
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={markUnsaved}
                    className={`editor-paper ${pageLayout === 'wide' ? 'is-wide' : ''} ${heatmapEnabled ? '' : 'heatmap-muted'}`}
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', marginBottom: `${(zoom - 100) * 1.5}px` }}
                    aria-label="Document editor"
                  />
                </div>

                <div className="editor-canvas-footer">
                  <span>Word count <strong>1,284</strong></span>
                  <span>Last edited just now</span>
                  <span className="editor-autosave"><Check size={13} /> Local autosave on</span>
                </div>
              </section>

              <aside className="editor-review-panel" aria-label="Document review">
                <div className="editor-review-header">
                  <div className="editor-review-tabs">
                    {['Issues', 'Structure', 'Privacy', 'Stats'].map((tab) => (
                      <button key={tab} type="button" onClick={() => setReviewTab(tab)} className={reviewTab === tab ? 'is-active' : ''}>
                        {tab}{tab === 'Issues' ? <sup>{issueCount}</sup> : null}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="editor-review-collapse" onClick={() => setShowReviewPanel(false)} aria-label="Collapse review panel" title="Collapse review panel"><PanelRightClose size={14} /></button>
                </div>

                {reviewTab === 'Issues' && (
                  <>
                    <div className="editor-scan-card">
                      <div className="editor-scan-row">
                        <span className="editor-scan-label"><span className="editor-scan-dot" /> Scanning offline</span>
                        <span className="editor-live-status"><span /> Live</span>
                      </div>
                      <div className="editor-scan-progress"><span /></div>
                      <div className="editor-scan-row editor-scan-counts"><span>{issueCount} issues found</span><span>12 checks passed</span></div>
                    </div>
                    <div className="editor-review-heading">
                      <span>Active issues</span>
                      <button type="button" onClick={() => announce('Issue filters opened')}><ListFilter size={13} /> Filter</button>
                    </div>
                    <div className="editor-issues">
                      {openReviewItems.map((item) => (
                        <div className={`editor-issue-card issue-${item.tone}`} key={item.kind}>
                          <div className="editor-issue-head">
                            <span className="editor-issue-kind"><item.icon size={13} />{item.kind}</span>
                            <span className="editor-issue-location">{item.location}</span>
                          </div>
                          <p>{item.detail}</p>
                          <div className="editor-issue-actions">
                            <button type="button" onClick={() => resolveIssue(item.kind, 'fixed')} className="editor-issue-action action-fix">{item.action}</button>
                            <button type="button" onClick={() => resolveIssue(item.kind, 'ignored')} className="editor-issue-action action-ignore">Ignore</button>
                          </div>
                        </div>
                      ))}
                      {!sourceResolved && (
                        <div className="editor-issue-card issue-gold">
                          <div className="editor-issue-head">
                            <span className="editor-issue-kind"><Plus size={15} />Unresolved source</span>
                            <span className="editor-issue-location">§3.1.2 · line 21</span>
                          </div>
                          <p>"WASM proxy" needs a citation before this claim can be marked verified.</p>
                          <div className="editor-issue-actions">
                            <button type="button" onClick={() => resolveIssue('Unresolved source', 'fixed')} className="editor-issue-action action-fix">Add reference</button>
                            <button type="button" onClick={() => announce('Source finder opened')} className="editor-issue-action action-source">Find source</button>
                          </div>
                        </div>
                      )}
                      {issueCount === 0 && (
                        <div className="editor-no-issues">
                          <CheckCircle2 size={20} />
                          <strong>All clear for now</strong>
                          <span>DocuMend found no open review items.</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {reviewTab === 'Structure' && (
                  <div className="editor-insight-panel">
                    <p className="editor-insight-kicker">Document outline</p>
                    <h3>Clear progression</h3>
                    <div className="editor-outline-item is-current"><span>01</span> Introduction <em>4 min</em></div>
                    <div className="editor-outline-item"><span>02</span> Literature Review <em>7 min</em></div>
                    <div className="editor-outline-item"><span>03</span> Methodology <em>6 min</em></div>
                    <div className="editor-outline-note"><CheckCircle2 size={15} /> No orphaned headings detected.</div>
                  </div>
                )}

                {reviewTab === 'Privacy' && (
                  <div className="editor-insight-panel privacy-insight">
                    <div className="editor-privacy-icon"><LockKeyhole size={22} /></div>
                    <p className="editor-insight-kicker">Privacy mode</p>
                    <h3>Protected by default</h3>
                    <p>Your document stays on this device while DocuMend checks structure and clarity locally.</p>
                    <div className="editor-security-row"><span><Check size={13} /> AES-256 encryption</span><strong>On</strong></div>
                    <div className="editor-security-row"><span><Check size={13} /> External sharing</span><strong>Off</strong></div>
                  </div>
                )}

                {reviewTab === 'Stats' && (
                  <div className="editor-insight-panel">
                    <p className="editor-insight-kicker">Writing signals</p>
                    <h3>Steady, focused progress</h3>
                    <div className="editor-stat-grid">
                      <div><strong>1,284</strong><span>Words</span></div>
                      <div><strong>08:42</strong><span>Read time</span></div>
                      <div><strong>71%</strong><span>Complete</span></div>
                      <div><strong>8.4</strong><span>Clarity</span></div>
                    </div>
                    <div className="editor-stat-bar"><span style={{ width: '71%' }} /></div>
                    <p className="editor-stat-caption">Your structure is stronger than the previous version.</p>
                  </div>
                )}

                <div className="editor-review-footer">
                  <span><Cloud size={13} /> Offline-ready workspace</span>
                  <button type="button" onClick={() => announce('Review refreshed')} aria-label="Refresh review"><RotateCcw size={13} /></button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </main>

      <WorkspaceModal
        key={String(modal)}
        mode={modal}
        initialValue=""
        onClose={() => setModal(null)}
        onSubmit={createDocument}
        onLogout={() => { setModal(null); navigate('/'); }}
      />

      {toast && <div className="dash-toast" role="status">{toast}</div>}
    </div>
  );
}

export default Editor;