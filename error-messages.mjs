/**
 * User-facing localized error texts used by the browser UI and server error pages.
 *
 * @type {Record<string, Record<string, { title: string, description: string, action: string }>>}
 */
export const ERROR_MESSAGES = {
  uk: {
    navigation_init_failed: {
      title: 'Не вдалося повністю ініціалізувати сторінку',
      description: 'Спробуйте перезавантажити сторінку. Якщо проблема повториться, повідомте про неї за посиланням нижче.',
      action: 'Повідомити про проблему'
    },
    unexpected_error: {
      title: 'Сталася неочікувана помилка',
      description: 'Оновіть сторінку або відкрийте її пізніше. Для діагностики можна надіслати короткий опис проблеми.',
      action: 'Надіслати опис проблеми'
    },
    asset_missing: {
      title: 'Потрібний ресурс не знайдено',
      description: 'Сторінка або файл недоступні. Перевірте адресу або поверніться на головну сторінку.',
      action: 'Повернутися на головну'
    },
    server_unavailable: {
      title: 'Сервер тимчасово недоступний',
      description: 'Спробуйте повторити дію трохи пізніше. Якщо проблема не зникає, повідомте її ідентифікатор.',
      action: 'Повідомити про проблему'
    }
  },
  en: {
    navigation_init_failed: {
      title: 'The page could not be initialized completely',
      description: 'Try reloading the page. If the problem continues, report it with the link below.',
      action: 'Report the problem'
    },
    unexpected_error: {
      title: 'An unexpected error occurred',
      description: 'Reload the page or try again later. You can also send a short problem description for diagnostics.',
      action: 'Send a problem report'
    },
    asset_missing: {
      title: 'The requested resource was not found',
      description: 'The page or file is unavailable. Check the address or return to the home page.',
      action: 'Return to the home page'
    },
    server_unavailable: {
      title: 'The server is temporarily unavailable',
      description: 'Please try again later. If the problem continues, report the error identifier.',
      action: 'Report the problem'
    }
  }
};

/**
 * Normalizes the page language into a supported localization key.
 *
 * @param {string | null | undefined} languageCode Page language string.
 * @returns {'uk' | 'en'} Supported language code.
 */
export function getSupportedLanguage(languageCode) {
  return languageCode === 'uk' ? 'uk' : 'en';
}

/**
 * Returns a localized user-facing error message bundle.
 *
 * @param {string | null | undefined} languageCode Current page language.
 * @param {'navigation_init_failed' | 'unexpected_error' | 'asset_missing' | 'server_unavailable'} messageKey Message key.
 * @returns {{ title: string, description: string, action: string }} Localized message data.
 */
export function getUserErrorMessage(languageCode, messageKey) {
  const supportedLanguage = getSupportedLanguage(languageCode);
  return ERROR_MESSAGES[supportedLanguage][messageKey];
}

/**
 * Builds a GitHub issue link with prefilled context for reporting a runtime problem.
 *
 * @param {string | null | undefined} languageCode Current page language.
 * @param {string} errorId Generated error identifier.
 * @param {string} pageUrl URL where the error occurred.
 * @returns {string} Problem-report URL.
 */
export function createProblemReportUrl(languageCode, errorId, pageUrl) {
  const supportedLanguage = getSupportedLanguage(languageCode);
  const title = supportedLanguage === 'uk'
    ? `Проблема сайту: ${errorId}`
    : `Website problem: ${errorId}`;
  const body = supportedLanguage === 'uk'
    ? `Ідентифікатор помилки: ${errorId}%0AURL: ${encodeURIComponent(pageUrl)}%0AОпис проблеми:%0A`
    : `Error ID: ${errorId}%0AURL: ${encodeURIComponent(pageUrl)}%0ADescription:%0A`;

  return `https://github.com/elaizav/zero-secret-auth-landing/issues/new?title=${encodeURIComponent(title)}&body=${body}`;
}
