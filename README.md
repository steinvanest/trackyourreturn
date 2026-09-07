# TrackYourReturn

Expo (React Native + TypeScript) app die aankopen bijhoudt en herinnert aan retourdeadlines.

## Dit project starten

Dit projectskelet is handmatig geschreven (Node.js/npm was niet beschikbaar op de machine
waarmee het is gebouwd), dus `node_modules` bestaat nog niet. Zo zet je het op:

1. **Installeer Node.js** (LTS-versie) via https://nodejs.org, of via nvm-windows als je
   meerdere Node-versies wilt kunnen beheren.
2. **Installeer de dependencies:**
   ```bash
   npm install
   ```
3. **Start de app:**
   ```bash
   npm start
   ```
   Dit opent Expo Dev Tools. Scan de QR-code met de Expo Go-app op je telefoon (Android/iOS),
   of druk op `a` voor een Android-emulator / `i` voor een iOS-simulator.

## Projectstructuur

```
App.tsx                          # Startpunt: init database, laadt navigatie
src/
  types/                         # TypeScript-types (retourbeleid, aankopen, returnless-refund)
  data/                          # Brondata (retourbeleid-data.json, returnless-refund-regels.json)
                                  # + retailers.ts (typed toegang tot de brondata)
  db/database.ts                 # expo-sqlite: lokale opslag, blijft bewaard tussen sessies
  utils/deadlines.ts             # Kernlogica: deadline-berekening + urgentie-kleuren
  utils/returnlessRefund.ts      # "Waarschijnlijk niet retourneren"-inschatting
  utils/id.ts                    # Simpele unieke-id-generator
  components/DeadlineBadge.tsx   # Kleurgecodeerde badge (rood/oranje/groen)
  components/RetailerPicker.tsx  # Doorzoekbaar retailerveld
  screens/HomeScreen.tsx         # Overzicht van aankopen
  screens/AddPurchaseScreen.tsx  # Nieuwe aankoop toevoegen
  navigation/                    # React Navigation setup + types
```

## Volgende stappen (nog niet gebouwd)

- Pushmeldingen op de momenten uit `pushmeldingen-specificatie.md` (7/3/1 dag, + verzendtermijn-melding).
  Dit vraagt `expo-notifications` en een achtergrondtaak die dagelijks checkt welke deadlines
  naderen — een aparte stap, want dit raakt ook toestemmingen (notification permissions) die
  apart met de gebruiker afgestemd moeten worden.
- Een "herstel"-knop voor `handmatig_verwijderd`-aankopen (data blijft bewaard, dus dit is
  puur een UI-toevoeging op het bestaande model).
- De disclaimer-teksten uit `disclaimer-concept.md` daadwerkelijk in de app tonen
  (bij installatie en/of contextueel bij de returnless-refund-hint) — nog juridisch te toetsen
  voordat de exacte tekst vaststaat.
