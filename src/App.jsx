import { ErrorBoundary } from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import { usePathname } from './router';

function Router() {
  const pathname = usePathname();
  if (pathname === '/') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
  if (pathname === '/login') return <LogIn />;
  if (pathname === '/dashboard') return <Dashboard />;
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
