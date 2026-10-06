(function () {
  const vscode = acquireVsCodeApi();

  // Sizes in CSS pixels (viewport). Pixel 10 values are approximate.
  // status = status bar height in portrait
  const DEVICES = {
    iphone15:       { os: 'ios',     w: 393, h: 852, radius: 55, bezel: 12, cutout: 'island', status: 54 },
    iphone15promax: { os: 'ios',     w: 430, h: 932, radius: 58, bezel: 12, cutout: 'island', status: 54 },
    pixel10:        { os: 'android', w: 412, h: 923, radius: 44, bezel: 10, cutout: 'punch',  status: 40 }
  };

  const $ = (id) => document.getElementById(id);
  const els = {
    device: $('device'), zoom: $('zoom'), url: $('url'), rotate: $('rotate'), scroll: $('scroll'), chrome: $('chrome'),
    reload: $('reload'), size: $('size'), stage: $('stage'), holder: $('holder'),
    frame: $('frame'), screen: $('screen'), view: $('view'), cutout: $('cutout'),
    clock: $('clock'), sysicons: $('sysicons'), hostIos: $('hostIos'), hostAnd: $('hostAnd'), reloadIos: $('reloadIos')
  };

  const defaults = {
    device: 'iphone15', zoom: 'fit', landscape: false, hideScroll: true, chrome: 'dark',
    url: document.body.dataset.defaultUrl
  };
  const state = Object.assign({}, defaults, vscode.getState() || {});

  // ---------- Iconos de la barra de estado ----------
  const BAT = '<svg viewBox="0 0 27 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="9" rx="2" fill="currentColor"/><path d="M24 4.5v4c.9-.3 1.5-1.1 1.5-2s-.6-1.7-1.5-2z" fill="currentColor" opacity=".45"/></svg>';
  const WIFI = '<svg viewBox="0 0 16 12"><path fill="currentColor" d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.5 6.9a6.4 6.4 0 0 1 9 0l-1.4 1.5a4.4 4.4 0 0 0-6.2 0zM1 4.3a10 10 0 0 1 14 0l-1.4 1.5a8 8 0 0 0-11.2 0z"/></svg>';
  const SIGNAL_IOS = '<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="currentColor"/><rect x="10" y="3" width="3" height="9" rx="1" fill="currentColor"/><rect x="15" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>';
  const SIGNAL_AND = '<svg viewBox="0 0 14 14"><path fill="currentColor" d="M13 1v12H1z"/></svg>';

  function updateClock() {
    const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    els.clock.textContent = t;
  }

  // ---------- Utilidades ----------
  function normalizeUrl(value) {
    let v = value.trim();
    if (/^\d+$/.test(v)) return 'http://localhost:' + v;
    if (!/^https?:\/\//i.test(v)) v = 'http://' + v;
    return v;
  }

  function hostOf(u) {
    try { return new URL(u).host; } catch (e) { return u; }
  }

  // Mide el ancho real de la barra de scroll con un iframe vacío (estilos por defecto)
  function measureScrollbar() {
    try {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:absolute;visibility:hidden;width:100px;height:100px;border:0';
      document.body.appendChild(f);
      const d = f.contentDocument;
      const box = d.createElement('div');
      box.style.cssText = 'width:100px;height:100px;overflow:scroll';
      (d.body || d.documentElement).appendChild(box);
      const w = box.offsetWidth - box.clientWidth;
      f.remove();
      return w;
    } catch (e) {
      return 15;
    }
  }
  const scrollbarWidth = measureScrollbar();

  function save() { vscode.setState(state); }

  // ---------- Render ----------
  function render() {
    const d = DEVICES[state.device];
    const land = state.landscape;
    const w = land ? d.h : d.w;
    const h = land ? d.w : d.h;
    const outerW = w + d.bezel * 2;
    const outerH = h + d.bezel * 2;

    let scale;
    if (state.zoom === 'fit') {
      scale = Math.min((els.stage.clientWidth - 40) / outerW, (els.stage.clientHeight - 40) / outerH, 1);
      scale = Math.max(scale, 0.2);
    } else {
      scale = Number(state.zoom) / 100;
    }

    els.frame.dataset.device = state.device;
    els.frame.dataset.land = land ? '1' : '0';
    els.frame.style.setProperty('--bezel', d.bezel + 'px');
    els.frame.style.width = outerW + 'px';
    els.frame.style.height = outerH + 'px';
    els.frame.style.borderRadius = d.radius + 'px';
    els.frame.style.transform = 'scale(' + scale + ')';
    els.screen.style.borderRadius = (d.radius - d.bezel + 2) + 'px';

    els.holder.style.width = Math.round(outerW * scale) + 'px';
    els.holder.style.height = Math.round(outerH * scale) + 'px';

    // Browser bars take space, like on a real phone
    const status = land ? 0 : d.status;
    const top = d.os === 'android' ? 56 : 0;
    const bottom = d.os === 'ios' ? (land ? 50 : 130) : (land ? 0 : 24);
    els.screen.dataset.os = d.os;
    els.screen.dataset.land = land ? '1' : '0';
    els.screen.dataset.chrome = state.chrome;
    els.screen.style.setProperty('--status', status + 'px');
    els.screen.style.setProperty('--top', top + 'px');
    els.screen.style.setProperty('--bottom', bottom + 'px');
    els.sysicons.innerHTML = d.os === 'ios' ? SIGNAL_IOS + WIFI + BAT : WIFI + SIGNAL_AND + BAT;

    // iframe más ancho que la pantalla: la barra de scroll queda fuera y se recorta
    const extra = state.hideScroll ? scrollbarWidth : 0;
    els.view.style.width = (w + extra) + 'px';

    els.cutout.className = 'cutout ' + d.cutout + (land ? ' hidden' : '');
    const viewH = h - status - top - bottom;
    els.size.textContent = w + ' × ' + viewH + ' · ' + Math.round(scale * 100) + '%';
    els.chrome.textContent = 'Bars: ' + (state.chrome === 'dark' ? 'dark' : 'light');

    els.device.value = state.device;
    els.zoom.value = state.zoom;
  }

  function load() {
    state.url = normalizeUrl(state.url);
    els.url.value = state.url;
    els.view.src = state.url;
    const host = hostOf(state.url);
    els.hostIos.textContent = host;
    els.hostAnd.textContent = host;
    save();
  }

  function reload() { els.view.src = state.url; }

  // ---------- Eventos ----------
  els.device.addEventListener('change', () => { state.device = els.device.value; save(); render(); });
  els.zoom.addEventListener('change', () => { state.zoom = els.zoom.value; save(); render(); });
  els.rotate.addEventListener('click', () => { state.landscape = !state.landscape; save(); render(); });
  els.scroll.addEventListener('click', () => { state.hideScroll = !state.hideScroll; save(); render(); });
  els.chrome.addEventListener('click', () => { state.chrome = state.chrome === 'dark' ? 'light' : 'dark'; save(); render(); });
  els.reload.addEventListener('click', reload);
  els.reloadIos.addEventListener('click', reload);
  els.url.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { state.url = els.url.value; load(); }
  });

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'reload') reload();
  });
  new ResizeObserver(render).observe(els.stage);

  els.url.value = state.url;
  updateClock();
  setInterval(updateClock, 10000);
  render();
  load();
})();
