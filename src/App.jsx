/**
 * App.jsx
 * -----------------------------------------------------------------------------
 * Root Application Entrypoint & Client-Side Routing Table.
 * 
 * Features:
 * - ErrorBoundary for catching rendering runtime errors.
 * - Global ThemeProvider wrapper enabling synchronized dark/light switching across all pages.
 * - Normalized pathname router supporting both lowercase and capitalized URLs.
 * -----------------------------------------------------------------------------
 */

import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeContext'; // <-- Global theme provider

// Page Components
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import ForgotPassword from './pages/ForgotPassword';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import MyDocuments from './pages/MyDocuments';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import SignUp from './pages/SignUp';
import VersionHistory from './pages/Version';
import Features from './pages/Features';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Storage from './pages/Storage';
import Share from './pages/Share';
import CreateDocument from './pages/CreateDocument'; // <-- Import karein
import CreateFolder from './pages/CreateFolder';
import Edit from './pages/Edit';

// Custom lightweight router hook
import { usePathname } from './router';

function Router() {
  const rawPathname = usePathname();
  
  // Normalize pathname: convert to lowercase and strip trailing slashes to prevent 404s
  const pathname = rawPathname ? rawPathname.toLowerCase().replace(/\/$/, '') || '/' : '/';

  // Public & Auth Routes
  if (pathname === '/' || pathname === '') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
  if (pathname === '/login') return <LogIn />;
  if (pathname === '/forgot-password' || pathname === '/reset-password') return <ForgotPassword />;

  // Workspace Protected Routes
  if (pathname === '/dashboard') return <Dashboard />;
  if (pathname === '/documents' || pathname === '/my-documents') return <MyDocuments />;
  if (pathname === '/editor') return <Editor />;
  if (pathname === '/version' || pathname === '/version-history') return <VersionHistory />;
  if (pathname === '/features') return <Features />;
  if (pathname === '/create-document' || pathname === '/createdocument') return <CreateDocument />; // <-- Add route
  if (pathname === '/create-folder' || pathname === '/createfolder') return <CreateFolder />;
  if (pathname === '/settings') return <Settings />;
  if (pathname === '/help' || pathname === '/help-and-guide') return <Help />;
  if (pathname === '/storage') return <Storage />;
  if (pathname === '/share' || pathname === '/share-document') return <Share />;
  if (pathname === '/edit' || pathname === '/select-document') return <Edit />;

  // Subscription & Pricing (both aliases map to the same page)
  if (pathname === '/pricing' || pathname === '/subscription') return <Pricing />;

  // Fallback 404
  return <NotFound />;
}

function App() {
  return (
    <ErrorBoundary>
      {/* ThemeProvider supplies the global dark/light state to all routed pages */}
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;