/**
 * Returns localized menu labels for the shared site navigation.
 *
 * @param {string} languageCode The language code declared on the current page.
 * @returns {{ open: string, close: string }} Localized labels for the burger menu.
 * @example
 * getMenuLabels('uk');
 * // => { open: 'Відкрити меню', close: 'Закрити меню' }
 */
export function getMenuLabels(languageCode) {
  if (languageCode === 'uk') {
    return {
      open: 'Відкрити меню',
      close: 'Закрити меню'
    };
  }

  return {
    open: 'Open menu',
    close: 'Close menu'
  };
}

/**
 * Builds the normalized menu state used by the browser script.
 *
 * @param {boolean} isOpen Whether the mobile menu is currently open.
 * @param {string} languageCode The page language code.
 * @returns {{
 *   isOpen: boolean,
 *   ariaExpanded: 'true' | 'false',
 *   ariaLabel: string,
 *   bodyClassName: 'menu-open'
 * }} State values that can be applied to DOM elements.
 * @example
 * createMenuState(true, 'en').ariaLabel;
 * // => 'Close menu'
 */
export function createMenuState(isOpen, languageCode) {
  const labels = getMenuLabels(languageCode);

  return {
    isOpen,
    ariaExpanded: isOpen ? 'true' : 'false',
    ariaLabel: isOpen ? labels.close : labels.open,
    bodyClassName: 'menu-open'
  };
}

/**
 * Checks whether a navigation link points to the currently active section.
 *
 * @param {string | null} linkHref The `href` attribute of a navigation link.
 * @param {string} sectionId The id of the visible section.
 * @returns {boolean} `true` when the link matches the section anchor.
 * @example
 * matchesSectionLink('#overview', 'overview');
 * // => true
 */
export function matchesSectionLink(linkHref, sectionId) {
  return linkHref === `#${sectionId}`;
}

/**
 * Creates a reusable navigation tracker for active-section highlighting.
 *
 * @param {{ getAttribute: (name: string) => string | null, classList: { toggle: (className: string, force?: boolean) => void } }[]} navLinks Navigation link elements.
 * @returns {{
 *   activeHref: string | null,
 *   entries: {
 *     href: string | null,
 *     element: { classList: { toggle: (className: string, force?: boolean) => void } }
 *   }[],
 *   hrefToEntry: Map<string, {
 *     href: string | null,
 *     element: { classList: { toggle: (className: string, force?: boolean) => void } }
 *   }>
 * }} Tracker object reused by the browser script and benchmarks.
 */
export function createNavigationTracker(navLinks) {
  const entries = navLinks.map((link) => ({
    href: link.getAttribute('href'),
    element: link
  }));

  return {
    activeHref: null,
    entries,
    hrefToEntry: new Map(
      entries
        .filter((entry) => typeof entry.href === 'string')
        .map((entry) => [/** @type {string} */ (entry.href), entry])
    )
  };
}

/**
 * Applies active navigation state for the currently visible section.
 *
 * The baseline implementation scans all navigation entries and toggles
 * each item individually so that later optimizations can be measured
 * against the same public interface.
 *
 * @param {{
 *   activeHref: string | null,
 *   entries: {
 *     href: string | null,
 *     element: { classList: { toggle: (className: string, force?: boolean) => void } }
 *   }[],
 *   hrefToEntry: Map<string, {
 *     href: string | null,
 *     element: { classList: { toggle: (className: string, force?: boolean) => void } }
 *   }>
 * }} tracker Navigation tracker created by `createNavigationTracker`.
 * @param {string} sectionId Section id currently considered active.
 * @returns {string} Anchor href that became active.
 */
export function applyActiveSectionState(tracker, sectionId) {
  const activeHref = `#${sectionId}`;
  const previousEntry = tracker.activeHref ? tracker.hrefToEntry.get(tracker.activeHref) : undefined;
  const nextEntry = tracker.hrefToEntry.get(activeHref);

  if (previousEntry && previousEntry !== nextEntry) {
    previousEntry.element.classList.toggle('is-active', false);
  }

  if (nextEntry) {
    nextEntry.element.classList.toggle('is-active', true);
    tracker.activeHref = activeHref;
    return activeHref;
  }

  if (previousEntry) {
    previousEntry.element.classList.toggle('is-active', false);
  }

  tracker.activeHref = null;
  return activeHref;
}

/**
 * Returns stable observer settings for active-section tracking.
 *
 * @returns {{ threshold: number, rootMargin: string }} Shared observer settings.
 * @example
 * getSectionObserverOptions();
 * // => { threshold: 0.45, rootMargin: '-10% 0px -35% 0px' }
 */
export function getSectionObserverOptions() {
  return {
    threshold: 0.45,
    rootMargin: '-10% 0px -35% 0px'
  };
}
