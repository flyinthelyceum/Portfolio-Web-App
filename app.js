/* ============================================
   Portfolio App - Firebase Version
   ============================================ */

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  getDocs
} from 'https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js';

/* ============================================
   Minimal Markdown Parser
   ============================================ */
class MarkdownParser {
  constructor() {
    this.rules = [
      { pattern: /!\[([^\]]*)\]\(([^)]+)\)/g, replacement: '<img src="$2" alt="$1" />' },
      { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: '<a href="$2">$1</a>' },
      { pattern: /^### (.*?)$/gm, replacement: '<h3>$1</h3>' },
      { pattern: /^## (.*?)$/gm, replacement: '<h2>$1</h2>' },
      { pattern: /^# (.*?)$/gm, replacement: '<h1>$1</h1>' },
      { pattern: /\*\*([^*]+)\*\*/g, replacement: '<strong>$1</strong>' },
      { pattern: /__([^_]+)__/g, replacement: '<strong>$1</strong>' },
      { pattern: /\*([^*]+)\*/g, replacement: '<em>$1</em>' },
      { pattern: /_([^_]+)_/g, replacement: '<em>$1</em>' },
      { pattern: /`([^`]+)`/g, replacement: '<code>$1</code>' },
    ];
  }

  parse(markdown) {
    if (!markdown) return '';
    let html = markdown;

    // Apply inline rules
    this.rules.forEach(rule => {
      html = html.replace(rule.pattern, rule.replacement);
    });

    // Parse paragraphs
    html = html.split('\n\n').map(para => {
      if (para.match(/^<h[1-6]>/) || para.match(/^<blockquote>/) || para.match(/^<ul>/) || para.match(/^<ol>/) || para.match(/^<pre>/)) {
        return para;
      }
      if (para.trim().length === 0) return '';
      return `<p>${para}</p>`;
    }).join('\n\n');

    // Parse lists
    html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    // Parse blockquotes
    html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

    return html;
  }
}

/* ============================================
   Portfolio App
   ============================================ */
class PortfolioApp {
  constructor() {
    this.parser = new MarkdownParser();
    this.posts = [];
    this.projects = [];
    this.currentFilter = 'all';
    this.userProfile = null;
    this.userId = null;

    this.init();
  }

  async init() {
    // PROOF OF LIFE
    const buildTime = new Date().toLocaleString();
    console.log('🔥 FIREBASE BUILD v10', buildTime);
    console.log('Timestamp:', new Date().toISOString());
    
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    this.userId = urlParams.get('user');
    
    if (!this.userId) {
      this.showError('No user specified. Add ?user=USER_ID to the URL.');
      return;
    }
    
    console.log('Loading portfolio for user:', this.userId);
    
    await this.loadUserProfile();
    await this.loadPosts();
    this.setupEventListeners();
    this.renderTicker();
    this.renderPortfolio();
    this.updatePageTitle();
  }


  showError(message) {
    const portfolioFeed = document.getElementById('portfolio-feed');
    if (portfolioFeed) {
      portfolioFeed.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: #999;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <div style="font-size: 1.125rem;">${message}</div>
        </div>
      `;
    }
  }

  async loadUserProfile() {
    try {
      const userDoc = await getDoc(doc(db, 'users', this.userId));
      
      if (!userDoc.exists()) {
        this.showError('User not found');
        return;
      }

      this.userProfile = userDoc.data();
      console.log('Loaded user profile:', this.userProfile);
      
      // Update UI with user info
      const displayName = this.userProfile.displayName || this.userProfile.email || 'Portfolio';
      const bio = this.userProfile.bio || 'Exploring art and technology';
      
      document.getElementById('hero-name').textContent = displayName;
      document.getElementById('hero-bio').textContent = bio;
      document.getElementById('footer-name').textContent = displayName;
      document.getElementById('page-title').textContent = `${displayName} — Portfolio`;
      
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.showError('Error loading profile');
    }
  }

  async loadPosts() {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', this.userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Loaded ${allPosts.length} posts`);

      // Separate logs and projects
      this.posts = allPosts.filter(p => p.type === 'log');
      this.projects = allPosts.filter(p => p.type === 'project');

    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('Error loading posts');
    }
  }


  renderTicker() {
    const tickerContent = document.getElementById('ticker-content');
    const tickerClone = document.getElementById('ticker-content-clone');
    
    if (!tickerContent || !tickerClone) return;
    
    let phrases = [];
    let tickerDuration = 60; // Default 60s
    
    const allPosts = [...this.posts, ...this.projects];
    
    if (allPosts.length > 0) {
      // Compute days since last update
      const latestPost = allPosts[0];
      const postDate = latestPost.createdAt?.toDate ? latestPost.createdAt.toDate() : new Date(latestPost.date || Date.now());
      const daysSinceUpdate = Math.floor((Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate ticker from latest 6 posts
      const recentPosts = allPosts.slice(0, 6);
      phrases = recentPosts.map(post => {
        const type = post.type === 'log' ? 'LOG' : 'PROJECT';
        const titleUpper = (post.title || 'UNTITLED').toUpperCase();
        return `${type} · ${titleUpper}`;
      });
      
      // Add temporal marker
      if (daysSinceUpdate === 0) {
        phrases.unshift('LAST UPDATE · TODAY');
      } else if (daysSinceUpdate === 1) {
        phrases.unshift('LAST UPDATE · 1 DAY AGO');
      } else {
        phrases.unshift(`LAST UPDATE · ${daysSinceUpdate} DAYS AGO`);
      }
      
      tickerDuration = allPosts.length >= 10 ? 45 : 60;
    } else {
      // Default studio phrases
      phrases = [
        'DOCUMENT EVERYTHING',
        'FAILURE IS DATA',
        'REVISION IS THE WORK',
        'BUILD / TEST / REBUILD',
        'PROCESS OVER PRODUCT',
        'CONSTRAINT BREEDS CREATIVITY'
      ];
      tickerDuration = 75;
    }
    
    // Set dynamic ticker speed
    document.documentElement.style.setProperty('--ticker-duration', `${tickerDuration}s`);
    
    const tickerText = phrases.join(' · ');
    tickerContent.textContent = tickerText + ' · ';
    tickerClone.textContent = tickerText + ' · ';
  }

  setupEventListeners() {
    // Navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    
    if (navToggle && nav) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('nav--open');
      });
      
      // Close nav when clicking outside
      document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
          nav.classList.remove('nav--open');
        }
      });
    }
    
    // Navigation links
    document.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchSection(link.dataset.section);
        if (nav) nav.classList.remove('nav--open');
      });
    });

    // Filter chips
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
        chip.classList.add('chip--active');
        this.currentFilter = chip.dataset.filter;
        this.renderPortfolio();
      });
    });

    // Modal close
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.modal__close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('modal--active');
        document.body.style.overflow = 'auto';
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('modal--active');
          document.body.style.overflow = 'auto';
        }
      });
    }
  }

  switchSection(sectionName) {
    console.log('Switching to section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
      s.classList.remove('section--active');
      s.style.display = 'none';
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('section--active');
      targetSection.style.display = 'block';
    }

    // Update nav active state
    document.querySelectorAll('.nav__link').forEach(link => {
      link.classList.remove('nav__link--active');
    });
    const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeLink) {
      activeLink.classList.add('nav__link--active');
    }

    // Update URL hash
    window.location.hash = sectionName;

    // Render content
    if (sectionName === 'portfolio') {
      this.renderPortfolio();
    } else if (sectionName === 'projects') {
      this.renderProjects();
    } else if (sectionName === 'about') {
      this.renderAbout();
    }
  }

  renderPortfolio() {
    const feed = document.getElementById('portfolio-feed');
    if (!feed) return;
    
    feed.innerHTML = '';

    const filtered = this.posts.filter(post => {
      if (this.currentFilter === 'all') return true;
      return post.type === this.currentFilter;
    });

    // Update feed meta line
    this.updateFeedMeta(filtered);

    // Show ghost collage if no posts
    if (filtered.length === 0) {
      this.renderGhostCollage(feed);
      return;
    }

    // Compute LOG index for logs (chronological order, oldest = 001)
    const logs = this.posts.filter(p => p.type === 'log').reverse();
    const logIndexMap = new Map();
    logs.forEach((log, index) => {
      logIndexMap.set(log.title + log.date, String(index + 1).padStart(3, '0'));
    });

    // Render posts with rupture class on every 10th card
    filtered.forEach((post, index) => {
      const card = this.createPostCard(post, index, logIndexMap);
      
      // Apply rupture to every 10th visible card (controlled disobedience)
      if ((index + 1) % 10 === 0) {
        card.classList.add('rupture');
      }
      
      feed.appendChild(card);
    });
    
    // Add empty slot plates if posts < 5
    if (filtered.length < 5 && filtered.length > 0) {
      this.injectEmptySlots(feed, filtered.length);
    }
  }

  updateFeedMeta(filtered) {
    const feedMeta = document.getElementById('feed-count');
    if (filtered.length === 0) {
      feedMeta.textContent = 'No posts yet';
      return;
    }

    const latest = filtered[0];
    const latestDate = new Date(latest.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const count = filtered.length;
    const plural = count === 1 ? 'post' : 'posts';
    feedMeta.textContent = `Showing ${count} ${plural} · Latest: ${latestDate}`;
  }

  injectEmptySlots(feed, postCount) {
    // Inject 2-3 empty slot plates when posts < 5
    const slotMessages = [
      { label: 'EMPTY SLOT', message: 'Post something small' },
      { label: 'UNRECORDED DAY', message: 'Add a log' },
      { label: 'ABSENCE IS ALSO INFORMATION', message: '' }
    ];
    
    const slotsToAdd = Math.min(3, 5 - postCount);
    const existingCards = Array.from(feed.children);
    
    for (let i = 0; i < slotsToAdd; i++) {
      const slot = document.createElement('div');
      slot.className = 'empty-slot';
      
      const msg = slotMessages[i % slotMessages.length];
      
      const label = document.createElement('div');
      label.className = 'empty-slot__label';
      label.textContent = msg.label;
      slot.appendChild(label);
      
      if (msg.message) {
        const message = document.createElement('div');
        message.className = 'empty-slot__message';
        message.textContent = msg.message;
        slot.appendChild(message);
      }
      
      // Interleave: insert after every 2nd card, or append if not enough cards
      const insertIndex = Math.min((i + 1) * 2, existingCards.length);
      if (insertIndex < existingCards.length) {
        feed.insertBefore(slot, existingCards[insertIndex]);
      } else {
        feed.appendChild(slot);
      }
    }
  }

  renderGhostCollage(feed) {
    const labels = ['LOG', 'IMAGE', 'FAILED ATTEMPT', 'REVISION', 'NOTE', 'TEST PRINT', 'SKETCH', 'PROCESS', 'ITERATION'];
    
    // Intentional absence plates (3-4 of them)
    const absenceLabels = [
      'NO ENTRY FOR THIS DAY',
      'DOCUMENTATION FAILED',
      'PROCESS UNRECORDED',
      'MATERIAL LOST'
    ];
    
    for (let i = 0; i < 9; i++) {
      const ghost = document.createElement('div');
      
      // Make 4 plates "absence" plates
      const isAbsence = i < 4;
      ghost.className = isAbsence ? 'ghost-plate ghost-plate--absence' : 'ghost-plate';
      
      const label = document.createElement('div');
      label.className = 'ghost-plate__label';
      label.textContent = isAbsence ? absenceLabels[i] : labels[i];
      ghost.appendChild(label);
      
      // Alternate between 3-up blocks and wide blocks
      if (i % 3 === 0) {
        const wideBlock = document.createElement('div');
        wideBlock.className = 'ghost-plate__block ghost-plate__block--wide';
        ghost.appendChild(wideBlock);
      } else {
        const blocks = document.createElement('div');
        blocks.className = 'ghost-plate__blocks';
        for (let j = 0; j < 3; j++) {
          const block = document.createElement('div');
          block.className = 'ghost-plate__block';
          blocks.appendChild(block);
        }
        ghost.appendChild(blocks);
      }
      
      if (i % 2 === 0) {
        const rule = document.createElement('div');
        rule.className = 'ghost-plate__rule';
        ghost.appendChild(rule);
      }
      
      feed.appendChild(ghost);
    }
  }

  createPostCard(post, index, logIndexMap) {
    const card = document.createElement('div');
    card.className = post.type === 'log' ? 'card card--log' : 'card card--project';

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    if (post.type === 'log') {
      // LOG INDEX
      const logIndex = logIndexMap.get(post.title + post.date) || '000';
      const indexEl = document.createElement('div');
      indexEl.className = 'card__log-index';
      indexEl.textContent = `LOG ${logIndex}`;
      card.appendChild(indexEl);

      const dateEl = document.createElement('div');
      dateEl.className = 'card__date';
      dateEl.textContent = formattedDate;
      card.appendChild(dateEl);

      const titleEl = document.createElement('h3');
      titleEl.className = 'card__title';
      titleEl.textContent = post.title;
      card.appendChild(titleEl);

      // Create 3-up or 2-up image gallery
      if (post.gallery_images && post.gallery_images.length > 0) {
        const imagesContainer = document.createElement('div');
        imagesContainer.className = 'card__images';

        const imageCount = Math.min(post.gallery_images.length, 3);
        post.gallery_images.slice(0, imageCount).forEach(imgUrl => {
          const img = document.createElement('img');
          img.className = 'card__image';
          img.src = imgUrl;
          img.alt = post.title;
          imagesContainer.appendChild(img);
        });

        card.appendChild(imagesContainer);
      }

      // "What changed" - first sentence of excerpt
      const excerptEl = document.createElement('p');
      excerptEl.className = 'card__excerpt';
      const firstSentence = (post.summary || post.body).split('.')[0] + '.';
      excerptEl.textContent = firstSentence;
      card.appendChild(excerptEl);

      // "Next step" from frontmatter if present
      if (post.next_step) {
        const nextStepEl = document.createElement('div');
        nextStepEl.className = 'card__next-step';
        nextStepEl.innerHTML = `<span class="card__next-step-label">Next:</span> ${post.next_step}`;
        card.appendChild(nextStepEl);
      }
    } else {
      // PROJECT CARD
      // Project tag if project number exists
      if (post.project && post.project.length > 0) {
        const projectTag = document.createElement('div');
        projectTag.className = 'card__project-tag';
        projectTag.textContent = `PROJECT ${String(post.project[0]).padStart(2, '0')}`;
        card.appendChild(projectTag);
      }

      const dateEl = document.createElement('div');
      dateEl.className = 'card__date';
      dateEl.textContent = formattedDate;
      card.appendChild(dateEl);

      const titleEl = document.createElement('h3');
      titleEl.className = 'card__title';
      titleEl.textContent = post.title;
      card.appendChild(titleEl);

      // Featured image
      if (post.featured_image) {
        const img = document.createElement('img');
        img.className = 'card__featured';
        img.src = post.featured_image;
        img.alt = post.title;
        card.appendChild(img);
      }

      const excerptEl = document.createElement('p');
      excerptEl.className = 'card__excerpt';
      excerptEl.textContent = post.summary || post.body.substring(0, 150);
      card.appendChild(excerptEl);
    }

    card.addEventListener('click', () => {
      this.openPostModal(post);
    });

    return card;
  }

  openPostModal(post) {
    const modal = document.getElementById('modal');
    const article = document.getElementById('modal-article');

    let html = `<h1 class="modal__title">${post.title}</h1>`;

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    html += `<p class="modal__meta">${formattedDate}</p>`;

    if (post.featured_image) {
      html += `<img src="${post.featured_image}" alt="${post.title}" class="modal__hero-image" />`;
    }

    if (post.tags && post.tags.length > 0) {
      html += `<div class="modal__tags"><span class="modal__tag">Tags: ${post.tags.join(', ')}</span></div>`;
    }

    html += `<div class="modal__body">${this.parser.parse(post.body)}</div>`;

    article.innerHTML = html;
    modal.classList.add('modal--active');
    document.body.style.overflow = 'hidden';
  }

  renderProjects() {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    this.projects.forEach((project) => {
      const card = document.createElement('div');
      card.className = 'project-card';

      if (project.hero_image) {
        const img = document.createElement('img');
        img.className = 'project-card__image';
        img.src = project.hero_image;
        img.alt = project.title;
        card.appendChild(img);
      }

      const body = document.createElement('div');
      body.className = 'project-card__body';

      const title = document.createElement('h3');
      title.className = 'project-card__title';
      title.textContent = project.title;
      body.appendChild(title);

      const summary = document.createElement('p');
      summary.className = 'project-card__summary';
      summary.textContent = project.summary || project.body.substring(0, 100);
      body.appendChild(summary);

      card.appendChild(body);

      card.addEventListener('click', () => {
        this.openProjectModal(project);
      });

      grid.appendChild(card);
    });
  }

  renderAbout() {
    const aboutContent = document.getElementById('about-content');
    if (!aboutContent) return;
    
    aboutContent.innerHTML = `
      <p>${this.userProfile?.bio || 'Student portfolio'}</p>
    `;
  }

  updatePageTitle() {
    const displayName = this.userProfile?.displayName || 'Portfolio';
    document.title = `${displayName} — Portfolio`;
  }
}

// Initialize app
new PortfolioApp();

