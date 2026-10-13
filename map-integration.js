/* Pip-Boy V1.3 — integrate the tested interactive map into the organizer MAP tab.
   All existing Vault data, UI and localStorage save structure remain untouched.
   The original OpenStreetMap iframe stays available as a fallback. */
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const versionLabel = document.querySelector('.subbrand');
  if (versionLabel) versionLabel.textContent = versionLabel.textContent.replace(/V\s*1\.1/, 'V 1.3');
  document.title = document.title.replace('V1.1', 'V1.3');
  const section = $('view-map');
  if (!section || $('map-canvas')) return;
  const panel = section.querySelector('.panel');
  const outer = section.querySelector('.map-outer');
  const oldIframe = $('map-iframe');
  if (!panel || !outer || !oldIframe) return;

  const headTitle = panel.querySelector('h2');
  if (headTitle) headTitle.textContent = 'PIP-BOY NAVIGATION · NIGHT VISION';
  const mainTitle = section.querySelector('h1');
  if (mainTitle) mainTitle.textContent = 'WORLD MAP';
  const hint = $('map-place');
  if (hint) hint.textContent = 'Default map: Chicago area · GPS off';
  const status = $('map-feedback');
  if (status) status.textContent = 'Select any location category to find individual places. Use Live GPS to follow your position. No markers are clustered.';

  // The existing app's Center on Me button has a one-time GPS listener.
  // Replace just that button to avoid making two location requests per click.
  const oldLocate = $('find-me');
  if (oldLocate) {
    const locate = oldLocate.cloneNode(true);
    locate.type = 'button';
    oldLocate.replaceWith(locate);
    locate.addEventListener('click', () => {
      if (window.PipMap) window.PipMap.locateOnce();
      else status.textContent = 'Map resources are still loading; try again shortly.';
    });
  }

  const toolbar = document.createElement('div');
  toolbar.className = 'map-toolbar';
  toolbar.innerHTML = [
    '<div><div class="row spread"><strong>FREQUENT LOCATION SCANS</strong><small id="map-selected-count">0 CATEGORIES</small></div>',
    '<div class="map-category-grid" id="map-common-cats" aria-label="Quick location category buttons"></div></div>',
    '<details id="map-more"><summary>▸ MORE LOCATION CATEGORIES</summary><div class="map-category-grid" id="map-more-cats" aria-label="More location categories"></div></details>',
    '<div class="map-controls-grid">',
    '<div><label for="map-size">ICON SIZE <output id="map-size-value">32 PX</output></label><input id="map-size" type="range" min="22" max="54" step="2" value="32"></div>',
    '<div><label for="map-density">MAX VISIBLE ICONS <output id="map-density-value">45 ICONS</output></label><input id="map-density" type="range" min="10" max="110" step="5" value="45"></div>',
    '<div><label for="map-visibility">ICON ZOOM VISIBILITY <output id="map-visibility-value">ZOOM 9+</output></label><input id="map-visibility" type="range" min="6" max="15" step="1" value="9"></div>',
    '</div>',
    '<div class="map-action-row">',
    '<button class="btn mini" id="map-refresh" type="button">↻ REFRESH PLACES</button>',
    '<button class="btn mini" id="map-track" type="button" aria-pressed="false">▶ LIVE GPS</button>',
    '<button class="btn mini" id="map-follow" type="button" aria-pressed="true">⌖ FOLLOW ME</button>',
    '<button class="btn mini" id="map-stop" type="button">■ STOP GPS</button>',
    '</div>',
    '<div class="row spread"><small id="map-place-count">SELECT A CATEGORY</small><small id="map-track-status">GPS OFF</small></div>'
  ].join('');
  outer.parentNode.insertBefore(toolbar, outer);

  const canvas = document.createElement('div');
  canvas.id = 'map-canvas';
  canvas.hidden = true;
  canvas.setAttribute('role', 'region');
  canvas.setAttribute('aria-label', 'Interactive green night-vision map');
  outer.insertBefore(canvas, oldIframe);
  oldIframe.hidden = true;
  oldIframe.title = 'Backup OpenStreetMap viewer';

  const oldNotice = section.querySelector('.map-note');
  if (oldNotice) {
    const detail = document.createElement('span');
    detail.textContent = ' · Place data: OpenStreetMap · Directions open in Google Maps · Online connection needed';
    oldNotice.appendChild(detail);
  }

  const key = 'pipboy-map-preferences-v1';
  window.PipMapStore = {
    load: () => {
      try { return JSON.parse(localStorage.getItem(key) || '{}'); }
      catch { return {}; }
    },
    save: pref => {
      try { localStorage.setItem(key, JSON.stringify(pref)); }
      catch { if (status) status.textContent = 'Map settings cannot be saved on this device; the map is still usable.'; }
    }
  };
  window.pipFallbackMap = function () {
    // The original app populates the iframe when the MAP tab opens.
    if (!oldIframe.src) {
      const u = new URL('https://www.openstreetmap.org/export/embed.html');
      u.searchParams.set('bbox', '-87.699,41.844,-87.559,41.914');
      u.searchParams.set('layer', 'mapnik');
      oldIframe.src = u.href;
    }
  };

  function style(url) {
    if (document.querySelector('link[href="' + url + '"]')) return;
    const node = document.createElement('link');
    node.rel = 'stylesheet';
    node.href = url;
    document.head.appendChild(node);
  }
  function script(url) {
    return new Promise((resolve, reject) => {
      const node = document.createElement('script');
      node.src = url;
      node.async = true;
      node.onload = resolve;
      node.onerror = () => reject(new Error('Could not load ' + url));
      document.head.appendChild(node);
    });
  }

  let resources = null;
  function ensureResources() {
    if (!resources) {
      style('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      style('./map-upgrade.css');
      resources = (async () => {
        if (!window.L) await script('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
        if (!window.PipMap) await script('./map-upgrade.js');
        if (!window.PipMap) throw new Error('Map initialization unavailable');
      })();
    }
    return resources;
  }
  function fallback() {
    canvas.hidden = true;
    oldIframe.hidden = false;
    window.pipFallbackMap();
    if (status) status.textContent = 'Enhanced map unavailable. The original OpenStreetMap display is available here instead.';
  }
  async function showMap() {
    if (!section.classList.contains('active')) return;
    try {
      await ensureResources();
      if (!section.classList.contains('active')) return;
      window.PipMap.open();
    } catch (error) {
      console.warn('Pip-Boy map fallback:', error);
      fallback();
    }
  }
  const tab = $('tab-map');
  if (tab) tab.addEventListener('click', () => {
    // Runs after the existing tab switch handler has made the MAP view visible.
    showMap();
  });
  if (section.classList.contains('active')) showMap();
})();