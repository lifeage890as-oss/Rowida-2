/* ==========================================================
   تاجر الأرائك — السلوك العام
   ========================================================== */
(function () {
  'use strict';

  const PHONE_DISPLAY = '054 112 6416';
  const PHONE_LINK = '+966541126416';
  const WA_NUMBER = '966541126416';
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text || 'مرحباً، أرغب في الاستفسار عن خدمات تاجر الأرائك.')}`;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  /* خلفية عرض شرائح: كل الصور تظهر واحدة بعد واحدة */
  function createBackdrop() {
    const current = location.pathname.split('/').pop() || 'index.html';
    if (current !== 'index.html' || document.querySelector('.bg-slideshow')) return;
    document.body.classList.add('has-bg-motion');
    const wrap = document.createElement('div');
    wrap.className = 'bg-slideshow';
    wrap.setAttribute('aria-hidden', 'true');
    for (let i = 1; i <= 18; i++) {
      const slide = document.createElement('div');
      slide.className = 'bg-slide';
      slide.style.backgroundImage = "url('assets/images/sofa-" + ('0' + i).slice(-2) + ".jpg')";
      slide.style.animationDelay = (-(i - 1) * 6) + 's';
      wrap.appendChild(slide);
    }
    document.body.prepend(wrap);
  }

  ready(function () {
    createBackdrop();

    /* ---------- الوضع الليلي / النهاري ---------- */
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', 'التبديل بين الوضع النهاري والوضع الليلي');
      themeBtn.addEventListener('click', function () {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('tajer-theme', next);
        showToast(next === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري');
      });
    }

    /* ---------- قائمة الجوال ---------- */
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    if (menuBtn && navLinks) {
      menuBtn.addEventListener('click', function () {
        const open = navLinks.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(open));
      });
      document.addEventListener('click', function (e) {
        if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
          navLinks.classList.remove('open');
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    /* ---------- تمييز الرابط الحالي ---------- */
    const current = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      const href = (a.getAttribute('href') || '').split('/').pop() || 'index.html';
      if (href === current) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });

    /* ---------- ظل الهيدر عند التمرير ---------- */
    const nav = document.querySelector('.nav');
    const toTop = document.getElementById('toTop');
    function onScroll() {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 18);
      if (toTop) toTop.classList.toggle('show', window.scrollY > 500);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    /* ---------- أزرار التنقل: السابق / التالي ---------- */
    const backBtn = document.getElementById('histBack');
    const fwdBtn = document.getElementById('histForward');
    if (backBtn && fwdBtn) {
      const store = {
        get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
        remove: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} }
      };
      const FLAG = 'tajer_can_forward';
      backBtn.classList.toggle('disabled', history.length <= 1);
      fwdBtn.classList.toggle('disabled', store.get(FLAG) !== '1');
      backBtn.addEventListener('click', function () {
        store.set(FLAG, '1');
        history.back();
      });
      fwdBtn.addEventListener('click', function () {
        if (store.get(FLAG) !== '1') return;
        store.remove(FLAG);
        history.forward();
      });
    }

    /* ---------- ظهور العناصر عند التمرير ---------- */
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay + 'ms';
            el.classList.add('visible');
            io.unobserve(el);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- انتقال سلس بين الصفحات ---------- */
    document.body.classList.add('page-enter');
    window.setTimeout(function () { document.body.classList.remove('page-enter'); }, 600);

    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      const raw = a.getAttribute('href');
      if (!raw || /^(#|https?:|tel:|mailto:|javascript:|data:)/i.test(raw)) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !url.pathname.endsWith('.html')) return;
      if (url.pathname === location.pathname) return;
      e.preventDefault();
      document.body.classList.add('page-leave');
      window.setTimeout(function () { location.href = url.href; }, 190);
    });

    /* ---------- روابط واتساب المُعدّة مسبقاً ---------- */
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      el.href = waLink(el.getAttribute('data-wa'));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });

    /* ---------- الأسئلة الشائعة ---------- */
    document.querySelectorAll('.faq-q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.faq-item');
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });

    /* ---------- النافذة السريعة ---------- */
    const modal = document.getElementById('quickModal');
    if (modal) {
      const closeBtn = modal.querySelector('.modal-close');
      const close = function () { modal.classList.remove('open'); document.body.style.overflow = ''; };
      closeBtn.addEventListener('click', close);
      modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

      document.addEventListener('click', function (e) {
        const btn = e.target.closest('.js-quick');
        if (!btn) return;
        let item = null;
        if (btn.dataset.id) item = PRODUCTS.find(function (p) { return p.id === Number(btn.dataset.id); });
        if (btn.dataset.package) item = PACKAGES.find(function (p) { return p.id === btn.dataset.package; });
        if (!item) return;
        const isPackage = Boolean(btn.dataset.package);
        modal.querySelector('#modalImg').src = 'assets/images/' + item.img;
        modal.querySelector('#modalImg').alt = item.name;
        modal.querySelector('#modalTitle').textContent = item.name;
        modal.querySelector('#modalTag').textContent = isPackage ? 'باقة جاهزة' : CATEGORIES[item.cat].name;
        modal.querySelector('#modalDesc').textContent = item.intro || item.desc || '';
        const list = modal.querySelector('#modalFeatures');
        list.innerHTML = '';
        (item.features || [
          'مناسب للمجالس والاستقبالات',
          'تنسيق وترتيب مدروس',
          'التوصيل والتركيب في الموعد المحدد'
        ]).forEach(function (f) {
          const li = document.createElement('li');
          li.textContent = f;
          list.appendChild(li);
        });
        modal.querySelector('#modalWa').href = waLink('مرحباً، أرغب في الحصول على عرض سعر لـ: ' + item.name);
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    }

    /* ---------- صفحة التشكيلات: العرض والفلترة والبحث ---------- */
    const grid = document.getElementById('productsGrid');
    if (grid) {
      const countEl = document.getElementById('resultsCount');
      const searchEl = document.getElementById('productSearch');

      function cardHtml(p) {
        const badgeClass = p.badge === 'جديد' ? 'new' : (p.badge === 'الأكثر طلباً' ? 'hot' : '');
        return `
          <article class="product-card reveal visible" data-cat="${p.cat}" data-name="${p.name}">
            <div class="product-media">
              <img src="assets/images/${p.img}" alt="${p.name}" loading="lazy">
              ${p.badge ? `<span class="badge ${badgeClass}">${p.badge}</span>` : ''}
            </div>
            <div class="product-body">
              <span class="product-tag">${CATEGORIES[p.cat].name}</span>
              <h3>${p.name}</h3>
              <p>${p.desc}</p>
              <div class="product-foot">
                <span class="price">عرض السعر <small>عند التواصل</small></span>
              </div>
              <div class="product-actions">
                <button type="button" class="btn btn-ghost btn-sm js-quick" data-id="${p.id}">التفاصيل</button>
                <a class="btn btn-primary btn-sm" data-wa="مرحباً، أرغب في الحصول على عرض سعر لـ: ${p.name}" target="_blank" rel="noopener">اطلب العرض</a>
              </div>
            </div>
          </article>`;
      }

      function render(filter, term) {
        const q = (term || '').trim();
        const items = PRODUCTS.filter(function (p) {
          const okCat = filter === 'all' || p.cat === filter;
          const okText = !q || (p.name + ' ' + p.desc + ' ' + CATEGORIES[p.cat].name).includes(q);
          return okCat && okText;
        });
        grid.innerHTML = items.length
          ? items.map(cardHtml).join('')
          : `<div class="empty-state" style="grid-column:1/-1">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
               <h3>لا توجد نتائج مطابقة</h3>
               <p class="muted">جرّب كلمة أخرى أو اختر تشكيلة مختلفة.</p>
             </div>`;
        if (countEl) countEl.textContent = `عدد النتائج: ${items.length}`;
        grid.querySelectorAll('[data-wa]').forEach(function (el) {
          el.href = waLink(el.getAttribute('data-wa'));
        });
      }

      document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          document.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          render(chip.dataset.filter, searchEl ? searchEl.value : '');
        });
      });
      if (searchEl) searchEl.addEventListener('input', function () {
        const active = document.querySelector('.chip[data-filter].active');
        render(active ? active.dataset.filter : 'all', searchEl.value);
      });
      const hashChip = location.hash && document.querySelector('.chip[data-filter]' + location.hash);
      if (hashChip) {
        document.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.classList.remove('active'); });
        hashChip.classList.add('active');
        render(hashChip.dataset.filter, '');
      } else {
        render('all', '');
      }
    }

    /* ---------- نموذج التواصل → واتساب ---------- */
    const form = document.getElementById('contactForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const val = function (id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
        const message = [
          'مرحباً تاجر الأرائك، أرغب في الحصول على عرض سعر وتأكيد التفاصيل:',
          '',
          'الاسم: ' + val('fName'),
          'الجوال: ' + val('fPhone'),
          'المنطقة: ' + val('fCity'),
          'نوع الطلب: ' + val('fType'),
          'التفاصيل: ' + (val('fDetails') || 'يرجى التواصل معي لاستكمال التفاصيل')
        ].join('\n');
        window.open(waLink(message), '_blank', 'noopener');
        showToast('تم تجهيز رسالتك، أكمل الإرسال في واتساب');
        form.reset();
      });
    }
  });

  /* ---------- إشعار صغير ---------- */
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }
})();
