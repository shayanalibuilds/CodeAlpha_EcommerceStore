import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Start every new page at the top (e.g. the receipt banner after "Place order").
// Only the pathname counts, so changing catalog filters (?category=, ?sort=)
// keeps the shopper where they are. Back/forward (POP) is left to the browser.
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return null;
}
