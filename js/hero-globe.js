(() => {
  const canvas = document.getElementById('hero-canvas');
  const visual = canvas.closest('.hero-visual');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Geographic texture derived from Natural Earth 1:110m land, v5.1.2 (public domain).
  const map = new Image();
  map.addEventListener('load', setup, { once: true });
  map.src = new URL('../assets/img/hero-globe-map.webp', document.currentScript.src);

  function setup() {
    const size = 384;
    const radius = size / 2;
    const tau = Math.PI * 2;
    const radians = Math.PI / 180;
    const tilt = 18 * radians;
    const roll = 12 * radians;
    const cosTilt = Math.cos(tilt);
    const sinTilt = Math.sin(tilt);
    const cosRoll = Math.cos(roll);
    const sinRoll = Math.sin(roll);

    const texture = document.createElement('canvas');
    const textureContext = texture.getContext('2d');
    texture.width = map.naturalWidth;
    texture.height = map.naturalHeight;
    textureContext.drawImage(map, 0, 0);
    const { width, height } = texture;
    const colors = textureContext.getImageData(0, 0, width, height).data;

    canvas.width = canvas.height = size;
    const image = ctx.createImageData(size, size);
    const pixels = image.data;
    const columns = new Uint16Array(size * size);
    const rows = new Uint32Array(size * size);
    const light = new Uint8Array(size * size);

    // The view stays fixed as the Earth spins, so each screen pixel only changes longitude.
    for (let row = 0, i = 0; row < size; row++) {
      for (let column = 0; column < size; column++, i++) {
        const x = (column + .5 - radius) / radius;
        const y = (radius - row - .5) / radius;
        const depthSquared = 1 - x * x - y * y;
        if (depthSquared <= 0) continue;

        const depth = Math.sqrt(depthSquared);
        const uprightX = x * cosRoll + y * sinRoll;
        const uprightY = y * cosRoll - x * sinRoll;
        const latitude = Math.asin(uprightY * cosTilt + depth * sinTilt);
        const longitude = Math.atan2(uprightX, depth * cosTilt - uprightY * sinTilt);
        columns[i] = Math.floor((longitude / tau + .5) * width) % width;
        rows[i] = Math.min(height - 1, Math.floor((.5 - latitude / Math.PI) * height)) * width;
        light[i] = Math.round(100 + 155 * Math.min(1, Math.max(0, depth * .87 - x * .22 + y * .19)));
        pixels[i * 4 + 3] = 255;
      }
    }

    const markers = [
      [39, -77, true], [37, -121], [19, -99], [50, -101], [46, -64], [9, -80],
      [-23, -46], [51, -1], [60, 24], [32, -7], [30, 31], [6, 4], [-32, 19],
      [25, 55], [20, 78, true], [40, 117], [35, 139], [-7, 107], [-34, 151]
    ];

    let longitude = -38 * radians;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    let pointer = null;
    let pointerX = 0;
    let lastFrame = 0;
    let frame = 0;

    function render(time = 0, pulse = false) {
      const offset = Math.round(((longitude / tau % 1 + 1) % 1) * width);
      for (let i = 0, p = 0; i < light.length; i++, p += 4) {
        if (!light[i]) continue;
        const s = (rows[i] + (columns[i] + offset) % width) * 4;
        pixels[p] = colors[s] * light[i] / 255;
        pixels[p + 1] = colors[s + 1] * light[i] / 255;
        pixels[p + 2] = colors[s + 2] * light[i] / 255;
      }
      ctx.putImageData(image, 0, 0);

      for (const [lat, lon, primary] of markers) {
        const phi = lat * radians;
        const theta = lon * radians - longitude;
        const x = Math.cos(phi) * Math.sin(theta);
        const y = Math.sin(phi);
        const z = Math.cos(phi) * Math.cos(theta);
        const depth = z * cosTilt + y * sinTilt;
        if (depth <= 0) continue;

        const uprightY = y * cosTilt - z * sinTilt;
        const screenX = radius * (1 + x * cosRoll - uprightY * sinRoll);
        const screenY = radius * (1 - x * sinRoll - uprightY * cosRoll);
        const visibility = Math.min(1, depth * 3.5);
        const dot = primary ? 3.4 : 2.1;
        const wave = pulse ? (time % 2200) / 2200 : .3;

        ctx.globalAlpha = visibility * (primary ? .6 * (1 - wave) : .35);
        ctx.beginPath();
        ctx.arc(screenX, screenY, dot + 2 + (primary ? wave * 8 : 0), 0, tau);
        ctx.strokeStyle = primary ? '#eda35c' : '#c8a94a';
        ctx.stroke();
        ctx.globalAlpha = visibility;
        ctx.beginPath();
        ctx.arc(screenX, screenY, dot, 0, tau);
        ctx.fillStyle = primary ? '#ed9c56' : '#c8a94a';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function animate(time) {
      frame = requestAnimationFrame(animate);
      const elapsed = time - lastFrame;
      if (elapsed < 31) return;
      if (lastFrame && pointer === null) longitude += Math.min(elapsed, 100) * .000058;
      lastFrame = time;
      render(time, true);
    }

    function syncMotion() {
      const running = !preference.matches && inView && !document.hidden;
      visual.dataset.motion = running ? 'on' : 'off';
      if (running && !frame) {
        lastFrame = 0;
        frame = requestAnimationFrame(animate);
      } else if (!running && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }

    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = event.pointerId;
      pointerX = event.clientX;
      canvas.setPointerCapture(pointer);
    });
    canvas.addEventListener('pointermove', event => {
      if (event.pointerId !== pointer) return;
      longitude -= (event.clientX - pointerX) * Math.PI / canvas.clientWidth;
      pointerX = event.clientX;
      if (!frame) render();
    });
    canvas.addEventListener('lostpointercapture', () => { pointer = null; });

    preference.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncMotion();
      }).observe(visual);
    }

    render();
    visual.dataset.ready = '';
    syncMotion();
  }
})();
