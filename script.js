/* ═══════════════════════════════════════════════════════
   NEMESIS — GRAND OPENING SCRIPT v3
   Cover-art aware · GSAP ScrollTrigger · Book Open
   ═══════════════════════════════════════════════════════ */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    gsap.registerPlugin(ScrollTrigger);

    setupGrain();
    setupCursor();
    setupNavbar();
    setupMobileMenu();
    setupScrollProgress();
    setupBookAnimation();
    setupSectionReveals();
    setupCounters();
    setupCharactersTrack();
    setupPageLoad();
  }

  /* ════════════════════════════════════════
     FILM GRAIN — live canvas noise
  ════════════════════════════════════════ */
  function setupGrain() {
    const canvas = document.getElementById('grainCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    (function tick() {
      const img  = ctx.createImageData(w, h);
      const data = img.data;
      for (let i = 0; i < data.length; i += 4) {
        const v   = (Math.random() * 255) | 0;
        data[i]   = v;
        data[i+1] = v;
        data[i+2] = v;
        data[i+3] = 20;
      }
      ctx.putImageData(img, 0, 0);
      requestAnimationFrame(tick);
    })();
  }

  /* ════════════════════════════════════════
     CUSTOM CURSOR
  ════════════════════════════════════════ */
  function setupCursor() {
    const dot  = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring || window.matchMedia('(hover:none)').matches) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function follow() {
      rx += (mx - rx) * 0.11;
      ry += (my - ry) * 0.11;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll('a, button, .ch-card, .o-card, .c-item, .crew-cell, .id-row, .mini-cover').forEach(el => {
      el.addEventListener('mouseenter', () => { dot.classList.add('big'); ring.classList.add('big'); });
      el.addEventListener('mouseleave', () => { dot.classList.remove('big'); ring.classList.remove('big'); });
    });
  }

  /* ════════════════════════════════════════
     NAVBAR
  ════════════════════════════════════════ */
  function setupNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('solid', window.scrollY > 60);
    }, { passive: true });

    /* Smooth anchor nav */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ════════════════════════════════════════
     MOBILE MENU
  ════════════════════════════════════════ */
  function setupMobileMenu() {
    const burger = document.getElementById('burger');
    const drawer = document.getElementById('drawer');
    if (!burger || !drawer) return;

    let open = false;
    const toggle = force => {
      open = force !== undefined ? force : !open;
      burger.classList.toggle('open', open);
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };

    burger.addEventListener('click', () => toggle());
    document.querySelectorAll('.d-link').forEach(l => l.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) toggle(false); });
  }

  /* ════════════════════════════════════════
     SCROLL PROGRESS BAR
  ════════════════════════════════════════ */
  function setupScrollProgress() {
    const bar = document.getElementById('scrollBar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = (pct * 100) + '%';
    }, { passive: true });
  }

  /* ════════════════════════════════════════
     THE BOOK OPENING ANIMATION
     ─────────────────────────────────────
     Pinned for 300vh scroll travel
     Phase 1 (0–25%)  : book scales up, cue fades
     Phase 2 (25–75%) : cover rotates open -180deg
     Phase 3 (75–100%): inside spread reveals
     After pin leave  : site-main slides up
  ════════════════════════════════════════ */
  function setupBookAnimation() {
    const stage      = document.getElementById('hero');
    const bookWrap   = document.getElementById('bookWrap');
    const bookCover  = document.getElementById('bookCover');
    const bookInside = document.getElementById('bookInside');
    const scrollCue  = document.getElementById('scrollCue');
    const ambientWord = document.getElementById('ambientWord');
    const siteMain   = document.getElementById('siteMain');
    const stageBeam  = document.querySelector('.stage-beam');

    if (!stage || !bookWrap || !bookCover || !siteMain) return;

    /* ── Initial state ── */
    gsap.set(bookWrap,   { scale: 0.72, opacity: 0, rotateY: -22, rotateX: 5 });
    gsap.set(ambientWord, { opacity: 0, scale: 1.06 });
    gsap.set(scrollCue,  { opacity: 0 });
    gsap.set(siteMain,   { y: 80, opacity: 0 });
    gsap.set(bookInside, { opacity: 0 });

    /* ── Entry animation (on load, before scroll) ── */
    const entryTl = gsap.timeline({ delay: 0.4 });
    entryTl
      .to(bookWrap, {
        scale: 1, opacity: 1,
        duration: 1.5, ease: 'power3.out'
      })
      .to(ambientWord, {
        opacity: 1, scale: 1,
        duration: 2.0, ease: 'power2.out'
      }, '-=1.0')
      .to(scrollCue, {
        opacity: 1, duration: 0.8, ease: 'power2.out'
      }, '-=0.5');

    /* ── Mouse parallax tilt on hero (only while pinned / top) ── */
    let tiltActive = true;
    stage.addEventListener('mousemove', e => {
      if (!tiltActive) return;
      const rect = stage.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
      const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
      gsap.to(bookWrap, {
        rotateY: -18 + dx * 10,
        rotateX:   4 - dy * 6,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    }, { passive: true });

    stage.addEventListener('mouseleave', () => {
      if (!tiltActive) return;
      gsap.to(bookWrap, {
        rotateY: -18, rotateX: 4,
        duration: 0.85, ease: 'power3.out',
        overwrite: 'auto'
      });
    }, { passive: true });

    /* ── Spacer gives scroll room for the pinned section ── */
    const spacer = document.createElement('div');
    spacer.id = 'bookSpacer';
    spacer.style.cssText = 'height:300vh; pointer-events:none;';
    stage.insertAdjacentElement('afterend', spacer);

    /* ── Master scrollTrigger timeline ── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: false,   /* spacer handles room */
        scrub: 1.4,
        anticipatePin: 1,
        onUpdate: self => {
          /* Disable mouse tilt once scroll begins */
          tiltActive = self.progress < 0.02;
        },
        onLeave: () => {
          /* Site content rises after book fully opens */
          gsap.to(siteMain, {
            y: 0, opacity: 1,
            duration: 1.1, ease: 'power3.out'
          });
        },
        onEnterBack: () => {
          gsap.to(siteMain, {
            y: 80, opacity: 0,
            duration: 0.5, ease: 'power2.in'
          });
        }
      }
    });

    tl
      /* Phase 1 – scale up, fade cue */
      .to(scrollCue, { opacity: 0, duration: 0.06 })
      .to(bookWrap, {
        scale: 1.25,
        rotateY: -6,
        rotateX: 1,
        duration: 0.22,
        ease: 'power2.inOut'
      }, '<')
      .to(ambientWord, { opacity: 0, scale: 0.9, duration: 0.14 }, '<0.04')
      /* Beam intensifies as cover starts to open */
      .to(stageBeam, { opacity: 1, duration: 0.08 }, '<0.05')

      /* Phase 2 – COVER OPENS */
      .to(bookCover, {
        rotateY: -180,
        duration: 0.52,
        ease: 'power2.inOut'
      })
      /* Shift book wrap right slightly so spread is centered */
      .to(bookWrap, {
        x: 90,
        duration: 0.52,
        ease: 'power2.inOut'
      }, '<')

      /* Phase 3 – Inside pages appear */
      .to(bookInside, { opacity: 1, duration: 0.18, ease: 'power2.out' })
      .to(stageBeam,  { opacity: 0.3, duration: 0.18 }, '<')
      .to(bookWrap,   { scale: 1.12, duration: 0.18, ease: 'power2.out' }, '<');

    /* ── Ambient word parallax (independent of pin) ── */
    gsap.to(ambientWord, {
      y: -80, ease: 'none',
      scrollTrigger: {
        trigger: spacer,
        start: 'top top',
        end: 'bottom top',
        scrub: 2
      }
    });
  }

  /* ════════════════════════════════════════
     SECTION REVEAL ANIMATIONS
  ════════════════════════════════════════ */
  function setupSectionReveals() {

    /* Intro headline — lines stagger up */
    const lines = document.querySelectorAll('.ih-line');
    if (lines.length) {
      gsap.from(lines, {
        y: '100%', opacity: 0, duration: 1.0, ease: 'power4.out', stagger: 0.12,
        scrollTrigger: { trigger: '.intro-headline', start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Eyebrows, titles, rules, paragraphs */
    gsap.utils.toArray('.s-eyebrow, .s-title, .s-rule, .intro-para, .contact-intro, .ig-lead, .ig-body').forEach(el => {
      gsap.from(el, {
        y: 26, opacity: 0, duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });

    /* Mini cover floats in */
    const miniCover = document.querySelector('.mini-cover-wrap');
    if (miniCover) {
      gsap.from(miniCover, {
        y: 40, opacity: 0, rotateY: -15, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: miniCover, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Info cover */
    const infoCover = document.querySelector('.info-cover-wrap');
    if (infoCover) {
      gsap.from(infoCover, {
        x: -40, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: infoCover, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Stat row */
    gsap.from('.stat-row', {
      y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: { trigger: '.stat-row', start: 'top 88%', toggleActions: 'play none none none' }
    });

    /* Staggered groups */
    const staggerGroups = {
      '.o-card':     0.12,
      '.id-row':     0.07,
      '.c-item':     0.09,
      '.crew-cell':  0.07,
    };

    Object.entries(staggerGroups).forEach(([sel, stagger]) => {
      const bySection = {};
      document.querySelectorAll(sel).forEach(el => {
        const key = el.closest('section')?.id || 'root';
        if (!bySection[key]) bySection[key] = [];
        bySection[key].push(el);
      });
      Object.values(bySection).forEach(group => {
        if (!group.length) return;
        gsap.from(group, {
          y: 28, opacity: 0, duration: 0.72, ease: 'power3.out', stagger,
          scrollTrigger: { trigger: group[0], start: 'top 88%', toggleActions: 'play none none none' }
        });
      });
    });

    /* Author card */
    const ac = document.querySelector('.author-card');
    if (ac) {
      gsap.from(ac, {
        x: -36, opacity: 0, duration: 1.0, ease: 'power3.out',
        scrollTrigger: { trigger: ac, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Character cards */
    gsap.from('.ch-card', {
      x: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: '.chars-ribbon', start: 'top 85%', toggleActions: 'play none none none' }
    });

    /* Roman numeral cascade */
    const romans = document.querySelectorAll('.chapters-grid span');
    if (romans.length) {
      gsap.from(romans, {
        scale: 0.5, opacity: 0, duration: 0.38, ease: 'back.out(1.8)',
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: { trigger: '.chapters-grid', start: 'top 85%', toggleActions: 'play none none none' }
      });
    }

    /* Layer tags parallax */
    document.querySelectorAll('.layer-tag').forEach(tag => {
      gsap.to(tag, {
        y: -55, ease: 'none',
        scrollTrigger: {
          trigger: tag.parentElement,
          start: 'top bottom', end: 'bottom top', scrub: true
        }
      });
    });

    /* Ink bleed parallax */
    document.querySelectorAll('.ink-left, .ink-right').forEach(el => {
      gsap.to(el, {
        y: -35, ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement,
          start: 'top bottom', end: 'bottom top', scrub: 1.5
        }
      });
    });

    /* Button ripple */
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const r    = document.createElement('span');
        r.style.cssText = `position:absolute;border-radius:50%;width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;background:rgba(255,255,255,.12);transform:scale(0);animation:rpl_ .55s linear forwards;pointer-events:none;`;
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(r);
        setTimeout(() => r.remove(), 600);
      });
    });

    if (!document.getElementById('rpl-style')) {
      const s = document.createElement('style');
      s.id = 'rpl-style';
      s.textContent = `@keyframes rpl_ { to { transform:scale(4); opacity:0; } }`;
      document.head.appendChild(s);
    }
  }

  /* ════════════════════════════════════════
     COUNTERS
  ════════════════════════════════════════ */
  function setupCounters() {
    document.querySelectorAll('.ss-num[data-count]').forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      let done = false;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        onEnter: () => {
          if (done) return;
          done = true;
          gsap.fromTo({ v: 0 }, { v: target }, {
            duration: 1.9, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
          });
        }
      });
    });
  }

  /* ════════════════════════════════════════
     CHARACTERS HORIZONTAL TRACK
     Drag + scroll-wheel → horizontal pan
  ════════════════════════════════════════ */
  function setupCharactersTrack() {
    const vp   = document.querySelector('.chars-viewport');
    const fill = document.getElementById('ciFill');
    if (!vp) return;

    /* Progress fill */
    vp.addEventListener('scroll', () => {
      const max = vp.scrollWidth - vp.clientWidth;
      if (max > 0 && fill) fill.style.width = (vp.scrollLeft / max * 100) + '%';
    }, { passive: true });

    /* Mouse drag */
    let down = false, startX = 0, startLeft = 0;
    vp.addEventListener('mousedown', e => { down = true; startX = e.clientX; startLeft = vp.scrollLeft; vp.style.userSelect = 'none'; });
    document.addEventListener('mousemove', e => { if (down) vp.scrollLeft = startLeft - (e.clientX - startX); });
    document.addEventListener('mouseup',   () => { down = false; vp.style.userSelect = ''; });

    /* Touch drag */
    let tx = 0, tl = 0;
    vp.addEventListener('touchstart', e => { tx = e.touches[0].clientX; tl = vp.scrollLeft; }, { passive: true });
    vp.addEventListener('touchmove',  e => { vp.scrollLeft = tl - (e.touches[0].clientX - tx); }, { passive: true });

    /* Vertical wheel → horizontal scroll */
    vp.addEventListener('wheel', e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      vp.scrollLeft += e.deltaY * 0.65;
    }, { passive: false });
  }

  /* ════════════════════════════════════════
     PAGE LOAD FADE
  ════════════════════════════════════════ */
  function setupPageLoad() {
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
      gsap.to(document.body, { opacity: 1, duration: 0.65, ease: 'power2.out' });
    });
  }

})();
