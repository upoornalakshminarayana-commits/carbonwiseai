import { useEffect } from 'react';

export const useScrollReveal = (dependency?: any) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Unobserve once revealed to keep it revealed and avoid recalculation
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px', // trigger slightly before elements fully enter
      }
    );

    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade';
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, [dependency]);
};
