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
      let res = await fetch(CONTENT_PATH + '?t=' + Date.now());
      if (!res.ok) throw new Error('absolute path failed');
      return await res.json();
    } catch {
      // Fallback: relative path (works when opening local files)
      try {
        let res2 = await fetch('data/content.json?t=' + Date.now());
        if (!res2.ok) throw new Error('relative path failed');
        return await res2.json();
      } catch (e) {
        console.warn('content.json not loaded:', e);
        return null;
      }
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  window.toggleText = function(btn) {
    const p = btn.previousElementSibling;
    if (p.classList.contains('text-truncate')) {
      p.classList.remove('text-truncate');
      btn.textContent = 'See Less';
    } else {
      p.classList.add('text-truncate');
      btn.textContent = 'See More';
    }
  };

  window.startAutoSwap = function() {
    setInterval(() => {
      document.querySelectorAll('.auto-swap-gallery').forEach(gal => {
        const imgs = Array.from(gal.querySelectorAll('img'));
        if (imgs.length > 1) {
          let act = gal.querySelector('img.active');
          if (!act) { imgs[0].classList.add('active'); return; }
          act.classList.remove('active');
          let next = act.nextElementSibling;
          if (!next || next.tagName !== 'IMG') next = imgs[0];
          next.classList.add('active');
        }
      });
    }, 3500);
  };

  function generateImageGallery(p) {
    const imgs = [p.image1, p.image2, p.image3, p.image4, p.image5].filter(Boolean);
    if (imgs.length === 0) return `<div class="project-card-img-placeholder">${categoryEmoji(p.category)}</div>`;
    if (imgs.length === 1) return `<div class="project-img-gallery"><img src="${imgs[0]}" class="project-card-img active" alt="${p.title}" /></div>`;
    return `<div class="project-img-gallery auto-swap-gallery">
              ${imgs.map((src, i) => `<img src="${src}" class="project-card-img ${i === 0 ? 'active' : ''}" alt="${p.title}" />`).join('')}
            </div>`;
  }

  function generateDescription(p) {
    let html = '';
    if (p.description) {
      if (p.description.length <= 110) html += `<p>${p.description}</p>`;
      else html += `<p class="text-truncate">${p.description}</p><button class="see-more-btn" onclick="toggleText(this)">See More</button>`;
    }
    if (p.fbLink) {
      let url = p.fbLink;
      if (url.includes('<iframe')) {
        const match = url.match(/href=([^&"'\s]+)/); // Extract encode URL from plugin iframe
        if (match) url = decodeURIComponent(match[1]);
        else {
          const srcMatch = url.match(/src=["']([^"']+)["']/);
          if (srcMatch) url = srcMatch[1];
        }
      }
      url = url.replace(/^["']|["']$/g, ''); // strip stray quotes
      html += `<div style="margin-top:0.5rem;"><a href="${url}" target="_blank" class="see-more-btn" style="text-decoration:none;">See More Photos</a></div>`;
    }
    return html;
  }

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
    const map = { Education:'📚', Environment:'🌿', Health:'❤️', Community:'🤝', International:'🌍', Culture:'🎨', Sports:'⚽' };
    return map[cat] || '📌';
  }

  // ─── Page Renderers ────────────────────────────────────────────────────────

  window.renderHome = function (data) {
    if (!data) return;
    const c = data.club;
    if (c && c.heroImage) {
      const heroEl = document.getElementById('hero-dynamic-img');
      if (heroEl) heroEl.src = c.heroImage;
    }
    // Group photo caption
    const gtEl = document.getElementById('hero-group-title');
    const gsEl = document.getElementById('hero-group-sub');
    if (gtEl) gtEl.textContent = c.groupTitle || 'Team 2025/2026';
    if (gsEl) gsEl.textContent = c.groupSub   || 'Leading with Pride';
    // Stats
    const nums = document.querySelectorAll('.stat-item .number');
    if (nums[0]) nums[0].dataset.target = c.founded;
    if (nums[1]) { nums[1].dataset.target = c.members || 400; nums[1].dataset.suffix = '+'; }
    if (nums[2]) { nums[2].dataset.target = c.districtAwards || 20; nums[2].dataset.suffix = '+'; }
    if (nums[3]) { nums[3].dataset.target = c.multipleDistrictAwards || 5; nums[3].dataset.suffix = '+'; }
    if (nums[4]) nums[4].dataset.target = (new Date().getFullYear() - parseInt(c.founded));
    if (nums[5]) { nums[5].dataset.target = c.alumni || 300; nums[5].dataset.suffix = '+'; }
    
    // Clear initial text for animation
    nums.forEach(n => n.textContent = '0');
    // About
    const descs = document.querySelectorAll('.about-desc');
    if (descs[0]) descs[0].innerHTML = c.about1.replace('Leo District 306 A2', '<strong style="color:var(--text-main)">Leo District 306 A2</strong>').replace('Leo District 306 D8', '<strong style="color:var(--cyan)">Leo District 306 D8</strong>');
    if (descs[1]) descs[1].innerHTML = c.about2.replace('Most Outstanding School Leo Club', '<strong style="color:var(--gold)">Most Outstanding School Leo Club</strong>');
    
    // Mission & Vision
    const mTitle = document.getElementById('mission-title');
    const mText = document.getElementById('mission-text');
    if (mTitle) mTitle.innerHTML = c.missionTitle || 'Leading The Way <br/><span>For A Better Tomorrow</span>';
    if (mText) mText.innerHTML = c.missionStatement || '';

    // Featured projects (first 3)
    const grid = document.getElementById('featured-projects');
    if (grid && data.projects) {
      const sortedProjects = [...data.projects].reverse().sort((a,b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      grid.innerHTML = sortedProjects.slice(0, 3).map(p => `
        <div class="project-card fade-in">
          ${generateImageGallery(p)}
          <div class="project-card-body">
            <span class="tag">${p.category}</span>
            <h3>${p.title}</h3>
            ${generateDescription(p)}
          </div>
          <div class="project-card-footer">
            <span>${p.year}</span>${statusBadge(p.status)}
          </div>
        </div>`).join('');
      reObserve();
    }
    // Social links
    applySocialLinks(c.socialLinks);

    // Affiliated bodies
    const bodiesGrid = document.getElementById('affiliated-bodies');
    if (bodiesGrid && data.affiliatedBodies) {
      if (data.affiliatedBodies.length > 0) {
        bodiesGrid.innerHTML = data.affiliatedBodies.map(b => {
          const bgStyle = b.bgImage ? `background-image:url('${b.bgImage}');` : '';
          const logoHtml = b.logoImage
            ? `<div class="body-card-logo"><img src="${b.logoImage}" alt="${b.title} logo"/></div>`
            : `<div class="body-card-logo"><span class="body-card-logo-placeholder">🏛️</span></div>`;
          return `
          <div class="body-card fade-in" onclick="this.classList.toggle('expanded')">
            <div class="body-card-bg" style="${bgStyle}"></div>
            <div class="body-card-overlay"></div>
            <div class="body-card-content">
              <div class="body-card-label">${b.label || 'Governing Body'}</div>
              <div class="body-card-title">${b.title}</div>
              <div class="body-card-desc">${b.description}</div>
            </div>
            ${logoHtml}
          </div>`;
        }).join('');
        reObserve();
      } else {
        bodiesGrid.innerHTML = '';
      }
    }

    // ── News Ticker ──
    const ticker = document.getElementById('ticker-inner');
    if (ticker && data.latestNews && data.latestNews.length) {
      const items = data.latestNews.map(n =>
        `<span class="ticker-item"><span class="ticker-dot"></span>${n.text}</span>`
      ).join('');
      // Duplicate for seamless loop
      ticker.innerHTML = items + items;
      // Set animation duration based on item count (40s per 5 items)
      const dur = Math.max(20, data.latestNews.length * 8);
      ticker.style.animationDuration = dur + 's';
    }
  };

  window.renderProjects = function (data) {
    if (!data) return;
    const container = document.getElementById('projects-grid');
    if (!container) return;

    // Group projects by year (reversed to put newest first inside the block)
    const byYear = {};
    if (data.projects) {
      // Loop with sorted array to guarantee absolute newest is first in category
      const sortedProjects = [...data.projects].reverse().sort((a,b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      sortedProjects.forEach(p => {
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
          ${generateImageGallery(p)}
          <div class="project-card-body">
            <span class="tag">${p.category}</span>
            <h3>${p.title}</h3>
            ${generateDescription(p)}
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
    const sections = { president:'exec-president', vp:'exec-vp', secretariat:'exec-secretariat', treasury:'exec-treasury', directors:'exec-directors', staffadvisor:'exec-staffadvisor', advisor:'exec-advisor' };
    Object.entries(sections).forEach(([key, id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const members = data.executive.filter(m => m.section === key);
      
      el.innerHTML = members.map(m => {
        if (key === 'president') {
          // Special large card for the President
          return `
          <div class="president-card fade-in">
            <div class="president-avatar" style="${m.photo ? `background-image:url('${m.photo}');background-size:cover;background-position:center;color:transparent;` : ''}">
              ${m.photo ? '' : initials(m.name)}
            </div>
            <div class="president-info">
              <div class="role-tag">👑 ${m.role}</div>
              <h2>${m.name}</h2>
              <div class="sub">Centennial Leo Club of Richmond College</div>
              <p>${m.description || 'Leading the club with pride and excellence.'}</p>
            </div>
          </div>`;


        }

        // Standard mini cards for other members
        return `
        <div class="exec-mini fade-in">
          <div class="avatar" style="${m.photo ? `background-image:url('${m.photo}');background-size:cover;background-position:center;color:transparent;` : ''}">
            ${m.photo ? '' : initials(m.name)}
          </div>
          <div class="role">${m.role}</div>
          <h4>${m.name}</h4>
        </div>`;
      }).join('');
    });
    reObserve();
    applySocialLinks(data.club.socialLinks);
  };

  window.renderPresidentialHistory = function(data) {
    const grid = document.getElementById('presidential-history-grid');
    if (!grid || !data.presidentialHistory) return;
    const colorMap = { gold: 'aw-gold', cyan: 'aw-cyan', maroon: 'aw-maroon' };
    const total = data.presidentialHistory.length;
    const titleEl = document.getElementById('ph-section-title');
    if (titleEl) titleEl.textContent = `Presidential Legacy – ${total} Generations (2016 – Present)`;
    grid.innerHTML = data.presidentialHistory.map(p => {
      const noteHtml = p.note ? `<span style="font-size:0.75rem; color:var(--gold);">★ <em>${p.note}</em></span>` : '';
      const awardsHtml = (p.awards || []).map(a => `<span class="gen-award ${colorMap[a.color] || 'aw-cyan'}">${a.text}</span>`).join('');
      const photoHtml = p.photo 
        ? `<img src="${p.photo}" class="gen-photo" alt="${p.name}" />` 
        : `<div class="gen-photo-placeholder">${initials(p.name)}</div>`;
      
      return `
      <div class="gen-item">
        <div class="gen-year">${p.year}<br/><span style="font-size:0.65rem; color:var(--text-muted); font-weight:400;">${p.gen}</span></div>
        <div class="gen-details">
          ${photoHtml}
          <div style="flex:1; min-width:0;">
            <div class="gen-name">${p.name} ${noteHtml}</div>
            <div class="gen-awards">${awardsHtml}</div>
          </div>
        </div>
      </div>`;
    }).join('');
    reObserve();
  };

  window.renderNewsletter = function (data) {
    if (!data) return;
    
    const c = data.club;
    if (c) {
      const nt = document.getElementById('nl-page-title');
      const ns = document.getElementById('nl-page-sub');
      const nm = document.getElementById('nl-page-motto');
      if (nt && c.newsletterTitle) nt.textContent = c.newsletterTitle;
      if (ns && c.newsletterSubtitle) ns.textContent = c.newsletterSubtitle;
      if (nm && c.newsletterMotto) nm.textContent = c.newsletterMotto;
    }

    if (!data.newsletter) return;

    const groups = { current: [], past: [], special: [] };
    data.newsletter.forEach((n, i) => {
      const t = n.type || 'current';
      if (groups[t]) groups[t].push({ n, i });
      else groups['current'].push({ n, i });
    });

    function renderGroup(items, gridId, sectionId) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      if (!items.length) {
        grid.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; font-style:italic; padding:1rem 0;">No editions in this section yet. Add them from the Admin Panel.</p>`;
        return;
      }
      grid.innerHTML = items.map(({ n, i }) => {
        const coverHtml = n.coverImage 
          ? `<img src="${n.coverImage}" alt="${n.title}" style="width:100%;height:100%;object-fit:cover;" />`
          : generateBookCover(n.title, n.date);
        return `
        <div class="book-item fade-in">
          <div class="book-wrap ${n.pdfLink ? '' : 'no-link'}" onclick="${n.pdfLink ? `openFlipbook('${n.pdfLink}')` : ''}">
            <div class="book-spine"></div>
            <div class="book-cover">
              ${coverHtml}
            </div>
            <div class="book-back"></div>
          </div>
          <div class="book-info">
            <div class="nl-num">Issue ${String(i + 1).padStart(2, '0')}</div>
            <h3>${n.title}</h3>
            <p>${n.description}</p>
            ${n.pdfLink ? '' : '<span style="color:var(--text-muted);font-size:0.8rem;">PDF coming soon</span>'}
          </div>
        </div>`;
      }).join('');
      reObserve();
    }

    renderGroup(groups.current, 'newsletter-grid-current', 'nl-section-current');
    renderGroup(groups.past,    'newsletter-grid-past',    'nl-section-past');
    renderGroup(groups.special, 'newsletter-grid-special', 'nl-section-special');

    // Fallback: legacy single grid support
    const legacyGrid = document.getElementById('newsletter-grid');
    if (legacyGrid && data.newsletter.length) {
      legacyGrid.innerHTML = '';
    }

    applySocialLinks(data.club.socialLinks);
  };

  window.renderContact = function (data) {
    if (!data) return;
    const c = data.club;
    const safeSetText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const safeSetHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };
    
    safeSetText('contact-email', c.email);
    safeSetHref('contact-email-link', 'mailto:' + c.email);
    
    const wa = (c.whatsapp || '').replace(/\s/g, '').replace(/^\+/, '');
    safeSetText('contact-whatsapp', c.whatsapp || '+94 76 808 6721');
    safeSetHref('contact-whatsapp-link', 'https://wa.me/' + wa);
    
    safeSetText('contact-pres-name', c.presidentName || 'Leo Mevinu Gamage');
    safeSetText('contact-pres-phone', c.presidentPhone || '+94 70 163 6086');
    const presWA = (c.presidentPhone || '').replace(/\s/g, '').replace(/^\+/, '');
    safeSetHref('contact-pres-link', 'https://wa.me/' + presWA);
    
    safeSetText('contact-sec-name', c.secretaryName || 'Leo Minuda Kalansooriya');
    safeSetText('contact-sec-phone', c.secretaryPhone || '+94 76 419 3485');
    const secWA = (c.secretaryPhone || '').replace(/\s/g, '').replace(/^\+/, '');
    safeSetHref('contact-sec-link', 'https://wa.me/' + secWA);
    
    applySocialLinks(c.socialLinks);
  };

  /**
   * Dynamically renders footer "Club" links based on Governing Bodies.
   */
  window.renderFooter = function (data) {
    if (!data) return;
    const list = document.getElementById('footer-club-links');
    if (!list) return;
    
    let html = `
      <li><a href="https://www.lionsclubs.org/en/discover-our-clubs/about-leos" target="_blank">About Leo Clubs</a></li>
      <li><a href="https://www.lionsclubs.org/en/resources/for-members/lions-international-calendar" target="_blank">Lions International</a></li>
      <li><a href="https://kanchu12345.github.io/richman/" target="_blank">Leo District 306 D8</a></li>
      <li><a href="https://www.richmondcollege.lk/" target="_blank">Richmond College</a></li>
    `;
    
    // Add links from Governing Bodies (Governing Bodies of the club)
    if (data.affiliatedBodies && data.affiliatedBodies.length) {
      data.affiliatedBodies.forEach(b => {
        const href = b.link && b.link !== '#' ? b.link : '#';
        const target = href !== '#' ? 'target="_blank"' : '';
        html += `<li><a href="${href}" ${target}>${b.title}</a></li>`;
      });
    }
    list.innerHTML = html;
  };

  function generateBookCover(title, date) {
    // Generate a beautiful programmatic cover
    return `
      <div class="auto-cover">
        <div class="club-tag">Centennial Leo Club of Richmond College</div>
        <div class="book-title">${title || 'Newsletter Edition'}</div>
        <div>
          <div class="book-date">${date || ''}</div>
          <img src="image/logo.jpg.jpeg" class="leo-logo-min" alt="Leo Logo" />
        </div>
      </div>
    `;
  }

  function applySocialLinks(links) {
    if (!links) return;
    const map = { Facebook: links.facebook, Instagram: links.instagram, YouTube: links.youtube, LinkedIn: links.linkedin, X: links.x };
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
    startAutoSwap();
    const data = await loadContent();
    if (data) {
      window.siteContent = data;
      renderFooter(data);
    }
    
    // Auto-detect page and render
    const page = document.body.dataset.page;
    if (page === 'home') {
      renderHome(data);
      initDynamicCounters();
    }
    else if (page === 'projects') renderProjects(data);
    else if (page === 'executive') {
      renderExecutive(data);
      renderPresidentialHistory(data);
    }
    else if (page === 'newsletter') renderNewsletter(data);
    else if (page === 'contact') renderContact(data);

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
