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
import Features from './pages/Features';
import Settings from './pages/settings';
import Help from './pages/Help';
import Storage from './pages/storage';
import { usePathname } from './router';

function Router() {
  const rawPathname = usePathname();
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

  // Pricing & Subscription
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