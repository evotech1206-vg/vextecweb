/* ==========================================================================
   VEXTEC INVITACIONES FEST - CLIENT-SIDE INTERACTION CONTROLLER (2026/2027)
   This script operates on the invitaciones-fest.html page to isolate logic.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  VextecInvitaciones.init();
});

const VextecInvitaciones = {
  init() {
    this.initTemplateSelector();
    this.initQuotingForm();
    this.initServiceContactTriggers();
  },

  /**
   * 1. Interactive Template Theme Selector
   * Toggles screens inside the mockup phone and updates detailed features text.
   */
  initTemplateSelector() {
    const tabButtons = document.querySelectorAll('.theme-tab-btn');
    const screens = document.querySelectorAll('.template-screen');
    const themeTitle = document.getElementById('selectedThemeTitle');
    const themeDesc = document.getElementById('selectedThemeDesc');
    const themeFeaturesList = document.getElementById('selectedThemeFeatures');

    if (!tabButtons.length || !screens.length) return;

    // Detailed descriptions and features for each template
    const themeDetails = {
      wedding: {
        title: 'Modelo Bodas Premium',
        description: 'Elegancia y distinción para el día más importante de tu vida. Colores sobrios, tipografía clásica y detalles artísticos.',
        features: [
          'Confirmación RSVP directa a WhatsApp y base de datos',
          'Cuenta regresiva en tiempo real',
          'Sección interactiva para Mesa de Regalos / Lluvia de Sobres',
          'Música de fondo elegida por los novios',
          'Mapa dinámico con navegación directa a Google Maps/Waze'
        ]
      },
      birthday: {
        title: 'Modelo Cumpleaños & Fiestas Modernas',
        description: 'Diseño vibrante, dinámico y festivo con animaciones interactivas ideales para cumpleaños, aniversarios y fiestas temáticas.',
        features: [
          'RSVP con selección de menú o intolerancias alimentarias',
          'Galería de fotos integrada de Instagram o carga directa',
          'Código de vestimenta interactivo con imágenes sugeridas',
          'Sección especial para agregar canciones recomendadas por invitados',
          'Integración rápida de calendario (Google Calendar, Apple iCal)'
        ]
      },
      corporate: {
        title: 'Modelo Eventos Corporativos & Lanzamientos',
        description: 'Estética limpia, formal y profesional para conferencias, lanzamientos de productos, galas empresariales y seminarios.',
        features: [
          'Registro de asistentes con código QR único para acreditación',
          'Cronograma del evento interactivo (Agenda por horas)',
          'Perfiles de los expositores / conferencistas con enlaces de LinkedIn',
          'Descarga de material de apoyo en PDF',
          'Formulario integrado para recopilar feedback post-evento'
        ]
      }
    };

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedTheme = btn.getAttribute('data-theme');
        if (!selectedTheme) return;

        // Toggle buttons active class
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Toggle mockup screen active class
        screens.forEach(screen => {
          screen.classList.remove('active');
          if (screen.classList.contains(`temp-${selectedTheme}`)) {
            screen.classList.add('active');
          }
        });

        // Update info panel
        const details = themeDetails[selectedTheme];
        if (details) {
          if (themeTitle) themeTitle.textContent = details.title;
          if (themeDesc) themeDesc.textContent = details.description;
          
          if (themeFeaturesList) {
            themeFeaturesList.innerHTML = '';
            details.features.forEach(feature => {
              const li = document.createElement('li');
              li.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width: 18px; height: 18px; color: #10B981; margin-right: 0.75rem;">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>${feature}</span>
              `;
              li.style.display = 'flex';
              li.style.alignItems = 'center';
              themeFeaturesList.appendChild(li);
            });
          }
        }
      });
    });
  },

  /**
   * 2. Dedicated Event Quoting Form Validation & Submission
   * Handles quoting exclusively for Invitaciones Fest
   */
  initQuotingForm() {
    const invForm = document.getElementById('invForm');
    if (!invForm) return;

    const fields = {
      name: {
        input: document.getElementById('invName'),
        error: document.getElementById('invNameError'),
        validate: (val) => val.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(val)
      },
      email: {
        input: document.getElementById('invEmail'),
        error: document.getElementById('invEmailError'),
        validate: (val) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)
      },
      eventType: {
        input: document.getElementById('invEventType'),
        error: document.getElementById('invEventTypeError'),
        validate: (val) => val !== '' && val !== null
      },
      guests: {
        input: document.getElementById('invGuests'),
        error: document.getElementById('invGuestsError'),
        validate: (val) => parseInt(val, 10) >= 1
      },
      message: {
        input: document.getElementById('invMessage'),
        error: document.getElementById('invMessageError'),
        validate: (val) => val.length >= 10
      }
    };

    const submitBtn = document.getElementById('btnSubmitInvForm');
    const feedbackMessage = document.getElementById('invFormFeedback');

    // Setup input validation bindings
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
      if (field.input.tagName === 'SELECT') {
        field.input.addEventListener('change', validateField);
      }
    });

    // Handle form submit
    invForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let isFormValid = true;
      let firstInvalidInput = null;

      // Validate all fields
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
      const typeVal = fields.eventType.input.value;
      const dateVal = document.getElementById('invDate').value;
      const guestsVal = fields.guests.input.value;
      const messageVal = fields.message.input.value.trim();

      const payload = {
        name: nameVal,
        email: emailVal,
        eventType: typeVal,
        eventDate: dateVal || 'No especificada',
        guestsCount: guestsVal,
        message: messageVal,
        submittedAt: new Date().toISOString()
      };

      // Button Visual Loading State
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" viewBox="0 0 50 50" style="animation: rotate 1s linear infinite; width: 20px; height: 20px; display: inline-block; vertical-align: middle; margin-right: 8px;" aria-hidden="true">
          <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5" stroke="currentColor" stroke-linecap="round" style="stroke-dasharray: 1, 150; stroke-dashoffset: 0; animation: dash 1.5s ease-in-out infinite;"></circle>
        </svg>
        Procesando cotización...
      `;

      try {
        // Send request (independent service simulation)
        console.log('[VEXTEC FEST API] Recibiendo solicitud de cotización exclusiva:', payload);
        
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Success Feedback
        if (feedbackMessage) {
          feedbackMessage.className = 'form-feedback success';
          feedbackMessage.innerHTML = `¡Gracias <strong>${nameVal}</strong>! Tu solicitud para tu <strong>${this.getEventTypeName(typeVal)}</strong> (${guestsVal} invitados) ha sido recibida. Analizaremos los detalles del evento y te enviaremos una propuesta formal en breve.`;
          feedbackMessage.style.display = 'block';
        }

        // Reset Form
        invForm.reset();
        Object.keys(fields).forEach(key => {
          fields[key].input.classList.remove('is-valid');
        });

      } catch (error) {
        if (feedbackMessage) {
          feedbackMessage.className = 'form-feedback error';
          feedbackMessage.innerHTML = `Hubo un inconveniente al enviar tu cotización. Por favor contáctanos por WhatsApp.`;
          feedbackMessage.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Auto close feedback after 8 seconds
        setTimeout(() => {
          if (feedbackMessage) feedbackMessage.style.display = 'none';
        }, 8000);
      }
    });
  },

  /**
   * Helper to resolve event category name in Spanish
   */
  getEventTypeName(type) {
    const types = {
      wedding: 'Boda / Matrimonio',
      birthday: 'Cumpleaños / Fiesta',
      corporate: 'Evento Corporativo',
      anniversary: 'Aniversario',
      other: 'Celebración'
    };
    return types[type] || 'Celebración';
  },

  /**
   * 3. Services Contact Triggers for Homepage
   * Automatically pre-fills the message text field in the main contact form on click.
   */
  initServiceContactTriggers() {
    const triggers = document.querySelectorAll('.contact-trigger');
    const messageInput = document.getElementById('message');

    if (!triggers.length || !messageInput) return;

    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const message = trigger.getAttribute('data-service-message');
        if (message) {
          messageInput.value = message;
          
          // Dispatch events so that main.js validation highlights the input as valid
          messageInput.dispatchEvent(new Event('input', { bubbles: true }));
          messageInput.dispatchEvent(new Event('blur', { bubbles: true }));
        }
      });
    });
  }
};
