/**
 * PORTFÓLIO PESSOAL — DAVI KUSUMI
 * script.js — Lógica de Interações, Partículas e Efeitos Visuais
 */

document.addEventListener('DOMContentLoaded', () => {
  // Verificação de preferência de redução de movimento do sistema operacional
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
   * 1. CURSOR PERSONALIZADO EM FORMATO DE SETA (Esther Wong)
   * ========================================================= */
  const customCursor = document.getElementById('custom-cursor');
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let isMouseMoving = false;

  // Interpolação linear para movimento suave do cursor
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Rastreamento do movimento do mouse
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseMoving = true;
  });

  // Loop de atualização da posição do cursor
  function updateCursor() {
    if (customCursor && isMouseMoving) {
      cursorX = lerp(cursorX, mouseX, 0.22);
      cursorY = lerp(cursorY, mouseY, 0.22);
      customCursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    }
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Detecção de elementos interativos para reação do cursor
  const interactiveElements = document.querySelectorAll('[data-interactive="true"], a, button');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-active');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active');
    });
  });

  /* =========================================================
   * 2. CANVAS DE PARTÍCULAS E EXPLOSÃO INICIAL (Junk Branding)
   * ========================================================= */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Configurações do Sistema de Partículas
  const isMobile = window.innerWidth < 768;
  const PARTICLE_COUNT = prefersReducedMotion ? 20 : isMobile ? 45 : 90;
  const particles = [];

  class Particle {
    constructor(x, y, isExplosion = false) {
      this.x = x ?? Math.random() * width;
      this.y = y ?? Math.random() * height;
      this.baseSize = Math.random() * 2.2 + 1;
      this.size = this.baseSize;

      if (isExplosion) {
        // Velocidade radial explosiva
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.friction = 0.94;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.008;
      } else {
        // Movimento orgânico flutuante
        this.vx = (Math.random() - 0.5) * 0.75;
        this.vy = (Math.random() - 0.5) * 0.75;
        this.friction = 1;
        this.alpha = Math.random() * 0.6 + 0.25;
        this.decay = 0;
      }

      this.isExplosion = isExplosion;
      // Variações de cor dentro da paleta oficial (#F8F9FA, #ADB5BD e sutil #52B788)
      const colors = ['#F8F9FA', '#ADB5BD', '#52B788'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      // Física e atrito
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.x += this.vx;
      this.y += this.vy;

      if (this.isExplosion) {
        this.alpha -= this.decay;
      } else {
        // Repulsão suave do cursor do mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        if (dist < maxDist && !prefersReducedMotion) {
          const force = (maxDist - dist) / maxDist;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }

        // Borda infinita / reposicionamento suave
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Inicializa partículas de fundo
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Desenha conexões sutis entre partículas próximas (estética cibersegurança/rede)
  function drawConnections() {
    if (prefersReducedMotion) return;
    const maxDistance = isMobile ? 70 : 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        if (p1.isExplosion || p2.isExplosion) continue;

        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = (1 - dist / maxDistance) * 0.16;
          ctx.strokeStyle = `rgba(173, 181, 189, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  // Loop de Animação do Canvas
  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();

      // Remove partículas de explosão finalizadas
      if (p.isExplosion && p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    drawConnections();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // Disparo da explosão de partículas a partir do centro
  function triggerParticleExplosion(originX, originY) {
    const explosionCount = isMobile ? 60 : 130;
    for (let i = 0; i < explosionCount; i++) {
      particles.push(new Particle(originX, originY, true));
    }
  }

  /* =========================================================
   * 3. INTRODUÇÃO DE NÚMEROS QUE EXPLODEM (Junk Branding)
   * ========================================================= */
  const introOverlay = document.getElementById('intro-overlay');
  const introNumber = document.getElementById('intro-number');

  if (introOverlay && introNumber) {
    const numbersSequence = ['00', '18', '37', '64', '89', '99', '100'];
    let step = 0;

    const interval = setInterval(() => {
      step++;
      if (step < numbersSequence.length) {
        introNumber.textContent = numbersSequence[step];
      } else {
        clearInterval(interval);

        // Explosão de partículas no centro da tela
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        triggerParticleExplosion(centerX, centerY);

        // Ocultação suave da tela de introdução
        introOverlay.classList.add('fade-out');

        setTimeout(() => {
          introOverlay.style.display = 'none';
        }, 800);
      }
    }, 120);
  }

  /* =========================================================
   * 4. INTERAÇÃO TRIDIMENSIONAL DO CUBO COM CLIQUE E ARRASTE (Pilato)
   * ========================================================= */
  function setupDraggableCubes() {
    const cubeScenes = document.querySelectorAll('.cube-scene');

    cubeScenes.forEach((scene) => {
      const cube = scene.querySelector('.cube');
      if (!cube) return;

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let rotX = -18;
      let rotY = 25;
      let velX = 0;
      let velY = 0;
      let autoRotate = true;
      let resumeTimeout = null;

      // Desativa animação CSS pura para controle fluído via JavaScript
      cube.style.animation = 'none';
      cube.style.transition = 'none';

      function updateCubeTransform() {
        cube.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      updateCubeTransform();

      function onPointerStart(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;

        isDragging = true;
        autoRotate = false;
        clearTimeout(resumeTimeout);

        const point = e.touches ? e.touches[0] : e;
        startX = point.clientX;
        startY = point.clientY;
        velX = 0;
        velY = 0;

        document.body.classList.add('is-cube-dragging');
        document.querySelectorAll('.custom-cursor').forEach((c) => c.classList.add('cursor-holding'));

        if (e.cancelable && e.type !== 'touchstart') {
          e.preventDefault();
        }
      }

      function onPointerMove(e) {
        if (!isDragging) return;

        const point = e.touches ? e.touches[0] : e;
        const deltaX = point.clientX - startX;
        const deltaY = point.clientY - startY;

        startX = point.clientX;
        startY = point.clientY;

        const sensitivity = 0.55;
        velX = deltaX * sensitivity;
        velY = -deltaY * sensitivity;

        rotY += velX;
        rotX += velY;

        // Limita a rotação no eixo X para evitar inversão brusca
        rotX = Math.max(-85, Math.min(85, rotX));

        updateCubeTransform();
      }

      function onPointerEnd() {
        if (!isDragging) return;
        isDragging = false;

        document.body.classList.remove('is-cube-dragging');
        document.querySelectorAll('.custom-cursor').forEach((c) => c.classList.remove('cursor-holding'));

        // Retoma suavemente a auto-rotação após inatividade
        resumeTimeout = setTimeout(() => {
          autoRotate = true;
        }, 1500);
      }

      scene.addEventListener('mousedown', onPointerStart);
      scene.addEventListener('touchstart', onPointerStart, { passive: true });

      window.addEventListener('mousemove', onPointerMove);
      window.addEventListener('touchmove', onPointerMove, { passive: true });

      window.addEventListener('mouseup', onPointerEnd);
      window.addEventListener('touchend', onPointerEnd);
      window.addEventListener('touchcancel', onPointerEnd);

      // Loop de animação contínua e física de inércia
      function animateCube() {
        if (!isDragging) {
          if (Math.abs(velX) > 0.02 || Math.abs(velY) > 0.02) {
            rotY += velX;
            rotX += velY;
            rotX = Math.max(-85, Math.min(85, rotX));
            velX *= 0.92;
            velY *= 0.92;
            updateCubeTransform();
          } else if (autoRotate && !prefersReducedMotion) {
            rotY += 0.35;
            if (rotY >= 360) rotY -= 360;
            updateCubeTransform();
          }
        }
        requestAnimationFrame(animateCube);
      }
      requestAnimationFrame(animateCube);
    });
  }

  setupDraggableCubes();

  /* =========================================================
   * 5. MENU FIXO E ATUALIZAÇÃO DE LINKS ATIVOS (Funcionalidade 1)
   * ========================================================= */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('header, section');

  // Adiciona fundo escurecido ao rolar a página
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Identificação da seção atual para marcar o link ativo
    let currentSectionId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });

  /* =========================================================
   * 6. COMPACTAÇÃO DE PARTÍCULAS NOS LINKS (Junk Branding)
   * ========================================================= */
  // Animação onde partículas se espalham e se compactam até formar o texto dos links
  function compactParticlesToElement(targetEl) {
    if (prefersReducedMotion || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const count = 18;
    for (let i = 0; i < count; i++) {
      // Partículas nascem espalhadas ao redor do link e convergem
      const spread = 45;
      const startX = centerX + (Math.random() - 0.5) * spread * 2;
      const startY = centerY + (Math.random() - 0.5) * spread * 2;

      const p = new Particle(startX, startY, true);
      // Direção calculada em direção ao centro do texto (compactação)
      const angle = Math.atan2(centerY - startY, centerX - startX);
      const speed = Math.random() * 3 + 2;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.friction = 0.92;
      p.decay = 0.04;
      p.size = 1.5;
      particles.push(p);
    }
  }

  // Aciona o efeito de compactação nos links ao passar o mouse
  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      compactParticlesToElement(link);
    });
  });

  // Disparo inicial da compactação nos links quando a intro termina
  setTimeout(() => {
    navLinks.forEach((link, idx) => {
      setTimeout(() => {
        compactParticlesToElement(link);
      }, idx * 160);
    });
  }, 1200);

  /* =========================================================
   * 7. REVELAÇÃO SUAVE AO ROLAR A PÁGINA (Reveal on Scroll)
   * ========================================================= */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback caso IntersectionObserver não esteja disponível
    revealElements.forEach((el) => el.classList.add('is-revealed'));
  }

  /* =========================================================
   * 8. ATUALIZAÇÃO DINÂMICA DO CURSOR PARA NOVOS ELEMENTOS
   * ========================================================= */
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-interactive="true"], a, button');
    if (target) {
      document.body.classList.add('cursor-active');
    } else {
      document.body.classList.remove('cursor-active');
    }
  });
});

/* ==========================================================================
   INTERAÇÕES, PARTÍCULAS, CUBO 3D E SCROLL PROGRESSIVO (Vanilla JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // 1. CURSOR PERSONALIZADO (Ref. 1)
  const cursor = document.getElementById('customCursor');
  if (cursor && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    });
  }

  // 2. INTRODUÇÃO: CONTADOR DE NÚMEROS E EXPLOSÃO EM PARTÍCULAS (Ref. 2)
  const introLoader = document.getElementById('introLoader');
  const loaderNumber = document.getElementById('loaderNumber');
  const canvas = document.getElementById('loaderCanvas');

  if (introLoader && loaderNumber && canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let progress = 0;
    let particles = [];

    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 4) + 1;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        explodeParticles();
      }
      loaderNumber.textContent = progress < 10 ? `0${progress}` : progress;
    }, 25);

    function explodeParticles() {
      const total = 90;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      for (let i = 0; i < total; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1,
          alpha: 1
        });
      }

      function animateExplosion() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.02;

          ctx.fillStyle = `rgba(248, 249, 250, ${Math.max(0, p.alpha)})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        particles = particles.filter(p => p.alpha > 0);

        if (particles.length > 0) {
          requestAnimationFrame(animateExplosion);
        } else {
          introLoader.classList.add('is-hidden');
        }
      }
      animateExplosion();
    }
  }

  // 3. ETAPA 3: INTERAÇÃO DO CUBO 3D (Ref. 3 Pilato — gerenciada unificadamente por setupDraggableCubes)

  // PREVIEW DE PARTÍCULAS NOS CARDS DE PROJETOS
  const previewCanvases = document.querySelectorAll('.project-canvas-preview');
  previewCanvases.forEach((previewCanvas) => {
    const pCtx = previewCanvas.getContext('2d');
    let pts = [];

    for (let i = 0; i < 28; i++) {
      pts.push({
        x: Math.random() * previewCanvas.width,
        y: Math.random() * previewCanvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2 + 1
      });
    }

    function renderProjectPreview() {
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            pCtx.strokeStyle = `rgba(173, 181, 189, ${0.15 * (1 - dist / 60)})`;
            pCtx.lineWidth = 0.8;
            pCtx.beginPath();
            pCtx.moveTo(pts[i].x, pts[i].y);
            pCtx.lineTo(pts[j].x, pts[j].y);
            pCtx.stroke();
          }
        }
      }

      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > previewCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > previewCanvas.height) p.vy *= -1;

        pCtx.fillStyle = 'rgba(248, 249, 250, 0.7)';
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        pCtx.fill();
      });

      requestAnimationFrame(renderProjectPreview);
    }
    renderProjectPreview();
  });

  // 4. ETAPA 4: ANIMAÇÕES DE ROLAGEM, PROGRESSO E BREADCRUMB
  const progressBar = document.getElementById('scrollProgressBar');
  const activeLabel = document.getElementById('activeSectionLabel');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progressVal = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progressVal}%`;
    }
  }, { passive: true });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-fade-up, .reveal-scale').forEach(el => {
    revealObserver.observe(el);
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && activeLabel) {
        const id = entry.target.getAttribute('id');
        const labels = {
          'inicio': 'Início',
          'sobre': 'Sobre Mim',
          'projetos': 'Projetos',
          'contato': 'Contato'
        };
        activeLabel.textContent = labels[id] || id;
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => sectionObserver.observe(sec));
});

/* ==========================================================================
   ETAPA 4 — INTERSECTION OBSERVER & CONTROLE DE PROGRESSO DE ROLAGEM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('scrollProgressBar');
  const activeLabel = document.getElementById('activeSectionLabel');
  const sections = document.querySelectorAll('section[id], header[id]');

  // Atualização suave da barra de leitura com requestAnimationFrame
  let ticking = false;

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive: true });

  // Revelação suave de elementos com IntersectionObserver nativo
  const revealElements = document.querySelectorAll('.reveal-fade-up, .reveal-scale, .project-card, .projetos-header');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => {
      el.classList.add('reveal-fade-up');
      revealObserver.observe(el);
    });

    // Monitoramento da seção ativa para o Breadcrumb flutuante
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && activeLabel) {
          const sectionId = entry.target.getAttribute('id');
          const names = {
            'inicio': 'Início',
            'hero': 'Início',
            'sobre': 'Sobre Mim',
            'projetos': 'Projetos',
            'contato': 'Contato'
          };
          activeLabel.textContent = names[sectionId] || sectionId.toUpperCase();
        }
      });
    }, {
      threshold: 0.4
    });

    sections.forEach(sec => sectionObserver.observe(sec));
  } else {
    // Fallback para navegadores legados
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
});
// 5. ETAPA 5: VALIDAÇÃO DO FORMULÁRIO DE CONTATO E FEEDBACK ANIMADO
const form = document.getElementById('contactForm');
const btnSubmit = document.getElementById('btnSubmitForm');
const successCard = document.getElementById('contactSuccessCard');
const btnReset = document.getElementById('btnResetForm');

if (form) {
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const phoneInput = document.getElementById('contactPhone');
  const messageInput = document.getElementById('contactMessage');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  // Formatação amigável automática do telefone ao digitar
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);
      if (val.length > 6) {
        e.target.value = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
      } else if (val.length > 2) {
        e.target.value = `(${val.slice(0, 2)}) ${val.slice(2)}`;
      } else {
        e.target.value = val;
      }
    });
  }

  function validateFields() {
    let isValid = true;

    // Validação do Nome
    if (!nameInput.value.trim()) {
      nameInput.classList.add('is-invalid');
      nameError.textContent = 'Por favor, informe seu nome.';
      isValid = false;
    } else {
      nameInput.classList.remove('is-invalid');
      nameError.textContent = '';
    }

    // Validação do E-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      emailInput.classList.add('is-invalid');
      emailError.textContent = 'Informe um endereço de e-mail válido.';
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      emailError.textContent = '';
    }

    // Validação da Mensagem
    if (!messageInput.value.trim() || messageInput.value.trim().length < 8) {
      messageInput.classList.add('is-invalid');
      messageError.textContent = 'A mensagem deve conter pelo menos 8 caracteres.';
      isValid = false;
    } else {
      messageInput.classList.remove('is-invalid');
      messageError.textContent = '';
    }

    return isValid;
  }

  // Limpa erros ao digitar
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      const err = input.parentElement.querySelector('.form-error-msg');
      if (err) err.textContent = '';
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    // Estado de carregamento simulando envio seguro
    btnSubmit.classList.add('is-loading');
    btnSubmit.querySelector('.btn-submit-text').textContent = 'Enviando...';
    btnSubmit.querySelector('.btn-submit-icon').textContent = '⏳';

    setTimeout(() => {
      btnSubmit.classList.remove('is-loading');
      btnSubmit.querySelector('.btn-submit-text').textContent = 'Enviar Mensagem';
      btnSubmit.querySelector('.btn-submit-icon').textContent = '✉';

      // Exibe o feedback visual de sucesso
      successCard.classList.add('is-visible');
      form.reset();
    }, 1200);
  });

  if (btnReset && successCard) {
    btnReset.addEventListener('click', () => {
      successCard.classList.remove('is-visible');
    });
  }
}