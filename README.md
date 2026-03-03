# Prototyp plánovací aplikace

## Stránky aplikace

### 1. **index.html** - Plánovací rozhraní
Hlavní aplikace pro plánovače s plnou funkcionalitou drag & drop.

### 2. **production_view.html** - Výrobní pohled (Read-only)
Zobrazení denního plánu pro výrobní dělníky, bez možnosti editace.

### 3. **config.html** - Konfigurace
Správa typů výrobních příkazů a šablon receptů.

## Spuštění prototypu

Otevřete příslušný HTML soubor ve webovém prohlížeči:
- **index.html** - pro plánování
- **production_view.html** - pro výrobní displej
- **config.html** - pro konfiguraci

## Funkce prototypu

### ✅ Plánovací rozhraní (index.html)

1. **Drag & Drop**
   - Přetažení receptu z backlogu do kalendáře
   - Přesun naplánovaných položek mezi dny a hodinami
   - Vizuální feedback při přetahování

2. **Vícevrstevné plánování**
   - Týdenní pohled s navigací (předchozí/následující týden)
   - Denní rozložení s hodinami (6:00 - 22:00)
   - Přepočet závislých příkazů

3. **Výrobní recepty**
   - Backlog seznam s filtrací
   - Detail receptu (modal)
   - Uzamčení/odemčení příkazů (locked/unlocked)

4. **Automatika**
   - Přepočet časů při přesunu uzamčených receptů
   - Detekce kolizí (červené zvýraznění)
   - Automatický rozklad na výrobní příkazy

5. **Vizualizace**
   - Barevné rozlišení typů příkazů
   - Legenda
   - Statistiky (naplánováno, backlog, kolize, využití)

6. **UX**
   - Responsivní design
   - Toast notifikace
   - Zvýraznění dnešního dne

### ✅ Výrobní pohled (production_view.html)

1. **Read-only zobrazení**
   - Žádná možnost editace dat
   - Optimalizováno pro nástěnný displej

2. **Timeline úkolů**
   - Výběr dne (7 dní dopředu)
   - Hodinový rozvrh s vizualizací úkolů
   - Barevné rozlišení typů příkazů

3. **Statusy úkolů**
   - Čeká (šedá)
   - Probíhá (zelená, pulzující)
   - Dokončeno (modrá)

4. **Real-time aktualizace**
   - Aktuální čas a datum (každou sekundu)
   - Auto-refresh každých 30 sekund
   - Zvýraznění právě probíhajících úkolů

5. **Fullscreen režim**
   - Tlačítko pro celou obrazovku
   - Vhodné pro permanentní zobrazení ve výrobě

### ✅ Konfigurace (config.html)

1. **Typy výrobních příkazů**
   - Přidání/úprava/smazání typů
   - Nastavení: ID, název, barva, defaultní trvání
   - Visual color picker
   - Přednastavené typy (podklad, tvaroh, krém, freezer)

2. **Šablony receptů**
   - Vytváření šablon pro různé produkty
   - Definice sekvence příkazů
   - Časové rozestupy (offsetDays)
   - Ukázkové šablony (standardní dort, velký dort)

3. **Obecné nastavení**
   - Pracovní doba (začátek/konec)
   - Helios API URL
   - Auto-refresh interval

4. **Perzistence dat**
   - Ukládání do localStorage
   - Visual indikátor uložení
   - Sdílení dat mezi stránkami

### 🚧 Simulováno (pro demo)

- Načítání z Helios (1s delay, mock data)
- Ukládání do Helios (1s delay, console log)
- Filtrování backlogu (připraveno)

## Struktura dat

### Výrobní recept
```javascript
{
  id: 'R001',
  orderId: 'OBJ-2026-001',
  name: 'Ananasový dort 1kg',
  deadline: '2026-02-17',
  locked: true,  // příkazy se posouvají společně
  status: 'backlog', // nebo 'planned'
  commands: [...]
}
```

### Výrobní příkaz
```javascript
{
  id: 'P001',
  type: 'podklad', // podklad, tvaroh, krem, freezer
  offsetDays: -3,  // -3 dny před termínem
  duration: 2      // trvání v hodinách
}
```

### Naplánovaná položka
```javascript
{
  recipeId: 'R001',
  commandId: 'P001',
  type: 'podklad',
  date: '2026-02-14',
  startHour: 8,
  duration: 2
}
```

## Klíčové algoritmy

### Plánování receptu
1. Uživatel přetáhne recept na konkrétní den a hodinu
2. Systém vezme termín dokončení (deadline)
3. Pro každý příkaz vypočítá datum dle offsetDays
4. Vytvoří naplánované položky pro všechny příkazy
5. Překreslí UI

### Přesun naplánované položky
1. Uživatel přetáhne již naplánovanou položku
2. Systém vypočítá rozdíl dnů a hodin
3. Pokud je recept uzamčen (locked=true):
   - Přesune všechny související příkazy o stejný offset
4. Pokud odemčen:
   - Přesune pouze danou položku
5. Překreslí UI

### Detekce kolizí
1. Pro každou naplánovanou položku
2. Porovná s ostatními na stejný den
3. Kontroluje překryv časů
4. Zvýrazní červeně

## Uživatelské role a workflow

### 👨‍💼 Administrátor
1. Otevře **config.html**
2. Definuje typy výrobních příkazů
3. Vytvoří šablony receptů
4. Nastaví pracovní dobu a API

### 📋 Plánovač
1. Otevře **index.html**
2. Načte objednávky z Helios
3. Plánuje pomocí drag & drop
4. Kontroluje kolize
5. Uloží změny do Helios

### 👷 Výrobní dělník
1. Displej zobrazuje **production_view.html**
2. Sleduje úkoly na daný den
3. Vidí statusy (čeká/probíhá/hotovo)
4. Automatický refresh každých 30s

## Datová integrace

Všechny 3 aplikace sdílejí data přes **localStorage**:

```javascript
// Konfigurační data
localStorage['config_command_types']     // Typy příkazů
localStorage['config_recipe_templates']  // Šablony receptů
localStorage['config_general']           // Obecné nastavení

// Plánovací data
localStorage['planning_data']            // Recepty a naplánované úkoly
```

V produkci by localStorage byl nahrazen:
- REST API volání do Helios
- WebSocket pro real-time aktualizace
- Redis/Cache vrstva pro performance

## Další kroky pro produkci

1. **Backend integrace**
   - Připojení k Helios REST API
   - Real-time synchronizace
   - Error handling

2. **Rozšířené funkce - Výrobní pohled**
   - Zadávání statusů úkolů (Zahájit/Dokončit tlačítka)
   - Push notifikace při změně plánu
   - QR kód pro rychlý přístup
   - Hlasové oznámení nového úkolu

3. **Rozšířené funkce - Konfigurace**
   - Import/export konfigurace (JSON)
   - Validace konfliktů v šablonách
   - Vizuální editor šablon (drag & drop)
   - Historie změn konfigurace

4. **Performance**
   - Virtualizace pro 100+ položek
   - Lazy loading
   - Caching
   - Optimalizace renderingu

5. **Bezpečnost**
   - Autentizace (OAuth 2.0)
   - Role-based access control
   - Audit log všech operací
   - HTTPS komunikace

6. **Testování**
   - Unit testy (Jest)
   - Integration testy
   - E2E testy (Playwright)
   - UAT s uživateli

7. **Multi-user support**
   - Zamykání při editaci
   - Conflict resolution
   - Real-time collaborative editing
   - User presence indicators
