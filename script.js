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
   * 4. INTERAÇÃO TRIDIMENSIONAL DO CUBO (Pilato)
   * ========================================================= */
  const cubeScene = document.getElementById('cube-scene');
  const cube3D = document.getElementById('cube-3d');

  if (cubeScene && cube3D && !prefersReducedMotion) {
    window.addEventListener('mousemove', (e) => {
      // Cálculo de inclinação sutil de acordo com a posição relativa do mouse
      const rect = cubeScene.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Inclinação suave da cena
      cubeScene.style.transform = `rotateX(${-deltaY * 12}deg) rotateY(${deltaX * 16}deg)`;
    });

    cubeScene.addEventListener('mouseleave', () => {
      cubeScene.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  }

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

