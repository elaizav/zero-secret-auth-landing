import {
  createMenuState,
  getSectionObserverOptions,
  matchesSectionLink
} from './script-helpers.mjs';

/**
 * Initializes the shared navigation behavior for the landing page.
 *
 * The function connects the burger menu with ARIA attributes, toggles
 * body scrolling for the mobile state, and updates active navigation
 * links according to the currently visible content section.
 *
 * @param {object} [options] Optional runtime references used to keep the implementation
 *   testable and explicit.
 * @param {Document} [options.documentRef] Document object used by the page.
 * @returns {void}
 * @example
 * initializeNavigationEnhancements();
 */
export function initializeNavigationEnhancements(options = {}) {
  const documentRef = options.documentRef ?? document;
  const burger = documentRef.getElementById('burger');
  const menu = documentRef.getElementById('site-menu');
  const navLinks = [...documentRef.querySelectorAll('.nav-link')];
  const sectionTargets = [...documentRef.querySelectorAll('main section[id]')];
  const languageCode = documentRef.documentElement.lang;

  if (burger instanceof HTMLButtonElement && menu instanceof HTMLElement) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      const menuState = createMenuState(isOpen, languageCode);

      documentRef.body.classList.toggle(menuState.bodyClassName, menuState.isOpen);
      burger.setAttribute('aria-expanded', menuState.ariaExpanded);
      burger.setAttribute('aria-label', menuState.ariaLabel);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        const menuState = createMenuState(false, languageCode);

        menu.classList.remove('is-open');
        documentRef.body.classList.remove(menuState.bodyClassName);
        burger.setAttribute('aria-expanded', menuState.ariaExpanded);
        burger.setAttribute('aria-label', menuState.ariaLabel);
      });
    });
  }

  if (
    navLinks.length > 0
    && sectionTargets.length > 0
    && typeof IntersectionObserver === 'function'
  ) {
    const observerOptions = getSectionObserverOptions();

    /**
     * Updates navigation link states according to the currently visible section.
     *
     * @param {IntersectionObserverEntry[]} entries Entries provided by the observer callback.
     * @returns {void}
     */
    function handleObservedEntries(entries) {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const href = link.getAttribute('href');
          link.classList.toggle('is-active', matchesSectionLink(href, entry.target.id));
        });
      });
    }

    const observer = new IntersectionObserver(handleObservedEntries, observerOptions);

    sectionTargets.forEach((section) => observer.observe(section));
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  initializeNavigationEnhancements();
}
