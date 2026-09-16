// live Discord stats — pulls guild widget data from the browser
(() => {
  const GUILD_ID = '1531665229493174442';
  const API = `https://discord.com/api/guilds/${GUILD_ID}/widget.json`;

  const onlineEl  = document.getElementById('dc-online');
  const membersEl = document.getElementById('dc-members');
  if (!onlineEl || !membersEl) return;

  const render = (data) => {
    const online = data.presence_count ?? 0;
    const listed = Array.isArray(data.members) ? data.members.length : 0;
    onlineEl.textContent  = online;
    membersEl.textContent = listed >= 99 ? '99+' : listed;
  };

  const tick = () => {
    fetch(API, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(render)
      .catch(() => {
        onlineEl.textContent  = '—';
        membersEl.textContent = '—';
      });
  };

  tick();
  setInterval(tick, 60_000);
})();