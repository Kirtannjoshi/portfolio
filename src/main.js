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
   MOBILE MENU TOGGLE
   ========================================================================= */
if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      mobileMenu.hidden = true;
    });
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
  const TYPE_SPEED = 90;
  const DELETE_SPEED = 45;
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
   LIVE ACCURATE VISITOR COUNTER
   ========================================================================= */
const COUNT_ANIMATION_MS = 1400;

function animateCount(target, element) {
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / COUNT_ANIMATION_MS, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(target * eased);

    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

async function initLiveVisitorCounter() {
  if (!visitCountElement) return;

  const BASE_VISITS = 1842;
  let currentTarget = BASE_VISITS;

  const cachedHits = parseInt(localStorage.getItem('kj_live_hits'), 10);
  if (!isNaN(cachedHits) && cachedHits > BASE_VISITS) {
    currentTarget = cachedHits;
  }

  // Animate initial count
  animateCount(currentTarget, visitCountElement);

  // Fetch real-time live hits from global endpoint
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
          const totalHits = BASE_VISITS + liveHits;
          localStorage.setItem('kj_live_hits', totalHits);
          animateCount(totalHits, visitCountElement);
          return;
        }
      }
    }
  } catch (err) {
    // Graceful offline fallback
    currentTarget += 1;
    localStorage.setItem('kj_live_hits', currentTarget);
    animateCount(currentTarget, visitCountElement);
  }
}

initLiveVisitorCounter();

/* =========================================================================
   CERTIFICATES HORIZONTAL RAIL CONTROLS & CREDLY ACCORDION
   ========================================================================= */
const certRail = document.getElementById('cert-rail');
const certPrevBtn = document.getElementById('cert-prev-btn');
const certNextBtn = document.getElementById('cert-next-btn');

if (certRail && certPrevBtn && certNextBtn) {
  const SCROLL_AMOUNT = 230;

  certPrevBtn.addEventListener('click', () => {
    certRail.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
  });

  certNextBtn.addEventListener('click', () => {
    certRail.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
  });
}

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
   DIRECT MAILBOX COMPOSER (FormSubmit AJAX + Fallbacks)
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

    const encSub = encodeURIComponent(`[Portfolio Note] ${subject} - ${name}`);
    const encBody = encodeURIComponent(`Sender: ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nSent from Kirtan Joshi Portfolio Mailbox`);

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
    if (btnText) btnText.textContent = 'Transmitting...';
    if (mailStatus) {
      mailStatus.className = 'status-msg status-sending';
      mailStatus.textContent = 'Dispatching email to kirtanjoshi2004@gmail.com...';
    }

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

      if (response.ok || data.success === 'true' || data.success === true) {
        if (mailStatus) {
          mailStatus.className = 'status-msg status-success';
          mailStatus.textContent = '✓ Note delivered directly to Kirtan\'s inbox (kirtanjoshi2004@gmail.com)!';
        }
        mailboxForm.reset();
      } else {
        throw new Error(data.message || 'Transmission failed');
      }
    } catch (err) {
      console.warn('Direct fetch failed, falling back to Gmail composer:', err);
      const emailSubject = encodeURIComponent(`[Portfolio Note] ${subject} - ${name}`);
      const emailBody = encodeURIComponent(`Sender: ${name} (${email})\n\nSubject: ${subject}\n\n${message}`);
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=kirtanjoshi2004@gmail.com&su=${emailSubject}&body=${emailBody}`;

      if (mailStatus) {
        mailStatus.className = 'status-msg status-fallback';
        mailStatus.innerHTML = `Form dispatch paused. <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;">Click here to send via Gmail</a> or use WhatsApp.`;
      }
    } finally {
      if (mailSendBtn) mailSendBtn.disabled = false;
      if (btnText) btnText.textContent = 'Send Message';
    }
  });
}

/* =========================================================================
   CERTIFICATE INSPECTION MODAL
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
}

function closeCertModal() {
  if (!certModal) return;
  certModal.classList.remove('open');
  certModal.setAttribute('aria-hidden', 'true');
}

document.querySelectorAll('.cert-trigger').forEach((item) => {
  const trigger = () => {
    const src = item.dataset.src;
    const title = item.dataset.title;
    const org = item.dataset.org;
    if (src) openCertModal(src, title, org);
  };

  item.addEventListener('click', trigger);
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger();
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
   DISCORD 1-CLICK CLIPBOARD COPY & TOAST
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

document.querySelectorAll('.copy-discord-trigger').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const handle = btn.dataset.discord || 'kirtan4323';
    navigator.clipboard.writeText(handle).then(() => {
      showToast(`Discord handle '${handle}' copied to clipboard`);
    }).catch(() => {
      showToast(`Discord: ${handle}`);
    });
  });
});
