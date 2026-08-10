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

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const get = (name) => {
      const field = form.querySelector(`[name="${name}"]`);
      return field ? field.value.trim() : '';
    };

    const required = ['name', 'phone', 'package'];
    for (const field of required) {
      if (!get(field)) {
        alert('Please fill in your name, phone number, and chosen package.');
        return;
      }
    }

    const lines = [
      'Hi Elevven11 Studio, I would like to get a website built.',
      `Name: ${get('name')}`,
      get('business') ? `Business/Person name: ${get('business')}` : null,
      `Phone: ${get('phone')}`,
      get('email') ? `Email: ${get('email')}` : null,
      get('location') ? `Location: ${get('location')}` : null,
      `Package: ${get('package')}`,
      get('description') ? `About the business: ${get('description')}` : null,
      get('colors') ? `Preferred colors/style: ${get('colors')}` : null,
      get('referral') ? `Referral code: ${get('referral')}` : null,
    ].filter(Boolean);

    const message = encodeURIComponent(lines.join('\n'));
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, '_blank');

    const successMsg = document.querySelector('.form-success-msg');
    if (successMsg) {
      successMsg.textContent = `Thanks, ${get('name')}! WhatsApp should have opened in a new tab with your details filled in — just hit send there to reach us.`;
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}
