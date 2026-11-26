# 🏛️ StudiumGo

**StudiumGo** is een gratis, offline Latijnse woordjes-app voor wie snel en slim woordenschat wil opbouwen. De naam is Latijn voor *studie / ijver*; de strapline is **_Disce cotidie_** — “Leer elke dag”.

Het idee is vergelijkbaar met verbum.be (flashcards per caput, directe feedback, slimme herhaling, voortgang), maar StudiumGo is een **eigen, originele app** met extra's — gratis, offline en met lokale accounts in plaats van een betaalmuur.

## Wat erin zit (en beter is)

- ✅ **Volledig gratis** — geen betaalmuur, geen proefversie.
- 👤 **Account is verplicht** — maak een profiel met gebruikersnaam, wachtwoord en **leerjaar** (1e, 2de of 3de middelbaar). Je voortgang, fouten, eigen woorden en instellingen worden **per account apart** bewaard. Er is geen gastmodus.
- 📖 **Altijd Pegasus Novus** — je kiest geen boek; StudiumGo gebruikt altijd **Pegasus Novus**. Bij het aanmaken van je account kies je je leerjaar, waarna je **Pegasus Novus 1, 2 of 3** krijgt met een eigen woordniveau per leerjaar. Daarna volgt `caput 1 … 12`, een bereik (bijv. caput 2 t/m 4) en desnoods een **woordnummer-bereik** (bijv. woord 1 t/m 20). De woordindeling is eigen en vrij — geen officiële boeklijsten.
- 📚 **448 Latijnse woorden**, verdeeld over **12 capita** (familie, stad, werkwoorden, getallen, grammatica, oorlog, natuur, eten, gevoel, abstracte begrippen…).
- 🔁 **Slimme herhaling** — SM-2-achtige spacing: woorden die je fout had komen sneller terug, woorden die je beheerst later.
- ↔️ **Twee richtingen** — Latijn → Nederlands, Nederlands → Latijn of gemengd. Directe feedback met het juiste antwoord.
- 📊 **Voortgangsanalyse** — juistheid, sessies, minuten, beste streak, beheersing per caput en je lastige woorden in één overzicht.
- 🏆 **Ranglijst** — vergelijk de lokale profielen op dit apparaat op punten, beheerste woorden en streaks.
- 🧭 **Studiegids** — uitleg over Latijn leren, een plan voor je toetsdag, de vier stamtijden en studiedtips.
- ⚔️ **Stamtijden** — 30 werkwoorden met praesens, infinitief, perfectum en supinum, plus een oefenmodus.
- 📜 **Grammatica** — naamvallen, vijf verbuigingen en vier vervoegingen in overzichtelijke tabellen.
- 🔎 **Woordenboek** — zoek door alle woorden, met “beheerst"-label per woord.
- 📕 **Foutenoverzicht** — exporteer je lastige woorden als **PDF/print** of **CSV**.
- 🔥 **Streaks, dagelijks doel, punten en 10 prestaties**.
- ✍️ **Eigen woorden toevoegen** — jouw eigen lijst wordt net zo geoefend als de ingebouwde woorden.
- 💾 **Export/import van al je gegevens** als JSON. Alles blijft op je eigen apparaat.
- 🌙 **Donker/licht thema**, lengtetekens aan/uit, geluid aan/uit.
- 📱 **Offline PWA** — installeerbaar op telefoon en laptop; werkt zonder internet.

## Starten

- **Windows**: dubbelklik op **`start-studium.bat`**. Er opent een servervenster en je browser gaat naar http://localhost:4175.
- Of met Node.js (versie 18+):

```bash
npm start
```

> Open de app via de server (`http://localhost:4175`), niet door `index.html` direct te openen — de service worker heeft http(s) nodig.

## Bediening

| Actie | Muis / touch | Toetsenbord |
| --- | --- | --- |
| Antwoord geven | Typ in het veld en klik op **Controleer** | **Enter** |
| Volgende kaart | Klik op **Volgende** na feedback | **Enter** |
| Hint | Klik op 💡 | — |
| Overslaan | Klik op **Overslaan** | — |
| Stoppen | Klik op ⏹ | **Esc** |

Je mag antwoorden zonder lengtetekens en zonder hoofdletters. Bij Nederlandse vertalingen met meerdere mogelijkheden (“vader / echtgenote”) is elk onderdeel geldig.

## Puntentelling & herhaling

Een goed antwoord geeft 10 punten (5 als je een hint gebruikte). Na een goed antwoord verdubbelt het interval: 1 dag, 3 dagen, daarna vermenigvuldigen met je “ease”. Na een fout gaat het woord terug naar dag 0 en komt het later in dezelfde sessie nog een keer terug.

## Bestanden

```
index.html            alle schermen van de app
styles.css            responsive vormgeving, licht/donker, print-stijl
js/data.js            448 woorden, 3 leerjaren (Pegasus Novus 1/2/3), 12 capita, 30 stamtijden, grammatica
js/accounts.js        lokale profielen (gebruikersnaam + wachtwoord)
js/storage.js         voortgang per account, spaced repetition, streaks, prestaties, eigen woorden
js/audio.js           geluiden via Web Audio
js/app.js             sessies, flashcards, leerjaren/capita, accounts, zoeken, export
manifest.webmanifest  PWA-manifest + shortcuts
sw.js                 offline cache (studiumgo-v8)
assets/icons/         SVG- en PNG-iconen
server.js             statische server (poort 4175)
start-studium.bat     Windows-startknop
```

Geen buildstap, geen dependencies, geen internet nodig tijdens het gebruik.

## Verschil met verbum.be

StudiumGo is **geen kopie van de inhoud of het ontwerp** — het is een zelfstandige app met dezelfde kernideeën en meer controle voor de gebruiker: verplichte lokale accounts, leerjaar/caput/woordnummer-keuzes, eigen woorden, grammatica en stamtijden ingebouwd, gegevens exporteerbaar, en alles gratis en offline.

> **Let op:** accounts zijn apparaatgebonden profielen in `localStorage`, geen online login. Een account op je telefoon is dus niet automatisch zichtbaar op je laptop; gebruik daarvoor de JSON-export/import.

## Publiceren op GitHub Pages

De site staat op **https://yousefabujarad2014-beep.github.io/StudiumGo/**.

Alles wat in `main` wordt gecommit, verschijnt automatisch op die link (GitHub Pages bouwt opnieuw bij elke commit). Om ook het uploaden automatisch te maken:

1. Dubbelklik op **`C:\Users\Home\Desktop\FLL\start-autopublish.bat`**.
2. Log eenmalig in bij GitHub met de code die verschijnt (plak op https://github.com/login/device).
3. Laat het venster open staan. Elke wijziging in deze map wordt dan binnen ~2 seconden gepubliceerd.

Zonder CLI: upload de bestanden via https://github.com/yousefabujarad2014-beep/StudiumGo/upload/main en zet Pages aan via https://github.com/yousefabujarad2014-beep/StudiumGo/settings/pages → **main / /(root)**.

Elke commit verschijnt automatisch op de live site; met de watcher hierboven hoeft je ook het uploaden niet meer handmatig te doen.
