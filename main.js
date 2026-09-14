/**
 * NEXUS CONSULTING — MAIN LOGIC & INTERACTIONS (PROTOTIPO V3 HIGH-END)
 * Implementa la navegación SPA, Enfoque Nexus Split-Sticky, Contadores, Pestañas, Marquees y Exportación Dossier PDF
 */

(function () {
  "use strict";

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HAS_IO = 'IntersectionObserver' in window;

  /* ==========================================================================
     1. SEO & METADATA PER PAGE
     ========================================================================== */
  var SEO = {
    "home": {
      "t": "Consultoría de Transformación Empresarial en Paraguay | Nexus Consulting",
      "d": "Consultora boutique de transformación empresarial en Paraguay. Alineamos estrategia, cultura, procesos y tecnología para lograr cambios sostenibles."
    },
    "smart-process": {
      "t": "Digitalización y Automatización de Procesos | Nexus Consulting",
      "d": "Relevamos, rediseñamos, digitalizamos y automatizamos procesos. Implementamos herramientas de gestión como CRM, ERP, ATS e IA con adopción real en Paraguay."
    },
    "talent": {
      "t": "Executive Search y Headhunting en Paraguay | Nexus Consulting",
      "d": "Búsqueda ejecutiva confidencial y hunting de perfiles gerenciales, directivos y tecnológicos en Paraguay. Más de 100 búsquedas realizadas."
    },
    "business-consulting": {
      "t": "Consultoría Organizacional y Cultura en Paraguay | Nexus Consulting",
      "d": "Consultoría de transformación organizacional: estrategia, cultura, estructura, procesos y gestión del cambio para empresas en Paraguay."
    },
    "research": {
      "t": "Diagnóstico de Madurez Digital UPCOME | Nexus Consulting",
      "d": "Medimos la madurez digital de tu empresa en estrategia, cultura y tecnología con UPCOME. Estudios de mercado y análisis sectoriales en Paraguay."
    },
    "nosotros": {
      "t": "Quiénes Somos | Nexus Consulting Paraguay",
      "d": "Equipo de consultores en transformación empresarial en Asunción. Conocé al equipo directivo de Nexus Consulting y a nuestros aliados estratégicos."
    },
    "jobs": {
      "t": "Bolsa de Trabajo y Búsquedas Activas | Nexus Consulting",
      "d": "Conocé las búsquedas ejecutivas activas de Nexus Consulting en Paraguay o dejá tu CV para futuras oportunidades."
    },
    "contacto": {
      "t": "Contacto | Nexus Consulting Paraguay",
      "d": "Hablemos sobre tu proyecto de transformación. Oficina en Torre Corporativa Paseo, Asunción. Teléfono +595 21 600 000."
    }
  };

  function setMeta(sel, attr, val) {
    var el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  function applySeo(page) {
    var s = SEO[page];
    if (!s) return;
    document.title = s.t;
    setMeta('meta[name="description"]', 'content', s.d);
    setMeta('meta[property="og:title"]', 'content', s.t);
    setMeta('meta[property="og:description"]', 'content', s.d);
    setMeta('meta[name="twitter:title"]', 'content', s.t);
    setMeta('meta[name="twitter:description"]', 'content', s.d);
  }

  /* ==========================================================================
     2. SPA NAVIGATION & ROUTING CON HISTORIAL Y DEEP LINKING
     ========================================================================== */
  var VALID_PAGES = ['home', 'smart-process', 'talent', 'business-consulting', 'research', 'nosotros', 'jobs', 'contacto'];

  window.goTo = function (page, skipHistory) {
    if (!page || VALID_PAGES.indexOf(page) === -1) page = 'home';

    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }

    var target = document.getElementById('page-' + page);
    if (target) {
      target.classList.add('active');
    }

    var navLinks = document.querySelectorAll('nav.mainnav a, .mobile-menu a');
    for (var j = 0; j < navLinks.length; j++) {
      navLinks[j].classList.remove('active');
    }

    var activeLinks = document.querySelectorAll('[data-page="' + page + '"]');
    for (var k = 0; k < activeLinks.length; k++) {
      activeLinks[k].classList.add('active');
    }

    applySeo(page);
    if (window.updateReadContext) window.updateReadContext();

    window.closeMobile();

    // Actualizar historial del navegador para soporte nativo de "Atrás" y "Adelante"
    if (!skipHistory && window.history && window.history.pushState) {
      var hash = page === 'home' ? '' : '#' + page;
      if (window.location.hash !== hash) {
        window.history.pushState({ page: page }, '', hash || window.location.pathname + window.location.search);
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Manejar navegación con botones Atrás/Adelante del navegador
  window.addEventListener('popstate', function (e) {
    var page = 'home';
    if (e.state && e.state.page) {
      page = e.state.page;
    } else if (window.location.hash) {
      var hashPage = window.location.hash.replace(/^#/, '');
      if (VALID_PAGES.indexOf(hashPage) !== -1) page = hashPage;
    }
    window.goTo(page, true);
  });

  // Deep linking: abrir la página correcta al cargar si la URL trae #pagina
  window.addEventListener('DOMContentLoaded', function () {
    if (window.location.hash) {
      var initialPage = window.location.hash.replace(/^#/, '');
      if (VALID_PAGES.indexOf(initialPage) !== -1 && initialPage !== 'home') {
        window.goTo(initialPage, true);
      }
    }
  });

  var scrollPosBeforeMenu = 0;

  function handleBgTouch(e) {
    var menu = document.getElementById('mobileMenu');
    // Si el toque no proviene de dentro del menú móvil, bloquear por completo
    if (!menu || (!menu.contains(e.target) && menu !== e.target)) {
      e.preventDefault();
      return;
    }
  }

  function handleBgWheel(e) {
    var menu = document.getElementById('mobileMenu');
    if (!menu || (!menu.contains(e.target) && menu !== e.target)) {
      e.preventDefault();
    }
  }

  function lockBodyScroll() {
    scrollPosBeforeMenu = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    document.documentElement.classList.add('nav-open');
    document.body.classList.add('nav-open');
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollPosBeforeMenu + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    window.addEventListener('touchmove', handleBgTouch, { passive: false });
    window.addEventListener('wheel', handleBgWheel, { passive: false });
  }

  function unlockBodyScroll() {
    document.documentElement.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';

    window.removeEventListener('touchmove', handleBgTouch);
    window.removeEventListener('wheel', handleBgWheel);

    window.scrollTo({ top: scrollPosBeforeMenu, behavior: 'instant' });
  }

  window.closeMobile = function () {
    var mm = document.getElementById('mobileMenu');
    var hmb = document.querySelector('.hamburger');
    if (mm && mm.classList.contains('open')) {
      mm.classList.remove('open');
      mm.setAttribute('aria-hidden', 'true');
      if (hmb) {
        hmb.classList.remove('is-open');
        hmb.setAttribute('aria-expanded', 'false');
        hmb.setAttribute('aria-label', 'Abrir menú');
      }
      unlockBodyScroll();
    }
  };

  window.scrollToId = function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
    }
  };

  window.goHomeTo = function (id) {
    window.closeMobile();
    window.goTo('home');
    window.setTimeout(function () {
      window.scrollToId(id);
    }, 80);
  };

  window.toggleMobile = function () {
    var mm = document.getElementById('mobileMenu');
    var hmb = document.querySelector('.hamburger');
    if (mm) {
      var willOpen = !mm.classList.contains('open');
      mm.classList.toggle('open', willOpen);
      mm.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
      if (hmb) {
        hmb.classList.toggle('is-open', willOpen);
        hmb.setAttribute('aria-expanded', String(willOpen));
        hmb.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
      }
      if (willOpen) {
        lockBodyScroll();
      } else {
        unlockBodyScroll();
      }
    }
  };

  window.addEventListener('resize', function () {
    if (window.innerWidth > 768 && document.body.classList.contains('nav-open')) {
      window.closeMobile();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
      window.closeMobile();
    }
  });

  /* ==========================================================================
     3. READING PROGRESS BAR
     ========================================================================== */
  (function () {
    var bar = document.getElementById('readBar');
    if (!bar) return;

    window.addEventListener('scroll', function () {
      var scrollH = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollH > 0) {
        var pct = Math.min(Math.max(window.scrollY / scrollH, 0), 1);
        bar.style.transform = 'scaleX(' + pct + ')';
      }
    }, { passive: true });
  })();

  /* ==========================================================================
     4. STICKY HEADER OBSERVER
     ========================================================================== */
  (function () {
    var hdr = document.getElementById('hdr');
    var sen = document.getElementById('hdr-sentinel');
    if (!hdr || !sen || !HAS_IO) return;

    new IntersectionObserver(function (entries) {
      hdr.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sen);
  })();

  /* ==========================================================================
     5. SCROLL REVEAL ANIMATIONS
     ========================================================================== */
  (function () {
    var els = document.querySelectorAll('[data-reveal]');
    if (REDUCED || !HAS_IO) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
      return;
    }

    var groups = document.querySelectorAll('[data-reveal-group]');
    for (var g = 0; g < groups.length; g++) {
      var kids = groups[g].children, n = 0;
      for (var c = 0; c < kids.length; c++) {
        if (kids[c].hasAttribute('data-reveal')) {
          kids[c].style.setProperty('--i', n++);
        }
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    for (var j = 0; j < els.length; j++) {
      io.observe(els[j]);
    }
  })();

  /* ==========================================================================
     6. KPI CONTADORES ANIMADOS
     ========================================================================== */
  (function () {
    var nodes = document.querySelectorAll('[data-count]');
    var fmt = new Intl.NumberFormat('es-PY');

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (REDUCED) {
        el.textContent = fmt.format(target);
        return;
      }
      el.textContent = fmt.format(0);
      var t0 = performance.now(), dur = 1400;

      function tick(now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = fmt.format(target);
      }
      requestAnimationFrame(tick);
    }

    if (!HAS_IO) {
      for (var i = 0; i < nodes.length; i++) run(nodes[i]);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.35 });

    for (var j = 0; j < nodes.length; j++) {
      io.observe(nodes[j]);
    }
  })();

  /* ==========================================================================
     7. ENFOQUE GROW — SPLIT STICKY SCROLL & DIMENSION ILLUMINATION
     ========================================================================== */
  (function () {
    var steps = [].slice.call(document.querySelectorAll('[data-step]'));
    var dims = [].slice.call(document.querySelectorAll('.approach-dim'));
    if (!steps.length || !dims.length) return;

    function activate(step) {
      steps.forEach(function (s) {
        s.classList.toggle('is-active', s === step);
      });

      var list = (step.getAttribute('data-dims') || '').split(',');
      dims.forEach(function (d) {
        var dimId = d.getAttribute('data-dim');
        var isOn = list.indexOf(dimId) !== -1;
        d.classList.toggle('on', isOn);
      });
    }

    // Activar paso 1 inicialmente
    activate(steps[0]);

    if (REDUCED || !HAS_IO) {
      steps.forEach(function (s) { s.classList.add('is-active'); });
      dims.forEach(function (d) { d.classList.add('on'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          activate(e.target);
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    steps.forEach(function (s) {
      io.observe(s);
    });

    // Stepper táctil móvil para Enfoque Nexus
    var stepNavBtns = [].slice.call(document.querySelectorAll('.step-nav-btn'));
    var stepsContainer = document.querySelector('.split-steps');
    var currentStepIdx = 0;

    function setMobileStep(idx, userInitiated) {
      currentStepIdx = idx;
      stepNavBtns.forEach(function (btn, i) {
        btn.classList.toggle('is-active', i === idx);
      });
      steps.forEach(function (s, i) {
        s.classList.toggle('is-mobile-active', i === idx);
      });
      activate(steps[idx]);
      if (userInitiated && stepNavBtns[idx]) {
        var parent = stepNavBtns[idx].parentElement;
        if (parent) {
          parent.scrollTo({
            left: stepNavBtns[idx].offsetLeft - parent.clientWidth / 2 + stepNavBtns[idx].clientWidth / 2,
            behavior: 'smooth'
          });
        }
      }
    }

    if (stepNavBtns.length) {
      stepNavBtns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          setMobileStep(i, true);
        });
      });
      setMobileStep(0, false);

      // Gesto de deslizamiento (Swipe táctil)
      if (stepsContainer) {
        var touchStartX = 0;
        stepsContainer.addEventListener('touchstart', function (e) {
          if (e.touches && e.touches.length) {
            touchStartX = e.touches[0].clientX;
          }
        }, { passive: true });

        stepsContainer.addEventListener('touchend', function (e) {
          if (window.innerWidth > 980) return;
          if (!e.changedTouches || !e.changedTouches.length) return;
          var touchEndX = e.changedTouches[0].clientX;
          var diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 40) {
            if (diff > 0 && currentStepIdx < steps.length - 1) {
              setMobileStep(currentStepIdx + 1);
            } else if (diff < 0 && currentStepIdx > 0) {
              setMobileStep(currentStepIdx - 1);
            }
          }
        }, { passive: true });
      }
    }
  })();

  /* ==========================================================================
     7B. TOGGLE COMPARATIVO MÓVIL (POR QUÉ NEXUS)
     ========================================================================== */
  (function () {
    var vsBtns = [].slice.call(document.querySelectorAll('.vs-toggle-btn'));
    var vsGrid = document.querySelector('.vs-grid');
    if (!vsBtns.length || !vsGrid) return;

    vsBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-vs-target');
        vsBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        vsGrid.setAttribute('data-active-vs', target);
      });
    });
  })();

  /* ==========================================================================
     8. TABS (NUESTROS SERVICIOS)
     ========================================================================== */
  (function () {
    var lists = document.querySelectorAll('[role="tablist"]');
    for (var i = 0; i < lists.length; i++) {
      (function (list) {
        var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));

        function select(idx, focus, userInitiated) {
          tabs.forEach(function (t, j) {
            var on = (idx === j);
            t.setAttribute('aria-selected', String(on));
            t.tabIndex = on ? 0 : -1;
            var panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) panel.hidden = !on;
          });
          if (focus) tabs[idx].focus();
          if (userInitiated && tabs[idx] && window.innerWidth <= 980) {
            var parent = tabs[idx].parentElement;
            if (parent) {
              parent.scrollTo({
                left: tabs[idx].offsetLeft - parent.clientWidth / 2 + tabs[idx].clientWidth / 2,
                behavior: 'smooth'
              });
            }
          }
        }

        list.addEventListener('click', function (e) {
          var t = e.target.closest('[role="tab"]');
          if (t) select(tabs.indexOf(t), false, true);
        });

        list.addEventListener('keydown', function (e) {
          var curr = tabs.indexOf(document.activeElement);
          if (curr < 0) return;
          var map = { ArrowRight: curr + 1, ArrowLeft: curr - 1, Home: 0, End: tabs.length - 1 };
          if (!(e.key in map)) return;
          e.preventDefault();
          select((map[e.key] + tabs.length) % tabs.length, true, true);
        });
      })(lists[i]);
    }
  })();

  /* ==========================================================================
     9. ACORDEONES FAQ
     ========================================================================== */
  (function () {
    var btns = document.querySelectorAll('[data-accordion] .acc-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', function () {
        var acc = this.closest('[data-accordion]');
        var open = acc.toggleAttribute('data-open');
        this.setAttribute('aria-expanded', String(open));
      });
    }
  })();

  /* ==========================================================================
     10. MARQUEES (INFINITE SCROLL & COPIES & ACCESSIBILITY)
     ========================================================================== */
  (function () {
    // Copiar filas para secciones secundarias (ej. Nosotros)
    var copies = document.querySelectorAll('[data-mq-copy]');
    for (var i = 0; i < copies.length; i++) {
      var id = copies[i].getAttribute('data-mq-copy');
      var src = document.querySelector('[data-mq-src="' + id + '"] .mq-row');
      if (src && !copies[i].querySelector('.mq-row')) {
        copies[i].querySelector('.mq-track').appendChild(src.cloneNode(true));
      }
    }

    // Duplicar fila para bucle sin fin asegurando cobertura continua
    var tracks = document.querySelectorAll('.mq-track');
    for (var j = 0; j < tracks.length; j++) {
      var row = tracks[j].querySelector('.mq-row');
      if (!row || tracks[j].children.length > 1) continue;

      // Si la fila tiene pocos elementos (ej. gremios con 3 logos), clonar los <li> para que cada mitad cubra la pantalla
      var items = row.querySelectorAll('li');
      if (items.length > 0 && items.length < 8) {
        var repeatCount = Math.ceil(8 / items.length);
        for (var r = 1; r < repeatCount; r++) {
          for (var it = 0; it < items.length; it++) {
            row.appendChild(items[it].cloneNode(true));
          }
        }
      }

      var dup = row.cloneNode(true);
      dup.setAttribute('aria-hidden', 'true');
      tracks[j].appendChild(dup);

      // Asegurar que ninguna imagen del carrusel tenga carga diferida ni permita arrastre fantasma
      var allImgs = tracks[j].querySelectorAll('img');
      for (var imgIdx = 0; imgIdx < allImgs.length; imgIdx++) {
        allImgs[imgIdx].setAttribute('loading', 'eager');
        allImgs[imgIdx].setAttribute('decoding', 'async');
        allImgs[imgIdx].setAttribute('draggable', 'false');
      }
    }

    // Prevenir arrastre nativo en todos los contenedores de marquee
    var allMqs = document.querySelectorAll('.mq');
    for (var m = 0; m < allMqs.length; m++) {
      allMqs[m].addEventListener('dragstart', function (e) {
        e.preventDefault();
      });
    }

    // Botón de pausa accesible (WCAG)
    var btns = document.querySelectorAll('.mq-pause');
    for (var k = 0; k < btns.length; k++) {
      btns[k].addEventListener('click', function () {
        var container = this.closest('.container') || this.parentElement;
        var mq = container ? container.querySelector('.mq') : null;
        if (!mq) {
          mq = this.closest('.mq-controls-bar')
            ? this.closest('.mq-controls-bar').previousElementSibling
            : this.previousElementSibling;
        }
        if (!mq || !mq.classList.contains('mq')) return;
        var paused = mq.toggleAttribute('data-paused');
        this.setAttribute('aria-pressed', String(paused));
        this.textContent = paused ? 'Reanudar movimiento' : 'Pausar movimiento';
      });
    }
  })();

  /* ==========================================================================
     11. FORMULARIO DE CONTACTO DIRECTO
     ========================================================================== */

  window.handleFallbackSubmit = function (event) {
    event.preventDefault();
    var form = document.getElementById('contact-fallback-form');
    var successMsg = document.getElementById('contact-success-msg');
    if (!form || !successMsg) return;

    // 1. Honeypot check (anti-bot / anti-spam)
    var hp = form.querySelector('input[name="_hp_security_check"]');
    if (hp && hp.value.trim().length > 0) {
      // Bot detected: silent reject without revealing detection
      return false;
    }

    // 2. Extraer y sanitizar valores de forma segura (sin eval ni innerHTML)
    var nameInput = document.getElementById('contact-name');
    var emailInput = document.getElementById('contact-email');
    var companyInput = document.getElementById('contact-company');
    var msgInput = document.getElementById('contact-message');

    function cleanText(v) {
      return (v || '').replace(/[<>]/g, '').trim();
    }

    var nameVal = cleanText(nameInput ? nameInput.value : '');
    var emailVal = cleanText(emailInput ? emailInput.value : '');
    var compVal = cleanText(companyInput ? companyInput.value : '');
    var msgVal = cleanText(msgInput ? msgInput.value : '');

    // 3. Configurar botón opcional de WhatsApp directo con datos saneados
    var waBtn = document.getElementById('contact-success-wa-btn');
    if (waBtn) {
      var waQuery = 'Hola Nexus Consulting, soy ' + (nameVal || 'un cliente') + 
        (compVal ? ' de ' + compVal : '') + 
        '. Me gustaría conversar sobre: ' + (msgVal || 'un proyecto de consultoría');
      waBtn.href = 'https://wa.me/595981000000?text=' + encodeURIComponent(waQuery);
    }

    // 4. Reset seguro y mostrar mensaje de confirmación
    form.reset();
    form.style.display = 'none';
    successMsg.style.display = 'block';
  };

  /* ==========================================================================
     13. PASTILLA FLOTANTE DE CONTACTO (C-LEVEL ACTION PILL)
     ========================================================================== */
  (function () {
    var pill = document.getElementById('floatingPill');
    if (!pill) return;

    var ticking = false;
    function checkPill() {
      var scrollY = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight;
      var winHeight = window.innerHeight;

      // Se muestra tras 350px de scroll y se oculta cerca del final de la página (para no tapar el formulario)
      var isScrolled = scrollY > 350;
      var nearBottom = (docHeight - (scrollY + winHeight)) < 260;
      var shouldShow = isScrolled && !nearBottom;

      pill.classList.toggle('is-visible', shouldShow);
      pill.setAttribute('aria-hidden', String(!shouldShow));
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(checkPill);
        ticking = true;
      }
    }, { passive: true });

    checkPill();
  })();

  /* ==========================================================================
     14. SPOTLIGHT GLOW EN TARJETAS (ESTILO LINEAR / APPLE)
     ========================================================================== */
  (function () {
    if (!window.matchMedia('(hover: hover)').matches) return;

    var targets = document.querySelectorAll('.approach-card, .team-card, .tab-item, .vs-card, .client-box');
    targets.forEach(function (card) {
      card.classList.add('spotlight-card');
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--mouse-y', (e.clientY - rect.top) + 'px');
      });
    });
  })();

  /* ==========================================================================
     15. CLIENTS VIEW TOGGLE & SECTOR FILTERING
     ========================================================================== */
  window.setClientsView = function (mode) {
    var mq = document.querySelector('.mq[data-mq-src="clientes"]');
    var panel = document.getElementById('clientsSectorsPanel');
    var btnM = document.getElementById('btnViewMarquee');
    var btnS = document.getElementById('btnViewSectors');
    if (!mq || !panel || !btnM || !btnS) return;

    if (mode === 'sectors') {
      mq.style.display = 'none';
      panel.hidden = false;
      btnS.classList.add('is-active');
      btnM.classList.remove('is-active');
    } else {
      mq.style.display = 'flex';
      panel.hidden = true;
      btnM.classList.add('is-active');
      btnS.classList.remove('is-active');
    }
  };

  window.filterClientsSector = function (sec) {
    var filters = document.querySelectorAll('.sec-filter');
    filters.forEach(function (f) {
      f.classList.toggle('is-active', f.getAttribute('data-sec') === sec);
    });

    var boxes = document.querySelectorAll('.client-box');
    boxes.forEach(function (box) {
      var boxSec = box.getAttribute('data-sector');
      var match = (sec === 'all' || boxSec === sec);
      box.classList.toggle('is-hidden', !match);
    });
  };

  /* ==========================================================================
     16. INICIALIZACIÓN ROBUSTA DE VISTA CLIENTES
     ========================================================================== */
  if (typeof window.setClientsView === 'function') {
    window.setClientsView('marquee');
  }

  /* ==========================================================================
     17. HERO NETWORK CANVAS (ANIMACIÓN FLUIDA & INTERACTIVA DE RED)
     ========================================================================== */
  (function () {
    var canvas = document.getElementById('hero-network-canvas');
    if (!canvas || REDUCED) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var hero = canvas.closest('.hero') || document.querySelector('.hero');
    var width = 0;
    var height = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var mouse = { x: -1000, y: -1000, active: false };
    var animId = null;
    var isVisible = true;

    function resize() {
      if (!canvas.parentElement) return;
      var rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initParticles();
    }

    function initParticles() {
      particles = [];
      var isMobile = width < 768;
      var count = isMobile ? 15 : 28;
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.42,
          vy: (Math.random() - 0.5) * 0.42,
          radius: Math.random() * 1.8 + 1.5
        });
      }
    }

    function step() {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      var nodeFill = 'rgba(0, 139, 176, 0.45)';
      var lineBase = 'rgba(0, 139, 176, ';
      var maxDist = width < 768 ? 90 : 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interacción sutil con el cursor/touch
        if (mouse.active) {
          var dx = p.x - mouse.x;
          var dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0) {
            var force = (110 - dist) / 110;
            p.x += (dx / dist) * force * 1.1;
            p.y += (dy / dist) * force * 1.1;
          }
        }

        // Dibujar nodo
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeFill;
        ctx.fill();

        // Conectar líneas entre nodos cercanos
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dxx = p.x - p2.x;
          var dyy = p.y - p2.y;
          var d = Math.sqrt(dxx * dxx + dyy * dyy);
          if (d < maxDist) {
            var alpha = (1 - d / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineBase + alpha + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(step);
    }

    window.addEventListener('resize', resize, { passive: true });

    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        mouse.x = e.clientX - r.left;
        mouse.y = e.clientY - r.top;
        mouse.active = true;
      }, { passive: true });

      hero.addEventListener('mouseleave', function () {
        mouse.active = false;
      }, { passive: true });

      hero.addEventListener('touchmove', function (e) {
        if (e.touches && e.touches.length > 0) {
          var r = canvas.getBoundingClientRect();
          mouse.x = e.touches[0].clientX - r.left;
          mouse.y = e.touches[0].clientY - r.top;
          mouse.active = true;
        }
      }, { passive: true });

      hero.addEventListener('touchend', function () {
        mouse.active = false;
      }, { passive: true });
    }

    if (HAS_IO && hero) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          isVisible = entry.isIntersecting;
          if (isVisible && !animId) {
            animId = requestAnimationFrame(step);
          } else if (!isVisible && animId) {
            cancelAnimationFrame(animId);
            animId = null;
          }
        });
      }, { threshold: 0.05 });
      heroObserver.observe(hero);
    }

    resize();
    animId = requestAnimationFrame(step);
  })();



  /* ==========================================================================
     19. BOTONES MAGNÉTICOS SUTILES (DESKTOP)
     ========================================================================== */
  (function () {
    if (window.matchMedia('(hover: none)').matches || REDUCED) return;
    var magneticBtns = document.querySelectorAll('.hero-actions .btn');
    magneticBtns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  })();

  /* ==========================================================================
     20. EXPORTACIÓN DE DOSSIER EJECUTIVO (IMPRESIÓN / PDF)
     Garantiza la pre-carga y decodificación completa de fotos y logos antes de window.print()
     ========================================================================== */
  window.printDossier = function () {
    var dossier = document.getElementById('executive-print-dossier');
    if (!dossier) {
      window.print();
      return;
    }

    var imgs = Array.prototype.slice.call(dossier.querySelectorAll('img'));
    var promises = imgs.map(function (img) {
      if (img.complete && img.naturalWidth > 0) {
        return Promise.resolve();
      }
      if (img.decode) {
        return img.decode().catch(function () { return Promise.resolve(); });
      }
      return new Promise(function (resolve) {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(promises).then(function () {
      setTimeout(function () {
        window.print();
      }, 50);
    }).catch(function () {
      window.print();
    });
  };

  // Pre-carga proactiva de recursos del dossier para disponibilidad inmediata
  function preloadDossierAssets() {
    var dossier = document.getElementById('executive-print-dossier');
    if (!dossier) return;
    var imgs = dossier.querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) {
      if (imgs[i].src) {
        var p = new Image();
        p.src = imgs[i].src;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadDossierAssets);
  } else {
    preloadDossierAssets();
  }

})();

