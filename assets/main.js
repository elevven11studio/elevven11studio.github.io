/**
 * Elevven11 Studio - shared site logic.
 * Vanilla JS, no dependencies: nav toggle, referral code capture,
 * and a WhatsApp-based Get Started form (no backend yet).
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReferralCapture();
  initGetStartedForm();
  initCurrencyByCountry();
  initLeadChannelTracking();
  initSliders();
  initContactForm();
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
