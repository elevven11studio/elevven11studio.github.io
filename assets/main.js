/**
 * Elevven11 Studio - shared site logic.
 * Vanilla JS, no dependencies: nav toggle, referral code capture,
 * and a WhatsApp-based Get Started form (no backend yet).
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavbar();
  initReferralCapture();
  initFormPrefill();
  initGetStartedForm();
  initCurrencyByCountry();
  initContactFab();
  initLeadChannelTracking();
  initSliders();
  initContactForm();
  initFaqAccordions();
  initCopyButtons();
});

const WHATSAPP_NUMBER = '2349120925909';

/**
 * Country-based pricing: Naira for Nigeria, USD for everywhere else.
 * There's no backend, so this is a client-side best guess using a free
 * IP-geolocation lookup, cached for the browser session. If the lookup
 * fails (offline, blocked, rate-limited) we simply leave the Naira prices
 * already in the HTML as the fallback - that's the studio's home currency.
 *
 * Every price in the markup is written in Naira by default and tagged
 * with data-ngn="<amount>" (optionally data-suffix="+" for "starting at"
 * prices). This only ever rewrites those tagged elements/options.
 */
const NGN_PER_USD = 1550; // approximate; update this occasionally to track the real rate

function formatNaira(amount) {
  return '₦' + amount.toLocaleString('en-NG');
}

function formatUsd(amountNgn) {
  const usd = amountNgn / NGN_PER_USD;
  const rounded = usd < 20 ? Math.round(usd) : Math.round(usd / 5) * 5;
  return '$' + rounded.toLocaleString('en-US');
}

async function detectCountryCode() {
  const cached = sessionStorage.getItem('e11_country');
  if (cached) return cached;

  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data && data.success !== false && data.country_code) {
      sessionStorage.setItem('e11_country', data.country_code);
      return data.country_code;
    }
  } catch (e) {
    // Offline or blocked - fall back to the Naira prices already in the HTML.
  }
  return null;
}

async function initCurrencyByCountry() {
  const priceEls = document.querySelectorAll('[data-ngn]');
  if (!priceEls.length) return;

  const country = await detectCountryCode();
  if (!country || country === 'NG') return; // Naira markup is already correct

  priceEls.forEach((el) => {
    const amount = parseInt(el.getAttribute('data-ngn'), 10);
    if (!amount) return;
    const suffix = el.getAttribute('data-suffix') || '';
    const usdText = formatUsd(amount) + suffix;

    if (el.tagName === 'OPTION') {
      const label = el.getAttribute('data-label') || el.value;
      el.textContent = `${label} (${usdText})`;
    } else {
      el.textContent = usdText;
    }
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
 * Sends a GA4 event whenever someone picks a contact route (WhatsApp vs the
 * Google Form), so the split between channels is visible in analytics rather
 * than guessed at. Any element tagged data-lead-channel="<name>" is tracked.
 */
function initLeadChannelTracking() {
  const targets = document.querySelectorAll('[data-lead-channel]');
  if (!targets.length) return;

  targets.forEach((el) => {
    el.addEventListener('click', () => {
      if (typeof gtag !== 'function') return;
      gtag('event', 'lead_channel_click', {
        lead_channel: el.getAttribute('data-lead-channel'),
        page_path: window.location.pathname,
      });
    });
  });
}

/**
 * Reads ?ref=CODE from the URL (per the agent referral link scheme) and
 * surfaces it on any page with a `.referral-banner` and hidden `#referral-code`
 * input, so it can be attributed on the Get Started form.
 */
function initReferralCapture() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (!ref) return;

  sessionStorage.setItem('e11_referral_code', ref);

  const banner = document.querySelector('.referral-banner');
  if (banner) {
    banner.textContent = `Referred by agent code: ${ref}`;
    banner.style.display = 'block';
  }

  const hiddenInput = document.getElementById('referral-code');
  if (hiddenInput) hiddenInput.value = ref;
}

/**
 * Get Started form: no backend yet, so submissions are handed off to
 * WhatsApp as a pre-filled message the customer sends directly.
 */
function initGetStartedForm() {
  const form = document.querySelector('.get-started-form');
  if (!form) return;

  const storedRef = sessionStorage.getItem('e11_referral_code');
  const hiddenInput = document.getElementById('referral-code');
  if (storedRef && hiddenInput && !hiddenInput.value) {
    hiddenInput.value = storedRef;
    const banner = document.querySelector('.referral-banner');
    if (banner) {
      banner.textContent = `Referred by agent code: ${storedRef}`;
      banner.style.display = 'block';
    }
  }

  const packageSelect = document.getElementById('gs-package');

  const get = (name) => {
    const field = form.querySelector(`[name="${name}"]`);
    return field ? field.value.trim() : '';
  };

  /** Builds the message body, or returns null if required fields are empty. */
  function compose() {
    const required = ['name', 'phone', 'package'];
    for (const field of required) {
      if (!get(field)) {
        alert('Please fill in your name, phone number, and chosen package.');
        return null;
      }
    }

    // Use the select's visible option text rather than its raw value, so the
    // price shown matches whatever currency initCurrencyByCountry rewrote it
    // to (Naira for Nigeria, an approximate USD figure elsewhere).
    const packageText = packageSelect && packageSelect.selectedIndex >= 0
      ? packageSelect.options[packageSelect.selectedIndex].textContent.trim()
      : get('package');

    // Best-effort, auto-detected from the same IP lookup that drives currency
    // display - no manual country field/dropdown on the form.
    const country = sessionStorage.getItem('e11_country');

    const lines = [
      'Hi Elevven11 Studio, I would like to get a website built.',
      `Name: ${get('name')}`,
      get('business') ? `Business/Person name: ${get('business')}` : null,
      `Phone: ${get('phone')}`,
      get('email') ? `Email: ${get('email')}` : null,
      get('location') ? `Location: ${get('location')}` : null,
      `Package: ${packageText}`,
      get('exampleType') ? `Interested in example style: ${get('exampleType')}` : null,
      get('description') ? `About the business: ${get('description')}` : null,
      get('styleMood') ? `Style vibe: ${get('styleMood')}` : null,
      get('colors') ? `Preferred colors: ${get('colors')}` : null,
      get('colorsNotes') ? `More on colors/style: ${get('colorsNotes')}` : null,
      country ? `Detected country: ${country}` : null,
      get('referral') ? `Referral code: ${get('referral')}` : null,
    ].filter(Boolean);

    return lines.join('\n');
  }

  /** Hands the composed message to whichever channel was chosen. */
  function send(channel) {
    const body = compose();
    if (!body) return;

    if (channel === 'whatsapp') {
      window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body), '_blank');
    } else {
      // Anchor click rather than location.href: iOS Safari can block
      // programmatic mailto: navigation, and a popup leaves a blank tab.
      const a = document.createElement('a');
      a.href = 'mailto:elevven11studio@gmail.com'
        + '?subject=' + encodeURIComponent('Website request: ' + get('name'))
        + '&body=' + encodeURIComponent(body);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    const successMsg = document.querySelector('.form-success-msg');
    if (successMsg) {
      successMsg.textContent = channel === 'whatsapp'
        ? `Thanks, ${get('name')}! WhatsApp should have opened with your details filled in — just hit send there to reach us.`
        : `Thanks, ${get('name')}! Your email app should have opened with your details filled in — just hit send there to reach us.`;
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Submitting the form (including pressing Enter) keeps the original
  // WhatsApp behaviour; the second button routes the same message to email.
  form.addEventListener('submit', (e) => { e.preventDefault(); send('whatsapp'); });
  const emailBtn = form.querySelector('[data-gs-send="email"]');
  if (emailBtn) emailBtn.addEventListener('click', () => send('email'));
}
/**
 * Picture sliders.
 *
 * The markup is already a working slider on its own: a scroll-snap track that
 * swipes on touch and scrolls on desktop with no JavaScript at all. This adds
 * the arrows, the dot indicators, a live caption and keyboard control on top,
 * so nothing here is load-bearing - if it fails, the slider still works.
 *
 * Any element with [data-slider] is picked up.
 */
function initSliders() {
  const sliders = document.querySelectorAll('[data-slider]');
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const track = slider.querySelector('.slider-track');
    const slides = Array.from(slider.querySelectorAll('.slider-slide'));
    if (!track || slides.length < 2) return;

    const label = slider.getAttribute('data-slider') || 'Slides';
    slider.setAttribute('role', 'region');
    slider.setAttribute('aria-roledescription', 'carousel');
    slider.setAttribute('aria-label', label);

    const caption = slider.querySelector('.slider-caption');

    // The buttons must centre on the TRACK, not on .slider - the dots and
    // caption sit inside .slider too, which would drag the arrows below the
    // artwork. Wrapping the track gives them the right box to centre against,
    // and it stays correct on resize without any measuring.
    const viewport = document.createElement('div');
    viewport.className = 'slider-viewport';
    track.parentNode.insertBefore(viewport, track);
    viewport.appendChild(track);

    // A stroked SVG rather than a text arrow: text glyphs sit off-centre in a
    // circular button because of font metrics, and cannot be given round caps.
    const arrow = (dir) => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
      + '<path d="' + (dir === 'next' ? 'M9 4.5 16.5 12 9 19.5' : 'M15 4.5 7.5 12 15 19.5')
      + '" fill="none" stroke="currentColor" stroke-width="2.1" '
      + 'stroke-linecap="round" stroke-linejoin="round"/></svg>';

    const mkBtn = (dir, text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slider-btn ' + dir;
      b.innerHTML = arrow(dir);
      b.setAttribute('aria-label', text);
      viewport.appendChild(b);
      return b;
    };
    const prev = mkBtn('prev', 'Previous slide');
    const next = mkBtn('next', 'Next slide');

    const dots = document.createElement('div');
    dots.className = 'slider-dots';
    slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'slider-dot';
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1) + ' of ' + slides.length);
      d.addEventListener('click', () => go(i));
      dots.appendChild(d);
    });
    // Above the caption: the dots belong with the artwork they index, and the
    // caption is a description of the current slide rather than a control.
    if (caption) slider.insertBefore(dots, caption);
    else slider.appendChild(dots);

    let current = 0;
    let animating = null;
    let programmatic = false;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * The browser's own smooth scrolling scales its duration with distance, so
     * jumping from the first dot to the last crawled for almost a second. And
     * mandatory snapping fights a scripted scroll, yanking the position to the
     * nearest snap point mid-flight. So: animate it here at a fixed duration,
     * with snapping switched off for the duration of the animation only.
     */
    function animateTo(target) {
      if (animating) cancelAnimationFrame(animating);
      const start = track.scrollLeft;
      const delta = target - start;
      if (Math.abs(delta) < 1) return;

      if (reduced) { track.scrollLeft = target; return; }

      const dur = 420;
      const t0 = performance.now();
      const prevSnap = track.style.scrollSnapType;
      track.style.scrollSnapType = 'none';
      programmatic = true;

      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        track.scrollLeft = start + delta * ease(t);
        if (t < 1) {
          animating = requestAnimationFrame(step);
        } else {
          animating = null;
          track.style.scrollSnapType = prevSnap;
          programmatic = false;
        }
      };
      animating = requestAnimationFrame(step);
    }

    function go(i) {
      current = Math.max(0, Math.min(slides.length - 1, i));
      // Offsets, not scrollIntoView: the latter would scroll the page too.
      animateTo(slides[current].offsetLeft - track.offsetLeft);
      sync();
    }

    function sync() {
      Array.from(dots.children).forEach((d, i) =>
        d.setAttribute('aria-current', i === current ? 'true' : 'false'));
      prev.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      if (caption) {
        const img = slides[current].querySelector('img');
        caption.textContent = img ? img.getAttribute('alt') : '';
      }
      slides.forEach((s, i) => s.setAttribute('aria-hidden', i === current ? 'false' : 'true'));
    }

    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));

    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    });

    // Someone swiping or scrolling the track directly is the source of truth,
    // so mirror that back into the dots rather than fighting it.
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      if (programmatic) return; // our own animation already set the target
      raf = requestAnimationFrame(() => {
        const mid = track.scrollLeft + track.clientWidth / 2;
        let best = 0, bestDist = Infinity;
        slides.forEach((s, i) => {
          const c = s.offsetLeft - track.offsetLeft + s.clientWidth / 2;
          const d = Math.abs(c - mid);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        if (best !== current) { current = best; sync(); }
      });
    }, { passive: true });

    sync();
  });
}

/**
 * Contact form: same no-backend approach as the Get Started form, but the
 * visitor picks the channel. Both buttons build the identical message; one
 * hands it to WhatsApp, the other to the visitor's mail app.
 *
 * Neither actually sends. mailto: and wa.me both open a composer with the
 * text pre-filled, and the person presses send themselves - which is worth
 * being explicit about on the page, so nobody assumes a message went out.
 */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const EMAIL = 'elevven11studio@gmail.com';

  const get = (name) => {
    const field = form.querySelector('[name="' + name + '"]');
    return field ? field.value.trim() : '';
  };

  function compose() {
    if (!get('name') || !get('message')) {
      alert('Please fill in your name and a short message.');
      return null;
    }
    const lines = [
      'Hi Elevven11 Studio,',
      '',
      get('message'),
      '',
      'Name: ' + get('name'),
      get('email') ? 'Email: ' + get('email') : null,
      get('phone') ? 'Phone/WhatsApp: ' + get('phone') : null,
      'About: ' + get('topic'),
    ].filter((l) => l !== null);
    return lines.join('\n');
  }

  function done(channel) {
    const msg = form.parentElement.querySelector('.form-success-msg');
    if (!msg) return;
    msg.textContent = channel === 'whatsapp'
      ? 'Thanks, ' + get('name') + '! WhatsApp should have opened with your message ready \u2014 press send there to reach us.'
      : 'Thanks, ' + get('name') + '! Your email app should have opened with the message ready \u2014 press send there to reach us.';
    msg.style.display = 'block';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  form.querySelectorAll('[data-send]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const body = compose();
      if (!body) return;
      const channel = btn.getAttribute('data-send');

      if (channel === 'whatsapp') {
        window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(body), '_blank');
      } else {
        const subject = 'Website enquiry: ' + get('topic');
        // A synthesised anchor click rather than window.location.href: iOS
        // Safari sometimes blocks programmatic mailto: navigation, and a
        // popup would leave a blank tab behind on desktop.
        const a = document.createElement('a');
        a.href = 'mailto:' + EMAIL
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(body);
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      done(channel);
    });
  });
}

/**
 * Carries an agent's referral code into the Google Form.
 *
 * The WhatsApp route already appends the code to the message, but the Google
 * Form is a separate document and had no way of knowing about it - a customer
 * who arrived on ?ref=CODE and chose the form would have been credited to
 * nobody. Google Forms accepts prefilled answers as query parameters, so the
 * code travels with the link.
 *
 * Entry IDs live on the markup as data attributes, not here, so the form can be
 * re-pointed without touching this file.
 */
function initFormPrefill() {
  const links = document.querySelectorAll('[data-form-prefill]');
  if (!links.length) return;

  const params = new URLSearchParams(window.location.search);
  const code = params.get('ref') || sessionStorage.getItem('e11_referral_code');
  if (!code) return; // no code, leave the plain form link alone

  links.forEach((a) => {
    const base = a.getAttribute('data-form-base');
    const refEntry = a.getAttribute('data-form-ref-entry');
    const referredEntry = a.getAttribute('data-form-referred-entry');
    if (!base || !refEntry) return;

    const url = new URL(base);
    if (referredEntry) url.searchParams.set(referredEntry, 'Yes');
    url.searchParams.set(refEntry, code);
    a.href = url.toString();
  });

  // Tell the customer their code is being carried, so a blank-looking form
  // field later does not read as the referral having been lost.
  const note = document.querySelector('.form-prefill-note');
  if (note) {
    note.textContent = 'Referral code ' + code + ' will be filled in for you.';
    note.style.display = 'block';
  }
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
