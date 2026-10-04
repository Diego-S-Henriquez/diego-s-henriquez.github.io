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

  // Copy email button.
  var btn = document.getElementById('copy-email');
  var addr = document.getElementById('email-addr');
  if (btn && addr) {
    btn.addEventListener('click', function () {
      var text = addr.textContent.trim();
      var selectFallback = function () {
        var range = document.createRange();
        range.selectNodeContents(addr);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        btn.textContent = 'Selected';
      };
      try {
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copied';
          setTimeout(function () { btn.textContent = 'Copy'; }, 1800);
        }, selectFallback);
      } catch (e) { selectFallback(); }
    });
  }
})();
