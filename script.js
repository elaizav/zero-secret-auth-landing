import {
  createMenuState,
  getSectionObserverOptions,
  matchesSectionLink
} from './script-helpers.mjs';
import { createBrowserLogger, installGlobalErrorHandlers, showFatalErrorBanner } from './frontend-logger.mjs';

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
 * @param {Window} [options.windowRef] Window object used for browser integrations.
 * @param {ReturnType<typeof createBrowserLogger>} [options.loggerRef] Logger instance used for diagnostics.
 * @returns {void}
 * @example
 * initializeNavigationEnhancements();
 */
export function initializeNavigationEnhancements(options = {}) {
  const documentRef = options.documentRef ?? document;
  const windowRef = options.windowRef ?? window;
  const logger = options.loggerRef ?? createBrowserLogger({
    moduleName: 'navigation',
    languageCode: documentRef.documentElement.lang,
    locationRef: windowRef.location,
    consoleRef: console,
    localStorageRef: windowRef.localStorage,
    sessionStorageRef: windowRef.sessionStorage
  });
  const burger = documentRef.getElementById('burger');
  const menu = documentRef.getElementById('site-menu');
  const navLinks = [...documentRef.querySelectorAll('.nav-link')];
  const sectionTargets = [...documentRef.querySelectorAll('main section[id]')];
  const languageCode = documentRef.documentElement.lang;

  logger.info('Navigation enhancement initialization started', {
    navLinkCount: navLinks.length,
    sectionCount: sectionTargets.length
  });

  if (burger instanceof HTMLButtonElement && menu instanceof HTMLElement) {
    burger.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      const menuState = createMenuState(isOpen, languageCode);

      documentRef.body.classList.toggle(menuState.bodyClassName, menuState.isOpen);
      burger.setAttribute('aria-expanded', menuState.ariaExpanded);
      burger.setAttribute('aria-label', menuState.ariaLabel);
      logger.info('Navigation menu toggled', {
        isOpen: menuState.isOpen
      });
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        const menuState = createMenuState(false, languageCode);

        menu.classList.remove('is-open');
        documentRef.body.classList.remove(menuState.bodyClassName);
        burger.setAttribute('aria-expanded', menuState.ariaExpanded);
        burger.setAttribute('aria-label', menuState.ariaLabel);
        logger.debug('Navigation link selected from menu', {
          href: link.getAttribute('href')
        });
      });
    });
  } else {
    logger.warning('Navigation controls were not found', {
      hasBurger: burger instanceof HTMLButtonElement,
      hasMenu: menu instanceof HTMLElement
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

        logger.debug('Active section changed', {
          sectionId: entry.target.id
        });
      });
    }

    const observer = new IntersectionObserver(handleObservedEntries, observerOptions);

    sectionTargets.forEach((section) => observer.observe(section));
  } else {
    logger.warning('Active section tracking is unavailable', {
      navLinkCount: navLinks.length,
      sectionCount: sectionTargets.length,
      hasIntersectionObserver: typeof IntersectionObserver === 'function'
    });
  }

  Reflect.set(windowRef, 'zeroSecretDiagnostics', {
    exportLogs: logger.exportLogs,
    getLogs: logger.getEntries,
    getSessionId: logger.getSessionId
  });

  logger.info('Navigation enhancement initialization completed');
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const runtimeLogger = createBrowserLogger({
    moduleName: 'browser-runtime',
    languageCode: document.documentElement.lang,
    locationRef: window.location,
    consoleRef: console,
    localStorageRef: window.localStorage,
    sessionStorageRef: window.sessionStorage
  });

  installGlobalErrorHandlers({
    windowRef: window,
    documentRef: document,
    languageCode: document.documentElement.lang,
    logger: runtimeLogger
  });

  try {
    initializeNavigationEnhancements({
      documentRef: document,
      windowRef: window,
      loggerRef: runtimeLogger
    });
  } catch (error) {
    const errorId = runtimeLogger.critical('Navigation enhancement initialization failed', {
      reason: error instanceof Error ? error.message : String(error)
    });

    showFatalErrorBanner({
      documentRef: document,
      languageCode: document.documentElement.lang,
      messageKey: 'navigation_init_failed',
      errorId,
      pageUrl: window.location.href,
      exportLogs: runtimeLogger.exportLogs
    });
  }
}
