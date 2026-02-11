import { useState, useEffect } from 'react';

export function useScrollSpy(
  selector: string,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: options.rootMargin ?? '-20% 0px -80% 0px',
        threshold: options.threshold ?? 0,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, options.rootMargin, options.threshold]);

  return activeId;
}
