import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMenuState,
  getMenuLabels,
  getSectionObserverOptions,
  matchesSectionLink
} from '../script-helpers.mjs';

test('getMenuLabels returns Ukrainian labels for the main page', () => {
  assert.deepEqual(getMenuLabels('uk'), {
    open: 'Відкрити меню',
    close: 'Закрити меню'
  });
});

test('createMenuState derives ARIA values from the open state', () => {
  assert.deepEqual(createMenuState(true, 'en'), {
    isOpen: true,
    ariaExpanded: 'true',
    ariaLabel: 'Close menu',
    bodyClassName: 'menu-open'
  });
});

test('matchesSectionLink compares anchors with section ids', () => {
  assert.equal(matchesSectionLink('#overview', 'overview'), true);
  assert.equal(matchesSectionLink('#contacts', 'overview'), false);
  assert.equal(matchesSectionLink(null, 'overview'), false);
});

test('getSectionObserverOptions returns stable observer settings', () => {
  assert.deepEqual(getSectionObserverOptions(), {
    threshold: 0.45,
    rootMargin: '-10% 0px -35% 0px'
  });
});
