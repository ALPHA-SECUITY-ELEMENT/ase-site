// custom cursor — dot follows instantly, ring trails with easing
(() => {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  });

  const loop = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  };
  loop();

  const hoverables = 'a, button, .pillar, [data-hover]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverables)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverables)) ring.classList.remove('hover');
  });

  window.addEventListener('mousedown', () => ring.classList.add('click'));
  window.addEventListener('mouseup', () => ring.classList.remove('click'));
  window.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  window.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
})();