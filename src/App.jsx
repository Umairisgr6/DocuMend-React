import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Editor from './pages/editor';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import MyDocuments from './pages/MyDocuments';
import NotFound from './pages/NotFound';
import Pricing from './pages/pricing';
import SignUp from './pages/SignUp';
import VersionHistory from './pages/version';
import { usePathname } from './router';

// Route table. Sidebar links reach these through the workspaceRoutes map in
// components/workspace-nav.js — add a route here AND an entry there, or the
// sidebar item will only show a toast.
function Router() {
  const pathname = usePathname();
  if (pathname === '/') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
  if (pathname === '/login') return <LogIn />;
  if (pathname === '/dashboard') return <Dashboard />;
  if (pathname === '/documents') return <MyDocuments />;
  if (pathname === '/editor') return <Editor />;
  if (pathname === '/version') return <VersionHistory />;
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
