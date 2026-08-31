import React, { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {TextStyle} from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import "./editor.css";

const documentContent = `
  <h1>FYP Phase 1 — DocuMend</h1>
  <p class="doc-meta">47 pages&nbsp;&nbsp;·&nbsp;&nbsp;12,840 words&nbsp;&nbsp;·&nbsp;&nbsp;AES-256&nbsp;&nbsp;·&nbsp;&nbsp;Saved 2 min ago</p>
  <p>The rapid growth of digital documentation in academic and legal environments has created a pressing need for intelligent document-editing tools. <mark data-color="#f8d9cf">Redundancy</mark> that repeats user-facing claims can make a thoughtful document feel less precise, while <mark data-color="#d7e8f4">unclear phrasing</mark> often hides the real argument.</p>
  <h2>1. Introduction</h2>
  <p>DocuMend is a private, browser-based workspace for analyzing long-form writing without interrupting the writer's train of thought. It combines contextual suggestions with a calm editing experience, helping teams improve a draft while keeping ownership of every decision.</p>
  <blockquote><p>Good writing software should make the next thoughtful edit feel obvious.</p></blockquote>
  <h2>2. Literature Review</h2>
  <p>Prior work in automated document analysis has largely relied on cloud-based NLP pipelines. Tools such as grammar and style assistants improve surface-level writing, but their suggestions often stop before the underlying argument is clear.</p>
  <ul>
    <li>Context-aware grammar and style suggestions</li>
    <li>Traceable sources and evidence-aware edits</li>
    <li>Review workflows designed for long-form writing</li>
  </ul>
  <h2>3. Methodology</h2>
  <p>DocuMend's architecture is divided into three primary modules: the Document Parser, the Analysis Engine, and the Suggestion Interface. Together, these modules transform a draft into a document that is easier to trust and easier to finish.</p>
`;

const issueSeed = [
  {
    id: 1,
    type: "Contradiction",
    icon: "alert",
    tone: "red",
    location: "§2.1 · line 3",
    title: "Budget conflict",
    body: "PKR 45,000 in §2 para 1 vs PKR 32,000 in §2 para 2 for the same scope.",
    action: "Auto-fix",
  },
  {
    id: 2,
    type: "Structure gap",
    icon: "layers",
    tone: "orange",
    location: "§3.1 · line 2",
    title: "A missing bridge in the argument",
    body: "The claim “zero external transmission” needs a short section on the WASM proxy architecture.",
    action: "Auto-fix",
  },
  {
    id: 3,
    type: "Redundancy",
    icon: "repeat",
    tone: "blue",
    location: "§3.1 · line 5",
    title: "A phrase appears twice",
    body: "“60 fps editing” is already used in Abstract §3. Consider a cross-reference instead.",
    action: "Replace",
  },
  {
    id: 4,
    type: "Unresolved source",
    icon: "plus",
    tone: "gold",
    location: "§3.1.2 · line 21",
    title: "Citation needed",
    body: "The claim about offline WASM database indexing needs an external reference.",
    action: "Add reference",
  },
];

const Icon = ({ name, size = 16 }) => {
  const shapes = {
    arrowLeft: <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
    arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
    chevronDown: <path d="m6 9 6 6 6-6" />,
    chevronUp: <path d="m6 15 6-6 6 6" />,
    more: <><circle cx="5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.2" fill="currentColor" stroke="none" /></>,
    save: <><path d="M5 4h11l3 3v13H5z" /><path d="M8 4v6h8V4M8 20v-6h8v6" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5M12 7v5l3 2" /></>,
    robot: <><rect height="11" rx="3" width="14" x="5" y="8" /><path d="M12 4v4M8 13h.01M16 13h.01M8 17h8" /><path d="M3 11h2M19 11h2" /></>,
    sparkles: <><path d="m12 3-1.3 5.7L5 10l5.7 1.3L12 17l1.3-5.7L19 10l-5.7-1.3z" /><path d="m19 16-.6 2.4L16 19l2.4.6L19 22l.6-2.4L22 19l-2.4-.6z" /></>,
    alert: <><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M7 12h10M12 7v10" /></>,
    wand: <><path d="m15 4 5 5M13 6l5 5M4 20l10-10" /><path d="m5 5 .7 2.3L8 8l-2.3.7L5 11l-.7-2.3L2 8l2.3-.7z" /></>,
    copy: <><rect height="13" rx="1.5" width="11" x="8" y="8" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
    cut: <><circle cx="6" cy="7" r="2" /><circle cx="6" cy="17" r="2" /><path d="m8 8 11 8M8 16 19 8" /></>,
    paste: <><path d="M9 5h6M9 3h6v4H9z" /><rect height="15" rx="2" width="14" x="5" y="6" /></>,
    undo: <><path d="M9 14 4 9l5-5" /><path d="M4 9h9a7 7 0 0 1 7 7v1" /></>,
    redo: <><path d="m15 14 5-5-5-5" /><path d="M20 9h-9a7 7 0 0 0-7 7v1" /></>,
    bold: <path d="M7 5h5.5a4 4 0 0 1 0 8H7zm0 8h6a4 4 0 0 1 0 8H7z" />,
    italic: <><line x1="10" x2="14" y1="5" y2="19" /><line x1="7" x2="17" y1="5" y2="5" /><line x1="7" x2="17" y1="19" y2="19" /></>,
    underline: <><path d="M6 4v6a6 6 0 0 0 12 0V4" /><path d="M4 20h16" /></>,
    strike: <><path d="M5 5h14M5 19h14" /><path d="M8 5c5 0 8 2 8 5s-3 5-8 5" /></>,
    alignLeft: <><path d="M4 6h16M4 10h10M4 14h16M4 18h10" /></>,
    alignCenter: <><path d="M4 6h16M7 10h10M4 14h16M7 18h10" /></>,
    alignRight: <><path d="M4 6h16M10 10h10M4 14h16M10 18h10" /></>,
    justify: <><path d="M4 6h16M4 10h16M4 14h16M4 18h16" /></>,
    list: <><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></>,
    ordered: <><path d="M9 6h11M9 12h11M9 18h11M4 5h1v5M3 10h3M6 18H3l3-4a1.7 1.7 0 0 0-3-1" /></>,
    quote: <><path d="M10 11H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5v6a5 5 0 0 1-5 5M20 11h-5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5v6a5 5 0 0 1-5 5" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.1.1l1.4-1.4a5 5 0 0 0-7.1-7.1L10.2 5.8" /><path d="M14 11a5 5 0 0 0-7.1-.1l-1.4 1.4a5 5 0 0 0 7.1 7.1l1.2-1.2" /></>,
    image: <><rect height="14" rx="2" width="18" x="3" y="5" /><circle cx="8.5" cy="10" r="1.5" /><path d="m21 16-5-5L5 19" /></>,
    eraser: <><path d="m7 21 14-14a2.1 2.1 0 0 0-3-3L4 18a2 2 0 0 0 3 3Z" /><path d="m15 7 3 3M3 21h18" /></>,
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    comment: <><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-1-2.4V8a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5" /></>,
    repeat: <><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    external: <><path d="M14 5h5v5M19 5l-8 8" /><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    lock: <><rect height="10" rx="2" width="14" x="5" y="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size} xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{shapes[name]}</svg>;
};

const FontAttributes = Extension.create({
  name: "fontAttributes",
  addGlobalAttributes() {
    return [{
      types: ["textStyle"],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (element) => element.style.fontSize?.replace("px", "") || null,
          renderHTML: (attributes) => attributes.fontSize ? { style: `font-size: ${attributes.fontSize}px` } : {},
        },
        fontFamily: {
          default: null,
          parseHTML: (element) => element.style.fontFamily || null,
          renderHTML: (attributes) => attributes.fontFamily ? { style: `font-family: ${JSON.stringify(attributes.fontFamily)}` } : {},
        },
      },
    }];
  },
});

function IconButton({ label, icon, onClick, active = false, disabled = false }) {
  return <button aria-label={label} className={`icon-btn ${active ? "active" : ""}`} disabled={disabled} onClick={onClick} title={label} type="button"><Icon name={icon} /></button>;
}

function RibbonButton({ label, icon, onClick, active = false, tone = "" }) {
  return <button className={`ribbon-btn ${active ? "active" : ""} ${tone}`} onClick={onClick} title={label} type="button">{icon && <Icon name={icon} size={15} />}<span>{label}</span></button>;
}

function RibbonGroup({ label, children, className = "" }) {
  return <div className={`ribbon-group ${className}`}><div className="group-controls">{children}</div><span className="group-label">{label}</span></div>;
}

function IssueCard({ issue, fixed, onAction }) {
  return (
    <article className={`issue-card ${issue.tone} ${fixed ? "fixed" : ""}`}>
      <div className="issue-card-heading">
        <span className="issue-type"><Icon name={fixed ? "check" : issue.icon} size={13} /> {fixed ? "Fixed" : issue.type}</span>
        <span className="issue-location">{issue.location}</span>
      </div>
      <h3>{fixed ? "This suggestion was applied" : issue.title}</h3>
      <p>{fixed ? "The document is up to date and the review item has been cleared." : issue.body}</p>
      {!fixed && <div className="issue-card-actions"><button className="issue-action" onClick={() => onAction(issue, issue.action)} type="button">{issue.action}</button><button className="issue-ignore" onClick={() => onAction(issue, "Ignore")} type="button">Ignore</button></div>}
    </article>
  );
}

export default function DocuMendEditor() {
  const [activeTab, setActiveTab] = useState("Home");
  const [activeAudit, setActiveAudit] = useState("Contradictions");
  const [font, setFont] = useState("Georgia");
  const [size, setSize] = useState("12");
  const [issues, setIssues] = useState(issueSeed);
  const [fixedIssues, setFixedIssues] = useState([]);
  const [toast, setToast] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [saved, setSaved] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontAttributes,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Placeholder.configure({ placeholder: "Start writing here or choose Generate above to turn a thought into a first draft…" }),
    ],
    content: documentContent,
    editorProps: { attributes: { class: "tiptap document-content", spellcheck: "true" } },
    onUpdate: () => {
      setSaved(false);
      window.clearTimeout(window.__documendSave);
      window.__documendSave = window.setTimeout(() => setSaved(true), 1000);
    },
  });

  useEffect(() => () => window.clearTimeout(window.__documendSave), []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!editor) return <div className="documend-loading"><div className="loading-mark"><span /></div><strong>Opening your writing space…</strong><small>Loading Tiptap</small></div>;

  const notify = (message) => setToast(message);
  const run = (command) => command(editor.chain().focus()).run();
  const active = {
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    bulletList: editor.isActive("bulletList"),
    orderedList: editor.isActive("orderedList"),
    blockquote: editor.isActive("blockquote"),
  };
  const setBlock = (value) => value === "Normal" ? run((chain) => chain.setParagraph()) : run((chain) => chain.toggleHeading({ level: Number(value.replace("H", "")) }));
  const chooseAudit = (label) => {
    setActiveAudit(label);
    notify(`${label} view selected`);
  };
  const handleIssueAction = (issue, action) => {
    if (action === "Ignore" || action === "Auto-fix" || action === "Replace" || action === "Add reference") {
      setFixedIssues((current) => [...new Set([...current, issue.id])]);
      notify(action === "Ignore" ? "Issue dismissed" : `${action} suggestion applied`);
    }
  };
  const scanDocument = () => {
    setScanning(true);
    notify("Scanning document locally…");
    window.setTimeout(() => {
      setScanning(false);
      notify("Scan complete · 4 review items found");
    }, 1100);
  };
  const applyLink = (event) => {
    event.preventDefault();
    if (linkUrl) editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setShowLink(false);
    notify(linkUrl ? "Link added to selection" : "Link removed");
  };

  return (
    <main className="documend-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><span /></span><strong>Docu<span>Mend</span></strong><span className="brand-divider" /><button className="document-name" type="button">FYP_Phase1_Report.docx <Icon name="chevronDown" size={12} /></button></div>
        <div className="topbar-right"><span className="wasm-status"><i />42ms</span><button className="save-button" onClick={() => { setSaved(true); notify("Document saved locally"); }} type="button"><Icon name="save" size={14} /> {saved ? "Saved" : "Save"}</button><button className="user-avatar" type="button">LS</button></div>
      </header>

      <section className="ribbon-shell">
        <nav className="ribbon-tabs" aria-label="Document tools">
          {["File", "Home", "WPS PDF", "Insert", "Design", "Layout", "References", "Mailings", "Review", "View", "Help", "Script Lab"].map((tab) => <button className={activeTab === tab ? "active" : ""} key={tab} onClick={() => { setActiveTab(tab); notify(`${tab} tools selected`); }} type="button">{tab === "Insert" ? "+ Insert" : tab}</button>)}
          <button className={`ai-tab ${activeTab === "AI Tools" ? "active" : ""}`} onClick={() => { setActiveTab("AI Tools"); notify("AI tools selected"); }} type="button"><Icon name="robot" size={14} /> AI Tools</button>
        </nav>
        <div className="audit-strip">
          {[["Contradictions", "alert"], ["Grammar checks", "check"], ["Structural gaps", "layers"], ["Redundancy", "repeat"], ["Cite suggestions", "plus"]].map(([label, icon]) => <button className={activeAudit === label ? `audit-pill active ${label.split(" ")[0].toLowerCase()}` : "audit-pill"} key={label} onClick={() => chooseAudit(label)} type="button"><Icon name={icon} size={13} /> {label}</button>)}
        </div>
        <div className="ribbon-tools">
          <RibbonGroup label="Clipboard" className="clipboard">
            <RibbonButton icon="cut" label="Cut" onClick={() => { document.execCommand("cut"); notify("Selection cut"); }} />
            <RibbonButton icon="copy" label="Copy" onClick={() => { document.execCommand("copy"); notify("Selection copied"); }} />
            <RibbonButton icon="paste" label="Paste" onClick={() => navigator.clipboard?.readText().then((text) => text && editor.chain().focus().insertContent(text))} />
          </RibbonGroup>
          <RibbonGroup label="Font" className="font-group">
            <div className="font-selectors"><label><select aria-label="Font family" onChange={(event) => { setFont(event.target.value); editor.chain().focus().setMark("textStyle", { fontFamily: event.target.value }).run(); }} value={font}><option>Georgia</option><option>Arial</option><option>Calibri</option><option>Cambria</option><option>Times New Roman</option><option>Garamond</option><option>Palatino</option><option>Verdana</option><option>Tahoma</option><option>Trebuchet MS</option><option>Courier New</option><option>Inter</option><option>IBM Plex Mono</option></select><Icon name="chevronDown" size={12} /></label><label className="size-select"><select aria-label="Font size" onChange={(event) => { setSize(event.target.value); editor.chain().focus().setMark("textStyle", { fontSize: event.target.value }).run(); }} value={size}><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>14</option><option>16</option><option>18</option><option>20</option><option>22</option><option>24</option><option>26</option><option>28</option><option>32</option><option>36</option><option>48</option><option>72</option></select><Icon name="chevronDown" size={12} /></label></div>
            <div className="button-row"><IconButton label="Bold" icon="bold" active={active.bold} onClick={() => run((chain) => chain.toggleBold())} /><IconButton label="Italic" icon="italic" active={active.italic} onClick={() => run((chain) => chain.toggleItalic())} /><IconButton label="Underline" icon="underline" active={active.underline} onClick={() => run((chain) => chain.toggleUnderline())} /><IconButton label="Strikethrough" icon="strike" active={active.strike} onClick={() => run((chain) => chain.toggleStrike())} /><label className="swatch text-color" title="Text color"><input aria-label="Text color" onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} type="color" defaultValue="#ffffff" /><b>A</b></label><label className="swatch highlight-color" title="Text highlight"><input aria-label="Highlight color" onChange={(event) => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} type="color" defaultValue="#f2c968" /><b>✦</b></label></div>
          </RibbonGroup>
          <RibbonGroup label="Paragraph" className="paragraph">
            <div className="button-row"><IconButton label="Align left" icon="alignLeft" onClick={() => editor.chain().focus().setTextAlign("left").run()} /><IconButton label="Align center" icon="alignCenter" onClick={() => editor.chain().focus().setTextAlign("center").run()} /><IconButton label="Align right" icon="alignRight" onClick={() => editor.chain().focus().setTextAlign("right").run()} /><IconButton label="Justify" icon="justify" onClick={() => editor.chain().focus().setTextAlign("justify").run()} /></div>
            <div className="button-row"><IconButton label="Bullet list" icon="list" active={active.bulletList} onClick={() => run((chain) => chain.toggleBulletList())} /><IconButton label="Numbered list" icon="ordered" active={active.orderedList} onClick={() => run((chain) => chain.toggleOrderedList())} /><IconButton label="Quote" icon="quote" active={active.blockquote} onClick={() => run((chain) => chain.toggleBlockquote())} /></div>
          </RibbonGroup>
          <RibbonGroup label="Styles" className="styles">
            <div className="style-buttons"><button className={editor.isActive("paragraph") ? "active" : ""} onClick={() => setBlock("Normal")} type="button">Normal</button><button className={editor.isActive("heading", { level: 1 }) ? "active" : ""} onClick={() => setBlock("H1")} type="button">H1</button><button className={editor.isActive("heading", { level: 2 }) ? "active" : ""} onClick={() => setBlock("H2")} type="button">H2</button><button className={editor.isActive("heading", { level: 3 }) ? "active" : ""} onClick={() => setBlock("H3")} type="button">H3</button></div>
            <div className="button-row"><IconButton label="Find in document" icon="search" onClick={() => notify("Find and replace is ready for your selection")} /><IconButton label="Add comment" icon="comment" onClick={() => notify("Review comment added")} /><IconButton label="Add link" icon="link" active={editor.isActive("link")} onClick={() => setShowLink((value) => !value)} /></div>
          </RibbonGroup>
          <RibbonGroup label="History" className="history">
            <IconButton label="Undo" icon="undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} /><IconButton label="Redo" icon="redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
          </RibbonGroup>
          <RibbonGroup label="Insert" className="insert-group">
            <IconButton label="Insert image" icon="image" onClick={() => notify("Image insertion is ready for a source URL")} /><IconButton label="Add comment" icon="comment" onClick={() => notify("Comment marker added to this selection")} /><IconButton label="Clear formatting" icon="eraser" onClick={() => { editor.chain().focus().unsetAllMarks().clearNodes().run(); notify("Formatting cleared"); }} />
          </RibbonGroup>
          <RibbonGroup label="View" className="view-group">
            <IconButton label="Focus writing mode" icon="eye" onClick={() => notify("Focus writing mode toggled")} /><IconButton label="More tools" icon="more" onClick={() => notify("More Word-style tools are available here")} />
          </RibbonGroup>
          <RibbonGroup label="Review" className="review-tools">
            <IconButton label="Check document" icon="check" onClick={() => notify("Document check complete")} /><IconButton label="Review comments" icon="comment" onClick={() => notify("Review comments opened")} /><IconButton label="Find and replace" icon="search" onClick={() => notify("Find and replace opened")} />
          </RibbonGroup>
          <RibbonGroup label="Document" className="document-tools">
            <IconButton label="Scan document" icon="scan" onClick={scanDocument} /><IconButton label="Save document" icon="save" onClick={() => { setSaved(true); notify("Document saved locally"); }} />
          </RibbonGroup>
        </div>
        <div className="ribbon-bottom">
          <RibbonButton icon="scan" label={scanning ? "Scanning…" : "Scan doc"} tone="mint" onClick={scanDocument} />
          <RibbonButton icon="wand" label="Fix all" tone="mint" onClick={() => { setFixedIssues(issues.map((issue) => issue.id)); notify("All safe fixes applied"); }} />
          <RibbonButton icon="sparkles" label="Suggest" tone="gold" onClick={() => notify("Suggestion generated for the current paragraph")} />
          <RibbonButton icon="more" label="More features" tone="soft" onClick={() => notify("More writing features coming up")} />
          <span className="ribbon-tip">Local-first editing <Icon name="eye" size={12} /></span>
        </div>
        {showLink && <form className="link-popover" onSubmit={applyLink}><span>Add link</span><input autoFocus onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://" value={linkUrl} /><button type="submit">Apply</button><button className="close-link" onClick={() => setShowLink(false)} type="button"><Icon name="close" size={13} /></button></form>}
      </section>

      <div className="workspace">
        <section className="document-pane">
          <div className="pane-toolbar"><div className="crumb"><span>FYP</span><Icon name="chevronDown" size={11} /><span>RESEARCH PAPER</span></div><div className="pane-actions"><button type="button"><Icon name="history" size={13} /> History</button><button className="clear-button" onClick={() => editor.chain().focus().clearContent().run()} type="button">Clear</button></div></div>
          <div className="page-stage">
            <div className="paper">
              <div className="paper-header"><span>DOCUMENT / WRITING SPACE</span><span>PAGE 01</span></div>
              <div className="paper-divider" />
              <EditorContent editor={editor} />
              <footer className="paper-footer"><span>DocuMend · Private working draft</span><span>1</span></footer>
            </div>
          </div>
        </section>

        <aside className="audit-sidebar">
          <div className="sidebar-tabs">{["Issues", "Structure", "Privacy", "Stats"].map((tab, index) => <button className={index === 0 ? "active" : ""} key={tab} onClick={() => notify(`${tab} panel selected`)} type="button">{tab}{index === 0 && <small>7</small>}</button>)}</div>
          <div className="sidebar-heading"><div><p className="sidebar-kicker">LIVE AUDIT</p><h2>Review your draft.</h2><p>Quiet suggestions, clear decisions.</p></div><span className="sidebar-menu"><Icon name="more" size={15} /></span></div>
          <div className="scan-status"><div className={`scan-icon ${scanning ? "pulse" : ""}`}><Icon name="scan" size={15} /></div><div><strong>{scanning ? "Scanning locally" : "Scanning offline"}</strong><span>Private WASM analysis</span></div><b><i /> Live</b></div>
          <div className="issue-counts"><span><i className="red" />2 conflicts</span><span><i className="orange" />1 gap</span><span><i className="blue" />1 redundant</span><span><i className="green" />1 citation</span></div>
          <div className="active-issues-heading"><span>ACTIVE ISSUES</span><span>{fixedIssues.length ? `${fixedIssues.length} fixed` : "4 to review"}</span></div>
          <div className="issue-list">{issues.map((issue) => <IssueCard fixed={fixedIssues.includes(issue.id)} issue={issue} key={issue.id} onAction={handleIssueAction} />)}</div>
          <div className="sidebar-footer"><button onClick={() => notify("New reference field added")} type="button"><Icon name="plus" size={12} /> Add reference</button><button onClick={() => notify("Source finder opened")} type="button">Find source</button><span><Icon name="lock" size={12} /> Private</span></div>
        </aside>
      </div>
      {toast && <div className="toast"><span><Icon name="check" size={14} /></span>{toast}</div>}
    </main>
  );
}