/**
 * Elevven11 Studio - screenshot viewer for the app pages (.cb-shots).
 * Click, Enter or Space opens a screenshot full size. Arrow keys and the
 * side buttons step through the set; Escape, the close button or a click
 * on the backdrop closes it.
 */

document.addEventListener('DOMContentLoaded', () => {
  const shots = [...document.querySelectorAll('.cb-shots img')];
  if (!shots.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'shot-viewer';
  dialog.setAttribute('aria-label', 'Screenshot');
  dialog.innerHTML =
    '<button type="button" class="shot-btn shot-close" aria-label="Close">&times;</button>' +
    '<button type="button" class="shot-btn shot-prev" aria-label="Previous screenshot">&#8249;</button>' +
    '<figure><img alt="" /><figcaption></figcaption></figure>' +
    '<button type="button" class="shot-btn shot-next" aria-label="Next screenshot">&#8250;</button>';
  document.body.appendChild(dialog);

  const big = dialog.querySelector('img');
  const caption = dialog.querySelector('figcaption');
  let index = 0;

  const show = (i) => {
    index = (i + shots.length) % shots.length;
    const s = shots[index];
    big.src = s.currentSrc || s.src;
    big.alt = s.alt;
    caption.textContent = s.alt + ' (' + (index + 1) + ' of ' + shots.length + ')';
  };

  shots.forEach((img, i) => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge: ' + img.alt);
    img.addEventListener('click', () => { show(i); dialog.showModal(); });
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(i); dialog.showModal(); }
    });
  });

  dialog.querySelector('.shot-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.shot-prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.shot-next').addEventListener('click', () => show(index + 1));
  // The dialog box fills the screen, so a click that lands on it directly
  // (not on the image or a button) is a click on the backdrop.
  dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target.tagName === 'FIGURE') dialog.close(); });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  // Return focus to the thumbnail that is now showing, so keyboard users
  // land where they left off.
  dialog.addEventListener('close', () => shots[index].focus());
});
