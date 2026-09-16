// browser-tab title cycler — visible "scrolling text" in the tab
(() => {
  const MESSAGES = [
    'ASE // PMC // OMEGA COMMS // 0ASW-0618 // UNCLASSIFIED',
    'ASE // OPERATIONAL',
    'ASE // PVP ONLY // OLD GUARD REVIVAL',
    'ASE // FIGHT AS ONE',
    'ASE // EST. 2026',
  ];

  let idx = 0;

  const cycle = () => {
    document.title = MESSAGES[idx % MESSAGES.length];
    idx++;
  };

  cycle();
  setInterval(cycle, 3000);
})();
