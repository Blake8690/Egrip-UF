# EGrip UF – Hemsida

Officiell webbplats för **EGrip UF**, ett UF-företag från Stagneliusskolan i Kalmar som säljer grepplindor för innebandyspelare.

---

## Öppna sidan lokalt

Öppna en terminal i projektmappen och kör:

```bash
python3 -m http.server 8000
```

Öppna sedan [http://localhost:8000](http://localhost:8000) i webbläsaren.

> Du måste använda en server (inte öppna filerna direkt i webbläsaren) för att bilder och fonter ska laddas korrekt.

---

## Filstruktur

```
egrip-UF/
├── index.html          Startsida: hero, om oss, teamet, kontakt
├── produkt.html        Produktsida: beställning, Swish, frakt, villkor
├── css/
│   └── style.css       All styling
├── js/
│   └── main.js         All JavaScript (CONFIG-objekt, interaktivitet)
├── images/
│   ├── logo.png        EGrip-loggan
│   ├── produkt-gra.png Den gråa grepplindanbilden
│   ├── forpackning.png Lindan i förpackning
│   ├── tejp.png        EGrip-tejpen
│   ├── elis.jpg        Bild på Elis Högström
│   ├── erik.jpg        Bild på Erik Olastuen
│   └── emil.jpg        Bild på Emil Tucek
└── README.md
```

---

## Ändra pris, rabatter, frakt och Swish-nummer

Öppna **`js/main.js`** och hitta `CONFIG`-objektet längst upp. Ändra värdena:

```js
const CONFIG = {
  pris: 89,              // ← Pris per linda i kronor

  rabatter: [
    { fran: 10, procent: 10 },   // ← 10% rabatt från 10 lindor
    { fran: 20, procent: 15 }    // ← 15% rabatt från 20 lindor
  ],

  friFraktFran: 10,      // ← Fri frakt från detta antal (0 = alltid gratis)
  frakt: 0,              // ← Fraktkostnad i kr (sätt korrekt värde)

  swishNummer: 'XXXXXXXXXX',      // ← EGrips Swish-nummer (utan mellanslag)

  formEndpoint: 'https://formspree.io/f/XXXXXXXX',  // ← Formspree-ID (se nedan)

  farger: [
    { name: 'Grå', value: '#9e9e9e', available: true },
    // Lägg till fler färger här:
    // { name: 'Vit', value: '#f0f0f0', available: true },
  ]
};
```

Kom ihåg att även uppdatera texterna i `produkt.html` under "Frakt & leverans" och "Mängdrabatt för lag" om du ändrar priser.

---

## Konfigurera Formspree (ordermail)

Orderuppgifterna skickas automatiskt till **egripuf@gmail.com** via Formspree.

1. Gå till [formspree.io](https://formspree.io) och registrera ett gratis konto.
2. Skapa ett nytt formulär och ange `egripuf@gmail.com` som mottagare.
3. Kopiera formulärets URL (ser ut som `https://formspree.io/f/abcd1234`).
4. Klistra in URL:en i `CONFIG.formEndpoint` i `js/main.js`.

Alternativt kan du använda [web3forms.com](https://web3forms.com) – gratis och enklare setup.

---

## Swish-betalning

### Hur det fungerar (nuvarande lösning – gratis)

- **Mobil**: Swish-appen öppnas automatiskt med förifyllt belopp och ordernummer.
- **Dator**: En QR-kod visas som kunden skannar med Swish-appen.
- Ordernumret (t.ex. `EG-20261110-4821`) används som betalningsmeddelande.
- **EGrip måste manuellt matcha Swish-betalningen mot ordernumret i Swish-appen.**
- Orderuppgifterna skickas samtidigt till egripuf@gmail.com via Formspree.

### Automatisk bekräftelse (kan läggas till senare)

Automatisk kontroll av om betalningen gått igenom kräver **Swish Handel** (även kallat Swish Commerce/API):
- Avtal med er bank om Swish Handel
- SSL-certifikat från banken
- En server eller serverless-funktion (backend) som lyssnar på callbacks
- Avgift per månad + per transaktion (kontrollera aktuella priser hos er bank)

Detta kan läggas till utan att ändra fronten – bara backend behöver byggas.

---

## Fortnox-integration (förbered, bygg inte nu)

All orderdata samlas redan i ett strukturerat JS-objekt (`order`) i `js/main.js` med fälten:
- `ordernummer`, `antal`, `farg`, `leverans`, `total`, `frakt_kr`
- `namn`, `email`, `telefon`, `adress`, `lag`, `meddelande`

### Alternativ A – Manuellt (enklast)
Beställningen kommer via mejl/Formspree. EGrip skapar faktura eller order i Fortnox manuellt.

### Alternativ B – Automatiskt via serverless
En liten serverless-funktion (t.ex. Netlify Functions eller Vercel Edge Function) tar emot orderobjektet och skapar en order i Fortnox via Fortnox REST API.

Kräver:
- Fortnox-abonnemang med API/integrationsrättigheter
- Registrering som Fortnox-utvecklare (gratis, men tar tid)
- Alternativt integration via Zapier eller Make (månadskostnad ~100–300 kr/mån)

Kontrollera aktuella priser och villkor på [fortnox.se](https://www.fortnox.se).

---

## Lägga till nya färger

1. Öppna `js/main.js`.
2. Lägg till ett nytt objekt i `CONFIG.farger`:
   ```js
   { name: 'Vit', value: '#f0f0f0', available: true },
   ```
3. Lägg eventuellt till en ny bild i `images/` (t.ex. `produkt-vit.png`).
4. Uppdatera galleri-miniatyrerna i `produkt.html` om du vill visa en specifik bild per färg.

---

## Publicering gratis

### GitHub Pages

1. Skapa ett konto på [github.com](https://github.com).
2. Skapa ett nytt repository, t.ex. `egrip-uf-webb`.
3. Ladda upp alla filer (eller använd `git`).
4. Gå till Settings → Pages → välj branch `main` och mapp `/ (root)`.
5. Sidan är tillgänglig på `https://[ditt-användarnamn].github.io/egrip-uf-webb/`.

### Netlify

1. Gå till [netlify.com](https://netlify.com) och skapa ett konto.
2. Dra och släpp projektmappen direkt på Netlify-dashboarden.
3. Sidan är live direkt på en netlify.app-adress.
4. Koppla till GitHub för automatisk uppdatering vid varje `git push`.

---

## Koppla egen domän (t.ex. egripuf.se)

1. Köp en `.se`-domän:
   - [Loopia.se](https://loopia.se) – ca 149 kr/år
   - [One.com](https://one.com) – ca 99–149 kr/år
   - [Namecheap.com](https://namecheap.com) – ca 100–150 kr/år
2. Logga in hos din domänleverantör och gå till DNS-inställningar.
3. Lägg till en CNAME-post som pekar på Netlify/GitHub Pages enligt leverantörens instruktioner.
4. I Netlify/GitHub Pages-inställningarna: lägg till din domän under "Custom domains".
5. SSL-certifikat aktiveras automatiskt (Let's Encrypt) inom några minuter.

---

## Teknikstack

| Del | Teknik |
|---|---|
| HTML | Semantisk HTML5, `lang="sv"`, ARIA-roller |
| CSS | Vanilla CSS med `--css-variabler`, mobile-first, `clamp()` |
| JavaScript | Vanilla ES2020, inga ramverk |
| Typsnitt | Google Fonts: Barlow Condensed + Inter |
| Formulär | Formspree (gratis, ingen server) |
| Betalning | Swish deeplink (mobil) + Swish öppna QR-API (dator) |
| Hosting | GitHub Pages eller Netlify (gratis) |

---

*EGrip UF – Stagneliusskolan, Kalmar – Ung Företagsamhet 2026*

