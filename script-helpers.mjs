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
