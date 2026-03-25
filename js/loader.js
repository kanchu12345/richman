/**
 * Leo Club Website – Content Loader
 * Fetches data/content.json and exposes window.siteContent.
 * Each page calls the render function it needs after DOMContentLoaded.
 */

(function () {
  const CONTENT_PATH = '/data/content.json';

  async function loadContent() {
    try {
      // Try absolute path first (works on server/GitHub Pages)
      let res = await fetch(CONTENT_PATH);
      if (!res.ok) throw new Error('absolute path failed');
      return await res.json();
    } catch {
      // Fallback: relative path (works when opening local files)
      try {
        let res2 = await fetch('data/content.json');
        if (!res2.ok) throw new Error('relative path failed');
        return await res2.json();
      } catch (e) {
        console.warn('content.json not loaded:', e);
        return null;
      }
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function initials(name) {
    return name.replace(/^Leo |^Lion /, '')
      .split(' ').slice(0, 2)
      .map(w => w[0]).join('').toUpperCase();
  }

  function statusBadge(s) {
    if (s === 'Completed') return `<span class="badge badge-cyan">${s}</span>`;
    if (s === 'Ongoing')   return `<span class="badge badge-maroon">${s}</span>`;
    return `<span class="badge badge-gold">${s}</span>`;
  }

  function categoryEmoji(cat) {
    const map = { Education:'📚', Environment:'🌿', Health:'🩸', Community:'🤝', International:'🌍', Culture:'🎨', Sports:'⚽' };
    return map[cat] || '📌';
  }

  // ─── Page Renderers ────────────────────────────────────────────────────────

  window.renderHome = function (data) {
    if (!data) return;
    const c = data.club;
    // Stats
    const nums = document.querySelectorAll('.stat-item .number');
    if (nums[0]) nums[0].dataset.target = c.founded;
    if (nums[1]) nums[1].dataset.target = c.presidentGenerations;
    if (nums[2]) { nums[2].dataset.target = c.districtAwards; nums[2].dataset.suffix = '+'; }
    if (nums[3]) nums[3].dataset.target = (new Date().getFullYear() - parseInt(c.founded));
    
    // Clear initial text for animation
    nums.forEach(n => n.textContent = '0');
    // About
    const descs = document.querySelectorAll('.about-desc');
    if (descs[0]) descs[0].innerHTML = c.about1.replace('Leo District 306 A2', '<strong style="color:var(--text-main)">Leo District 306 A2</strong>').replace('Leo District 306 D8', '<strong style="color:var(--cyan)">Leo District 306 D8</strong>');
    if (descs[1]) descs[1].innerHTML = c.about2.replace('Most Outstanding School Leo Club', '<strong style="color:var(--gold)">Most Outstanding School Leo Club</strong>');
    // Featured projects (first 3)
    const grid = document.getElementById('featured-projects');
    if (grid && data.projects) {
      grid.innerHTML = data.projects.slice(0, 3).map(p => `
        <div class="project-card fade-in">
          ${p.image1
            ? `<img src="${p.image1}" class="project-card-img" alt="${p.title}" />`
            : `<div class="project-card-img-placeholder">${categoryEmoji(p.category)}</div>`}
          <div class="project-card-body">
            <span class="tag">${p.category}</span>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
          </div>
          <div class="project-card-footer">
            <span>${p.year}</span>${statusBadge(p.status)}
          </div>
        </div>`).join('');
      reObserve();
    }
    // Social links
    applySocialLinks(c.socialLinks);
  };

  window.renderProjects = function (data) {
    if (!data) return;
    const container = document.getElementById('projects-grid');
    if (!container) return;

    // Group projects by year
    const byYear = {};
    if (data.projects) {
      data.projects.forEach(p => {
        const y = p.year || 'Unknown';
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(p);
      });
    }

    const years = Object.keys(byYear).sort((a,b) => b.localeCompare(a));
    const currentYear = new Date().getFullYear().toString();

    let html = '';
    years.forEach(y => {
      const badge = y === currentYear ? `<span class="year-badge">Current Year</span>` : '';
      html += `<div class="project-year-header">${y} ${badge}</div>`;
      html += `<div class="grid-3">`;
      html += byYear[y].map(p => `
        <div class="project-card fade-in" data-cat="${p.category}">
          ${p.image1
            ? `<div class="project-img-gallery">
                 <img src="${p.image1}" class="project-card-img" alt="${p.title}" />
                 ${p.image2 ? `<img src="${p.image2}" class="project-card-img proj-img2" alt="${p.title} 2" />` : ''}
               </div>`
            : `<div class="project-card-img-placeholder">${categoryEmoji(p.category)}</div>`}
          <div class="project-card-body">
            <span class="tag">${p.category}</span>
            <h3>${p.title}</h3>
            <p>${p.description}</p>
          </div>
          <div class="project-card-footer">
            <span>${p.year}</span>${statusBadge(p.status)}
          </div>
        </div>`).join('');
      html += `</div>`;
    });

    container.innerHTML = html || '<div class="empty-state">No projects yet.</div>';
    reObserve();
    applySocialLinks(data.club.socialLinks);
  };

  window.renderExecutive = function (data) {
    if (!data) return;
    const sections = { advisor:'exec-advisor', president:'exec-president', vp:'exec-vp', secretariat:'exec-secretariat', treasury:'exec-treasury', directors:'exec-directors' };
    Object.entries(sections).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const members = data.executive.filter(m => m.section === key);
      el.innerHTML = members.map(m => `
        <div class="exec-mini fade-in">
          <div class="avatar" style="${m.photo ? `background-image:url('${m.photo}');background-size:cover;background-position:center;color:transparent;` : ''}">
            ${m.photo ? '' : initials(m.name)}
          </div>
          <div class="role">${m.role}</div>
          <h4>${m.name}</h4>
        </div>`).join('');
    });
    reObserve();
    applySocialLinks(data.club.socialLinks);
  };

  window.renderNewsletter = function (data) {
    if (!data) return;
    const grid = document.getElementById('newsletter-grid');
    if (grid && data.newsletter) {
      grid.innerHTML = data.newsletter.map((n, i) => `
        <div class="nl-card fade-in">
          <div class="nl-num">Issue ${String(i + 1).padStart(2, '0')}</div>
          <h3>${n.title}</h3>
          <div class="nl-date">${n.date}</div>
          <p>${n.description}</p>
          ${n.pdfLink ? `<a href="${n.pdfLink}" target="_blank" class="btn-outline" style="font-size:0.8rem;padding:0.5rem 1.2rem;margin-top:1rem;">📄 Read Issue</a>` : ''}
        </div>`).join('');
      reObserve();
    }
    applySocialLinks(data.club.socialLinks);
  };

  function applySocialLinks(links) {
    if (!links) return;
    const map = { Facebook: links.facebook, Instagram: links.instagram, YouTube: links.youtube, LinkedIn: links.linkedin };
    document.querySelectorAll('.social-btn[title], .social-link-card[title]').forEach(a => {
      const url = map[a.title];
      if (url && url !== '#') a.href = url;
    });
  }

  function reObserve() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => obs.observe(el));
  }

  function initDynamicCounters() {
    const nums = document.querySelectorAll('.stat-item .number');
    if (!nums.length) return;
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          observer.unobserve(el);
          const target = parseInt(el.dataset.target) || 0;
          const suffix = el.dataset.suffix || '';
          const duration = 2000;
          const frameRate = 1000 / 60;
          const totalFrames = Math.round(duration / frameRate);
          let frame = 0;
          
          let start = 0;
          if (target > 1500) start = target - 50; // for years like 2016
          
          const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const current = Math.floor(start + (target - start) * easeOutQuad(progress));
            el.textContent = current + suffix;
            if (frame === totalFrames) {
              el.textContent = target + suffix;
              clearInterval(counter);
            }
          }, frameRate);
        }
      });
    }, { threshold: 0.5 });
    
    nums.forEach(n => obs.observe(n));
  }

  function easeOutQuad(t) { return t * (2 - t); }

  function removePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('hidden');
        setTimeout(() => preloader.remove(), 600);
      }, 300); // minimum showing time
    }
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadContent();
    if (data) window.siteContent = data;
    
    // Auto-detect page and render
    const page = document.body.dataset.page;
    if (page === 'home') {
      renderHome(data);
      initDynamicCounters();
    }
    else if (page === 'projects') renderProjects(data);
    else if (page === 'executive') renderExecutive(data);
    else if (page === 'newsletter') renderNewsletter(data);

    // Wait for everything (images etc) then hide preloader
    if (document.readyState === 'complete') {
      removePreloader();
    } else {
      window.addEventListener('load', removePreloader);
    }
    // Safety fallback just in case
    setTimeout(removePreloader, 3000);
  });
})();
