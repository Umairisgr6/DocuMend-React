/**
 * Reveal — fades its children up into place the first time they scroll into
 * view, then stops observing.
 *
 * Anything already near the top of the viewport on mount is shown straight
 * away rather than animated: without that check, content that is visible
 * before the observer's first callback would flash in for no reason.
 */
import { useEffect, useRef, useState } from 'react';
import './reveal.css';

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Already on screen -- skip the animation entirely.
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
