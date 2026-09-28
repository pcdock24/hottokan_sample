/* 豊田ほっとかん デモテーマ（案1）：依存ライブラリなし（WordPress化時は wp_enqueue_script で読み込み） */
(function () {
  'use strict';

  // スマホメニュー（1279px 以下）
  var toggle = document.querySelector('.menu-toggle');
  var gnav = document.querySelector('.gnav');
  function setMenu(open) {
    if (!toggle || !gnav) return;
    toggle.setAttribute('aria-expanded', String(open));
    gnav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle && gnav) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    // メニュー内のリンク（同じページ内のアンカーを含む）を押したら閉じる
    gnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // 画面幅が広がってサイドレールになったら、開いた状態を解除する
    window.matchMedia('(min-width: 1280px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // ドロップダウン（サイドレール・スマホメニューとも、その場で開閉）
  var dropdowns = document.querySelectorAll('.gnav .has-sub');
  function closeAll(except) {
    dropdowns.forEach(function (li) {
      if (li !== except) {
        li.classList.remove('is-open');
        li.querySelector('button').setAttribute('aria-expanded', 'false');
      }
    });
  }
  dropdowns.forEach(function (li) {
    var btn = li.querySelector('button');
    btn.addEventListener('click', function () {
      var open = !li.classList.contains('is-open');
      closeAll(li);
      li.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeAll();
    if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  // 現在のページをメニューで示す（WP化時は wp_nav_menu の current-menu-item に置き換え）
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.gnav a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href.indexOf('#') === -1 && href === here) {
      a.setAttribute('aria-current', 'page');
      var parent = a.closest('.has-sub');
      if (parent) {
        parent.classList.add('is-open');
        parent.querySelector('button').setAttribute('aria-expanded', 'true');
      }
    }
  });

  // タブ（施設・サービス：本館／東館）
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab) {
      tabs.forEach(function (t) {
        var sel = t === tab;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
      });
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); select(next); next.focus(); }
      });
    });
  });

  // お知らせのカテゴリ絞り込み
  var filterBtns = document.querySelectorAll('[data-filter]');
  var newsItems = document.querySelectorAll('.news-list li[data-cat]');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      newsItems.forEach(function (li) { li.classList.toggle('is-hidden', f !== 'all' && li.dataset.cat !== f); });
    });
  });

  // ページ内の目次：いま読んでいる節を示す
  var tocLinks = document.querySelectorAll('.local-nav a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) map[target.id] = a;
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        tocLinks.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
        var link = map[entry.target.id];
        link.classList.add('is-current');
        link.setAttribute('aria-current', 'location');
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    Object.keys(map).forEach(function (id) { observer.observe(document.getElementById(id)); });
  }

  // ページトップ
  var pagetop = document.querySelector('.pagetop');
  if (pagetop) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.addEventListener('scroll', function () { pagetop.classList.toggle('is-show', window.scrollY > 400); }, { passive: true });
    pagetop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      document.getElementById('main').focus({ preventScroll: true });
    });
  }
})();
