(() => {
  const video = document.querySelector('#club-video');
  const shell = document.querySelector('#video-shell');
  const slot = document.querySelector('#video-slot');
  const shade = document.querySelector('#intro-shade');
  const skip = document.querySelector('#skip');
  const sound = document.querySelector('#sound');
  const play = document.querySelector('#play');
  const replay = document.querySelector('#replay');
  const key = 'futsal-allgaeu-intro-seen';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'idle', frame = 0, timer = 0;
  let alreadySeen = document.documentElement.classList.contains('intro-seen');
  try { alreadySeen ||= sessionStorage.getItem(key) === '1'; } catch {}
  function remember() {
    document.documentElement.classList.add('intro-seen');
    try { sessionStorage.setItem(key, '1'); } catch {
      // Keep the visit marker on same-tab navigation when storage is restricted.
      if (!window.name.includes(key)) window.name += ' ' + key;
    }
  }
  alreadySeen ||= window.name.includes(key);
  function controls() {
    play.textContent = video.paused ? 'Video starten ▶' : 'Video pausieren Ⅱ';
    play.setAttribute('aria-label', video.paused ? 'Vereinsvideo abspielen' : 'Vereinsvideo pausieren');
    sound.textContent = video.muted ? 'Ton einschalten' : 'Ton ausschalten';
    sound.setAttribute('aria-pressed', String(!video.muted));
  }
  function finish() {
    clearTimeout(timer); cancelAnimationFrame(frame);
    state = 'docked';
    document.body.classList.remove('intro-playing');
    shell.className = 'is-docked'; shell.removeAttribute('style');
    slot.append(shell);
    shade.hidden = true;
    skip.hidden = true;
    video.loop = true;
    controls();
  }
  function dock(immediate = false) {
    if (state === 'docked' || state === 'docking') return;
    remember(); clearTimeout(timer);
    if (immediate || reduced.matches) { finish(); return; }
    state = 'docking';
    const origin = shell.getBoundingClientRect();
    const start = performance.now();
    function animate(now) {
      const p = Math.min(1, (now - start) / 1050);
      const t = 1 - Math.pow(1 - p, 3);
      const target = slot.getBoundingClientRect();
      Object.assign(shell.style, {
        left: origin.left + (target.left - origin.left) * t + 'px',
        top: origin.top + (target.top - origin.top) * t + 'px',
        width: origin.width + (target.width - origin.width) * t + 'px',
        height: origin.height + (target.height - origin.height) * t + 'px',
        borderRadius: 20 * t + 'px'
      });
      shade.style.opacity = String(1 - t);
      if (p < 1) frame = requestAnimationFrame(animate); else finish();
    }
    frame = requestAnimationFrame(animate);
  }
  function start() {
    clearTimeout(timer); cancelAnimationFrame(frame); remember();
    state = 'intro';
    document.body.append(shell);
    shell.className = 'is-intro';
    shell.removeAttribute('style');
    document.body.classList.add('intro-playing');
    shade.hidden = false; shade.style.opacity = '1';
    skip.hidden = false;
    video.loop = false; video.currentTime = 0;
    video.play().catch(() => dock(true));
    // Start shrinking while the clip is still playing, even without scrolling.
    timer = setTimeout(() => dock(), 4200);
  }
  addEventListener('wheel', e => { if (state === 'intro' && e.deltaY > 0) dock(); }, {passive:true});
  let touchY = null;
  addEventListener('touchstart', e => { touchY = e.touches[0]?.clientY ?? null; }, {passive:true});
  addEventListener('touchmove', e => {
    if (state === 'intro' && touchY !== null && touchY - (e.touches[0]?.clientY ?? touchY) > 8) dock();
  }, {passive:true});
  addEventListener('scroll', () => { if (state === 'intro') dock(); }, {passive:true});
  addEventListener('resize', () => { if (state === 'intro') dock(); });
  addEventListener('keydown', e => {
    if (state !== 'intro') return;
    if (e.key === 'Escape') { dock(); return; }
    if (['ArrowDown','PageDown','End',' '].includes(e.key) && !/^(INPUT|TEXTAREA|BUTTON|SELECT)$/.test(e.target.tagName)) dock();
  });
  addEventListener('pageshow', e => { if (e.persisted) finish(); });
  reduced.addEventListener('change', () => { if (reduced.matches) { dock(true); video.pause(); } });
  skip.addEventListener('click', () => dock());
  replay.addEventListener('click', () => {
    if (reduced.matches) { video.currentTime = 0; video.play().catch(controls); }
    else { scrollTo({top:0, behavior:'instant'}); start(); }
  });
  sound.addEventListener('click', () => { video.muted = !video.muted; controls(); });
  play.addEventListener('click', () => { if (video.paused) video.play().catch(controls); else video.pause(); });
  video.addEventListener('play', controls);
  video.addEventListener('pause', controls);
  video.addEventListener('volumechange', controls);
  video.addEventListener('ended', () => dock());
  video.addEventListener('error', () => {
    dock(true); play.hidden = true; sound.hidden = true;
    document.querySelector('.video-caption span').textContent = 'Vereinsvideo momentan nicht verfügbar';
  });
  // Pause invisible inline video to avoid wasting battery on mobile.
  const observer = new IntersectionObserver(entries => {
    if (state === 'docked' && !entries[0].isIntersecting) video.pause();
  }, {threshold:0.05});
  observer.observe(slot);
  if (alreadySeen || reduced.matches || location.hash) {
    remember(); finish();
    // Returning visitors get the inline player; reduced motion never autoplays.
    if (!reduced.matches) video.play().catch(controls);
  } else start();
  controls();
})();
