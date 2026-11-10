// =====================================================
// EGrip UF – js/main.js
//
// KONFIGURATION – EGrip ändrar värdena nedan:
// =====================================================
const CONFIG = {
  // Pris per grepplinda (kr)
  pris: 89,

  // Mängdrabatter:
  // fran = minimiantal för rabatten, procent = rabatt i %
  // ⚠️ EGRIP: kontrollera och uppdatera dessa värden
  rabatter: [
    { fran: 10, procent: 10 },
    { fran: 20, procent: 15 }
  ],

  // Fri frakt från detta antal (ange 0 om alltid fri frakt)
  // ⚠️ EGRIP: uppdatera fraktgränsen och fraktkostnaden nedan
  friFraktFran: 10,

  // Fraktkostnad vid postleverans (kr)
  // ⚠️ EGRIP: ange korrekt fraktkostnad här
  frakt: 0 /* ANGES SENARE AV EGRIP */,

  // EGrips Swish-nummer (utan mellanslag)
  // ⚠️ EGRIP: byt ut XXXXXXXXXX mot ert riktiga Swish-nummer
  swishNummer: 'XXXXXXXXXX',

  // Formspree- eller Web3Forms-ID för ordermail till egripuf@gmail.com
  // ⚠️ EGRIP: registrera er på formspree.io, skapa ett formulär och klistra in ID här
  // Exempel med Formspree: 'https://formspree.io/f/XXXXXXXX'
  // Exempel med Web3Forms: använd access_key-värdet från web3forms.com
  formEndpoint: 'https://formspree.io/f/XXXXXXXX',

  // Färger på grepplindor (lägg till fler här när de lanseras)
  // name = visningsnamn, value = CSS-färg, available = om den finns i lager
  farger: [
    { name: 'Grå', value: '#9e9e9e', available: true },
    // { name: 'Vit', value: '#f0f0f0', available: false }, // exempel
  ]
};

// =====================================================
// HEADER – scroll-effekt och hamburgarmeny
// =====================================================
(function initHeader() {
  const header = document.querySelector('.site-header');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu nav a');

  if (!header) return;

  // Scroll: lägg till klass när vi scrollat mer än 20px
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Stäng vid klick på länk
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
      });
    });

    // Stäng vid Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }
})();

// =====================================================
// FADE-IN via IntersectionObserver
// =====================================================
(function initFadeIn() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// =====================================================
// TICKER – dubblera innehållet för sömlös loop
// =====================================================
(function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  const clone = track.innerHTML;
  track.innerHTML = clone + clone; // dubbla för sömlös loop
})();

// =====================================================
// BILDGALLERI (produkt.html)
// =====================================================
(function initGallery() {
  const mainImg = document.getElementById('gallery-main-img');
  const thumbs = document.querySelectorAll('.gallery-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const src = thumb.dataset.src;
      const alt = thumb.dataset.alt || '';

      // Fade-effekt vid bildbyte
      mainImg.style.opacity = '0';
      setTimeout(() => {
        if (src) {
          mainImg.src = src;
          mainImg.alt = alt;
        }
        mainImg.style.opacity = '1';
      }, 150);

      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
})();

// =====================================================
// PRODUKTSIDA – antal, rabatt, leverans, summering
// =====================================================
(function initProductPage() {
  const qtyInput   = document.getElementById('qty');
  const minusBtn   = document.getElementById('qty-minus');
  const plusBtn    = document.getElementById('qty-plus');
  const discountEl = document.getElementById('discount-banner');
  const delivery   = document.querySelectorAll('input[name="delivery"]');
  const addressGrp = document.getElementById('address-group');

  // Summerings-element
  const sumQty      = document.getElementById('sum-qty');
  const sumBase     = document.getElementById('sum-base');
  const sumDiscount = document.getElementById('sum-discount');
  const sumDiscRow  = document.getElementById('sum-discount-row');
  const sumFreight  = document.getElementById('sum-freight');
  const sumTotal    = document.getElementById('sum-total');
  const stickyTotal = document.getElementById('sticky-total');

  if (!qtyInput) return; // inte på produktsidan

  // Hämta aktiv rabatt för givet antal
  function getRabatt(antal) {
    let basta = null;
    CONFIG.rabatter.forEach(r => {
      if (antal >= r.fran) {
        if (!basta || r.procent > basta.procent) basta = r;
      }
    });
    return basta;
  }

  function getDelivery() {
    for (const r of delivery) {
      if (r.checked) return r.value;
    }
    return 'post';
  }

  function update() {
    const antal = Math.max(1, Math.min(100, parseInt(qtyInput.value) || 1));
    qtyInput.value = antal;

    const rabatt = getRabatt(antal);
    const basTotal = antal * CONFIG.pris;
    const rabattKr = rabatt ? Math.round(basTotal * rabatt.procent / 100) : 0;
    const efterRabatt = basTotal - rabattKr;

    // Frakt
    const delivType = getDelivery();
    let fraktKr = 0;
    if (delivType === 'post') {
      fraktKr = (antal >= CONFIG.friFraktFran && CONFIG.friFraktFran > 0)
        ? 0
        : CONFIG.frakt;
    }

    const total = efterRabatt + fraktKr;

    // Rabattbanner
    if (discountEl) {
      if (rabatt) {
        discountEl.textContent = `🎉 Du sparar ${rabattKr} kr med ${rabatt.procent}% mängdrabatt!`;
        discountEl.classList.add('visible');
      } else {
        discountEl.classList.remove('visible');
        // Visa nästa rabattnivå om det finns en
        const nasta = CONFIG.rabatter.find(r => r.fran > antal);
        if (nasta) {
          discountEl.textContent = `Köp ${nasta.fran - antal} till och få ${nasta.procent}% rabatt!`;
          discountEl.classList.add('visible');
        }
      }
    }

    // Summering
    if (sumQty) sumQty.textContent = `${antal} × ${CONFIG.pris} kr`;
    if (sumBase) sumBase.textContent = `${basTotal} kr`;
    if (sumDiscount) {
      sumDiscount.textContent = rabattKr > 0 ? `−${rabattKr} kr` : '−';
    }
    if (sumDiscRow) {
      sumDiscRow.style.display = rabattKr > 0 ? 'flex' : 'none';
    }
    if (sumFreight) {
      sumFreight.textContent = delivType === 'pickup'
        ? 'Gratis (upphämtning)'
        : fraktKr === 0
          ? 'Gratis'
          : `${fraktKr} kr`;
    }
    if (sumTotal) sumTotal.textContent = `${total} kr`;
    if (stickyTotal) stickyTotal.textContent = `${total} kr`;
  }

  if (minusBtn) {
    minusBtn.addEventListener('click', () => {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
      update();
    });
  }

  if (plusBtn) {
    plusBtn.addEventListener('click', () => {
      qtyInput.value = Math.min(100, parseInt(qtyInput.value) + 1);
      update();
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', update);
    qtyInput.addEventListener('input', update);
  }

  // Leveransval
  delivery.forEach(r => {
    r.addEventListener('change', () => {
      update();
      // Visa/dölj adress
      if (addressGrp) {
        addressGrp.style.display = r.value === 'post' ? '' : 'none';
      }
      // Markera vald delivery-option
      document.querySelectorAll('.delivery-option').forEach(o => {
        o.classList.toggle('selected', o.querySelector('input') === r);
      });
    });
  });

  update();
})();

// =====================================================
// FÄRGVAL (produkt.html)
// =====================================================
(function initColors() {
  const container = document.getElementById('color-options');
  if (!container) return;

  let selectedColor = CONFIG.farger.find(f => f.available)?.name || CONFIG.farger[0]?.name;

  CONFIG.farger.forEach(f => {
    if (!f.available) return;
    const swatch = document.createElement('button');
    swatch.className = 'color-swatch' + (f.name === selectedColor ? ' active' : '');
    swatch.style.background = f.value;
    swatch.setAttribute('aria-label', f.name);
    swatch.setAttribute('title', f.name);
    swatch.dataset.color = f.name;

    swatch.addEventListener('click', () => {
      selectedColor = f.name;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const nameEl = document.getElementById('selected-color-name');
      if (nameEl) nameEl.textContent = f.name;
    });

    container.appendChild(swatch);
  });

  // Uppdatera valt färgnamn
  const nameEl = document.getElementById('selected-color-name');
  if (nameEl) nameEl.textContent = selectedColor;
})();

// =====================================================
// ACCORDION (produkt.html)
// =====================================================
(function initAccordion() {
  const btns = document.querySelectorAll('.accordion-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');

      // Stäng alla
      btns.forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.style.maxHeight = null;
      });

      // Öppna om det var stängt
      if (!isOpen) {
        btn.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });
})();

// =====================================================
// ORDERFORMULÄR & VALIDERING
// =====================================================
(function initOrderForm() {
  const form = document.getElementById('order-form');
  if (!form) return;

  function validate() {
    let ok = true;

    // Obligatoriska fält
    ['fname', 'femail', 'fphone'].forEach(id => {
      const inp = document.getElementById(id);
      if (!inp) return;
      const err = inp.nextElementSibling;
      if (!inp.value.trim()) {
        inp.classList.add('error');
        if (err) err.classList.add('visible');
        ok = false;
      } else {
        inp.classList.remove('error');
        if (err) err.classList.remove('visible');
      }
    });

    // E-post format
    const email = document.getElementById('femail');
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('error');
      const err = email.nextElementSibling;
      if (err) { err.textContent = 'Ange en giltig e-postadress.'; err.classList.add('visible'); }
      ok = false;
    }

    // Telefon format
    const phone = document.getElementById('fphone');
    if (phone && phone.value.trim() && !/^[\d\s\-\+\(\)]{7,}$/.test(phone.value)) {
      phone.classList.add('error');
      const err = phone.nextElementSibling;
      if (err) { err.textContent = 'Ange ett giltigt telefonnummer.'; err.classList.add('visible'); }
      ok = false;
    }

    // Adress (om postleverans)
    const delivery = document.querySelector('input[name="delivery"]:checked');
    if (delivery && delivery.value === 'post') {
      const addr = document.getElementById('faddress');
      if (addr && !addr.value.trim()) {
        addr.classList.add('error');
        const err = addr.nextElementSibling;
        if (err) err.classList.add('visible');
        ok = false;
      } else if (addr) {
        addr.classList.remove('error');
        const err = addr.nextElementSibling;
        if (err) err.classList.remove('visible');
      }
    }

    return ok;
  }

  // Rensa fel vid input
  form.querySelectorAll('.form-input, .form-textarea').forEach(inp => {
    inp.addEventListener('input', () => {
      inp.classList.remove('error');
      const err = inp.nextElementSibling;
      if (err && err.classList.contains('form-error')) err.classList.remove('visible');
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate()) {
      startSwish();
    }
  });
})();

// =====================================================
// SWISH-BETALNING
//
// OBS: Denna lösning är gratis men kräver manuell matchning.
// EGrip måste matcha Swish-betalningen mot ordernumret i Swish-appen.
//
// Automatisk bekräftelse (Swish Handel/API) kräver:
//   - Företagsavtal med banken
//   - SSL-certifikat
//   - En server (backend)
//   - Avgift per månad + per transaktion
// Det kan läggas till senare utan att ändra fronten.
// =====================================================
function genOrderNr() {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `EG-${date}-${rand}`;
}

function getOrderData() {
  const qty      = parseInt(document.getElementById('qty')?.value || 1);
  const delivery = document.querySelector('input[name="delivery"]:checked')?.value || 'post';
  const colorEl  = document.getElementById('selected-color-name');
  const color    = colorEl?.textContent || 'Grå';

  // Räkna ut priser
  let rabatt = null;
  CONFIG.rabatter.forEach(r => {
    if (qty >= r.fran && (!rabatt || r.procent > rabatt.procent)) rabatt = r;
  });
  const basTotal   = qty * CONFIG.pris;
  const rabattKr   = rabatt ? Math.round(basTotal * rabatt.procent / 100) : 0;
  const efterRabatt = basTotal - rabattKr;
  const fraktKr    = delivery === 'pickup' ? 0 : (qty >= CONFIG.friFraktFran && CONFIG.friFraktFran > 0 ? 0 : CONFIG.frakt);
  const total      = efterRabatt + fraktKr;

  return {
    ordernummer: genOrderNr(),
    antal: qty,
    farg: color,
    pris_per_st: CONFIG.pris,
    bas_total: basTotal,
    rabatt_kr: rabattKr,
    frakt_kr: fraktKr,
    total: total,
    leverans: delivery,
    namn: document.getElementById('fname')?.value || '',
    email: document.getElementById('femail')?.value || '',
    telefon: document.getElementById('fphone')?.value || '',
    adress: document.getElementById('faddress')?.value || '',
    lag: document.getElementById('flag')?.value || '',
    meddelande: document.getElementById('fmessage')?.value || ''
  };
}

async function sendOrderEmail(order) {
  if (!CONFIG.formEndpoint || CONFIG.formEndpoint.includes('XXXXXXXX')) {
    console.warn('EGrip: Formspree-ID ej konfigurerat i CONFIG.formEndpoint');
    return;
  }

  try {
    await fetch(CONFIG.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        subject: `Ny beställning ${order.ordernummer} – ${order.antal} grepplindor`,
        ordernummer: order.ordernummer,
        antal: order.antal,
        farg: order.farg,
        leverans: order.leverans === 'post' ? 'Post' : 'Upphämtning i Kalmar',
        total: `${order.total} kr`,
        frakt: `${order.frakt_kr} kr`,
        namn: order.namn,
        email: order.email,
        telefon: order.telefon,
        adress: order.adress || '(upphämtning)',
        lag_forening: order.lag || '–',
        meddelande: order.meddelande || '–'
      })
    });
  } catch (err) {
    console.error('Kunde inte skicka ordermail:', err);
  }
}

function isMobile() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
}

async function startSwish() {
  const order = getOrderData();

  // Skicka ordermail
  sendOrderEmail(order);

  if (isMobile()) {
    // Swish deeplink (öppnar Swish-appen med förifyllda uppgifter)
    const swishUrl = `swish://payment?data={"version":1,"payee":{"value":"${CONFIG.swishNummer}","editable":false},"amount":{"value":${order.total},"editable":false},"message":{"value":"${order.ordernummer}","editable":false}}`;
    window.location.href = swishUrl;

    // Visa bekräftelsemodal efter en kort stund (appen borde ha öppnats)
    setTimeout(() => showConfirmModal(order), 1500);
  } else {
    // Dator: visa QR-kod
    showQRModal(order);
  }
}

function showQRModal(order) {
  const overlay = document.getElementById('swish-modal');
  if (!overlay) return;

  const orderNrEl = document.getElementById('modal-order-nr');
  if (orderNrEl) orderNrEl.textContent = order.ordernummer;

  const qrEl = document.getElementById('swish-qr');
  if (qrEl) {
    // Bygg QR-data för Swish
    const qrData = {
      format: 'png',
      size: 300,
      payee: {
        value: CONFIG.swishNummer,
        editable: false
      },
      amount: {
        value: order.total,
        editable: false
      },
      message: {
        value: order.ordernummer,
        editable: false
      }
    };

    // Hämta QR-kod från Swish öppna API
    fetch('https://mpc.getswish.net/qrg-swish/api/v1/prefilled', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qrData)
    })
    .then(res => {
      if (!res.ok) throw new Error('QR API svarade ' + res.status);
      return res.blob();
    })
    .then(blob => {
      qrEl.src = URL.createObjectURL(blob);
    })
    .catch(() => {
      // Fallback: visa textuell instruktion
      qrEl.style.display = 'none';
      const fallback = document.getElementById('swish-qr-fallback');
      if (fallback) fallback.style.display = 'block';
    });
  }

  // Visa modalens belopp
  const amtEl = document.getElementById('modal-amount');
  if (amtEl) amtEl.textContent = `${order.total} kr`;

  overlay.classList.add('open');

  // Stäng vid klick utanför
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.classList.remove('open');
      showConfirmModal(order);
    }
  });

  // "Jag har betalat"-knapp
  const paidBtn = document.getElementById('swish-paid-btn');
  if (paidBtn) {
    paidBtn.onclick = () => {
      overlay.classList.remove('open');
      showConfirmModal(order);
    };
  }
}

function showConfirmModal(order) {
  const overlay = document.getElementById('confirm-modal');
  if (!overlay) return;

  const nrEl = document.getElementById('confirm-order-nr');
  if (nrEl) nrEl.textContent = order.ordernummer;

  overlay.classList.add('open');

  const closeBtn = document.getElementById('confirm-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      overlay.classList.remove('open');
      // Scrolla upp till toppen av sidan
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}

