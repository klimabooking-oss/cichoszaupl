/**
 * Cichoszau Theme Main JS
 * Consolidated and deferred for performance.
 */

(function() {
  'use strict';

  // ── 1. Scroll Reveal Engine ──────────────────────────────────────────
  function initScrollReveal() {
    var targets = document.querySelectorAll('[data-animate]');
    if (!targets.length) return;

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = el.getAttribute('data-animate-delay');
          if (delay) {
            setTimeout(function() { el.classList.add('is-visible'); }, parseInt(delay));
          } else {
            el.classList.add('is-visible');
          }
          io.unobserve(el);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(function(el) { io.observe(el); });

    /* Stagger: children of [data-animate-stagger] also get data-animate if not set */
    document.querySelectorAll('[data-animate-stagger]').forEach(function(parent) {
      var anim = parent.getAttribute('data-animate-stagger') || 'fade-up';
      Array.from(parent.children).forEach(function(child, i) {
        if (!child.getAttribute('data-animate')) {
          child.setAttribute('data-animate', anim);
          child.style.transitionDelay = (i * 80) + 'ms';
          io.observe(child);
        }
      });
    });
  }

  // ── 2. 3D Tilt + Liquid Glass Light Follower ─────────────────────────────
  function initTilt() {
    var cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(function(card) {
      /* inject specular light div */
      var light = document.createElement('div');
      light.className = 'glass-light';
      card.appendChild(light);

      card.addEventListener('mouseenter', function() {
        card.style.transition = 'transform 0.1s ease';
      });

      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        var y = (e.clientY - rect.top) / rect.height;
        var rotY = (x - 0.5) * 14;
        var rotX = (y - 0.5) * -10;

        card.style.transform =
          'perspective(900px) rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg) translateZ(8px)';

        /* move specular light to cursor */
        light.style.left = (x * 100) + '%';
        light.style.top  = (y * 100) + '%';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transition = 'transform 0.55s cubic-bezier(.22,1,.36,1)';
        card.style.transform  = 'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0)';
      });
    });
  }

  // ── 3. Particle Cursor (performance-optimized) ───────────────────────
  function initParticleCursor() {
    /* Skip on mobile/coarse pointer — canvas lag not worth it */
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d', { alpha: true });
    var particles = [];
    var RAF = null;
    var running = false;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    var COLORS = ['#f20df2','#ff5f1f','#fff','#ff70f0','#e040fb'];

    document.addEventListener('mousemove', function(e) {
      /* Spawn max 2 particles, throttled */
      for (var i = 0; i < 2; i++) {
        particles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          life: 1,
          decay: 0.028 + Math.random() * 0.02,
          size: 2 + Math.random() * 2.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }
      /* Start loop only if not already running */
      if (!running) startLoop();
    }, { passive: true });

    function loop() {
      if (particles.length === 0) {
        /* No particles — stop the loop entirely to save GPU time */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        running = false;
        RAF = null;
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.06;
        p.life -= p.decay;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.globalAlpha = p.life * 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      RAF = requestAnimationFrame(loop);
    }

    function startLoop() {
      running = true;
      RAF = requestAnimationFrame(loop);
    }

    /* Pause when tab is hidden */
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        if (RAF) { cancelAnimationFrame(RAF); RAF = null; running = false; }
      } else {
        if (particles.length > 0 && !running) startLoop();
      }
    });
  }

  // ── 4. Magnetic Buttons ─────────────────────────────────────────────────
  function initMagnetic() {
    var btns = document.querySelectorAll('.btn-magnetic, .btn-glow');
    btns.forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var rect = btn.getBoundingClientRect();
        var cx = rect.left + rect.width  / 2;
        var cy = rect.top  + rect.height / 2;
        var dx = e.clientX - cx;
        var dy = e.clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var radius = Math.max(rect.width, rect.height) * 0.8;
        if (dist < radius) {
          var strength = (1 - dist / radius) * 0.4;
          btn.style.transform = 'translate(' + (dx * strength) + 'px,' + (dy * strength) + 'px)';
        }
      });
      btn.addEventListener('mouseleave', function() {
        btn.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1)';
        btn.style.transform  = '';
        setTimeout(function() { btn.style.transition = ''; }, 500);
      });
    });
  }

  // ── 5. Sticky Booking CTA ───────────────────────────────────────────────
  function initStickyCtA() {
    var cta = document.getElementById('sticky-booking-cta');
    if (!cta) return;

    var ctaLink = cta.querySelector('a');
    if (ctaLink) {
      ctaLink.addEventListener('click', function(e) {
        var rental = document.getElementById('rental');
        if (rental) {
          e.preventDefault();
          rental.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    var triggers = Array.from(document.querySelectorAll('.odbierz-wycene-trigger'));
    var hero = document.getElementById('hero-section');
    var calculator = document.getElementById('rental');

    var observeTargets = new Set([...triggers]);
    if (calculator) observeTargets.add(calculator);
    if (triggers.length === 0 && hero) observeTargets.add(hero);

    if (observeTargets.size === 0) {
      cta.classList.add('visible');
      return;
    }

    var visibleTargets = new Set();
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          visibleTargets.add(e.target);
        } else {
          visibleTargets.delete(e.target);
        }
      });
      
      if (visibleTargets.size > 0) {
        cta.classList.remove('visible');
      } else {
        cta.classList.add('visible');
      }
    }, { threshold: 0 });

    observeTargets.forEach(function(el) {
      io.observe(el);
    });
  }

  // ── 6. Parallax Scroll ──────────────────────────────────────────────────
  // ── 6. Parallax Scroll ──────────────────────────────────────────────────
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    var heroBg = document.getElementById('hero-bg-wrapper');
    if (!els.length && !heroBg) return;
    
    var ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var sy = window.scrollY;
          
          if (els.length) {
            els.forEach(function(el) {
              var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
              el.style.transform = 'translateY(' + (sy * speed) + 'px)';
            });
          }
          
          if (heroBg) {
            // Parallax fade-out logic: Web vs Mobile
            var opacity = 1;
            if (window.innerWidth >= 768) {
              // Web: fade out smoothly based on screen height to avoid jumps
              var fadeDistance = window.innerHeight * 0.85;
              opacity = Math.max(0, 1 - (sy / fadeDistance));
            } else {
              // Mobile: fade out 15% earlier than previous setting
              var startFade = window.innerHeight * 0.20;
              var endFade = window.innerHeight * 0.90;
              if (sy > startFade) {
                opacity = Math.max(0, 1 - ((sy - startFade) / (endFade - startFade)));
              }
            }
            heroBg.style.opacity = opacity.toFixed(3);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // initial trigger
  }

  // ── 7. Typewriter Hero ──────────────────────────────────────────────────
  function initTypewriter() {
    var el = document.getElementById('hero-typewriter');
    if (!el) return;
    var words = ['SILENT DISCO','EVENTY B2B','KINO PLENEROWE','FESTIWALE','KONFERENCJE'];
    var wi = 0, ci = 0, deleting = false;
    var speed = { type: 80, delete: 45, pause: 2200 };
    function tick() {
      var word = words[wi];
      if (!deleting) {
        el.textContent = word.slice(0, ci + 1);
        ci++;
        if (ci === word.length) {
          deleting = true;
          setTimeout(tick, speed.pause);
          return;
        }
        setTimeout(tick, speed.type);
      } else {
        el.textContent = word.slice(0, ci - 1);
        ci--;
        if (ci === 0) {
          deleting = false;
          wi = (wi + 1) % words.length;
          setTimeout(tick, 400);
          return;
        }
        setTimeout(tick, speed.delete);
      }
    }
    setTimeout(tick, 1500);
  }

  // ── 8. Crosshair Cursor ─────────────────────────────────────────────────
  // Usunięte zgodnie z życzeniem użytkownika (nietypowe różowe obiekty "krzyżyk")

  // ── 9. Live Activity Badge ──────────────────────────────────────────────
  function initLiveBadge() {
    var cities = (window.CS_CONFIG && window.CS_CONFIG.cities) || ['Warszawa','Wrocław','Kraków','Gdańsk','Poznań','Katowice','Łódź','Rzeszów','Lublin','Toruń'];
    var badge = document.createElement('div');
    badge.id = 'live-badge';
    badge.style.cssText = 'position:fixed;z-index:9997;display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(34,16,34,0.92);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:9999px;font-size:11px;font-weight:700;color:#fff;letter-spacing:0.04em;box-shadow:0 8px 24px rgba(0,0,0,0.4);pointer-events:none;transition:opacity 0.4s,transform 0.4s;opacity:0;';
    badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#f20df2;box-shadow:0 0 6px #f20df2;animation:ping 1.5s ease-in-out infinite;flex-shrink:0"></span><span id="live-badge-text">3 osoby przeglądają ofertę</span>';
    document.body.appendChild(badge);

    function update() {
      var n    = Math.floor(Math.random() * 4) + 2;
      var city = cities[Math.floor(Math.random() * cities.length)];
      var textEl = document.getElementById('live-badge-text');
      if (textEl) textEl.textContent = n + ' os. z ' + city + ' przegląda ofertę';
      
      badge.classList.add('badge-visible');
      var ctaBtn = document.getElementById('sticky-booking-cta');
      if (ctaBtn) ctaBtn.classList.add('badge-active');
      
      setTimeout(function() {
        badge.classList.remove('badge-visible');
        if (ctaBtn) ctaBtn.classList.remove('badge-active');
      }, 4500);
    }
    setTimeout(function() {
      update();
      setInterval(update, Math.floor(Math.random() * 14000) + 18000);
    }, 4000);
  }

  // ── 10. Smooth Page Transitions ──────────────────────────────────────────
  function initTransitions() {
    var overlay = document.createElement('div');
    overlay.id = 'page-transition';
    overlay.style.cssText = 'position:fixed;inset:0;background:#221022;z-index:99999;pointer-events:none;opacity:0;transition:opacity 0.35s ease;';
    document.body.appendChild(overlay);

    /* Fade in on load */
    setTimeout(function() { overlay.style.opacity = '0'; }, 20);

    /* Fade out on navigate */
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link) return;
      var href = link.getAttribute('href');
      /* Skip anchors, external, target_blank etc */
      if (!href || href.charAt(0) === '#' || href.indexOf('mailto') === 0 || href.indexOf('tel') === 0 || link.target === '_blank') return;
      if (href.indexOf('http') === 0 && href.indexOf(window.location.host) === -1) return;
      
      e.preventDefault();
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'all';
      setTimeout(function() { window.location.href = href; }, 360);
    });

    /* Also handle popstate / pageshow */
    window.addEventListener('pageshow', function(e) {
      overlay.style.transition = 'none';
      overlay.style.opacity = '1';
      setTimeout(function() {
        overlay.style.transition = 'opacity 0.35s ease';
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      }, 20);
    });
  }

  // ── 11. Privacy Neon Injections ──────────────────────────────────────────
  function initPrivacyNeon() {
    const neonCookiesCSS = (window.CS_CONFIG && window.CS_CONFIG.neonCSS) || '';
    if (!neonCookiesCSS) return;
    
    function inject() {
      const containers = document.querySelectorAll('customer-privacy-banner, #shopify-pc__banner, .shopify-policy__container');
      containers.forEach(container => {
        if (container.shadowRoot) {
          if (!container.shadowRoot.getElementById('neon-cookie-css')) {
            const style = document.createElement('style');
            style.id = 'neon-cookie-css';
            style.innerHTML = neonCookiesCSS;
            container.shadowRoot.appendChild(style);
          }
        }
      });
    }
    const interval = setInterval(inject, 400);
    setTimeout(() => clearInterval(interval), 12000);
  }

  // ── INITIALIZE ───────────────────────────────────────────────────────────
  function initAll() {
    initScrollReveal();
    initTilt();
    initParticleCursor();
    initMagnetic();
    initStickyCtA();
    initParallax();
    initTypewriter();
    initLiveBadge();
    initTransitions();
    initPrivacyNeon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Support for Shopify Theme Editor (re-init on section change)
  document.addEventListener('shopify:section:load', function() {
    initAll();
  });

})();
