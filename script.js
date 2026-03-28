const burger = document.getElementById('burger');
const menu = document.getElementById('site-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sectionTargets = document.querySelectorAll('main section[id]');
const isUkrainian = document.documentElement.lang === 'uk';
const openLabel = isUkrainian ? 'Відкрити меню' : 'Open menu';
const closeLabel = isUkrainian ? 'Закрити меню' : 'Close menu';

if (burger && menu) {
  burger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    document.body.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    burger.setAttribute('aria-label', isOpen ? closeLabel : openLabel);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', openLabel);
    });
  });
}

if (navLinks.length && sectionTargets.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, {
    threshold: 0.45,
    rootMargin: '-10% 0px -35% 0px'
  });

  sectionTargets.forEach((section) => observer.observe(section));
}
