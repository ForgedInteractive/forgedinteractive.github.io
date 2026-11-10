const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
const ids = panels.map(p => p.id);

function show(id, { focusPanel = false } = {}) {
  if (!ids.includes(id)) id = 'home';

  tabs.forEach(tab => {
    const on = tab.getAttribute('aria-controls') === id;
    tab.setAttribute('aria-selected', on);
    tab.tabIndex = on ? 0 : -1;
  });
  panels.forEach(panel => { panel.hidden = panel.id !== id; });

  document.title = id === 'home' ? 'Forged Interactive' : `${id[0].toUpperCase() + id.slice(1)} | Forged Interactive`;

  if (focusPanel) {
    window.scrollTo(0, 0);
    document.getElementById(id).focus({ preventScroll: true });
  }
}

function go(id, opts) {
  const url = id === 'home' ? location.pathname : '#' + id;
  if (url !== location.pathname + location.hash) history.pushState(null, '', url);
  show(id, opts);
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    go(tab.getAttribute('aria-controls'));
  });

  // arrow keys move between tabs, same as a desktop tab strip
  tab.addEventListener('keydown', e => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    let next;
    if (e.key in keys) next = tabs[(i + keys[e.key] + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (!next) return;
    e.preventDefault();
    next.focus();
    go(next.getAttribute('aria-controls'));
  });
});

document.querySelectorAll('[data-tab-link]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    go(link.dataset.tabLink, { focusPanel: true });
  });
});

window.addEventListener('popstate', () => show(location.hash.slice(1)));
show(location.hash.slice(1));


// copy buttons
const announce = document.getElementById('announce');

document.querySelectorAll('[data-copy], [data-copy-from]').forEach(btn => {
  if (!navigator.clipboard) return;
  btn.hidden = false;
  const label = btn.textContent;

  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy || document.getElementById(btn.dataset.copyFrom).value;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = btn.dataset.done;
    } catch {
      btn.textContent = "Couldn't copy, select it instead";
    }
    announce.textContent = btn.textContent;
    clearTimeout(btn.timer);
    btn.timer = setTimeout(() => { btn.textContent = label; }, 2000);
  });
});

document.querySelectorAll('[data-year]').forEach(el => {
  el.textContent = new Date().getFullYear();
});


// sparks off the cursor, like grinding metal
const calm = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const sparkColors = ['#ffd75e', '#ffb03a', '#ff7a1f', '#fff1b8'];
let lastSpark = 0;

document.addEventListener('pointermove', e => {
  if (calm.matches || !finePointer.matches) return;
  const now = performance.now();
  if (now - lastSpark < 40) return;
  lastSpark = now;

  const spark = document.createElement('span');
  spark.className = 'spark';
  spark.style.left = e.clientX + 'px';
  spark.style.top = e.clientY + 'px';
  spark.style.background = sparkColors[Math.floor(Math.random() * sparkColors.length)];
  spark.style.setProperty('--dx', (Math.random() * 24 - 12).toFixed(0) + 'px');
  spark.addEventListener('animationend', () => spark.remove());
  document.body.append(spark);
});
