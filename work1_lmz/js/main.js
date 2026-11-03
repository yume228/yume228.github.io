/* ============================================================
   李萌真 · 个人主页 —— 交互脚本
   纯原生 JavaScript，无任何第三方库
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navHeight = 76;

  /* ---------------------------------------------------------
     1. 移动端导航菜单（汉堡按钮）
     --------------------------------------------------------- */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', '展开导航菜单');
  }

  function openMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', '收起导航菜单');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      if (navMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // 点击菜单里的链接后自动收起
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // 点击页面空白处或按 Esc 收起
    document.addEventListener('click', function (e) {
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // 视口变宽后重置状态
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880) closeMenu();
    });
  }

  /* ---------------------------------------------------------
     2. 滚动相关：导航栏阴影 / 滚动高亮 / 回到顶部
     --------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  var toTop = document.getElementById('toTop');

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    // 导航栏阴影
    if (header) header.classList.toggle('is-scrolled', y > 8);

    // 回到顶部按钮
    if (toTop) toTop.classList.toggle('is-visible', y > 420);

    // 当前所在的区块
    if (sections.length) {
      var current = sections[0].id;
      if (y + navHeight + 80 >= document.documentElement.scrollHeight - window.innerHeight) {
        current = sections[sections.length - 1].id;
      } else {
        sections.forEach(function (sec) {
          if (sec.offsetTop - navHeight - 90 <= y) current = sec.id;
        });
      }
      setActiveLink(current);
    }

    ticking = false;
  }

  function requestScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }

  window.addEventListener('scroll', requestScroll, { passive: true });
  window.addEventListener('resize', requestScroll);

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  }

  /* ---------------------------------------------------------
     3. 滚动显现动画（IntersectionObserver）
     --------------------------------------------------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function revealAll() {
    revealItems.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealItems.forEach(function (el) {
      revealObserver.observe(el);
    });

    // 兜底：3 秒后仍未触发的一律显示，避免内容被隐藏
    window.setTimeout(revealAll, 3000);
  }

  /* ---------------------------------------------------------
     4. 首屏轮换文字
     --------------------------------------------------------- */
  var rotator = document.getElementById('rotator');
  var words = ['GIS 学习者', '地图爱好者', '空间分析新手', '阅读爱好者', '2024 级 3 班的一员'];

  if (rotator && !reduceMotion) {
    var wordIndex = 0;
    var swap = function () {
      rotator.classList.add('is-fading');
      window.setTimeout(function () {
        wordIndex = (wordIndex + 1) % words.length;
        rotator.textContent = words[wordIndex];
        rotator.classList.remove('is-fading');
      }, 300);
    };
    window.setInterval(swap, 2600);
  }

  /* ---------------------------------------------------------
     5. 复制邮箱 + 轻提示
     --------------------------------------------------------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2000);
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  var copyBtn = document.getElementById('copyMail');
  var mailLink = document.getElementById('mailLink');
  var mailText = mailLink ? mailLink.textContent.trim() : '3162660256@qq.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function (ok) {
        showToast(ok ? '邮箱已复制：' + mailText : '复制失败，请手动选中邮箱地址');
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mailText).then(
          function () {
            done(true);
          },
          function () {
            done(legacyCopy(mailText));
          }
        );
      } else {
        done(legacyCopy(mailText));
      }
    });
  }

  /* ---------------------------------------------------------
     6. 首屏光斑跟随鼠标的轻微视差
     --------------------------------------------------------- */
  var hero = document.getElementById('hero');
  var blobs = document.querySelector('.hero-blobs');

  if (hero && blobs && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    var rafId = null;
    var targetX = 0;
    var targetY = 0;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      targetX = (e.clientX - rect.left) / rect.width - 0.5;
      targetY = (e.clientY - rect.top) / rect.height - 0.5;

      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(function () {
        blobs.style.transform =
          'translate3d(' + (targetX * 26).toFixed(2) + 'px,' +
          (targetY * 20).toFixed(2) + 'px, 0)';
        rafId = null;
      });
    });

    hero.addEventListener('mouseleave', function () {
      blobs.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  /* ---------------------------------------------------------
     7. 初始化
     --------------------------------------------------------- */
  onScroll();
})();