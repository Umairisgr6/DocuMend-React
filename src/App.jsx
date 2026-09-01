import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
<<<<<<< Updated upstream
import Editor from './pages/Editor';
import Features from './pages/Features';
=======
import Editor from './pages/editor';
>>>>>>> Stashed changes
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import MyDocuments from './pages/MyDocuments';
import NotFound from './pages/NotFound';
import Pricing from './pages/pricing';
import SignUp from './pages/SignUp';
import VersionHistory from './pages/version';
import Features from './pages/Features';
import Settings from './pages/settings';
import Help from './pages/Help';
import Storage from './pages/storage';
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
<<<<<<< Updated upstream
  if (pathname === '/features') return <Features />;
=======
  if (pathname === '/Features') return <Features />;
  if (pathname === '/Settings') return <Settings />;
  if (pathname === '/help' || pathname === '/help-and-guide') return <Help />;
  if (pathname === '/storage') return <Storage />;


>>>>>>> Stashed changes
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
