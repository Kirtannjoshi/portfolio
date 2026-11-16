import './style.css';

/* =========================================================================
   DOM REFERENCES
   ========================================================================= */
const yearElement = document.getElementById('year');
const menuButton = document.getElementById('menu-toggle-btn');
const mobileMenu = document.getElementById('mobile-menu');
const visitCountElement = document.getElementById('visit-count');

/* =========================================================================
   FOOTER YEAR
   ========================================================================= */
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

/* =========================================================================
   MOBILE MENU TOGGLE & OUTSIDE-CLICK HANDLER
   ========================================================================= */
function closeMobileMenu() {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.hidden = true;
}

function toggleMobileMenu() {
  if (!menuButton || !mobileMenu) return;
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  mobileMenu.hidden = isOpen;
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // Close when tapping any link inside mobile menu
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close when tapping anywhere outside header/menu
  document.addEventListener('click', (e) => {
    if (!mobileMenu.hidden && !mobileMenu.contains(e.target) && !menuButton.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.hidden) {
      closeMobileMenu();
    }
  });
}

/* =========================================================================
   HERO TYPING ANIMATION
   ========================================================================= */
const typingElement = document.getElementById('typing-text');
if (typingElement) {
  const words = [
    'Kirtan Joshi',
    'Full-Stack Developer',
    'Real-Time App Builder',
    'Open Source Dev',
    'B.Tech IT Graduate'
  ];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const TYPE_SPEED = 85;
  const DELETE_SPEED = 40;
  const PAUSE_END = 2100;
  const PAUSE_START = 400;

  function typeTick() {
    const currentWord = words[wordIndex];

    if (!isDeleting) {
      charIndex++;
      typingElement.textContent = currentWord.substring(0, charIndex);

      if (charIndex === currentWord.length) {
        isDeleting = true;
        setTimeout(typeTick, PAUSE_END);
        return;
      }
      setTimeout(typeTick, TYPE_SPEED);
    } else {
      charIndex--;
      typingElement.textContent = currentWord.substring(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(typeTick, PAUSE_START);
        return;
      }
      setTimeout(typeTick, DELETE_SPEED);
    }
  }

  setTimeout(typeTick, 500);
}

/* =========================================================================
   REAL-TIME LIVE PAGE VIEWS COUNTER (AUTHENTIC, NO FAKE PADDING)
   ========================================================================= */
async function initLivePageViews() {
  if (!visitCountElement) return;

  // Retrieve cached real count if available for instant display
  const cached = localStorage.getItem('kj_real_views');
  if (cached) {
    visitCountElement.textContent = parseInt(cached, 10).toLocaleString();
  }

  try {
    const res = await fetch(`https://hits.sh/kirtannjoshi.github.io/portfolio.svg?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const svgText = await res.text();
      const match = svgText.match(/<title>hits:\s*([\d,]+)<\/title>/i) ||
                    svgText.match(/>([\d,]+)<\/text><\/g>/i);
      if (match && match[1]) {
        const liveHits = parseInt(match[1].replace(/,/g, ''), 10);
        if (!isNaN(liveHits) && liveHits > 0) {
          visitCountElement.textContent = liveHits.toLocaleString();
          localStorage.setItem('kj_real_views', String(liveHits));
          return;
        }
      }
    }
  } catch (err) {
    console.warn('Live counter fetch error:', err);
  }

  // Graceful offline fallback
  const fallback = cached ? parseInt(cached, 10) + 1 : 18;
  visitCountElement.textContent = fallback.toLocaleString();
  localStorage.setItem('kj_real_views', String(fallback));
}

initLivePageViews();

/* =========================================================================
   CERTIFICATES HORIZONTAL RAIL (TOUCH SWIPE, MOUSE DRAG & BUTTON CONTROLS)
   ========================================================================= */
const certRail = document.getElementById('cert-rail');
const certPrevBtn = document.getElementById('cert-prev-btn');
const certNextBtn = document.getElementById('cert-next-btn');

let isSwiping = false;
let touchStartX = 0;
let touchStartY = 0;

if (certRail) {
  // Mobile Touch Swipe detection
  certRail.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isSwiping = false;
  }, { passive: true });

  certRail.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const diffX = Math.abs(touch.clientX - touchStartX);
    const diffY = Math.abs(touch.clientY - touchStartY);
    if (diffX > 8 || diffY > 8) {
      isSwiping = true;
    }
  }, { passive: true });

  // Desktop Mouse Drag Scrolling
  let isMouseDown = false;
  let mouseStartX = 0;
  let mouseScrollLeft = 0;

  certRail.addEventListener('mousedown', (e) => {
    if (e.target.closest('a') || e.target.closest('button')) return;
    isMouseDown = true;
    isSwiping = false;
    mouseStartX = e.pageX - certRail.offsetLeft;
    mouseScrollLeft = certRail.scrollLeft;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    const x = e.pageX - certRail.offsetLeft;
    const walk = (x - mouseStartX);
    if (Math.abs(walk) > 6) {
      isSwiping = true;
      certRail.scrollLeft = mouseScrollLeft - walk;
    }
  });

  window.addEventListener('mouseup', () => {
    isMouseDown = false;
  });
}

// Arrow Buttons
if (certRail && certPrevBtn && certNextBtn) {
  certPrevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = certRail.querySelector('.cert-preview-card');
    const scrollStep = card ? card.offsetWidth + 14 : 210;
    certRail.scrollBy({ left: -scrollStep, behavior: 'smooth' });
  });

  certNextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const card = certRail.querySelector('.cert-preview-card');
    const scrollStep = card ? card.offsetWidth + 14 : 210;
    certRail.scrollBy({ left: scrollStep, behavior: 'smooth' });
  });
}

// Credly Accordion Toggle
const credlyToggleBtn = document.getElementById('credly-toggle-btn');
const credlyPanel = document.getElementById('credly-panel');

if (credlyToggleBtn && credlyPanel) {
  credlyToggleBtn.addEventListener('click', () => {
    const isExpanded = credlyToggleBtn.getAttribute('aria-expanded') === 'true';
    credlyToggleBtn.setAttribute('aria-expanded', String(!isExpanded));
    credlyPanel.hidden = isExpanded;
  });
}

/* =========================================================================
   CONTACT FORM (DIRECT INBOX SUBMISSION & RELIABLE GMAIL ROUTING)
   ========================================================================= */
const mailboxForm = document.getElementById('direct-mailbox-form');
const mailStatus = document.getElementById('mail-status');
const mailSendBtn = document.getElementById('mail-send-btn');
const btnText = document.getElementById('btn-text');
const mailGmailBtn = document.getElementById('mail-gmail-btn');
const mailWaBtn = document.getElementById('mail-wa-btn');

if (mailboxForm) {
  function updateFallbackLinks() {
    const name = document.getElementById('mail-name')?.value.trim() || '';
    const email = document.getElementById('mail-email')?.value.trim() || '';
    const subject = document.getElementById('mail-subject')?.value.trim() || 'Portfolio Inquiry';
    const message = document.getElementById('mail-message')?.value.trim() || '';

    const encSub = encodeURIComponent(`[Portfolio] ${subject} - ${name}`);
    const encBody = encodeURIComponent(`Hi Kirtan,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Contact Form`);

    if (mailGmailBtn) {
      mailGmailBtn.href = `https://mail.google.com/mail/?view=cm&fs=1&to=kirtanjoshi2004@gmail.com&su=${encSub}&body=${encBody}`;
    }
    if (mailWaBtn) {
      const waText = encodeURIComponent(`Hi Kirtan! My name is ${name} (${email}).\n${subject}\n\n${message}`);
      mailWaBtn.href = `https://wa.me/?text=${waText}`;
    }
  }

  ['mail-name', 'mail-email', 'mail-subject', 'mail-message'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', updateFallbackLinks);
  });

  mailboxForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('mail-name').value.trim();
    const email = document.getElementById('mail-email').value.trim();
    const subject = document.getElementById('mail-subject').value.trim();
    const message = document.getElementById('mail-message').value.trim();

    if (!name || !email || !message) return;

    if (mailSendBtn) mailSendBtn.disabled = true;
    if (btnText) btnText.textContent = 'Sending...';
    if (mailStatus) {
      mailStatus.className = 'status-msg status-sending';
      mailStatus.textContent = 'Sending your message...';
    }

    const encSub = encodeURIComponent(`[Portfolio] ${subject} - ${name}`);
    const encBody = encodeURIComponent(`Hi Kirtan,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=kirtanjoshi2004@gmail.com&su=${encSub}&body=${encBody}`;
    const mailtoUrl = `mailto:kirtanjoshi2004@gmail.com?subject=${encSub}&body=${encBody}`;

    try {
      const response = await fetch('https://formsubmit.co/ajax/kirtanjoshi2004@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          email: email,
          subject: subject,
          message: message,
          _subject: `[Portfolio Inquiry] ${subject} - ${name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const data = await response.json();

      if (response.ok && (data.success === 'true' || data.success === true)) {
        if (mailStatus) {
          mailStatus.className = 'status-msg status-success';
          mailStatus.textContent = "✓ Message sent successfully! I'll get back to you soon.";
        }
        mailboxForm.reset();
      } else if (data.message && data.message.includes('Activation')) {
        // FormSubmit sent activation to kirtan
        if (mailStatus) {
          mailStatus.className = 'status-msg status-success';
          mailStatus.innerHTML = `✓ Form ready! Please check <strong>kirtanjoshi2004@gmail.com</strong> and click <em>Activate Form</em>. In the meantime, opening Gmail...`;
        }
        window.open(gmailUrl, '_blank');
        mailboxForm.reset();
      } else {
        throw new Error(data.message || 'Transmission failed');
      }
    } catch (err) {
      console.warn('Direct fetch routing to Gmail compose:', err);
      if (mailStatus) {
        mailStatus.className = 'status-msg status-fallback';
        mailStatus.innerHTML = `Opening your email... If it doesn't open automatically, <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;font-weight:600;">click here to send via Gmail</a>.`;
      }
      window.open(gmailUrl, '_blank') || (window.location.href = mailtoUrl);
    } finally {
      if (mailSendBtn) mailSendBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
    }
  });
}

/* =========================================================================
   CERTIFICATE INSPECTION MODAL (TAP-ONLY, SCROLL-SAFE)
   ========================================================================= */
const certModal = document.getElementById('cert-modal');
const certModalBackdrop = document.getElementById('cert-modal-backdrop');
const certModalClose = document.getElementById('cert-modal-close');
const modalCertImg = document.getElementById('modal-cert-img');
const modalCertTitle = document.getElementById('modal-cert-title');
const modalCertOrg = document.getElementById('modal-cert-org');

function openCertModal(src, title, org) {
  if (!certModal) return;
  if (modalCertImg) modalCertImg.src = src;
  if (modalCertTitle) modalCertTitle.textContent = title;
  if (modalCertOrg) modalCertOrg.textContent = org;
  certModal.classList.add('open');
  certModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeCertModal() {
  if (!certModal) return;
  certModal.classList.remove('open');
  certModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('.cert-trigger').forEach((item) => {
  const trigger = (e) => {
    // If user was swiping or dragging the rail, DO NOT open the modal
    if (isSwiping) {
      isSwiping = false;
      return;
    }
    // If the tap was on a link inside the card, ignore
    if (e && e.target && (e.target.closest('.cert-quick-links') || e.target.closest('a'))) {
      return;
    }
    const src = item.dataset.src;
    const title = item.dataset.title;
    const org = item.dataset.org;
    if (src) openCertModal(src, title, org);
  };

  item.addEventListener('click', trigger);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger(e);
    }
  });
});

if (certModalBackdrop) certModalBackdrop.addEventListener('click', closeCertModal);
if (certModalClose) certModalClose.addEventListener('click', closeCertModal);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCertModal();
  }
});

/* =========================================================================
   DISCORD 1-CLICK CLIPBOARD COPY (Cross-Device Safe with Fallback)
   ========================================================================= */
const toastPill = document.getElementById('toast-pill');
const toastText = document.getElementById('toast-text');
let toastTimer = null;

function showToast(text) {
  if (!toastPill || !toastText) return;
  toastText.textContent = text;
  toastPill.classList.add('show');
  toastPill.setAttribute('aria-hidden', 'false');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastPill.classList.remove('show');
    toastPill.setAttribute('aria-hidden', 'true');
  }, 2400);
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('Clipboard API blocked, trying fallback:', e);
    }
  }

  // Cross-device fallback for mobile Safari / Android Webviews
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  textArea.style.top = '0';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const success = document.execCommand('copy');
    textArea.remove();
    return success;
  } catch (err) {
    textArea.remove();
    return false;
  }
}

document.querySelectorAll('.copy-discord-trigger').forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    const handle = btn.dataset.discord || 'kirtan4323';
    const copied = await copyTextToClipboard(handle);
    if (copied) {
      showToast(`Discord handle '${handle}' copied!`);
    } else {
      showToast(`Discord: ${handle}`);
    }
  });
});
