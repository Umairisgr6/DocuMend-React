import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import LogIn from './pages/LogIn';
import MyDocuments from './pages/MyDocuments';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import Editor from './pages/editor';
import Pricing from './pages/pricing';   // Agar Pricing component hai
import { usePathname } from './router';

function Router() {
  const pathname = usePathname();
  if (pathname === '/') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
  if (pathname === '/login') return <LogIn />;
  if (pathname === '/dashboard') return <Dashboard />;
  if (pathname === '/editor') return <Editor />;
  if (pathname === '/documents') return <MyDocuments />;
  if (pathname === '/pricing' || pathname === '/subscription') return <Pricing />;  return <NotFound />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;


