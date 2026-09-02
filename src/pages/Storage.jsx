import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Cpu,
  Database,
  Download,
  FilePlus2,
  FileText,
  HardDrive,
  History,
  Lock,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  MobileDrawer,
  MobileTopbar,
  Sidebar,
  WorkspaceModal,
} from '../components/WorkspaceChrome';
import { workspaceRoutes } from '../components/workspace-nav';
import { useTheme } from '../components/ThemeContext';
import { navigate } from '../router';
import './storage.css';

export default function Storage() {
  // Global Shared Theme Context
  const { darkMode, toggleDarkMode } = useTheme();

  // Workspace Chrome Shell States
  const [activeNav, setActiveNav] = useState('Storage');
  const [privacyMode, setPrivacyMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');

  // Storage Dynamic State
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [storageData, setStorageData] = useState({
    totalLimitMB: 250,
    documentsMB: 0,
    versionCacheMB: 0,
    encryptedBlobsMB: 0,
    embeddingsMB: 0,
    docCount: 0,
    snapshotCount: 0,
    lastSyncTime: 'Scanning...',
  });

  const [confirmAction, setConfirmAction] = useState(null);

  const notify = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2700);
  };

  // Pull actual documents count from local storage or initialize realistic values
  const runStorageDiagnostics = () => {
    setIsRefreshing(true);

    window.setTimeout(() => {
      // Dynamic count reading: check if user has custom docs stored
      const savedDocs = JSON.parse(localStorage.getItem('documend_documents') || 'null');
      const baseDocsCount = savedDocs && Array.isArray(savedDocs) ? savedDocs.length : 12;
      
      const savedSnapshots = parseInt(localStorage.getItem('documend_snapshot_count') || '247', 10);

      // Memory calculations linked dynamically to document and snapshot count
      const computedDocMB = Math.round(baseDocsCount * 7.8);
      const computedCacheMB = Math.round(savedSnapshots * 0.22);
      const computedBlobMB = Math.round(baseDocsCount * 3.1);
      const computedEmbedMB = Math.round(baseDocsCount * 1.05);

      setStorageData({
        totalLimitMB: 250,
        documentsMB: computedDocMB,
        versionCacheMB: computedCacheMB,
        encryptedBlobsMB: computedBlobMB,
        embeddingsMB: computedEmbedMB,
        docCount: baseDocsCount,
        snapshotCount: savedSnapshots,
        lastSyncTime: 'Just now',
      });
      setIsRefreshing(false);
    }, 400);
  };

  useEffect(() => {
    runStorageDiagnostics();
  }, []);

  // Helper: Simulate saving a new document dynamically
  const handleAddNewDocument = () => {
    setStorageData((prev) => {
      const newDocCount = prev.docCount + 1;
      const newSnapCount = prev.snapshotCount + 3;
      const newDocMB = prev.documentsMB + 8;
      const newCacheMB = prev.versionCacheMB + 2;
      const newBlobMB = prev.encryptedBlobsMB + 3;

      // Persist dynamic state locally
      localStorage.setItem('documend_snapshot_count', newSnapCount.toString());

      notify(`New draft saved! Document count is now ${newDocCount}`);
      return {
        ...prev,
        docCount: newDocCount,
        snapshotCount: newSnapCount,
        documentsMB: newDocMB,
        versionCacheMB: newCacheMB,
        encryptedBlobsMB: newBlobMB,
        lastSyncTime: 'A few seconds ago',
      };
    });
  };

  // Helper: Simulate taking a new manual version snapshot
  const handleAddSnapshot = () => {
    setStorageData((prev) => {
      const newSnapCount = prev.snapshotCount + 1;
      const newCacheMB = prev.versionCacheMB + 1;
      localStorage.setItem('documend_snapshot_count', newSnapCount.toString());

      notify(`Snapshot recorded! Total snapshots: ${newSnapCount}`);
      return {
        ...prev,
        snapshotCount: newSnapCount,
        versionCacheMB: newCacheMB,
        lastSyncTime: 'Just now',
      };
    });
  };

  const totalUsedMB =
    storageData.documentsMB +
    storageData.versionCacheMB +
    storageData.encryptedBlobsMB;

  const usedPercentage = Math.min(
    100,
    Math.round((totalUsedMB / storageData.totalLimitMB) * 100)
  );

  const docPct = ((storageData.documentsMB / storageData.totalLimitMB) * 100).toFixed(1);
  const cachePct = ((storageData.versionCacheMB / storageData.totalLimitMB) * 100).toFixed(1);
  const blobPct = ((storageData.encryptedBlobsMB / storageData.totalLimitMB) * 100).toFixed(1);

  const handleRunAction = (actionId) => {
    if (actionId === 'cache') {
      const reclaimed = Math.round(storageData.versionCacheMB * 0.45);
      const newSnapCount = Math.max(12, storageData.snapshotCount - 90);
      localStorage.setItem('documend_snapshot_count', newSnapCount.toString());

      setStorageData((prev) => ({
        ...prev,
        snapshotCount: newSnapCount,
        versionCacheMB: Math.max(14, prev.versionCacheMB - reclaimed),
      }));
      notify(`Version cache purged: ${reclaimed} MB reclaimed safely`);
    } else if (actionId === 'wipe') {
      localStorage.removeItem('documend_snapshot_count');
      localStorage.removeItem('documend_documents');

      setStorageData({
        totalLimitMB: 250,
        documentsMB: 0,
        versionCacheMB: 0,
        encryptedBlobsMB: 0,
        embeddingsMB: 0,
        docCount: 0,
        snapshotCount: 0,
        lastSyncTime: 'Reset',
      });
      notify('IndexedDB storage wiped completely');
    }
    setConfirmAction(null);
  };

  const selectNav = (label) => {
    const route = workspaceRoutes?.[label];
    if (route && label !== 'Storage') {
      navigate(route);
      return;
    }
    if (label === 'Dashboard') return navigate('/dashboard');
    if (label === 'Editor') return navigate('/editor');
    if (label === 'Subscription' || label === 'Pricing') return navigate('/pricing');
    if (label === 'Version history') return navigate('/version');
    if (label === 'Features') return navigate('/features');
    if (label === 'Settings') return navigate('/settings');
    if (label === 'Help and Guide') return navigate('/help');
    if (label === 'Share Document') return navigate('/share');

    setActiveNav(label);
    if (label !== 'Storage') notify(`${label} view selected`);
    setMobileSidebar(false);
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

      <main className={`dash-main stor-main-area ${sidebarCollapsed ? 'is-wide' : ''}`}>
        <div className="stor-ambient-glow stor-glow-1" aria-hidden="true" />
        <div className="stor-ambient-glow stor-glow-2" aria-hidden="true" />

        <div className="stor-container">
          {/* Top Page Banner */}
          <header className="stor-header-bar">
            <div>
              <div className="stor-pill-tag">
                <Database size={13} />
                <span>IndexedDB Persistent Storage</span>
              </div>
              <h1>IndexedDB Local Storage & Memory Vault</h1>
              <p>
                Manage client-side browser quotas, offline vector embeddings, and zero-knowledge encrypted blobs.
              </p>
            </div>

            <div className="stor-header-actions">
              <button
                type="button"
                className="stor-action-capsule-btn"
                onClick={handleAddNewDocument}
                title="Simulate saving a new document"
              >
                <Plus size={15} />
                <span>Save New Draft</span>
              </button>

              <button
                type="button"
                className={`stor-refresh-btn ${isRefreshing ? 'is-rotating' : ''}`}
                onClick={runStorageDiagnostics}
                title="Refresh Storage Footprint"
              >
                <RefreshCw size={15} />
                <span>{isRefreshing ? 'Scanning...' : 'Refresh Vault'}</span>
              </button>
            </div>
          </header>

          {/* 1. Primary Dynamic Multi-Color Storage Meter Card */}
          <section className="stor-glass-card stor-meter-card" aria-label="Storage Usage Overview">
            <div className="stor-meter-top">
              <div className="stor-used-headline">
                <span className="stor-pct-number">{usedPercentage}%</span>
                <div className="stor-used-text">
                  <strong>used — {totalUsedMB} MB of {storageData.totalLimitMB} MB</strong>
                  <small>Allocated quota inside isolated browser domain</small>
                </div>
              </div>

              <div className={`stor-status-badge ${usedPercentage > 70 ? 'is-warning' : 'is-healthy'}`}>
                <span className="stor-pulsing-dot" />
                <span>{usedPercentage > 70 ? 'Approaching Limit' : 'Healthy Buffer'}</span>
              </div>
            </div>

            {/* Segmented Dynamic Track */}
            <div className="stor-dynamic-track">
              <div
                className="stor-track-seg stor-seg-green"
                style={{ width: `${isRefreshing ? 0 : docPct}%` }}
                title={`Documents: ${storageData.documentsMB} MB`}
              />
              <div
                className="stor-track-seg stor-seg-gold"
                style={{ width: `${isRefreshing ? 0 : cachePct}%` }}
                title={`Version Cache: ${storageData.versionCacheMB} MB`}
              />
              <div
                className="stor-track-seg stor-seg-blue"
                style={{ width: `${isRefreshing ? 0 : blobPct}%` }}
                title={`Encrypted Blobs: ${storageData.encryptedBlobsMB} MB`}
              />
            </div>

            {/* Legend Labels with Values */}
            <div className="stor-legend-row">
              <div className="stor-legend-chip">
                <span className="stor-legend-dot stor-dot-green" />
                <span>Documents ({storageData.documentsMB} MB)</span>
              </div>
              <div className="stor-legend-chip">
                <span className="stor-legend-dot stor-dot-gold" />
                <span>Version Cache ({storageData.versionCacheMB} MB)</span>
              </div>
              <div className="stor-legend-chip">
                <span className="stor-legend-dot stor-dot-blue" />
                <span>Encrypted Blobs ({storageData.encryptedBlobsMB} MB)</span>
              </div>
            </div>
          </section>

          {/* 2. Top-Level Metric Stats Grid */}
          <section className="stor-metrics-grid" aria-label="Storage Metrics">
            <div className="stor-stat-box" onClick={handleAddNewDocument} style={{ cursor: 'pointer' }}>
              <div className="stor-stat-icon stor-icon-green">
                <FileText size={18} />
              </div>
              <strong className="stor-stat-value">{storageData.docCount}</strong>
              <span className="stor-stat-label">Documents Stored</span>
              <small>Click to add simulated document</small>
            </div>

            <div className="stor-stat-box" onClick={handleAddSnapshot} style={{ cursor: 'pointer' }}>
              <div className="stor-stat-icon stor-icon-gold">
                <History size={18} />
              </div>
              <strong className="stor-stat-value">{storageData.snapshotCount}</strong>
              <span className="stor-stat-label">Version Snapshots</span>
              <small>Click to record a new snapshot</small>
            </div>

            <div className="stor-stat-box">
              <div className="stor-stat-icon stor-icon-blue">
                <Lock size={18} />
              </div>
              <strong className="stor-stat-value">100%</strong>
              <span className="stor-stat-label">Encrypted on Disk</span>
              <small>AES-GCM 256-bit isolation</small>
            </div>

            <div className="stor-stat-box">
              <div className="stor-stat-icon stor-icon-teal">
                <Cloud size={18} />
              </div>
              <strong className="stor-stat-value">Synced</strong>
              <span className="stor-stat-label">Zero-Knowledge State</span>
              <small>Last check {storageData.lastSyncTime}</small>
            </div>
          </section>

          {/* 3. Deep Breakdown Cards Grid */}
          <section className="stor-breakdown-grid" aria-label="Component Storage Breakdown">
            <div className="stor-breakdown-card">
              <div className="stor-bd-header">
                <div className="stor-bd-title">
                  <FileText size={16} className="stor-color-green" />
                  <h4>Documents</h4>
                </div>
                <span className="stor-bd-size">{storageData.documentsMB} MB</span>
              </div>
              <p>Active research manuscripts & document abstract syntax trees.</p>
              <div className="stor-bd-mini-bar">
                <div className="stor-bd-fill stor-bg-green" style={{ width: `${Math.min(100, (storageData.documentsMB / 140) * 100)}%` }} />
              </div>
              <span className="stor-bd-meta">{storageData.docCount} active files · AES-256 encrypted</span>
            </div>

            <div className="stor-breakdown-card">
              <div className="stor-bd-header">
                <div className="stor-bd-title">
                  <History size={16} className="stor-color-gold" />
                  <h4>Version Cache</h4>
                </div>
                <span className="stor-bd-size">{storageData.versionCacheMB} MB</span>
              </div>
              <p>Automatic snapshot differentials and sentence rollback logs.</p>
              <div className="stor-bd-mini-bar">
                <div className="stor-bd-fill stor-bg-gold" style={{ width: `${Math.min(100, (storageData.versionCacheMB / 90) * 100)}%` }} />
              </div>
              <span className="stor-bd-meta">{storageData.snapshotCount} auto-saved version checkpoints</span>
            </div>

            <div className="stor-breakdown-card">
              <div className="stor-bd-header">
                <div className="stor-bd-title">
                  <Cpu size={16} className="stor-color-purple" />
                  <h4>Local Vector Index</h4>
                </div>
                <span className="stor-bd-size">{storageData.embeddingsMB} MB</span>
              </div>
              <p>Indexed embeddings used by ODIE for offline contradiction scans.</p>
              <div className="stor-bd-mini-bar">
                <div className="stor-bd-fill stor-bg-purple" style={{ width: `${Math.min(100, (storageData.embeddingsMB / 30) * 100)}%` }} />
              </div>
              <span className="stor-bd-meta">ONNX local vector embeddings index</span>
            </div>
          </section>

          {/* 4. Storage Maintenance & Action Table */}
          <section className="stor-glass-card stor-management-section" aria-label="Storage Management Utilities">
            <div className="stor-mgmt-header">
              <div>
                <h3>Storage Management & Vault Operations</h3>
                <p>Purge stale version checkpoints or wipe cached browser data safely.</p>
              </div>
            </div>

            <div className="stor-table-container">
              <table className="stor-action-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Frees Up</th>
                    <th>Risk Level</th>
                    <th className="stor-th-action">Execute</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="stor-action-cell">
                        <strong>Clear old version cache (&gt; 30 days)</strong>
                        <span>Removes expired intermediate auto-saves while preserving named checkpoints</span>
                      </div>
                    </td>
                    <td>
                      <span className="stor-frees-tag">~28 MB</span>
                    </td>
                    <td>
                      <span className="stor-risk-pill stor-risk-safe">
                        <CheckCircle2 size={12} /> Safe
                      </span>
                    </td>
                    <td className="stor-td-action">
                      <button
                        type="button"
                        className="stor-run-action-btn stor-btn-green"
                        onClick={() => handleRunAction('cache')}
                      >
                        Run
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td>
                      <div className="stor-action-cell">
                        <strong>Wipe all data (Full reset)</strong>
                        <span>Purges all documents, encryption keys, and IndexedDB snapshots permanently</span>
                      </div>
                    </td>
                    <td>
                      <span className="stor-frees-tag stor-frees-danger">~{totalUsedMB} MB</span>
                    </td>
                    <td>
                      <span className="stor-risk-pill stor-risk-danger">
                        <AlertOctagon size={12} /> Permanent
                      </span>
                    </td>
                    <td className="stor-td-action">
                      <button
                        type="button"
                        className="stor-run-action-btn stor-btn-danger"
                        onClick={() => setConfirmAction('wipe')}
                      >
                        Wipe
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Confirmation Dialog Modal */}
      {confirmAction === 'wipe' && (
        <div className="stor-modal-backdrop" role="presentation">
          <div className="stor-confirm-dialog" role="dialog" aria-modal="true">
            <div className="stor-dialog-head">
              <div className="stor-dialog-icon-danger">
                <AlertOctagon size={24} />
              </div>
              <div>
                <h3>Wipe entire local IndexedDB vault?</h3>
                <p>
                  This action will permanently erase all <strong>{storageData.docCount} documents</strong> and 
                  their snapshot histories from this browser. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="stor-dialog-actions">
              <button
                type="button"
                className="stor-btn-quiet"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="stor-btn-danger-confirm"
                onClick={() => handleRunAction('wipe')}
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Dialog Modal */}
      <WorkspaceModal
        mode={modal}
        onClose={() => setModal(null)}
        onSubmit={() => setModal(null)}
        onLogout={() => {
          setModal(null);
          navigate('/');
        }}
      />

      {/* Dynamic Toast Feedback */}
      {toast && (
        <div className="stor-toast" role="status" aria-live="polite">
          <Sparkles size={14} />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}