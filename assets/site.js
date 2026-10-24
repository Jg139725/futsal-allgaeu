(() => {
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('#navigation');
  function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (!e.target.closest('header')) closeMenu();
    document.querySelectorAll('.more-nav[open]').forEach(d => { if (!d.contains(e.target)) d.open = false; });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('open')) { closeMenu(); menu.focus(); }
      document.querySelectorAll('.more-nav').forEach(d => d.open = false);
    }
  });
  const page = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === page) a.setAttribute('aria-current','page'); });
  if (page === 'impressionen.html') {
    const figures = [...document.querySelectorAll('.import-flow figure')];
    const dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label','Bildergalerie');
    dialog.innerHTML = '<button class="lightbox-close" aria-label="Galerie schließen">Schließen ×</button><img alt=""><div class="lightbox-bar"><button class="prev" aria-label="Vorheriges Bild">← Zurück</button><span aria-live="polite"></span><button class="next" aria-label="Nächstes Bild">Weiter →</button></div>';
    document.body.append(dialog);
    let selected = 0;
    function show(i) {
      selected = (i + figures.length) % figures.length;
      const original = figures[selected].querySelector('img');
      dialog.querySelector('img').src = original.src;
      dialog.querySelector('img').alt = original.alt;
      dialog.querySelector('span').textContent = `${selected + 1} / ${figures.length}`;
    }
    figures.forEach((figure, i) => {
      const img = figure.querySelector('img');
      const b = document.createElement('button'); b.className = 'gallery-open';
      b.setAttribute('aria-label', `Bild ${i + 1} vergrößern`);
      img.replaceWith(b); b.append(img);
      b.addEventListener('click', () => { show(i); dialog.showModal(); });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.prev').addEventListener('click', () => show(selected - 1));
    dialog.querySelector('.next').addEventListener('click', () => show(selected + 1));
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') show(selected + 1);
      if (e.key === 'ArrowLeft') show(selected - 1);
    });
  }
  const filters = document.querySelectorAll('[data-news-filter]');
  filters.forEach(b => b.addEventListener('click', () => {
    filters.forEach(x => x.setAttribute('aria-pressed',String(x === b)));
    document.querySelectorAll('[data-news-category]').forEach(card => {
      card.hidden = b.dataset.newsFilter !== 'all' && card.dataset.newsCategory !== b.dataset.newsFilter;
    });
  }));
})();
