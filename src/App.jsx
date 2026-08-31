import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import NotFound from './pages/NotFound';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import { usePathname } from './router';

function Router() {
  const pathname = usePathname();
  if (pathname === '/') return <LandingPage />;
  if (pathname === '/signup') return <SignUp />;
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
