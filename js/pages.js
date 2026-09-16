// page-specific behavior — dispatched by body[data-page]
(() => {
  const page = document.body.dataset.page;

  // ============ ROLES ============
  if (page === 'roles') {
    const roles = [
      { num:'01', icon:'🪖', title:'RIFLEMAN', desc:'The backbone of the element. Supports the team and engages enemy forces.', tags:['CORE','ENTRY'] },
      { num:'02', icon:'🔫', title:'AUTOMATIC RIFLEMAN', desc:'Provides suppressive fire and supports team movement.', tags:['SUPPRESSION','FIRE SUPPORT'] },
      { num:'03', icon:'🎯', title:'MARKSMAN', desc:'Provides precision fire and battlefield observation.', tags:['PRECISION','OBSERVATION'] },
      { num:'04', icon:'🩺', title:'COMBAT MEDIC', desc:'Keeps the team operational by treating and recovering wounded members.', tags:['MEDICAL','SUPPORT'] },
      { num:'05', icon:'📡', title:'COMMS / RADIO', desc:'Maintains communication and relays important battlefield information.', tags:['SIGNALS','RELAY'] },
      { num:'06', icon:'🧭', title:'RECON', desc:'Scouts enemy positions and reports movement and activity.', tags:['INTEL','STEALTH'] },
      { num:'07', icon:'🚙', title:'VEHICLE / CREW', desc:'Operates transports, armored vehicles, and vehicle-mounted weapons.', tags:['MOBILITY','FIREPOWER'] },
    ];
    const grid = document.getElementById('roles-grid');
    if (grid) {
      grid.innerHTML = roles.map(r => `
        <article class="role-card" data-tilt>
          <span class="glow"></span>
          <span class="role-num">${r.num}</span>
          <div class="role-icon">${r.icon}</div>
          <h3 class="role-title">${r.title}</h3>
          <p class="role-desc">${r.desc}</p>
          <div class="role-tags">${r.tags.map(t => `<span>${t}</span>`).join('')}</div>
        </article>
      `).join('');

      grid.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateZ(20px)`;
        });
        card.addEventListener('mouseleave', () => {
          card.style.transform = '';
        });
      });
    }
  }

  // ============ TRAINING ============
  if (page === 'training') {
    document.querySelectorAll('.training-tier').forEach(tier => {
      const head = tier.querySelector('.tier-head');
      head.addEventListener('click', () => {
        const open = tier.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.querySelectorAll('.training-tier').forEach(other => {
          if (other !== tier) {
            other.classList.remove('open');
            other.querySelector('.tier-head').setAttribute('aria-expanded', 'false');
          }
        });
      });
    });
    const first = document.querySelector('.training-tier');
    if (first) {
      first.classList.add('open');
      first.querySelector('.tier-head').setAttribute('aria-expanded', 'true');
    }
  }

  // ============ JOIN ============
  if (page === 'join') {
    const form = document.getElementById('join-form');
    if (!form) return;
    const steps = [...form.querySelectorAll('.fstep')];
    const psteps = [...document.querySelectorAll('.pstep')];
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const bar = document.getElementById('progress-bar');
    const summaryEl = document.getElementById('summary');
    const resultEl = document.getElementById('form-result');
    let current = 0;

    const validateStep = (i) => {
      const fields = [...steps[i].querySelectorAll('input, select, textarea')];
      for (const f of fields) {
        if (!f.checkValidity()) { f.reportValidity(); return false; }
      }
      return true;
    };

    const buildSummary = () => {
      const data = new FormData(form);
      const g = (k) => data.get(k) || '—';
      summaryEl.innerHTML = `
        <div class="row"><span>Callsign</span><strong>${g('callsign')}</strong></div>
        <div class="row"><span>Discord</span><strong>${g('discord')}</strong></div>
        <div class="row"><span>Region</span><strong>${g('tz')}</strong></div>
        <div class="row"><span>Hours</span><strong>${g('hours')}</strong></div>
        <div class="row"><span>Preferred Role</span><strong>${g('role')}</strong></div>
        <div class="row"><span>Availability</span><strong>${g('availability')}</strong></div>
      `;
    };

    const render = () => {
      steps.forEach((s, i) => s.classList.toggle('active', i === current));
      psteps.forEach((s, i) => s.classList.toggle('active', i <= current));
      bar.style.width = ((current + 1) / steps.length * 100) + '%';
      backBtn.disabled = current === 0;
      nextBtn.hidden = current === steps.length - 1;
      submitBtn.hidden = current !== steps.length - 1;
      if (current === steps.length - 1) buildSummary();
    };

    nextBtn.addEventListener('click', () => {
      if (!validateStep(current)) return;
      if (current < steps.length - 1) { current++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });
    backBtn.addEventListener('click', () => {
      if (current > 0) { current--; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(current)) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'TRANSMITTING…';

  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const r = await fetch('https://ase-api.1sfodboot.workers.dev/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error(await r.text().catch(() => 'submission failed'));
    form.querySelectorAll('.fstep, .form-actions').forEach(el => el.hidden = true);
    resultEl.hidden = false;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'SUBMIT APPLICATION';
    alert('Transmission failed: ' + err.message);
  }
});

    render();
  }
})();
