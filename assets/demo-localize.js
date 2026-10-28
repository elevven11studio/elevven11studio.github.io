/**
 * Elevven11 Studio - demo page localization.
 * These fictional demo businesses default to Nigerian names and locations.
 * For visitors detected outside Nigeria, elements tagged with data-intl get
 * swapped to an international alternate so the demo feels locally relevant -
 * the same idea as the site-wide Naira/USD price swap, just for prose instead
 * of numbers.
 *
 * Demo pages are standalone (no main.js), so this does its own lightweight
 * country lookup, sharing the same sessionStorage cache key so a visitor who
 * already triggered a lookup elsewhere on the site doesn't pay for a second
 * one.
 */
(async function () {
  // Testing aid, same as main.js: ?usd turns the international version on in
  // every tab until ?ngn turns it off.
  const q = new URLSearchParams(location.search);
  const c = (q.get('currency') || (q.has('usd') ? 'usd' : q.has('ngn') ? 'ngn' : '')).toLowerCase();
  try {
    if (c === 'usd') localStorage.setItem('e11_currency', 'usd');
    else if (c === 'ngn') localStorage.removeItem('e11_currency');
    if (localStorage.getItem('e11_currency') === 'usd') sessionStorage.setItem('e11_country', 'US');
    else if (c === 'ngn') sessionStorage.setItem('e11_country', 'NG');
  } catch (e) { /* storage blocked: the override just doesn't apply */ }

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
      // Offline or blocked - fall back to the Nigerian version already in the HTML.
    }
    return null;
  }

  const country = await detectCountryCode();
  if (!country || country === 'NG') return;

  document.querySelectorAll('[data-intl]').forEach((el) => {
    el.textContent = el.getAttribute('data-intl');
  });
  // Page scripts that format their own text (the store cart) switch on this.
  // The flag covers scripts that load after the event has fired.
  window.E11Intl = true;
  document.dispatchEvent(new CustomEvent('e11:intl'));
})();
