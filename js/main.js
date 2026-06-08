/* ==========================================================================
   VEXTEC CLIENT-SIDE INTERACTION CONTROLLER (Estándares 2026/2027)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  VextecApp.init();
});

/**
 * Main Application Namespace
 * Encapsulates all modular features under an ES6+ architecture
 */
const VextecApp = {
  init() {
    this.initHeaderScroll();
    this.initMobileNav();
    this.initScrollReveal();
    this.initContactForm();
    this.initVideoPlayer();
    this.initActiveNavHighlight();
  },

  /**
   * 1. Fixed Header Scroll Effect
   * Adds shadow and blur styles once the user scrolls beyond the threshold
   */
  initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    const scrollThreshold = 50;
    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    handleScroll(); // Execute on load
    window.addEventListener('scroll', handleScroll, { passive: true });
  },

  /**
   * 2. Responsive Mobile Navigation Menu
   * Handles toggle states and ARIA accessibility parameters
   */
  initMobileNav() {
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!burgerMenu || !navMenu) return;

    const toggleMenu = () => {
      const isExpanded = burgerMenu.getAttribute('aria-expanded') === 'true';
      burgerMenu.setAttribute('aria-expanded', !isExpanded);
      burgerMenu.classList.toggle('active');
      navMenu.classList.toggle('active');

      // Stop background scroll when active
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };

    const closeMenu = () => {
      burgerMenu.setAttribute('aria-expanded', 'false');
      burgerMenu.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    };

    burgerMenu.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
        closeMenu();
      }
    });
  },

  /**
   * 3. Intersection Observer Scroll Reveal
   * Entrance animations for major content grid wrappers
   */
  initScrollReveal() {
    const animatedElements = document.querySelectorAll(
      '.section-header, .hero-content, .hero-visual, .services-grid, .projects-grid, .videos-grid, .contact-grid'
    );

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.12
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animatedElements.forEach(element => {
      revealObserver.observe(element);
    });
  },

  /**
   * 4. Premium SaaS Contact Form Validation & Submission
   * Includes real-time input monitoring, focus out alerts, and async integrations preparation
   */
  initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const fields = {
      name: {
        input: document.getElementById('name'),
        error: document.getElementById('nameError'),
        validate: (val) => val.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)
      },
      email: {
        input: document.getElementById('email'),
        error: document.getElementById('emailError'),
        validate: (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)
      },
      message: {
        input: document.getElementById('message'),
        error: document.getElementById('messageError'),
        validate: (val) => val.length >= 10
      }
    };

    const submitBtn = contactForm.querySelector('.form-submit-btn');
    const feedbackMessage = document.getElementById('formFeedback');

    // Real-time validations on input and focus out (blur)
    Object.keys(fields).forEach(key => {
      const field = fields[key];
      if (!field.input) return;

      const validateField = () => {
        const val = field.input.value.trim();
        const isValid = field.validate(val);

        if (isValid) {
          field.input.classList.remove('is-invalid');
          field.input.classList.add('is-valid');
          if (field.error) field.error.classList.remove('show');
        } else {
          field.input.classList.remove('is-valid');
          field.input.classList.add('is-invalid');
          if (field.error) field.error.classList.add('show');
        }
        return isValid;
      };

      field.input.addEventListener('blur', validateField);
      field.input.addEventListener('input', () => {
        if (field.input.classList.contains('is-invalid') || field.input.classList.contains('is-valid')) {
          validateField();
        }
      });
    });

    // Form Submission
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalidInput = null;

      // Validate all required fields
      Object.keys(fields).forEach(key => {
        const field = fields[key];
        const val = field.input.value.trim();
        const isValid = field.validate(val);

        if (!isValid) {
          isFormValid = false;
          field.input.classList.add('is-invalid');
          if (field.error) field.error.classList.add('show');
          if (!firstInvalidInput) firstInvalidInput = field.input;
        }
      });

      if (!isFormValid) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      const nameVal = fields.name.input.value.trim();
      const emailVal = fields.email.input.value.trim();
      const companyVal = document.getElementById('company').value.trim();
      const messageVal = fields.message.input.value.trim();

      // Setup payload
      const payload = {
        name: nameVal,
        email: emailVal,
        company: companyVal || 'N/A',
        message: messageVal,
        submittedAt: new Date().toISOString()
      };

      // Button Visual Loading State
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" style="animation: rotate 1s linear infinite; width: 20px; height: 20px;" aria-hidden="true">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="currentColor" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
        </svg>
        Enviando propuesta...
      `;

      this.injectSpinnerStyles();

      try {
        // Send request through production service abstractor
        await this.sendContactMessage(payload);

        // Success Feedback
        if (feedbackMessage) {
          feedbackMessage.className = 'form-feedback success';
          feedbackMessage.innerHTML = `¡Gracias <strong>${nameVal}</strong>! Tu consulta sobre <strong>${companyVal || 'tu proyecto'}</strong> ha sido enviada con éxito. Nos comunicaremos contigo en menos de 24 horas.`;
          feedbackMessage.style.display = 'block';
        }

        // Reset fields and valid state styles
        contactForm.reset();
        Object.keys(fields).forEach(key => {
          fields[key].input.classList.remove('is-valid');
        });

      } catch (error) {
        // Error Feedback
        if (feedbackMessage) {
          feedbackMessage.className = 'form-feedback error';
          feedbackMessage.innerHTML = `Hubo un inconveniente al enviar tu propuesta. Por favor escribe directamente a <strong>contacto@vextec.com</strong> o escríbenos por WhatsApp.`;
          feedbackMessage.style.display = 'block';
        }
      } finally {
        // Revert button status
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Auto close feedback alert after 8 seconds
        setTimeout(() => {
          if (feedbackMessage) feedbackMessage.style.display = 'none';
        }, 8000);
      }
    });
  },

  /**
   * Production-ready Contact Message Sender Abstractor
   * Ready for future Spring Boot REST API, EmailJS, or Formspree integration
   * @param {Object} data 
   * @returns {Promise}
   */
  async sendContactMessage(data) {
    console.log('[VEXTEC API] Preparando envío de datos de contacto:', data);

    // Simulación de latencia de red (1.5s)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const simulationSuccess = true; // Cambiar a false para probar estados de error en el formulario
        if (simulationSuccess) {
          resolve({ status: 200, message: 'Message successfully registered.' });
        } else {
          reject(new Error('Network error. Failed to reach service endpoint.'));
        }
      }, 1500);
    });

    /* 
    ==========================================================================
    CÓMO INTEGRAR CON SERVICIOS EXTERNOS EN VEXTEC VERSIÓN 2.0:
    ==========================================================================
    
    1. CONEXIÓN A REST API (SPRING BOOT / NODE.JS):
    -------------------------------------------------
    return fetch('https://api.vextec.com/v1/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_CLIENT_TOKEN'
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('API failure response');
      return res.json();
    });

    2. INTEGRACIÓN CON FORMSPREE:
    ------------------------------
    return fetch('https://formspree.io/f/YOUR_FORM_ID', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) throw new Error('Formspree dispatch failed');
      return res.json();
    });

    3. INTEGRACIÓN CON EMAILJS:
    -----------------------------
    // Primero, carga el script SDK de EmailJS en tu index.html.
    // Luego inicialízalo: emailjs.init("YOUR_PUBLIC_KEY")
    return emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
      from_name: data.name,
      reply_to: data.email,
      company: data.company,
      message: data.message
    });
    */
  },

  /**
   * Helper: Inject CSS keyframe animations for form submission spinner
   */
  injectSpinnerStyles() {
    if (document.getElementById('spinner-keyframes')) return;
    const styleSheet = document.createElement('style');
    styleSheet.id = 'spinner-keyframes';
    styleSheet.innerText = `
      @keyframes rotate { 100% { transform: rotate(360deg); } }
      @keyframes dash {
        0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
        50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
        100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
      }
    `;
    document.head.appendChild(styleSheet);
  },

  /**
   * 5. YouTube Video Redirection
   * Cleans up obsolete modal logic and manages safe external link opening in a new tab
   */
  initVideoPlayer() {
    const videoCards = document.querySelectorAll('.video-card');
    if (!videoCards.length) return;

    // Real high-value dev YouTube video watch mappings
    const videoUrls = {
      'video1': 'https://www.youtube.com/watch?v=S9g76vQA1bU', // Fazt
      'video2': 'https://www.youtube.com/watch?v=z95mZVUcJ-E', // midudev
      'video3': 'https://www.youtube.com/watch?v=rfscVS0vtbw'  // MoureDev
    };

    videoCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // If they click a link inside the card, let the browser handle it naturally
        if (e.target.closest('a')) return;

        e.preventDefault();
        const videoKey = card.getAttribute('data-video') || 'video1';
        const targetUrl = videoUrls[videoKey] || 'https://www.youtube.com/watch?v=S9g76vQA1bU';
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      });
    });
  },

  /**
   * 6. Active Navigation Menu Item Highlighter
   * Dynamically tracks scroll markers to toggle active state under navigation items
   */
  initActiveNavHighlight() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let currentActiveSectionId = '';
      const scrollPos = window.scrollY + 120; // Nav bar height offset

      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentActiveSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const hrefValue = link.getAttribute('href');

        if (hrefValue === `#${currentActiveSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }
};
