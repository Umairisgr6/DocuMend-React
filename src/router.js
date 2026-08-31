import { useEffect, useState } from 'react';

export function navigate(path) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  // pushState does not fire popstate, so notify the listeners ourselves.
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

export function usePathname() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', syncPathname);
    return () => window.removeEventListener('popstate', syncPathname);
  }, []);
  return pathname;
}
