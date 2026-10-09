/**
 * Elevven11 Studio - site shell: theme toggle, nav, cookie consent, the
 * floating contact button, FAQ accordions and copy buttons. Every page loads
 * this one. Pages with forms, sliders or other page logic also load main.js
 * after it, and rely on the helpers declared here (cookies, WhatsApp number).
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbar();
  initCookieConsent();
  initContactFab();
  initFaqAccordions();
  initCopyButtons();
});

const WHATSAPP_NUMBER = '2349120925909';

// Opens a new conversation with the page directly in Messenger.
const MESSENGER_LINK = 'https://m.me/Elevven11Studio';

/**
 * Cookies, gated on consent.
 *
 * Nothing on this site needs a cookie to function - the referral code and
 * "Get Started" form progress are already handled per-tab via sessionStorage
 * (see initReferralCapture / initGetStartedForm below), so nothing is lost
 * if a visitor never sees this banner or declines it. Accepting only adds
 * two longer-lived, first-party cookies on top of that: the referral code
 * (so it survives a return visit days later, not just the current tab) and
 * a snapshot of the Get Started form (so a half-filled form survives a
 * closed tab). The consent choice itself is stored in a cookie too, since
 * that's what has to persist to avoid re-asking on every page.
 *
 * Google Analytics runs under Consent Mode v2. Each page's inline gtag
 * snippet sets every consent signal to 'denied' unless the consent cookie
 * already says 'accepted', and the accept handler below flips them to
 * 'granted'. Until then Google may receive cookieless pings but sets no
 * Analytics or advertising cookies.
 */
const CONSENT_COOKIE = 'e11_consent';
const REFERRAL_COOKIE = 'e11_ref';
const FORM_DATA_COOKIE = 'e11_form_data';
const COOKIE_DAYS = 90;

function setCookie(name, value, days) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${days * 86400}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
}

function hasCookieConsent() {
  return getCookie(CONSENT_COOKIE) === 'accepted';
}

function initCookieConsent() {
  if (getCookie(CONSENT_COOKIE)) return; // already accepted or declined
  if (document.querySelector('.cookie-banner')) return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Cookie notice');
  banner.innerHTML = `
    <p>We use a cookie to save your Get Started form and referral code, and Google Analytics
      to count visits. Accept turns both on. <a href="/privacy/">Privacy policy</a></p>
    <div class="cookie-banner-actions">
      <button type="button" class="btn btn-secondary" data-cookie-decline>Decline</button>
      <button type="button" class="btn btn-primary" data-cookie-accept>Accept</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => {
    setCookie(CONSENT_COOKIE, 'accepted', 365);
    banner.remove();
    if (typeof gtag === 'function') {
      gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    }

    // Promote whatever this tab already holds in sessionStorage into the
    // new cookies immediately, rather than waiting for the next edit/visit.
    const ref = sessionStorage.getItem('e11_referral_code');
    if (ref) setCookie(REFERRAL_COOKIE, ref, COOKIE_DAYS);
    const form = document.querySelector('.get-started-form');
    if (form) saveFormDataCookie(form);
  });

  banner.querySelector('[data-cookie-decline]').addEventListener('click', () => {
    setCookie(CONSENT_COOKIE, 'declined', 365);
    banner.remove();
  });
}

/**
 * Navbar & Responsive Menu Logic
 */
function initNavbar() {
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-item a');

  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');

      const spans = hamburger.querySelectorAll('span');
      if (hamburger.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  const currentSection = window.location.pathname
    .split('/')
    .filter(Boolean)[0] || '';

  navItems.forEach((item) => {
    const itemPath = item.getAttribute('href') || '';
    const itemSection = itemPath
      .split('/')
      .filter(Boolean)[0] || '';
    if (itemSection === currentSection) {
      item.parentElement.classList.add('active');
    } else {
      item.parentElement.classList.remove('active');
    }
  });
}

/**
 * Floating contact speed-dial, bottom-right, on every page. Injected here
 * rather than pasted into ~50 static HTML files, so one change here reaches
 * every page that loads main.js (the client demo pages under examples/ don't
 * load it - they're standalone mockups - so it correctly only shows on the
 * studio's own site). A small "+" toggle expands into two pills - WhatsApp
 * and Get Your Website - rather than linking straight to WhatsApp, since a
 * visitor might prefer either route.
 */
function initContactFab() {
  if (document.querySelector('.fab')) return;

  const whatsappIcon = '<svg viewBox="0 0 32 32" aria-hidden="true">'
    + '<path fill="currentColor" d="M16.001 3C9.107 3 3.5 8.607 3.5 15.5c0 2.42.697 4.68 1.902 6.59L3 29l7.09-2.36A12.44 12.44 0 0 0 16 28c6.894 0 12.5-5.607 12.5-12.5S22.895 3 16.001 3Zm0 22.7c-2.02 0-3.92-.55-5.55-1.51l-.397-.235-4.207 1.4 1.383-4.1-.258-.42a10.19 10.19 0 0 1-1.57-5.335C5.402 9.86 10.163 5.1 16 5.1c5.837 0 10.598 4.76 10.598 10.6 0 5.84-4.761 10.6-10.598 10.6Zm5.86-7.94c-.32-.16-1.9-.938-2.194-1.045-.294-.107-.508-.16-.722.16-.214.32-.83 1.045-1.018 1.26-.187.213-.374.24-.694.08-.32-.16-1.352-.498-2.575-1.588-.952-.849-1.594-1.897-1.782-2.217-.187-.32-.02-.493.14-.653.144-.143.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.722-1.74-.99-2.383-.26-.626-.526-.541-.722-.55l-.615-.011c-.213 0-.56.08-.854.4-.294.32-1.121 1.096-1.121 2.674s1.148 3.104 1.308 3.318c.16.213 2.26 3.45 5.474 4.838.765.33 1.362.527 1.828.674.768.244 1.467.21 2.02.128.616-.092 1.9-.777 2.168-1.527.267-.75.267-1.393.187-1.527-.08-.133-.294-.213-.614-.373Z"/>'
    + '</svg>';
  const messengerIcon = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path fill="currentColor" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8v-6.93h-2.4v-2.87h2.4v-2.19c0-2.39 1.44-3.72 3.62-3.72 1.05 0 2.15.19 2.15.19v2.36h-1.21c-1.19 0-1.56.74-1.56 1.5v1.86h2.66l-.43 2.87h-2.23v6.93c4.56-.93 8-4.96 8-9.8z"/>'
    + '</svg>';
  const contactIcon = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5l8-5v2z"/>'
    + '</svg>';
  const plusIcon = '<svg viewBox="0 0 24 24" aria-hidden="true">'
    + '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
    + '</svg>';
  const message = 'Hi Elevven11 Studio, I would like to get a website built.';

  const fab = document.createElement('div');
  fab.className = 'fab';
  fab.innerHTML = `
    <div class="fab-menu">
      <a class="fab-action fab-action-whatsapp" href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}"
        target="_blank" rel="noopener" data-lead-channel="whatsapp-fab" tabindex="-1">${whatsappIcon}<span>WhatsApp</span></a>
      <a class="fab-action fab-action-messenger" href="${MESSENGER_LINK}"
        target="_blank" rel="noopener" data-lead-channel="messenger-fab" tabindex="-1">${messengerIcon}<span>Messenger</span></a>
      <a class="fab-action fab-action-contact" href="/contact/" data-lead-channel="contact-fab" tabindex="-1">${contactIcon}<span>Contact</span></a>
      <a class="fab-action fab-action-website" href="/get-started/" data-lead-channel="website-fab" tabindex="-1">Get Your Website</a>
    </div>
    <button type="button" class="fab-toggle" aria-label="Open contact options" aria-expanded="false">${plusIcon}</button>
  `;
  document.body.appendChild(fab);

  const toggle = fab.querySelector('.fab-toggle');
  const actions = fab.querySelectorAll('.fab-action');

  function setOpen(open) {
    fab.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    actions.forEach((a) => a.tabIndex = open ? 0 : -1);
  }

  toggle.addEventListener('click', () => setOpen(!fab.classList.contains('open')));
  actions.forEach((a) => a.addEventListener('click', () => setOpen(false)));

  document.addEventListener('click', (e) => {
    if (fab.classList.contains('open') && !fab.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fab.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
}

/**
 * FAQ accordion: animates the open/close of every <details class="faq-item">
 * instead of letting it snap instantly, which is all the browser does on its
 * own. The height is measured and driven with the Web Animations API rather
 * than a CSS max-height transition, since the answer text wraps to a
 * different number of lines per viewport width and per-item, so there's no
 * single max-height that's both tight and always tall enough.
 */
function initFaqAccordions() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  items.forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;

    let animation = null;
    let isClosing = false;
    let isExpanding = false;

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      if (reduced) { details.open = !details.open; return; }

      details.style.overflow = 'hidden';
      if (isClosing || !details.open) {
        openItem();
      } else if (isExpanding || details.open) {
        shrinkItem();
      }
    });

    function contentHeight() {
      let h = 0;
      Array.from(details.children).forEach((child) => {
        if (child !== summary) h += child.offsetHeight;
      });
      return h;
    }

    function openItem() {
      details.style.height = `${details.offsetHeight}px`;
      details.open = true;
      requestAnimationFrame(() => expandItem());
    }

    function expandItem() {
      isExpanding = true;
      const startHeight = `${details.offsetHeight}px`;
      const endHeight = `${summary.offsetHeight + contentHeight()}px`;
      if (animation) animation.cancel();
      animation = details.animate(
        { height: [startHeight, endHeight] },
        { duration: 250, easing: 'ease-out' }
      );
      animation.onfinish = () => onAnimationFinish(true);
      animation.oncancel = () => { isExpanding = false; };
    }

    function shrinkItem() {
      isClosing = true;
      const startHeight = `${details.offsetHeight}px`;
      const endHeight = `${summary.offsetHeight}px`;
      if (animation) animation.cancel();
      animation = details.animate(
        { height: [startHeight, endHeight] },
        { duration: 200, easing: 'ease-out' }
      );
      animation.onfinish = () => onAnimationFinish(false);
      animation.oncancel = () => { isClosing = false; };
    }

    function onAnimationFinish(open) {
      details.open = open;
      animation = null;
      isClosing = false;
      isExpanding = false;
      details.style.height = '';
      details.style.overflow = '';
    }
  });
}

/**
 * Copy-to-clipboard buttons: [data-copy="<selector>"] copies the text
 * content of the matched element and flips the button to a checkmark
 * briefly, so the click has visible confirmation.
 */
function initCopyButtons() {
  const buttons = document.querySelectorAll('[data-copy]');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const target = document.querySelector(btn.getAttribute('data-copy'));
      const text = target ? target.textContent.trim() : '';
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        // Clipboard API can be unavailable (older browsers, insecure context) -
        // fall back to the old select-and-copy trick via a hidden textarea.
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e2) { /* nothing more to try */ }
        ta.remove();
      }

      btn.classList.add('copied');
      btn.setAttribute('aria-label', 'Copied!');
      clearTimeout(btn._copyResetTimer);
      btn._copyResetTimer = setTimeout(() => {
        btn.classList.remove('copied');
        btn.setAttribute('aria-label', btn.getAttribute('data-copy-label') || 'Copy');
      }, 1800);
    });
  });
}

/**
 * Dark / light theme.
 *
 * Dark is the default and is what :root defines, so "no attribute" means dark.
 * Only an explicit light choice is stored, and the inline guard in <head>
 * re-applies it before first paint.
 *
 * The OS preference is deliberately NOT followed: the brand is dark, and a
 * light-mode visitor arriving to a light site would see a different product to
 * the one in every promo image. They can still switch.
 */
function initThemeToggle() {
  const KEY = 'e11-theme';
  const root = document.documentElement;

  const apply = (theme) => {
    if (theme === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');

    // Keep the browser chrome colour in step with the page.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f4f1ea' : '#0b0a10');

    document.querySelectorAll('.theme-toggle').forEach((b) => {
      b.setAttribute('aria-label',
        theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
    });
  };

  let current = 'dark';
  try { if (localStorage.getItem(KEY) === 'light') current = 'light'; } catch (e) { /* private mode */ }
  apply(current);

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      current = current === 'light' ? 'dark' : 'light';
      apply(current);
      try { localStorage.setItem(KEY, current); } catch (e) { /* nothing to do */ }
    });
  });
}
