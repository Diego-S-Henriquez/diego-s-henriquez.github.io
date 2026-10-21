(function () {
  // Header name: on the home page, stay hidden while the big name is on screen.
  var brand = document.getElementById('brand');
  var nameH = document.getElementById('name-h');
  if (brand && nameH && 'IntersectionObserver' in window) {
    var setTucked = function (tucked) {
      brand.classList.toggle('is-tucked', tucked);
      brand.setAttribute('aria-hidden', tucked ? 'true' : 'false');
      brand.tabIndex = tucked ? -1 : 0;
    };
    setTucked(true);
    new IntersectionObserver(function (entries) {
      setTucked(entries[0].isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(nameH);
  }

  // Copy email button (keeps its icon; only the label changes).
  var btn = document.getElementById('copy-email');
  var addr = document.getElementById('email-addr');
  if (btn && addr) {
    var label = btn.querySelector('.copy-label') || btn;
    btn.addEventListener('click', function () {
      var text = addr.textContent.trim();
      var done = function (msg) {
        label.textContent = msg; btn.classList.add('is-done');
        setTimeout(function () { label.textContent = 'Copy'; btn.classList.remove('is-done'); }, 1800);
      };
      var selectFallback = function () {
        var range = document.createRange();
        range.selectNodeContents(addr);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        done('Selected');
      };
      try {
        navigator.clipboard.writeText(text).then(function () { done('Copied'); }, selectFallback);
      } catch (e) { selectFallback(); }
    });
  }
})();

// Click a case-study image or clip to view it large, without leaving the page.
(function () {
  var shots = document.querySelectorAll('.figure .shot');
  if (!shots.length || typeof HTMLDialogElement === 'undefined') return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.setAttribute('aria-label', 'Enlarged image');
  dlg.innerHTML = '<button class="lb-close" type="button">Close ✕</button><div class="lb-body"></div><p class="lb-cap"></p>';
  document.body.appendChild(dlg);
  var body = dlg.querySelector('.lb-body'), cap = dlg.querySelector('.lb-cap');
  function close() { dlg.close(); }
  dlg.addEventListener('close', function () { body.innerHTML = ''; });
  dlg.querySelector('.lb-close').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target === body) close(); });
  shots.forEach(function (shot) {
    shot.addEventListener('click', function (e) {
      e.preventDefault();
      var img = shot.querySelector('img'), vid = shot.querySelector('video'), el;
      if (vid) {
        el = document.createElement('video');
        el.src = vid.currentSrc || vid.src; el.muted = true; el.loop = true; el.autoplay = true;
        el.playsInline = true; el.controls = true;
      } else if (img) {
        el = document.createElement('img');
        el.src = shot.getAttribute('href') || img.src; el.alt = img.alt;
      } else { return; }
      el.className = 'lb-media';
      body.innerHTML = ''; body.appendChild(el);
      var fc = shot.parentNode.querySelector('figcaption');
      cap.textContent = fc ? fc.textContent.replace(/\s*Click to enlarge\.?$/, '') : '';
      dlg.showModal();
    });
  });
})();

// Home page: dashboard card plays its clip on hover.
(function () {
  document.querySelectorAll('.thumb.media').forEach(function (thumb) {
    var vid = thumb.querySelector('video'), card = thumb.closest('.card') || thumb;
    if (!vid || !window.matchMedia('(hover: hover)').matches) return;
    card.addEventListener('mouseenter', function () {
      var p = vid.play(); thumb.classList.add('is-playing');
      if (p && p.catch) p.catch(function () { thumb.classList.remove('is-playing'); });
    });
    card.addEventListener('mouseleave', function () {
      vid.pause(); vid.currentTime = 0; thumb.classList.remove('is-playing');
    });
  });
})();

// Contact pop-up: the header's Contact button opens it; ✕, Esc or a click outside closes it.
(function () {
  var dlg = document.getElementById('contact');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  function open(e) { if (e) e.preventDefault(); if (!dlg.open) dlg.showModal(); }
  document.querySelectorAll('a[href="#contact"]').forEach(function (a) { a.addEventListener('click', open); });
  dlg.querySelector('.contact-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) {
    var r = dlg.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) dlg.close();
  });
  if (location.hash === '#contact') open();
})();

// Wide Excel sheets: the table starts scrolled all the way to the right, and the first time it comes
// into view it glides left to the start once and stops, so readers can tell it scrolls.
// Any touch, click, wheel or key by the reader stops it where it is.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  document.querySelectorAll('.xl-scroll .xl-box').forEach(function (box) {
    var max = box.scrollWidth - box.clientWidth;
    if (max < 20 || !('IntersectionObserver' in window)) return;
    var stopped = false;
    // Reduced-motion setting: start only a little way in, so the glide is a short nudge.
    var start = reduce ? Math.min(max, 160) : max;
    box.scrollLeft = start;
    ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      box.addEventListener(ev, function () { stopped = true; }, { passive: true });
    });
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      setTimeout(function () {
        if (stopped) return;
        var from = box.scrollLeft, ms = reduce ? 600 : Math.min(2800, 1000 + from * 2.4), t0 = null;
        function step(ts) {
          if (stopped) return;
          if (t0 === null) t0 = ts;
          var p = Math.min(1, (ts - t0) / ms);
          box.scrollLeft = from * (1 - ease(p));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }, 500);
    }, { threshold: 0.6 });
    io.observe(box);
  });
})();
