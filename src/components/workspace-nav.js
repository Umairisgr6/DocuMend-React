/**
 * workspace-nav — the sidebar's navigation data, shared by every signed-in
 * page.
 *
 * Kept separate from WorkspaceChrome.jsx so that file exports only React
 * components (a requirement for Vite's fast refresh — mixing data exports
 * into a component file downgrades hot reloads to full page reloads).
 */
import {
  CircleHelp,
  Cloud,
  FilePenLine,
  Files,
  Grid2X2,
  History,
  House,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';

// Labels that lead to a real page. A page's onNavigate checks here first and
// falls back to a "view selected" toast for everything else.
export const workspaceRoutes = {
  Dashboard: '/dashboard',
  'My documents': '/documents',
};

export const navPrimary = [
  { label: 'Dashboard', icon: House },
  { label: 'My documents', icon: Files },
  { label: 'Editor', icon: FilePenLine },
  { label: 'Version history', icon: History, badge: '3' },
  { label: 'Subscription', icon: Sparkles },
  { label: 'Features', icon: Grid2X2 },
];

// "Privacy mode" is handled specially by the Sidebar: it toggles a switch
// rather than navigating anywhere.
export const navWorkspace = [
  { label: 'Privacy mode', icon: ShieldCheck },
  { label: 'Settings', icon: Settings },
  { label: 'Help and guide', icon: CircleHelp },
  { label: 'Storage', icon: Cloud },
  { label: 'Shared documents', icon: UsersRound },
];
