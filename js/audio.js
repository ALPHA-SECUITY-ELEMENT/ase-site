// looping bgm — persistent across pages via sessionStorage
(() => {
  const KEY = 'ase_audio_on';
  const SRC = 'assets/audio/bgm.mp3';

  let audio = document.getElementById('ase-bgm');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'ase-bgm';
    audio.src = SRC;
    audio.loop = true;
    audio.volume = 0.0;
    audio.preload = 'auto';
    document.body.appendChild(audio);
  }

  const btn = document.getElementById('audio-toggle');
  const wantOn = sessionStorage.getItem(KEY) === '1';
  let fadeInterval = null;

  const fadeTo = (target, ms = 1200) => {
    clearInterval(fadeInterval);
    const start = audio.volume;
    const t0 = performance.now();
    fadeInterval = setInterval(() => {
      const p = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = start + (target - start) * p;
      if (p >= 1) clearInterval(fadeInterval);
    }, 30);
  };

  const setUI = on => {
    if (!btn) return;
    btn.classList.toggle('on', on);
    btn.classList.toggle('paused', !on);
  };

  const play = () => {
    audio.volume = 0;
    audio.play().then(() => {
      fadeTo(0.35, 1400);
      setUI(true);
      sessionStorage.setItem(KEY, '1');
    }).catch(() => {
      const once = () => {
        audio.play().then(() => {
          fadeTo(0.35, 1400);
          setUI(true);
          sessionStorage.setItem(KEY, '1');
        });
        window.removeEventListener('pointerdown', once);
        window.removeEventListener('keydown', once);
      };
      window.addEventListener('pointerdown', once, { once: true });
      window.addEventListener('keydown', once, { once: true });
    });
  };

  const pause = () => {
    fadeTo(0, 600);
    setTimeout(() => { audio.pause(); audio.volume = 0; }, 650);
    setUI(false);
    sessionStorage.setItem(KEY, '0');
  };

  if (btn) btn.addEventListener('click', () => {
    if (audio.paused) play(); else pause();
  });

  if (wantOn) {
    setUI(true);
    audio.volume = 0.35;
    audio.play().catch(() => { setUI(false); sessionStorage.setItem(KEY, '0'); });
  } else {
    setUI(false);
  }
})();