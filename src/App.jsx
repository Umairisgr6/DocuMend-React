import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Features from './pages/Features';
import Help from './pages/Help';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import MyDocuments from './pages/MyDocuments';
import NotFound from './pages/NotFound';
import Pricing from './pages/pricing';
import Settings from './pages/settings';
import SignUp from './pages/SignUp';
import Storage from './pages/storage';
import UploadDocument from './pages/UploadDocument';
import VersionHistory from './pages/version';
import { usePathname } from './router';

// Route table. Sidebar links reach these through the workspaceRoutes map in
// components/workspace-nav.js — add a route here AND an entry there, or the
// sidebar item will only show a toast.
function Router() {
  const rawPathname = usePathname();
  // Tolerate a trailing slash and any capitalisation in the address bar.
  const pathname = rawPathname ? rawPathname.toLowerCase().replace(/\/$/, '') || '/' : '/';

  if (pathname === '/' || pathname === '') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
  if (pathname === '/login') return <LogIn />;
  if (pathname === '/dashboard') return <Dashboard />;
  if (pathname === '/documents' || pathname === '/my-documents') return <MyDocuments />;
  if (pathname === '/editor') return <Editor />;
  if (pathname === '/version' || pathname === '/version-history') return <VersionHistory />;
  if (pathname === '/features') return <Features />;
  if (pathname === '/settings') return <Settings />;
  if (pathname === '/help' || pathname === '/help-and-guide') return <Help />;
  if (pathname === '/storage') return <Storage />;
  // Reached from the dashboard's "Upload / drop" tile, not from the sidebar.
  if (pathname === '/upload') return <UploadDocument />;
  // Two paths for one page: the sidebar calls it Subscription, the landing
  // page links to Pricing.
  if (pathname === '/pricing' || pathname === '/subscription') return <Pricing />;

  return <NotFound />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;
