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
})();
