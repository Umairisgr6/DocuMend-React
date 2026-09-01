import {
  FileText,
  Clock,
  Sparkles,
  Shield,
  HelpCircle,
  HardDrive,
  Share2,
  Cpu,
  Sliders,
} from 'lucide-react';

export const navPrimary = [
  { label: 'Dashboard', icon: FileText },
  { label: 'My documents', icon: FileText },
  { label: 'Editor', icon: FileText },
  { label: 'Version history', icon: Clock, badge: '1' },
  { label: 'Subscription', icon: Sparkles },
];

export const navWorkspace = [
  { label: 'Features', icon: Cpu },
  { label: 'Privacy mode', icon: Shield },
  { label: 'Settings', icon: Sliders },
  { label: 'Help and Guide', icon: HelpCircle },
  { label: 'Storage', icon: HardDrive },
  { label: 'Share Document', icon: Share2 },
];

export const workspaceRoutes = {
  Dashboard: '/dashboard',
  'My documents': '/documents',
  Editor: '/editor',
  'Version history': '/version',
  Subscription: '/subscription',
  Pricing: '/pricing',
  Features: '/features',
  Settings: '/settings',
  'Help and Guide': '/help',
  Storage: '/storage',
  'Share Document': '/share', // <-- Add this line
};